"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { sendRegistrationReceivedEmail } from "@/lib/email";
import { logActivity } from "@/lib/activity";

function slugifyName(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 10) || "PART";
}

async function generateCode(lastName: string): Promise<string> {
  const base = slugifyName(lastName);
  const count = await prisma.user.count();
  const seq = String(count + 1).padStart(3, "0");
  let code = `AFF-${base}-${seq}`;
  // garantit l'unicite
  let n = count + 1;
  while (await prisma.user.findUnique({ where: { code } })) {
    n++;
    code = `AFF-${base}-${String(n).padStart(3, "0")}`;
  }
  return code;
}

export async function loginAction(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "");

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  let databaseAvailable = true;
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      firstName: true,
      passwordHash: true,
      active: true,
      role: true,
      loginAttempts: true,
      lockedUntil: true,
    },
  }).catch((error) => {
    databaseAvailable = false;
    console.error("Connexion à la base de données impossible :", error);
    return null;
  });

  if (!databaseAvailable) {
    return {
      error: "Le service de connexion est momentanément indisponible. Merci de réessayer dans quelques instants.",
    };
  }

  // Brute-force protection : compte verrouillé
  if (user?.lockedUntil && user.lockedUntil > new Date()) {
    const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return { error: `Trop de tentatives. Compte verrouillé ${mins} min. Réessayez plus tard ou réinitialisez votre mot de passe.` };
  }

  const passwordOk = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !passwordOk) {
    // Incrémenter le compteur d'échecs si l'utilisateur existe
    if (user) {
      const attempts = (user.loginAttempts ?? 0) + 1;
      const lockData = attempts >= 5
        ? { loginAttempts: 0, lockedUntil: new Date(Date.now() + 15 * 60 * 1000) }
        : { loginAttempts: attempts, lockedUntil: null };
      await prisma.user.update({ where: { id: user.id }, data: lockData }).catch(() => {});
      await logActivity({ userId: user.id, action: "LOGIN_FAILED", detail: `Tentative ${attempts}` });
    }
    return { error: "Identifiants incorrects." };
  }

  if (!user.active) {
    return { error: "Ce compte a été désactivé. Contactez l'équipe IBIG." };
  }

  // Réinitialiser le compteur d'échecs après succès
  if ((user.loginAttempts ?? 0) > 0) {
    await prisma.user.update({ where: { id: user.id }, data: { loginAttempts: 0, lockedUntil: null } }).catch(() => {});
  }

  await logActivity({ userId: user.id, action: "LOGIN", detail: `Rôle: ${user.role}` });
  await createSession({ userId: user.id, role: user.role });
  const isAdmin = user.role === "ADMIN" || user.role === "SUPERADMIN";
  const isEnterprise = user.role === "ENTERPRISE";
  const dest = next && next.startsWith("/") ? next : (isAdmin ? "/admin" : isEnterprise ? "/entreprise" : "/espace");
  redirect(dest);
}

export async function registerAction(_prev: unknown, formData: FormData) {
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const country = String(formData.get("country") || "").trim();
  const password = String(formData.get("password") || "");
  const partnerType = String(formData.get("partnerType") || "INDIVIDUAL");
  const orgName = String(formData.get("orgName") || "").trim();
  let sponsorCode = String(formData.get("sponsorCode") || "").trim().toUpperCase();

  if (!firstName || !lastName || !email || !phone || !password || !country) {
    return { error: "Merci de remplir tous les champs obligatoires (dont le pays)." };
  }
  if (partnerType !== "INDIVIDUAL" && !orgName) {
    return { error: "Merci d'indiquer le nom de votre organisation." };
  }
  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte existe déjà avec cet email." };
  }

  // Parrain : code du formulaire ou cookie de tracking pose par un lien d'affiliation.
  const store = await cookies();
  if (!sponsorCode) {
    sponsorCode = (store.get("ibig_ref")?.value || "").toUpperCase();
  }
  let sponsorId: string | null = null;
  if (sponsorCode) {
    const sponsor = await prisma.user.findFirst({ where: { code: sponsorCode } });
    if (sponsor) sponsorId = sponsor.id;
  }

  const code = await generateCode(lastName);
  const user = await prisma.user.create({
    data: {
      code,
      firstName,
      lastName,
      email,
      phone,
      city: city || null,
      country: country || null,
      passwordHash: await hashPassword(password),
      partnerType,
      orgName: orgName || null,
      sponsorId,
      approved: false,
      // Le compte démarre NON vérifié : l'affilié doit soumettre ses documents
      // depuis « Vérifier mon compte » pour activer les paiements de commissions.
      verificationStatus: "NONE",
    },
  });

  // Notification d'accueil incitant à la vérification (cloche + lien direct).
  await prisma.notification.create({
    data: {
      userId: user.id,
      title: "🔐 Activez votre compte — vérification requise",
      body:
        "Bienvenue chez IBIG PARTNERS ! Pour vendre et percevoir vos commissions, " +
        "votre compte doit être vérifié. Envoyez vos documents dès maintenant, c'est rapide et sécurisé.",
      url: "/espace/verification",
    },
  });

  // Lookup sponsor name for the confirmation email
  let sponsorName: string | undefined;
  if (sponsorId) {
    const sponsor = await prisma.user.findUnique({
      where: { id: sponsorId },
      select: { firstName: true, lastName: true },
    });
    if (sponsor) sponsorName = `${sponsor.firstName} ${sponsor.lastName}`;
  }

  after(async () => {
    await sendRegistrationReceivedEmail({
      to: user.email,
      firstName: user.firstName,
      code: user.code,
      sponsorName,
    });
  });

  await logActivity({ userId: user.id, action: "REGISTER", detail: `Code: ${user.code}` });
  await createSession({ userId: user.id, role: user.role });
  store.delete("ibig_ref");

  redirect("/espace?bienvenue=1");
}

export async function registerEnterpriseAction(_prev: unknown, formData: FormData) {
  const firstName  = String(formData.get("firstName") || "").trim();
  const lastName   = String(formData.get("lastName") || "").trim();
  const email      = String(formData.get("email") || "").trim().toLowerCase();
  const phone      = String(formData.get("phone") || "").trim();
  const orgName    = String(formData.get("orgName") || "").trim();
  const city       = String(formData.get("city") || "").trim();
  const country    = String(formData.get("country") || "").trim();
  const password   = String(formData.get("password") || "");
  const website    = String(formData.get("website") || "").trim();
  const sector     = String(formData.get("sector") || "").trim();

  if (!firstName || !lastName || !email || !phone || !orgName || !password || !country) {
    return { error: "Merci de remplir tous les champs obligatoires." };
  }
  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Un compte existe déjà avec cet email." };

  const code = await generateCode(orgName);
  const store = await cookies();
  const user = await prisma.user.create({
    data: {
      code,
      firstName,
      lastName,
      email,
      phone,
      city: city || null,
      country: country || null,
      passwordHash: await hashPassword(password),
      role: "ENTERPRISE",
      partnerType: "COMPANY",
      orgName,
      website: website || null,
      marketSectors: sector || null,
      approved: false,
      verificationStatus: "NONE",
      subscriptionPlan: "FREE",
    } as any,
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      title: "🏢 Bienvenue sur IBIG PARTNERS Entreprise !",
      body: "Votre compte entreprise est en cours de validation. Vous pourrez publier vos premières opportunités dès l'approbation.",
      url: "/entreprise",
    },
  });

  after(async () => {
    await sendRegistrationReceivedEmail({
      to: user.email,
      firstName: user.firstName,
      code: user.code,
    });
  });

  await logActivity({ userId: user.id, action: "REGISTER", detail: `Entreprise: ${orgName}` });
  await createSession({ userId: user.id, role: "ENTERPRISE" });
  store.delete("ibig_ref");
  redirect("/entreprise?bienvenue=1");
}

export async function logoutAction() {
  const store = await cookies();
  const token = store.get("ibig_session")?.value;
  if (token) {
    try {
      const { jwtVerify } = await import("jose");
      const rawSecret = process.env.AUTH_SECRET || "dev-secret-change-me-not-for-prod";
      const secret = new TextEncoder().encode(rawSecret);
      const { payload } = await jwtVerify(token, secret);
      const userId = payload.userId as string;
      if (userId) await logActivity({ userId, action: "LOGOUT" });
    } catch { /* ignore */ }
  }
  await destroySession();
  redirect("/");
}

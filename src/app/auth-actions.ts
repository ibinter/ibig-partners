"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";
import { createAndSendOtp } from "@/lib/otp";

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

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Identifiants incorrects." };
  }
  if (!user.active) {
    return { error: "Ce compte a été désactivé. Contactez l'équipe IBIG." };
  }

  // 2FA désactivé temporairement (domaine email non vérifié sur Resend)
  // À réactiver après vérification du domaine ibigpartners.com sur resend.com
  // if (user.role === "ADMIN" || user.role === "SUPERADMIN") {
  //   void createAndSendOtp(user.id, user.email, user.firstName);
  //   const store = await cookies();
  //   store.set("ibig_otp_pending", user.id, { httpOnly: true, sameSite: "lax", maxAge: 10 * 60, path: "/" });
  //   redirect("/connexion/otp");
  // }

  await createSession({ userId: user.id, role: user.role });

  const dest = next && next.startsWith("/") ? next : "/espace";
  redirect(dest);
}

export async function registerAction(_prev: unknown, formData: FormData) {
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const password = String(formData.get("password") || "");
  const payoutMethod = String(formData.get("payoutMethod") || "ORANGE_MONEY");
  const payoutDetail = String(formData.get("payoutDetail") || "").trim();
  let sponsorCode = String(formData.get("sponsorCode") || "").trim().toUpperCase();

  if (!firstName || !lastName || !email || !phone || !password) {
    return { error: "Merci de remplir tous les champs obligatoires." };
  }
  if (password.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères." };
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
      passwordHash: await hashPassword(password),
      payoutMethod,
      payoutDetail: payoutDetail || null,
      sponsorId,
      approved: false,
    },
  });

  await createSession({ userId: user.id, role: user.role });
  store.delete("ibig_ref");

  // Email de bienvenue (non bloquant)
  let sponsorName: string | undefined;
  if (sponsorId) {
    const sp = await prisma.user.findUnique({ where: { id: sponsorId }, select: { firstName: true, lastName: true } });
    if (sp) sponsorName = `${sp.firstName} ${sp.lastName}`;
  }
  void sendWelcomeEmail({ to: email, firstName, code, sponsorName });

  redirect("/espace?bienvenue=1");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

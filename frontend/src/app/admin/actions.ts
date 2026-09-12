"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCommissionsForSale, recomputeStatus } from "@/lib/sales";
import { MONTHLY_DURATION } from "@/lib/constants";
import {
  sendAccountApprovedEmail,
  sendCommissionsValidatedEmail,
  sendPayoutPaidEmail,
  sendAnnouncementEmail,
  sendVerificationReminderEmail,
  sendNewSaleEmail,
  sendOpportunityMessageEmail,
  sendOpportunityStatusEmail,
  sendOnboardingJ0Email,
  sendStatusUpEmail,
  sendNewProductEmail,
  sendPayoutThresholdEmail,
  sendMissionApplicationAcceptedEmail,
  sendMissionApplicationRejectedEmail,
  sendMissionProofValidatedEmail,
  sendMissionProofRejectedEmail,
  sendOpportunityBroadcastEmail,
} from "@/lib/email";
import { logAction } from "@/lib/audit";
import { checkAndPromoteStatusAfter } from "@/lib/status";
import { autoComputeMatches } from "@/app/admin/opportunites/matching-actions";

// --- Partenaires ---
export async function approvePartner(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  const partner = await prisma.user.update({
    where: { id },
    data: { approved: true, active: true },
  });
  if (partner.sponsorId) await recomputeStatus(partner.sponsorId);
  after(async () => {
    // Email J0 enrichi : bienvenue + lien guide PDF (remplace l'ancien email simple)
    await sendOnboardingJ0Email({ to: partner.email, firstName: partner.firstName, code: partner.code });
    // Marquer J0 comme envoyé pour que le cron ne l'envoie pas en double
    await prisma.emailSequenceLog.upsert({
      where: { userId_sequence_step: { userId: partner.id, sequence: "ONBOARDING", step: "J0" } },
      update: { sentAt: new Date() },
      create: { userId: partner.id, sequence: "ONBOARDING", step: "J0" },
    });
  });
  void logAction({ userId: admin.id, action: "APPROVE_PARTNER", target: id, detail: partner.email });
  revalidatePath("/admin/partenaires");
}

export async function setPartnerActive(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const active = String(formData.get("active")) === "true";
  await prisma.user.update({ where: { id }, data: { active } });
  revalidatePath("/admin/partenaires");
}

// --- Rappels de vérification (KYC) ---
const VERIF_REMINDER = {
  title: "🔐 Vérifiez votre compte pour l'activer",
  body:
    "Bonjour ! Pour profiter pleinement d'IBIG PARTNERS — vendre, débloquer toutes les " +
    "fonctionnalités et percevoir vos commissions — votre compte doit être vérifié. " +
    "Merci d'envoyer vos documents depuis « Vérifier mon compte ». C'est rapide et sécurisé. " +
    "— L'équipe IBIG PARTNERS",
  url: "/espace/verification",
};

/** Envoie le rappel de vérification à un affilié précis (cloche + e-mail). */
export async function sendVerificationReminder(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "").trim();
  if (!id) return;
  const target = await prisma.user.findUnique({
    where: { id },
    select: { email: true, firstName: true },
  });
  await prisma.notification.create({ data: { userId: id, ...VERIF_REMINDER } });
  if (target?.email) {
    const to = target.email;
    const firstName = target.firstName;
    // after() : l'e-mail part APRÈS la réponse et n'est pas coupé par le
    // serverless Vercel (contrairement à un `void` fire-and-forget).
    // On journalise le résultat exact de Resend pour diagnostic.
    after(async () => {
      const res = await sendVerificationReminderEmail({ to, firstName });
      await logAction({
        userId: id,
        action: res.ok ? "EMAIL_REMINDER_OK" : "EMAIL_REMINDER_FAIL",
        target: to,
        detail: res.ok ? `id=${res.id}` : res.error,
      });
    });
  }
  void logAction({ userId: admin.id, action: "VERIF_REMINDER", target: id });
  revalidatePath("/admin/partenaires");
}

/** Envoie le rappel à TOUS les affiliés non encore vérifiés (cloche + e-mail). */
export async function sendVerificationReminderToAll() {
  const admin = await requireAdmin();
  const targets = await prisma.user.findMany({
    where: { role: "PARTNER", verificationStatus: { not: "VERIFIED" } },
    select: { id: true, email: true, firstName: true },
  });
  if (targets.length > 0) {
    await prisma.notification.createMany({
      data: targets.map((u) => ({ userId: u.id, ...VERIF_REMINDER })),
    });
    const recipients = targets.filter((u) => u.email);
    after(async () => {
      for (const u of recipients) {
        await sendVerificationReminderEmail({ to: u.email, firstName: u.firstName }).catch(() => {});
        await new Promise((r) => setTimeout(r, 120));
      }
    });
  }
  void logAction({
    userId: admin.id,
    action: "VERIF_REMINDER_BULK",
    detail: `${targets.length} affiliés`,
  });
  revalidatePath("/admin/partenaires");
}

/** Approuver tous les partenaires en attente d'un coup. */
export async function bulkApproveAll() {
  const admin = await requireAdmin();
  const pending = await prisma.user.findMany({
    where: { role: "PARTNER", approved: false },
    select: { id: true, email: true, firstName: true, code: true, sponsorId: true },
  });
  if (pending.length === 0) return;
  await prisma.user.updateMany({
    where: { id: { in: pending.map((p) => p.id) }, role: "PARTNER", approved: false },
    data: { approved: true, active: true },
  });
  after(async () => {
    for (const p of pending) {
      await sendOnboardingJ0Email({ to: p.email, firstName: p.firstName, code: p.code }).catch(() => {});
      await new Promise((r) => setTimeout(r, 120));
      await prisma.emailSequenceLog.upsert({
        where: { userId_sequence_step: { userId: p.id, sequence: "ONBOARDING", step: "J0" } },
        update: { sentAt: new Date() },
        create: { userId: p.id, sequence: "ONBOARDING", step: "J0" },
      });
    }
  });
  void logAction({ userId: admin.id, action: "BULK_APPROVE_PARTNERS", detail: `${pending.length} partenaires approuvés` });
  revalidatePath("/admin/partenaires");
}

/** Suspendre tous les partenaires actifs depuis plus de 90 jours sans vente. */
export async function bulkSuspendInactive() {
  const admin = await requireAdmin();
  const cutoff = new Date(Date.now() - 90 * 24 * 3600 * 1000);
  const partners = await prisma.user.findMany({
    where: { role: "PARTNER", approved: true, active: true, createdAt: { lt: cutoff } },
    select: { id: true, _count: { select: { sales: true } } },
  });
  const inactive = partners.filter((p) => p._count.sales === 0).map((p) => p.id);
  if (inactive.length === 0) return;
  await prisma.user.updateMany({
    where: { id: { in: inactive } },
    data: { active: false },
  });
  void logAction({ userId: admin.id, action: "BULK_SUSPEND_INACTIVE", detail: `${inactive.length} partenaires suspendus` });
  revalidatePath("/admin/partenaires");
}

export async function setPartnerRole(formData: FormData) {
  const admin = await requireAdmin();
  if (admin.role !== "SUPERADMIN") return; // seul le SuperAdmin gere les roles
  const id = String(formData.get("id"));
  const role = String(formData.get("role"));
  if (!["PARTNER", "ADMIN", "SUPERADMIN"].includes(role)) return;
  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin/partenaires");
}

// --- Ventes ---
export async function createSale(formData: FormData) {
  await requireAdmin();
  const sellerId = String(formData.get("sellerId"));
  const productId = String(formData.get("productId"));
  const customerName = String(formData.get("customerName") || "").trim();
  if (!sellerId || !productId || !customerName) return;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return;
  const amountRaw = Number(formData.get("amount"));
  const amount = amountRaw > 0 ? Math.round(amountRaw) : product.price;
  const count = await prisma.sale.count();

  const sale = await prisma.sale.create({
    data: {
      reference: `VTE-${String(count + 1).padStart(4, "0")}`,
      productId,
      sellerId,
      customerName,
      customerPhone: String(formData.get("customerPhone") || "").trim() || null,
      amount,
      pricingType: product.pricingType,
      status: "CONFIRMED",
      monthsPaid: 1,
    },
  });
  await generateCommissionsForSale(sale.id);
  await recomputeStatus(sellerId);
  checkAndPromoteStatusAfter(sellerId);
  revalidatePath("/admin/ventes");
  revalidatePath("/admin/commissions");
}

export async function confirmSale(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const sale = await prisma.sale.update({
    where: { id },
    data: { status: "CONFIRMED" },
    include: {
      product: { select: { name: true } },
      seller: { select: { id: true, firstName: true, email: true } },
    },
  });
  await generateCommissionsForSale(sale.id);
  await recomputeStatus(sale.sellerId);
  checkAndPromoteStatusAfter(sale.sellerId);

  // Notifier l'affilié que sa vente déclarée a été validée (cloche + e-mail).
  await prisma.notification.create({
    data: {
      userId: sale.sellerId,
      title: "🎉 Vente confirmée !",
      body: `Votre vente « ${sale.product.name} » (${sale.amount.toLocaleString("fr-FR")} FCFA) a été validée. Votre commission est en cours de calcul.`,
      url: "/espace/commissions",
    },
  });
  if (sale.seller.email) {
    const to = sale.seller.email;
    after(() =>
      sendNewSaleEmail({
        to,
        firstName: sale.seller.firstName,
        productName: sale.product.name,
        amount: sale.amount,
        customerName: sale.customerName,
        reference: sale.reference,
      }),
    );
  }

  revalidatePath("/admin/ventes");
  revalidatePath("/admin/commissions");
}

export async function cancelSale(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const reason = String(formData.get("reason") || "").trim();

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      seller: { select: { id: true, firstName: true } },
      product: { select: { name: true } },
    },
  });
  if (!sale) return;

  // Supprimer les commissions non encore versées
  await prisma.commission.deleteMany({ where: { saleId: id, status: { not: "PAID" } } });

  // Ventes PENDING déclarées par l'affilié → REJECTED ; autres → CANCELLED
  const newStatus = sale.status === "PENDING" ? "REJECTED" : "CANCELLED";
  await prisma.sale.update({
    where: { id },
    data: {
      status: newStatus,
      ...(newStatus === "REJECTED" && reason ? { proofNote: `[REJET] ${reason}` } : {}),
    },
  });

  // Notifier le partenaire avec le motif de refus
  if (newStatus === "REJECTED") {
    await prisma.notification.create({
      data: {
        userId: sale.sellerId,
        title: "❌ Déclaration de vente rejetée",
        body: reason
          ? `Votre déclaration « ${sale.product.name} » a été rejetée. Motif : ${reason}`
          : `Votre déclaration « ${sale.product.name} » a été rejetée car la preuve fournie n'est pas valide. Contactez le support si besoin.`,
        url: "/espace/ventes",
      },
    });
  }

  revalidatePath("/admin/ventes");
  revalidatePath("/admin/commissions");
}

export async function addPaidMonth(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const sale = await prisma.sale.findUnique({ where: { id } });
  if (!sale || sale.pricingType !== "MONTHLY_SUB") return;
  if (sale.monthsPaid >= MONTHLY_DURATION) return;
  await prisma.sale.update({ where: { id }, data: { monthsPaid: sale.monthsPaid + 1 } });
  await generateCommissionsForSale(id); // genere les commissions du mois suivant
  revalidatePath("/admin/ventes");
  revalidatePath("/admin/commissions");
}

// --- Commissions ---
async function checkAndNotifyThreshold(userId: string) {
  const [user, agg] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { email: true, firstName: true, minPayout: true } }),
    prisma.commission.aggregate({ where: { userId, status: "VALIDATED", payoutId: null }, _sum: { amount: true } }),
  ]);
  if (!user) return;
  const total = agg._sum.amount ?? 0;
  const threshold = user.minPayout ?? 5000;
  if (total >= threshold) {
    const alreadyNotified = await prisma.notification.findFirst({
      where: { userId, title: { contains: "Retrait disponible" }, createdAt: { gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) } },
    });
    if (!alreadyNotified) {
      await prisma.notification.create({
        data: { userId, title: "💸 Retrait disponible !", body: `Vous avez ${total.toLocaleString("fr-FR")} FCFA disponibles. Demandez votre retrait depuis votre espace.`, url: "/espace/paiements" },
      });
      after(() => sendPayoutThresholdEmail({ to: user.email, firstName: user.firstName, amount: total, threshold }));
    }
  }
}

export async function validateCommission(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const commission = await prisma.commission.update({ where: { id }, data: { status: "VALIDATED" } });
  after(() => checkAndNotifyThreshold(commission.userId));
  revalidatePath("/admin/commissions");
}

export async function validateAllPending(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") || "");

  // Capturer les userId concernés AVANT la mise à jour
  const targets = userId ? [userId] : (
    await prisma.commission.findMany({
      where: { status: "PENDING" },
      select: { userId: true },
      distinct: ["userId"],
    })
  ).map((c) => c.userId);

  await prisma.commission.updateMany({
    where: { status: "PENDING", ...(userId ? { userId } : {}) },
    data: { status: "VALIDATED" },
  });

  for (const uid of targets) {
    const [user, agg] = await Promise.all([
      prisma.user.findUnique({ where: { id: uid }, select: { email: true, firstName: true } }),
      prisma.commission.aggregate({ where: { userId: uid, status: "VALIDATED", payoutId: null }, _sum: { amount: true }, _count: { _all: true } }),
    ]);
    if (user && (agg._sum.amount ?? 0) > 0) {
      const to = user.email, firstName = user.firstName;
      const totalAmount = agg._sum.amount ?? 0, count = agg._count._all;
      after(() => sendCommissionsValidatedEmail({ to, firstName, totalAmount, count }));
      after(() => checkAndNotifyThreshold(uid));
    }
  }

  revalidatePath("/admin/commissions");
}

// --- Paiements ---
export async function createPayout(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId"));
  const partner = await prisma.user.findUnique({ where: { id: userId } });
  if (!partner) return;

  const validated = await prisma.commission.findMany({
    where: { userId, status: "VALIDATED", payoutId: null },
  });
  if (validated.length === 0) return;
  const amount = validated.reduce((a, c) => a + c.amount, 0);

  const payout = await prisma.payout.create({
    data: { userId, amount, method: partner.payoutMethod, status: "PENDING" },
  });
  await prisma.commission.updateMany({
    where: { id: { in: validated.map((c) => c.id) } },
    data: { payoutId: payout.id },
  });
  revalidatePath("/admin/paiements");
  revalidatePath("/admin/commissions");
}

export async function markPayoutPaid(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  const reference = `PAY-${id.slice(-6).toUpperCase()}`;
  const payout = await prisma.payout.update({
    where: { id },
    data: { status: "PAID", paidAt: new Date(), reference },
    include: { user: { select: { email: true, firstName: true } } },
  });
  await prisma.commission.updateMany({ where: { payoutId: id }, data: { status: "PAID" } });

  await prisma.notification.create({
    data: {
      userId: payout.userId,
      title: "🏦 Virement effectué !",
      body: `Votre retrait de ${payout.amount.toLocaleString("fr-FR")} FCFA a été versé (réf. ${reference}). Vérifiez votre compte ${payout.method.replace(/_/g, " ")}.`,
      url: "/espace/paiements",
    },
  });

  after(() => sendPayoutPaidEmail({
    to: payout.user.email,
    firstName: payout.user.firstName,
    amount: payout.amount,
    method: payout.method,
    reference,
  }));

  void logAction({ userId: admin.id, action: "MARK_PAYOUT_PAID", target: id, detail: `${payout.amount} FCFA → ${payout.user.email}` });
  revalidatePath("/admin/paiements");
  revalidatePath("/admin/commissions");
}

// --- Branches & produits ---
export async function toggleBranch(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const active = String(formData.get("active")) === "true";
  await prisma.branch.update({ where: { id }, data: { active } });
  revalidatePath("/admin/branches");
}

export async function toggleProductActive(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const active = String(formData.get("active")) === "true";
  await prisma.product.update({ where: { id }, data: { active } });
  revalidatePath("/admin/branches");
}

export async function updateProductRate(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const rate = Number(formData.get("rate"));
  if (!(rate >= 0 && rate <= 100)) return;
  await prisma.product.update({ where: { id }, data: { rate: Math.round(rate) } });
  revalidatePath("/admin/branches");
}

function toSlug(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function createBranch(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const tagline = String(formData.get("tagline") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const offerType = String(formData.get("offerType") || "").trim();
  const commissionModel = String(formData.get("commissionModel") || "").trim();
  const order = Number(formData.get("order") || 0);
  if (!name) return;
  const slug = toSlug(name);
  const branch = await prisma.branch.create({ data: { name, slug, tagline, description, offerType, commissionModel, order } });
  revalidatePath("/admin/branches");
  revalidatePath("/");

  // Notifier tous les affiliés actifs approuvés
  after(async () => {
    const partners = await prisma.user.findMany({
      where: { role: "PARTNER", approved: true, active: true },
      select: { id: true, email: true, firstName: true },
    });
    await prisma.notification.createMany({
      data: partners.map(p => ({
        userId: p.id,
        title: `🆕 Nouvelle branche : ${name}`,
        body: `La branche "${name}" vient d'être ajoutée au catalogue. Découvrez-la et commencez à la promouvoir !`,
        url: "/espace/produits",
      })),
    });
    const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ibigpartners.com";
    for (const p of partners) {
      await sendNewProductEmail({
        to: p.email,
        firstName: p.firstName,
        type: "branch",
        name,
        branchName: name,
        description: description || undefined,
        productsUrl: `${SITE}/espace/produits`,
      }).catch(() => {});
    }
  });
}

export async function updateBranch(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const name = String(formData.get("name") || "").trim();
  const tagline = String(formData.get("tagline") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const offerType = String(formData.get("offerType") || "").trim();
  const commissionModel = String(formData.get("commissionModel") || "").trim();
  const order = Number(formData.get("order") || 0);
  if (!name || !id) return;
  await prisma.branch.update({ where: { id }, data: { name, tagline, description, offerType, commissionModel, order } });
  revalidatePath("/admin/branches");
  revalidatePath("/");
}

export async function deleteBranch(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const salesCount = await prisma.sale.count({ where: { product: { branchId: id } } });
  if (salesCount > 0) return; // Sécurité : ne pas supprimer si des ventes existent
  await prisma.product.deleteMany({ where: { branchId: id } });
  await prisma.branch.delete({ where: { id } });
  revalidatePath("/admin/branches");
  revalidatePath("/");
}

function normalizeSiteUrl(raw: FormDataEntryValue | null): string | null {
  const value = String(raw || "").trim();
  if (!value) return null;
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    return new URL(candidate).toString();
  } catch {
    return null;
  }
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const branchId = String(formData.get("branchId") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const price = Number(formData.get("price") || 0);
  const pricingType = String(formData.get("pricingType") || "SERVICE");
  const rate = Number(formData.get("rate") || 8);
  const siteUrl = normalizeSiteUrl(formData.get("siteUrl"));
  if (!name || !branchId) return;
  const slug = toSlug(name) + "-" + Date.now().toString(36);
  await prisma.product.create({
    data: { branchId, name, slug, description: description || null, price, pricingType, rate, siteUrl },
  });
  revalidatePath("/admin/branches");
  revalidatePath("/espace/produits");
  revalidatePath("/");

  after(async () => {
    const branch = await prisma.branch.findUnique({ where: { id: branchId }, select: { name: true } });
    const branchName = branch?.name ?? "IBIG";
    const partners = await prisma.user.findMany({
      where: { role: "PARTNER", approved: true, active: true },
      select: { id: true, email: true, firstName: true },
    });
    await prisma.notification.createMany({
      data: partners.map(p => ({
        userId: p.id,
        title: `🛍️ Nouveau produit : ${name}`,
        body: `Le produit "${name}" (${branchName}) vient d'être ajouté au catalogue. Partagez votre lien affilié !`,
        url: "/espace/produits",
      })),
    });
    const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ibigpartners.com";
    for (const p of partners) {
      await sendNewProductEmail({
        to: p.email,
        firstName: p.firstName,
        type: "product",
        name,
        branchName,
        description: description || undefined,
        commissionRate: rate,
        productsUrl: `${SITE}/espace/produits`,
      }).catch(() => {});
    }
  });
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const price = Number(formData.get("price") || 0);
  const pricingType = String(formData.get("pricingType") || "SERVICE");
  const rate = Number(formData.get("rate") || 8);
  const siteUrl = normalizeSiteUrl(formData.get("siteUrl"));
  if (!name || !id) return;
  const updated = await prisma.product.update({
    where: { id },
    data: { name, description: description || null, price, pricingType, rate, siteUrl },
    include: { branch: { select: { name: true } } },
  });
  revalidatePath("/admin/branches");
  revalidatePath("/espace/produits");

  after(async () => {
    const partners = await prisma.user.findMany({
      where: { role: "PARTNER", approved: true, active: true },
      select: { id: true },
    });
    await prisma.notification.createMany({
      data: partners.map(p => ({
        userId: p.id,
        title: `📝 Produit mis à jour : ${name}`,
        body: `Les informations du produit "${name}" (${updated.branch.name}) ont été mises à jour. Consultez le catalogue pour les nouveaux détails.`,
        url: "/espace/produits",
      })),
    });
  });
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const salesCount = await prisma.sale.count({ where: { productId: id } });
  if (salesCount > 0) return; // Sécurité : ne pas supprimer si des ventes existent
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/branches");
  revalidatePath("/");
}

// --- Opportunités ---
export async function approveOpportunity(formData: FormData) {
  await requireAdmin();
  const id             = String(formData.get("id"));
  const commission     = Number(formData.get("commission") || 0);
  const commissionType = String(formData.get("commissionType") || "FIXED");
  const adminNote      = String(formData.get("adminNote") || "").trim();
  const visibility     = "PUBLIC";

  const opp = await (prisma as any).opportunity.update({
    where: { id },
    data: { status: "NEW", visibility, commission, commissionType, adminNote: adminNote || null, updatedAt: new Date() },
    include: { user: { select: { id: true, email: true, firstName: true } } },
  });

  after(async () => {
    await prisma.notification.create({
      data: {
        userId: opp.user.id,
        title: "Votre opportunité a été approuvée ! 🎉",
        body: `"${opp.title}" est maintenant visible par tous les partenaires IBIG. Commission : ${commission.toLocaleString()} FCFA.`,
        url: "/espace/opportunites",
      },
    });
    // Calcul automatique des matches lors de l'approbation
    await autoComputeMatches(id);
  });

  revalidatePath("/admin/opportunites");
  revalidatePath("/espace/opportunites");
}

export async function rejectOpportunity(formData: FormData) {
  await requireAdmin();
  const id        = String(formData.get("id"));
  const adminNote = String(formData.get("adminNote") || "").trim();

  const opp = await (prisma as any).opportunity.update({
    where: { id },
    data: { status: "LOST", visibility: "PRIVATE", adminNote: adminNote || null, updatedAt: new Date() },
    include: { user: { select: { id: true, email: true, firstName: true } } },
  });

  after(async () => {
    await prisma.notification.create({
      data: {
        userId: opp.user.id,
        title: "Opportunité non retenue",
        body: adminNote || `Votre opportunité "${opp.title}" n'a pas été retenue pour publication.`,
        url: "/espace/opportunites",
      },
    });
  });

  revalidatePath("/admin/opportunites");
  revalidatePath("/espace/opportunites");
}

export async function broadcastOpportunity(formData: FormData) {
  const admin = await requireAdmin();
  const id     = String(formData.get("id"));
  const target = String(formData.get("target") || "ALL"); // ALL | GOLD_PLUS | VERIFIED

  const opp = await (prisma as any).opportunity.findUnique({
    where: { id },
    select: {
      title: true, category: true, description: true,
      commission: true, commissionType: true, estimatedValue: true,
      adminNote: true, deadline: true,
    },
  });
  if (!opp) return;

  // Filtre des partenaires cibles
  const whereClause: Record<string, unknown> = { role: "PARTNER", active: true, approved: true };
  if (target === "GOLD_PLUS") whereClause.status = { in: ["GOLD", "MASTER", "ELITE"] };
  if (target === "VERIFIED")  whereClause.verificationStatus = "VERIFIED";

  const partners = await prisma.user.findMany({
    where: whereClause as any,
    select: { id: true, email: true, firstName: true },
  });
  if (partners.length === 0) return;

  // Créer les notifications en base (en une seule requête batch)
  await prisma.notification.createMany({
    data: partners.map(p => ({
      userId: p.id,
      title: `🤝 Nouvelle opportunité : ${opp.title}`,
      body: `IBIG partage une opportunité avec vous — commission : ${
        opp.commissionType === "PERCENT" ? `${opp.commission}%` : `${opp.commission.toLocaleString()} FCFA`
      }. Connectez-vous pour en savoir plus.`,
      url: "/espace/opportunites",
    })),
    skipDuplicates: true,
  });

  // Logger l'activité
  await (prisma as any).opportunityActivity.create({
    data: {
      opportunityId: id,
      type: "BROADCAST",
      content: `Diffusion à ${partners.length} partenaire(s) (cible : ${target})`,
      createdBy: (admin as any).id ?? "admin",
    },
  }).catch(() => {});

  // Envoyer les emails en arrière-plan (par batch de 20 pour ne pas saturer Resend)
  const deadlineDisplay = opp.deadline
    ? new Date(opp.deadline).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
    : null;

  after(async () => {
    const BATCH = 20;
    for (let i = 0; i < partners.length; i += BATCH) {
      const batch = partners.slice(i, i + BATCH);
      await Promise.allSettled(batch.map(p =>
        sendOpportunityBroadcastEmail({
          to: p.email,
          firstName: p.firstName ?? "",
          opportunityTitle: opp.title,
          opportunityCategory: opp.category,
          opportunityDescription: opp.description,
          commission: opp.commission,
          commissionType: opp.commissionType,
          estimatedValue: opp.estimatedValue,
          adminNote: opp.adminNote ?? undefined,
          deadline: deadlineDisplay,
        })
      ));
    }
  });

  revalidatePath("/admin/opportunites");
}

export async function updateOpportunity(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const handler = String(formData.get("handler") || "").trim();
  const commissionRaw = formData.get("commission");
  const commissionType = String(formData.get("commissionType") || "FIXED");

  const opp = await prisma.opportunity.update({
    where: { id },
    data: {
      status,
      handler: handler || null,
      ...(commissionRaw !== null && commissionRaw !== "" ? {
        commission: Number(commissionRaw) || 0,
        commissionType,
      } : {}),
    },
    include: { user: { select: { id: true, email: true, firstName: true } } },
  });

  // Notifier l'affilié du changement de statut
  after(async () => {
    await prisma.notification.create({
      data: {
        userId: opp.user.id,
        title: "Mise à jour de votre opportunité",
        body: `Votre opportunité "${opp.title}" est maintenant : ${
          { NEW: "Nouveau", IN_PROGRESS: "En cours", WON: "Gagné 🎉", LOST: "Non retenu" }[status] ?? status
        }`,
        url: "/espace/opportunites",
      },
    });
    await sendOpportunityStatusEmail({
      to: opp.user.email,
      firstName: opp.user.firstName ?? "",
      opportunityTitle: opp.title,
      newStatus: status,
    });
  });

  revalidatePath("/admin/opportunites");
  revalidatePath("/espace/opportunites");
}

export async function sendOpportunityMessage(formData: FormData) {
  const admin = await requireAdmin();
  const opportunityId = String(formData.get("opportunityId"));
  const body = String(formData.get("body") || "").trim();
  if (!body) return;

  const opp = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    include: { user: { select: { id: true, email: true, firstName: true } } },
  });
  if (!opp) return;

  await (prisma as any).opportunityMessage.create({
    data: {
      opportunityId,
      fromAdmin: true,
      senderName: admin.firstName ?? "L'équipe IBIG",
      body,
    },
  });

  after(async () => {
    await prisma.notification.create({
      data: {
        userId: opp.user.id,
        title: `Message de l'équipe IBIG — ${opp.title}`,
        body: body.length > 120 ? body.slice(0, 117) + "…" : body,
        url: "/espace/opportunites",
      },
    });
    await sendOpportunityMessageEmail({
      to: opp.user.email,
      firstName: opp.user.firstName ?? "",
      opportunityTitle: opp.title,
      senderName: admin.firstName ?? "L'équipe IBIG",
      body,
      fromAdmin: true,
    });
  });

  revalidatePath("/admin/opportunites");
  revalidatePath("/espace/opportunites");
}

export async function replyOpportunityMessage(formData: FormData) {
  const user = await requireAdmin();
  // réutilise sendOpportunityMessage côté admin
  return sendOpportunityMessage(formData);
}

// --- Communication ---
export async function sendAnnouncement(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const audience = String(formData.get("audience") || "ALL");
  const targetId = String(formData.get("targetId") || "").trim();
  if (!title || !body) return;

  if (audience === "ONE" && targetId) {
    // Notification ciblée vers un partenaire spécifique
    const partner = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, email: true, firstName: true },
    });
    if (partner) {
      await prisma.notification.create({ data: { userId: partner.id, title, body } });
      const to = partner.email, firstName = partner.firstName;
      after(() => sendAnnouncementEmail({ to, firstName, title, body }));
    }
  } else {
    // Annonce globale vers tous les partenaires actifs
    const targets = await prisma.user.findMany({
      where: { role: "PARTNER", approved: true, active: true },
      select: { id: true, email: true, firstName: true },
    });
    await prisma.notification.create({ data: { userId: null, title, body } });
    after(async () => {
      for (const t of targets) {
        await sendAnnouncementEmail({ to: t.email, firstName: t.firstName, title, body });
      }
    });
  }

  revalidatePath("/admin/communication");
}

// --- Paramètres ---
export async function updateSetting(formData: FormData) {
  await requireAdmin();
  const key = String(formData.get("key"));
  const value = String(formData.get("value") || "");
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  revalidatePath("/admin/parametres");
}

// ─── Missions Partners ────────────────────────────────────────────────────────
export async function createMission(formData: FormData) {
  await requireAdmin();
  const deadline = String(formData.get("deadline") || "").trim();
  const rewardType = String(formData.get("rewardType") || "CASH");
  const cpAmount = Number(formData.get("cpAmount") || 0);
  const code = String(formData.get("code") || "").trim();
  await (prisma as any).mission.create({
    data: {
      title: String(formData.get("title")),
      description: String(formData.get("description")),
      category: String(formData.get("category") || "AUTRE"),
      missionType: String(formData.get("missionType") || "LEAD"),
      branch: String(formData.get("branch") || ""),
      rewardType,
      compensationType: String(formData.get("compensationType") || "FIXED"),
      compensationAmount: Number(formData.get("compensationAmount") || 0),
      cpAmount: rewardType === "CASH" ? 0 : cpAmount,
      rewardTrigger: String(formData.get("rewardTrigger") || "VALIDATION"),
      zone: String(formData.get("zone") || "Côte d'Ivoire"),
      difficulty: String(formData.get("difficulty") || "MEDIUM"),
      minLevel: String(formData.get("minLevel") || ""),
      slots: Number(formData.get("slots") || 5),
      proofInstructions: String(formData.get("proofInstructions") || ""),
      status: "OPEN",
      active: true,
      adminNote: String(formData.get("adminNote") || "").trim() || null,
      deadline: deadline ? new Date(deadline) : null,
      ...(code ? { code } : {}),
    },
  });
  revalidatePath("/admin/missions");
}

export async function updateMissionStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await (prisma as any).mission.update({ where: { id }, data: { status, updatedAt: new Date() } });
  revalidatePath("/admin/missions");
}

export async function updateMission(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const proofInstructions = String(formData.get("proofInstructions") || "").trim();
  const compensationAmount = Number(formData.get("compensationAmount") || 0);
  const cpAmount = Number(formData.get("cpAmount") || 0);
  const slots = Number(formData.get("slots") || 5);
  const missionType = String(formData.get("missionType") || "");
  const rewardType = String(formData.get("rewardType") || "");
  const zone = String(formData.get("zone") || "").trim();
  const deadline = String(formData.get("deadline") || "").trim();
  const adminNote = String(formData.get("adminNote") || "").trim();
  const branch = String(formData.get("branch") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const difficulty = String(formData.get("difficulty") || "").trim();

  const data: Record<string, unknown> = { updatedAt: new Date() };
  if (title) data.title = title;
  if (description) data.description = description;
  if (proofInstructions) data.proofInstructions = proofInstructions;
  if (compensationAmount >= 0) data.compensationAmount = compensationAmount;
  if (cpAmount >= 0) data.cpAmount = cpAmount;
  if (slots > 0) data.slots = slots;
  if (missionType) data.missionType = missionType;
  if (rewardType) data.rewardType = rewardType;
  if (zone) data.zone = zone;
  if (deadline) data.deadline = new Date(deadline);
  else data.deadline = null;
  if (adminNote !== undefined) data.adminNote = adminNote || null;
  if (branch) data.branch = branch; else data.branch = null;
  if (category) data.category = category;
  if (difficulty) data.difficulty = difficulty;

  await (prisma as any).mission.update({ where: { id }, data });
  revalidatePath("/admin/missions");
  revalidatePath("/espace/missions");
}

export async function updateApplicationStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const result = String(formData.get("result") || "").trim();
  const data: any = { status, updatedAt: new Date() };
  if (result) data.result = result;

  const app = await (prisma as any).missionApplication.update({
    where: { id },
    data,
    include: {
      user: { select: { email: true, firstName: true } },
      mission: { select: { title: true, code: true } },
    },
  });

  if (status === "ACCEPTED") {
    after(() => sendMissionApplicationAcceptedEmail({
      to: app.user.email,
      firstName: app.user.firstName,
      missionTitle: app.mission.title,
      missionCode: app.mission.code ?? undefined,
    }).catch(() => {}));
  } else if (status === "REJECTED") {
    after(() => sendMissionApplicationRejectedEmail({
      to: app.user.email,
      firstName: app.user.firstName,
      missionTitle: app.mission.title,
      missionCode: app.mission.code ?? undefined,
    }).catch(() => {}));
  }

  revalidatePath("/admin/missions");
}

export async function validateMissionApplication(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  const action = String(formData.get("action")); // VALIDATE | REJECT_PROOF
  const adminNote = String(formData.get("adminNote") || "").trim();

  const app = await (prisma as any).missionApplication.findUnique({
    where: { id },
    include: {
      mission: true,
      user: { select: { email: true, firstName: true } },
    },
  });
  if (!app) return;

  if (action === "VALIDATE") {
    const mission = app.mission;
    const cpToCredit = (mission.rewardType === "CP" || mission.rewardType === "MIXED") ? (mission.cpAmount ?? 0) : 0;

    await (prisma as any).missionApplication.update({
      where: { id },
      data: {
        status: "VALIDATED",
        validatedAt: new Date(),
        validatedBy: (admin as any).id ?? "admin",
        cpEarned: cpToCredit,
        commissionEarned: mission.rewardType !== "CP" ? (mission.compensationAmount ?? 0) : 0,
        updatedAt: new Date(),
        ...(adminNote ? { result: adminNote } : {}),
      },
    });

    if (cpToCredit > 0) {
      await (prisma as any).pointTransaction.create({
        data: {
          userId: app.userId,
          points: cpToCredit,
          type: "CREDIT",
          reason: "MISSION",
          ref: `MISSION-${mission.id}`,
          missionApplicationId: id,
          adminId: (admin as any).id ?? "admin",
          adminNote: `Mission validée : ${mission.title}`,
        },
      });
    }

    after(() => sendMissionProofValidatedEmail({
      to: app.user.email,
      firstName: app.user.firstName,
      missionTitle: mission.title,
      missionCode: mission.code ?? undefined,
      rewardType: mission.rewardType ?? "CASH",
      compensationAmount: mission.compensationAmount ?? 0,
      cpAmount: mission.cpAmount ?? 0,
      compensationType: mission.compensationType ?? "FIXED",
    }).catch(() => {}));

  } else {
    await (prisma as any).missionApplication.update({
      where: { id },
      data: {
        status: "REJECTED_PROOF",
        updatedAt: new Date(),
        ...(adminNote ? { result: adminNote } : {}),
      },
    });

    after(() => sendMissionProofRejectedEmail({
      to: app.user.email,
      firstName: app.user.firstName,
      missionTitle: app.mission.title,
      missionCode: app.mission.code ?? undefined,
    }).catch(() => {}));
  }
  revalidatePath("/admin/missions");
}

// ─── SOUMISSIONS PARTENAIRES ──────────────────────────────────────────────────

export async function validateMissionSubmission(formData: FormData) {
  await requireAdmin();
  const id             = String(formData.get("id"));
  const branch         = String(formData.get("branch") || "").trim();
  const compensationType = String(formData.get("compensationType") || "FIXED");
  const compensationAmount = Number(formData.get("compensationAmount") || 0);
  const rewardTrigger  = String(formData.get("rewardTrigger") || "VALIDATION");
  const slots          = Number(formData.get("slots") || 5);
  const difficulty     = String(formData.get("difficulty") || "MEDIUM");
  const adminNote      = String(formData.get("adminNote") || "").trim();

  const mission = await (prisma as any).mission.update({
    where: { id },
    data: {
      validationStatus: "VALIDATED",
      status: "OPEN",
      active: true,
      branch: branch || null,
      compensationType,
      compensationAmount,
      rewardTrigger,
      slots,
      difficulty,
      adminNote: adminNote || null,
      updatedAt: new Date(),
    },
    include: { submittedBy: { select: { id: true, firstName: true, email: true } } },
  });

  // Notification globale (tous les partenaires voient la nouvelle opportunité)
  try {
    const typeLabel = mission.submissionType === "OFFER" ? "Offre" : "Demande";
    await (prisma as any).notification.create({
      data: {
        userId: null,
        title: `🆕 ${typeLabel} disponible`,
        body: mission.title,
        url: "/espace/missions",
      },
    });
  } catch { /* non bloquant */ }

  // Notifier le partenaire qui a soumis
  if (mission.submittedBy) {
    try {
      await (prisma as any).notification.create({
        data: {
          userId: mission.submittedBy.id,
          title: "✅ Votre opportunité est publiée",
          body: `"${mission.title}" est maintenant visible par tous les partenaires.`,
          url: "/espace/missions",
        },
      });
    } catch { /* non bloquant */ }
  }

  revalidatePath("/admin/missions");
  revalidatePath("/espace/missions");
}

export async function rejectMissionSubmission(formData: FormData) {
  await requireAdmin();
  const id   = String(formData.get("id"));
  const note = String(formData.get("rejectionNote") || "").trim();

  const mission = await (prisma as any).mission.update({
    where: { id },
    data: { validationStatus: "REJECTED", active: false, rejectionNote: note || null, updatedAt: new Date() },
    include: { submittedBy: { select: { id: true } } },
  });

  if (mission.submittedBy) {
    try {
      await (prisma as any).notification.create({
        data: {
          userId: mission.submittedBy.id,
          title: "❌ Soumission non retenue",
          body: `"${mission.title}"${note ? ` — ${note}` : ""}`,
          url: "/espace/missions",
        },
      });
    } catch { /* non bloquant */ }
  }

  revalidatePath("/admin/missions");
}

export async function connectMissionInterest(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await (prisma as any).missionInterest.update({
    where: { id },
    data: { status: "CONNECTED" },
  });
  revalidatePath("/admin/missions");
}

// ─── IBIG CONNECT ─────────────────────────────────────────────────────────────
export async function updateConnectStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const adminNote = String(formData.get("adminNote") || "").trim();
  await (prisma as any).connectRequest.update({
    where: { id },
    data: { status, updatedAt: new Date(), ...(adminNote ? { adminNote } : {}) },
  });
  revalidatePath("/admin/connect");
}

// ─── BESOINS ──────────────────────────────────────────────────────────────────
export async function approveNeed(formData: FormData) {
  await requireAdmin();
  const id         = String(formData.get("id"));
  const adminNote  = String(formData.get("adminNote") || "").trim();
  const commission = Number(formData.get("commission") || 0);
  const commissionType = String(formData.get("commissionType") || "FIXED");

  await (prisma as any).need.update({
    where: { id },
    data: {
      status: "APPROVED",
      visibility: "PUBLIC",
      adminNote: adminNote || null,
      commission,
      commissionType,
      updatedAt: new Date(),
    },
  });

  revalidatePath("/admin/besoins");
  revalidatePath("/espace/besoins");
}

export async function rejectNeed(formData: FormData) {
  await requireAdmin();
  const id        = String(formData.get("id"));
  const adminNote = String(formData.get("adminNote") || "").trim();

  await (prisma as any).need.update({
    where: { id },
    data: { status: "REJECTED", visibility: "PRIVATE", adminNote: adminNote || null, updatedAt: new Date() },
  });

  revalidatePath("/admin/besoins");
  revalidatePath("/espace/besoins");
}

export async function updateNeedStatus(formData: FormData) {
  await requireAdmin();
  const id     = String(formData.get("id"));
  const status = String(formData.get("status"));
  const adminNote = String(formData.get("adminNote") || "").trim();

  await (prisma as any).need.update({
    where: { id },
    data: { status, adminNote: adminNote || null, updatedAt: new Date() },
  });

  revalidatePath("/admin/besoins");
  revalidatePath("/espace/besoins");
}

// ─── COMMISSION PARTAGÉE ───────────────────────────────────────────────────────
export async function quickSplitOpportunity(formData: FormData) {
  await requireAdmin();
  const opportunityId = String(formData.get("opportunityId"));
  const partnerCode   = String(formData.get("partnerCode") || "").trim().toUpperCase();
  if (!opportunityId || !partnerCode) return;

  const [opp, partner] = await Promise.all([
    (prisma as any).opportunity.findUnique({
      where: { id: opportunityId },
      select: { commission: true, commissionType: true, title: true },
    }),
    (prisma as any).user.findFirst({
      where: { code: partnerCode },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);
  if (!opp || !partner) return;

  // Calcul 35% de la commission totale (arrondi à l'entier inférieur)
  const apporteurAmount = opp.commissionType === "PERCENT"
    ? Math.floor(opp.commission * 0.35)   // si % : 35% du pourcentage
    : Math.floor(opp.commission * 0.35);  // si FCFA fixe : 35% du montant

  await (prisma as any).opportunityShare.upsert({
    where: { opportunityId_userId: { opportunityId, userId: partner.id } },
    create: {
      opportunityId,
      userId: partner.id,
      role: "APPORTEUR_CLIENT",
      shareAmount: apporteurAmount,
      shareType: "FIXED",
      note: "Répartition standard 35% apporteur / 65% IBIG",
      status: "PENDING",
    },
    update: {
      role: "APPORTEUR_CLIENT",
      shareAmount: apporteurAmount,
      shareType: "FIXED",
      note: "Répartition standard 35% apporteur / 65% IBIG",
      updatedAt: new Date(),
    },
  });

  await (prisma as any).opportunityActivity.create({
    data: {
      opportunityId,
      type: "NOTE",
      content: `Répartition rapide appliquée : ${partner.firstName} ${partner.lastName} (${partnerCode}) → ${apporteurAmount.toLocaleString()} FCFA (35%) — IBIG retient 65%`,
    },
  }).catch(() => {});

  revalidatePath("/admin/opportunites");
}

export async function addOpportunityShare(formData: FormData) {
  await requireAdmin();
  const opportunityId = String(formData.get("opportunityId"));
  const partnerCode   = String(formData.get("partnerCode") || "").trim().toUpperCase();
  const role          = String(formData.get("role") || "PARTENAIRE");
  const shareAmount   = Number(formData.get("shareAmount") || 0);
  const shareType     = String(formData.get("shareType") || "FIXED");
  const note          = String(formData.get("note") || "").trim();

  if (!partnerCode || !opportunityId) return;

  const partner = await (prisma as any).user.findFirst({
    where: { code: partnerCode },
    select: { id: true },
  });
  if (!partner) return;

  await (prisma as any).opportunityShare.upsert({
    where: { opportunityId_userId: { opportunityId, userId: partner.id } },
    create: { opportunityId, userId: partner.id, role, shareAmount, shareType, note: note || null, status: "PENDING" },
    update: { role, shareAmount, shareType, note: note || null, updatedAt: new Date() },
  });

  revalidatePath("/admin/opportunites");
}

export async function removeOpportunityShare(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await (prisma as any).opportunityShare.delete({ where: { id } });
  revalidatePath("/admin/opportunites");
}

export async function confirmOpportunityShares(formData: FormData) {
  await requireAdmin();
  const opportunityId = String(formData.get("opportunityId"));
  await (prisma as any).opportunityShare.updateMany({
    where: { opportunityId, status: "PENDING" },
    data: { status: "CONFIRMED", updatedAt: new Date() },
  });
  revalidatePath("/admin/opportunites");
}

export async function markSharePaid(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await (prisma as any).opportunityShare.update({
    where: { id },
    data: { status: "PAID", updatedAt: new Date() },
  });
  revalidatePath("/admin/opportunites");
}

// ─── CRM LEADS ───────────────────────────────────────────────────────────────
export async function updateLeadStatus(formData: FormData) {
  const admin = await requireAdmin();
  const leadId        = String(formData.get("leadId"));
  const opportunityId = String(formData.get("opportunityId"));
  const status        = String(formData.get("status"));

  const prev = await (prisma as any).opportunityLead.findUnique({
    where: { id: leadId }, select: { status: true },
  });

  await (prisma as any).opportunityLead.update({
    where: { id: leadId },
    data: { status },
  });

  await (prisma as any).opportunityActivity.create({
    data: {
      opportunityId,
      leadId,
      type: "STATUS_CHANGE",
      content: `Statut lead changé : ${prev?.status ?? "?"} → ${status}`,
      createdBy: admin.id,
    },
  });

  revalidatePath("/admin/opportunites");
}

export async function addLeadNote(formData: FormData) {
  const admin = await requireAdmin();
  const leadId        = String(formData.get("leadId"));
  const opportunityId = String(formData.get("opportunityId"));
  const note          = String(formData.get("note")).trim();
  if (!note) return;

  await (prisma as any).opportunityLead.update({
    where: { id: leadId },
    data: { note },
  });

  await (prisma as any).opportunityActivity.create({
    data: {
      opportunityId,
      leadId,
      type: "NOTE",
      content: note,
      createdBy: admin.id,
    },
  });

  revalidatePath("/admin/opportunites");
}

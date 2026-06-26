"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCommissionsForSale, recomputeStatus } from "@/lib/sales";
import { MONTHLY_DURATION } from "@/lib/constants";
import {
  sendAccountApprovedEmail,
  sendCommissionsValidatedEmail,
  sendPayoutPaidEmail,
  sendAnnouncementEmail,
} from "@/lib/email";
import { logAction } from "@/lib/audit";

// --- Partenaires ---
export async function approvePartner(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  const partner = await prisma.user.update({
    where: { id },
    data: { approved: true, active: true },
  });
  if (partner.sponsorId) await recomputeStatus(partner.sponsorId);
  void sendAccountApprovedEmail({ to: partner.email, firstName: partner.firstName, code: partner.code });
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
  revalidatePath("/admin/ventes");
  revalidatePath("/admin/commissions");
}

export async function confirmSale(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const sale = await prisma.sale.update({ where: { id }, data: { status: "CONFIRMED" } });
  await generateCommissionsForSale(sale.id);
  await recomputeStatus(sale.sellerId);
  revalidatePath("/admin/ventes");
  revalidatePath("/admin/commissions");
}

export async function cancelSale(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  // annule la vente et supprime les commissions non encore versees
  await prisma.commission.deleteMany({ where: { saleId: id, status: { not: "PAID" } } });
  await prisma.sale.update({ where: { id }, data: { status: "CANCELLED" } });
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
export async function validateCommission(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.commission.update({ where: { id }, data: { status: "VALIDATED" } });
  revalidatePath("/admin/commissions");
}

export async function validateAllPending(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") || "");
  await prisma.commission.updateMany({
    where: { status: "PENDING", ...(userId ? { userId } : {}) },
    data: { status: "VALIDATED" },
  });

  // Notifier les partenaires concernés
  const targets = userId ? [userId] : (
    await prisma.commission.findMany({
      where: { status: "VALIDATED" },
      select: { userId: true },
      distinct: ["userId"],
    })
  ).map((c) => c.userId);

  for (const uid of targets) {
    const [user, agg] = await Promise.all([
      prisma.user.findUnique({ where: { id: uid }, select: { email: true, firstName: true } }),
      prisma.commission.aggregate({ where: { userId: uid, status: "VALIDATED", payoutId: null }, _sum: { amount: true }, _count: { _all: true } }),
    ]);
    if (user && (agg._sum.amount ?? 0) > 0) {
      void sendCommissionsValidatedEmail({
        to: user.email,
        firstName: user.firstName,
        totalAmount: agg._sum.amount ?? 0,
        count: agg._count._all,
      });
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

  void sendPayoutPaidEmail({
    to: payout.user.email,
    firstName: payout.user.firstName,
    amount: payout.amount,
    method: payout.method,
    reference,
  });

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

// --- Opportunités ---
export async function updateOpportunity(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const handler = String(formData.get("handler") || "").trim();
  await prisma.opportunity.update({
    where: { id },
    data: { status, handler: handler || null },
  });
  revalidatePath("/admin/opportunites");
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
      void sendAnnouncementEmail({ to: partner.email, firstName: partner.firstName, title, body });
    }
  } else {
    // Annonce globale vers tous les partenaires actifs
    const targets = await prisma.user.findMany({
      where: { role: "PARTNER", approved: true, active: true },
      select: { id: true, email: true, firstName: true },
    });
    await prisma.notification.create({ data: { userId: null, title, body } });
    void Promise.all(
      targets.map((t) =>
        sendAnnouncementEmail({ to: t.email, firstName: t.firstName, title, body })
      )
    );
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

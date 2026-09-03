import { prisma } from "./prisma";
import { computeCommissions } from "./commissions";
import { STATUS_RULES, STATUSES, STATUS_LABELS, STATUS_BONUS } from "./constants";
import { getNetwork, activeTeamCount, directReferralsCount } from "./metrics";
import { checkAndAwardBadges } from "@/lib/badges";
import { sendStatusUpEmail } from "@/lib/email";
import type { PricingType } from "./constants";

/** Remonte la chaine de parrainage : [vendeur, parrain, grand-parrain]. */
export async function getUpchain(sellerId: string) {
  const seller = await prisma.user.findUnique({
    where: { id: sellerId },
    select: { id: true, status: true, sponsorId: true },
  });
  if (!seller) return [null, null, null] as const;

  const sponsor = seller.sponsorId
    ? await prisma.user.findUnique({
        where: { id: seller.sponsorId },
        select: { id: true, status: true, sponsorId: true },
      })
    : null;

  const grand = sponsor?.sponsorId
    ? await prisma.user.findUnique({
        where: { id: sponsor.sponsorId },
        select: { id: true, status: true },
      })
    : null;

  return [
    { id: seller.id, status: seller.status },
    sponsor ? { id: sponsor.id, status: sponsor.status } : null,
    grand ? { id: grand.id, status: grand.status } : null,
  ] as const;
}

/**
 * (Re)genere les lignes de commission d'une vente confirmee, pour les mois
 * effectivement encaisses (Sale.monthsPaid). Idempotent grace a la cle unique
 * (saleId, userId, level, monthIndex). Les commissions deja PAID/VALIDATED ne
 * sont jamais ecrasees.
 */
export async function generateCommissionsForSale(saleId: string): Promise<number> {
  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: { product: true },
  });
  if (!sale || sale.status !== "CONFIRMED") return 0;

  const upchain = await getUpchain(sale.sellerId);

  const lines = computeCommissions({
    pricingType: sale.pricingType as PricingType,
    amount: sale.amount,
    productRatePct: sale.product.rate,
    upchain: upchain as Parameters<typeof computeCommissions>[0]["upchain"],
    uptoMonth: sale.monthsPaid,
  });

  let created = 0;
  for (const line of lines) {
    const existing = await prisma.commission.findUnique({
      where: {
        saleId_userId_level_monthIndex: {
          saleId,
          userId: line.userId,
          level: line.level,
          monthIndex: line.monthIndex,
        },
      },
    });
    if (existing) continue;
    await prisma.commission.create({
      data: {
        saleId,
        userId: line.userId,
        level: line.level,
        monthIndex: line.monthIndex,
        rate: line.rate,
        amount: line.amount,
        status: "PENDING",
      },
    });
    created++;
  }
  return created;
}

/**
 * Recalcule le statut d'un partenaire selon :
 *   - ses ventes personnelles confirmées
 *   - ses filleuls directs (N1)
 *   - son équipe active (N1+N2+N3 ayant ≥1 vente confirmée)
 *
 * Règles approuvées :
 *   Starter → Silver  : 10 ventes perso
 *   Silver  → Gold    : 25 ventes + 10 filleuls directs + 20 actifs équipe
 *   Gold    → Master  : 50 ventes + 25 filleuls directs + 50 actifs équipe
 *   Master  → Elite   : 100 ventes + 50 filleuls directs + 100 actifs équipe
 */
export async function recomputeStatus(userId: string): Promise<string> {
  const [before, salesCount, network] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { status: true } }),
    prisma.sale.count({ where: { sellerId: userId, status: "CONFIRMED" } }),
    getNetwork(userId),
  ]);
  const oldStatus = before?.status ?? "STARTER";

  const direct = directReferralsCount(network);
  const activeTeam = activeTeamCount(network);
  const r = STATUS_RULES;

  let status = "STARTER";

  if (salesCount >= r.SILVER.sales) {
    status = "SILVER";
  }
  if (
    salesCount >= r.GOLD.sales &&
    direct >= r.GOLD.directReferrals &&
    activeTeam >= r.GOLD.activeTeam
  ) {
    status = "GOLD";
  }
  if (
    salesCount >= r.MASTER.sales &&
    direct >= r.MASTER.directReferrals &&
    activeTeam >= r.MASTER.activeTeam
  ) {
    status = "MASTER";
  }
  if (
    salesCount >= r.ELITE.sales &&
    direct >= r.ELITE.directReferrals &&
    activeTeam >= r.ELITE.activeTeam
  ) {
    status = "ELITE";
  }

  await prisma.user.update({ where: { id: userId }, data: { status } });

  // Attribuer automatiquement les badges mérités (ventes, statut, équipe)
  await checkAndAwardBadges(userId).catch(() => {});

  // ── Notifications de motivation ──────────────────────────────────────
  const oldIdx = STATUSES.indexOf(oldStatus as (typeof STATUSES)[number]);
  const newIdx = STATUSES.indexOf(status as (typeof STATUSES)[number]);
  if (newIdx > oldIdx) {
    // Montée de statut : célébration + rappel du nouveau bonus.
    const bonusPct = Math.round((STATUS_BONUS[status] ?? 0) * 100);
    await prisma.notification
      .create({
        data: {
          userId,
          title: `🎉 Félicitations, vous êtes ${STATUS_LABELS[status] ?? status} !`,
          body: `Nouveau palier débloqué. Votre bonus passe à +${bonusPct}% sur toutes vos commissions. Continuez, l'élan est là !`,
          url: "/espace",
        },
      })
      .catch(() => {});
    // Email de félicitations montée de statut
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true },
    });
    if (user?.email) {
      const totalEarned = await prisma.commission
        .aggregate({ where: { userId, status: { in: ["VALIDATED", "PAID"] } }, _sum: { amount: true } })
        .then(r => r._sum.amount ?? 0);
      sendStatusUpEmail({
        to: user.email,
        firstName: user.firstName,
        newStatus: status,
        commissionsAmount: totalEarned,
      }).catch(() => {});
    }
  } else if (status === "STARTER") {
    // Coup de pouce vers Silver (condition = ventes uniquement, donc message fiable).
    const remaining = STATUS_RULES.SILVER.sales - salesCount;
    if (remaining >= 1 && remaining <= 2) {
      await prisma.notification
        .create({
          data: {
            userId,
            title: "🔥 Bientôt Silver !",
            body: `Plus que ${remaining} vente${remaining > 1 ? "s" : ""} confirmée${remaining > 1 ? "s" : ""} pour débloquer le statut Silver (+2% sur toutes vos commissions).`,
            url: "/espace/ventes",
          },
        })
        .catch(() => {});
    }
  }

  return status;
}

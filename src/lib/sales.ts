import { prisma } from "./prisma";
import { computeCommissions } from "./commissions";
import { STATUS_RULES } from "./constants";
import { getNetwork, activeTeamCount, directReferralsCount } from "./metrics";
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
  const [salesCount, network] = await Promise.all([
    prisma.sale.count({ where: { sellerId: userId, status: "CONFIRMED" } }),
    getNetwork(userId),
  ]);

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
  return status;
}

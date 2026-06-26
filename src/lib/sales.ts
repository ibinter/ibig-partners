import { prisma } from "./prisma";
import { computeCommissions } from "./commissions";
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
    if (existing) continue; // on ne touche pas aux commissions deja enregistrees
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

/** Recalcule le statut d'un partenaire selon ses ventes confirmees et filleuls actifs. */
export async function recomputeStatus(userId: string): Promise<string> {
  const salesCount = await prisma.sale.count({
    where: { sellerId: userId, status: "CONFIRMED" },
  });
  const activeReferrals = await prisma.user.count({
    where: { sponsorId: userId, active: true, approved: true },
  });

  let status = "STARTER";
  if (salesCount >= 5) status = "SILVER";
  if (salesCount >= 15 || activeReferrals >= 3) status = "GOLD";
  if (salesCount >= 30 && activeReferrals >= 5) status = "MASTER";

  await prisma.user.update({ where: { id: userId }, data: { status } });
  return status;
}

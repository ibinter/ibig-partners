import { prisma } from "./prisma";
import { STATUS_RULES } from "./constants";

export type NetworkMember = {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  status: string;
  active: boolean;
  approved: boolean;
  createdAt: Date;
  level: number;
  salesCount: number;
};

/** Recupere les filleuls sur 3 niveaux (descendants directs et indirects). */
export async function getNetwork(userId: string): Promise<NetworkMember[]> {
  const result: NetworkMember[] = [];
  let currentLevel = [userId];

  for (let level = 1; level <= 3; level++) {
    if (currentLevel.length === 0) break;
    const members = await prisma.user.findMany({
      where: { sponsorId: { in: currentLevel } },
      include: { _count: { select: { sales: true } } },
    });
    for (const m of members) {
      result.push({
        id: m.id,
        code: m.code,
        firstName: m.firstName,
        lastName: m.lastName,
        status: m.status,
        active: m.active,
        approved: m.approved,
        createdAt: m.createdAt,
        level,
        salesCount: m._count.sales,
      });
    }
    currentLevel = members.map((m) => m.id);
  }
  return result;
}

/**
 * Compte les filleuls directs (N1) uniquement.
 * Utilisé pour la règle directReferrals des statuts Gold/Master/Elite.
 */
export function directReferralsCount(network: NetworkMember[]): number {
  return network.filter((m) => m.level === 1).length;
}

/**
 * Équipe active = membres N1+N2+N3 ayant effectué au moins 1 vente confirmée.
 * La vente confirmée est reflétée dans salesCount (calculé depuis prisma.sale).
 */
export function activeTeamCount(network: NetworkMember[]): number {
  return network.filter((m) => m.salesCount >= 1).length;
}

/** Resume financier d'un partenaire. */
export async function partnerSummary(userId: string) {
  const [revenue, pending, validated, paid, confirmedSales, network] =
    await Promise.all([
      prisma.sale.aggregate({
        where: { sellerId: userId, status: "CONFIRMED" },
        _sum: { amount: true },
      }),
      prisma.commission.aggregate({
        where: { userId, status: "PENDING" },
        _sum: { amount: true },
      }),
      prisma.commission.aggregate({
        where: { userId, status: "VALIDATED" },
        _sum: { amount: true },
      }),
      prisma.commission.aggregate({
        where: { userId, status: "PAID" },
        _sum: { amount: true },
      }),
      prisma.sale.count({ where: { sellerId: userId, status: "CONFIRMED" } }),
      getNetwork(userId),
    ]);

  const direct = directReferralsCount(network);
  const activeTeam = activeTeamCount(network);

  return {
    revenue: revenue._sum.amount ?? 0,
    pending: pending._sum.amount ?? 0,
    validated: validated._sum.amount ?? 0,
    paid: paid._sum.amount ?? 0,
    payable: (pending._sum.amount ?? 0) + (validated._sum.amount ?? 0),
    confirmedSales,
    network,
    // legacy compat
    activeReferrals: direct,
    // new fields
    directReferrals: direct,
    activeTeam,
  };
}

/** Determine le prochain palier de statut et la progression vers lui. */
export function nextStatusProgress(
  salesCount: number,
  directReferrals: number,
  activeTeam: number,
) {
  const r = STATUS_RULES;

  if (
    salesCount >= r.ELITE.sales &&
    directReferrals >= r.ELITE.directReferrals &&
    activeTeam >= r.ELITE.activeTeam
  ) {
    return {
      current: "ELITE",
      next: null,
      label: "Statut Elite atteint 👑 — Représentant Pays IBIG",
      progress: 100,
    };
  }

  if (
    salesCount >= r.MASTER.sales &&
    directReferrals >= r.MASTER.directReferrals &&
    activeTeam >= r.MASTER.activeTeam
  ) {
    const salesP = salesCount / r.ELITE.sales;
    const directP = directReferrals / r.ELITE.directReferrals;
    const teamP = activeTeam / r.ELITE.activeTeam;
    const progress = Math.min(100, Math.round(Math.min(salesP, directP, teamP) * 100));
    return {
      current: "MASTER",
      next: "ELITE",
      label: `${salesCount}/${r.ELITE.sales} ventes · ${directReferrals}/${r.ELITE.directReferrals} filleuls · ${activeTeam}/${r.ELITE.activeTeam} équipe active → Elite`,
      progress,
    };
  }

  if (
    salesCount >= r.GOLD.sales &&
    directReferrals >= r.GOLD.directReferrals &&
    activeTeam >= r.GOLD.activeTeam
  ) {
    const salesP = salesCount / r.MASTER.sales;
    const directP = directReferrals / r.MASTER.directReferrals;
    const teamP = activeTeam / r.MASTER.activeTeam;
    const progress = Math.min(100, Math.round(Math.min(salesP, directP, teamP) * 100));
    return {
      current: "GOLD",
      next: "MASTER",
      label: `${salesCount}/${r.MASTER.sales} ventes · ${directReferrals}/${r.MASTER.directReferrals} filleuls · ${activeTeam}/${r.MASTER.activeTeam} équipe active → Master`,
      progress,
    };
  }

  if (salesCount >= r.SILVER.sales) {
    const salesP = salesCount / r.GOLD.sales;
    const progress = Math.min(100, Math.round(salesP * 100));
    return {
      current: "SILVER",
      next: "GOLD",
      label: `${salesCount}/${r.GOLD.sales} ventes · ${directReferrals}/${r.GOLD.directReferrals} filleuls · ${activeTeam}/${r.GOLD.activeTeam} équipe active → Gold`,
      progress,
    };
  }

  return {
    current: "STARTER",
    next: "SILVER",
    label: `${salesCount}/${r.SILVER.sales} ventes pour Silver`,
    progress: Math.min(100, Math.round((salesCount / r.SILVER.sales) * 100)),
  };
}

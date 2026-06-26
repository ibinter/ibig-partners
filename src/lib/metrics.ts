import { prisma } from "./prisma";

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

  const activeReferrals = network.filter(
    (m) => m.level === 1 && m.active && m.approved,
  ).length;

  return {
    revenue: revenue._sum.amount ?? 0,
    pending: pending._sum.amount ?? 0,
    validated: validated._sum.amount ?? 0,
    paid: paid._sum.amount ?? 0,
    payable: (pending._sum.amount ?? 0) + (validated._sum.amount ?? 0),
    confirmedSales,
    network,
    activeReferrals,
  };
}

/** Determine le prochain palier de statut et la progression. */
export function nextStatusProgress(salesCount: number, activeReferrals: number) {
  if (salesCount >= 30 && activeReferrals >= 5) {
    return { current: "MASTER", next: null, label: "Statut maximal atteint 🏆", progress: 100 };
  }
  if (salesCount >= 15 || activeReferrals >= 3) {
    const p = Math.min(100, Math.round((Math.min(salesCount / 30, activeReferrals / 5) || 0) * 100));
    return {
      current: "GOLD",
      next: "MASTER",
      label: `${salesCount}/30 ventes et ${activeReferrals}/5 filleuls actifs pour Master`,
      progress: p,
    };
  }
  if (salesCount >= 5) {
    return {
      current: "SILVER",
      next: "GOLD",
      label: `${salesCount}/15 ventes ou ${activeReferrals}/3 filleuls actifs pour Gold`,
      progress: Math.min(100, Math.round((salesCount / 15) * 100)),
    };
  }
  return {
    current: "STARTER",
    next: "SILVER",
    label: `${salesCount}/5 ventes pour Silver`,
    progress: Math.min(100, Math.round((salesCount / 5) * 100)),
  };
}

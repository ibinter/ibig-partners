import { prisma } from "@/lib/prisma";

// Badge slugs matching DB seeds
const BADGE_SLUGS = {
  FIRST_SALE:    "first-sale",
  SALES_10:      "sales-10",
  SALES_50:      "sales-50",
  STATUS_GOLD:   "status-gold",
  STATUS_MASTER: "status-master",
  STATUS_ELITE:  "status-elite",
  TEAM_10:       "team-10",
} as const;

/**
 * Check badge conditions for a given user and award any newly earned badges.
 * Call this after a sale is confirmed or a user status changes.
 * NOT a server action — just a utility function for internal use.
 */
export async function checkAndAwardBadges(userId: string): Promise<void> {
  const [user, salesCount, referralsCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { status: true } }),
    prisma.sale.count({ where: { sellerId: userId, status: "CONFIRMED" } }),
    prisma.user.count({ where: { sponsorId: userId } }),
  ]);

  if (!user) return;

  // Map badge slug → whether condition is met
  // Les badges de statut sont cumulatifs : un Master a aussi le badge Gold.
  const conditions: Record<string, boolean> = {
    [BADGE_SLUGS.FIRST_SALE]:    salesCount >= 1,
    [BADGE_SLUGS.SALES_10]:      salesCount >= 10,
    [BADGE_SLUGS.SALES_50]:      salesCount >= 50,
    [BADGE_SLUGS.STATUS_GOLD]:   ["GOLD", "MASTER", "ELITE"].includes(user.status),
    [BADGE_SLUGS.STATUS_MASTER]: ["MASTER", "ELITE"].includes(user.status),
    [BADGE_SLUGS.STATUS_ELITE]:  user.status === "ELITE",
    [BADGE_SLUGS.TEAM_10]:       referralsCount >= 10,
  };

  // Fetch all existing badge definitions
  const allBadges = await (prisma as any).badge.findMany({
    where: { slug: { in: Object.keys(conditions) } },
    select: { id: true, slug: true },
  });

  // Award each condition that is met
  for (const badge of allBadges) {
    if (!conditions[badge.slug]) continue;
    await (prisma as any).userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
      update: {},
      create: { userId, badgeId: badge.id, earnedAt: new Date() },
    });
  }
}

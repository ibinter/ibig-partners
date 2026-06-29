/**
 * Badge auto-attribution utility.
 * Checks all badge conditions for a partner and awards any newly earned badges,
 * then creates a Notification so the partner is informed.
 *
 * Badge condition values come from the `condition` field stored in the Badge
 * model (e.g. "FIRST_SALE", "SALES_10", "STATUS_GOLD", …).
 * When the condition field is missing or unrecognised the badge slug is used
 * as a fallback to infer the condition.
 */

import { prisma } from "./prisma";
import { getNetwork, activeTeamCount, directReferralsCount } from "./metrics";

type PartnerStats = {
  salesCount: number;
  referralsCount: number;
  activeTeam: number;
  directReferrals: number;
  status: string;
};

/** Load all stats needed to evaluate badge conditions. */
async function loadStats(userId: string): Promise<PartnerStats | null> {
  const [user, salesCount, referralsCount, network] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { status: true } }),
    prisma.sale.count({ where: { sellerId: userId, status: "CONFIRMED" } }),
    prisma.user.count({ where: { sponsorId: userId } }),
    getNetwork(userId),
  ]);

  if (!user) return null;

  return {
    salesCount,
    referralsCount,
    activeTeam: activeTeamCount(network),
    directReferrals: directReferralsCount(network),
    status: user.status,
  };
}

/**
 * Returns true when the given badge condition (from `Badge.condition` or
 * inferred from `Badge.slug`) is satisfied by `stats`.
 */
function isBadgeEarned(
  condition: string,
  slug: string,
  stats: PartnerStats,
): boolean {
  // Normalise: try the `condition` field first, then fall back to the slug.
  const key = (condition || slug || "").toUpperCase().replace(/-/g, "_");

  // --- ventes ---
  if (key === "FIRST_SALE"  || key === "SALE_1")  return stats.salesCount >= 1;
  if (key === "SALES_5"     || key === "SALE_5")  return stats.salesCount >= 5;
  if (key === "SALES_10"    || key === "SALE_10") return stats.salesCount >= 10;
  if (key === "SALES_50"    || key === "SALE_50") return stats.salesCount >= 50;
  if (key === "SALES_100"   || key === "SALE_100") return stats.salesCount >= 100;

  // --- filleuls ---
  if (key === "FIRST_REFERRAL" || key === "REFERRAL_1") return stats.referralsCount >= 1;
  if (key === "TEAM_10" || key === "REFERRAL_10")       return stats.referralsCount >= 10;

  // --- statuts ---
  if (key === "STATUS_SILVER") return ["SILVER", "GOLD", "MASTER", "ELITE"].includes(stats.status);
  if (key === "STATUS_GOLD")   return ["GOLD", "MASTER", "ELITE"].includes(stats.status);
  if (key === "STATUS_MASTER") return ["MASTER", "ELITE"].includes(stats.status);
  if (key === "STATUS_ELITE")  return stats.status === "ELITE";

  // Slug-based fallbacks for common naming patterns
  if (slug === "first-sale")    return stats.salesCount >= 1;
  if (slug === "sales-5")       return stats.salesCount >= 5;
  if (slug === "sales-10")      return stats.salesCount >= 10;
  if (slug === "sales-50")      return stats.salesCount >= 50;
  if (slug === "sales-100")     return stats.salesCount >= 100;
  if (slug === "first-referral") return stats.referralsCount >= 1;
  if (slug === "team-10")        return stats.referralsCount >= 10;
  if (slug === "status-silver")  return ["SILVER", "GOLD", "MASTER", "ELITE"].includes(stats.status);
  if (slug === "status-gold")    return ["GOLD", "MASTER", "ELITE"].includes(stats.status);
  if (slug === "status-master")  return ["MASTER", "ELITE"].includes(stats.status);
  if (slug === "status-elite")   return stats.status === "ELITE";

  return false;
}

/**
 * Check all badge conditions for `userId` and award any newly-earned badges.
 * For each new badge a Notification is created so the partner is informed.
 * Safe to call multiple times — already-awarded badges are skipped via upsert.
 */
export async function checkAndAwardBadges(userId: string): Promise<void> {
  const stats = await loadStats(userId);
  if (!stats) return;

  // Fetch all badge definitions
  const allBadges = await (prisma as any).badge.findMany({
    select: { id: true, slug: true, title: true, icon: true, condition: true },
  }) as Array<{ id: string; slug: string; title: string; icon: string; condition: string }>;

  if (allBadges.length === 0) return;

  // Fetch badges already owned by this user
  const ownedBadges = await (prisma as any).userBadge.findMany({
    where: { userId },
    select: { badgeId: true },
  }) as Array<{ badgeId: string }>;

  const ownedIds = new Set(ownedBadges.map((b: { badgeId: string }) => b.badgeId));

  for (const badge of allBadges) {
    // Skip already awarded
    if (ownedIds.has(badge.id)) continue;

    const earned = isBadgeEarned(badge.condition ?? "", badge.slug, stats);
    if (!earned) continue;

    // Award the badge (upsert for idempotency)
    await (prisma as any).userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
      update: {},
      create: { userId, badgeId: badge.id, earnedAt: new Date() },
    });

    // Notify the partner
    await prisma.notification.create({
      data: {
        userId,
        title: `${badge.icon ?? "🏅"} Badge débloqué : ${badge.title}`,
        body: `Félicitations ! Vous venez d'obtenir le badge "${badge.title}". Continuez sur votre lancée !`,
      },
    });
  }
}

import { after } from "next/server";
import { prisma } from "./prisma";
import { STATUS_RULES } from "./constants";
import { getNetwork, activeTeamCount, directReferralsCount } from "./metrics";
import { checkAndAwardBadges } from "./badges";

const STATUSES = ["STARTER", "SILVER", "GOLD", "MASTER", "ELITE"] as const;
type Status = typeof STATUSES[number];

const STATUS_EMOJI: Record<Status, string> = {
  STARTER: "🌱",
  SILVER:  "🥈",
  GOLD:    "🥇",
  MASTER:  "💎",
  ELITE:   "👑",
};

const STATUS_LABEL: Record<Status, string> = {
  STARTER: "Starter",
  SILVER:  "Silver",
  GOLD:    "Gold",
  MASTER:  "Master Partner",
  ELITE:   "Elite Représentant",
};

export async function checkAndPromoteStatus(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { status: true },
  });
  if (!user) return;

  const currentIdx = STATUSES.indexOf(user.status as Status);
  if (currentIdx === -1 || currentIdx === STATUSES.length - 1) return;

  const [salesCount, network] = await Promise.all([
    prisma.sale.count({ where: { sellerId: userId, status: "CONFIRMED" } }),
    getNetwork(userId),
  ]);

  const directRef = directReferralsCount(network);
  const activeTeam = activeTeamCount(network);

  // Walk up statuses from next above current to find the highest earned
  let targetStatus: Status | null = null;

  for (let i = STATUSES.length - 1; i > currentIdx; i--) {
    const candidate = STATUSES[i];
    const rules = (STATUS_RULES as Record<string, { sales: number; directReferrals?: number; activeTeam?: number }>)[candidate];
    if (!rules) continue;

    const qualifies =
      salesCount >= rules.sales &&
      (rules.directReferrals === undefined || directRef >= rules.directReferrals) &&
      (rules.activeTeam === undefined || activeTeam >= rules.activeTeam);

    if (qualifies) {
      targetStatus = candidate;
      break;
    }
  }

  if (!targetStatus) return;

  await prisma.user.update({
    where: { id: userId },
    data: { status: targetStatus },
  });

  await prisma.notification.create({
    data: {
      userId,
      title: `${STATUS_EMOJI[targetStatus]} Félicitations ! Vous êtes ${STATUS_LABEL[targetStatus]}`,
      body: `Votre profil vient d'être promu au statut ${STATUS_LABEL[targetStatus]}. Continuez sur votre lancée pour atteindre le niveau suivant !`,
      url: "/espace/objectifs",
    },
  });

  // Re-check badges now that status changed
  await checkAndAwardBadges(userId);
}

export function checkAndPromoteStatusAfter(userId: string) {
  after(() => checkAndPromoteStatus(userId));
}

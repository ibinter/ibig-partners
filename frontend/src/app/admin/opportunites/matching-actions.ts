"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Calcule le score de compatibilité d'un partenaire avec une opportunité
function computeScore(
  opp: { category: string; userId: string },
  partner: { id: string; marketSectors: string | null; marketZone: string | null; status: string; city: string | null },
  oppZone: string | null,
  existingLeadUserIds: Set<string>
): number {
  let score = 0;

  // +3 si le secteur de l'opportunité est dans les marchés du partenaire
  if (partner.marketSectors) {
    const sectors = partner.marketSectors.split(",").map((s: string) => s.trim().toUpperCase());
    if (sectors.includes(opp.category.toUpperCase())) score += 3;
  }

  // +2 si même zone géographique
  if (partner.marketZone && oppZone) {
    if (partner.marketZone.toLowerCase().includes(oppZone.toLowerCase()) ||
        oppZone.toLowerCase().includes(partner.marketZone.toLowerCase())) score += 2;
  }

  // +1 si partenaire GOLD/MASTER/ELITE (expérimenté)
  if (["GOLD", "MASTER", "ELITE"].includes(partner.status)) score += 1;

  // -5 si déjà candidat sur cette opportunité (évite doublons)
  if (existingLeadUserIds.has(partner.id)) score -= 5;

  // Le soumetteur lui-même est exclu (score forcé à -99)
  if (partner.id === opp.userId) score = -99;

  return score;
}

export async function computeOpportunityMatches(formData: FormData) {
  await requireAdmin();
  const opportunityId = formData.get("opportunityId") as string;

  const opp = await (prisma as any).opportunity.findUnique({
    where: { id: opportunityId },
    select: { id: true, category: true, userId: true, handler: true },
  });
  if (!opp) throw new Error("Opportunité introuvable");

  // Récupère tous les partenaires actifs
  const partners = await (prisma as any).user.findMany({
    where: { role: "PARTNER", active: true, approved: true },
    select: { id: true, marketSectors: true, marketZone: true, status: true, city: true },
  });

  // Candidats déjà existants
  const existingLeads = await (prisma as any).opportunityLead.findMany({
    where: { opportunityId },
    select: { userId: true },
  });
  const leadUserIds = new Set<string>(existingLeads.map((l: any) => String(l.userId)));

  // Zone de l'opportunité (on utilise le handler comme indicateur ou null)
  const oppZone: string | null = null;

  // Calcul + upsert des scores (top 20 seulement)
  const scored = partners
    .map((p: any) => ({ partner: p, score: computeScore(opp, p, oppZone, leadUserIds) }))
    .filter((x: any) => x.score > 0)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 20);

  for (const { partner, score } of scored) {
    await (prisma as any).opportunityMatch.upsert({
      where: { opportunityId_userId: { opportunityId, userId: partner.id } },
      update: { score },
      create: {
        opportunityId,
        userId: partner.id,
        score,
        status: "SUGGESTED",
      },
    });
  }

  revalidatePath("/admin/opportunites");
}

export async function inviteMatchedPartner(formData: FormData) {
  await requireAdmin();
  const matchId = formData.get("matchId") as string;
  const opportunityId = formData.get("opportunityId") as string;

  const match = await (prisma as any).opportunityMatch.findUnique({
    where: { id: matchId },
    include: { opportunity: { select: { title: true, code: true } } },
  });
  if (!match) throw new Error("Match introuvable");

  await (prisma as any).opportunityMatch.update({
    where: { id: matchId },
    data: { status: "INVITED", invitedAt: new Date() },
  });

  // Notification au partenaire
  await prisma.notification.create({
    data: {
      userId: match.userId,
      title: "Invitation sur une opportunité",
      body: `L'équipe IBIG vous invite à consulter l'opportunité ${match.opportunity.code ?? ""} : ${match.opportunity.title}`,
      link: "/espace/opportunites",
    },
  });

  revalidatePath("/admin/opportunites");
}

export async function declineMatch(formData: FormData) {
  await requireAdmin();
  const matchId = formData.get("matchId") as string;
  await (prisma as any).opportunityMatch.update({
    where: { id: matchId },
    data: { status: "DECLINED" },
  });
  revalidatePath("/admin/opportunites");
}

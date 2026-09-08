"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { sendOpportunityMatchInviteEmail } from "@/lib/email";

// ─── Scoring (sur 100) ───────────────────────────────────────────────────────
// Secteur exact dans marketSectors    : +40
// Secteur partiel (catégorie proche)  : +20
// Zone géographique (country/city)    : +20
// Niveau partenaire GOLD+             : +20, GOLD: +12, SILVER: +6
// Déjà intéressé (opportunité active) : -30 (évite doublon)
// Soumetteur lui-même                 : -999

// Catégories proches pour score partiel
const RELATED: Record<string, string[]> = {
  COMMERCIAL:       ["PARTENARIAT", "MISE_EN_RELATION", "MARKETING"],
  PARTENARIAT:      ["COMMERCIAL", "INTERNATIONAL", "CONSEIL"],
  FORMATION:        ["EMPLOI_RH", "CONSEIL"],
  DIGITAL:          ["INFORMATIQUE", "MARKETING", "COMMERCE"],
  FINANCEMENT:      ["IMMOBILIER", "CONSEIL"],
  CONSEIL:          ["COMMERCIAL", "PARTENARIAT", "EMPLOI_RH"],
  IMMOBILIER:       ["FINANCEMENT", "BTP"],
  EMPLOI_RH:        ["FORMATION", "CONSEIL"],
  MISE_EN_RELATION: ["COMMERCIAL", "PARTENARIAT"],
};

function computeScore(
  opp: { category: string; userId: string },
  partner: { id: string; marketSectors: string | null; marketZone: string | null; country: string | null; city: string | null; status: string },
  oppZone: string | null,
  existingLeadUserIds: Set<string>
): number {
  if (partner.id === opp.userId) return -999;

  let score = 0;
  const cat = opp.category.toUpperCase();

  // Secteur
  if (partner.marketSectors) {
    const sectors = partner.marketSectors.split(",").map((s: string) => s.trim().toUpperCase());
    if (sectors.includes(cat)) {
      score += 40;
    } else {
      const related = RELATED[cat] ?? [];
      if (related.some(r => sectors.includes(r))) score += 20;
    }
  }

  // Zone
  if (oppZone && (partner.marketZone || partner.country || partner.city)) {
    const zone = oppZone.toLowerCase();
    const partnerZone = [partner.marketZone, partner.country, partner.city]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (partnerZone.includes(zone) || zone.includes(partnerZone.split(" ")[0])) {
      score += 20;
    }
  }

  // Niveau
  const levelBonus: Record<string, number> = {
    ELITE: 20, MASTER: 20, GOLD: 12, SILVER: 6, STARTER: 0,
  };
  score += levelBonus[partner.status] ?? 0;

  // Déjà candidat sur cette opportunité
  if (existingLeadUserIds.has(partner.id)) score -= 30;

  return score;
}

export async function computeOpportunityMatches(formData: FormData) {
  await requireAdmin();
  const opportunityId = formData.get("opportunityId") as string;

  const opp = await (prisma as any).opportunity.findUnique({
    where: { id: opportunityId },
    select: { id: true, category: true, userId: true, handler: true, description: true },
  });
  if (!opp) throw new Error("Opportunité introuvable");

  const partners = await (prisma as any).user.findMany({
    where: { role: "PARTNER", active: true, approved: true },
    select: { id: true, marketSectors: true, marketZone: true, country: true, city: true, status: true },
  });

  const existingLeads = await (prisma as any).opportunityLead.findMany({
    where: { opportunityId },
    select: { userId: true },
  });
  const leadUserIds = new Set<string>(existingLeads.map((l: any) => String(l.userId)));

  // Tente d'extraire une zone géographique depuis description/handler
  const oppZone: string | null = null;

  const scored = partners
    .map((p: any) => ({ partner: p, score: computeScore(opp, p, oppZone, leadUserIds) }))
    .filter((x: any) => x.score > 0)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 20);

  for (const { partner, score } of scored) {
    await (prisma as any).opportunityMatch.upsert({
      where: { opportunityId_userId: { opportunityId, userId: partner.id } },
      update: { score },
      create: { opportunityId, userId: partner.id, score, status: "SUGGESTED" },
    });
  }

  revalidatePath("/admin/opportunites");
}

export async function inviteMatchedPartner(formData: FormData) {
  await requireAdmin();
  const matchId = formData.get("matchId") as string;

  const match = await (prisma as any).opportunityMatch.findUnique({
    where: { id: matchId },
    include: {
      opportunity: { select: { title: true, code: true, category: true, description: true, estimatedValue: true, deadline: true } },
      user: { select: { email: true, firstName: true } },
    },
  });
  if (!match) throw new Error("Match introuvable");

  await (prisma as any).opportunityMatch.update({
    where: { id: matchId },
    data: { status: "INVITED", invitedAt: new Date() },
  });

  await prisma.notification.create({
    data: {
      userId: match.userId,
      title: "🎯 Opportunité sélectionnée pour vous",
      body: `IBIG vous invite sur l'opportunité ${match.opportunity.code ?? ""} : ${match.opportunity.title} (score de compatibilité : ${match.score}/100)`,
      url: "/espace/opportunites",
    },
  });

  after(async () => {
    await sendOpportunityMatchInviteEmail({
      to: match.user.email,
      firstName: match.user.firstName,
      opportunityTitle: match.opportunity.title,
      opportunityCode: match.opportunity.code ?? "",
      opportunityCategory: match.opportunity.category,
      opportunityDescription: match.opportunity.description,
      estimatedValue: match.opportunity.estimatedValue ?? 0,
      deadline: match.opportunity.deadline
        ? new Date(match.opportunity.deadline).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
        : null,
      score: match.score,
    });
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

// Appelé automatiquement lors de l'approbation d'une opportunité
export async function autoComputeMatches(opportunityId: string) {
  const opp = await (prisma as any).opportunity.findUnique({
    where: { id: opportunityId },
    select: { id: true, category: true, userId: true },
  });
  if (!opp) return;

  const partners = await (prisma as any).user.findMany({
    where: { role: "PARTNER", active: true, approved: true },
    select: { id: true, marketSectors: true, marketZone: true, country: true, city: true, status: true },
  });

  const existingLeads = await (prisma as any).opportunityLead.findMany({
    where: { opportunityId },
    select: { userId: true },
  });
  const leadUserIds = new Set<string>(existingLeads.map((l: any) => String(l.userId)));

  const scored = partners
    .map((p: any) => ({ partner: p, score: computeScore(opp, p, null, leadUserIds) }))
    .filter((x: any) => x.score >= 20)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 20);

  for (const { partner, score } of scored) {
    await (prisma as any).opportunityMatch.upsert({
      where: { opportunityId_userId: { opportunityId, userId: partner.id } },
      update: { score },
      create: { opportunityId, userId: partner.id, score, status: "SUGGESTED" },
    });
  }
}

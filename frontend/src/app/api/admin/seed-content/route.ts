import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  await requireAdmin();

  const results: string[] = [];

  /* ── NIVEAUX PARTENAIRES ── */
  const levels = [
    { name: "CONNECTEUR",       label: "Connecteur",        minCp: 0,    color: "#64748b", order: 1, perks: "Accès au catalogue produits | Liens d'affiliation | Formation de base | Kit marketing starter" },
    { name: "PARTNER",          label: "Partner",           minCp: 100,  color: "#3b82f6", order: 2, perks: "Tout Connecteur | Accès aux missions standards | Badge Partner | Simulateur revenus avancé" },
    { name: "BUSINESS_PARTNER", label: "Business Partner",  minCp: 500,  color: "#8b5cf6", order: 3, perks: "Tout Partner | Missions prioritaires | Taux de commission bonifiés | Rapport mensuel personnalisé | Accès Boutique CP élargi" },
    { name: "PREMIUM_PARTNER",  label: "Premium Partner",   minCp: 1500, color: "#f59e0b", order: 4, perks: "Tout Business Partner | Accès VIP événements IBIG | Compte dédié IBIG | Missions exclusives Premium | Badge Premium doré" },
    { name: "ELITE_PARTNER",    label: "Elite Partner",     minCp: 3000, color: "#ef4444", order: 5, perks: "Tout Premium | Commission maximale | Accès direct direction IBIG | Missions Élite haute valeur | Badge Élite exclusif | Invitation conseil partenaires" },
  ];

  let levelsCreated = 0;
  for (const lv of levels) {
    const existing = await (prisma as any).partnerLevel.findUnique({ where: { name: lv.name } }).catch(() => null);
    if (!existing) {
      await (prisma as any).partnerLevel.create({ data: { ...lv, active: true } });
      levelsCreated++;
      results.push(`✓ Niveau : ${lv.label}`);
    } else {
      results.push(`~ Existant : ${lv.label}`);
    }
  }

  /* ── BOUTIQUE CP ── */
  const rewards = [
    { name: "Accès formation vente avancée", description: "Module complet techniques de closing et négociation pour affiliés confirmés", points: 150, category: "FORMATION", stock: -1, validityDays: 90, conditions: "Niveau PARTNER minimum", active: true },
    { name: "Masterclass Prospection B2B", description: "Session live 2h avec un expert IBIG sur la prospection entreprises", points: 300, category: "FORMATION", stock: 20, validityDays: 60, conditions: "Niveau BUSINESS_PARTNER minimum", active: true },
    { name: "Coaching individuel 30 min", description: "Session 1-on-1 avec un coach IBIG certifié pour débloquer votre performance", points: 500, category: "FORMATION", stock: 10, validityDays: 45, conditions: "Niveau BUSINESS_PARTNER minimum", active: true },
    { name: "1 mois IBIG SOFT gratuit", description: "Accès complet à IBIG SOFT pendant 30 jours (valeur 25 000 FCFA)", points: 200, category: "LOGICIEL", stock: -1, validityDays: 30, conditions: null, active: true },
    { name: "3 mois IBIG SOFT gratuit", description: "Accès complet à IBIG SOFT pendant 90 jours (valeur 75 000 FCFA)", points: 500, category: "LOGICIEL", stock: -1, validityDays: 90, conditions: "Niveau PARTNER minimum", active: true },
    { name: "Accès IBIG EDUFORM 1 mois", description: "Accès plateforme IBIG EDUFORM pendant 30 jours", points: 180, category: "LOGICIEL", stock: -1, validityDays: 30, conditions: null, active: true },
    { name: "Kit visuel personnalisé (5 visuels)", description: "Création de 5 visuels professionnels par l'équipe IBIG DIGITAL", points: 250, category: "MARKETING", stock: 15, validityDays: 60, conditions: null, active: true },
    { name: "Page vitrine affilié premium", description: "Page de présentation personnalisée sur ibigpartners.com avec vos spécialités", points: 400, category: "MARKETING", stock: -1, validityDays: 365, conditions: "Niveau PARTNER minimum", active: true },
    { name: "Campagne WhatsApp 500 contacts", description: "Diffusion de votre offre sur la base de contacts qualifiés IBIG", points: 600, category: "MARKETING", stock: 5, validityDays: 30, conditions: "Niveau BUSINESS_PARTNER minimum — offre soumise à validation IBIG", active: true },
    { name: "Audit de votre argumentaire vente", description: "Analyse de vos scripts WhatsApp / email par un expert IBIG avec recommandations", points: 200, category: "AUDIT", stock: 20, validityDays: 60, conditions: null, active: true },
    { name: "Audit complet de votre réseau affilié", description: "Analyse de votre réseau de filleuls : performance, blocages, recommandations", points: 450, category: "AUDIT", stock: 8, validityDays: 45, conditions: "Avoir au moins 5 filleuls actifs", active: true },
    { name: "Accès mission Premium exclusive", description: "Accès à une mission haute valeur normalement réservée aux Elite", points: 800, category: "MISSION", stock: 5, validityDays: 30, conditions: "Niveau PREMIUM_PARTNER minimum", active: true },
    { name: "Priorité candidature missions 30 jours", description: "Votre candidature est mise en avant sur toutes les missions actives pendant 30 jours", points: 300, category: "MISSION", stock: -1, validityDays: 30, conditions: "Niveau PARTNER minimum", active: true },
    { name: "Pack Goodies IBIG (T-shirt + carnet)", description: "T-shirt officiel IBIG PARTNERS, carnet, stylo — livraison incluse à Abidjan", points: 350, category: "AUTRE", stock: 30, validityDays: 60, conditions: "Livraison à Abidjan uniquement sous 2 semaines", active: true },
    { name: "Invitation événement IBIG VIP", description: "Accès à un événement networking exclusif IBIG SARL (conférence, gala ou formation)", points: 700, category: "AUTRE", stock: 10, validityDays: 120, conditions: "Niveau PREMIUM_PARTNER minimum", active: true },
  ];

  let rewardsCreated = 0;
  for (const rw of rewards) {
    const existing = await (prisma as any).reward.findFirst({ where: { name: rw.name } }).catch(() => null);
    if (!existing) {
      await (prisma as any).reward.create({ data: rw });
      rewardsCreated++;
      results.push(`✓ Récompense : ${rw.name} (${rw.points} CP)`);
    } else {
      results.push(`~ Existante : ${rw.name}`);
    }
  }

  /* ── CHALLENGES ── */
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const endNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59);
  const qEnd = new Date(now.getFullYear(), Math.ceil((now.getMonth() + 1) / 3) * 3, 0, 23, 59, 59);

  const challenges = [
    { title: "🚀 Première vente du mois", description: "Réalisez au moins 1 vente confirmée ce mois pour débloquer votre bonus de démarrage.", metric: "SALES_COUNT", target: 1, reward: 5000, startAt: startMonth, endAt: endOfMonth, active: true },
    { title: "🔥 5 ventes ce mois — Top Performer", description: "Atteignez 5 ventes confirmées pour rejoindre le classement des Top Performers du mois.", metric: "SALES_COUNT", target: 5, reward: 25000, startAt: startMonth, endAt: endOfMonth, active: true },
    { title: "👥 Recruter 3 filleuls actifs", description: "Parrainez 3 nouveaux affiliés inscrits sur la plateforme ce mois-ci.", metric: "REFERRALS", target: 3, reward: 15000, startAt: startMonth, endAt: endOfMonth, active: true },
    { title: "📇 Convertir 5 prospects", description: "Faites passer 5 prospects vers le statut Converti dans votre CRM.", metric: "PROSPECTS_CONVERTED", target: 5, reward: 10000, startAt: startMonth, endAt: endOfMonth, active: true },
    { title: "💰 100 000 FCFA de commissions", description: "Cumulez 100 000 FCFA de commissions générées en un seul mois.", metric: "COMMISSION_AMOUNT", target: 100000, reward: 50000, startAt: startMonth, endAt: endOfMonth, active: true },
    { title: "🏆 Challenge Trimestriel — 15 ventes", description: "Objectif trimestriel : 15 ventes confirmées pour décrocher le titre Business Champion.", metric: "SALES_COUNT", target: 15, reward: 100000, startAt: startMonth, endAt: qEnd, active: true },
    { title: "🌱 Construire un réseau de 10 filleuls", description: "Développez votre réseau en parrainant 10 nouveaux affiliés sur la plateforme.", metric: "REFERRALS", target: 10, reward: 40000, startAt: startMonth, endAt: endNextMonth, active: true },
  ];

  let challengesCreated = 0;
  for (const ch of challenges) {
    const existing = await prisma.challenge.findFirst({ where: { title: ch.title } }).catch(() => null);
    if (!existing) {
      await prisma.challenge.create({ data: ch });
      challengesCreated++;
      results.push(`✓ Challenge : ${ch.title}`);
    } else {
      results.push(`~ Existant : ${ch.title}`);
    }
  }

  return NextResponse.json({
    ok: true,
    summary: {
      levels: levelsCreated,
      rewards: rewardsCreated,
      challenges: challengesCreated,
    },
    details: results,
  });
}

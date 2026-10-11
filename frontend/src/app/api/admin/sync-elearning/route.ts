import { NextResponse } from "next/server";
import { isSyncAuthorized } from "@/lib/sync-auth";
import { syncBranchWithFeed } from "@/lib/catalog-feed";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ELEARNING_PRODUCTS = [
  {
    slug: "el-excel-tableaux-bord",
    name: "Excel — Tableaux de Bord & Reporting",
    pricingType: "COURSE",
    price: 20000,
    rate: 15,
    siteUrl: "https://ibig-elearning.com",
    description: "Créer des tableaux de bord professionnels avec Excel : TCD, graphiques avancés, Power Query. Certifiant. 35h.",
  },
  {
    slug: "el-marketing-digital-complet",
    name: "Marketing Digital — Formation Complète",
    pricingType: "COURSE",
    price: 35000,
    rate: 15,
    siteUrl: "https://ibig-elearning.com",
    description: "SEO, réseaux sociaux, Facebook/Google Ads, email marketing, analytics. 60h certifiant.",
  },
  {
    slug: "el-comptabilite-ohada",
    name: "Comptabilité Générale SYSCOHADA",
    pricingType: "COURSE",
    price: 25000,
    rate: 15,
    siteUrl: "https://ibig-elearning.com",
    description: "Plan comptable SYSCOHADA révisé, états financiers TAFIRE, fiscalité Afrique. 40h certifiant.",
  },
  {
    slug: "el-gestion-projet-pmp",
    name: "Gestion de Projet — Certification PMP",
    pricingType: "COURSE",
    price: 45000,
    rate: 15,
    siteUrl: "https://ibig-elearning.com",
    description: "Préparation PMP : PMBOK, Agile/Scrum, gestion des risques. 55h.",
  },
  {
    slug: "el-rh-gestion-talents",
    name: "Ressources Humaines & Gestion des Talents",
    pricingType: "COURSE",
    price: 28000,
    rate: 15,
    siteUrl: "https://ibig-elearning.com",
    description: "Recrutement, intégration, évaluation, droit du travail OHADA. 40h.",
  },
  {
    slug: "el-leadership-management",
    name: "Leadership & Management d'Équipe",
    pricingType: "COURSE",
    price: 22000,
    rate: 15,
    siteUrl: "https://ibig-elearning.com",
    description: "Développer son leadership, motiver ses équipes, gérer les conflits. 35h certifiant.",
  },
  {
    slug: "el-entrepreneuriat-lean",
    name: "Entrepreneuriat Lean Startup",
    pricingType: "COURSE",
    price: 30000,
    rate: 15,
    siteUrl: "https://ibig-elearning.com",
    description: "Valider son idée, construire un MVP, trouver ses premiers clients. 45h.",
  },
  {
    slug: "el-intelligence-artificielle",
    name: "IA & ChatGPT pour les Professionnels",
    pricingType: "COURSE",
    price: 22000,
    rate: 15,
    siteUrl: "https://ibig-elearning.com",
    description: "Utiliser ChatGPT, Copilot et les outils IA pour gagner en productivité. 30h.",
  },
  {
    slug: "el-cybersecurite",
    name: "Cybersécurité — Fondamentaux",
    pricingType: "COURSE",
    price: 20000,
    rate: 15,
    siteUrl: "https://ibig-elearning.com",
    description: "Protéger son entreprise des cybermenaces : phishing, ransomware, bonnes pratiques. 25h certifiant.",
  },
  {
    slug: "el-creation-entreprise",
    name: "Créer et Gérer son Entreprise en Afrique",
    pricingType: "COURSE",
    price: 28000,
    rate: 15,
    siteUrl: "https://ibig-elearning.com",
    description: "Formalités, business plan, comptabilité de base, financement, TVA, CNPS. 40h.",
  },
  {
    slug: "el-vente-negociation",
    name: "Vente & Négociation Commerciale",
    pricingType: "COURSE",
    price: 18000,
    rate: 15,
    siteUrl: "https://ibig-elearning.com",
    description: "Techniques de vente consultative, closing, traitement des objections. 25h.",
  },
  {
    slug: "el-communication-professionnelle",
    name: "Communication Professionnelle",
    pricingType: "COURSE",
    price: 15000,
    rate: 15,
    siteUrl: "https://ibig-elearning.com",
    description: "Emails, rapports, présentations, prise de parole en réunion. 20h certifiant.",
  },
  {
    slug: "el-pack-manager",
    name: "Pack Manager Complet",
    pricingType: "COURSE",
    price: 65000,
    rate: 15,
    siteUrl: "https://ibig-elearning.com",
    description: "Leadership + Gestion de Projet + RH. Pack 3 formations certifiantes. Accès 12 mois.",
  },
  {
    slug: "el-pack-finance",
    name: "Pack Finance & Comptabilité",
    pricingType: "COURSE",
    price: 55000,
    rate: 15,
    siteUrl: "https://ibig-elearning.com",
    description: "Comptabilité SYSCOHADA + Excel Tableaux de Bord + Gestion Trésorerie. Pack certifiant.",
  },
  {
    slug: "el-pack-digital",
    name: "Pack Transformation Digitale",
    pricingType: "COURSE",
    price: 70000,
    rate: 15,
    siteUrl: "https://ibig-elearning.com",
    description: "Marketing Digital + IA pour Professionnels + Cybersécurité. 3 certifications.",
  },
  {
    slug: "el-abonnement-mensuel",
    name: "IBIG eLearning — Accès Illimité Mensuel",
    pricingType: "MONTHLY_SUB",
    price: 12000,
    rate: 15,
    siteUrl: "https://ibig-elearning.com",
    description: "Accès illimité à toutes les formations IBIG eLearning. 12 000 FCFA/mois.",
  },
  {
    slug: "el-abonnement-annuel",
    name: "IBIG eLearning — Accès Illimité Annuel",
    pricingType: "ANNUAL_SUB",
    price: 96000,
    rate: 15,
    siteUrl: "https://ibig-elearning.com",
    description: "Accès illimité pendant 12 mois. Économisez 33%. 96 000 FCFA/an.",
  },
  {
    slug: "el-abonnement-entreprise",
    name: "IBIG eLearning — Licence Entreprise",
    pricingType: "MONTHLY_SUB",
    price: 50000,
    rate: 15,
    siteUrl: "https://ibig-elearning.com",
    description: "Licence entreprise : 10 collaborateurs + tableau de bord RH + rapports de compétences. 50 000 FCFA/mois.",
  },
];

export async function POST() {
  try {
    if (!(await isSyncAuthorized())) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    await prisma.setting.upsert({
      where: { key: "catalog_feed_ibig-elearning" },
      update: { value: "https://ibig-elearning.com/api/catalogue" },
      create: { key: "catalog_feed_ibig-elearning", value: "https://ibig-elearning.com/api/catalogue" },
    }).catch(() => {});

    const result = await syncBranchWithFeed("ibig-elearning", "IBIG eLEARNING", ELEARNING_PRODUCTS, { notify: true });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { diff, notified } = result;
    return NextResponse.json({
      ok: true,
      upserted: diff.total,
      added: diff.added.length,
      updated: diff.updated.length,
      deleted: diff.removed,
      notified,
      message: `${diff.total} formations IBIG eLEARNING synchronisées (${diff.added.length} nouveau(x), ${diff.updated.length} mis à jour, ${diff.removed} retiré(s)).`,
    });
  } catch (err: any) {
    console.error("sync-elearning error:", err);
    return NextResponse.json({ error: err?.message ?? "Erreur serveur" }, { status: 500 });
  }
}

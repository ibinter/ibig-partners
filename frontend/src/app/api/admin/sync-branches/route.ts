import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BRANCHES_DATA = [
  {
    slug: "ibig-soft", name: "IBIG SOFT",
    tagline: "Édition logicielle, SaaS & applications métiers",
    description: "IBIG SOFT conçoit et commercialise des solutions SaaS et ERP adaptés aux réalités africaines : gestion scolaire (Scolaby), gestion de flotte (IBIG Fleet 360), gestion locative (Lokativo), gestion commerciale (GESCOMXEL), livraison (Zelivry) et bien d'autres logiciels métiers pour PME et institutions.",
    website: "https://ibigsoft.com/",
    offerType: "Abonnements mensuels & annuels",
    commissionModel: "20% N1 • 10% N2 • 5% N3 (dégressif sur 4 mois) | Annuel : 20% N1 • 8% N2 • 3% N3",
    order: 1, active: true,
  },
  {
    slug: "ibig-eduform", name: "IBIG EDUFORM",
    tagline: "Formation professionnelle & insertion certifiante",
    description: "IBIG EDUFORM accompagne les particuliers et professionnels à travers des formations certifiantes (200+ programmes), du coaching, de l'e-learning et des services d'insertion professionnelle. Formations en présentiel et à distance couvrant la comptabilité, le digital, la gestion, le BTP, la santé et bien d'autres domaines.",
    website: "https://ibig-eduform.com/",
    offerType: "Formations courtes & certifiantes",
    commissionModel: "10% N1 • 5% N2 • 2% N3",
    order: 2, active: true,
  },
  {
    slug: "ibig-immo-trust", name: "IBIG IMMO TRUST",
    tagline: "Immobilier sécurisé & rentable",
    description: "IBIG IMMO TRUST propose des solutions immobilières complètes : gestion locative, transactions immobilières, conseil en investissement, assistance diaspora, régularisation foncière et BTP. Tous les services pour sécuriser et rentabiliser votre patrimoine immobilier en Côte d'Ivoire et en Afrique.",
    website: "https://ibigimmotrust.com/",
    offerType: "Service / Produit immobilier",
    commissionModel: "10% N1 • 5% N2 • 2,5% N3 (jusqu'à 50%/25%/12,5% pour la Gestion Locative)",
    order: 3, active: true,
  },
  {
    slug: "ibig-market", name: "IBIG MARKET",
    tagline: "Vente physique & numérique — boutique universelle",
    description: "IBIG MARKET est la plateforme e-commerce et de vente physique du groupe IBIG SARL. Vente de produits IT, mobilier, fournitures de bureau, matériel divers. Logistique et livraison incluses. Boutique universelle accessible en ligne et en magasin.",
    website: "https://ibig-market.com/",
    offerType: "Produit / E-commerce",
    commissionModel: "8% N1 • 4% N2 • 2% N3",
    order: 4, active: true,
  },
  {
    slug: "ibig-digital", name: "IBIG DIGITAL",
    tagline: "Création digitale & Communication visuelle",
    description: "IBIG DIGITAL est le pôle créatif et communication du groupe IBIG SARL : création de sites web vitrines, identité visuelle, community management, production de contenus digitaux, campagnes publicitaires en ligne et stratégie de marque. Des solutions créatives pour valoriser votre image.",
    website: "https://intermark-business.com/digital",
    offerType: "Service créatif & communication",
    commissionModel: "10% N1 • 5% N2 • 2% N3",
    order: 5, active: true,
  },
  {
    slug: "ibig-digital-kits", name: "IBIG DIGITAL KITS",
    tagline: "Technologies & Transformation Numérique",
    description: "IBIG DIGITAL KITS accompagne les entreprises dans leur transformation numérique : intégration ERP (SAP, SAGE, Odoo), GED, développement web et mobile, intelligence artificielle, chatbots, kits numériques prêts à l'emploi et marketing digital. Des solutions technologiques clé en main pour digitaliser votre activité.",
    website: "https://kits.intermark-business.com/",
    offerType: "Service / Produit digital",
    commissionModel: "15% N1 • 7,5% N2 • 3,75% N3",
    order: 6, active: true,
  },
  {
    slug: "ibig-conseil-plus", name: "IBIG CONSEIL+",
    tagline: "Structuration, Comptabilité & Juridique",
    description: "IBIG CONSEIL+ accompagne les entreprises, institutions et ONG dans leur structuration organisationnelle, la gestion administrative et financière, ainsi que la mise en conformité juridique. Audit organisationnel, conseil stratégique, comptabilité, fiscalité, études de marché et accompagnement à la création d'entreprise.",
    website: "https://intermark-business.com/conseil",
    offerType: "Service sur devis",
    commissionModel: "10% N1 • 5% N2 • 2% N3",
    order: 7, active: true,
  },
  {
    slug: "ibig-partners-branch", name: "IBIG PARTNERS",
    tagline: "Représentation commerciale & Développement de marché",
    description: "IBIG PARTNERS est le programme d'affiliation multi-niveaux du groupe IBIG SARL. Mise en relation B2B, campagnes de développement commercial, implantation régionale et gestion des réseaux de partenaires. Rejoignez le réseau et générez des commissions en promouvant les services du groupe.",
    website: "https://www.ibigpartners.com/",
    offerType: "Programme d'affiliation",
    commissionModel: "Variable selon branche & niveau",
    order: 8, active: true,
  },
  {
    slug: "ibig-multiservices", name: "IBIG MULTISERVICES",
    tagline: "Solutions polyvalentes — événementiel, logistique & services",
    description: "IBIG MULTISERVICES propose une gamme étendue de services aux particuliers et entreprises : organisation événementielle, déménagement, maintenance et dépannage, accueil VIP, logistique, BTP, tourisme et transport. Une solution polyvalente pour tous vos besoins de services.",
    website: "https://intermark-business.com/multiservices",
    offerType: "Service / Produit",
    commissionModel: "10% N1 • 5% N2 • 2% N3",
    order: 9, active: true,
  },
];

const OLD_SLUGS = [
  "eduform", "conseil-plus", "immo-trust", "ibig-immotrust",
  "multiservices", "ibig-tv", "intermark-business",
];

export async function POST() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  // Désactiver les anciennes branches
  const deactivated = await prisma.branch.updateMany({
    where: { slug: { in: OLD_SLUGS } },
    data: { active: false },
  });

  // Upsert des 9 branches officielles
  let upserted = 0;
  for (const b of BRANCHES_DATA) {
    await prisma.branch.upsert({
      where: { slug: b.slug },
      update: b,
      create: b,
    });
    upserted++;
  }

  return NextResponse.json({
    ok: true,
    deactivated: deactivated.count,
    upserted,
    message: `${deactivated.count} ancienne(s) branche(s) désactivée(s), ${upserted} branche(s) synchronisée(s).`,
  });
}

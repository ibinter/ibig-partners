import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SOFT_PRODUCTS = [
  {
    slug: "scolaby",
    name: "Scolaby",
    pricingType: "MONTHLY_SUB",
    price: 30000,
    rate: 20,
    siteUrl: "https://scolaby.com",
    description: "Plateforme de gestion scolaire nouvelle génération pour l'Afrique, du préscolaire au supérieur : inscriptions en ligne, gestion des notes et bulletins automatiques, emplois du temps, communication avec les parents par SMS et paiements de la scolarité. Pour écoles, collèges, lycées et universités souhaitant digitaliser leur gestion administrative et pédagogique. Abonnement à partir de 30 000 FCFA/mois.",
  },
  {
    slug: "scolaby-annuel",
    name: "Scolaby (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 300000,
    rate: 20,
    siteUrl: "https://scolaby.com",
    description: "Abonnement annuel à Scolaby, la plateforme de gestion scolaire complète (inscriptions, notes, bulletins, paiements, communication parents), avec 2 mois offerts par rapport à l'abonnement mensuel. Pour les établissements souhaitant s'engager sur l'année scolaire complète. 300 000 FCFA/an.",
  },
  {
    slug: "ibig-fleet-360",
    name: "IBIG Fleet 360",
    pricingType: "MONTHLY_SUB",
    price: 45000,
    rate: 20,
    siteUrl: "https://ibigfleet360.com",
    description: "ERP de gestion de flotte tout-en-un pensé pour les réalités africaines : suivi des véhicules et chauffeurs, planification des maintenances, gestion du carburant, des coûts d'exploitation et des trajets, tableau de bord en temps réel. Pour entreprises de transport, sociétés avec parc automobile ou logistique souhaitant réduire leurs coûts et améliorer leur suivi. Abonnement à partir de 45 000 FCFA/mois.",
  },
  {
    slug: "lokativo",
    name: "Lokativo",
    pricingType: "MONTHLY_SUB",
    price: 35000,
    rate: 20,
    siteUrl: "https://lokativo.com",
    description: "Système de gestion immobilière panafricain destiné aux agences, propriétaires et syndics : gestion des baux, suivi des loyers et charges, quittances automatiques, portefeuille de biens et locataires centralisé. Pour agences immobilières et gestionnaires de patrimoine souhaitant professionnaliser et simplifier leur gestion locative. Abonnement à partir de 35 000 FCFA/mois.",
  },
  {
    slug: "gescomxel",
    name: "GESCOMXEL",
    pricingType: "MONTHLY_SUB",
    price: 20000,
    rate: 20,
    siteUrl: "https://ibigsoft.com/gescomxel.php",
    description: "Solution intelligente de gestion commerciale tout-en-un : CRM, devis et factures, gestion des stocks et caisse. Idéal pour boutiques, pharmacies, supermarchés et PME souhaitant centraliser leurs ventes et leur stock sur un seul outil simple à utiliser. Abonnement à partir de 20 000 FCFA/mois.",
  },
  {
    slug: "zelivry",
    name: "Zelivry",
    pricingType: "MONTHLY_SUB",
    price: 25000,
    rate: 20,
    siteUrl: "https://zelivry.com",
    description: "Application web tout-en-un pour piloter une activité de livraison : gestion des commandes, des clients, des livreurs, suivi en temps réel des courses et des paiements. La solution sur mesure pour les startups et entreprises de livraison africaines souhaitant structurer et faire évoluer leur activité. Abonnement à partir de 25 000 FCFA/mois.",
  },
  {
    slug: "stockflow",
    name: "STOCKFLOW ERP",
    pricingType: "MONTHLY_SUB",
    price: 40000,
    rate: 20,
    siteUrl: "https://stockflow.ibigsoft.com",
    description: "ERP commercial 100% cloud et multi-tenant conçu pour les PME et distributeurs africains : gestion des stocks multi-dépôts, achats, ventes, facturation et reporting en temps réel. Pour entreprises de distribution et de commerce souhaitant un outil de gestion centralisé, accessible partout et évolutif. Abonnement à partir de 40 000 FCFA/mois.",
  },
];

export async function POST() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const branch = await prisma.branch.findUnique({ where: { slug: "ibig-soft" } });
  if (!branch) {
    return NextResponse.json(
      { error: "Branche IBIG SOFT introuvable. Synchronisez d'abord les branches." },
      { status: 404 }
    );
  }

  const knownSlugs = SOFT_PRODUCTS.map((p) => p.slug);

  const deleted = await prisma.product.deleteMany({
    where: {
      branchId: branch.id,
      slug: { notIn: knownSlugs },
      sales: { none: {} },
    },
  });

  let upserted = 0;
  for (const p of SOFT_PRODUCTS) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        pricingType: p.pricingType,
        price: p.price,
        rate: p.rate,
        siteUrl: p.siteUrl,
        description: p.description,
        branchId: branch.id,
        active: true,
      },
      create: {
        slug: p.slug,
        name: p.name,
        pricingType: p.pricingType,
        price: p.price,
        rate: p.rate,
        siteUrl: p.siteUrl,
        description: p.description,
        branchId: branch.id,
        active: true,
      },
    });
    upserted++;
  }

  return NextResponse.json({
    ok: true,
    upserted,
    deleted: deleted.count,
    message: `${upserted} logiciels IBIG SOFT synchronisés, ${deleted.count} doublon(s) supprimé(s).`,
  });
}

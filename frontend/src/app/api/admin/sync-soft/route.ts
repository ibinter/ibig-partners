import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SOFT_PRODUCTS = [
  {
    slug: "scolaby",
    name: "Scolaby",
    pricingType: "MONTHLY_SUB",
    price: 10000,
    rate: 20,
    siteUrl: "https://scolaby.com",
    description: "Plateforme de gestion scolaire nouvelle génération pour l'Afrique, du préscolaire au supérieur : inscriptions en ligne, gestion des notes et bulletins automatiques, emplois du temps, communication avec les parents par SMS et paiements de la scolarité. Pour écoles, collèges, lycées et universités souhaitant digitaliser leur gestion administrative et pédagogique. Tarifs par cycle et taille d'établissement, à partir de 10 000 FCFA/mois (maternelle/primaire ≤300 élèves) jusqu'à 150 000 FCFA/mois pour les grands groupes scolaires — voir grille complète sur scolaby.com.",
  },
  {
    slug: "scolaby-annuel",
    name: "Scolaby (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 100000,
    rate: 20,
    siteUrl: "https://scolaby.com",
    description: "Abonnement annuel à Scolaby, la plateforme de gestion scolaire complète (inscriptions, notes, bulletins, paiements, communication parents), avec environ 17% d'économie par rapport au mensuel (soit près de 2 mois offerts). Pour les établissements souhaitant s'engager sur l'année scolaire complète. À partir de 100 000 FCFA/an (maternelle/primaire ≤300 élèves) — tarif variable selon cycle et taille d'établissement.",
  },
  {
    slug: "ibig-fleet-360",
    name: "IBIG Fleet 360",
    pricingType: "MONTHLY_SUB",
    price: 19900,
    rate: 20,
    siteUrl: "https://ibigfleet360.com",
    description: "ERP de gestion de flotte tout-en-un pensé pour les réalités africaines : suivi des véhicules et chauffeurs, planification des maintenances, gestion du carburant, des coûts d'exploitation et des trajets, tableau de bord en temps réel. Pour entreprises de transport, sociétés avec parc automobile ou logistique souhaitant réduire leurs coûts et améliorer leur suivi. 4 formules : Starter à partir de 19 900 FCFA/mois (10 véhicules), jusqu'à Enterprise à partir de 250 000 FCFA/mois (flotte illimitée) — voir grille complète sur ibigfleet360.com.",
  },
  {
    slug: "lokativo",
    name: "Lokativo",
    pricingType: "MONTHLY_SUB",
    price: 9900,
    rate: 20,
    siteUrl: "https://lokativo.com",
    description: "Système de gestion immobilière panafricain destiné aux agences, propriétaires et syndics : gestion des baux, suivi des loyers et charges, quittances automatiques, portefeuille de biens et locataires centralisé. Pour agences immobilières et gestionnaires de patrimoine souhaitant professionnaliser et simplifier leur gestion locative. 3 formules : Starter à partir de 9 900 FCFA/mois (10 biens), jusqu'à Entreprise à 29 900 FCFA/mois (portefeuille illimité) — voir grille complète sur lokativo.com.",
  },
  {
    slug: "gescomxel",
    name: "GESCOMXEL",
    pricingType: "MONTHLY_SUB",
    price: 5000,
    rate: 20,
    siteUrl: "https://ibigsoft.com/gescomxel.php",
    description: "Solution intelligente de gestion commerciale tout-en-un : CRM, devis et factures, gestion des stocks et caisse. Idéal pour boutiques, pharmacies, supermarchés et PME souhaitant centraliser leurs ventes et leur stock sur un seul outil simple à utiliser. 3 formules : Starter à partir de 5 000 FCFA/mois (1 poste), jusqu'à Business à 15 000 FCFA/mois (15 postes, multi-boutique).",
  },
  {
    slug: "zelivry",
    name: "Zelivry",
    pricingType: "MONTHLY_SUB",
    price: 4900,
    rate: 20,
    siteUrl: "https://zelivry.com",
    description: "Application web tout-en-un pour piloter une activité de livraison : gestion des commandes, des clients, des livreurs, suivi en temps réel des courses et des paiements. La solution sur mesure pour les startups et entreprises de livraison africaines souhaitant structurer et faire évoluer leur activité. 4 formules : Starter à partir de 4 900 FCFA/mois (2 livreurs), jusqu'à Expert Illimité à 39 900 FCFA/mois (livreurs et livraisons illimités).",
  },
  {
    slug: "stockflow",
    name: "STOCKFLOW ERP",
    pricingType: "MONTHLY_SUB",
    price: 5000,
    rate: 20,
    siteUrl: "https://stockflow.ibigsoft.com",
    description: "ERP commercial 100% cloud et multi-tenant conçu pour les PME et distributeurs africains : gestion des stocks multi-dépôts, achats, ventes, facturation et reporting en temps réel. Pour entreprises de distribution et de commerce souhaitant un outil de gestion centralisé, accessible partout et évolutif. 4 formules : Essentiel à partir de 5 000 FCFA/mois, jusqu'à Entreprise SCM à 30 000 FCFA/mois — voir grille complète sur stockflow.ibigsoft.com.",
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

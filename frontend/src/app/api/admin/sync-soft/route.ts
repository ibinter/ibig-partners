import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SOFT_PRODUCTS = [
  // ── SCOLABY (scolaby.com) — tarifs par cycle et taille d'établissement ──
  {
    slug: "scolaby-maternelle-primaire",
    name: "Scolaby — Maternelle/Primaire",
    pricingType: "MONTHLY_SUB",
    price: 10000,
    rate: 20,
    siteUrl: "https://scolaby.com",
    description: "Scolaby pour écoles maternelles et primaires (≤300 élèves) : inscriptions en ligne, notes, bulletins automatiques, emploi du temps, SMS parents, paiement de la scolarité. 10 000 FCFA/mois. Tarif progressif selon l'effectif (300-1000 élèves : 15 000 FCFA/mois ; 1000+ : 20 000 FCFA/mois).",
  },
  {
    slug: "scolaby-maternelle-primaire-annuel",
    name: "Scolaby — Maternelle/Primaire (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 99600,
    rate: 20,
    siteUrl: "https://scolaby.com",
    description: "Abonnement annuel Scolaby pour maternelle/primaire (≤300 élèves), avec économie par rapport au mensuel. 99 600 FCFA/an.",
  },
  {
    slug: "scolaby-college-lycee",
    name: "Scolaby — Collège/Lycée",
    pricingType: "MONTHLY_SUB",
    price: 20000,
    rate: 20,
    siteUrl: "https://scolaby.com",
    description: "Scolaby pour collèges et lycées (≤300 élèves), mêmes fonctionnalités que la formule Maternelle/Primaire adaptées au secondaire. 20 000 FCFA/mois. Tarif progressif selon l'effectif (300-1000 élèves : 35 000 FCFA/mois ; 1000+ : 50 000 FCFA/mois).",
  },
  {
    slug: "scolaby-college-lycee-annuel",
    name: "Scolaby — Collège/Lycée (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 199200,
    rate: 20,
    siteUrl: "https://scolaby.com",
    description: "Abonnement annuel Scolaby pour collège/lycée (≤300 élèves). 199 200 FCFA/an.",
  },
  {
    slug: "scolaby-universite-bts",
    name: "Scolaby — Université/BTS",
    pricingType: "MONTHLY_SUB",
    price: 35000,
    rate: 20,
    siteUrl: "https://scolaby.com",
    description: "Scolaby pour universités et BTS (≤300 étudiants), adapté à la gestion de l'enseignement supérieur. 35 000 FCFA/mois. Tarif progressif selon l'effectif (300-1000 étudiants : 60 000 FCFA/mois ; 1000+ : sur devis).",
  },
  {
    slug: "scolaby-universite-bts-annuel",
    name: "Scolaby — Université/BTS (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 348600,
    rate: 20,
    siteUrl: "https://scolaby.com",
    description: "Abonnement annuel Scolaby pour université/BTS (≤300 étudiants). 348 600 FCFA/an.",
  },
  {
    slug: "scolaby-multi-cycles",
    name: "Scolaby — Multi-cycles",
    pricingType: "MONTHLY_SUB",
    price: 25000,
    rate: 20,
    siteUrl: "https://scolaby.com",
    description: "Scolaby pour établissements combinant plusieurs cycles (≤300 élèves tous cycles confondus). 25 000 FCFA/mois. Tarif progressif selon l'effectif (300-1000 élèves : 45 000 FCFA/mois ; 1000+ : sur devis).",
  },
  {
    slug: "scolaby-multi-cycles-annuel",
    name: "Scolaby — Multi-cycles (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 249000,
    rate: 20,
    siteUrl: "https://scolaby.com",
    description: "Abonnement annuel Scolaby pour établissement multi-cycles (≤300 élèves). 249 000 FCFA/an.",
  },
  {
    slug: "scolaby-groupe-scolaire",
    name: "Scolaby — Groupe Scolaire",
    pricingType: "MONTHLY_SUB",
    price: 80000,
    rate: 20,
    siteUrl: "https://scolaby.com",
    description: "Scolaby pour groupes scolaires gérant plusieurs établissements sous une même direction (≤1000 élèves au total), avec vue consolidée multi-sites. 80 000 FCFA/mois. Au-delà de 3000 élèves : sur devis.",
  },
  {
    slug: "scolaby-groupe-scolaire-grand",
    name: "Scolaby — Groupe Scolaire (1000-3000 élèves)",
    pricingType: "MONTHLY_SUB",
    price: 150000,
    rate: 20,
    siteUrl: "https://scolaby.com",
    description: "Scolaby pour groupes scolaires de grande taille (1000 à 3000 élèves au total), avec vue consolidée multi-sites. 150 000 FCFA/mois. Au-delà : sur devis.",
  },

  // ── IBIG FLEET 360 (ibigfleet360.com) — gestion de flotte, 4 formules ──
  {
    slug: "ibig-fleet-360-starter",
    name: "IBIG Fleet 360 — Starter",
    pricingType: "MONTHLY_SUB",
    price: 19900,
    rate: 20,
    siteUrl: "https://ibigfleet360.com",
    description: "IBIG Fleet 360 formule Starter (jusqu'à 10 véhicules) : suivi des véhicules et chauffeurs, maintenance, carburant, coûts d'exploitation. 19 900 FCFA/mois.",
  },
  {
    slug: "ibig-fleet-360-starter-annuel",
    name: "IBIG Fleet 360 — Starter (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 199000,
    rate: 20,
    siteUrl: "https://ibigfleet360.com",
    description: "Abonnement annuel IBIG Fleet 360 Starter (10 véhicules), -10% par rapport au mensuel. 199 000 FCFA/an.",
  },
  {
    slug: "ibig-fleet-360-business",
    name: "IBIG Fleet 360 — Business",
    pricingType: "MONTHLY_SUB",
    price: 49900,
    rate: 20,
    siteUrl: "https://ibigfleet360.com",
    description: "IBIG Fleet 360 formule Business, pour flottes plus importantes que la formule Starter, avec fonctionnalités avancées de suivi et reporting. 49 900 FCFA/mois.",
  },
  {
    slug: "ibig-fleet-360-business-annuel",
    name: "IBIG Fleet 360 — Business (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 499000,
    rate: 20,
    siteUrl: "https://ibigfleet360.com",
    description: "Abonnement annuel IBIG Fleet 360 Business, -10% par rapport au mensuel. 499 000 FCFA/an.",
  },
  {
    slug: "ibig-fleet-360-professional",
    name: "IBIG Fleet 360 — Professional",
    pricingType: "MONTHLY_SUB",
    price: 99900,
    rate: 20,
    siteUrl: "https://ibigfleet360.com",
    description: "IBIG Fleet 360 formule Professional, pour flottes de taille importante avec besoins avancés de gestion et d'analyse. 99 900 FCFA/mois.",
  },
  {
    slug: "ibig-fleet-360-professional-annuel",
    name: "IBIG Fleet 360 — Professional (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 999000,
    rate: 20,
    siteUrl: "https://ibigfleet360.com",
    description: "Abonnement annuel IBIG Fleet 360 Professional, -10% par rapport au mensuel. 999 000 FCFA/an.",
  },
  {
    slug: "ibig-fleet-360-enterprise",
    name: "IBIG Fleet 360 — Enterprise",
    pricingType: "MONTHLY_SUB",
    price: 250000,
    rate: 20,
    siteUrl: "https://ibigfleet360.com",
    description: "IBIG Fleet 360 formule Enterprise, flotte illimitée, pour grandes entreprises de transport et logistique. À partir de 250 000 FCFA/mois — tarif sur devis au-delà.",
  },
  {
    slug: "ibig-fleet-360-enterprise-annuel",
    name: "IBIG Fleet 360 — Enterprise (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 2500000,
    rate: 20,
    siteUrl: "https://ibigfleet360.com",
    description: "Abonnement annuel IBIG Fleet 360 Enterprise, -10% par rapport au mensuel. À partir de 2 500 000 FCFA/an — tarif sur devis au-delà.",
  },

  // ── LOKATIVO (lokativo.com) — gestion immobilière, 3 formules ──
  {
    slug: "lokativo-starter",
    name: "Lokativo — Starter",
    pricingType: "MONTHLY_SUB",
    price: 9900,
    rate: 20,
    siteUrl: "https://lokativo.com",
    description: "Lokativo formule Starter (jusqu'à 10 biens) : gestion des baux, loyers, charges, quittances automatiques. 9 900 FCFA/mois.",
  },
  {
    slug: "lokativo-starter-annuel",
    name: "Lokativo — Starter (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 99900,
    rate: 20,
    siteUrl: "https://lokativo.com",
    description: "Abonnement annuel Lokativo Starter (10 biens), 2 mois offerts par rapport au mensuel. 99 900 FCFA/an.",
  },
  {
    slug: "lokativo-pro",
    name: "Lokativo — Pro",
    pricingType: "MONTHLY_SUB",
    price: 19900,
    rate: 20,
    siteUrl: "https://lokativo.com",
    description: "Lokativo formule Pro, la plus populaire, pour agences avec un portefeuille de biens plus large que la formule Starter. 19 900 FCFA/mois.",
  },
  {
    slug: "lokativo-pro-annuel",
    name: "Lokativo — Pro (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 199900,
    rate: 20,
    siteUrl: "https://lokativo.com",
    description: "Abonnement annuel Lokativo Pro, 2 mois offerts par rapport au mensuel. 199 900 FCFA/an.",
  },
  {
    slug: "lokativo-entreprise",
    name: "Lokativo — Entreprise",
    pricingType: "MONTHLY_SUB",
    price: 29900,
    rate: 20,
    siteUrl: "https://lokativo.com",
    description: "Lokativo formule Entreprise, portefeuille de biens illimité, pour grandes agences et gestionnaires de patrimoine. 29 900 FCFA/mois.",
  },
  {
    slug: "lokativo-entreprise-annuel",
    name: "Lokativo — Entreprise (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 299900,
    rate: 20,
    siteUrl: "https://lokativo.com",
    description: "Abonnement annuel Lokativo Entreprise, 2 mois offerts par rapport au mensuel. 299 900 FCFA/an.",
  },

  // ── GESCOMXEL (ibigsoft.com/gescomxel.php) — gestion commerciale, 3 formules ──
  {
    slug: "gescomxel-starter",
    name: "GESCOMXEL — Starter",
    pricingType: "MONTHLY_SUB",
    price: 5000,
    rate: 20,
    siteUrl: "https://ibigsoft.com/gescomxel.php",
    description: "GESCOMXEL formule Starter (1 poste) : CRM, devis, factures, stocks et caisse. Idéal pour petite boutique ou pharmacie. 5 000 FCFA/mois.",
  },
  {
    slug: "gescomxel-starter-annuel",
    name: "GESCOMXEL — Starter (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 50000,
    rate: 20,
    siteUrl: "https://ibigsoft.com/gescomxel.php",
    description: "Abonnement annuel GESCOMXEL Starter (1 poste). 50 000 FCFA/an.",
  },
  {
    slug: "gescomxel-pro",
    name: "GESCOMXEL — Pro",
    pricingType: "MONTHLY_SUB",
    price: 10000,
    rate: 20,
    siteUrl: "https://ibigsoft.com/gescomxel.php",
    description: "GESCOMXEL formule Pro, la plus populaire (jusqu'à 5 postes simultanés), synchronisation temps réel. 10 000 FCFA/mois.",
  },
  {
    slug: "gescomxel-pro-annuel",
    name: "GESCOMXEL — Pro (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 90000,
    rate: 20,
    siteUrl: "https://ibigsoft.com/gescomxel.php",
    description: "Abonnement annuel GESCOMXEL Pro (5 postes). 90 000 FCFA/an.",
  },
  {
    slug: "gescomxel-business",
    name: "GESCOMXEL — Business",
    pricingType: "MONTHLY_SUB",
    price: 15000,
    rate: 20,
    siteUrl: "https://ibigsoft.com/gescomxel.php",
    description: "GESCOMXEL formule Business (jusqu'à 15 postes), gestion multi-boutique avec vue consolidée. 15 000 FCFA/mois.",
  },
  {
    slug: "gescomxel-business-annuel",
    name: "GESCOMXEL — Business (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 130000,
    rate: 20,
    siteUrl: "https://ibigsoft.com/gescomxel.php",
    description: "Abonnement annuel GESCOMXEL Business (15 postes, multi-boutique). 130 000 FCFA/an.",
  },

  // ── ZELIVRY (zelivry.com) — gestion de livraison, 4 formules ──
  {
    slug: "zelivry-starter",
    name: "Zelivry — Starter",
    pricingType: "MONTHLY_SUB",
    price: 4900,
    rate: 20,
    siteUrl: "https://zelivry.com",
    description: "Zelivry formule Starter (jusqu'à 2 livreurs, 150 livraisons/mois) : commandes, clients, catalogue, suivi public. 4 900 FCFA/mois.",
  },
  {
    slug: "zelivry-starter-annuel",
    name: "Zelivry — Starter (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 49000,
    rate: 20,
    siteUrl: "https://zelivry.com",
    description: "Abonnement annuel Zelivry Starter (2 livreurs), 2 mois offerts par rapport au mensuel. 49 000 FCFA/an.",
  },
  {
    slug: "zelivry-essentiel",
    name: "Zelivry — Essentiel",
    pricingType: "MONTHLY_SUB",
    price: 9900,
    rate: 20,
    siteUrl: "https://zelivry.com",
    description: "Zelivry formule Essentiel (jusqu'à 8 livreurs, 800 livraisons/mois), facturation, devis, caisse. 9 900 FCFA/mois.",
  },
  {
    slug: "zelivry-essentiel-annuel",
    name: "Zelivry — Essentiel (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 99000,
    rate: 20,
    siteUrl: "https://zelivry.com",
    description: "Abonnement annuel Zelivry Essentiel (8 livreurs), 2 mois offerts par rapport au mensuel. 99 000 FCFA/an.",
  },
  {
    slug: "zelivry-premium",
    name: "Zelivry — Premium",
    pricingType: "MONTHLY_SUB",
    price: 19900,
    rate: 20,
    siteUrl: "https://zelivry.com",
    description: "Zelivry formule Premium, la plus populaire (jusqu'à 25 livreurs, livraisons illimitées), comptabilité et rapports d'incidents. 19 900 FCFA/mois.",
  },
  {
    slug: "zelivry-premium-annuel",
    name: "Zelivry — Premium (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 199000,
    rate: 20,
    siteUrl: "https://zelivry.com",
    description: "Abonnement annuel Zelivry Premium (25 livreurs, livraisons illimitées), 2 mois offerts par rapport au mensuel. 199 000 FCFA/an.",
  },
  {
    slug: "zelivry-expert-illimite",
    name: "Zelivry — Expert Illimité",
    pricingType: "MONTHLY_SUB",
    price: 39900,
    rate: 20,
    siteUrl: "https://zelivry.com",
    description: "Zelivry formule Expert Illimité, livreurs et utilisateurs illimités, multi-agences et international, marque blanche. 39 900 FCFA/mois.",
  },
  {
    slug: "zelivry-expert-illimite-annuel",
    name: "Zelivry — Expert Illimité (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 399000,
    rate: 20,
    siteUrl: "https://zelivry.com",
    description: "Abonnement annuel Zelivry Expert Illimité, 2 mois offerts par rapport au mensuel. 399 000 FCFA/an.",
  },

  // ── STOCKFLOW ERP (stockflow.ibigsoft.com) — 4 formules ──
  {
    slug: "stockflow-essentiel",
    name: "STOCKFLOW ERP — Essentiel",
    pricingType: "MONTHLY_SUB",
    price: 5000,
    rate: 20,
    siteUrl: "https://stockflow.ibigsoft.com",
    description: "STOCKFLOW ERP formule Essentiel (2 utilisateurs, 300 produits) : gestion de stock, facturation. 5 000 FCFA/mois.",
  },
  {
    slug: "stockflow-essentiel-annuel",
    name: "STOCKFLOW ERP — Essentiel (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 50000,
    rate: 20,
    siteUrl: "https://stockflow.ibigsoft.com",
    description: "Abonnement annuel STOCKFLOW ERP Essentiel. 50 000 FCFA/an.",
  },
  {
    slug: "stockflow-gestion-plus",
    name: "STOCKFLOW ERP — Gestion+",
    pricingType: "MONTHLY_SUB",
    price: 15000,
    rate: 20,
    siteUrl: "https://stockflow.ibigsoft.com",
    description: "STOCKFLOW ERP formule Gestion+, comptabilité et tableaux de bord avancés en plus de la gestion de stock. 15 000 FCFA/mois.",
  },
  {
    slug: "stockflow-gestion-plus-annuel",
    name: "STOCKFLOW ERP — Gestion+ (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 150000,
    rate: 20,
    siteUrl: "https://stockflow.ibigsoft.com",
    description: "Abonnement annuel STOCKFLOW ERP Gestion+. 150 000 FCFA/an.",
  },
  {
    slug: "stockflow-logistique",
    name: "STOCKFLOW ERP — Logistique",
    pricingType: "MONTHLY_SUB",
    price: 20000,
    rate: 20,
    siteUrl: "https://stockflow.ibigsoft.com",
    description: "STOCKFLOW ERP formule Logistique, gestion multi-dépôts pour distributeurs avec plusieurs entrepôts. 20 000 FCFA/mois.",
  },
  {
    slug: "stockflow-logistique-annuel",
    name: "STOCKFLOW ERP — Logistique (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 200000,
    rate: 20,
    siteUrl: "https://stockflow.ibigsoft.com",
    description: "Abonnement annuel STOCKFLOW ERP Logistique. 200 000 FCFA/an.",
  },
  {
    slug: "stockflow-entreprise-scm",
    name: "STOCKFLOW ERP — Entreprise SCM",
    pricingType: "MONTHLY_SUB",
    price: 30000,
    rate: 20,
    siteUrl: "https://stockflow.ibigsoft.com",
    description: "STOCKFLOW ERP formule Entreprise SCM, capacité illimitée, 10 entrepôts, support dédié — pour grands distributeurs. 30 000 FCFA/mois.",
  },
  {
    slug: "stockflow-entreprise-scm-annuel",
    name: "STOCKFLOW ERP — Entreprise SCM (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 300000,
    rate: 20,
    siteUrl: "https://stockflow.ibigsoft.com",
    description: "Abonnement annuel STOCKFLOW ERP Entreprise SCM. 300 000 FCFA/an.",
  },
];

export async function POST() {
  try {
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

    const BATCH_SIZE = 5;
    for (let i = 0; i < SOFT_PRODUCTS.length; i += BATCH_SIZE) {
      const batch = SOFT_PRODUCTS.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map((p: any) =>
          prisma.product.upsert({
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
          })
        )
      );
    }
    const upserted = SOFT_PRODUCTS.length;

    return NextResponse.json({
      ok: true,
      upserted,
      deleted: deleted.count,
      message: `${upserted} logiciels IBIG SOFT synchronisés, ${deleted.count} doublon(s) supprimé(s).`,
    });
  } catch (err: any) {
    console.error("sync-soft error:", err);
    return NextResponse.json({ error: err?.message ?? "Erreur serveur" }, { status: 500 });
  }
}

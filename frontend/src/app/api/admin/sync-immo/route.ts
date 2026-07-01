import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BASE = "https://intermark-business.com/immo";

const IMMO_PRODUCTS = [
  // ── Gestion Locative ──────────────────────────────────────────────────
  {
    slug: "immo-gestion-locative",
    name: "Gestion Locative Complète",
    pricingType: "MONTHLY_SUB",
    price: 30000,
    rate: 10,
    siteUrl: BASE,
    description: "Gestion locative intégrale de votre bien immobilier : recherche et sélection du locataire, rédaction du bail, état des lieux d'entrée et de sortie, encaissement des loyers, suivi des réparations et reversement mensuel au propriétaire. Pour propriétaires bailleurs souhaitant valoriser leur patrimoine sans contrainte de gestion. À partir de 30 000 FCFA/mois ou 8% du loyer.",
  },
  {
    slug: "immo-recherche-locataire",
    name: "Recherche & Sélection de Locataire",
    pricingType: "SERVICE",
    price: 50000,
    rate: 10,
    siteUrl: BASE,
    description: "Recherche et sélection rigoureuse d'un locataire solvable et sérieux : diffusion de l'annonce, visites accompagnées, vérification des dossiers (revenus, références), sélection finale et rédaction du contrat de bail. Pour propriétaires souhaitant louer leur bien rapidement et en toute sécurité. À partir de 50 000 FCFA.",
  },
  {
    slug: "immo-etat-des-lieux",
    name: "État des Lieux",
    pricingType: "SERVICE",
    price: 20000,
    rate: 10,
    siteUrl: BASE,
    description: "Réalisation d'états des lieux d'entrée et de sortie contradictoires et détaillés : constat photographique, rapport écrit signé par les deux parties, document légalement opposable en cas de litige. Pour propriétaires et locataires souhaitant protéger leurs intérêts. 20 000 FCFA par état des lieux.",
  },
  {
    slug: "immo-recouvrement-loyers",
    name: "Recouvrement de Loyers Impayés",
    pricingType: "SERVICE",
    price: 40000,
    rate: 10,
    siteUrl: BASE,
    description: "Assistance au recouvrement de loyers impayés : mise en demeure, négociation avec le locataire défaillant, procédures amiables et, si nécessaire, accompagnement dans les démarches juridiques. Pour propriétaires confrontés à des loyers en retard ou à des locataires mauvais payeurs. À partir de 40 000 FCFA.",
  },

  // ── Transactions Immobilières ─────────────────────────────────────────
  {
    slug: "immo-vente-bien",
    name: "Vente de Bien Immobilier",
    pricingType: "SERVICE",
    price: 200000,
    rate: 10,
    siteUrl: BASE,
    description: "Accompagnement complet pour la vente de votre bien immobilier : estimation du prix de marché, diffusion de l'annonce, organisation des visites, négociation avec les acquéreurs, suivi du dossier jusqu'à la signature chez le notaire. Pour propriétaires souhaitant vendre rapidement et au meilleur prix. Commission : 5% du prix de vente, minimum 200 000 FCFA.",
  },
  {
    slug: "immo-achat-bien",
    name: "Accompagnement Achat Immobilier",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Accompagnement personnalisé pour l'achat d'un bien immobilier : définition du cahier des charges, recherche ciblée, visites, négociation du prix, vérification des titres de propriété et suivi jusqu'à la signature. Pour acquéreurs souhaitant acheter en toute sécurité sans mauvaise surprise. À partir de 150 000 FCFA.",
  },
  {
    slug: "immo-transaction-terrain",
    name: "Transaction Foncière & Vente de Terrain",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Accompagnement pour l'achat et la vente de terrains : vérification du statut foncier, contrôle des titres (ACD, titre foncier, arrêté de concession définitive), bornage, négociation et formalités de transfert de propriété. Pour acheteurs et vendeurs de terrains souhaitant sécuriser leur transaction foncière en Côte d'Ivoire. À partir de 150 000 FCFA.",
  },
  {
    slug: "immo-location-commerciale",
    name: "Location de Locaux Commerciaux",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Recherche et mise en location de locaux commerciaux, bureaux et entrepôts : identification des locaux disponibles selon vos critères, visites, négociation des conditions du bail commercial et accompagnement jusqu'à la remise des clés. Pour entrepreneurs et entreprises cherchant des locaux professionnels adaptés à leur activité. À partir de 100 000 FCFA.",
  },

  // ── Conseil en Investissement Immobilier ──────────────────────────────
  {
    slug: "immo-conseil-investissement",
    name: "Conseil en Investissement Immobilier",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Conseil stratégique pour vos investissements immobiliers : analyse du marché local, identification des zones à fort potentiel, évaluation de la rentabilité locative, recommandations d'achat et structuration du plan de financement. Pour investisseurs souhaitant placer leur argent dans l'immobilier en toute connaissance de cause. À partir de 100 000 FCFA.",
  },
  {
    slug: "immo-expertise-evaluation",
    name: "Expertise & Évaluation Immobilière",
    pricingType: "SERVICE",
    price: 75000,
    rate: 10,
    siteUrl: BASE,
    description: "Estimation professionnelle de la valeur vénale ou locative d'un bien immobilier : visite du bien, analyse comparative du marché, rapport d'expertise détaillé et valeur certifiée. Pour propriétaires, acquéreurs, banques, successions et procédures judiciaires nécessitant une évaluation fiable. À partir de 75 000 FCFA.",
  },
  {
    slug: "immo-audit-patrimoine",
    name: "Audit de Patrimoine Immobilier",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Audit complet de votre patrimoine immobilier : inventaire des biens, évaluation globale, analyse de la rentabilité de chaque actif, identification des optimisations fiscales et recommandations stratégiques. Pour particuliers et entreprises souhaitant optimiser la gestion et la performance de leur parc immobilier. À partir de 150 000 FCFA.",
  },
  {
    slug: "immo-montage-projet-immobilier",
    name: "Montage de Projet Immobilier",
    pricingType: "SERVICE",
    price: 300000,
    rate: 8,
    siteUrl: BASE,
    description: "Accompagnement complet pour le montage d'un projet immobilier : étude de faisabilité, business plan immobilier, recherche de financement, coordination des intervenants (architecte, notaire, entrepreneur) et suivi de la réalisation. Pour promoteurs et investisseurs souhaitant développer un projet immobilier de A à Z. Sur devis à partir de 300 000 FCFA.",
  },

  // ── Assistance Diaspora ────────────────────────────────────────────────
  {
    slug: "immo-assistance-diaspora",
    name: "Assistance Diaspora — Investissement Immobilier",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Service dédié aux Ivoiriens et Africains de la diaspora souhaitant investir dans l'immobilier en Côte d'Ivoire : recherche du bien à distance, vérification des titres, suivi des travaux, gestion locative et compte-rendu régulier. Pour la diaspora souhaitant construire ou acheter en Côte d'Ivoire en toute confiance, sans se déplacer. À partir de 100 000 FCFA.",
  },
  {
    slug: "immo-suivi-construction-diaspora",
    name: "Suivi de Construction pour la Diaspora",
    pricingType: "MONTHLY_SUB",
    price: 75000,
    rate: 10,
    siteUrl: BASE,
    description: "Supervision mensuelle de votre chantier de construction à distance : visites régulières du chantier, rapport photographique et vidéo, contrôle de la qualité des travaux, vérification de l'avancement et alerte en cas de problème. Pour membres de la diaspora ayant un projet de construction en Côte d'Ivoire et souhaitant en garder le contrôle. 75 000 FCFA/mois.",
  },

  // ── Régularisation Foncière ───────────────────────────────────────────
  {
    slug: "immo-regularisation-fonciere",
    name: "Régularisation Foncière & Obtention de Titres",
    pricingType: "SERVICE",
    price: 200000,
    rate: 10,
    siteUrl: BASE,
    description: "Accompagnement pour la sécurisation et la régularisation foncière : constitution du dossier de demande de titre foncier, suivi auprès des services des domaines, purge des droits coutumiers, bornage et obtention de l'Arrêté de Concession Définitive (ACD) ou du titre foncier. Pour propriétaires souhaitant sécuriser leur terrain en Côte d'Ivoire. À partir de 200 000 FCFA.",
  },
  {
    slug: "immo-morcellement-lotissement",
    name: "Morcellement & Lotissement",
    pricingType: "SERVICE",
    price: 250000,
    rate: 10,
    siteUrl: BASE,
    description: "Accompagnement pour le morcellement d'une grande parcelle en lots à vendre : étude technique, plan de lotissement, dossier administratif, bornage officiel et commercialisation des lots. Pour propriétaires fonciers souhaitant valoriser leur terrain en le divisant. Sur devis à partir de 250 000 FCFA.",
  },

  // ── Promotion Immobilière ─────────────────────────────────────────────
  {
    slug: "immo-commercialisation-programme",
    name: "Commercialisation de Programme Immobilier",
    pricingType: "SERVICE",
    price: 0,
    rate: 10,
    siteUrl: BASE,
    description: "Commercialisation de programmes immobiliers neufs pour le compte de promoteurs : stratégie marketing, diffusion des annonces, organisation des visites, gestion des réservations et suivi jusqu'à la signature des actes de vente. Commission à la vente uniquement. Pour promoteurs souhaitant externaliser la vente de leurs programmes. Commission sur vente — sans frais fixes.",
  },
  {
    slug: "immo-home-staging",
    name: "Home Staging & Valorisation du Bien",
    pricingType: "SERVICE",
    price: 50000,
    rate: 10,
    siteUrl: BASE,
    description: "Mise en valeur de votre bien avant la vente ou la mise en location : conseils de décoration, organisation de l'espace, petits travaux de rafraîchissement, shooting photo professionnel et visite virtuelle 3D. Un bien bien présenté se vend plus vite et plus cher. Pour propriétaires souhaitant maximiser l'attractivité de leur bien. À partir de 50 000 FCFA.",
  },
];

export async function POST() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const branch = await prisma.branch.findUnique({ where: { slug: "ibig-immo-trust" } });
  if (!branch) {
    return NextResponse.json(
      { error: "Branche IBIG IMMO TRUST introuvable. Synchronisez d'abord les branches." },
      { status: 404 }
    );
  }

  const knownSlugs = IMMO_PRODUCTS.map((p) => p.slug);

  const deleted = await prisma.product.deleteMany({
    where: {
      branchId: branch.id,
      slug: { notIn: knownSlugs },
      sales: { none: {} },
    },
  });

  let upserted = 0;
  for (const p of IMMO_PRODUCTS) {
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
    message: `${upserted} services IBIG IMMO TRUST synchronisés, ${deleted.count} doublon(s) supprimé(s).`,
  });
}

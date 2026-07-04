import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BASE = "https://intermark-business.com/immo";

const IMMO_PRODUCTS = [
  // â”€â”€ Gestion Locative â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "immo-gestion-locative",
    name: "Gestion Locative ComplÃ¨te",
    pricingType: "SERVICE",
    price: 30000,
    rate: 50,
    siteUrl: BASE,
    description: "Gestion locative intÃ©grale de votre bien immobilier : recherche et sÃ©lection du locataire, rÃ©daction du bail, Ã©tat des lieux d'entrÃ©e et de sortie, encaissement des loyers, suivi des rÃ©parations et reversement mensuel au propriÃ©taire. Pour propriÃ©taires bailleurs souhaitant valoriser leur patrimoine sans contrainte de gestion. Ã€ partir de 30 000 FCFA/mois ou 8% du loyer. Commission affiliÃ© : 1 mois de commission d'agence, versÃ© en 2 fois (une vente Ã  enregistrer par mois de mandat, 50% du mois Ã  chaque fois).",
  },
  {
    slug: "immo-recherche-locataire",
    name: "Recherche & SÃ©lection de Locataire",
    pricingType: "SERVICE",
    price: 50000,
    rate: 10,
    siteUrl: BASE,
    description: "Recherche et sÃ©lection rigoureuse d'un locataire solvable et sÃ©rieux : diffusion de l'annonce, visites accompagnÃ©es, vÃ©rification des dossiers (revenus, rÃ©fÃ©rences), sÃ©lection finale et rÃ©daction du contrat de bail. Pour propriÃ©taires souhaitant louer leur bien rapidement et en toute sÃ©curitÃ©. Ã€ partir de 50 000 FCFA.",
  },
  {
    slug: "immo-etat-des-lieux",
    name: "Ã‰tat des Lieux",
    pricingType: "SERVICE",
    price: 20000,
    rate: 10,
    siteUrl: BASE,
    description: "RÃ©alisation d'Ã©tats des lieux d'entrÃ©e et de sortie contradictoires et dÃ©taillÃ©s : constat photographique, rapport Ã©crit signÃ© par les deux parties, document lÃ©galement opposable en cas de litige. Pour propriÃ©taires et locataires souhaitant protÃ©ger leurs intÃ©rÃªts. 20 000 FCFA par Ã©tat des lieux.",
  },
  {
    slug: "immo-recouvrement-loyers",
    name: "Recouvrement de Loyers ImpayÃ©s",
    pricingType: "SERVICE",
    price: 40000,
    rate: 10,
    siteUrl: BASE,
    description: "Assistance au recouvrement de loyers impayÃ©s : mise en demeure, nÃ©gociation avec le locataire dÃ©faillant, procÃ©dures amiables et, si nÃ©cessaire, accompagnement dans les dÃ©marches juridiques. Pour propriÃ©taires confrontÃ©s Ã  des loyers en retard ou Ã  des locataires mauvais payeurs. Ã€ partir de 40 000 FCFA.",
  },

  // â”€â”€ Transactions ImmobiliÃ¨res â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "immo-vente-bien",
    name: "Vente de Bien Immobilier",
    pricingType: "SERVICE",
    price: 200000,
    rate: 10,
    siteUrl: BASE,
    description: "Accompagnement complet pour la vente de votre bien immobilier : estimation du prix de marchÃ©, diffusion de l'annonce, organisation des visites, nÃ©gociation avec les acquÃ©reurs, suivi du dossier jusqu'Ã  la signature chez le notaire. Pour propriÃ©taires souhaitant vendre rapidement et au meilleur prix. Commission : 5% du prix de vente, minimum 200 000 FCFA.",
  },
  {
    slug: "immo-achat-bien",
    name: "Accompagnement Achat Immobilier",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Accompagnement personnalisÃ© pour l'achat d'un bien immobilier : dÃ©finition du cahier des charges, recherche ciblÃ©e, visites, nÃ©gociation du prix, vÃ©rification des titres de propriÃ©tÃ© et suivi jusqu'Ã  la signature. Pour acquÃ©reurs souhaitant acheter en toute sÃ©curitÃ© sans mauvaise surprise. Ã€ partir de 150 000 FCFA.",
  },
  {
    slug: "immo-transaction-terrain",
    name: "Transaction FonciÃ¨re & Vente de Terrain",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Accompagnement pour l'achat et la vente de terrains : vÃ©rification du statut foncier, contrÃ´le des titres (ACD, titre foncier, arrÃªtÃ© de concession dÃ©finitive), bornage, nÃ©gociation et formalitÃ©s de transfert de propriÃ©tÃ©. Pour acheteurs et vendeurs de terrains souhaitant sÃ©curiser leur transaction fonciÃ¨re en CÃ´te d'Ivoire. Ã€ partir de 150 000 FCFA.",
  },
  {
    slug: "immo-location-commerciale",
    name: "Location de Locaux Commerciaux",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Recherche et mise en location de locaux commerciaux, bureaux et entrepÃ´ts : identification des locaux disponibles selon vos critÃ¨res, visites, nÃ©gociation des conditions du bail commercial et accompagnement jusqu'Ã  la remise des clÃ©s. Pour entrepreneurs et entreprises cherchant des locaux professionnels adaptÃ©s Ã  leur activitÃ©. Ã€ partir de 100 000 FCFA.",
  },

  // â”€â”€ Conseil en Investissement Immobilier â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "immo-conseil-investissement",
    name: "Conseil en Investissement Immobilier",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Conseil stratÃ©gique pour vos investissements immobiliers : analyse du marchÃ© local, identification des zones Ã  fort potentiel, Ã©valuation de la rentabilitÃ© locative, recommandations d'achat et structuration du plan de financement. Pour investisseurs souhaitant placer leur argent dans l'immobilier en toute connaissance de cause. Ã€ partir de 100 000 FCFA.",
  },
  {
    slug: "immo-expertise-evaluation",
    name: "Expertise & Ã‰valuation ImmobiliÃ¨re",
    pricingType: "SERVICE",
    price: 75000,
    rate: 10,
    siteUrl: BASE,
    description: "Estimation professionnelle de la valeur vÃ©nale ou locative d'un bien immobilier : visite du bien, analyse comparative du marchÃ©, rapport d'expertise dÃ©taillÃ© et valeur certifiÃ©e. Pour propriÃ©taires, acquÃ©reurs, banques, successions et procÃ©dures judiciaires nÃ©cessitant une Ã©valuation fiable. Ã€ partir de 75 000 FCFA.",
  },
  {
    slug: "immo-audit-patrimoine",
    name: "Audit de Patrimoine Immobilier",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Audit complet de votre patrimoine immobilier : inventaire des biens, Ã©valuation globale, analyse de la rentabilitÃ© de chaque actif, identification des optimisations fiscales et recommandations stratÃ©giques. Pour particuliers et entreprises souhaitant optimiser la gestion et la performance de leur parc immobilier. Ã€ partir de 150 000 FCFA.",
  },
  {
    slug: "immo-montage-projet-immobilier",
    name: "Montage de Projet Immobilier",
    pricingType: "SERVICE",
    price: 300000,
    rate: 8,
    siteUrl: BASE,
    description: "Accompagnement complet pour le montage d'un projet immobilier : Ã©tude de faisabilitÃ©, business plan immobilier, recherche de financement, coordination des intervenants (architecte, notaire, entrepreneur) et suivi de la rÃ©alisation. Pour promoteurs et investisseurs souhaitant dÃ©velopper un projet immobilier de A Ã  Z. Sur devis Ã  partir de 300 000 FCFA.",
  },

  // â”€â”€ Assistance Diaspora â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "immo-assistance-diaspora",
    name: "Assistance Diaspora â€” Investissement Immobilier",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Service dÃ©diÃ© aux Ivoiriens et Africains de la diaspora souhaitant investir dans l'immobilier en CÃ´te d'Ivoire : recherche du bien Ã  distance, vÃ©rification des titres, suivi des travaux, gestion locative et compte-rendu rÃ©gulier. Pour la diaspora souhaitant construire ou acheter en CÃ´te d'Ivoire en toute confiance, sans se dÃ©placer. Ã€ partir de 100 000 FCFA.",
  },
  {
    slug: "immo-suivi-construction-diaspora",
    name: "Suivi de Construction pour la Diaspora",
    pricingType: "SERVICE",
    price: 75000,
    rate: 10,
    siteUrl: BASE,
    description: "Supervision mensuelle de votre chantier de construction Ã  distance : visites rÃ©guliÃ¨res du chantier, rapport photographique et vidÃ©o, contrÃ´le de la qualitÃ© des travaux, vÃ©rification de l'avancement et alerte en cas de problÃ¨me. Pour membres de la diaspora ayant un projet de construction en CÃ´te d'Ivoire et souhaitant en garder le contrÃ´le. 75 000 FCFA/mois.",
  },

  // â”€â”€ RÃ©gularisation FonciÃ¨re â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "immo-regularisation-fonciere",
    name: "RÃ©gularisation FonciÃ¨re & Obtention de Titres",
    pricingType: "SERVICE",
    price: 200000,
    rate: 10,
    siteUrl: BASE,
    description: "Accompagnement pour la sÃ©curisation et la rÃ©gularisation fonciÃ¨re : constitution du dossier de demande de titre foncier, suivi auprÃ¨s des services des domaines, purge des droits coutumiers, bornage et obtention de l'ArrÃªtÃ© de Concession DÃ©finitive (ACD) ou du titre foncier. Pour propriÃ©taires souhaitant sÃ©curiser leur terrain en CÃ´te d'Ivoire. Ã€ partir de 200 000 FCFA.",
  },
  {
    slug: "immo-morcellement-lotissement",
    name: "Morcellement & Lotissement",
    pricingType: "SERVICE",
    price: 250000,
    rate: 10,
    siteUrl: BASE,
    description: "Accompagnement pour le morcellement d'une grande parcelle en lots Ã  vendre : Ã©tude technique, plan de lotissement, dossier administratif, bornage officiel et commercialisation des lots. Pour propriÃ©taires fonciers souhaitant valoriser leur terrain en le divisant. Sur devis Ã  partir de 250 000 FCFA.",
  },

  // â”€â”€ Promotion ImmobiliÃ¨re â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "immo-commercialisation-programme",
    name: "Commercialisation de Programme Immobilier",
    pricingType: "SERVICE",
    price: 0,
    rate: 10,
    siteUrl: BASE,
    description: "Commercialisation de programmes immobiliers neufs pour le compte de promoteurs : stratÃ©gie marketing, diffusion des annonces, organisation des visites, gestion des rÃ©servations et suivi jusqu'Ã  la signature des actes de vente. Commission Ã  la vente uniquement. Pour promoteurs souhaitant externaliser la vente de leurs programmes. Commission sur vente â€” sans frais fixes.",
  },
  {
    slug: "immo-home-staging",
    name: "Home Staging & Valorisation du Bien",
    pricingType: "SERVICE",
    price: 50000,
    rate: 10,
    siteUrl: BASE,
    description: "Mise en valeur de votre bien avant la vente ou la mise en location : conseils de dÃ©coration, organisation de l'espace, petits travaux de rafraÃ®chissement, shooting photo professionnel et visite virtuelle 3D. Un bien bien prÃ©sentÃ© se vend plus vite et plus cher. Pour propriÃ©taires souhaitant maximiser l'attractivitÃ© de leur bien. Ã€ partir de 50 000 FCFA.",
  },
];

export async function POST() {`n  try {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Non autorisÃ©" }, { status: 403 });
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
    message: `${upserted} services IBIG IMMO TRUST synchronisÃ©s, ${deleted.count} doublon(s) supprimÃ©(s).`,
  });
  } catch (err: any) {
    console.error("sync-immo error:", err);
    return NextResponse.json({ error: err?.message ?? "Erreur serveur" }, { status: 500 });
  }
}

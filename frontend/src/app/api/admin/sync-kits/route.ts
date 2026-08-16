import { NextResponse } from "next/server";
import { isSyncAuthorized } from "@/lib/sync-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type KitSeed = {
  branchSlug: string;
  title: string;
  type: "ARGUMENT" | "VISUAL";
  content: string;
  minStatus?: string;
};

const KITS: KitSeed[] = [
  // ── IBIG SOFT ──────────────────────────────────────────────────────────
  {
    branchSlug: "ibig-soft", title: "Argumentaire Scolaby", type: "ARGUMENT",
    content: "Scolaby digitalise la gestion de votre établissement scolaire : inscriptions en ligne, notes, bulletins automatiques, paiements et SMS parents. Dites adieu aux cahiers et aux erreurs. Abonnement dès 10 000 FCFA/mois (ou 100 000 FCFA/an, 2 mois offerts).",
  },
  {
    branchSlug: "ibig-soft", title: "Argumentaire IBIG Fleet 360", type: "ARGUMENT",
    content: "IBIG Fleet 360 est l'ERP de gestion de flotte pensé pour l'Afrique. Gérez vos véhicules, chauffeurs, maintenances, carburant et coûts depuis un seul tableau de bord. Abonnement dès 19 900 FCFA/mois (ou 199 000 FCFA/an, -10%).",
  },
  {
    branchSlug: "ibig-soft", title: "Argumentaire Lokativo", type: "ARGUMENT",
    content: "Lokativo digitalise la gestion locative des agences immobilières et syndics : baux, loyers, charges, quittances automatiques et portefeuille de biens centralisé. Dès 9 900 FCFA/mois (ou 99 900 FCFA/an, 2 mois offerts).",
  },
  {
    branchSlug: "ibig-soft", title: "Argumentaire GESCOMXEL", type: "ARGUMENT",
    content: "GESCOMXEL est votre logiciel de gestion commerciale tout-en-un : CRM, devis, factures, stocks et caisse. Idéal pour boutiques, pharmacies, supermarchés et PME. Démarrez à 5 000 FCFA/mois (ou 50 000 FCFA/an).",
  },
  {
    branchSlug: "ibig-soft", title: "Argumentaire Zelivry", type: "ARGUMENT",
    content: "Zelivry centralise toute votre activité de livraison : commandes, clients, livreurs, paiements et suivi en temps réel. La solution web sur mesure pour les startups de livraison africaines. Dès 4 900 FCFA/mois (ou 49 000 FCFA/an).",
  },
  {
    branchSlug: "ibig-soft", title: "Argumentaire STOCKFLOW ERP", type: "ARGUMENT",
    content: "STOCKFLOW ERP est un ERP commercial 100% cloud pour PME et distributeurs : stocks multi-dépôts, achats, ventes, facturation et reporting en temps réel. Dès 5 000 FCFA/mois (ou 50 000 FCFA/an).",
  },
  {
    branchSlug: "ibig-soft", title: "Visuel WhatsApp Scolaby", type: "VISUAL",
    content: "https://placehold.co/1080x1080/0b5fff/white?text=Scolaby+%E2%80%94+Gestion+Scolaire+SaaS",
  },

  // ── IBIG EDUFORM ─────────────────────────────────────────────────────
  {
    branchSlug: "ibig-eduform", title: "Argumentaire catalogue EDUFORM", type: "ARGUMENT",
    content: "Boostez votre carrière avec IBIG EDUFORM ! Plus de 25 formations certifiantes en comptabilité, RH, QHSE, logistique, Sage, SAP, Power BI et bien plus, en présentiel ou à distance. Tarifs de 22 500 à 475 000 FCFA selon le programme.",
  },
  {
    branchSlug: "ibig-eduform", title: "Argumentaire DAF Dirigeant", type: "ARGUMENT",
    content: "La formation DAF Dirigeant d'IBIG EDUFORM est la référence pour les directeurs financiers en Afrique. 100 heures de formation intensive avec experts-comptables et directeurs financiers confirmés. Inscriptions ouvertes !",
  },
  {
    branchSlug: "ibig-eduform", title: "Argumentaire Sage 100", type: "ARGUMENT",
    content: "Maîtrisez Sage 100 en 7 heures de formation intensive ! Comptabilité, Paie & RH ou GESCOM — choisissez votre module. Certification à la clé, formation pratique sur cas réels. Dès 22 500 FCFA.",
  },
  {
    branchSlug: "ibig-eduform", title: "Argumentaire Formation Sur Mesure Entreprise", type: "ARGUMENT",
    content: "Vous connaissez un DRH ou un dirigeant qui veut former toute son équipe ? IBIG EDUFORM conçoit un programme sur mesure adapté au métier de l'entreprise, en présentiel ou à distance, y compris pour la diaspora. Sur devis à partir de 500 000 FCFA.",
  },
  {
    branchSlug: "ibig-eduform", title: "Visuel formations EDUFORM", type: "VISUAL",
    content: "https://placehold.co/1080x1080/6d28d9/white?text=IBIG+EDUFORM+%E2%80%94+Formations+Certifiantes",
  },

  // ── IBIG IMMO TRUST ──────────────────────────────────────────────────
  {
    branchSlug: "ibig-immo-trust", title: "Argumentaire Gestion Locative", type: "ARGUMENT",
    content: "Confiez votre bien à IBIG IMMO TRUST et percevez vos loyers sans stress. Gestion locative garantie : nous trouvons les locataires, encaissons les loyers et vous reversons chaque mois. Couverture : Abidjan, Bingerville, Grand Bassam, Yamoussoukro.",
  },
  {
    branchSlug: "ibig-immo-trust", title: "Argumentaire Vente de Bien Immobilier", type: "ARGUMENT",
    content: "Vous connaissez quelqu'un qui veut vendre une maison, un terrain ou un appartement ? IBIG IMMO TRUST s'occupe de tout : estimation, diffusion, visites, négociation jusqu'à la signature chez le notaire. Un vendeur rapide et sécurisé.",
  },
  {
    branchSlug: "ibig-immo-trust", title: "Argumentaire Diaspora", type: "ARGUMENT",
    content: "Vous êtes en Europe, aux USA ou au Canada et souhaitez construire ou investir en Côte d'Ivoire ? IBIG IMMO TRUST gère tout à distance : suivi de chantier photographié, équipes sélectionnées, budget maîtrisé et compte-rendu régulier.",
  },

  // ── IBIG MARKET ──────────────────────────────────────────────────────
  {
    branchSlug: "ibig-market", title: "Argumentaire IBIG MARKET", type: "ARGUMENT",
    content: "IBIG MARKET : votre partenaire d'approvisionnement professionnel à Abidjan. Matériel informatique, mobilier de bureau, fournitures et équipements BTP. Livraison rapide, paiement Mobile Money, Wave ou carte. Devis B2B personnalisé disponible.",
  },

  // ── IBIG DIGITAL ─────────────────────────────────────────────────────
  {
    branchSlug: "ibig-digital", title: "Argumentaire Site Vitrine", type: "ARGUMENT",
    content: "Votre contact n'a pas encore de site web professionnel ? IBIG DIGITAL crée des sites vitrines modernes qui inspirent confiance et génèrent des contacts, avec identité visuelle et référencement de base inclus.",
  },
  {
    branchSlug: "ibig-digital", title: "Argumentaire Community Management", type: "ARGUMENT",
    content: "Une entreprise qui néglige ses réseaux sociaux perd des clients face à la concurrence. IBIG DIGITAL prend en charge la création de contenu, la publication et l'animation des pages Facebook/Instagram, en mensualisé.",
  },

  // ── IBIG DIGITAL KITS ────────────────────────────────────────────────
  {
    branchSlug: "ibig-digital-kits", title: "Argumentaire Kits Numériques", type: "ARGUMENT",
    content: "IBIG DIGITAL KITS propose des kits numériques prêts à l'emploi (identité visuelle, supports, présence en ligne) pour lancer ou moderniser une activité rapidement, sans complexité technique.",
  },
  {
    branchSlug: "ibig-digital-kits", title: "Argumentaire Chatbot & IA", type: "ARGUMENT",
    content: "Une entreprise qui répond lentement à ses clients sur WhatsApp perd des ventes. IBIG DIGITAL KITS installe un chatbot IA qui répond 24h/24, qualifie les demandes et transmet les leads chauds à l'équipe commerciale.",
  },

  // ── IBIG CONSEIL+ ────────────────────────────────────────────────────
  {
    branchSlug: "ibig-conseil-plus", title: "Argumentaire Création d'Entreprise", type: "ARGUMENT",
    content: "Votre contact veut se lancer mais ne sait pas par où commencer ? IBIG CONSEIL+ l'accompagne de A à Z : choix du statut juridique, formalités RCCM, ouverture de compte, jusqu'au démarrage effectif de l'activité.",
  },
  {
    branchSlug: "ibig-conseil-plus", title: "Argumentaire Audit Organisationnel", type: "ARGUMENT",
    content: "Une entreprise qui grandit vite perd souvent en efficacité. IBIG CONSEIL+ réalise un audit organisationnel complet et propose un plan d'action concret pour structurer les process, les rôles et la gouvernance.",
  },

  // ── IBIG PARTNERS ────────────────────────────────────────────────────
  {
    branchSlug: "ibig-partners-branch", title: "Argumentaire pour recruter un filleul", type: "ARGUMENT",
    content: "Rejoins IBIG PARTNERS : inscription gratuite, aucun investissement, tu gagnes une commission sur tes ventes ET sur celles de ton équipe (3 niveaux). Formations et outils marketing fournis, paiement sous 7 jours. Un vrai revenu complémentaire.",
  },

  // ── IBIG MULTISERVICES ───────────────────────────────────────────────
  {
    branchSlug: "ibig-multiservices", title: "Argumentaire Organisation Événementielle", type: "ARGUMENT",
    content: "Mariage, séminaire d'entreprise, anniversaire : IBIG MULTISERVICES organise l'événement de A à Z (lieu, traiteur, décoration, logistique) pour que votre contact n'ait plus qu'à profiter du jour J.",
  },
  {
    branchSlug: "ibig-multiservices", title: "Argumentaire Placement de Personnel", type: "ARGUMENT",
    content: "Une entreprise qui cherche du personnel qualifié ou des ouvriers de chantier fiables ? IBIG MULTISERVICES présélectionne et place des candidats vérifiés, du personnel domestique aux cadres qualifiés.",
  },
];

export async function POST() {
  if (!(await isSyncAuthorized())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const branches = await prisma.branch.findMany({ select: { id: true, slug: true } });
  const branchIdBySlug = new Map(branches.map((b) => [b.slug, b.id]));

  // On repart d'une base propre pour éviter les doublons entre synchronisations successives.
  await prisma.marketingKit.deleteMany({});

  const skipped: string[] = [];
  const toCreate = KITS.filter((k) => {
    const ok = branchIdBySlug.has(k.branchSlug);
    if (!ok) skipped.push(k.branchSlug);
    return ok;
  });
  await Promise.all(
    toCreate.map((k) =>
      prisma.marketingKit.create({
        data: {
          branchId: branchIdBySlug.get(k.branchSlug)!,
          title: k.title,
          type: k.type,
          content: k.content,
          minStatus: k.minStatus ?? "STARTER",
        },
      })
    )
  );
  const created = toCreate.length;

  return NextResponse.json({
    ok: true,
    created,
    skipped,
    message: `${created} ressource(s) de kit marketing synchronisée(s) sur les 9 branches.${skipped.length ? ` Branches introuvables : ${skipped.join(", ")}.` : ""}`,
  });
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
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
  // â”€â”€ IBIG SOFT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    branchSlug: "ibig-soft", title: "Argumentaire Scolaby", type: "ARGUMENT",
    content: "Scolaby digitalise la gestion de votre Ã©tablissement scolaire : inscriptions en ligne, notes, bulletins automatiques, paiements et SMS parents. Dites adieu aux cahiers et aux erreurs. Abonnement dÃ¨s 10 000 FCFA/mois (ou 100 000 FCFA/an, 2 mois offerts).",
  },
  {
    branchSlug: "ibig-soft", title: "Argumentaire IBIG Fleet 360", type: "ARGUMENT",
    content: "IBIG Fleet 360 est l'ERP de gestion de flotte pensÃ© pour l'Afrique. GÃ©rez vos vÃ©hicules, chauffeurs, maintenances, carburant et coÃ»ts depuis un seul tableau de bord. Abonnement dÃ¨s 19 900 FCFA/mois (ou 199 000 FCFA/an, -10%).",
  },
  {
    branchSlug: "ibig-soft", title: "Argumentaire Lokativo", type: "ARGUMENT",
    content: "Lokativo digitalise la gestion locative des agences immobiliÃ¨res et syndics : baux, loyers, charges, quittances automatiques et portefeuille de biens centralisÃ©. DÃ¨s 9 900 FCFA/mois (ou 99 900 FCFA/an, 2 mois offerts).",
  },
  {
    branchSlug: "ibig-soft", title: "Argumentaire GESCOMXEL", type: "ARGUMENT",
    content: "GESCOMXEL est votre logiciel de gestion commerciale tout-en-un : CRM, devis, factures, stocks et caisse. IdÃ©al pour boutiques, pharmacies, supermarchÃ©s et PME. DÃ©marrez Ã  5 000 FCFA/mois (ou 50 000 FCFA/an).",
  },
  {
    branchSlug: "ibig-soft", title: "Argumentaire Zelivry", type: "ARGUMENT",
    content: "Zelivry centralise toute votre activitÃ© de livraison : commandes, clients, livreurs, paiements et suivi en temps rÃ©el. La solution web sur mesure pour les startups de livraison africaines. DÃ¨s 4 900 FCFA/mois (ou 49 000 FCFA/an).",
  },
  {
    branchSlug: "ibig-soft", title: "Argumentaire STOCKFLOW ERP", type: "ARGUMENT",
    content: "STOCKFLOW ERP est un ERP commercial 100% cloud pour PME et distributeurs : stocks multi-dÃ©pÃ´ts, achats, ventes, facturation et reporting en temps rÃ©el. DÃ¨s 5 000 FCFA/mois (ou 50 000 FCFA/an).",
  },
  {
    branchSlug: "ibig-soft", title: "Visuel WhatsApp Scolaby", type: "VISUAL",
    content: "https://placehold.co/1080x1080/0b5fff/white?text=Scolaby+%E2%80%94+Gestion+Scolaire+SaaS",
  },

  // â”€â”€ IBIG EDUFORM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    branchSlug: "ibig-eduform", title: "Argumentaire catalogue EDUFORM", type: "ARGUMENT",
    content: "Boostez votre carriÃ¨re avec IBIG EDUFORM ! Plus de 25 formations certifiantes en comptabilitÃ©, RH, QHSE, logistique, Sage, SAP, Power BI et bien plus, en prÃ©sentiel ou Ã  distance. Tarifs de 22 500 Ã  475 000 FCFA selon le programme.",
  },
  {
    branchSlug: "ibig-eduform", title: "Argumentaire DAF Dirigeant", type: "ARGUMENT",
    content: "La formation DAF Dirigeant d'IBIG EDUFORM est la rÃ©fÃ©rence pour les directeurs financiers en Afrique. 100 heures de formation intensive avec experts-comptables et directeurs financiers confirmÃ©s. Inscriptions ouvertes !",
  },
  {
    branchSlug: "ibig-eduform", title: "Argumentaire Sage 100", type: "ARGUMENT",
    content: "MaÃ®trisez Sage 100 en 7 heures de formation intensive ! ComptabilitÃ©, Paie & RH ou GESCOM â€” choisissez votre module. Certification Ã  la clÃ©, formation pratique sur cas rÃ©els. DÃ¨s 22 500 FCFA.",
  },
  {
    branchSlug: "ibig-eduform", title: "Argumentaire Formation Sur Mesure Entreprise", type: "ARGUMENT",
    content: "Vous connaissez un DRH ou un dirigeant qui veut former toute son Ã©quipe ? IBIG EDUFORM conÃ§oit un programme sur mesure adaptÃ© au mÃ©tier de l'entreprise, en prÃ©sentiel ou Ã  distance, y compris pour la diaspora. Sur devis Ã  partir de 500 000 FCFA.",
  },
  {
    branchSlug: "ibig-eduform", title: "Visuel formations EDUFORM", type: "VISUAL",
    content: "https://placehold.co/1080x1080/6d28d9/white?text=IBIG+EDUFORM+%E2%80%94+Formations+Certifiantes",
  },

  // â”€â”€ IBIG IMMO TRUST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    branchSlug: "ibig-immo-trust", title: "Argumentaire Gestion Locative", type: "ARGUMENT",
    content: "Confiez votre bien Ã  IBIG IMMO TRUST et percevez vos loyers sans stress. Gestion locative garantie : nous trouvons les locataires, encaissons les loyers et vous reversons chaque mois. Couverture : Abidjan, Bingerville, Grand Bassam, Yamoussoukro.",
  },
  {
    branchSlug: "ibig-immo-trust", title: "Argumentaire Vente de Bien Immobilier", type: "ARGUMENT",
    content: "Vous connaissez quelqu'un qui veut vendre une maison, un terrain ou un appartement ? IBIG IMMO TRUST s'occupe de tout : estimation, diffusion, visites, nÃ©gociation jusqu'Ã  la signature chez le notaire. Un vendeur rapide et sÃ©curisÃ©.",
  },
  {
    branchSlug: "ibig-immo-trust", title: "Argumentaire Diaspora", type: "ARGUMENT",
    content: "Vous Ãªtes en Europe, aux USA ou au Canada et souhaitez construire ou investir en CÃ´te d'Ivoire ? IBIG IMMO TRUST gÃ¨re tout Ã  distance : suivi de chantier photographiÃ©, Ã©quipes sÃ©lectionnÃ©es, budget maÃ®trisÃ© et compte-rendu rÃ©gulier.",
  },

  // â”€â”€ IBIG MARKET â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    branchSlug: "ibig-market", title: "Argumentaire IBIG MARKET", type: "ARGUMENT",
    content: "IBIG MARKET : votre partenaire d'approvisionnement professionnel Ã  Abidjan. MatÃ©riel informatique, mobilier de bureau, fournitures et Ã©quipements BTP. Livraison rapide, paiement Mobile Money, Wave ou carte. Devis B2B personnalisÃ© disponible.",
  },

  // â”€â”€ IBIG DIGITAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    branchSlug: "ibig-digital", title: "Argumentaire Site Vitrine", type: "ARGUMENT",
    content: "Votre contact n'a pas encore de site web professionnel ? IBIG DIGITAL crÃ©e des sites vitrines modernes qui inspirent confiance et gÃ©nÃ¨rent des contacts, avec identitÃ© visuelle et rÃ©fÃ©rencement de base inclus.",
  },
  {
    branchSlug: "ibig-digital", title: "Argumentaire Community Management", type: "ARGUMENT",
    content: "Une entreprise qui nÃ©glige ses rÃ©seaux sociaux perd des clients face Ã  la concurrence. IBIG DIGITAL prend en charge la crÃ©ation de contenu, la publication et l'animation des pages Facebook/Instagram, en mensualisÃ©.",
  },

  // â”€â”€ IBIG DIGITAL KITS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    branchSlug: "ibig-digital-kits", title: "Argumentaire Kits NumÃ©riques", type: "ARGUMENT",
    content: "IBIG DIGITAL KITS propose des kits numÃ©riques prÃªts Ã  l'emploi (identitÃ© visuelle, supports, prÃ©sence en ligne) pour lancer ou moderniser une activitÃ© rapidement, sans complexitÃ© technique.",
  },
  {
    branchSlug: "ibig-digital-kits", title: "Argumentaire Chatbot & IA", type: "ARGUMENT",
    content: "Une entreprise qui rÃ©pond lentement Ã  ses clients sur WhatsApp perd des ventes. IBIG DIGITAL KITS installe un chatbot IA qui rÃ©pond 24h/24, qualifie les demandes et transmet les leads chauds Ã  l'Ã©quipe commerciale.",
  },

  // â”€â”€ IBIG CONSEIL+ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    branchSlug: "ibig-conseil-plus", title: "Argumentaire CrÃ©ation d'Entreprise", type: "ARGUMENT",
    content: "Votre contact veut se lancer mais ne sait pas par oÃ¹ commencer ? IBIG CONSEIL+ l'accompagne de A Ã  Z : choix du statut juridique, formalitÃ©s RCCM, ouverture de compte, jusqu'au dÃ©marrage effectif de l'activitÃ©.",
  },
  {
    branchSlug: "ibig-conseil-plus", title: "Argumentaire Audit Organisationnel", type: "ARGUMENT",
    content: "Une entreprise qui grandit vite perd souvent en efficacitÃ©. IBIG CONSEIL+ rÃ©alise un audit organisationnel complet et propose un plan d'action concret pour structurer les process, les rÃ´les et la gouvernance.",
  },

  // â”€â”€ IBIG PARTNERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    branchSlug: "ibig-partners-branch", title: "Argumentaire pour recruter un filleul", type: "ARGUMENT",
    content: "Rejoins IBIG PARTNERS : inscription gratuite, aucun investissement, tu gagnes une commission sur tes ventes ET sur celles de ton Ã©quipe (3 niveaux). Formations et outils marketing fournis, paiement sous 7 jours. Un vrai revenu complÃ©mentaire.",
  },

  // â”€â”€ IBIG MULTISERVICES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    branchSlug: "ibig-multiservices", title: "Argumentaire Organisation Ã‰vÃ©nementielle", type: "ARGUMENT",
    content: "Mariage, sÃ©minaire d'entreprise, anniversaire : IBIG MULTISERVICES organise l'Ã©vÃ©nement de A Ã  Z (lieu, traiteur, dÃ©coration, logistique) pour que votre contact n'ait plus qu'Ã  profiter du jour J.",
  },
  {
    branchSlug: "ibig-multiservices", title: "Argumentaire Placement de Personnel", type: "ARGUMENT",
    content: "Une entreprise qui cherche du personnel qualifiÃ© ou des ouvriers de chantier fiables ? IBIG MULTISERVICES prÃ©sÃ©lectionne et place des candidats vÃ©rifiÃ©s, du personnel domestique aux cadres qualifiÃ©s.",
  },
];

export async function POST() {`n  try {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Non autorisÃ©" }, { status: 403 });
  }

  const branches = await prisma.branch.findMany({ select: { id: true, slug: true } });
  const branchIdBySlug = new Map(branches.map((b) => [b.slug, b.id]));

  // On repart d'une base propre pour Ã©viter les doublons entre synchronisations successives.
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
    message: `${created} ressource(s) de kit marketing synchronisÃ©e(s) sur les 9 branches.${skipped.length ? ` Branches introuvables : ${skipped.join(", ")}.` : ""}`,
  });
  } catch (err: any) {
    console.error("sync-kits error:", err);
    return NextResponse.json({ error: err?.message ?? "Erreur serveur" }, { status: 500 });
  }
}

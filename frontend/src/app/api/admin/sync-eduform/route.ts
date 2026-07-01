import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const EDUFORM_PRODUCTS = [
  {
    slug: "eduform-compta-finance-4en1",
    name: "Comptabilité & Finance 4 en 1",
    pricingType: "COURSE",
    price: 400000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/comptabilite-et-finance-4-en-1",
    description: "Certificat 4 en 1 — Comptabilité Professionnelle, Finance et Gestion (65h). Programme formant des experts comptables et financiers immédiatement opérationnels avec 4 certificats distincts : Comptable Professionnel, Chef Comptable, Responsable Financier et Comptabilité ONG (SYCEBNL), avec initiation SAP FI & CO. Conforme SYSCOHADA. Idéal pour : comptables, responsables financiers, gestionnaires ONG, entrepreneurs. À partir de 400 000 FCFA en ligne.",
  },
  {
    slug: "eduform-daf-dirigeant",
    name: "DAF Dirigeant",
    pricingType: "COURSE",
    price: 450000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/daf-dirigeant",
    description: "Certificat au Métier de Directeur Administratif & Financier (100h). Formation intensive transformant des profils comptables et financiers en DAF opérationnels, capables de piloter la fonction financière et d'accompagner la direction générale dans ses décisions stratégiques. 11 modules : vision DAF, reporting avancé, contrôle de gestion, analyse financière, trésorerie, droit des affaires, audit interne, outils numériques (ERP, Power BI), finance durable. Prérequis : Bac+3 et 3 ans d'expérience. À partir de 450 000 FCFA en ligne.",
  },
  {
    slug: "eduform-expert-rh-3en1",
    name: "Expert RH 3 en 1 — RH, Paie & Data Analytics",
    pricingType: "COURSE",
    price: 450000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/grh-expert-3-en-1",
    description: "Programme certifiant 3 en 1 — RH, Paie & Data Analytics (55h). Trois certificats en un seul parcours : Gestion Stratégique des RH & Administration du Personnel, Paie & Droit du Travail avec Sage 100 Paie, et HR Analytics avec Power BI. Idéal pour : gestionnaires RH, responsables administratifs, gestionnaires de paie, entrepreneurs, cadres souhaitant évoluer vers les RH. À partir de 450 000 FCFA en ligne.",
  },
  {
    slug: "eduform-audit-controle-4en1",
    name: "Audit & Contrôle de Gestion 4 en 1",
    pricingType: "COURSE",
    price: 375000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/audit-et-controle-de-gestion-4-en-1",
    description: "Programme certifiant 4 en 1 — Audit & Contrôle de Gestion (65h). Quatre certificats : Audit Interne (méthodologie IIA, COSO, détection fraudes), Contrôle de Gestion (budget, tableaux de bord, KPI), Audit Comptable & Financier (révision cycle par cycle, SYSCOHADA/IFRS) et Gestion des Risques (cartographie ISO 31000). Pour : comptables, contrôleurs de gestion, auditeurs, responsables financiers. À partir de 375 000 FCFA en ligne.",
  },
  {
    slug: "eduform-marches-publics-3en1",
    name: "Marchés Publics & Gestion des Achats 3 en 1",
    pricingType: "COURSE",
    price: 275000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/passation-des-marches-publics-et-gestion-des-achats-3-en-1",
    description: "Programme certifiant 3 en 1 — Marchés Publics & Achats (55h). Trois certificats : Passation des Marchés Publics (procédures, réglementation), Gestion des Contrats et Achats & Approvisionnements (gestion des fournisseurs). Destiné aux responsables achats, acheteurs, agents de l'État et des collectivités, ONG et projets financés. À partir de 275 000 FCFA en ligne.",
  },
  {
    slug: "eduform-projets-humanitaires-3en1",
    name: "Gestion de Projets Humanitaires & ONG 3 en 1",
    pricingType: "COURSE",
    price: 275000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/gestion-et-management-de-projets-humanitaires-et-ong-3-en-1",
    description: "Programme certifiant 3 en 1 — Projets Humanitaires & ONG (55h). Trois certificats : Gestion de Projet Humanitaire, ONG & Développement et Management de Projet. Pour coordinateurs de projets, agents de développement, responsables de programmes ONG, associations et consultants en développement. À partir de 275 000 FCFA en ligne.",
  },
  {
    slug: "eduform-immobilier-3en1",
    name: "Immobilier Professionnel 3 en 1",
    pricingType: "COURSE",
    price: 450000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/immobilier-professionnel-3-en-1",
    description: "Parcours certifiant 3 en 1 — Immobilier Professionnel (65h). Trois niveaux progressifs : Praticien (Gestion Immobilière & Cadre Juridique OHADA, droit foncier, gestion locative), Opérateur (Transaction, Promotion & Montage d'Opérations, VEFA, commercialisation) et Expert (Expertise, Évaluation & Conseil en Investissement, due diligence). Pour agents immobiliers, courtiers, promoteurs, investisseurs, juristes. À partir de 450 000 FCFA en ligne.",
  },
  {
    slug: "eduform-logistique-supply-chain-4en1",
    name: "Logistique & Supply Chain Management 4 en 1",
    pricingType: "COURSE",
    price: 425000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/logistique-et-supply-chain-management-4-en-1",
    description: "Programme certifiant 4 en 1 — Logistique & Supply Chain (65h). Quatre certificats : Gestion des Stocks, Gestion des Entrepôts, Logistique et Approvisionnements. Pour gestionnaires de stocks, logisticiens, responsables entrepôts, responsables achats, supply chain managers et étudiants en logistique. À partir de 425 000 FCFA en ligne.",
  },
  {
    slug: "eduform-qhse-4en1",
    name: "QHSE Expert 4 en 1",
    pricingType: "COURSE",
    price: 325000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/qhse-expert-4-en-1",
    description: "Programme certifiant QHSE 4 en 1 (65h). Quatre certificats : Animateur HSE, Superviseur HSE, Responsable QHSE et Auditeur ISO. Spécialement conçu pour les secteurs BTP, industrie, mines et pétrole. Pour animateurs, superviseurs et responsables HSE, chefs de chantier, ingénieurs et techniciens souhaitant évoluer ou se spécialiser en qualité, hygiène, sécurité et environnement. À partir de 325 000 FCFA en ligne.",
  },
  {
    slug: "eduform-ia-professionnels",
    name: "Intelligence Artificielle pour Professionnels",
    pricingType: "COURSE",
    price: 22500,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/intelligence-artificielle-pour-professionnels",
    description: "Formation Samedi Pro — IA pour Professionnels (7h). Maîtriser les principaux outils d'intelligence artificielle : Claude, ChatGPT, Gemini, Microsoft Copilot et l'automatisation des tâches. Avec bonus : support de cours, groupe d'entraide, accompagnement post-formation et attestation valorisable au CV. Pour tous professionnels, entrepreneurs, consultants et étudiants. À partir de 22 500 FCFA en ligne.",
  },
  {
    slug: "eduform-sage100-comptabilite",
    name: "Sage 100 Comptabilité",
    pricingType: "COURSE",
    price: 25000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/sage-100-comptabilite",
    description: "Formation pratique Sage 100 Comptabilité (7h — 1 journée). Du paramétrage du dossier à la production des états financiers conformes SYSCOHADA. 100 % pratique, immédiatement opérationnel. Pour comptables, assistants comptables, chefs comptables, entrepreneurs gérant leur comptabilité sur Sage. Aucune connaissance préalable de Sage requise. À partir de 25 000 FCFA en ligne.",
  },
  {
    slug: "eduform-sage100-paie-rh",
    name: "Sage 100 Paie & RH",
    pricingType: "COURSE",
    price: 22500,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/sage-100-paie-et-rh",
    description: "Formation pratique Sage 100 Paie & RH (7h — 1 journée). Gérer la paie en toute autonomie : paramétrage du dossier de paie, édition de bulletins fiables et production des déclarations sociales conformes à la réglementation ivoirienne. Pour gestionnaires de paie, assistants RH, comptables, dirigeants de PME. À partir de 22 500 FCFA en ligne.",
  },
  {
    slug: "eduform-power-bi",
    name: "Microsoft Power BI",
    pricingType: "COURSE",
    price: 31500,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/microsoft-power-bi",
    description: "Formation Microsoft Power BI (14h) — Analyse de données, Dashboards & Reporting professionnel. Concevoir des tableaux de bord interactifs et des rapports visuels pour piloter l'activité. Pour analystes, contrôleurs de gestion, comptables, managers et consultants souhaitant exploiter leurs données efficacement. À partir de 31 500 FCFA en ligne.",
  },
  {
    slug: "eduform-microsoft-project",
    name: "Microsoft Project",
    pricingType: "COURSE",
    price: 22500,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/microsoft-project",
    description: "Formation Microsoft Project (7h — 1 journée). Planification de projets, création de diagrammes de Gantt et suivi opérationnel de projets avec Microsoft Project. Pour chefs de projet, coordinateurs et consultants souhaitant structurer et piloter leurs projets avec un outil professionnel. À partir de 22 500 FCFA en ligne.",
  },
  {
    slug: "eduform-sap-fi",
    name: "SAP FI — Comptabilité Financière",
    pricingType: "COURSE",
    price: 36000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/sap-fi-comptabilite-financiere",
    description: "Formation SAP FI — Comptabilité Financière (14h). Maîtriser la comptabilité générale, les comptes clients, les comptes fournisseurs et le reporting financier dans l'environnement SAP. Pour comptables, chefs comptables, responsables administratifs et financiers (RAF), et consultants SAP débutants. À partir de 36 000 FCFA en ligne.",
  },
  {
    slug: "eduform-canva-pro",
    name: "Canva Pro & Design Marketing",
    pricingType: "COURSE",
    price: 22500,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/canva-pro-et-design-marketing",
    description: "Formation Samedi Pro — Canva Pro & Design Marketing (7h). Créer des flyers professionnels, des visuels pour les réseaux sociaux, des présentations percutantes et exploiter les fonctionnalités IA de Canva Pro. Pour community managers, marketeurs, communicants et entrepreneurs souhaitant produire des contenus visuels de qualité sans être graphiste. À partir de 22 500 FCFA en ligne.",
  },
  {
    slug: "eduform-kobotoolbox",
    name: "KoBoToolbox & Collecte de Données",
    pricingType: "COURSE",
    price: 27000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/kobotoolbox-et-collecte-de-donnees",
    description: "Formation KoBoToolbox & Collecte de Données (14h). Maîtriser la conception d'enquêtes, la collecte de données sur mobile et l'analyse des résultats avec KoBoToolbox, l'outil de référence des ONG et organismes de recherche. Pour ONG, consultants, statisticiens, enquêteurs et chercheurs souhaitant digitaliser leur collecte terrain. Attestation IBIG EDUFORM incluse. À partir de 27 000 FCFA en ligne.",
  },
  {
    slug: "eduform-sage100-gescom",
    name: "Sage 100 GESCOM",
    pricingType: "COURSE",
    price: 22500,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/sage-100-gescom",
    description: "Formation pratique Sage 100 GESCOM (7h — 1 journée). Maîtriser les achats, les ventes, la gestion des stocks et la facturation dans Sage 100. Formation 100 % pratique, opérationnelle dès la sortie. Pour commerciaux, gestionnaires de stocks et responsables commerciaux souhaitant automatiser leur gestion avec Sage. À partir de 22 500 FCFA en ligne.",
  },
  {
    slug: "eduform-sage-etats-fiscaux",
    name: "Sage États Comptables & Fiscaux",
    pricingType: "COURSE",
    price: 22500,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/sage-etats-comptables-et-fiscaux",
    description: "Formation Samedi Pro — Sage États Comptables & Fiscaux (7h). Maîtriser la production des états financiers et des déclarations fiscales avec le logiciel Sage. Formation pratique et directement applicable. Pour comptables, chefs comptables, responsables administratifs et financiers (RAF) et fiscalistes. À partir de 22 500 FCFA en ligne.",
  },

  // ── Formats complémentaires (entreprise, présentiel, international) ──────
  {
    slug: "eduform-sur-mesure-entreprise",
    name: "Formation Sur Mesure Entreprise",
    pricingType: "SERVICE",
    price: 500000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/entreprise",
    description: "Programme de formation conçu sur mesure pour répondre aux besoins spécifiques d'une entreprise, d'une administration ou d'une ONG : diagnostic des besoins, choix des modules et intervenants, adaptation du contenu et du rythme au contexte métier. Pour directions RH, dirigeants et responsables de formation souhaitant former une équipe sur une problématique précise plutôt qu'un programme standard. Sur devis, à partir de 500 000 FCFA.",
  },
  {
    slug: "eduform-intra-entreprise-presentiel",
    name: "Formation Intra-Entreprise en Présentiel",
    pricingType: "SERVICE",
    price: 350000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/entreprise",
    description: "Session de formation dispensée en présentiel directement dans les locaux de l'entreprise (ou dans une salle dédiée), pour un groupe de collaborateurs. Formateur dédié, supports adaptés, mises en situation pratiques sur les outils et process de l'entreprise. Pour les entreprises souhaitant former plusieurs collaborateurs en même temps sans les déplacer. Sur devis selon effectif et durée, à partir de 350 000 FCFA par session.",
  },
  {
    slug: "eduform-formation-internationale-diaspora",
    name: "Formation à Distance — International & Diaspora",
    pricingType: "COURSE",
    price: 450000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Accès à l'ensemble du catalogue de formations certifiantes IBIG EDUFORM en 100 % à distance (visioconférence en direct + replay), pensé pour les Ivoiriens et Africains de la diaspora ou les professionnels basés hors de Côte d'Ivoire. Fuseaux horaires aménagés, paiement international (carte bancaire, virement, Mobile Money), certificat envoyé numériquement. Pour la diaspora et les clients internationaux souhaitant se former à distance sans contrainte de présence physique. À partir de 450 000 FCFA.",
  },
  {
    slug: "eduform-coaching-particulier",
    name: "Coaching Individuel & Formation Particulier",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Accompagnement individuel personnalisé (1 à 1) sur une compétence précise : comptabilité, bureautique, Sage, gestion, préparation d'entretien ou de concours. Rythme et contenu adaptés au niveau et aux disponibilités de l'apprenant, en présentiel ou à distance. Pour particuliers, étudiants et professionnels souhaitant progresser rapidement sur un besoin ciblé sans suivre un programme de groupe. À partir de 150 000 FCFA.",
  },
];

export async function POST() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  // Trouver la branche IBIG EDUFORM
  const branch = await prisma.branch.findUnique({ where: { slug: "ibig-eduform" } });
  if (!branch) {
    return NextResponse.json({ error: "Branche IBIG EDUFORM introuvable. Synchronisez d'abord les branches." }, { status: 404 });
  }

  const knownSlugs = EDUFORM_PRODUCTS.map((p) => p.slug);

  // Supprimer tous les produits de la branche qui ne sont pas dans notre liste officielle
  // (évite les doublons créés manuellement avec des slugs différents)
  const deleted = await prisma.product.deleteMany({
    where: {
      branchId: branch.id,
      slug: { notIn: knownSlugs },
      // Ne supprimer que ceux sans ventes enregistrées
      sales: { none: {} },
    },
  });

  let upserted = 0;
  for (const p of EDUFORM_PRODUCTS) {
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
    message: `${upserted} formations synchronisées, ${deleted.count} doublon(s) supprimé(s).`,
  });
}

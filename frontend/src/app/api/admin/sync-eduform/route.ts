import { NextResponse } from "next/server";
import { isSyncAuthorized } from "@/lib/sync-auth";
import { syncBranchCatalog } from "@/lib/catalog-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const EDUFORM_PRODUCTS = [
  {
    slug: "eduform-compta-finance-4en1",
    name: "ComptabilitÃ© & Finance 4 en 1",
    pricingType: "COURSE",
    price: 400000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/comptabilite-et-finance-4-en-1",
    description: "Certificat 4 en 1 â€” ComptabilitÃ© Professionnelle, Finance et Gestion (65h). Programme formant des experts comptables et financiers immÃ©diatement opÃ©rationnels avec 4 certificats distincts : Comptable Professionnel, Chef Comptable, Responsable Financier et ComptabilitÃ© ONG (SYCEBNL), avec initiation SAP FI & CO. Conforme SYSCOHADA. IdÃ©al pour : comptables, responsables financiers, gestionnaires ONG, entrepreneurs. Ã€ partir de 400 000 FCFA en ligne.",
  },
  {
    slug: "eduform-daf-dirigeant",
    name: "DAF Dirigeant",
    pricingType: "COURSE",
    price: 450000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/daf-dirigeant",
    description: "Certificat au MÃ©tier de Directeur Administratif & Financier (100h). Formation intensive transformant des profils comptables et financiers en DAF opÃ©rationnels, capables de piloter la fonction financiÃ¨re et d'accompagner la direction gÃ©nÃ©rale dans ses dÃ©cisions stratÃ©giques. 11 modules : vision DAF, reporting avancÃ©, contrÃ´le de gestion, analyse financiÃ¨re, trÃ©sorerie, droit des affaires, audit interne, outils numÃ©riques (ERP, Power BI), finance durable. PrÃ©requis : Bac+3 et 3 ans d'expÃ©rience. Ã€ partir de 450 000 FCFA en ligne.",
  },
  {
    slug: "eduform-expert-rh-3en1",
    name: "Expert RH 3 en 1 â€” RH, Paie & Data Analytics",
    pricingType: "COURSE",
    price: 450000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/grh-expert-3-en-1",
    description: "Programme certifiant 3 en 1 â€” RH, Paie & Data Analytics (55h). Trois certificats en un seul parcours : Gestion StratÃ©gique des RH & Administration du Personnel, Paie & Droit du Travail avec Sage 100 Paie, et HR Analytics avec Power BI. IdÃ©al pour : gestionnaires RH, responsables administratifs, gestionnaires de paie, entrepreneurs, cadres souhaitant Ã©voluer vers les RH. Ã€ partir de 450 000 FCFA en ligne.",
  },
  {
    slug: "eduform-audit-controle-4en1",
    name: "Audit & ContrÃ´le de Gestion 4 en 1",
    pricingType: "COURSE",
    price: 375000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/audit-et-controle-de-gestion-4-en-1",
    description: "Programme certifiant 4 en 1 â€” Audit & ContrÃ´le de Gestion (65h). Quatre certificats : Audit Interne (mÃ©thodologie IIA, COSO, dÃ©tection fraudes), ContrÃ´le de Gestion (budget, tableaux de bord, KPI), Audit Comptable & Financier (rÃ©vision cycle par cycle, SYSCOHADA/IFRS) et Gestion des Risques (cartographie ISO 31000). Pour : comptables, contrÃ´leurs de gestion, auditeurs, responsables financiers. Ã€ partir de 375 000 FCFA en ligne.",
  },
  {
    slug: "eduform-marches-publics-3en1",
    name: "MarchÃ©s Publics & Gestion des Achats 3 en 1",
    pricingType: "COURSE",
    price: 275000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/passation-des-marches-publics-et-gestion-des-achats-3-en-1",
    description: "Programme certifiant 3 en 1 â€” MarchÃ©s Publics & Achats (55h). Trois certificats : Passation des MarchÃ©s Publics (procÃ©dures, rÃ©glementation), Gestion des Contrats et Achats & Approvisionnements (gestion des fournisseurs). DestinÃ© aux responsables achats, acheteurs, agents de l'Ã‰tat et des collectivitÃ©s, ONG et projets financÃ©s. Ã€ partir de 275 000 FCFA en ligne.",
  },
  {
    slug: "eduform-projets-humanitaires-3en1",
    name: "Gestion de Projets Humanitaires & ONG 3 en 1",
    pricingType: "COURSE",
    price: 275000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/gestion-et-management-de-projets-humanitaires-et-ong-3-en-1",
    description: "Programme certifiant 3 en 1 â€” Projets Humanitaires & ONG (55h). Trois certificats : Gestion de Projet Humanitaire, ONG & DÃ©veloppement et Management de Projet. Pour coordinateurs de projets, agents de dÃ©veloppement, responsables de programmes ONG, associations et consultants en dÃ©veloppement. Ã€ partir de 275 000 FCFA en ligne.",
  },
  {
    slug: "eduform-immobilier-3en1",
    name: "Immobilier Professionnel 3 en 1",
    pricingType: "COURSE",
    price: 450000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/immobilier-professionnel-3-en-1",
    description: "Parcours certifiant 3 en 1 â€” Immobilier Professionnel (65h). Trois niveaux progressifs : Praticien (Gestion ImmobiliÃ¨re & Cadre Juridique OHADA, droit foncier, gestion locative), OpÃ©rateur (Transaction, Promotion & Montage d'OpÃ©rations, VEFA, commercialisation) et Expert (Expertise, Ã‰valuation & Conseil en Investissement, due diligence). Pour agents immobiliers, courtiers, promoteurs, investisseurs, juristes. Ã€ partir de 450 000 FCFA en ligne.",
  },
  {
    slug: "eduform-logistique-supply-chain-4en1",
    name: "Logistique & Supply Chain Management 4 en 1",
    pricingType: "COURSE",
    price: 425000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/logistique-et-supply-chain-management-4-en-1",
    description: "Programme certifiant 4 en 1 â€” Logistique & Supply Chain (65h). Quatre certificats : Gestion des Stocks, Gestion des EntrepÃ´ts, Logistique et Approvisionnements. Pour gestionnaires de stocks, logisticiens, responsables entrepÃ´ts, responsables achats, supply chain managers et Ã©tudiants en logistique. Ã€ partir de 425 000 FCFA en ligne.",
  },
  {
    slug: "eduform-qhse-4en1",
    name: "QHSE Expert 4 en 1",
    pricingType: "COURSE",
    price: 325000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/qhse-expert-4-en-1",
    description: "Programme certifiant QHSE 4 en 1 (65h). Quatre certificats : Animateur HSE, Superviseur HSE, Responsable QHSE et Auditeur ISO. SpÃ©cialement conÃ§u pour les secteurs BTP, industrie, mines et pÃ©trole. Pour animateurs, superviseurs et responsables HSE, chefs de chantier, ingÃ©nieurs et techniciens souhaitant Ã©voluer ou se spÃ©cialiser en qualitÃ©, hygiÃ¨ne, sÃ©curitÃ© et environnement. Ã€ partir de 325 000 FCFA en ligne.",
  },
  {
    slug: "eduform-ia-professionnels",
    name: "Intelligence Artificielle pour Professionnels",
    pricingType: "COURSE",
    price: 22500,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/intelligence-artificielle-pour-professionnels",
    description: "Formation Samedi Pro â€” IA pour Professionnels (7h). MaÃ®triser les principaux outils d'intelligence artificielle : Claude, ChatGPT, Gemini, Microsoft Copilot et l'automatisation des tÃ¢ches. Avec bonus : support de cours, groupe d'entraide, accompagnement post-formation et attestation valorisable au CV. Pour tous professionnels, entrepreneurs, consultants et Ã©tudiants. Ã€ partir de 22 500 FCFA en ligne.",
  },
  {
    slug: "eduform-sage100-comptabilite",
    name: "Sage 100 ComptabilitÃ©",
    pricingType: "COURSE",
    price: 25000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/sage-100-comptabilite",
    description: "Formation pratique Sage 100 ComptabilitÃ© (7h â€” 1 journÃ©e). Du paramÃ©trage du dossier Ã  la production des Ã©tats financiers conformes SYSCOHADA. 100 % pratique, immÃ©diatement opÃ©rationnel. Pour comptables, assistants comptables, chefs comptables, entrepreneurs gÃ©rant leur comptabilitÃ© sur Sage. Aucune connaissance prÃ©alable de Sage requise. Ã€ partir de 25 000 FCFA en ligne.",
  },
  {
    slug: "eduform-sage100-paie-rh",
    name: "Sage 100 Paie & RH",
    pricingType: "COURSE",
    price: 22500,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/sage-100-paie-et-rh",
    description: "Formation pratique Sage 100 Paie & RH (7h â€” 1 journÃ©e). GÃ©rer la paie en toute autonomie : paramÃ©trage du dossier de paie, Ã©dition de bulletins fiables et production des dÃ©clarations sociales conformes Ã  la rÃ©glementation ivoirienne. Pour gestionnaires de paie, assistants RH, comptables, dirigeants de PME. Ã€ partir de 22 500 FCFA en ligne.",
  },
  {
    slug: "eduform-power-bi",
    name: "Microsoft Power BI",
    pricingType: "COURSE",
    price: 31500,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/microsoft-power-bi",
    description: "Formation Microsoft Power BI (14h) â€” Analyse de donnÃ©es, Dashboards & Reporting professionnel. Concevoir des tableaux de bord interactifs et des rapports visuels pour piloter l'activitÃ©. Pour analystes, contrÃ´leurs de gestion, comptables, managers et consultants souhaitant exploiter leurs donnÃ©es efficacement. Ã€ partir de 31 500 FCFA en ligne.",
  },
  {
    slug: "eduform-microsoft-project",
    name: "Microsoft Project",
    pricingType: "COURSE",
    price: 22500,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/microsoft-project",
    description: "Formation Microsoft Project (7h â€” 1 journÃ©e). Planification de projets, crÃ©ation de diagrammes de Gantt et suivi opÃ©rationnel de projets avec Microsoft Project. Pour chefs de projet, coordinateurs et consultants souhaitant structurer et piloter leurs projets avec un outil professionnel. Ã€ partir de 22 500 FCFA en ligne.",
  },
  {
    slug: "eduform-sap-fi",
    name: "SAP FI â€” ComptabilitÃ© FinanciÃ¨re",
    pricingType: "COURSE",
    price: 36000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/sap-fi-comptabilite-financiere",
    description: "Formation SAP FI â€” ComptabilitÃ© FinanciÃ¨re (14h). MaÃ®triser la comptabilitÃ© gÃ©nÃ©rale, les comptes clients, les comptes fournisseurs et le reporting financier dans l'environnement SAP. Pour comptables, chefs comptables, responsables administratifs et financiers (RAF), et consultants SAP dÃ©butants. Ã€ partir de 36 000 FCFA en ligne.",
  },
  {
    slug: "eduform-canva-pro",
    name: "Canva Pro & Design Marketing",
    pricingType: "COURSE",
    price: 22500,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/canva-pro-et-design-marketing",
    description: "Formation Samedi Pro â€” Canva Pro & Design Marketing (7h). CrÃ©er des flyers professionnels, des visuels pour les rÃ©seaux sociaux, des prÃ©sentations percutantes et exploiter les fonctionnalitÃ©s IA de Canva Pro. Pour community managers, marketeurs, communicants et entrepreneurs souhaitant produire des contenus visuels de qualitÃ© sans Ãªtre graphiste. Ã€ partir de 22 500 FCFA en ligne.",
  },
  {
    slug: "eduform-kobotoolbox",
    name: "KoBoToolbox & Collecte de DonnÃ©es",
    pricingType: "COURSE",
    price: 27000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/kobotoolbox-et-collecte-de-donnees",
    description: "Formation KoBoToolbox & Collecte de DonnÃ©es (14h). MaÃ®triser la conception d'enquÃªtes, la collecte de donnÃ©es sur mobile et l'analyse des rÃ©sultats avec KoBoToolbox, l'outil de rÃ©fÃ©rence des ONG et organismes de recherche. Pour ONG, consultants, statisticiens, enquÃªteurs et chercheurs souhaitant digitaliser leur collecte terrain. Attestation IBIG EDUFORM incluse. Ã€ partir de 27 000 FCFA en ligne.",
  },
  {
    slug: "eduform-sage100-gescom",
    name: "Sage 100 GESCOM",
    pricingType: "COURSE",
    price: 22500,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/sage-100-gescom",
    description: "Formation pratique Sage 100 GESCOM (7h â€” 1 journÃ©e). MaÃ®triser les achats, les ventes, la gestion des stocks et la facturation dans Sage 100. Formation 100 % pratique, opÃ©rationnelle dÃ¨s la sortie. Pour commerciaux, gestionnaires de stocks et responsables commerciaux souhaitant automatiser leur gestion avec Sage. Ã€ partir de 22 500 FCFA en ligne.",
  },
  {
    slug: "eduform-sage-etats-fiscaux",
    name: "Sage Ã‰tats Comptables & Fiscaux",
    pricingType: "COURSE",
    price: 22500,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/sage-etats-comptables-et-fiscaux",
    description: "Formation Samedi Pro â€” Sage Ã‰tats Comptables & Fiscaux (7h). MaÃ®triser la production des Ã©tats financiers et des dÃ©clarations fiscales avec le logiciel Sage. Formation pratique et directement applicable. Pour comptables, chefs comptables, responsables administratifs et financiers (RAF) et fiscalistes. Ã€ partir de 22 500 FCFA en ligne.",
  },

  // â”€â”€ Formats complÃ©mentaires (entreprise, prÃ©sentiel, international) â”€â”€â”€â”€â”€â”€
  {
    slug: "eduform-sur-mesure-entreprise",
    name: "Formation Sur Mesure Entreprise",
    pricingType: "SERVICE",
    price: 500000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/entreprise",
    description: "Programme de formation conÃ§u sur mesure pour rÃ©pondre aux besoins spÃ©cifiques d'une entreprise, d'une administration ou d'une ONG : diagnostic des besoins, choix des modules et intervenants, adaptation du contenu et du rythme au contexte mÃ©tier. Pour directions RH, dirigeants et responsables de formation souhaitant former une Ã©quipe sur une problÃ©matique prÃ©cise plutÃ´t qu'un programme standard. Sur devis, Ã  partir de 500 000 FCFA.",
  },
  {
    slug: "eduform-intra-entreprise-presentiel",
    name: "Formation Intra-Entreprise en PrÃ©sentiel",
    pricingType: "SERVICE",
    price: 350000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/entreprise",
    description: "Session de formation dispensÃ©e en prÃ©sentiel directement dans les locaux de l'entreprise (ou dans une salle dÃ©diÃ©e), pour un groupe de collaborateurs. Formateur dÃ©diÃ©, supports adaptÃ©s, mises en situation pratiques sur les outils et process de l'entreprise. Pour les entreprises souhaitant former plusieurs collaborateurs en mÃªme temps sans les dÃ©placer. Sur devis selon effectif et durÃ©e, Ã  partir de 350 000 FCFA par session.",
  },
  {
    slug: "eduform-formation-internationale-diaspora",
    name: "Formation Ã  Distance â€” International & Diaspora",
    pricingType: "COURSE",
    price: 450000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "AccÃ¨s Ã  l'ensemble du catalogue de formations certifiantes IBIG EDUFORM en 100 % Ã  distance (visioconfÃ©rence en direct + replay), pensÃ© pour les Ivoiriens et Africains de la diaspora ou les professionnels basÃ©s hors de CÃ´te d'Ivoire. Fuseaux horaires amÃ©nagÃ©s, paiement international (carte bancaire, virement, Mobile Money), certificat envoyÃ© numÃ©riquement. Pour la diaspora et les clients internationaux souhaitant se former Ã  distance sans contrainte de prÃ©sence physique. Ã€ partir de 450 000 FCFA.",
  },
  {
    slug: "eduform-coaching-particulier",
    name: "Coaching Individuel & Formation Particulier",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Accompagnement individuel personnalisÃ© (1 Ã  1) sur une compÃ©tence prÃ©cise : comptabilitÃ©, bureautique, Sage, gestion, prÃ©paration d'entretien ou de concours. Rythme et contenu adaptÃ©s au niveau et aux disponibilitÃ©s de l'apprenant, en prÃ©sentiel ou Ã  distance. Pour particuliers, Ã©tudiants et professionnels souhaitant progresser rapidement sur un besoin ciblÃ© sans suivre un programme de groupe. Ã€ partir de 150 000 FCFA.",
  },
  {
    slug: "eduform-formation-individuelle-particulier",
    name: "Formation Individuelle pour Particulier",
    pricingType: "COURSE",
    price: 100000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Inscription en solo Ã  l'un des modules du catalogue IBIG EDUFORM (comptabilitÃ©, RH, Sage, bureautique, IA, etc.), sans intÃ©grer un groupe classique : dates de dÃ©marrage flexibles, rythme individuel, suivi personnalisÃ© du formateur. Pour un particulier qui souhaite se former seul, Ã  son propre rythme, sans attendre l'ouverture d'une session collective. Ã€ partir de 100 000 FCFA selon le module choisi.",
  },
  {
    slug: "eduform-deplacement-formateur-international",
    name: "DÃ©placement Formateur Ã  l'International",
    pricingType: "SERVICE",
    price: 0,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/entreprise",
    description: "DÃ©placement d'un formateur IBIG EDUFORM hors de CÃ´te d'Ivoire pour animer une session en prÃ©sentiel chez le client (autre pays d'Afrique, Europe ou ailleurs) : billet d'avion, hÃ©bergement et frais de mission inclus dans le devis. Pour entreprises, institutions et organisations internationales souhaitant une formation en prÃ©sentiel rÃ©alisÃ©e sur leur propre site Ã  l'Ã©tranger. EntiÃ¨rement sur devis, selon destination, durÃ©e et effectif.",
  },
];

export async function POST() {
  try {
    if (!(await isSyncAuthorized())) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const result = await syncBranchCatalog("ibig-eduform", "IBIG EDUFORM", EDUFORM_PRODUCTS, { notify: true });
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
      message: `${diff.total} produits IBIG EDUFORM synchronisés (${diff.added.length} nouveau(x), ${diff.updated.length} mis à jour, ${diff.removed} retiré(s)).`,
    });
  } catch (err: any) {
    console.error("sync-eduform error:", err);
    return NextResponse.json({ error: err?.message ?? "Erreur serveur" }, { status: 500 });
  }
}


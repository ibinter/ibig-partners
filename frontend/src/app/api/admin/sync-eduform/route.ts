import { NextResponse } from "next/server";
import { isSyncAuthorized } from "@/lib/sync-auth";
import { syncBranchWithFeed } from "@/lib/catalog-feed";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

  // ── Nouveaux domaines — BTP / Construction / Génie Civil ────────────────
  {
    slug: "eduform-btp-gestion-chantier-3en1",
    name: "BTP & Gestion de Chantier 3 en 1",
    pricingType: "COURSE",
    price: 350000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Programme certifiant 3 en 1 — BTP & Gestion de Chantier (55h). Trois certificats : Conducteur de Travaux (planification, suivi de chantier, coordination des corps d'état), Métreur-Vérificateur (devis quantitatifs, bordereaux de prix, DPGF) et Sécurité & Prévention sur Chantier (plan de prévention, PPSPS, signalisation). Pour chefs de chantier, conducteurs de travaux, techniciens BTP, maîtres d'œuvre et ingénieurs débutants. À partir de 350 000 FCFA en ligne.",
  },
  {
    slug: "eduform-btp-presentiel",
    name: "BTP & Gestion de Chantier — Présentiel",
    pricingType: "COURSE",
    price: 450000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Version présentiel du programme BTP & Gestion de Chantier 3 en 1 — sessions animées en salle avec études de cas réels sur chantiers locaux. Formateur expert terrain, supports pédagogiques adaptés à l'environnement ivoirien et ouest-africain (normes locales, matériaux disponibles, réglementation en vigueur). Pour les professionnels du BTP souhaitant une formation pratique en face-à-face. À partir de 450 000 FCFA en présentiel.",
  },

  // ── Santé / Gestion hospitalière / Paramédical ───────────────────────────
  {
    slug: "eduform-gestion-etablissement-sante-3en1",
    name: "Gestion d'Établissement de Santé 3 en 1",
    pricingType: "COURSE",
    price: 375000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Programme certifiant 3 en 1 — Gestion Hospitalière & Santé Publique (55h). Trois certificats : Administration Hospitalière (pilotage médico-économique, gestion des ressources, réglementation sanitaire), Gestion des Achats & Stocks Médicaux (pharmacovigilance, traçabilité, marchés sanitaires) et Qualité & Hygiène Hospitalière (accréditation, prévention des infections nosocomiales, démarche ISO 9001 en santé). Pour directeurs, administrateurs, responsables qualité et gestionnaires de cliniques, hôpitaux et centres de santé. À partir de 375 000 FCFA en ligne.",
  },

  // ── Informatique / Digital / Bureautique ─────────────────────────────────
  {
    slug: "eduform-bureautique-microsoft-4en1",
    name: "Bureautique Microsoft 4 en 1",
    pricingType: "COURSE",
    price: 75000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Maîtrise complète de la suite Microsoft Office (28h). Quatre certificats : Word Professionnel (documents structurés, mailing, publipostage), Excel Avancé (formules complexes, tableaux croisés dynamiques, macros VBA initiation), PowerPoint Expert (présentations percutantes, animations, design) et Outlook & Teams (organisation, collaboration, réunions en ligne). Pour secrétaires, assistants, comptables, commerciaux et tout professionnel souhaitant gagner en efficacité bureautique. À partir de 75 000 FCFA en ligne.",
  },
  {
    slug: "eduform-developpement-web-fullstack",
    name: "Développement Web Full-Stack — Débutant à Opérationnel",
    pricingType: "COURSE",
    price: 400000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Formation intensive Développement Web Full-Stack (80h). Du HTML/CSS/JavaScript aux frameworks modernes (React, Node.js), bases de données (MySQL, MongoDB) et déploiement (Vercel, cPanel). Projets pratiques à chaque étape, portfolio de 3 projets réels à la clé. Pour débutants souhaitant devenir développeurs web, reconversion professionnelle, entrepreneurs voulant créer leur site ou application. À partir de 400 000 FCFA en ligne.",
  },
  {
    slug: "eduform-cybersecurite-reseaux",
    name: "Cybersécurité & Administration Réseaux",
    pricingType: "COURSE",
    price: 350000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Programme certifiant Cybersécurité & Réseaux (65h). Comprendre les architectures réseau (TCP/IP, VPN, firewall), administrer les systèmes (Windows Server, Linux), mettre en place des politiques de sécurité et répondre aux incidents cyber. Préparation aux certifications CompTIA Security+ et Network+. Pour techniciens IT, administrateurs systèmes, responsables informatiques et étudiants en informatique. À partir de 350 000 FCFA en ligne.",
  },

  // ── Marketing / Communication / Community Management ─────────────────────
  {
    slug: "eduform-marketing-digital-3en1",
    name: "Marketing Digital 3 en 1",
    pricingType: "COURSE",
    price: 275000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Programme certifiant Marketing Digital 3 en 1 (55h). Trois certificats : Community Management (stratégie de contenu, gestion des réseaux sociaux, modération, analytics), SEO & Référencement naturel (audit, optimisation on-page/off-page, Google Search Console) et Publicité Digitale (Google Ads, Meta Ads, campagnes ROI, retargeting). Pour marketing managers, community managers, entrepreneurs et tout professionnel souhaitant développer sa présence en ligne. À partir de 275 000 FCFA en ligne.",
  },
  {
    slug: "eduform-communication-prise-parole",
    name: "Communication Professionnelle & Prise de Parole",
    pricingType: "COURSE",
    price: 150000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Formation Communication Professionnelle & Prise de Parole en Public (28h). Techniques de présentation orale, gestion du stress, structuration du discours, communication non verbale, rédaction professionnelle (rapports, emails, notes de synthèse). Ateliers pratiques filmés avec débriefing individualisé. Pour managers, commerciaux, cadres et tout professionnel amené à prendre la parole ou à rédiger des documents professionnels. À partir de 150 000 FCFA en ligne.",
  },

  // ── Management / Leadership / Entrepreneuriat ────────────────────────────
  {
    slug: "eduform-management-leadership-4en1",
    name: "Management & Leadership 4 en 1",
    pricingType: "COURSE",
    price: 350000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Programme certifiant Management & Leadership 4 en 1 (65h). Quatre certificats : Manager d'Équipe (cohésion, délégation, gestion des conflits), Conduite du Changement (transformation organisationnelle, accompagnement humain), Leadership Stratégique (vision, prise de décision, intelligence émotionnelle) et Pilotage par la Performance (OKR, KPI, reporting managérial). Pour managers, chefs d'équipe, directeurs et cadres souhaitant renforcer leur posture de leadership. À partir de 350 000 FCFA en ligne.",
  },
  {
    slug: "eduform-creation-entreprise-entrepreneuriat",
    name: "Création d'Entreprise & Entrepreneuriat",
    pricingType: "COURSE",
    price: 150000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Formation Création d'Entreprise & Entrepreneuriat (28h). De l'idée au lancement : validation du concept, étude de marché, business plan, choix du statut juridique (SARL, SAS, EI — cadre OHADA), financement (fonds propres, microfinance, investisseurs), marketing de lancement et gestion des premières semaines d'activité. Pour porteurs de projets, étudiants en fin de cursus et salariés souhaitant créer leur propre activité. À partir de 150 000 FCFA en ligne.",
  },

  // ── Langues / Formation linguistique ────────────────────────────────────
  {
    slug: "eduform-anglais-professionnel",
    name: "Anglais Professionnel — Business English",
    pricingType: "COURSE",
    price: 125000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Formation Anglais Professionnel — Business English (28h). Communication orale et écrite en anglais dans un contexte professionnel : réunions, présentations, emails, négociations, rapports. Niveau A2 → B2 visé, avec certification de niveau incluse. Pour cadres, commerciaux, professionnels de l'export et tous ceux évoluant dans un environnement international ou bilingue. À partir de 125 000 FCFA en ligne.",
  },
  {
    slug: "eduform-francais-professionnel-redaction",
    name: "Français Professionnel & Rédaction Administrative",
    pricingType: "COURSE",
    price: 75000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Formation Français Professionnel & Rédaction Administrative (14h). Maîtriser les écrits professionnels : lettre administrative, note de service, compte-rendu, rapport, procès-verbal, appel d'offres. Correction des erreurs fréquentes, style clair et concis, respect des conventions administratives francophones. Pour agents administratifs, secrétaires, chargés de mission, cadres et fonctionnaires. À partir de 75 000 FCFA en ligne.",
  },

  // ── Agriculture / Agroalimentaire / Agribusiness ─────────────────────────
  {
    slug: "eduform-agribusiness-gestion-exploitation",
    name: "Agribusiness & Gestion d'Exploitation Agricole",
    pricingType: "COURSE",
    price: 250000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Programme certifiant Agribusiness & Gestion d'Exploitation (55h). Trois certificats : Gestion Financière de l'Exploitation Agricole (budget, rentabilité, financement agricole), Management de la Chaîne de Valeur (approvisionnement, transformation, commercialisation) et Accès aux Marchés & Exportation (normes sanitaires, certification GlobalG.A.P., contrats export). Pour exploitants agricoles, coopératives, agro-entrepreneurs et cadres du secteur agricole. À partir de 250 000 FCFA en ligne.",
  },

  // ── Juridique / Droit des Affaires / OHADA ───────────────────────────────
  {
    slug: "eduform-droit-affaires-ohada-3en1",
    name: "Droit des Affaires OHADA 3 en 1",
    pricingType: "COURSE",
    price: 300000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Programme certifiant Droit des Affaires OHADA 3 en 1 (55h). Trois certificats : Droit Commercial & Contrats (rédaction et sécurisation des contrats commerciaux, conditions générales de vente, litiges), Droit des Sociétés OHADA (création, gouvernance, transformations, dissolution — SARL, SA, SAS) et Droit du Travail & RH (contrat de travail, rupture, contentieux prud'homal, inspection du travail). Pour juristes, RH, dirigeants, entrepreneurs et responsables achats. À partir de 300 000 FCFA en ligne.",
  },

  // ── Transport / Douane / Commerce international ──────────────────────────
  {
    slug: "eduform-commerce-international-douane-3en1",
    name: "Commerce International & Douane 3 en 1",
    pricingType: "COURSE",
    price: 325000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Programme certifiant Commerce International & Douane 3 en 1 (55h). Trois certificats : Techniques du Commerce International (Incoterms, financement des échanges, lettre de crédit documentaire), Procédures Douanières (déclaration en douane, régimes douaniers, contrôle, contentieux) et Transport & Fret International (modes de transport, connaissement, assurance cargo, freight forwarding). Pour transitaires, agents maritimes, importateurs, exportateurs et responsables logistique internationale. À partir de 325 000 FCFA en ligne.",
  },

  // ── Tourisme / Hôtellerie / Restauration ────────────────────────────────
  {
    slug: "eduform-gestion-hoteliere-tourisme",
    name: "Gestion Hôtelière & Tourisme",
    pricingType: "COURSE",
    price: 250000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Programme certifiant Gestion Hôtelière & Tourisme (55h). Trois certificats : Direction d'Hôtel & Hébergement (revenue management, yield management, gestion des équipes hôtelières), Tourisme & Agences de Voyages (conception de produits touristiques, billetterie, GDS, IATA initiation) et Restauration & Food Cost (gestion d'un restaurant, contrôle des coûts alimentaires, hygiène HACCP). Pour gérants d'hôtels, responsables de réception, agents de voyages et porteurs de projets touristiques. À partir de 250 000 FCFA en ligne.",
  },

  // ── Énergie / Environnement / Développement durable ─────────────────────
  {
    slug: "eduform-energie-renouvelable-solaire",
    name: "Énergie Solaire & Énergies Renouvelables",
    pricingType: "COURSE",
    price: 275000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Programme certifiant Énergie Solaire & Renouvelables (55h). Trois certificats : Technicien Solaire Photovoltaïque (dimensionnement, installation, maintenance de systèmes solaires autonomes et raccordés au réseau), Énergies Renouvelables & Efficacité Énergétique (audit énergétique, solutions biogaz, hydraulique, éolien) et Financement de Projets Énergétiques (PPAs, subventions, fonds verts, CCNUCC). Pour techniciens électriciens, ingénieurs, chefs de projets et entrepreneurs du secteur énergie. À partir de 275 000 FCFA en ligne.",
  },

  // ── Banque / Finance / Microfinance ─────────────────────────────────────
  {
    slug: "eduform-banque-credit-microfinance-3en1",
    name: "Banque, Crédit & Microfinance 3 en 1",
    pricingType: "COURSE",
    price: 350000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Programme certifiant Banque, Crédit & Microfinance 3 en 1 (55h). Trois certificats : Analyse du Risque Crédit (scoring, instruction d'un dossier, comité de crédit, recouvrement), Opérations Bancaires & Conformité (UEMOA, réglementation BCEAO, AML/CFT, KYC) et Microfinance & Finance Inclusive (SFD, épargne, crédit solidaire, mobile banking). Pour agents de crédit, chargés de clientèle banque, responsables microfinance et gestionnaires de coopératives d'épargne. À partir de 350 000 FCFA en ligne.",
  },

  // ── Médias / Journalisme / Production audiovisuelle ──────────────────────
  {
    slug: "eduform-journalisme-production-media",
    name: "Journalisme & Production Média Digitale",
    pricingType: "COURSE",
    price: 200000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Programme certifiant Journalisme & Média Digitale (40h). Techniques rédactionnelles (article de presse, reportage, interview, fact-checking), production vidéo (tournage smartphone pro, montage Capcut/DaVinci Resolve, storytelling), podcast et création de contenu monétisable (YouTube, TikTok, newsletters). Pour journalistes, blogueurs, influenceurs, communicants et créateurs de contenu souhaitant professionnaliser leur pratique. À partir de 200 000 FCFA en ligne.",
  },

  // ── Formats complémentaires (entreprise, présentiel, groupe, international) ──

  // ── Tarif Groupe (5 personnes et plus) ──────────────────────────────────
  {
    slug: "eduform-tarif-groupe-5plus",
    name: "Tarif Groupe — 5 Personnes et Plus",
    pricingType: "COURSE",
    price: 200000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Tarif préférentiel pour les inscriptions groupées de 5 participants ou plus à une même formation IBIG EDUFORM (en ligne ou présentiel). Réduction de 20 % à 30 % par participant selon l'effectif, suivi pédagogique collectif, accès à un groupe de travail dédié et attestation nominative pour chacun. Idéal pour les PME, cabinets, associations et promotions d'étudiants souhaitant former une équipe ensemble. À partir de 200 000 FCFA par personne (selon programme et effectif).",
  },

  // ── Présentiel standard (toutes formations) ──────────────────────────────
  {
    slug: "eduform-formation-presentiel-standard",
    name: "Formation en Présentiel — Toutes Formations",
    pricingType: "COURSE",
    price: 150000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Modalité présentielle disponible pour l'ensemble du catalogue IBIG EDUFORM : sessions animées en salle à Abidjan (et principales villes selon programmation), avec formateur en face-à-face, travaux pratiques sur ordinateur fourni, supports imprimés et pauses incluses. Immersion totale, échanges directs avec le formateur, networking entre participants. Le tarif présentiel inclut une majoration par rapport au tarif en ligne. À partir de 150 000 FCFA selon le programme choisi.",
  },

  // ── Sur mesure entreprise ────────────────────────────────────────────────
  {
    slug: "eduform-sur-mesure-entreprise",
    name: "Formation Sur Mesure Entreprise",
    pricingType: "SERVICE",
    price: 0,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/entreprise",
    description: "Programme de formation conçu sur mesure pour répondre aux besoins spécifiques d'une entreprise, d'une administration ou d'une ONG : diagnostic des besoins, choix des modules et intervenants, adaptation du contenu et du rythme au contexte métier. Pour directions RH, dirigeants et responsables de formation souhaitant former une équipe sur une problématique précise plutôt qu'un programme standard. Entièrement sur devis.",
  },

  // ── Intra-entreprise présentiel ──────────────────────────────────────────
  {
    slug: "eduform-intra-entreprise-presentiel",
    name: "Formation Intra-Entreprise en Présentiel",
    pricingType: "SERVICE",
    price: 0,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/entreprise",
    description: "Session de formation dispensée en présentiel directement dans les locaux de l'entreprise (ou dans une salle dédiée), pour un groupe de collaborateurs. Formateur dédié, supports adaptés, mises en situation pratiques sur les outils et process de l'entreprise. Pour les entreprises souhaitant former plusieurs collaborateurs en même temps sans les déplacer. Sur devis selon effectif, programme et durée.",
  },

  // ── International & Diaspora ────────────────────────────────────────────
  {
    slug: "eduform-formation-internationale-diaspora",
    name: "Formation à Distance — International & Diaspora",
    pricingType: "COURSE",
    price: 450000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Accès à l'ensemble du catalogue de formations certifiantes IBIG EDUFORM en 100 % à distance (visioconférence en direct + replay), pensé pour les Ivoiriens et Africains de la diaspora ou les professionnels basés hors de Côte d'Ivoire. Fuseaux horaires aménagés, paiement international (carte bancaire, virement, Mobile Money), certificat envoyé numériquement. Pour la diaspora et les clients internationaux souhaitant se former à distance sans contrainte de présence physique. À partir de 450 000 FCFA.",
  },

  // ── Déplacement formateur international ─────────────────────────────────
  {
    slug: "eduform-deplacement-formateur-international",
    name: "Déplacement Formateur à l'International",
    pricingType: "SERVICE",
    price: 0,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/entreprise",
    description: "Déplacement d'un formateur IBIG EDUFORM hors de Côte d'Ivoire pour animer une session en présentiel chez le client (autre pays d'Afrique, Europe ou ailleurs) : billet d'avion, hébergement et frais de mission inclus dans le devis. Pour entreprises, institutions et organisations internationales souhaitant une formation en présentiel réalisée sur leur propre site à l'étranger. Entièrement sur devis, selon destination, durée et effectif.",
  },

  // ── Coaching & accompagnement individuel ────────────────────────────────
  {
    slug: "eduform-coaching-particulier",
    name: "Coaching Individuel & Formation Particulier",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Accompagnement individuel personnalisé (1 à 1) sur une compétence précise : comptabilité, bureautique, Sage, gestion, préparation d'entretien ou de concours. Rythme et contenu adaptés au niveau et aux disponibilités de l'apprenant, en présentiel ou à distance. Pour particuliers, étudiants et professionnels souhaitant progresser rapidement sur un besoin ciblé sans suivre un programme de groupe. À partir de 150 000 FCFA.",
  },

  // ── Formation individuelle particulier ──────────────────────────────────
  {
    slug: "eduform-formation-individuelle-particulier",
    name: "Formation Individuelle pour Particulier",
    pricingType: "COURSE",
    price: 100000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Inscription en solo à l'un des modules du catalogue IBIG EDUFORM (comptabilité, RH, Sage, bureautique, IA, etc.), sans intégrer un groupe classique : dates de démarrage flexibles, rythme individuel, suivi personnalisé du formateur. Pour un particulier qui souhaite se former seul, à son propre rythme, sans attendre l'ouverture d'une session collective. À partir de 100 000 FCFA selon le module choisi.",
  },

  // ── Libre choix / Sur mesure particulier (sur devis) ────────────────────
  {
    slug: "eduform-libre-choix-sur-mesure",
    name: "Formation Libre Choix & Sur Mesure — Particulier",
    pricingType: "SERVICE",
    price: 0,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Formule 100 % personnalisée pour les particuliers : choisissez librement les modules, thèmes et compétences à travailler dans n'importe quel domaine du catalogue IBIG EDUFORM (comptabilité, RH, droit, digital, management, langues, BTP, santé, agriculture, etc.). Contenu, durée, planning et format (en ligne ou présentiel) entièrement adaptés à vos objectifs personnels et professionnels. Devis gratuit après entretien de cadrage. Entièrement sur devis.",
  },
];

export async function POST() {
  try {
    if (!(await isSyncAuthorized())) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const result = await syncBranchWithFeed("ibig-eduform", "IBIG EDUFORM", EDUFORM_PRODUCTS, { notify: true });
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


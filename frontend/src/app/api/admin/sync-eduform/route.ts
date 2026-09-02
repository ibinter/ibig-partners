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
    price: 50000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/intelligence-artificielle-pour-professionnels",
    description: "Formation Samedi Pro — IA pour Professionnels (7h). Maîtriser les principaux outils d'intelligence artificielle : Claude, ChatGPT, Gemini, Microsoft Copilot et l'automatisation des tâches. Avec bonus : support de cours, groupe d'entraide, accompagnement post-formation et attestation valorisable au CV. Pour tous professionnels, entrepreneurs, consultants et étudiants. Disponible en e-learning, en ligne (live) et en présentiel (individuel possible). À partir de 50 000 FCFA.",
  },
  {
    slug: "eduform-sage100-comptabilite",
    name: "Sage 100 Comptabilité",
    pricingType: "COURSE",
    price: 50000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/sage-100-comptabilite",
    description: "Formation pratique Sage 100 Comptabilité (7h — 1 journée). Du paramétrage du dossier à la production des états financiers conformes SYSCOHADA. 100 % pratique, immédiatement opérationnel. Pour comptables, assistants comptables, chefs comptables, entrepreneurs gérant leur comptabilité sur Sage. Aucune connaissance préalable de Sage requise. Disponible en e-learning, en ligne (live) et en présentiel (individuel possible). À partir de 50 000 FCFA.",
  },
  {
    slug: "eduform-sage100-paie-rh",
    name: "Sage 100 Paie & RH",
    pricingType: "COURSE",
    price: 50000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/sage-100-paie-et-rh",
    description: "Formation pratique Sage 100 Paie & RH (7h — 1 journée). Gérer la paie en toute autonomie : paramétrage du dossier de paie, édition de bulletins fiables et production des déclarations sociales conformes à la réglementation ivoirienne. Pour gestionnaires de paie, assistants RH, comptables, dirigeants de PME. Disponible en e-learning, en ligne (live) et en présentiel (individuel possible). À partir de 50 000 FCFA.",
  },
  {
    slug: "eduform-power-bi",
    name: "Microsoft Power BI",
    pricingType: "COURSE",
    price: 50000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/microsoft-power-bi",
    description: "Formation Microsoft Power BI (14h) — Analyse de données, Dashboards & Reporting professionnel. Concevoir des tableaux de bord interactifs et des rapports visuels pour piloter l'activité. Pour analystes, contrôleurs de gestion, comptables, managers et consultants souhaitant exploiter leurs données efficacement. Disponible en e-learning, en ligne (live) et en présentiel (individuel possible). À partir de 50 000 FCFA.",
  },
  {
    slug: "eduform-microsoft-project",
    name: "Microsoft Project",
    pricingType: "COURSE",
    price: 50000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/microsoft-project",
    description: "Formation Microsoft Project (7h — 1 journée). Planification de projets, création de diagrammes de Gantt et suivi opérationnel de projets avec Microsoft Project. Pour chefs de projet, coordinateurs et consultants souhaitant structurer et piloter leurs projets avec un outil professionnel. Disponible en e-learning, en ligne (live) et en présentiel (individuel possible). À partir de 50 000 FCFA.",
  },
  {
    slug: "eduform-sap-fi",
    name: "SAP FI — Comptabilité Financière",
    pricingType: "COURSE",
    price: 50000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/sap-fi-comptabilite-financiere",
    description: "Formation SAP FI — Comptabilité Financière (14h). Maîtriser la comptabilité générale, les comptes clients, les comptes fournisseurs et le reporting financier dans l'environnement SAP. Pour comptables, chefs comptables, responsables administratifs et financiers (RAF), et consultants SAP débutants. Disponible en e-learning, en ligne (live) et en présentiel (individuel possible). À partir de 50 000 FCFA.",
  },
  {
    slug: "eduform-canva-pro",
    name: "Canva Pro & Design Marketing",
    pricingType: "COURSE",
    price: 50000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/canva-pro-et-design-marketing",
    description: "Formation Samedi Pro — Canva Pro & Design Marketing (7h). Créer des flyers professionnels, des visuels pour les réseaux sociaux, des présentations percutantes et exploiter les fonctionnalités IA de Canva Pro. Pour community managers, marketeurs, communicants et entrepreneurs souhaitant produire des contenus visuels de qualité sans être graphiste. Disponible en e-learning, en ligne (live) et en présentiel (individuel possible). À partir de 50 000 FCFA.",
  },
  {
    slug: "eduform-kobotoolbox",
    name: "KoBoToolbox & Collecte de Données",
    pricingType: "COURSE",
    price: 50000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/kobotoolbox-et-collecte-de-donnees",
    description: "Formation KoBoToolbox & Collecte de Données (14h). Maîtriser la conception d'enquêtes, la collecte de données sur mobile et l'analyse des résultats avec KoBoToolbox, l'outil de référence des ONG et organismes de recherche. Pour ONG, consultants, statisticiens, enquêteurs et chercheurs souhaitant digitaliser leur collecte terrain. Attestation IBIG EDUFORM incluse. Disponible en e-learning, en ligne (live) et en présentiel (individuel possible). À partir de 50 000 FCFA.",
  },
  {
    slug: "eduform-sage100-gescom",
    name: "Sage 100 GESCOM",
    pricingType: "COURSE",
    price: 50000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/sage-100-gescom",
    description: "Formation pratique Sage 100 GESCOM (7h — 1 journée). Maîtriser les achats, les ventes, la gestion des stocks et la facturation dans Sage 100. Formation 100 % pratique, opérationnelle dès la sortie. Pour commerciaux, gestionnaires de stocks et responsables commerciaux souhaitant automatiser leur gestion avec Sage. Disponible en e-learning, en ligne (live) et en présentiel (individuel possible). À partir de 50 000 FCFA.",
  },
  {
    slug: "eduform-sage-etats-fiscaux",
    name: "Sage États Comptables & Fiscaux",
    pricingType: "COURSE",
    price: 50000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com/formation/sage-etats-comptables-et-fiscaux",
    description: "Formation Samedi Pro — Sage États Comptables & Fiscaux (7h). Maîtriser la production des états financiers et des déclarations fiscales avec le logiciel Sage. Formation pratique et directement applicable. Pour comptables, chefs comptables, responsables administratifs et financiers (RAF) et fiscalistes. Disponible en e-learning, en ligne (live) et en présentiel (individuel possible). À partir de 50 000 FCFA.",
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

  // ── Data Science, Python & Analyse de Données ───────────────────────────
  {
    slug: "eduform-data-science-python-sql",
    name: "Data Science — Python, SQL & Analyse de Données",
    pricingType: "COURSE",
    price: 375000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Programme certifiant Data Science (65h). Trois certificats : Analyse de Données avec Python (pandas, numpy, matplotlib, Jupyter Notebook), SQL & Bases de Données (requêtes, jointures, optimisation, PostgreSQL/MySQL) et Visualisation & Data Storytelling (Tableau, Power BI, présentation des insights à des non-techniciens). Pour analystes, data analysts, comptables, ingénieurs et professionnels souhaitant exploiter la donnée dans leur métier. À partir de 375 000 FCFA en ligne.",
  },
  {
    slug: "eduform-excel-expert",
    name: "Excel Expert — Formules, TCD & Macros VBA",
    pricingType: "COURSE",
    price: 75000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Formation Excel Expert (14h). Aller au-delà des formules de base : fonctions avancées (INDEX/EQUIV, RECHERCHEX, formules matricielles), tableaux croisés dynamiques (TCD) approfondis, Power Query pour l'import et la transformation de données, Power Pivot pour la modélisation, et initiation aux macros VBA pour automatiser les tâches répétitives. Pour comptables, contrôleurs de gestion, analystes et tout professionnel utilisant Excel quotidiennement. À partir de 75 000 FCFA en ligne.",
  },

  // ── Gestion de Projets — PMP, Agile & Scrum ─────────────────────────────
  {
    slug: "eduform-gestion-projets-pmp-agile-3en1",
    name: "Gestion de Projets PMP, Agile & Scrum 3 en 1",
    pricingType: "COURSE",
    price: 325000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Programme certifiant Gestion de Projets 3 en 1 (55h). Trois certificats : Chef de Projet PMP/PMI (initiation, planification, exécution, maîtrise et clôture — cadre PMBOK), Méthodes Agile (Scrum, Kanban, sprints, backlog, rôles Product Owner et Scrum Master) et Outils de Pilotage (MS Project, Trello, Asana, Monday.com et reporting). Préparation aux certifications PMP et PSM I incluse. Pour chefs de projet, coordinateurs, cadres et consultants. À partir de 325 000 FCFA en ligne.",
  },

  // ── E-commerce & Business en Ligne ──────────────────────────────────────
  {
    slug: "eduform-ecommerce-business-en-ligne",
    name: "E-commerce & Business en Ligne",
    pricingType: "COURSE",
    price: 200000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Programme certifiant E-commerce & Business Digital (40h). Deux certificats : Création & Gestion d'une Boutique en Ligne (Shopify, WooCommerce, Jumia/local, gestion des commandes, logistique last mile, service client) et Vente en Ligne & Marketing d'Acquisition (SEO produit, ads, email marketing, retargeting, upsell). Pour entrepreneurs, commerçants, créateurs de marque et toute personne souhaitant lancer ou développer une activité de vente en ligne. À partir de 200 000 FCFA en ligne.",
  },

  // ── Formation de Formateurs & Ingénierie Pédagogique ────────────────────
  {
    slug: "eduform-formation-de-formateurs",
    name: "Formation de Formateurs & Ingénierie Pédagogique",
    pricingType: "COURSE",
    price: 275000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Programme certifiant Formation de Formateurs (55h). Trois certificats : Conception de Programme de Formation (analyse des besoins, définition des objectifs pédagogiques, structuration du contenu, méthodes actives), Animation de Sessions de Formation (techniques d'animation, gestion de groupe, évaluation des acquis) et e-Learning & Formation à Distance (création de modules e-learning, LMS, tutoriels vidéo, quiz interactifs). Pour formateurs, consultants RH, enseignants et tout expert souhaitant transmettre son savoir de manière professionnelle. À partir de 275 000 FCFA en ligne.",
  },

  // ── Préparation Concours & Certifications Professionnelles ──────────────
  {
    slug: "eduform-preparation-concours-professionnels",
    name: "Préparation Concours & Certifications Professionnelles",
    pricingType: "COURSE",
    price: 150000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Programme d'accompagnement à la préparation des concours professionnels et certifications : concours de la fonction publique ivoirienne (ITS, INFAS, ENSET, CAFOP), examens comptables (DSCG, CPA Afrique), certifications IT (Microsoft, Cisco, PMI) et certifications en langues (TOEIC, DELF). Révisions intensives, annales corrigées, simulations d'examen et coaching individuel. Pour candidats souhaitant maximiser leurs chances de réussite. À partir de 150 000 FCFA selon le concours visé.",
  },

  // ── Développement Personnel & Bien-être Professionnel ───────────────────
  {
    slug: "eduform-developpement-personnel-professionnel",
    name: "Développement Personnel & Intelligence Émotionnelle",
    pricingType: "COURSE",
    price: 100000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Formation Développement Personnel & Intelligence Émotionnelle (14h). Connaissance de soi, gestion des émotions, confiance en soi, techniques de motivation, gestion des relations interpersonnelles et résilience face aux difficultés professionnelles. Ateliers pratiques, tests psychologiques et plan d'action personnel. Pour tout professionnel souhaitant améliorer son équilibre, sa performance et son bien-être au travail. À partir de 100 000 FCFA en ligne.",
  },

  // ── Immobilier & Urbanisme spécialisé ───────────────────────────────────
  {
    slug: "eduform-foncier-urbanisme-droit-ci",
    name: "Foncier, Urbanisme & Droit Immobilier en Côte d'Ivoire",
    pricingType: "COURSE",
    price: 200000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Formation spécialisée Foncier & Droit Immobilier ivoirien (28h). Comprendre et maîtriser le cadre légal et pratique de la propriété foncière en Côte d'Ivoire : types de titres (titre foncier, lettre d'attribution, certificat foncier, droits coutumiers), procédures d'immatriculation, purge des droits coutumiers, permis de construire, règles d'urbanisme (PLU, zones) et contentieux fonciers. Pour agents immobiliers, juristes, investisseurs, promoteurs et particuliers. À partir de 200 000 FCFA en ligne.",
  },

  // ── Formations PDF officielles — F001 à F056 IBI GROUP ──────────────────

  // Art Oratoire & Communication
  {
    slug: "eduform-art-oratoire-impact",
    name: "Maîtrise de l'Art Oratoire — Communiquer avec Impact",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Maîtrise de l'Art Oratoire (30h). Prendre la parole en public avec confiance et conviction : techniques de prise de parole, gestion du stress et des émotions, structuration du discours, langage corporel et voix, improvisation et gestion des questions difficiles. Pour managers, commerciaux, formateurs et toute personne souhaitant s'exprimer avec impact en réunion, conférence ou présentation. Code officiel : F001-IBI. À partir de 90 000 FCFA.",
  },
  {
    slug: "eduform-communication-interne-art-oratoire",
    name: "Communication Interne, Engagement des Employés & Art Oratoire",
    pricingType: "COURSE",
    price: 105000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Communication Interne & Art Oratoire (35h). Dynamiser la culture d'entreprise et maîtriser la présentation en public : stratégies de communication interne, engagement des équipes, création d'une culture collaborative, techniques oratoires et gestion des prises de parole formelles. Pour DRH, managers, chefs d'équipe et responsables communication. Code officiel : F012-IBI. À partir de 105 000 FCFA.",
  },

  // Excel — Niveaux Débutant et Intermédiaire
  {
    slug: "eduform-excel-debutant",
    name: "Excel Niveau Débutant",
    pricingType: "COURSE",
    price: 120000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Excel Niveau Débutant (40h). Prise en main complète d'Excel pour les non-initiés : interface, saisie et mise en forme, formules de base (SOMME, MOYENNE, SI, NB.SI), gestion des feuilles et classeurs, création de graphiques simples, impression et mise en page. Pour secrétaires, assistants, gestionnaires débutants et tout professionnel souhaitant maîtriser Excel. Code officiel : F007-01-IBI. À partir de 120 000 FCFA.",
  },
  {
    slug: "eduform-excel-intermediaire",
    name: "Excel Niveau Intermédiaire",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Excel Niveau Intermédiaire (30h). Aller plus loin avec Excel : fonctions avancées (RECHERCHEV/RECHERCHEH, INDEX/EQUIV, SIERREUR), tableaux de données, tableaux croisés dynamiques (TCD) de base, graphiques avancés, validation de données, protection de feuilles et introduction aux macros. Prérequis : niveau Débutant ou équivalent. Code officiel : F007-02-IBI. À partir de 90 000 FCFA.",
  },

  // Marketing & Digital
  {
    slug: "eduform-marketing-reseaux-sociaux",
    name: "Marketing des Réseaux Sociaux",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Marketing des Réseaux Sociaux (30h). Créer et gérer une présence efficace sur les réseaux sociaux : stratégie de contenu, algorithmes et bonnes pratiques par plateforme (Facebook, Instagram, LinkedIn, TikTok, WhatsApp Business), publicité payante (Facebook Ads, Instagram Ads), community management, analytics et mesure de performance. Pour entrepreneurs, commerciaux, community managers et responsables marketing. Code officiel : F010-IBI. À partir de 90 000 FCFA.",
  },
  {
    slug: "eduform-strategie-digitale-transformation",
    name: "Stratégie Digitale & Transformation Numérique",
    pricingType: "COURSE",
    price: 105000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Stratégie Digitale & Transformation Numérique (35h). Conduire la transformation numérique de son organisation : diagnostic digital, définition de la stratégie digitale, outils de productivité (ERP, CRM, cloud), marketing digital, cybersécurité, gestion du changement et conduite de projet digital. Pour dirigeants, directeurs, managers et responsables IT souhaitant piloter la digitalisation. Code officiel : F038-IBI. À partir de 105 000 FCFA.",
  },
  {
    slug: "eduform-ia-machine-learning-affaires",
    name: "Intelligence Artificielle & Machine Learning pour les Affaires",
    pricingType: "COURSE",
    price: 135000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — IA & Machine Learning pour les Affaires (45h). Comprendre et utiliser l'IA dans son activité professionnelle sans coder : fondamentaux de l'IA et du Machine Learning, outils IA (ChatGPT, Copilot, Gemini), IA générative pour la rédaction et la création de contenu, automatisation des processus métier, IA pour l'analyse de données et la prise de décision. Pour décideurs, managers, entrepreneurs et professionnels non-techniques. Code officiel : F036-IBI. À partir de 135 000 FCFA.",
  },
  {
    slug: "eduform-blockchain-affaires",
    name: "Blockchain et Applications dans les Affaires",
    pricingType: "COURSE",
    price: 60000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Blockchain et Applications dans les Affaires (30h). Comprendre la technologie blockchain et ses cas d'usage concrets : fonctionnement de la blockchain, cryptomonnaies et tokens, smart contracts, applications en finance (DeFi), supply chain, santé, immobilier et secteur public. Pour dirigeants, cadres, juristes et professionnels souhaitant intégrer la blockchain dans leur stratégie. Code officiel : F047-IBI. À partir de 60 000 FCFA.",
  },

  // Tableaux de Bord & Performance
  {
    slug: "eduform-tableaux-de-bord-performance",
    name: "Tableaux de Bord — Outils & Techniques de Suivi de Performance",
    pricingType: "COURSE",
    price: 105000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Tableaux de Bord & Suivi de Performance (35h). Concevoir et exploiter des tableaux de bord efficaces : définition des KPI et indicateurs de performance, conception sous Excel et Power BI, tableaux de bord financiers, commerciaux, RH et opérationnels, reporting à la direction, lecture et analyse des données. Pour contrôleurs de gestion, DAF, managers et responsables qualité. Code officiel : F056-IBI. À partir de 105 000 FCFA.",
  },

  // Finance & Gestion
  {
    slug: "eduform-gestion-financiere-non-financiers",
    name: "Gestion Financière pour Non-Financiers",
    pricingType: "COURSE",
    price: 75000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Gestion Financière pour Non-Financiers (25h). Lire et comprendre les états financiers sans être comptable : lecture d'un bilan et d'un compte de résultat, notions de trésorerie et de rentabilité, analyse de ratios clés, gestion d'un budget de service, prise de décisions financières éclairées. Pour managers, chefs de projet, commerciaux, dirigeants de TPE/PME. Code officiel : F039-IBI. À partir de 75 000 FCFA.",
  },
  {
    slug: "eduform-gestionnaire-comptable",
    name: "Gestionnaire Comptable",
    pricingType: "COURSE",
    price: 150000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Gestionnaire Comptable (50h). Maîtriser la comptabilité générale et les tâches d'un gestionnaire comptable au quotidien : tenue de la comptabilité (SYSCOHADA), saisie des opérations, rapprochement bancaire, déclarations fiscales et sociales courantes (TVA, CNPS, impôts), préparation des états financiers, archivage. Pour assistants comptables, gestionnaires administratifs et financiers débutants. Code officiel : F024-IBI. À partir de 150 000 FCFA.",
  },
  {
    slug: "eduform-gestion-stocks",
    name: "Gestion des Stocks",
    pricingType: "COURSE",
    price: 120000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Gestion des Stocks (40h). Maîtriser la gestion physique et administrative des stocks : réception, stockage et gestion des sorties, méthodes de valorisation (FIFO, CMUP), niveaux de réapprovisionnement, inventaires, logiciels de gestion de stock, optimisation des coûts de stockage et prévention des ruptures. Pour gestionnaires de stocks, magasiniers, responsables entrepôts et logisticiens. Code officiel : F026-IBI. À partir de 120 000 FCFA.",
  },
  {
    slug: "eduform-plan-affaires-entrepreneurs",
    name: "Élaboration d'un Plan d'Affaires — Guide pour Entrepreneurs",
    pricingType: "COURSE",
    price: 105000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Plan d'Affaires Entrepreneurs (35h). Construire un business plan solide étape par étape : présentation du projet, étude de marché et analyse concurrentielle, modèle économique (Business Model Canvas), plan opérationnel, prévisions financières (compte de résultat prévisionnel, plan de trésorerie, seuil de rentabilité), montage du dossier de financement. Pour porteurs de projets, entrepreneurs et créateurs d'entreprise. Code officiel : F053-IBI. À partir de 105 000 FCFA.",
  },
  {
    slug: "eduform-gestion-commerciale-ventes",
    name: "Maîtriser la Gestion Commerciale — Stratégies pour Accroître les Ventes",
    pricingType: "COURSE",
    price: 105000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Gestion Commerciale & Ventes (35h). Structurer et piloter son activité commerciale : prospection et gestion du portefeuille clients, techniques de vente (SPIN, CAP SONCAS), négociation commerciale, gestion de la relation client (CRM), tableaux de bord commerciaux, pipeline de vente, fidélisation et développement du chiffre d'affaires. Pour commerciaux, responsables des ventes, gérants de boutique et entrepreneurs. Code officiel : F052-IBI. À partir de 105 000 FCFA.",
  },

  // RH & Management
  {
    slug: "eduform-gestionnaire-personnel",
    name: "Gestionnaire de Personnel",
    pricingType: "COURSE",
    price: 105000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Gestionnaire de Personnel (35h). Gérer le personnel au quotidien : recrutement et intégration, contrats de travail et droit du travail ivoirien, suivi des absences et congés, gestion de la paie de base, discipline et procédures, relation avec l'inspection du travail et la CNPS, classement et archivage RH. Pour assistants RH, gestionnaires administratifs, chefs d'entreprise. Code officiel : F004-IBI. À partir de 105 000 FCFA.",
  },
  {
    slug: "eduform-gpec",
    name: "GPEC — Gestion Prévisionnelle des Emplois et des Compétences",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — GPEC pour un Développement Humain Durable (30h). Anticiper et piloter les besoins en ressources humaines : cartographie des emplois et des compétences, référentiels métiers, analyse des écarts, plans de formation, mobilité interne, gestion des talents et succession planning. Pour DRH, responsables RH, consultants et directeurs généraux. Code officiel : F014-IBI. À partir de 90 000 FCFA.",
  },
  {
    slug: "eduform-leadership-transformationnel",
    name: "Leadership Transformationnel & Management du Changement",
    pricingType: "COURSE",
    price: 120000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Leadership Transformationnel (40h). Piloter l'innovation et la croissance : styles de leadership, leadership transformationnel vs transactionnel, conduite du changement (modèles Kotter & Lewin), gestion des résistances, communication du changement, motivation des équipes et création d'une culture d'innovation. Pour managers, cadres, directeurs et chefs de projet. Code officiel : F013-IBI. À partir de 120 000 FCFA.",
  },
  {
    slug: "eduform-leadership-feminin",
    name: "Leadership Féminin & Empowerment",
    pricingType: "COURSE",
    price: 75000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Formation Certifiante — Leadership Féminin & Empowerment (25h). Affirmer son leadership au féminin : connaissance de soi et confiance en soi, biais de genre en entreprise, réseautage et visibilité professionnelle, négociation salariale, équilibre vie pro/vie perso, mentorat et modèles inspirants d'Afrique et d'ailleurs. Pour femmes cadres, entrepreneures, managers et jeunes professionnelles ambitieuses. Code officiel : F048-IBI. À partir de 75 000 FCFA.",
  },

  // Associations & ONG
  {
    slug: "eduform-gestion-associations-ong",
    name: "Gestion & Renforcement des Capacités pour Associations et ONG",
    pricingType: "COURSE",
    price: 120000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Gestion des Associations et ONG (40h). Renforcer les capacités organisationnelles des associations et ONG : gouvernance associative, gestion administrative et financière (SYCEBNL), montage de projets et recherche de financements, reporting aux bailleurs, gestion des ressources humaines bénévoles et salariées, communication institutionnelle. Pour responsables d'associations, coordinateurs de projets et agents de développement. Code officiel : F015-IBI. À partir de 120 000 FCFA.",
  },
  {
    slug: "eduform-gouvernance-microfinance",
    name: "Gouvernance & Management des Institutions de Microfinance",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Gouvernance & Management Microfinance (30h). Maîtriser la gouvernance et la gestion des IMF (Institutions de Microfinance) : cadre réglementaire UEMOA/BCEAO, gouvernance et conseil d'administration, gestion du risque de crédit, gestion de la liquidité, taux d'intérêt et durabilité, systèmes d'information de gestion (SIG). Pour dirigeants de SFD, agents de crédit, membres de CA et contrôleurs. Code officiel : F011-IBI. À partir de 90 000 FCFA.",
  },

  // Langues — Anglais Niveaux
  {
    slug: "eduform-anglais-debutant",
    name: "Anglais — Les Fondamentaux pour Débutants",
    pricingType: "COURSE",
    price: 120000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Anglais pour Débutants (40h). Acquérir les bases solides de la langue anglaise : alphabet et prononciation, vocabulaire quotidien et professionnel, grammaire de base (présent, passé, futur), conversations simples, compréhension orale et écrite élémentaire. Pour tout professionnel n'ayant aucune ou très peu de connaissance en anglais souhaitant progresser à son rythme. Code officiel : F016-IBI. À partir de 120 000 FCFA.",
  },
  {
    slug: "eduform-anglais-intermediaire",
    name: "Anglais Niveau Intermédiaire",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Anglais Niveau Intermédiaire (30h). Consolider et approfondir ses compétences en anglais : grammaire intermédiaire, expression orale (conversations professionnelles, réunions, présentations), compréhension de textes professionnels, rédaction d'emails professionnels simples. Prérequis : niveau débutant acquis. Code officiel : F032-IBI. À partir de 90 000 FCFA.",
  },
  {
    slug: "eduform-anglais-avance",
    name: "Anglais Niveau Avancé",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Anglais Niveau Avancé (30h). Maîtriser l'anglais à un niveau professionnel élevé : argumentation et débat, rédaction de rapports et présentations complexes, compréhension de documents techniques, négociation en anglais, préparation à des certifications internationales (TOEIC, IELTS). Prérequis : niveau intermédiaire acquis. Code officiel : F033-IBI. À partir de 90 000 FCFA.",
  },
  {
    slug: "eduform-anglais-affaires",
    name: "Anglais des Affaires",
    pricingType: "COURSE",
    price: 75000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Anglais des Affaires (25h). Maîtriser l'anglais dans un contexte professionnel et commercial : vocabulaire business (finance, RH, marketing, vente), email et correspondance professionnelle, réunions et conférences en anglais, présentations orales, négociation commerciale et networking international. Pour commerciaux, cadres, responsables export et tous professionnels en contact avec des partenaires anglophones. Code officiel : F031-IBI. À partir de 75 000 FCFA.",
  },

  // QHSE & HSE standalone
  {
    slug: "eduform-animateur-hse-niveau1",
    name: "Devenir Animateur HSE — Niveau 1",
    pricingType: "COURSE",
    price: 50000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Formation Certifiante — Animateur HSE Niveau 1 (15h). Initiation aux métiers de la santé, sécurité et environnement en entreprise : réglementation HSE de base, identification des risques professionnels, sensibilisation du personnel, gestion des EPI, premiers secours et procédures d'urgence. Pour personnels de terrain souhaitant acquérir les bases HSE. Disponible en e-learning, en ligne (live) et en présentiel (individuel possible). Code officiel : F023-IBI. À partir de 50 000 FCFA.",
  },
  {
    slug: "eduform-animateur-hse-niveau2",
    name: "Devenir Animateur HSE — Niveau 2",
    pricingType: "COURSE",
    price: 50000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Formation Certifiante — Animateur HSE Niveau 2 (10h). Approfondissement du rôle d'animateur HSE : analyse des accidents du travail, plan d'action sécurité, animation de causeries sécurité, suivi des indicateurs HSE, communication auprès des équipes et interface avec les responsables QHSE. Prérequis : Animateur HSE Niveau 1 ou équivalent. Disponible en e-learning, en ligne (live) et en présentiel (individuel possible). Code officiel : F028-IBI. À partir de 50 000 FCFA.",
  },

  // Développement Durable & RSE
  {
    slug: "eduform-rse-developpement-durable",
    name: "Développement Durable & Responsabilité Sociétale des Entreprises (RSE)",
    pricingType: "COURSE",
    price: 105000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — RSE & Développement Durable (35h). Intégrer la durabilité dans la stratégie d'entreprise : fondamentaux du développement durable, normes RSE (ISO 26000, GRI, Pacte Mondial ONU), bilan carbone et empreinte environnementale, chaîne d'approvisionnement responsable, reporting extra-financier, communication RSE et avantages concurrentiels. Pour directeurs généraux, responsables RSE, DAF et managers. Code officiel : F037-IBI. À partir de 105 000 FCFA.",
  },

  // Santé & Sécurité Sectorielle
  {
    slug: "eduform-leadership-sante",
    name: "Gestion & Leadership dans le Secteur de la Santé",
    pricingType: "COURSE",
    price: 105000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Gestion & Leadership Santé (35h). Piloter une structure de santé avec efficacité : gouvernance hospitalière, management des équipes soignantes, gestion financière d'un établissement de santé, qualité et accréditation, gestion des ressources médicales et pharmaceutiques, leadership en situation de crise sanitaire. Pour directeurs d'hôpitaux, médecins-chefs, responsables de cliniques, pharmaciens et cadres de santé. Code officiel : F041-IBI. À partir de 105 000 FCFA.",
  },

  // Négociation & Soft Skills
  {
    slug: "eduform-negociation-avancee",
    name: "Techniques Avancées de Négociation",
    pricingType: "COURSE",
    price: 75000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Techniques Avancées de Négociation (25h). Maîtriser l'art de la négociation dans tous contextes professionnels : stratégies de négociation (BATNA, ZOPA), préparation et planification, techniques de persuasion, gestion des conflits et situations difficiles, négociation interculturelle, simulation de négociations commerciales, salariales et diplomatiques. Pour commerciaux, DRH, acheteurs, cadres et dirigeants. Code officiel : F042-IBI. À partir de 75 000 FCFA.",
  },
  {
    slug: "eduform-innovation-creativite-entreprise",
    name: "Innovation & Créativité en Entreprise",
    pricingType: "COURSE",
    price: 75000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Innovation & Créativité en Entreprise (25h). Développer une culture de l'innovation dans son organisation : Design Thinking, Lean Startup, brainstorming et techniques de créativité, gestion du cycle d'innovation, protection de la propriété intellectuelle (OAPI), mise en place d'une cellule innovation, innovation digitale et ouverte. Pour managers, entrepreneurs, chefs de projet et responsables R&D. Code officiel : F044-IBI. À partir de 75 000 FCFA.",
  },
  {
    slug: "eduform-orientation-domaine-predilection",
    name: "Découverte de Votre Domaine de Prédilection Professionnel",
    pricingType: "COURSE",
    price: 75000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Formation Pratique — Découverte de Son Domaine de Prédilection Professionnel (25h). Un guide pour trouver sa voie professionnelle : connaissance de soi (tests de personnalité, MBTI, forces et talents), exploration des métiers porteurs en Afrique, alignement valeurs-compétences-marché, construction de son projet professionnel, plan d'action concret. Pour étudiants, jeunes actifs en reconversion et professionnels en quête de sens. Code officiel : F043-IBI. À partir de 75 000 FCFA.",
  },

  // Fondamentaux Gestion d'Entreprise
  {
    slug: "eduform-fondamentaux-gestion-entreprise",
    name: "Fondamentaux de la Gestion d'Entreprise — Stratégies pour le Succès",
    pricingType: "COURSE",
    price: 135000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Fondamentaux de la Gestion d'Entreprise (45h). Les bases indispensables pour gérer une entreprise avec succès : gestion financière et comptabilité de base, marketing et vente, management des équipes, gestion de la relation client, droit des affaires OHADA, fiscalité des entreprises, outils numériques de gestion. Pour chefs d'entreprise, gérants de TPE/PME, repreneurs et porteurs de projets. Code officiel : F051-IBI. À partir de 135 000 FCFA.",
  },

  // ── Fiscalité (nouvelle catégorie) ──────────────────────────────────────
  {
    slug: "eduform-fiscalite-pratique-entreprises",
    name: "Fiscalité Pratique des Entreprises",
    pricingType: "COURSE",
    price: 105000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Fiscalité Pratique des Entreprises (35h). Maîtriser le système fiscal ivoirien : impôts et taxes applicables aux entreprises (BIC, BNC, TVA, patente, IRVM), déclarations et obligations fiscales, optimisation fiscale légale, gestion des contrôles fiscaux et contentieux, régimes d'imposition (TEE, RSI, RNI). Pour dirigeants, comptables, responsables administratifs et DAF. Code : F052-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel (individuel possible). À partir de 105 000 FCFA.",
  },
  {
    slug: "eduform-fiscalite-petites-entreprises",
    name: "Fiscalité des Petites Entreprises & Travailleurs Indépendants",
    pricingType: "COURSE",
    price: 75000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Fiscalité Petites Entreprises & Indépendants (25h). Comprendre et gérer sa fiscalité en tant qu'auto-entrepreneur, commerçant, artisan ou professionnel libéral : régimes simplifiés, TVA, patente, déclaration annuelle des revenus, charges déductibles, relations avec le fisc et paiement des impôts. Code : F156-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel (individuel possible). À partir de 75 000 FCFA.",
  },

  // ── Comptabilité spécialisée ─────────────────────────────────────────────
  {
    slug: "eduform-sycebnl-comptabilite-ong",
    name: "SYCEBNL — Comptabilité des ONG & Associations",
    pricingType: "COURSE",
    price: 120000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — SYCEBNL : Système Comptable des Entités à But Non Lucratif (35h). Maîtriser le cadre comptable spécifique aux ONG, associations et fondations : plan de comptes SYCEBNL, saisie des opérations, rapports financiers aux bailleurs, gestion des subventions, audit des projets et conformité OHADA. Pour comptables d'ONG, gestionnaires de projets humanitaires et responsables administratifs. Code : F041-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 120 000 FCFA.",
  },
  {
    slug: "eduform-gestion-tresorerie-budget",
    name: "Gestion de Trésorerie & Budget",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Gestion de Trésorerie & Budget (30h). Piloter la trésorerie et le budget d'une entreprise : élaboration du budget prévisionnel, suivi des encaissements et décaissements, gestion des flux de trésorerie, plan de trésorerie (cash flow), rapprochement bancaire, gestion des découverts et des placements à court terme, tableaux de bord de trésorerie. Pour DAF, trésoriers, comptables et dirigeants de PME. Code : F051-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 90 000 FCFA.",
  },
  {
    slug: "eduform-ifrs-banques-assurances",
    name: "IFRS Avancé pour Banques & Assurances",
    pricingType: "COURSE",
    price: 150000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — IFRS Avancé pour Banques & Assurances (40h). Application des normes IFRS dans le secteur financier : IFRS 9 (instruments financiers et provisionnement), IFRS 16 (contrats de location), IFRS 17 (contrats d'assurance), IFRS 15 (reconnaissance des revenus), transition SYSCOHADA vers IFRS et reporting de conformité. Pour directeurs financiers, auditeurs et comptables du secteur bancaire et assurantiel. Code : F392-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 150 000 FCFA.",
  },

  // ── RH Spécialisé ────────────────────────────────────────────────────────
  {
    slug: "eduform-recrutement-integration-fidelisation",
    name: "Recrutement, Intégration & Fidélisation du Personnel",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Recrutement, Intégration & Fidélisation (30h). Maîtriser le cycle complet de recrutement : définition du profil, sourcing et annonces, entretiens structurés, assessment et prise de décision, processus d'onboarding, intégration culturelle et suivi de la période d'essai, techniques de fidélisation et rétention des talents. Pour RRH, chargés de recrutement et managers. Code : F060-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 90 000 FCFA.",
  },
  {
    slug: "eduform-droit-travail-litiges-rh",
    name: "Droit du Travail & Gestion des Litiges RH",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Droit du Travail & Litiges RH (30h). Maîtriser le droit du travail ivoirien dans la pratique quotidienne : rédaction des contrats (CDI, CDD, stage), durée légale du travail, congés payés, licenciement (procédures et indemnités), gestion des sanctions disciplinaires, relations avec l'inspection du travail, prud'hommes et contentieux. Pour DRH, chefs d'entreprise, gestionnaires RH. Code : F061-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 90 000 FCFA.",
  },
  {
    slug: "eduform-coaching-gestion-talents",
    name: "Coaching & Gestion des Talents",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Coaching & Gestion des Talents (30h). Identifier, développer et retenir les hauts potentiels : cartographie des talents, entretiens de développement, plans de succession, coaching individuel et collectif, techniques d'entretien de performance, feedback constructif, mentorat et plans de carrière personnalisés. Pour DRH, managers et responsables développement RH. Code : F065-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 90 000 FCFA.",
  },
  {
    slug: "eduform-assistant-rh-outils-pratiques",
    name: "Assistant RH — Missions & Outils Pratiques",
    pricingType: "COURSE",
    price: 75000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Assistant RH : Missions & Outils (25h). Acquérir les compétences opérationnelles d'un assistant RH : gestion administrative du personnel, dossiers individuels, suivi des absences et congés, préparation de la paie, saisie des variables, plannings, rapports RH. Outils pratiques : Excel RH, logiciels de paie, SIRH. Pour futurs assistants RH, secrétaires souhaitant évoluer en RH. Code : F071-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 75 000 FCFA.",
  },

  // ── QHSE & Sécurité Spécialisés ─────────────────────────────────────────
  {
    slug: "eduform-haccp-securite-alimentaire",
    name: "HACCP & Sécurité Alimentaire",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — HACCP & Sécurité Alimentaire (30h). Maîtriser le système HACCP (Hazard Analysis and Critical Control Points) et les normes de sécurité alimentaire : identification des dangers biologiques, chimiques et physiques, définition des CCP, surveillance et actions correctives, traçabilité, ISO 22000, réglementation hygièno-sanitaire. Pour responsables qualité des industries agroalimentaires, restaurateurs, hôteliers et distributeurs. Code : F075-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 90 000 FCFA.",
  },
  {
    slug: "eduform-iso-45001-sante-securite-travail",
    name: "Santé Sécurité au Travail — ISO 45001",
    pricingType: "COURSE",
    price: 120000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Santé Sécurité au Travail selon ISO 45001 (35h). Implémenter et auditer un Système de Management de la Santé et Sécurité au Travail (SMSST) selon la norme ISO 45001 : exigences de la norme, évaluation des risques professionnels, planification, mesure et amélioration continue, préparation à la certification. Pour responsables HSE, auditeurs et dirigeants. Code : F076-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 120 000 FCFA.",
  },
  {
    slug: "eduform-technicien-securite-incendie",
    name: "Technicien en Sécurité Incendie",
    pricingType: "COURSE",
    price: 75000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Technicien en Sécurité Incendie (25h). Maîtriser la prévention et la lutte contre les incendies en entreprise : réglementation incendie pour les ERP et entreprises, systèmes de détection et d'extinction, évacuation et plans de secours, formation des équipes de première intervention, maintenance des équipements de sécurité incendie, audit de sécurité. Code : F008-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 75 000 FCFA.",
  },
  {
    slug: "eduform-iso-9001-management-qualite",
    name: "Certification ISO 9001 — Système de Management de la Qualité",
    pricingType: "COURSE",
    price: 120000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — ISO 9001 Système de Management de la Qualité (35h). Comprendre, mettre en œuvre et auditer un SMQ selon la norme ISO 9001 : exigences de la norme, cartographie des processus, documentation (procédures, instructions), revues de direction, audits internes, actions préventives et correctives, préparation à la certification ISO 9001. Pour responsables qualité, auditeurs et directeurs. Code : F079-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 120 000 FCFA.",
  },

  // ── Informatique & Digital Avancés ───────────────────────────────────────
  {
    slug: "eduform-odoo-erp",
    name: "ERP Odoo — Utilisation & Paramétrage",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — ERP Odoo : Utilisation & Paramétrage (30h). Maîtriser l'ERP open source Odoo : prise en main de l'interface, modules Ventes, Achats, Stocks, Comptabilité, CRM et RH, paramétrage des flux de base, création de rapports et tableaux de bord. Pour chefs d'entreprise, directeurs, comptables et gestionnaires souhaitant digitaliser leur gestion avec Odoo. Code : F090-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 90 000 FCFA.",
  },
  {
    slug: "eduform-wordpress-sites-professionnels",
    name: "Création de Sites Web Professionnels avec WordPress",
    pricingType: "COURSE",
    price: 75000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Création de Sites Web avec WordPress (25h). Créer et gérer un site web professionnel sans coder : installation et hébergement, choix et personnalisation de thème, création de pages et articles, plugins essentiels (SEO, formulaires, e-commerce WooCommerce), maintenance et sécurité. Pour entrepreneurs, communicants, TPE/PME et associations souhaitant se créer une présence en ligne. Code : F086-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 75 000 FCFA.",
  },
  {
    slug: "eduform-google-workspace-pme",
    name: "Google Workspace pour PME — Outils Collaboratifs",
    pricingType: "COURSE",
    price: 50000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Google Workspace pour PME (15h). Maîtriser la suite Google pour travailler en équipe efficacement : Gmail professionnel, Google Drive, Docs, Sheets, Slides, Meet, Calendar, Forms et Sites. Organisation des fichiers, partage et collaboration en temps réel, visioconférence, gestion des agendas. Pour équipes de PME, ONG et toute organisation souhaitant collaborer en ligne. Code : F088-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 50 000 FCFA.",
  },
  {
    slug: "eduform-python-analyse-donnees",
    name: "Python pour l'Analyse de Données",
    pricingType: "COURSE",
    price: 120000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Python pour l'Analyse de Données (35h). Introduction à la programmation Python dans un contexte d'analyse de données : bases du langage, manipulation de données avec pandas, visualisation avec matplotlib et seaborn, nettoyage de données, statistiques descriptives, premiers modèles prédictifs avec scikit-learn. Pour analystes, data analysts, chercheurs et professionnels non-informaticiens voulant exploiter Python. Code : F095-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 120 000 FCFA.",
  },
  {
    slug: "eduform-developpement-mobile-flutter",
    name: "Développement Mobile Android & iOS — Flutter/React Native",
    pricingType: "COURSE",
    price: 275000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Programme Certifiant — Développement Mobile Flutter & React Native (55h). Créer des applications mobiles multiplateformes (Android & iOS) : bases Flutter/Dart et React Native/JavaScript, composants UI, navigation, gestion de l'état, connexion aux APIs et bases de données Firebase, déploiement sur les stores (Play Store, App Store). Pour développeurs souhaitant se spécialiser en mobile. Code : F391-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 275 000 FCFA.",
  },
  {
    slug: "eduform-cloud-computing-aws-azure",
    name: "Cloud Computing — AWS & Azure Practitioner",
    pricingType: "COURSE",
    price: 150000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Cloud Computing AWS & Azure Practitioner (40h). Comprendre et utiliser les services cloud des deux leaders mondiaux : fondamentaux du cloud (IaaS, PaaS, SaaS), services clés AWS (EC2, S3, Lambda, RDS) et Azure (VM, Blob Storage, Functions, SQL), sécurité cloud, coûts et tarification, préparation aux certifications AWS Cloud Practitioner et Azure Fundamentals. Code : F388-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 150 000 FCFA.",
  },
  {
    slug: "eduform-outils-gestion-projet-digital",
    name: "Outils de Gestion de Projet Digital — Trello, Asana, Monday, Notion",
    pricingType: "COURSE",
    price: 50000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Outils Gestion de Projet Digital (14h). Maîtriser les principaux outils de gestion de projets et de productivité : Trello (tableaux Kanban), Asana (suivi des tâches), Monday.com (tableaux de bord projets), Notion (notes, bases de données, wikis), Jira (gestion agile). Pour chefs de projet, équipes digitales, managers et consultants. Code : F427-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 50 000 FCFA.",
  },
  {
    slug: "eduform-initiation-informatique-debutants",
    name: "Initiation à l'Informatique pour Adultes Débutants",
    pricingType: "COURSE",
    price: 60000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Formation Pratique — Initiation à l'Informatique pour Débutants (20h). Acquérir les bases de l'outil informatique : utilisation de Windows, gestion des fichiers et dossiers, navigation internet et sécurité en ligne, messagerie email, bases de Word et Excel, impression et numérisation, introduction aux smartphones et applications. Pour toute personne n'ayant jamais utilisé un ordinateur ou souhaitant consolider ses bases. Code : F097-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 60 000 FCFA.",
  },

  // ── Management Spécialisé ─────────────────────────────────────────────────
  {
    slug: "eduform-time-management-priorites",
    name: "Time Management & Gestion des Priorités",
    pricingType: "COURSE",
    price: 60000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Time Management & Gestion des Priorités (20h). Reprendre le contrôle de son temps et de son agenda : méthode GTD (Getting Things Done), matrice d'Eisenhower, gestion des interruptions, technique Pomodoro, priorisation des tâches, organisation du bureau et des emails, planification hebdomadaire et outils de productivité digitale. Pour professionnels, managers et entrepreneurs surchargés. Code : F107-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 60 000 FCFA.",
  },
  {
    slug: "eduform-management-interculturel",
    name: "Management Interculturel & International",
    pricingType: "COURSE",
    price: 120000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Management Interculturel & International (35h). Manager des équipes multiculturelles et réussir dans un environnement international : dimensions culturelles (modèles Hofstede, Hall, Trompenaars), communication interculturelle, adaptation du style de management, négociation internationale, gestion des conflits interculturels et leadership global. Pour cadres internationaux, expatriés, dirigeants et consultants. Code : F404-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 120 000 FCFA.",
  },

  // ── Droit Spécialisé ─────────────────────────────────────────────────────
  {
    slug: "eduform-rgpd-afrique-protection-donnees",
    name: "RGPD Afrique — Protection des Données Personnelles",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — RGPD & Protection des Données en Afrique (30h). Comprendre et appliquer la réglementation sur la protection des données personnelles dans le contexte africain : loi ivoirienne sur la protection des données (ARTCI), RGPD européen et son applicabilité, droits des personnes, obligations des entreprises, DPO, analyse d'impact (AIPD), contrats de traitement et sanctions. Pour juristes, DRH, DSI et dirigeants. Code : F120-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 90 000 FCFA.",
  },
  {
    slug: "eduform-droit-penal-affaires",
    name: "Droit Pénal des Affaires",
    pricingType: "COURSE",
    price: 105000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Droit Pénal des Affaires (35h). Identifier et prévenir les risques pénaux dans les affaires : infractions liées aux sociétés (abus de biens sociaux, présentation de faux bilans, banqueroute), fraudes fiscales, corruption et trafic d'influence, blanchiment de capitaux, cybercriminalité et sanctions. Pour dirigeants, avocats d'affaires, auditeurs et responsables conformité. Code : F133-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 105 000 FCFA.",
  },
  {
    slug: "eduform-droit-bancaire-fintech",
    name: "Droit Bancaire & Réglementation Fintech",
    pricingType: "COURSE",
    price: 105000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Droit Bancaire & Réglementation Fintech (35h). Comprendre le cadre légal et réglementaire du secteur bancaire et des fintechs en Afrique : réglementation BCEAO/UEMOA, agrément bancaire, Mobile Money (réglementation EME), crowdfunding, crypto-actifs, conformité et supervision. Pour juristes, banquiers, fondateurs de fintechs et régulateurs. Code : F131-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 105 000 FCFA.",
  },

  // ── Entrepreneuriat Avancé ───────────────────────────────────────────────
  {
    slug: "eduform-lean-startup-pitch",
    name: "Méthodologie Lean Startup & Pitch",
    pricingType: "COURSE",
    price: 75000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Lean Startup & Pitch (25h). Valider une idée d'affaires rapidement avec peu de ressources : méthode Lean Startup (hypothèses, MVP, pivot), construction d'un Minimum Viable Product, boucle Build-Measure-Learn, métriques clés, et maîtrise du pitch pour convaincre des investisseurs, partenaires et clients. Pour startuppers, porteurs de projet et entrepreneurs. Code : F149-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 75 000 FCFA.",
  },
  {
    slug: "eduform-business-model-canvas-mvp",
    name: "Business Model Canvas & MVP",
    pricingType: "COURSE",
    price: 75000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Business Model Canvas & MVP (25h). Construire et tester un modèle économique solide : le Business Model Canvas (BMC) en profondeur (9 blocs : segments clients, proposition de valeur, canaux, relations clients, sources de revenus, ressources, activités, partenaires, coûts), Value Proposition Canvas, conception du MVP et tests de marché. Pour entrepreneurs, intrapreneurs et porteurs de projet. Code : F154-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 75 000 FCFA.",
  },
  {
    slug: "eduform-startup-tech-incubation",
    name: "Startup Tech — Incubation, Levée de Fonds & Scalabilité",
    pricingType: "COURSE",
    price: 150000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Programme Certifiant — Startup Tech : Incubation & Levée de Fonds (40h). Construire et scaler une startup technologique : écosystème startup africain, accélérateurs et incubateurs, valorisation pre-money/post-money, term sheets et due diligence, types de financement (love money, BA, VC, fonds africains), croissance (growth hacking, product-market fit) et exit strategy. Pour fondateurs de startups tech et entrepreneurs digitaux. Code : F402-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 150 000 FCFA.",
  },
  {
    slug: "eduform-propriete-intellectuelle-startups",
    name: "Innovation & Propriété Intellectuelle pour Startups",
    pricingType: "COURSE",
    price: 75000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Innovation & Propriété Intellectuelle (25h). Protéger ses innovations et ses créations : droits de la propriété intellectuelle en Afrique (OAPI — Organisation Africaine de la Propriété Intellectuelle), brevets, marques, droits d'auteur, dessins et modèles, secrets d'affaires. Procédures de dépôt à l'OAPI, stratégie PI pour startups, licences et valorisation. Code : F403-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 75 000 FCFA.",
  },

  // ── Logistique Spécialisé & BIM ──────────────────────────────────────────
  {
    slug: "eduform-bim-building-information-modeling",
    name: "Introduction au BIM — Building Information Modeling",
    pricingType: "COURSE",
    price: 120000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — BIM Building Information Modeling (35h). Maîtriser le BIM pour révolutionner la gestion des projets de construction : concepts fondamentaux du BIM, niveaux de maturité, logiciels BIM (Revit, ArchiCAD, Navisworks), maquette numérique 3D, coordination pluridisciplinaire, BIM management et protocoles BIM. Pour architectes, ingénieurs BTP, conducteurs de travaux et maîtres d'ouvrage. Code : F175-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 120 000 FCFA.",
  },
  {
    slug: "eduform-logistique-petroliere-produits-dangereux",
    name: "Logistique Pétrolière & Transport de Produits Dangereux",
    pricingType: "COURSE",
    price: 150000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Logistique Pétrolière & Produits Dangereux (40h). Maîtriser la logistique spécifique au secteur pétrolier et au transport de matières dangereuses : réglementation ADR (transport routier de marchandises dangereuses), classification des produits pétroliers, stockage et manutention, sécurité HSE spécifique, documentation de transport international (lettre de transport, manifeste) et gestion des incidents. Code : F172-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 150 000 FCFA.",
  },

  // ── Immobilier Spécialisé ────────────────────────────────────────────────
  {
    slug: "eduform-fiscalite-immobiliere",
    name: "Fiscalité Immobilière & Optimisation Patrimoniale",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Fiscalité Immobilière & Patrimoine (30h). Comprendre et optimiser la fiscalité des opérations immobilières en Côte d'Ivoire : droits de mutation, TVA immobilière, taxe foncière et taxe d'habitation, impôt sur les revenus locatifs (IRVM), plus-values immobilières, montages fiscaux patrimoniaux et démembrement de propriété. Pour investisseurs, agents immobiliers, notaires et propriétaires bailleurs. Code : F182-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 90 000 FCFA.",
  },
  {
    slug: "eduform-gestion-copropriete-syndic",
    name: "Gestion de Copropriété & Syndic",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Gestion de Copropriété & Syndic (30h). Maîtriser la gestion d'une copropriété : statut juridique de la copropriété, règlement de copropriété, assemblées générales, rôle et obligations du syndic, gestion des charges et du budget de copropriété, travaux d'entretien et de rénovation, gestion des conflits entre copropriétaires. Pour gestionnaires immobiliers, syndics et copropriétaires. Code : F184-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 90 000 FCFA.",
  },

  // ── Communication Avancée ────────────────────────────────────────────────
  {
    slug: "eduform-relations-publiques-communication-institutionnelle",
    name: "Responsable Communication & Relations Publiques",
    pricingType: "COURSE",
    price: 120000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Communication & Relations Publiques (35h). Piloter la communication institutionnelle d'une organisation : stratégie de communication, relations avec les médias, conférences de presse, partenariats institutionnels, lobbying, gestion de la réputation et communication de crise. Pour responsables communication, chargés de relations publiques et directeurs généraux. Code : F216/F217-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 120 000 FCFA.",
  },
  {
    slug: "eduform-media-training-porte-parole",
    name: "Porte-Parole & Média Training",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Porte-Parole & Média Training (30h). Devenir un porte-parole efficace face aux médias : techniques de prise de parole devant caméra et micro, gestion des questions difficiles, communication de crise médiatique, préparation des éléments de langage, posture et présentation, simuler des interviews radio, TV et presse. Pour dirigeants, responsables RP et communicants. Code : F218-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 90 000 FCFA.",
  },
  {
    slug: "eduform-copywriting-contenu-corporate",
    name: "Rédaction de Contenus Corporate & Copywriting",
    pricingType: "COURSE",
    price: 75000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Copywriting & Contenus Corporate (25h). Rédiger des contenus professionnels percutants : techniques de copywriting (accroches, AIDA, storytelling), articles de blog et réseaux sociaux, communiqués et dossiers de presse, rapports annuels et brochures commerciales, newsletters, scripts vidéo et contenus SEO. Pour chargés de communication, content managers et marketeurs. Code : F219-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 75 000 FCFA.",
  },
  {
    slug: "eduform-e-reputation-communication-crise-ligne",
    name: "Gestion de l'E-réputation & Communication de Crise en Ligne",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — E-réputation & Crise en Ligne (30h). Surveiller et protéger l'image numérique d'une organisation : outils de veille e-réputation (Google Alerts, Mention, Brand24), gestion des avis clients, réponse aux commentaires négatifs, plan de communication de crise digitale, influence management et protection contre le bad buzz. Pour responsables communication, community managers et dirigeants. Code : F229-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 90 000 FCFA.",
  },

  // ── Marketing & Commercial Avancés ───────────────────────────────────────
  {
    slug: "eduform-crm-gestion-relation-client",
    name: "Gestion de la Relation Client — CRM",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — CRM & Gestion de la Relation Client (30h). Maîtriser la gestion de la relation client avec les outils CRM : choix et paramétrage d'un CRM (HubSpot, Salesforce, Odoo CRM, Zoho), gestion du pipeline commercial, suivi des interactions clients, segmentation, campagnes de fidélisation, analyse des données clients et tableaux de bord commerciaux. Pour commerciaux, responsables marketing et dirigeants. Code : F239-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 90 000 FCFA.",
  },
  {
    slug: "eduform-whatsapp-business-marketing-mobile",
    name: "Marketing Mobile — WhatsApp Business & SMS Pro",
    pricingType: "COURSE",
    price: 60000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Marketing Mobile : WhatsApp Business & SMS Pro (20h). Utiliser le mobile comme levier marketing principal : configuration et optimisation de WhatsApp Business, catalogues produits, messages automatisés et chatbots, campagnes SMS professionnelles, listes de diffusion, métriques de performance et bonnes pratiques de consentement. Pour commerçants, entrepreneurs et responsables marketing. Code : F250-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 60 000 FCFA.",
  },
  {
    slug: "eduform-vente-b2b-prospection-grands-comptes",
    name: "Vente B2B & Prospection Grands Comptes",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Vente B2B & Prospection Grands Comptes (30h). Maîtriser la vente aux entreprises : stratégie de ciblage et segmentation B2B, prospection multi-canaux (téléphone, email, LinkedIn, événements), gestion des décideurs multiples, techniques de vente consultative, soutenance et réponse aux appels d'offres, gestion du cycle de vente long et fidélisation grands comptes. Pour commerciaux B2B, key account managers et directeurs commerciaux. Code : F249-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 90 000 FCFA.",
  },
  {
    slug: "eduform-reponses-appels-offres",
    name: "Élaboration d'Offres Commerciales & Réponses aux Appels d'Offres",
    pricingType: "COURSE",
    price: 105000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Offres Commerciales & Réponses aux AO (35h). Répondre efficacement aux appels d'offres publics et privés : lecture et analyse d'un dossier de consultation, conformité administrative, rédaction de l'offre technique et financière, argumentation de la valeur ajoutée, présentation orale devant un jury, négociation des marchés obtenus et suivi contractuel. Pour chargés d'affaires, directeurs commerciaux et responsables marchés. Code : F253-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 105 000 FCFA.",
  },

  // ── Banque & Assurance Spécialisés ───────────────────────────────────────
  {
    slug: "eduform-banque-digitale-fintech",
    name: "Banque Digitale & Fintech — Certificat Pratique",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Banque Digitale & Fintech (30h). Comprendre la transformation numérique du secteur bancaire et financier : Mobile Banking, Open Banking, API bancaires, paiements digitaux (Mobile Money, cartes, QR code), néobanques, InsurTech, réglementation des fintechs en Afrique de l'Ouest (BCEAO) et cas d'usage concrets. Pour professionnels bancaires, fondateurs de fintechs et entrepreneurs. Code : F264-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 90 000 FCFA.",
  },
  {
    slug: "eduform-lbc-ft-blanchiment-capitaux",
    name: "Lutte contre le Blanchiment de Capitaux & Financement du Terrorisme (LBC-FT)",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — LBC-FT : Lutte contre le Blanchiment (30h). Comprendre et appliquer les obligations LBC-FT dans le secteur financier : cadre réglementaire UEMOA et GAFI, étapes du blanchiment (placement, empilement, intégration), KYC (Know Your Customer), vigilance renforcée, déclarations de soupçon à la CENTIF, sanctions et responsabilités. Pour professionnels de banques, assurances, notaires et fintechs. Code : F269-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 90 000 FCFA.",
  },

  // ── Humanitaire & ONG Avancés ────────────────────────────────────────────
  {
    slug: "eduform-meal-suivi-evaluation-projets",
    name: "Suivi-Évaluation de Projets Humanitaires — MEAL",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — MEAL : Suivi-Évaluation (Monitoring, Evaluation, Accountability & Learning) (30h). Concevoir et piloter un système de suivi-évaluation de projets humanitaires : cadre logique et théorie du changement, indicateurs SMART, collecte de données terrain (KoBoToolbox, ODK), rapports bailleurs (USAID, UE, PNUD), redevabilité et apprentissage organisationnel. Pour coordinateurs de projets, chargés de S&E et agents ONG. Code : F411-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 90 000 FCFA.",
  },
  {
    slug: "eduform-redaction-propositions-financement-ong",
    name: "Rédaction de Propositions de Financement pour ONG & Associations",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Rédaction de Propositions de Financement ONG (30h). Rédiger des propositions de financement convaincantes : identification des bailleurs (USAID, UE, AFD, BAD, fondations), lecture des appels à propositions, construction du cadre logique, rédaction narrative (contexte, objectifs, activités, résultats attendus), élaboration du budget prévisionnel et dossier administratif. Pour responsables d'ONG, chargés de projets et gestionnaires de subventions. Code : F410-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 90 000 FCFA.",
  },

  // ── Gestion de Projets Avancés ───────────────────────────────────────────
  {
    slug: "eduform-fondamentaux-gestion-projets",
    name: "Fondamentaux de la Gestion de Projets — Cycle & Outils",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Fondamentaux Gestion de Projets (30h). Acquérir les bases universelles du management de projets : cycle de vie d'un projet (initiation, planification, exécution, clôture), charte de projet, structure de découpage (WBS), planification et jalons, gestion des parties prenantes, risques et budget, outils pratiques (Gantt, PERT, Trello, MS Project). Pour toute personne impliquée dans la gestion de projets. Code : F416-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 90 000 FCFA.",
  },
  {
    slug: "eduform-gestion-projets-internationaux",
    name: "Gestion de Projets Internationaux & Coopération au Développement",
    pricingType: "COURSE",
    price: 150000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Programme Certifiant — Gestion de Projets Internationaux (40h). Piloter des projets dans un contexte international et de coopération au développement : cadre logique et PCM (Project Cycle Management), gestion multiculturelle, règles et procédures des bailleurs (Banque Mondiale, UE, PNUD), passation de marchés internationale, reporting financier multi-devises et gestion des risques géopolitiques. Pour coordinateurs et responsables de projets internationaux. Code : F420-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 150 000 FCFA.",
  },

  // ── Formations Métiers — Postes Administratifs ───────────────────────────
  {
    slug: "eduform-secretaire-assistant-direction",
    name: "Secrétaire / Assistant(e) de Direction",
    pricingType: "COURSE",
    price: 90000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Secrétaire / Assistante de Direction (30h). Maîtriser toutes les missions d'un(e) assistant(e) de direction : gestion de l'agenda et des priorités du dirigeant, organisation des réunions et déplacements, rédaction professionnelle (courriers, comptes rendus, notes), accueil physique et téléphonique, classement et archivage, outils bureautiques avancés (Word, Excel, Outlook). Code : F337-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel (individuel possible). À partir de 90 000 FCFA.",
  },
  {
    slug: "eduform-gestionnaire-documentaire-archivage",
    name: "Chargé de Gestion Documentaire & Archivage",
    pricingType: "COURSE",
    price: 75000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Gestion Documentaire & Archivage (25h). Organiser et gérer les archives physiques et numériques d'une organisation : plan de classement, cycle de vie des documents, archivage électronique (GED), destruction sécurisée, réglementation sur la conservation des documents, outils numériques de gestion documentaire. Pour archivistes, assistants administratifs et gestionnaires d'information. Code : F340-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 75 000 FCFA.",
  },

  // ── Formations Métiers — Postes Techniques ───────────────────────────────
  {
    slug: "eduform-controleur-gestion-junior",
    name: "Contrôleur de Gestion Junior",
    pricingType: "COURSE",
    price: 150000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Programme Certifiant — Contrôleur de Gestion Junior (40h). Acquérir les compétences opérationnelles d'un contrôleur de gestion : budget et prévisions, suivi des réalisations vs budget, analyse des écarts, calcul des coûts (méthodes des centres d'analyse, ABC), tableaux de bord et reporting, outils (Excel avancé, Power BI) et présentation des résultats à la direction. Code : F297-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 150 000 FCFA.",
  },
  {
    slug: "eduform-technicien-energies-renouvelables",
    name: "Technicien en Énergies Renouvelables — Solaire & Éolien",
    pricingType: "COURSE",
    price: 150000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Programme Certifiant — Technicien Énergies Renouvelables (40h). Concevoir, installer et maintenir des systèmes d'énergie solaire et éolienne : dimensionnement de systèmes solaires photovoltaïques (PV), onduleurs, batteries et stockage, installation et câblage, maintenance préventive, mini-réseaux off-grid, notions d'éolien et d'énergie hybride, normes de sécurité électrique. Pour techniciens, ingénieurs et entrepreneurs du secteur énergétique. Code : F308-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 150 000 FCFA.",
  },
  {
    slug: "eduform-community-manager-social-media",
    name: "Community Manager & Social Media Strategist",
    pricingType: "COURSE",
    price: 120000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Programme Certifiant — Community Manager & Social Media Strategist (35h). Gérer les communautés en ligne et piloter la stratégie réseaux sociaux d'une marque : stratégie de contenu (planning éditorial, formats), animation des communautés, publicité payante (Meta Ads, LinkedIn Ads, TikTok Ads), reporting et analytics, gestion de crise en ligne, outils professionnels (Hootsuite, Buffer, Canva). Code : F323-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 120 000 FCFA.",
  },
  {
    slug: "eduform-responsable-commercial-business-developer",
    name: "Responsable Commercial & Business Developer",
    pricingType: "COURSE",
    price: 150000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Programme Certifiant — Responsable Commercial & Business Developer (40h). Piloter le développement commercial d'une entreprise : définition de la stratégie commerciale, gestion des équipes de vente, prospection B2B et B2C, partenariats stratégiques, pilotage du CRM et des indicateurs commerciaux (CA, taux de conversion, marge), présentation des performances à la direction. Code : F316-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel. À partir de 150 000 FCFA.",
  },

  // ── Développement Personnel Avancé ───────────────────────────────────────
  {
    slug: "eduform-gestion-stress-emotions",
    name: "Gestion du Stress & des Émotions en Milieu Professionnel",
    pricingType: "COURSE",
    price: 60000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Gestion du Stress & des Émotions (20h). Reprendre le contrôle de ses émotions et du stress au travail : mécanismes du stress et de l'anxiété, techniques de relaxation et de pleine conscience (mindfulness), gestion des situations de tension et de conflit, équilibre vie professionnelle/vie personnelle, stratégies de récupération et de résilience émotionnelle. Code : F277-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel (individuel possible). À partir de 60 000 FCFA.",
  },
  {
    slug: "eduform-motivation-discipline-productivite",
    name: "Motivation, Discipline & Productivité Personnelle",
    pricingType: "COURSE",
    price: 60000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Motivation, Discipline & Productivité (20h). Construire des habitudes gagnantes et booster sa productivité : définition d'objectifs SMART, techniques de motivation intrinsèque, discipline personnelle et gestion de la procrastination, routines matinales, systèmes de productivité (GTD, time blocking), gestion de l'énergie et de la concentration. Code : F290-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel (individuel possible). À partir de 60 000 FCFA.",
  },
  {
    slug: "eduform-developpement-carriere-employabilite",
    name: "Développement de la Carrière & Employabilité",
    pricingType: "COURSE",
    price: 75000,
    rate: 10,
    siteUrl: "https://ibig-eduform.com",
    description: "Certificat Pratique — Développement de la Carrière & Employabilité (25h). Construire et accélérer sa carrière : bilan de compétences, définition d'un projet professionnel clair, optimisation du CV et du profil LinkedIn, techniques de recherche d'emploi (candidatures spontanées, réseau, LinkedIn), préparation aux entretiens, négociation salariale et gestion de la progression de carrière. Code : F291-IBIG-EDUFORM. Disponible en e-learning, en ligne (live) et en présentiel (individuel possible). À partir de 75 000 FCFA.",
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


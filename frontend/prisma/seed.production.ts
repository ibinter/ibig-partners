/**
 * Seed de PRODUCTION — ne contient PAS de données de démonstration.
 * Crée uniquement : branches, produits, compte SuperAdmin, paramètres de base.
 *
 * Usage : npx tsx prisma/seed.production.ts
 * Variables requises : DATABASE_PROVIDER + DATABASE_URL + ADMIN_EMAIL + ADMIN_PASSWORD
 */

import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@ibigpartners.com";
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Désactivation des anciennes branches (au lieu de suppression pour éviter les FK constraints)
  console.log("→ Nettoyage anciennes branches…");
  const oldSlugs = [
    "eduform",            // renommé ibig-eduform
    "conseil-plus",       // renommé ibig-conseil-plus
    "immo-trust",         // renommé ibig-immo-trust
    "ibig-immotrust",     // doublon seed dev
    // "ibig-digital" conservé — branche officielle IBIG DIGITAL (intermark-business.com/digital)
    "multiservices",      // renommé ibig-multiservices
    "ibig-tv",            // supprimé (hors liste officielle)
    "intermark-business", // n'est pas une branche du programme
  ];
  const deactivated = await prisma.branch.updateMany({
    where: { slug: { in: oldSlugs } },
    data: { active: false },
  });
  if (deactivated.count > 0) {
    console.log(`   ${deactivated.count} ancienne(s) branche(s) désactivée(s).`);
  }

  console.log("→ Branches & produits…");

  const branchesData = [
    {
      slug: "ibig-soft", name: "IBIG SOFT",
      tagline: "Édition logicielle, SaaS & applications métiers",
      description: "IBIG SOFT conçoit et commercialise des solutions SaaS et ERP adaptés aux réalités africaines : gestion scolaire (Scolaby), gestion de flotte (IBIG Fleet 360), gestion locative (Lokativo), gestion commerciale (GESCOMXEL), livraison (Zelivry) et bien d'autres logiciels métiers pour PME et institutions.",
      website: "https://ibigsoft.com/",
      offerType: "Abonnements mensuels & annuels", commissionModel: "20% N1 • 10% N2 • 5% N3 (dégressif sur 4 mois) | Annuel : 20% N1 • 8% N2 • 3% N3",
      order: 1,
      products: [
        { slug: "scolaby", name: "Scolaby", pricingType: "MONTHLY_SUB", price: 30000, rate: 20 },
        { slug: "scolaby-annuel", name: "Scolaby (Annuel)", pricingType: "ANNUAL_SUB", price: 300000, rate: 20 },
        { slug: "ibig-fleet-360", name: "IBIG Fleet 360", pricingType: "MONTHLY_SUB", price: 45000, rate: 20 },
        { slug: "lokativo", name: "Lokativo", pricingType: "MONTHLY_SUB", price: 35000, rate: 20 },
        { slug: "gescomxel", name: "GESCOMXEL", pricingType: "MONTHLY_SUB", price: 20000, rate: 20 },
        { slug: "zelivry", name: "Zelivry", pricingType: "MONTHLY_SUB", price: 25000, rate: 20 },
      ],
    },
    {
      slug: "ibig-eduform", name: "IBIG EDUFORM",
      tagline: "Formation professionnelle & insertion certifiante",
      description: "IBIG EDUFORM accompagne les particuliers et professionnels à travers des formations certifiantes (200+ programmes), du coaching, de l'e-learning et des services d'insertion professionnelle. Formations en présentiel et à distance couvrant la comptabilité, le digital, la gestion, le BTP, la santé et bien d'autres domaines.",
      website: "https://ibig-eduform.com/",
      offerType: "Formations courtes & certifiantes", commissionModel: "10% N1 • 5% N2 • 2% N3",
      order: 2,
      products: [
        // ── Gestion & Finance ────────────────────────────────────────
        { slug: "formation-compta", name: "Formation Comptabilité Générale", pricingType: "COURSE", price: 150000, rate: 10,
          description: "Principes comptables, journaux, grand livre, bilan, compte de résultat. Pour débutants et autodidactes." },
        { slug: "formation-compta-fiscalite", name: "Formation Comptabilité & Fiscalité Avancée", pricingType: "COURSE", price: 200000, rate: 10,
          description: "Comptabilité approfondie, fiscalité des entreprises, déclarations TVA, IS, charges sociales." },
        { slug: "formation-finance-gestion", name: "Formation Finance & Gestion Financière", pricingType: "COURSE", price: 180000, rate: 10,
          description: "Analyse financière, tableaux de bord, gestion de trésorerie, investissement et rentabilité." },
        { slug: "formation-gestion-pme", name: "Formation Gestion des PME", pricingType: "COURSE", price: 160000, rate: 10,
          description: "Pilotage d'une PME : gestion commerciale, admin, finance, RH et stratégie." },
        { slug: "formation-business-plan", name: "Formation Rédaction de Business Plan", pricingType: "COURSE", price: 120000, rate: 10,
          description: "Construire un business plan bancable : étude de marché, modèle économique, projections financières." },
        // ── Digital & Tech ───────────────────────────────────────────
        { slug: "formation-digital", name: "Formation Marketing Digital", pricingType: "COURSE", price: 120000, rate: 10,
          description: "Réseaux sociaux, SEO, publicité Meta & Google Ads, emailing, analytics." },
        { slug: "formation-dev", name: "Formation Développement Web", pricingType: "COURSE", price: 200000, rate: 10,
          description: "HTML, CSS, JavaScript, React, Next.js — du débutant au développeur opérationnel." },
        { slug: "formation-dev-mobile", name: "Formation Développement Mobile (Android)", pricingType: "COURSE", price: 250000, rate: 10,
          description: "Développement d'applications Android avec Kotlin et Flutter." },
        { slug: "formation-ia-chatgpt", name: "Formation IA & Productivité (ChatGPT, Copilot…)", pricingType: "COURSE", price: 80000, rate: 10,
          description: "Maîtriser l'IA générative pour gagner en productivité : rédaction, analyse, automatisation." },
        { slug: "formation-cm-reseaux", name: "Formation Community Management & Réseaux Sociaux", pricingType: "COURSE", price: 100000, rate: 10,
          description: "Stratégie, création de contenu, planification, gestion de communauté et publicité sociale." },
        // ── Management & Leadership ──────────────────────────────────
        { slug: "formation-leadership", name: "Formation Leadership & Management d'Équipe", pricingType: "COURSE", price: 180000, rate: 10,
          description: "Styles de management, motivation, communication, gestion des conflits, prise de décision." },
        { slug: "formation-gestion-projet", name: "Formation Gestion de Projet (PMP/PMBOK)", pricingType: "COURSE", price: 200000, rate: 10,
          description: "Méthodes classiques (PMI) et agiles (Scrum, Kanban) pour mener ses projets à terme." },
        { slug: "formation-rh-paie", name: "Formation RH & Gestion de la Paie", pricingType: "COURSE", price: 150000, rate: 10,
          description: "Recrutement, contrats, gestion des congés, bulletin de paie, droit du travail africain." },
        { slug: "formation-entrepreneuriat", name: "Formation Entrepreneuriat & Business Model", pricingType: "COURSE", price: 140000, rate: 10,
          description: "De l'idée au lancement : validation, business model canvas, pitch, financement, premiers clients." },
        { slug: "formation-vente-negociation", name: "Formation Vente & Négociation Commerciale", pricingType: "COURSE", price: 130000, rate: 10,
          description: "Techniques de vente BtoB et BtoC, prospection, closing, négociation, fidélisation." },
        // ── Secteurs spécialisés ──────────────────────────────────────
        { slug: "formation-btp", name: "Formation BTP & Génie Civil", pricingType: "COURSE", price: 220000, rate: 10,
          description: "Techniques de construction, conduite de chantier, métrés, devis, réglementation." },
        { slug: "formation-sante", name: "Formation Santé & Soins Infirmiers", pricingType: "COURSE", price: 180000, rate: 10,
          description: "Aide-soignant, soins de base, hygiène, pharmacologie, gestes d'urgence." },
        { slug: "formation-logistique", name: "Formation Logistique & Supply Chain", pricingType: "COURSE", price: 160000, rate: 10,
          description: "Gestion des stocks, transport, import-export, incoterms, douane africaine." },
        { slug: "formation-tourisme", name: "Formation Tourisme & Hôtellerie", pricingType: "COURSE", price: 140000, rate: 10,
          description: "Accueil, gestion hôtelière, agence de voyages, e-tourisme." },
        { slug: "formation-agriculture", name: "Formation Agriculture Moderne & Agrobusiness", pricingType: "COURSE", price: 150000, rate: 10,
          description: "Cultures vivrières et de rente, agriculture urbaine, transformation agroalimentaire, accès aux marchés." },
        { slug: "formation-droit-affaires", name: "Formation Droit des Affaires", pricingType: "COURSE", price: 170000, rate: 10,
          description: "Droit OHADA, contrats commerciaux, propriété intellectuelle, résolution des litiges." },
        { slug: "formation-export-commerce", name: "Formation Export & Commerce International", pricingType: "COURSE", price: 180000, rate: 10,
          description: "Procédures douanières, Incoterms, financement export, prospection internationale, régimes ALE." },
        // ── Langues & Communication ──────────────────────────────────
        { slug: "formation-anglais-pro", name: "Formation Anglais Professionnel", pricingType: "COURSE", price: 100000, rate: 10,
          description: "Business English : réunions, emails, présentations, négociations en anglais." },
        { slug: "formation-francais-affaires", name: "Formation Français des Affaires", pricingType: "COURSE", price: 80000, rate: 10,
          description: "Expression écrite et orale professionnelle en français : rapports, comptes rendus, prise de parole." },
        { slug: "formation-prise-parole", name: "Formation Prise de Parole en Public", pricingType: "COURSE", price: 90000, rate: 10,
          description: "Confiance, structure du discours, gestion du stress, storytelling professionnel." },
        // ── Coaching ────────────────────────────────────────────────
        { slug: "coaching-individuel", name: "Coaching Professionnel Individuel", pricingType: "SERVICE", price: 200000, rate: 10,
          description: "10 séances de coaching (1h/séance) : objectifs de carrière, transition, leadership, performance." },
        { slug: "programme-mba-accelere", name: "Programme MBA Accéléré", pricingType: "COURSE", price: 500000, rate: 10,
          description: "Programme intensif couvrant finance, marketing, management, stratégie et entrepreneuriat. Certifié." },
      ],
    },
    {
      slug: "ibig-immo-trust", name: "IBIG IMMO TRUST",
      tagline: "Immobilier sécurisé & rentable",
      description: "IBIG IMMO TRUST propose des solutions immobilières complètes : gestion locative, transactions immobilières, conseil en investissement, assistance diaspora, régularisation foncière et BTP. Tous les services pour sécuriser et rentabiliser votre patrimoine immobilier en Côte d'Ivoire et en Afrique.",
      website: "https://ibigimmotrust.com/",
      offerType: "Service / Produit immobilier", commissionModel: "5% N1 • 3% N2 • 1% N3",
      order: 3,
      products: [
        { slug: "mandat-vente", name: "Mandat de Vente Immobilière", pricingType: "SERVICE", price: 2000000, rate: 5,
          description: "Mise en vente d'un bien immobilier : évaluation, annonce, visites, négociation, acte de vente." },
        { slug: "gestion-locative", name: "Gestion Locative", pricingType: "MONTHLY_SUB", price: 50000, rate: 5,
          description: "Gestion complète d'un bien en location : recherche locataire, contrat, quittances, entretien, relances." },
        { slug: "conseil-investissement", name: "Conseil en Investissement Immobilier", pricingType: "SERVICE", price: 300000, rate: 5,
          description: "Analyse du marché, sélection de biens rentables, stratégie locative ou revente." },
        { slug: "vente-terrain", name: "Vente Terrain Viabilisé", pricingType: "SERVICE", price: 3000000, rate: 5,
          description: "Terrains titrés ou en cours de régularisation en zones résidentielles et industrielles." },
        { slug: "location-villa", name: "Location Villa & Maison", pricingType: "SERVICE", price: 500000, rate: 5,
          description: "Mise en relation propriétaires-locataires pour villas, maisons et duplex en Côte d'Ivoire." },
        { slug: "location-appartement", name: "Location Appartement Meublé", pricingType: "MONTHLY_SUB", price: 150000, rate: 5,
          description: "Appartements meublés disponibles à la location mensuelle en zones urbaines." },
        { slug: "estimation-immobiliere", name: "Estimation Immobilière", pricingType: "SERVICE", price: 100000, rate: 5,
          description: "Estimation professionnelle de la valeur vénale ou locative d'un bien immobilier." },
        { slug: "assistance-diaspora", name: "Assistance Diaspora (Achat à Distance)", pricingType: "SERVICE", price: 200000, rate: 5,
          description: "Accompagnement complet pour les Africains de la diaspora qui investissent à distance : recherche, suivi, acte notarié." },
        { slug: "regularisation-fonciere", name: "Régularisation Foncière & Titre", pricingType: "SERVICE", price: 500000, rate: 5,
          description: "Obtention de titres fonciers, régularisation de lots, litiges fonciers, bornage." },
        { slug: "btp-construction", name: "BTP — Construction & Rénovation", pricingType: "SERVICE", price: 5000000, rate: 5,
          description: "Construction clé en main, rénovation, extension : études, devis, suivi de chantier, livraison." },
        { slug: "promotion-immobiliere", name: "Promotion Immobilière (Viager / Plan)", pricingType: "SERVICE", price: 8000000, rate: 5,
          description: "Ventes en état futur d'achèvement (VEFA), programmes résidentiels et commerciaux." },
      ],
    },
    {
      slug: "ibig-market", name: "IBIG MARKET",
      tagline: "Vente physique & numérique — boutique universelle",
      description: "IBIG MARKET est la plateforme e-commerce et de vente physique du groupe IBIG SARL. Vente de produits IT, mobilier, fournitures de bureau, matériel divers. Logistique et livraison incluses. Boutique universelle accessible en ligne et en magasin.",
      website: "https://ibig-market.com/",
      offerType: "Produit / E-commerce", commissionModel: "8% N1 • 4% N2 • 2% N3",
      order: 4,
      products: [
        { slug: "produits-it", name: "Produits IT & Informatique", pricingType: "PRODUCT", price: 50000, rate: 8,
          description: "Ordinateurs, accessoires, imprimantes, routeurs, câblage réseau — pour entreprises et particuliers." },
        { slug: "mobilier-bureau", name: "Mobilier de Bureau", pricingType: "PRODUCT", price: 150000, rate: 8,
          description: "Bureaux, chaises, rangements, salles de réunion — neuf et occasion professionnelle." },
        { slug: "fournitures-bureau", name: "Fournitures de Bureau", pricingType: "PRODUCT", price: 20000, rate: 8,
          description: "Papeterie, cartouches, classeurs, consommables — livraison en entreprise." },
        { slug: "materiel-audiovisuel", name: "Matériel Audiovisuel & Projection", pricingType: "PRODUCT", price: 200000, rate: 8,
          description: "Vidéoprojecteurs, écrans, systèmes de sonorisation, caméras de surveillance." },
        { slug: "climatisation-electricite", name: "Climatisation & Matériel Électrique", pricingType: "PRODUCT", price: 250000, rate: 8,
          description: "Climatiseurs, onduleurs, groupes électrogènes, installation électrique." },
        { slug: "materiel-cuisine-pro", name: "Matériel de Cuisine Professionnel", pricingType: "PRODUCT", price: 500000, rate: 8,
          description: "Équipements pour restaurants, hôtels, traiteurs : fours, réfrigérateurs, ustensiles pro." },
        { slug: "materiel-medical", name: "Matériel Médical & Paramédical", pricingType: "PRODUCT", price: 300000, rate: 8,
          description: "Équipements médicaux pour cabinets, cliniques, maternités." },
        { slug: "energie-solaire-kits", name: "Kits Énergie Solaire", pricingType: "PRODUCT", price: 400000, rate: 8,
          description: "Panneaux solaires, batteries, convertisseurs — solutions pour zones urbaines et rurales." },
      ],
    },
    {
      slug: "ibig-digital", name: "IBIG DIGITAL",
      tagline: "Sites web, applications, e-commerce & identité visuelle",
      description: "IBIG DIGITAL (IBIG Software Solutions) est le pôle création & développement digital du groupe IBIG SARL : sites internet professionnels, applications web (PWA) et mobiles Android/iOS, sites e-commerce, identité visuelle (logo + charte), community management, cartes professionnelles digitales et physiques, hébergement, sécurisation et maintenance. Offre globale « Création · Développement · Identité visuelle · Accompagnement ». Tarification indicative, devis personnalisé après étude des besoins.",
      website: "https://digital.intermark-business.com/",
      offerType: "Packs & services digitaux (sites, apps, e-commerce, identité visuelle)", commissionModel: "10% N1 • 5% N2 • 2% N3",
      order: 5,
      products: [
        // ── Packs groupés (prix remisés) ──────────────────────────────
        { slug: "pack-visibilite", name: "Pack Visibilité", pricingType: "SERVICE", price: 225000, rate: 10,
          description: "Pour indépendants et TPE qui démarrent. Inclus : logo + mini-charte, carte digitale sécurisée, page Facebook pro, WhatsApp Business. Valeur séparée 275 000 F — économie 50 000 F." },
        { slug: "pack-lancement-entreprise", name: "Pack Lancement Entreprise", pricingType: "SERVICE", price: 525000, rate: 10,
          description: "La formule la plus demandée. Inclus : site internet pro (domaine + hébergement 1 an), logo + charte, page Facebook pro, carte digitale, WhatsApp Business, 2 e-mails pro. Valeur séparée 645 000 F — économie 120 000 F." },
        { slug: "pack-commerce-en-ligne", name: "Pack Commerce en Ligne", pricingType: "SERVICE", price: 850000, rate: 10,
          description: "Pour vendre en ligne dès la mise en service. Inclus : site e-commerce (domaine + hébergement 1 an), logo + charte, paiement en ligne, SEO initial, page Facebook pro, carte digitale, WhatsApp Business. Valeur séparée 1 050 000 F — économie 200 000 F." },
        { slug: "pack-mobile-pro", name: "Pack Mobile Pro", pricingType: "SERVICE", price: 1100000, rate: 10,
          description: "Pour une activité qui passe par une application mobile. Inclus : application Android sur cahier des charges, logo + charte, carte digitale, 3 mois de maintenance. Valeur séparée 1 350 000 F — économie 250 000 F." },
        { slug: "pack-digital-360", name: "Pack Digital 360", pricingType: "SERVICE", price: 1250000, rate: 10,
          description: "La formule complète : site + application web (PWA), logo + charte, SEO initial, page Facebook pro, carte digitale, WhatsApp Business, 3 e-mails pro, 3 mois de community management, 3 mois de maintenance. Valeur séparée 1 580 000 F — économie 330 000 F." },
        // ── Prestations à l'unité ─────────────────────────────────────
        { slug: "digital-site-vitrine", name: "Site Internet Professionnel", pricingType: "SERVICE", price: 350000, rate: 10,
          description: "Site vitrine responsive : design personnalisé, pages clés, contact, WhatsApp, réseaux sociaux, carte de localisation, domaine + hébergement 1 an, SSL, formation et assistance. Délai 7 à 20 jours." },
        { slug: "site-app-web-pwa", name: "Site + Application Web téléchargeable (PWA)", pricingType: "SERVICE", price: 650000, rate: 10,
          description: "Site professionnel + application web progressive installable sur smartphone, base de données, espace admin, domaine + hébergement 1 an, SSL. Délai 15 à 30 jours." },
        { slug: "app-mobile-android", name: "Application Mobile Android", pricingType: "SERVICE", price: 850000, rate: 10,
          description: "Application Android sur cahier des charges : UX/UI, base de données, interface admin, authentification, notifications, API, hébergement backend 1 an. Prix définitif après analyse du cahier des charges." },
        { slug: "app-android-ios", name: "Application Android + iOS", pricingType: "SERVICE", price: 1500000, rate: 10,
          description: "Application multiplateforme Android + iOS : UX/UI, backend, base de données, interface d'administration, API, hébergement 1 an, assistance à la publication (comptes développeurs à la charge du client)." },
        { slug: "digital-site-ecommerce", name: "Site E-commerce", pricingType: "SERVICE", price: 600000, rate: 10,
          description: "Boutique en ligne complète : catalogue, prix et stocks, panier, commandes, comptes clients, tableau de bord admin, WhatsApp, paiement en ligne, domaine + hébergement 1 an, SSL." },
        { slug: "page-facebook-pro", name: "Page Facebook Professionnelle", pricingType: "SERVICE", price: 50000, rate: 10,
          description: "Création/configuration de page pro : catégorie, visuels de profil et couverture, présentation, bouton d'action, lien WhatsApp, localisation, horaires et paramétrage." },
        { slug: "digital-cm-essentiel", name: "Community Management – Formule Essentielle", pricingType: "MONTHLY_SUB", price: 100000, rate: 10,
          description: "Gestion de présence digitale : planification, création et publication de contenus (Facebook, Instagram), animation, réponses, statistiques, rapport mensuel." },
        { slug: "digital-cm-pro", name: "Community Management – Formule Pro", pricingType: "MONTHLY_SUB", price: 150000, rate: 10,
          description: "Formule Standard : couverture élargie des réseaux, plus de contenus et de reporting." },
        { slug: "digital-cm-premium", name: "Community Management – Formule Premium", pricingType: "MONTHLY_SUB", price: 250000, rate: 10,
          description: "Formule Premium : community management complet, création de visuels avancés et accompagnement renforcé." },
        { slug: "carte-digitale-securisee", name: "Carte Digitale Professionnelle Sécurisée", pricingType: "SERVICE", price: 50000, rate: 10,
          description: "Carte de visite numérique accessible par smartphone, partageable par lien ou QR Code : identité, contacts, WhatsApp, réseaux sociaux, localisation, interface responsive." },
        { slug: "carte-physique-securisee", name: "Carte Professionnelle Physique Sécurisée", pricingType: "PRODUCT", price: 15000, rate: 10,
          description: "Carte physique avec QR Code d'accès aux informations numériques : conception graphique, logo, impression. Prix selon quantité, support, format et finition." },
        { slug: "digital-logo-charte", name: "Logo + Charte Graphique", pricingType: "SERVICE", price: 150000, rate: 10,
          description: "Identité visuelle : recherche créative, logo et déclinaisons (couleur, monochrome, clair/foncé), couleurs et typographies, fichiers web et impression, mini-charte. Charte complète sur devis." },
        // ── Prestations complémentaires ───────────────────────────────
        { slug: "digital-seo", name: "Référencement SEO Initial", pricingType: "SERVICE", price: 100000, rate: 10 },
        { slug: "whatsapp-business", name: "Configuration WhatsApp Business", pricingType: "SERVICE", price: 25000, rate: 10 },
        { slug: "email-pro", name: "Adresse E-mail Professionnelle", pricingType: "SERVICE", price: 10000, rate: 10,
          description: "Par adresse." },
        { slug: "integration-paiement", name: "Intégration Paiement en Ligne", pricingType: "SERVICE", price: 75000, rate: 10 },
        { slug: "creation-contenu-web", name: "Création de Contenu Web", pricingType: "SERVICE", price: 50000, rate: 10 },
        { slug: "maintenance-site", name: "Maintenance Site Web", pricingType: "MONTHLY_SUB", price: 75000, rate: 10,
          description: "Corrections et mises à jour, sauvegardes, surveillance et sécurité, assistance, petites modifications de contenu." },
        { slug: "maintenance-app", name: "Maintenance Application", pricingType: "MONTHLY_SUB", price: 100000, rate: 10,
          description: "Surveillance et corrections, maintenance technique, sauvegardes et sécurité, assistance, évolutions mineures." },
        { slug: "nom-domaine-renouvellement", name: "Nom de Domaine (renouvellement annuel)", pricingType: "ANNUAL_SUB", price: 25000, rate: 10 },
        { slug: "hebergement-renouvellement", name: "Hébergement (renouvellement annuel)", pricingType: "ANNUAL_SUB", price: 50000, rate: 10 },
      ],
    },
    {
      slug: "ibig-digital-kits", name: "IBIG DIGITAL KITS",
      tagline: "Technologies & Transformation Numérique",
      description: "IBIG DIGITAL KITS accompagne les entreprises dans leur transformation numérique : intégration ERP (SAP, SAGE, Odoo), GED, développement web et mobile, intelligence artificielle, chatbots, kits numériques prêts à l'emploi et marketing digital. Des solutions technologiques clé en main pour digitaliser votre activité.",
      website: "https://kits.intermark-business.com/",
      offerType: "Service / Produit digital", commissionModel: "10% N1 • 5% N2 • 2% N3",
      order: 6,
      products: [
        { slug: "site-vitrine", name: "Site Vitrine (Kit)", pricingType: "PRODUCT", price: 400000, rate: 10 },
        { slug: "app-mobile", name: "Application Mobile (Kit)", pricingType: "PRODUCT", price: 1500000, rate: 10 },
        { slug: "identite-visuelle", name: "Identité Visuelle (Kit)", pricingType: "PRODUCT", price: 150000, rate: 10 },
        { slug: "integration-erp", name: "Intégration ERP", pricingType: "SERVICE", price: 800000, rate: 10,
          description: "Déploiement et paramétrage ERP : Odoo, SAP Business One, SAGE, Dolibarr — selon besoins métiers." },
        { slug: "chatbot-ia", name: "Chatbot & IA Conversationnelle", pricingType: "SERVICE", price: 350000, rate: 10,
          description: "Déploiement de chatbots IA pour WhatsApp, site web, Facebook Messenger — support client 24h/24." },
        { slug: "audit-si", name: "Audit Système d'Information", pricingType: "SERVICE", price: 300000, rate: 10,
          description: "Inventaire du parc informatique, analyse des flux, sécurité réseau, recommandations." },
        { slug: "ged-gestion-documentaire", name: "Gestion Électronique des Documents (GED)", pricingType: "SERVICE", price: 600000, rate: 10,
          description: "Dématérialisation, archivage numérique, workflows de validation, accès sécurisé." },
        { slug: "cybersecurite-pme", name: "Cybersécurité PME", pricingType: "SERVICE", price: 400000, rate: 10,
          description: "Sécurisation du réseau, antivirus entreprise, politique de mots de passe, sensibilisation des équipes." },
        { slug: "formation-informatique", name: "Formation Informatique & Bureautique", pricingType: "COURSE", price: 80000, rate: 10,
          description: "Word, Excel, PowerPoint, Outlook — maîtrise des outils bureautiques pour collaborateurs." },
        { slug: "infogérance-it", name: "Infogérance & Support Informatique", pricingType: "MONTHLY_SUB", price: 150000, rate: 10,
          description: "Maintenance préventive et corrective du parc, helpdesk, supervision réseau, mises à jour." },
      ],
    },
    {
      slug: "ibig-conseil-plus", name: "IBIG CONSEIL+",
      tagline: "Structuration, Comptabilité & Juridique",
      description: "IBIG CONSEIL+ accompagne les entreprises, institutions et ONG dans leur structuration organisationnelle, la gestion administrative et financière, ainsi que la mise en conformité juridique. Audit organisationnel, conseil stratégique, comptabilité, fiscalité, études de marché et accompagnement à la création d'entreprise.",
      website: "https://intermark-business.com/conseil",
      offerType: "Service sur devis", commissionModel: "10% N1 • 5% N2 • 2% N3",
      order: 7,
      products: [
        { slug: "audit-organisationnel", name: "Audit Organisationnel", pricingType: "SERVICE", price: 500000, rate: 10,
          description: "Diagnostic de l'organisation, processus, RH, finances — rapport avec recommandations." },
        { slug: "etude-marche", name: "Étude de Marché", pricingType: "SERVICE", price: 300000, rate: 10,
          description: "Analyse quantitative et qualitative du marché cible, concurrence, opportunités et stratégie d'entrée." },
        { slug: "accompagnement-creation", name: "Accompagnement Création d'Entreprise", pricingType: "SERVICE", price: 200000, rate: 10,
          description: "De l'idée à l'immatriculation : choix de statut, rédaction des statuts, enregistrement RCCM, fiscalité." },
        { slug: "creation-entreprise-cle-en-main", name: "Création d'Entreprise Clé en Main", pricingType: "SERVICE", price: 350000, rate: 10,
          description: "Package complet : statuts, RCCM, NCC, compte bancaire pro, domiciliation, cachet, premier bilan." },
        { slug: "domiciliation-entreprise", name: "Domiciliation d'Entreprise", pricingType: "MONTHLY_SUB", price: 30000, rate: 10,
          description: "Adresse juridique et commerciale, réception de courrier, secrétariat de base." },
        { slug: "comptabilite-externalisee", name: "Comptabilité Externalisée", pricingType: "MONTHLY_SUB", price: 80000, rate: 10,
          description: "Tenue de comptabilité mensuelle, rapprochements, déclarations fiscales, bilan annuel." },
        { slug: "redaction-business-plan-conseil", name: "Rédaction de Business Plan", pricingType: "SERVICE", price: 250000, rate: 10,
          description: "Business plan bancable pour levée de fonds, appel à projets, développement commercial." },
        { slug: "conseil-levee-fonds", name: "Conseil en Levée de Fonds", pricingType: "SERVICE", price: 300000, rate: 10,
          description: "Identification des financements (banques, fonds, subventions), constitution des dossiers, pitch." },
        { slug: "assistance-juridique-contrats", name: "Assistance Juridique & Rédaction de Contrats", pricingType: "SERVICE", price: 200000, rate: 10,
          description: "Rédaction et relecture de contrats commerciaux, baux, partenariats, CGV/CGU." },
        { slug: "assistance-fiscale", name: "Assistance Fiscale & Déclarations", pricingType: "SERVICE", price: 150000, rate: 10,
          description: "Déclarations TVA, IS, BIC, DAS, avis d'imposition, contentieux fiscal." },
        { slug: "audit-financier", name: "Audit Financier", pricingType: "SERVICE", price: 600000, rate: 10,
          description: "Examen des comptes, fiabilité des états financiers, rapport de commissariat." },
        { slug: "conseil-strategie", name: "Conseil en Stratégie d'Entreprise", pricingType: "SERVICE", price: 400000, rate: 10,
          description: "Diagnostic SWOT, plan stratégique 3 ans, diversification, positionnement, croissance." },
        { slug: "formation-dirigeants", name: "Formation Dirigeants & Cadres (Sur Mesure)", pricingType: "SERVICE", price: 350000, rate: 10,
          description: "Programmes de formation intra-entreprise adaptés aux équipes de direction." },
        { slug: "certification-iso-accompagnement", name: "Accompagnement Certification ISO", pricingType: "SERVICE", price: 800000, rate: 10,
          description: "Préparation et accompagnement à la certification ISO 9001, 14001, 45001 — audit blanc inclus." },
      ],
    },
    {
      slug: "ibig-partners-branch", name: "IBIG PARTNERS",
      tagline: "Représentation commerciale & Développement de marché",
      description: "IBIG PARTNERS est le programme d'affiliation multi-niveaux du groupe IBIG SARL. Mise en relation B2B, campagnes de développement commercial, implantation régionale et gestion des réseaux de partenaires. Rejoignez le réseau et générez des commissions en promouvant les services du groupe.",
      website: "https://www.ibigpartners.com/",
      offerType: "Programme d'affiliation", commissionModel: "Variable selon branche & niveau",
      order: 8,
      products: [],
    },
    {
      slug: "ibig-multiservices", name: "IBIG MULTISERVICES",
      tagline: "Solutions polyvalentes — événementiel, logistique & services",
      description: "IBIG MULTISERVICES propose une gamme étendue de services aux particuliers et entreprises : organisation événementielle, déménagement, maintenance et dépannage, accueil VIP, logistique, BTP, tourisme et transport. Une solution polyvalente pour tous vos besoins de services.",
      website: "https://intermark-business.com/multiservices",
      offerType: "Service / Produit", commissionModel: "10% N1 • 5% N2 • 2% N3",
      order: 9,
      products: [
        { slug: "evenementiel", name: "Organisation Événementielle", pricingType: "SERVICE", price: 500000, rate: 10,
          description: "Conférences, séminaires, lancements de produits, galas, mariages — gestion complète clé en main." },
        { slug: "traiteur-evenementiel", name: "Traiteur & Restauration Événementielle", pricingType: "SERVICE", price: 300000, rate: 10,
          description: "Buffets, cocktails, repas assis — pour événements d'entreprise et particuliers." },
        { slug: "demenagement", name: "Déménagement & Transport", pricingType: "SERVICE", price: 150000, rate: 10,
          description: "Déménagement particuliers et entreprises, transport de meubles, emballage, stockage temporaire." },
        { slug: "maintenance", name: "Maintenance & Dépannage Immobilier", pricingType: "SERVICE", price: 80000, rate: 10,
          description: "Plomberie, électricité, menuiserie, peinture, carrelage — intervention rapide." },
        { slug: "nettoyage-entretien", name: "Nettoyage & Entretien de Bâtiments", pricingType: "MONTHLY_SUB", price: 120000, rate: 10,
          description: "Nettoyage bureaux, résidences, chantiers — équipe professionnelle et équipée." },
        { slug: "securite-gardiennage", name: "Sécurité & Gardiennage", pricingType: "MONTHLY_SUB", price: 200000, rate: 10,
          description: "Agents de sécurité, gardiennage de site, accueil et contrôle d'accès." },
        { slug: "impression-reprographie", name: "Impression & Reprographie", pricingType: "SERVICE", price: 50000, rate: 10,
          description: "Impressions grand format, brochures, flyers, roll-up, papeterie d'entreprise." },
        { slug: "secretariat-externalise", name: "Secrétariat Externalisé", pricingType: "MONTHLY_SUB", price: 100000, rate: 10,
          description: "Permanence téléphonique, rédaction de courriers, gestion d'agenda, accueil." },
        { slug: "coursier-livraison", name: "Service Coursier & Livraison Express", pricingType: "SERVICE", price: 5000, rate: 10,
          description: "Livraison de documents et colis en ville — délai garanti en 2h pour les entreprises." },
        { slug: "location-materiel-bureau", name: "Location Matériel de Bureau & Événementiel", pricingType: "SERVICE", price: 100000, rate: 10,
          description: "Tables, chaises, sonorisation, décoration, groupes électrogènes — pour vos événements." },
        { slug: "accueil-vip-protocole", name: "Accueil VIP & Protocole", pricingType: "SERVICE", price: 200000, rate: 10,
          description: "Hôtesses, protocole, accompagnement VIP, gestion de délégations officielles." },
        { slug: "voyage-tourisme", name: "Voyages d'Affaires & Tourisme", pricingType: "SERVICE", price: 500000, rate: 10,
          description: "Réservations d'hôtels, billets d'avion, visas, circuits touristiques, team building." },
      ],
    },
    // ── NOUVELLES BRANCHES ────────────────────────────────────────────────
    {
      slug: "ibig-financement", name: "IBIG FINANCEMENT",
      tagline: "Microfinance, crédit, assurance & investissement",
      description: "IBIG FINANCEMENT facilite l'accès au financement pour les PME, entrepreneurs et particuliers : microcrédits, financement d'équipement, assurances entreprises et vie, épargne collective, accompagnement à la levée de fonds et mise en relation avec des investisseurs.",
      website: "https://ibigpartners.com/financement",
      offerType: "Service financier", commissionModel: "5% N1 • 3% N2 • 1% N3",
      order: 10,
      products: [
        { slug: "microcredit-pme", name: "Microcrédit PME", pricingType: "SERVICE", price: 0, rate: 5,
          description: "Accompagnement à l'obtention de microcrédits pour PME et artisans — montants de 500 000 à 5 000 000 FCFA." },
        { slug: "financement-equipement", name: "Financement Équipement (Leasing)", pricingType: "SERVICE", price: 0, rate: 5,
          description: "Crédit-bail et location avec option d'achat pour véhicules, machines, matériel professionnel." },
        { slug: "assurance-entreprise", name: "Assurance Entreprise Multirisques", pricingType: "ANNUAL_SUB", price: 300000, rate: 5,
          description: "Couverture incendie, responsabilité civile, vol, dommages aux tiers — pour PME et TPE." },
        { slug: "assurance-vie-prevoyance", name: "Assurance Vie & Prévoyance", pricingType: "MONTHLY_SUB", price: 25000, rate: 5,
          description: "Épargne-retraite, assurance décès-invalidité, prévoyance pour dirigeants et salariés." },
        { slug: "assurance-sante-entreprise", name: "Assurance Santé Collective (Entreprise)", pricingType: "MONTHLY_SUB", price: 50000, rate: 5,
          description: "Mutuelle santé pour équipes d'entreprise : consultations, pharmacie, hospitalisation." },
        { slug: "epargne-collective", name: "Épargne Collective & Tontine Digitale", pricingType: "SERVICE", price: 0, rate: 5,
          description: "Gestion de groupes d'épargne, tontines et clubs d'investissement — suivi digitalisé." },
        { slug: "aide-levee-fonds", name: "Aide à la Levée de Fonds", pricingType: "SERVICE", price: 400000, rate: 5,
          description: "Constitution du dossier, pitch deck, mise en relation avec fonds d'investissement et banques." },
        { slug: "accompagnement-investisseurs", name: "Accompagnement Investisseurs Étrangers", pricingType: "SERVICE", price: 500000, rate: 5,
          description: "Due diligence, structuration d'opérations, accompagnement juridique et fiscal pour investisseurs en Afrique." },
        { slug: "financement-immobilier-credit", name: "Financement Immobilier (Crédit)", pricingType: "SERVICE", price: 0, rate: 5,
          description: "Montage de dossiers de crédit immobilier, négociation avec banques partenaires." },
      ],
    },
    {
      slug: "ibig-emploi-talents", name: "IBIG EMPLOI & TALENTS",
      tagline: "Recrutement, placement & développement RH",
      description: "IBIG EMPLOI & TALENTS connecte entreprises et talents qualifiés en Afrique : recrutement CDD/CDI, placement de profils, externalisation RH, gestion du personnel, tests de compétences et gestion de talent pool. La plateforme RH de référence pour les entreprises africaines.",
      website: "https://ibigpartners.com/emploi",
      offerType: "Service RH", commissionModel: "10% N1 • 5% N2 • 2% N3",
      order: 11,
      products: [
        { slug: "mission-recrutement-cdi", name: "Mission de Recrutement CDI", pricingType: "SERVICE", price: 300000, rate: 10,
          description: "Chasse de tête, tri des candidatures, entretiens, présentation des finalistes." },
        { slug: "mission-recrutement-cdd", name: "Mission de Recrutement CDD / Intérim", pricingType: "SERVICE", price: 150000, rate: 10,
          description: "Mise à disposition rapide de profils pour CDD, missions courtes et remplacement." },
        { slug: "placement-profils-qualifies", name: "Placement de Profils Qualifiés", pricingType: "SERVICE", price: 200000, rate: 10,
          description: "Placement de cadres, ingénieurs, commerciaux, techniciens et spécialistes sectoriels." },
        { slug: "externalisation-rh", name: "Externalisation RH Complète", pricingType: "MONTHLY_SUB", price: 200000, rate: 10,
          description: "Prise en charge totale de la fonction RH : recrutement, paie, congés, disciplinaire, reporting." },
        { slug: "gestion-personnel-externalise", name: "Gestion du Personnel Externalisée", pricingType: "MONTHLY_SUB", price: 100000, rate: 10,
          description: "Administration du personnel, contrats, congés, absences, bulletins de paie — sans créer un service RH interne." },
        { slug: "tests-competences-evaluation", name: "Tests de Compétences & Évaluation", pricingType: "SERVICE", price: 80000, rate: 10,
          description: "Tests psychotechniques, évaluation des compétences techniques et comportementales, bilan de compétences." },
        { slug: "accompagnement-reconversion", name: "Bilan & Accompagnement Reconversion", pricingType: "SERVICE", price: 150000, rate: 10,
          description: "Bilan professionnel, conseils de reconversion, accompagnement CV et entretiens." },
        { slug: "formation-recruteurs", name: "Formation Recruteurs & DRH", pricingType: "COURSE", price: 120000, rate: 10,
          description: "Techniques de recrutement modernes, entretien structuré, marque employeur, droit du travail." },
        { slug: "portage-salarial", name: "Portage Salarial", pricingType: "SERVICE", price: 0, rate: 10,
          description: "Solution pour consultants indépendants : statut salarié, couverture sociale, facturation simplifiée." },
        { slug: "talent-pool-gestion", name: "Gestion de Talent Pool", pricingType: "MONTHLY_SUB", price: 150000, rate: 10,
          description: "Constitution et gestion d'un vivier de candidats qualifiés pour l'entreprise — prêts à mobiliser." },
      ],
    },
    {
      slug: "ibig-soft", name: "IBIG SOFT",
      tagline: "Édition logicielle, SaaS & applications métiers",
      description: "IBIG SOFT conçoit et commercialise des solutions SaaS et ERP adaptés aux réalités africaines : gestion scolaire (Scolaby), gestion de flotte (IBIG Fleet 360), gestion locative (Lokativo), gestion commerciale (GESCOMXEL), livraison (Zelivry) et bien d'autres logiciels métiers pour PME et institutions.",
      website: "https://ibigsoft.com/",
      offerType: "Abonnements mensuels & annuels", commissionModel: "20% N1 • 10% N2 • 5% N3 (dégressif sur 4 mois) | Annuel : 20% N1 • 8% N2 • 3% N3",
      order: 1,
      products: [
        { slug: "scolaby", name: "Scolaby", pricingType: "MONTHLY_SUB", price: 30000, rate: 20,
          description: "Logiciel de gestion scolaire : élèves, notes, bulletins, emploi du temps, absences, comptabilité scolaire." },
        { slug: "scolaby-annuel", name: "Scolaby (Annuel)", pricingType: "ANNUAL_SUB", price: 300000, rate: 20 },
        { slug: "ibig-fleet-360", name: "IBIG Fleet 360", pricingType: "MONTHLY_SUB", price: 45000, rate: 20,
          description: "Gestion de flotte de véhicules : suivi GPS, entretiens, carburant, chauffeurs, reporting." },
        { slug: "lokativo", name: "Lokativo", pricingType: "MONTHLY_SUB", price: 35000, rate: 20,
          description: "Logiciel de gestion locative : baux, quittances, relances, travaux, propriétaires & locataires." },
        { slug: "gescomxel", name: "GESCOMXEL", pricingType: "MONTHLY_SUB", price: 20000, rate: 20,
          description: "Gestion commerciale : devis, factures, stocks, clients, fournisseurs, trésorerie." },
        { slug: "zelivry", name: "Zelivry", pricingType: "MONTHLY_SUB", price: 25000, rate: 20,
          description: "Logiciel de gestion de livraison : commandes, livreurs, suivi en temps réel, rapport de tournée." },
        { slug: "logiciel-rh-paie", name: "Logiciel RH & Paie", pricingType: "MONTHLY_SUB", price: 35000, rate: 20,
          description: "Gestion du personnel, bulletins de paie, congés, absences, CNPS, cotisations — conforme aux législations africaines." },
        { slug: "logiciel-compta-pme", name: "Logiciel Comptabilité PME", pricingType: "MONTHLY_SUB", price: 25000, rate: 20,
          description: "Saisie comptable, journaux, grand livre, balance, bilan, compte de résultat — pour TPE et PME." },
        { slug: "logiciel-caisse-pos", name: "Logiciel de Caisse (POS)", pricingType: "MONTHLY_SUB", price: 15000, rate: 20,
          description: "Point de vente : caisse tactile, tickets, stocks, fidélité client, rapport journalier — boutiques & restaurants." },
        { slug: "logiciel-hotel", name: "Logiciel de Gestion Hôtelière", pricingType: "MONTHLY_SUB", price: 50000, rate: 20,
          description: "Réservations, check-in/out, housekeeping, facturation, restauration — pour hôtels et résidences." },
        { slug: "logiciel-clinique", name: "Logiciel Cabinet Médical & Clinique", pricingType: "MONTHLY_SUB", price: 40000, rate: 20,
          description: "Gestion des patients, consultations, dossiers médicaux, ordonnances, facturation, stock pharmacie." },
        { slug: "logiciel-stock", name: "Logiciel de Gestion de Stock", pricingType: "MONTHLY_SUB", price: 20000, rate: 20,
          description: "Entrées/sorties de stock, alertes de réapprovisionnement, valorisation, rapports." },
        { slug: "crm-commercial", name: "CRM Commercial", pricingType: "MONTHLY_SUB", price: 30000, rate: 20,
          description: "Gestion des prospects et clients, pipeline commercial, relances, reporting — pour équipes de vente." },
        { slug: "logiciel-garage", name: "Logiciel Gestion de Garage", pricingType: "MONTHLY_SUB", price: 20000, rate: 20,
          description: "Ordres de réparation, pièces détachées, véhicules clients, facturation — pour garages et ateliers." },
        { slug: "logiciel-btp-chantier", name: "Logiciel Gestion BTP & Chantiers", pricingType: "MONTHLY_SUB", price: 45000, rate: 20,
          description: "Planification de chantiers, suivi des travaux, devis, factures, matériaux, main-d'œuvre." },
      ],
    },
  ];

  for (const b of branchesData) {
    const { products, ...branchFields } = b;
    const branch = await prisma.branch.upsert({
      where: { slug: b.slug },
      update: branchFields,
      create: branchFields,
    });
    for (const p of products) {
      await prisma.product.upsert({
        where: { slug: p.slug },
        update: { ...p, branchId: branch.id },
        create: { ...p, branchId: branch.id },
      });
    }
  }


  if (!adminPassword) {
    console.log("→ ADMIN_PASSWORD absent — création SuperAdmin ignorée.");
    return;
  }

  console.log("→ Compte SuperAdmin…");
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: "SUPERADMIN", approved: true, active: true },
    create: {
      code: "ADMIN-001",
      firstName: "Super",
      lastName: "Admin",
      email: adminEmail,
      phone: "+22500000000",
      passwordHash,
      role: "SUPERADMIN",
      approved: true,
      active: true,
    },
  });

  console.log("→ Paramètres de base…");
  const defaults = [
    { key: "min_payout", value: "5000" },
    { key: "cookie_tracking_days", value: "90" },
    { key: "platform_name", value: "IBIG PARTNERS" },
    { key: "support_email", value: adminEmail },
    { key: "registration_open", value: "true" },
  ];
  for (const s of defaults) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s });
  }

  console.log("✓ Seed production terminé.");
  console.log(`  SuperAdmin : ${adminEmail}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

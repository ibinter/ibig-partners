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
        { slug: "formation-compta", name: "Formation Comptabilité", pricingType: "COURSE", price: 150000, rate: 10 },
        { slug: "formation-digital", name: "Formation Marketing Digital", pricingType: "COURSE", price: 120000, rate: 10 },
        { slug: "formation-dev", name: "Formation Développement Web", pricingType: "COURSE", price: 200000, rate: 10 },
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
        { slug: "mandat-vente", name: "Mandat de Vente", pricingType: "SERVICE", price: 2000000, rate: 5 },
        { slug: "gestion-locative", name: "Gestion Locative", pricingType: "MONTHLY_SUB", price: 50000, rate: 5 },
        { slug: "conseil-investissement", name: "Conseil en Investissement", pricingType: "SERVICE", price: 300000, rate: 5 },
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
        { slug: "produits-it", name: "Produits IT & Informatique", pricingType: "PRODUCT", price: 50000, rate: 8 },
        { slug: "mobilier-bureau", name: "Mobilier de Bureau", pricingType: "PRODUCT", price: 150000, rate: 8 },
        { slug: "fournitures-bureau", name: "Fournitures de Bureau", pricingType: "PRODUCT", price: 20000, rate: 8 },
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
        { slug: "site-vitrine", name: "Site Vitrine", pricingType: "PRODUCT", price: 400000, rate: 10 },
        { slug: "app-mobile", name: "Application Mobile", pricingType: "PRODUCT", price: 1500000, rate: 10 },
        { slug: "identite-visuelle", name: "Identité Visuelle", pricingType: "PRODUCT", price: 150000, rate: 10 },
        { slug: "integration-erp", name: "Intégration ERP", pricingType: "SERVICE", price: 800000, rate: 10 },
        { slug: "chatbot-ia", name: "Chatbot & IA", pricingType: "SERVICE", price: 350000, rate: 10 },
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
        { slug: "audit-organisationnel", name: "Audit Organisationnel", pricingType: "SERVICE", price: 500000, rate: 10 },
        { slug: "etude-marche", name: "Étude de Marché", pricingType: "SERVICE", price: 300000, rate: 10 },
        { slug: "accompagnement-creation", name: "Accompagnement Création d'Entreprise", pricingType: "SERVICE", price: 200000, rate: 10 },
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
        { slug: "evenementiel", name: "Organisation Événementielle", pricingType: "SERVICE", price: 500000, rate: 10 },
        { slug: "demenagement", name: "Déménagement", pricingType: "SERVICE", price: 150000, rate: 10 },
        { slug: "maintenance", name: "Maintenance & Dépannage", pricingType: "SERVICE", price: 80000, rate: 10 },
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

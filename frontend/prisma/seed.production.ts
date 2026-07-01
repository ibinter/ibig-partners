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

  // Suppression des anciennes branches renommées ou retirées du groupe
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
  const oldBranches = await prisma.branch.findMany({
    where: { slug: { in: oldSlugs } },
    select: { id: true },
  });
  if (oldBranches.length > 0) {
    const ids = oldBranches.map((b) => b.id);
    await prisma.product.deleteMany({ where: { branchId: { in: ids } } });
    await prisma.branch.deleteMany({ where: { id: { in: ids } } });
    console.log(`   ${oldBranches.length} ancienne(s) branche(s) supprimée(s).`);
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
      tagline: "Création digitale & Communication visuelle",
      description: "IBIG DIGITAL est le pôle créatif et communication du groupe IBIG SARL : création de sites web vitrines, identité visuelle, community management, production de contenus digitaux, campagnes publicitaires en ligne et stratégie de marque. Des solutions créatives pour valoriser votre image.",
      website: "https://intermark-business.com/digital",
      offerType: "Service créatif & communication", commissionModel: "10% N1 • 5% N2 • 2% N3",
      order: 5,
      products: [
        { slug: "site-vitrine-digital", name: "Site Vitrine Professionnel", pricingType: "PRODUCT", price: 400000, rate: 10 },
        { slug: "identite-visuelle-digital", name: "Identité Visuelle & Logo", pricingType: "PRODUCT", price: 150000, rate: 10 },
        { slug: "community-management-digital", name: "Community Management", pricingType: "MONTHLY_SUB", price: 80000, rate: 10 },
        { slug: "campagne-pub-digital", name: "Campagne Publicitaire", pricingType: "SERVICE", price: 250000, rate: 10 },
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

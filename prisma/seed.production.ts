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
  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD manquant. Définissez la variable d'environnement.");
  }

  console.log("→ Branches & produits…");

  const branchesData = [
    {
      slug: "ibig-soft", name: "IBIG SOFT",
      tagline: "Logiciels SaaS de gestion",
      description: "Scolaby, Mailaby, Reseaby, Stockflow, Lokativo, IBIG Fleet 360, Gescomxel…",
      offerType: "Abonnement mensuel / annuel", commissionModel: "Dégressive sur 4 mois + annuel",
      products: [
        { slug: "scolaby", name: "Scolaby", pricingType: "MONTHLY_SUB", price: 30000 },
        { slug: "mailaby", name: "Mailaby", pricingType: "MONTHLY_SUB", price: 15000 },
        { slug: "stockflow", name: "Stockflow", pricingType: "MONTHLY_SUB", price: 25000 },
        { slug: "scolaby-annuel", name: "Scolaby (Annuel)", pricingType: "ANNUAL_SUB", price: 300000 },
      ],
    },
    {
      slug: "eduform", name: "EDUFORM",
      tagline: "Formations professionnelles certifiantes",
      description: "Formations courtes, longues et certifiantes en présentiel et distanciel.",
      offerType: "Cours / Formation", commissionModel: "10/5/2%",
      products: [
        { slug: "formation-compta", name: "Formation Comptabilité", pricingType: "COURSE", price: 150000 },
        { slug: "formation-digital", name: "Formation Marketing Digital", pricingType: "COURSE", price: 120000 },
        { slug: "formation-dev", name: "Formation Développement Web", pricingType: "COURSE", price: 200000 },
      ],
    },
    {
      slug: "conseil-plus", name: "CONSEIL+",
      tagline: "Conseil aux entreprises",
      description: "Audit, conseil stratégique, accompagnement et études de marché.",
      offerType: "Service sur devis", commissionModel: "Taux produit / niveaux",
      products: [
        { slug: "audit-organisationnel", name: "Audit Organisationnel", pricingType: "SERVICE", price: 500000, rate: 10 },
        { slug: "etude-marche", name: "Étude de Marché", pricingType: "SERVICE", price: 300000, rate: 10 },
      ],
    },
    {
      slug: "immo-trust", name: "IMMO TRUST",
      tagline: "Immobilier résidentiel et commercial",
      description: "Location, vente, gestion de biens immobiliers en Côte d'Ivoire.",
      offerType: "Service / Produit", commissionModel: "Taux produit / niveaux",
      products: [
        { slug: "mandat-vente", name: "Mandat de Vente", pricingType: "SERVICE", price: 2000000, rate: 5 },
        { slug: "gestion-locative", name: "Gestion Locative", pricingType: "MONTHLY_SUB", price: 50000 },
      ],
    },
    {
      slug: "ibig-digital", name: "DIGITAL",
      tagline: "Solutions digitales sur mesure",
      description: "Création de sites web, apps mobiles, identité visuelle, SEO.",
      offerType: "Service / Produit", commissionModel: "Taux produit / niveaux",
      products: [
        { slug: "site-vitrine", name: "Site Vitrine", pricingType: "PRODUCT", price: 400000, rate: 8 },
        { slug: "app-mobile", name: "Application Mobile", pricingType: "PRODUCT", price: 1500000, rate: 8 },
        { slug: "identite-visuelle", name: "Identité Visuelle", pricingType: "PRODUCT", price: 150000, rate: 10 },
      ],
    },
    {
      slug: "ibig-market", name: "MARKET",
      tagline: "Marketing & communication",
      description: "Campagnes publicitaires, community management, influence.",
      offerType: "Service mensuel / Produit", commissionModel: "Mixte",
      products: [
        { slug: "community-management", name: "Community Management", pricingType: "MONTHLY_SUB", price: 80000 },
        { slug: "campagne-pub", name: "Campagne Publicitaire", pricingType: "SERVICE", price: 250000, rate: 8 },
      ],
    },
    {
      slug: "multiservices", name: "MULTISERVICES",
      tagline: "Services aux particuliers et entreprises",
      description: "Conciergerie, assistance administrative, services divers.",
      offerType: "Service / Produit", commissionModel: "Taux produit / niveaux",
      products: [
        { slug: "assistance-admin", name: "Assistance Administrative", pricingType: "SERVICE", price: 100000, rate: 10 },
      ],
    },
    {
      slug: "ibig-tv", name: "IBIG TV",
      tagline: "Média & contenus digitaux",
      description: "Production vidéo, web TV, podcasts et contenus sponsorisés.",
      offerType: "Service / Abonnement", commissionModel: "Mixte",
      products: [
        { slug: "production-video", name: "Production Vidéo", pricingType: "SERVICE", price: 300000, rate: 8 },
        { slug: "abonnement-webtv", name: "Abonnement Web TV", pricingType: "ANNUAL_SUB", price: 60000 },
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

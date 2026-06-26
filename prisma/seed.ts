import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { generateCommissionsForSale, recomputeStatus } from "../src/lib/sales";

async function main() {
  console.log("Nettoyage de la base…");
  // Ordre de suppression respectant les contraintes de cle etrangere.
  await prisma.commission.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.click.deleteMany();
  await prisma.affiliateLink.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.prospect.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.marketingKit.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.product.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();

  // --- Branches & produits (cahier des charges, section 2) ---
  const branchesData = [
    {
      slug: "ibig-soft",
      name: "IBIG SOFT",
      tagline: "Logiciels SaaS de gestion",
      description:
        "Scolaby, Mailaby, Reseaby, Stockflow, Lokativo, IBIG Fleet 360, Gescomxel… Solutions logicielles en abonnement.",
      offerType: "Abonnement mensuel / annuel",
      commissionModel: "Dégressif 4 mois (mensuel) / One-shot 20% (annuel)",
      order: 1,
      products: [
        { slug: "scolaby", name: "Scolaby", price: 30000, pricingType: "MONTHLY_SUB", siteUrl: "scolaby.com" },
        { slug: "mailaby", name: "Mailaby", price: 20000, pricingType: "MONTHLY_SUB", siteUrl: "mailaby.com" },
        { slug: "reseaby", name: "Reseaby", price: 25000, pricingType: "MONTHLY_SUB", siteUrl: "reseaby.com" },
        { slug: "stockflow", name: "Stockflow", price: 35000, pricingType: "MONTHLY_SUB", siteUrl: "stockflow.ci" },
        { slug: "lokativo", name: "Lokativo", price: 28000, pricingType: "MONTHLY_SUB", siteUrl: "lokativo.com" },
        { slug: "ibig-fleet-360", name: "IBIG Fleet 360", price: 40000, pricingType: "MONTHLY_SUB", siteUrl: "ibigfleet.com" },
        { slug: "gescomxel", name: "Gescomxel", price: 22000, pricingType: "MONTHLY_SUB", siteUrl: "gescomxel.com" },
        { slug: "scolaby-annuel", name: "Scolaby (annuel)", price: 300000, pricingType: "ANNUAL_SUB", siteUrl: "scolaby.com" },
      ],
    },
    {
      slug: "ibig-eduform",
      name: "IBIG EDUFORM",
      tagline: "200+ formations certifiantes",
      description:
        "Comptabilité, RH, QHSE, Informatique, Management, Droit, BTP, Entrepreneuriat… Inscription par session.",
      offerType: "Inscription par session",
      commissionModel: "N1 : 10% / N2 : 5% / N3 : 2% par inscription",
      order: 2,
      products: [
        { slug: "formation-comptabilite", name: "Formation Comptabilité certifiante", price: 150000, pricingType: "COURSE", siteUrl: "ibig-eduform.com" },
        { slug: "formation-qhse", name: "Formation QHSE", price: 200000, pricingType: "COURSE", siteUrl: "ibig-eduform.com" },
        { slug: "formation-management", name: "Formation Management", price: 120000, pricingType: "COURSE", siteUrl: "ibig-eduform.com" },
      ],
    },
    {
      slug: "ibig-conseil-plus",
      name: "IBIG CONSEIL+",
      tagline: "Assistance comptable & juridique",
      description:
        "Assistance comptable, juridique, rédaction de projets, CV, courriers, montage dossiers, conformité CNPS/fiscalité.",
      offerType: "Prestation de conseil",
      commissionModel: "5-10% sur mission signée",
      order: 3,
      products: [
        { slug: "montage-dossier-cnps", name: "Montage dossier CNPS", price: 100000, pricingType: "SERVICE", rate: 8, siteUrl: "ibigconseil.com" },
        { slug: "redaction-projet", name: "Rédaction de projet", price: 250000, pricingType: "SERVICE", rate: 10, siteUrl: "ibigconseil.com" },
      ],
    },
    {
      slug: "ibig-immo-trust",
      name: "IBIG IMMO TRUST",
      tagline: "Immobilier & diaspora",
      description:
        "Gestion locative, transactions immobilières, conseil investissement, assistance diaspora, régularisation foncière, intermédiation BTP.",
      offerType: "Commission sur transaction",
      commissionModel: "Sur devis selon opération",
      order: 4,
      products: [
        { slug: "gestion-locative", name: "Mandat de gestion locative", price: 500000, pricingType: "SERVICE", rate: 6, siteUrl: "ibigimmo.com" },
      ],
    },
    {
      slug: "ibig-digital",
      name: "IBIG DIGITAL",
      tagline: "Sites, apps, ERP & IA",
      description:
        "Sites web, apps mobiles, ERP (SAP/SAGE/Odoo), GED, IA, chatbots, automatisation, graphisme, marketing digital.",
      offerType: "Prestation / projet",
      commissionModel: "5-8% sur mission signée",
      order: 5,
      products: [
        { slug: "site-web-vitrine", name: "Site web vitrine", price: 400000, pricingType: "SERVICE", rate: 8, siteUrl: "ibigdigital.com" },
        { slug: "app-mobile", name: "Application mobile", price: 1500000, pricingType: "SERVICE", rate: 6, siteUrl: "ibigdigital.com" },
      ],
    },
    {
      slug: "ibig-market",
      name: "IBIG MARKET",
      tagline: "Marketplace universelle",
      description:
        "Produits IT, mobilier, électroménager, mode, beauté, high-tech — vente physique & e-commerce.",
      offerType: "Vente produit / service",
      commissionModel: "5-10% par vente réalisée",
      order: 6,
      products: [
        { slug: "ordinateur-portable", name: "Ordinateur portable pro", price: 450000, pricingType: "PRODUCT", rate: 8, siteUrl: "ibigmarket.com" },
        { slug: "mobilier-bureau", name: "Pack mobilier de bureau", price: 350000, pricingType: "PRODUCT", rate: 10, siteUrl: "ibigmarket.com" },
      ],
    },
    {
      slug: "ibig-multiservices",
      name: "IBIG MULTISERVICES",
      tagline: "Événementiel & logistique",
      description:
        "Événementiel, déménagement, maintenance locaux, accueil VIP, transport, tourisme, soutien projets multisites.",
      offerType: "Prestation ponctuelle/récurrente",
      commissionModel: "5-8% sur mission apportée",
      order: 7,
      products: [
        { slug: "organisation-evenement", name: "Organisation d'événement", price: 800000, pricingType: "SERVICE", rate: 7, siteUrl: "ibigservices.com" },
      ],
    },
    {
      slug: "ibig-tv",
      name: "IBIG TV (à venir)",
      tagline: "WebTV & médias",
      description:
        "Formations vidéo, reportages, interviews, chroniques économiques, promotion partenaires.",
      offerType: "Sponsoring / partenariat média",
      commissionModel: "Taux à définir selon partenariat",
      order: 8,
      active: false,
      products: [],
    },
  ];

  console.log("Création des branches et produits…");
  const productBySlug: Record<string, { id: string; pricingType: string; price: number; rate: number }> = {};
  for (const b of branchesData) {
    const branch = await prisma.branch.create({
      data: {
        slug: b.slug,
        name: b.name,
        tagline: b.tagline,
        description: b.description,
        offerType: b.offerType,
        commissionModel: b.commissionModel,
        order: b.order,
        active: b.active ?? true,
      },
    });
    for (const p of b.products) {
      const product = await prisma.product.create({
        data: {
          branchId: branch.id,
          slug: p.slug,
          name: p.name,
          price: p.price,
          pricingType: p.pricingType,
          rate: (p as { rate?: number }).rate ?? 8,
          siteUrl: p.siteUrl,
        },
      });
      productBySlug[p.slug] = {
        id: product.id,
        pricingType: product.pricingType,
        price: product.price,
        rate: product.rate,
      };
    }
  }

  // --- Utilisateurs (admin + partenaires demo avec chaine de parrainage) ---
  console.log("Création des comptes…");
  const pwd = await bcrypt.hash("password123", 10);

  const superadmin = await prisma.user.create({
    data: {
      code: "ADMIN-001",
      firstName: "Patrice",
      lastName: "Kouakou",
      email: "admin@ibigpartners.com",
      phone: "+2250700000000",
      passwordHash: pwd,
      role: "SUPERADMIN",
      status: "MASTER",
      approved: true,
      city: "Abidjan",
      payoutMethod: "BANK",
    },
  });

  // Niveau 1 (Ambassadeur), recrute directement par IBIG SARL
  const koffi = await prisma.user.create({
    data: {
      code: "AFF-KOFFI-001",
      firstName: "Koffi",
      lastName: "N'Guessan",
      email: "koffi@example.com",
      phone: "+2250707070707",
      passwordHash: pwd,
      role: "PARTNER",
      status: "STARTER",
      approved: true,
      city: "Abidjan",
      payoutMethod: "ORANGE_MONEY",
      payoutDetail: "0707070707",
    },
  });

  // Niveau 2 (Partenaire), filleul de Koffi
  const aya = await prisma.user.create({
    data: {
      code: "AFF-AYA-002",
      firstName: "Aya",
      lastName: "Traoré",
      email: "aya@example.com",
      phone: "+2250505050505",
      passwordHash: pwd,
      role: "PARTNER",
      status: "STARTER",
      approved: true,
      city: "Bouaké",
      payoutMethod: "WAVE",
      payoutDetail: "0505050505",
      sponsorId: koffi.id,
    },
  });

  // Niveau 3 (Apporteur), filleul d'Aya
  const moussa = await prisma.user.create({
    data: {
      code: "AFF-MOUSSA-003",
      firstName: "Moussa",
      lastName: "Bamba",
      email: "moussa@example.com",
      phone: "+2250101010101",
      passwordHash: pwd,
      role: "PARTNER",
      status: "STARTER",
      approved: true,
      city: "Yamoussoukro",
      payoutMethod: "MTN_MOMO",
      payoutDetail: "0101010101",
      sponsorId: aya.id,
    },
  });

  // Un partenaire en attente de validation
  await prisma.user.create({
    data: {
      code: "AFF-FATOU-004",
      firstName: "Fatou",
      lastName: "Koné",
      email: "fatou@example.com",
      phone: "+2250202020202",
      passwordHash: pwd,
      role: "PARTNER",
      status: "STARTER",
      approved: false,
      city: "Abidjan",
      sponsorId: koffi.id,
    },
  });

  // --- Liens d'affiliation ---
  console.log("Création des liens d'affiliation…");
  async function ensureLink(userCode: string, userId: string, productSlug: string) {
    const product = productBySlug[productSlug];
    await prisma.affiliateLink.create({
      data: { userId, productId: product.id, code: userCode, clicks: Math.floor(Math.random() * 40) },
    });
  }
  // (codes partages par produit du meme partenaire — voir CDC 5.1)
  for (const slug of ["scolaby", "mailaby", "formation-comptabilite"]) {
    const product = productBySlug[slug];
    await prisma.affiliateLink.create({
      data: { userId: moussa.id, productId: product.id, code: moussa.code, clicks: Math.floor(Math.random() * 30) },
    });
  }
  await prisma.affiliateLink.create({ data: { userId: koffi.id, productId: productBySlug["scolaby"].id, code: koffi.code, clicks: 52 } });
  await prisma.affiliateLink.create({ data: { userId: aya.id, productId: productBySlug["formation-qhse"].id, code: aya.code, clicks: 18 } });

  // --- Ventes + commissions ---
  console.log("Création des ventes et génération des commissions…");
  let saleSeq = 1;
  async function createSale(opts: {
    sellerId: string;
    productSlug: string;
    customerName: string;
    monthsPaid?: number;
    status?: string;
    daysAgo?: number;
  }) {
    const product = productBySlug[opts.productSlug];
    const created = new Date();
    created.setDate(created.getDate() - (opts.daysAgo ?? 5));
    const sale = await prisma.sale.create({
      data: {
        reference: `VTE-${String(saleSeq++).padStart(4, "0")}`,
        productId: product.id,
        sellerId: opts.sellerId,
        customerName: opts.customerName,
        customerPhone: "+2250708090910",
        amount: product.price,
        pricingType: product.pricingType,
        status: opts.status ?? "CONFIRMED",
        monthsPaid: opts.monthsPaid ?? 1,
        createdAt: created,
      },
    });
    if (sale.status === "CONFIRMED") await generateCommissionsForSale(sale.id);
    return sale;
  }

  // Koffi (N1) vend -> il touche N1
  await createSale({ sellerId: koffi.id, productSlug: "scolaby", customerName: "École Les Lauriers", monthsPaid: 4, daysAgo: 120 });
  await createSale({ sellerId: koffi.id, productSlug: "scolaby-annuel", customerName: "Groupe Scolaire Étoile", daysAgo: 30 });
  await createSale({ sellerId: koffi.id, productSlug: "formation-comptabilite", customerName: "Jean Yao", daysAgo: 15 });

  // Aya (N2 sous Koffi) vend -> Aya touche N1, Koffi touche N2
  await createSale({ sellerId: aya.id, productSlug: "mailaby", customerName: "Cabinet Konan", monthsPaid: 3, daysAgo: 90 });
  await createSale({ sellerId: aya.id, productSlug: "formation-qhse", customerName: "BTP Services SARL", daysAgo: 20 });

  // Moussa (N3 sous Aya sous Koffi) vend -> Moussa N1, Aya N2, Koffi N3
  await createSale({ sellerId: moussa.id, productSlug: "scolaby", customerName: "Institut Privé Wisdom", monthsPaid: 2, daysAgo: 45 });
  await createSale({ sellerId: moussa.id, productSlug: "site-web-vitrine", customerName: "Boutique Élégance", daysAgo: 10 });
  await createSale({ sellerId: moussa.id, productSlug: "ordinateur-portable", customerName: "Awa Cissé", daysAgo: 3 });

  // Une vente en attente de confirmation
  await createSale({ sellerId: koffi.id, productSlug: "stockflow", customerName: "Quincaillerie du Plateau", status: "PENDING", daysAgo: 1 });

  // --- Recalcule les statuts ---
  for (const u of [koffi.id, aya.id, moussa.id]) await recomputeStatus(u);

  // --- Kits marketing ---
  console.log("Création des kits marketing…");
  const softBranch = await prisma.branch.findUnique({ where: { slug: "ibig-soft" } });
  const eduBranch = await prisma.branch.findUnique({ where: { slug: "ibig-eduform" } });
  await prisma.marketingKit.createMany({
    data: [
      { branchId: softBranch!.id, title: "Argumentaire Scolaby", type: "ARGUMENT", content: "Scolaby digitalise la gestion scolaire : inscriptions, notes, bulletins, paiements. Gagnez du temps et fidélisez les parents.", minStatus: "STARTER" },
      { branchId: softBranch!.id, title: "Visuel WhatsApp Scolaby", type: "VISUAL", content: "https://placehold.co/1080x1080/0b5fff/white?text=Scolaby", minStatus: "STARTER" },
      { branchId: softBranch!.id, title: "Vidéo démo IBIG SOFT", type: "VIDEO", content: "https://www.youtube.com/watch?v=demo", minStatus: "SILVER" },
      { branchId: eduBranch!.id, title: "Argumentaire formations EDUFORM", type: "ARGUMENT", content: "200+ formations certifiantes pour booster les carrières. Inscription par session, certificat reconnu.", minStatus: "STARTER" },
    ],
  });

  // --- Prospects & opportunites ---
  console.log("Création des prospects et opportunités…");
  await prisma.prospect.createMany({
    data: [
      { userId: koffi.id, name: "Collège Moderne d'Abobo", contact: "+2250711223344", productId: productBySlug["scolaby"].id, status: "DEMO", note: "Démo prévue vendredi" },
      { userId: koffi.id, name: "Pharmacie du Rond-Point", contact: "+2250755667788", status: "CONTACTED" },
      { userId: aya.id, name: "Lycée Technique de Bouaké", contact: "+2250733445566", productId: productBySlug["scolaby"].id, status: "CONVERTED" },
    ],
  });
  await prisma.opportunity.createMany({
    data: [
      { userId: koffi.id, title: "Marché public — digitalisation mairie de Cocody", description: "Appel d'offres pour la digitalisation de 12 services municipaux.", estimatedValue: 25000000, status: "IN_PROGRESS", handler: "Patrice Kouakou" },
      { userId: moussa.id, title: "Partenariat ONG Santé Plus", description: "Mise en relation pour ERP de gestion de 8 centres de santé.", estimatedValue: 8000000, status: "NEW" },
    ],
  });

  // --- Notifications ---
  await prisma.notification.createMany({
    data: [
      { userId: null, title: "Bienvenue sur IBIG PARTNERS", body: "Le programme d'affiliation multi-niveaux du groupe IBIG SARL est en ligne. Activez vos produits et commencez à gagner !" },
      { userId: koffi.id, title: "Promotion de niveau", body: "Félicitations ! Vous avez atteint un nouveau palier de statut." },
    ],
  });

  // --- Parametres plateforme ---
  await prisma.setting.createMany({
    data: [
      { key: "min_payout", value: "5000" },
      { key: "cookie_days", value: "90" },
      { key: "payment_delay_days", value: "7" },
      { key: "company_name", value: "IBIG SARL — Groupe Intermark Business International" },
      { key: "company_address", value: "Cocody Riviera Palmeraie — Abidjan, Côte d'Ivoire" },
    ],
  });

  console.log("\n✅ Seed terminé.");
  console.log("Comptes de démonstration (mot de passe : password123) :");
  console.log("  • SuperAdmin : admin@ibigpartners.com");
  console.log("  • Partenaire N1 : koffi@example.com");
  console.log("  • Partenaire N2 : aya@example.com");
  console.log("  • Partenaire N3 : moussa@example.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

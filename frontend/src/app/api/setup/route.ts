/**
 * Route d'initialisation one-shot — à supprimer après usage
 * Accessible uniquement avec la clé secrète : ?key=IBIG-SETUP-2025
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const SETUP_KEY = "IBIG-SETUP-2025";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== SETUP_KEY) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    // Vérifier si déjà initialisé
    const existing = await prisma.user.findUnique({
      where: { email: "admin@ibigpartners.com" },
    });
    if (existing) {
      const branchCount = await prisma.branch.count();
      return NextResponse.json({
        status: "déjà initialisé",
        admin: existing.email,
        branches: branchCount,
      });
    }

    // ── Créer le SuperAdmin ──
    const passwordHash = await bcrypt.hash("Admin@IBIG2025!", 12);
    await prisma.user.create({
      data: {
        code: "IBIG-ADMIN-001",
        firstName: "Super",
        lastName: "Admin",
        email: "admin@ibigpartners.com",
        phone: "+22500000000",
        passwordHash,
        role: "SUPERADMIN",
        status: "MASTER",
        approved: true,
      },
    });

    // ── Créer les 5 branches ──
    const branches = [
      {
        slug: "ibig-soft",
        name: "IBIG SOFT",
        tagline: "Édition logicielle, SaaS & applications métiers",
        description: "IBIG SOFT conçoit et commercialise des solutions SaaS et ERP adaptés aux réalités africaines. Scolaby, Fleet 360, Zelivry, Lokativo, GESCOMXEL et STOCKFLOW ERP.",
        offerType: "Abonnements mensuels & annuels",
        commissionModel: "20% N1 • 10% N2 • 5% N3 (dégressif sur 4 mois)",
        order: 1,
        products: [
          { slug: "scolaby", name: "Scolaby", description: "Plateforme de gestion scolaire nouvelle génération pour l'Afrique — du préscolaire au supérieur.", price: 30000, pricingType: "MONTHLY_SUB", rate: 20, siteUrl: "https://scolaby.com" },
          { slug: "ibig-fleet-360", name: "IBIG Fleet 360", description: "ERP tout-en-un de gestion de flotte conçu pour les réalités africaines.", price: 45000, pricingType: "MONTHLY_SUB", rate: 20, siteUrl: "https://ibigfleet360.com" },
          { slug: "zelivry", name: "Zelivry", description: "Application web tout-en-un pour gérer une activité de livraison.", price: 25000, pricingType: "MONTHLY_SUB", rate: 20, siteUrl: "https://zelivry.com" },
          { slug: "lokativo", name: "Lokativo", description: "Système de gestion immobilière panafricain pour agences, propriétaires et syndics.", price: 35000, pricingType: "MONTHLY_SUB", rate: 20, siteUrl: "https://lokativo.com" },
          { slug: "gescomxel", name: "GESCOMXEL", description: "Solution intelligente de gestion commerciale pour PME, boutiques, supermarchés et pharmacies.", price: 20000, pricingType: "MONTHLY_SUB", rate: 20, siteUrl: "https://ibigsoft.com/gescomxel.php" },
          { slug: "stockflow", name: "STOCKFLOW ERP", description: "ERP commercial 100% cloud multi-tenant pour PME et distributeurs en Afrique.", price: 40000, pricingType: "MONTHLY_SUB", rate: 20, siteUrl: "https://stockflow.ibigsoft.com" },
          { slug: "scolaby-annuel", name: "Scolaby (annuel)", description: "Abonnement annuel Scolaby avec 2 mois offerts.", price: 300000, pricingType: "ANNUAL_SUB", rate: 20, siteUrl: "https://scolaby.com" },
        ],
      },
      {
        slug: "ibig-eduform",
        name: "IBIG EDUFORM",
        tagline: "Formation professionnelle, certifications & insertion",
        description: "Formations professionnelles certifiantes en présentiel et en ligne : comptabilité, RH, audit, Sage, SAP, Power BI, IA, logistique et bien plus. Sessions mensuelles.",
        offerType: "Formations hybrides — paiement unique par session",
        commissionModel: "10% N1 • 5% N2 • 2% N3 par inscription",
        order: 2,
        products: [
          { slug: "formation-comptabilite", name: "Comptabilité & Finance 4 en 1", description: "Formation certifiante en comptabilité générale, analytique, fiscalité et analyse financière. 65 heures.", price: 400000, pricingType: "COURSE", rate: 10, siteUrl: "https://ibig-eduform.com" },
          { slug: "formation-gescom-business", name: "GESCOM Business 4 en 1", description: "Gestion commerciale, techniques de vente, marketing digital et CRM. 65 heures.", price: 400000, pricingType: "COURSE", rate: 10, siteUrl: "https://ibig-eduform.com" },
          { slug: "formation-daf-dirigeant", name: "DAF Dirigeant", description: "Pilotage financier, contrôle de gestion, tableaux de bord, gestion de trésorerie. 100 heures.", price: 425000, pricingType: "COURSE", rate: 10, siteUrl: "https://ibig-eduform.com" },
          { slug: "formation-expert-rh", name: "Expert RH 3 en 1", description: "GRH, gestion de la paie et analyse de données RH. 55 heures.", price: 450000, pricingType: "COURSE", rate: 10, siteUrl: "https://ibig-eduform.com" },
          { slug: "formation-audit-controle", name: "Audit & Contrôle de Gestion 4 en 1", description: "Audit interne/externe, contrôle de gestion, reporting et conformité. 65 heures.", price: 400000, pricingType: "COURSE", rate: 10, siteUrl: "https://ibig-eduform.com" },
          { slug: "formation-qhse", name: "QHSE Expert 4 en 1", description: "Qualité, Hygiène, Sécurité, Environnement. Normes ISO, audits, plans d'action. 65 heures.", price: 350000, pricingType: "COURSE", rate: 10, siteUrl: "https://ibig-eduform.com" },
          { slug: "formation-logistique-supply", name: "Logistique & Supply Chain 4 en 1", description: "Approvisionnement, transport, entreposage, stocks et optimisation des coûts. 65 heures.", price: 450000, pricingType: "COURSE", rate: 10, siteUrl: "https://ibig-eduform.com" },
          { slug: "formation-marches-publics", name: "Marchés Publics & Achats 3 en 1", description: "Marchés publics, appels d'offres et techniques d'achat professionnel. 55 heures.", price: 300000, pricingType: "COURSE", rate: 10, siteUrl: "https://ibig-eduform.com" },
          { slug: "formation-immobilier-pro", name: "Immobilier Professionnel 3 en 1", description: "Vente immobilière, gestion locative et investissement immobilier en Afrique. 65 heures.", price: 475000, pricingType: "COURSE", rate: 10, siteUrl: "https://ibig-eduform.com" },
          { slug: "formation-ia-professionnels", name: "Intelligence Artificielle pour Professionnels", description: "ChatGPT, Copilot, automatisation et cas d'usage métiers. 7 heures.", price: 25000, pricingType: "COURSE", rate: 10, siteUrl: "https://ibig-eduform.com" },
          { slug: "formation-power-bi", name: "Microsoft Power BI", description: "Tableaux de bord interactifs et rapports professionnels. 14 heures.", price: 35000, pricingType: "COURSE", rate: 10, siteUrl: "https://ibig-eduform.com" },
          { slug: "formation-sage-comptabilite", name: "Sage 100 Comptabilité", description: "Saisie, journaux, lettrage, grand livre et balances. 7 heures.", price: 25000, pricingType: "COURSE", rate: 10, siteUrl: "https://ibig-eduform.com" },
          { slug: "formation-sage-paie-rh", name: "Sage 100 Paie & RH", description: "Bulletins de paie, cotisations et déclarations sociales. 7 heures.", price: 22500, pricingType: "COURSE", rate: 10, siteUrl: "https://ibig-eduform.com" },
          { slug: "formation-sap-fi", name: "SAP FI — Comptabilité Financière", description: "Module SAP FI : comptabilisation, fournisseurs/clients et reportings. 14 heures.", price: 40000, pricingType: "COURSE", rate: 10, siteUrl: "https://ibig-eduform.com" },
          { slug: "formation-canva-design", name: "Canva Pro & Design Marketing", description: "Visuels professionnels pour réseaux sociaux, flyers et supports marketing. 7 heures.", price: 25000, pricingType: "COURSE", rate: 10, siteUrl: "https://ibig-eduform.com" },
          { slug: "formation-microsoft-project", name: "Microsoft Project", description: "Planification, Gantt, ressources et suivi budgétaire de projets. 7 heures.", price: 25000, pricingType: "COURSE", rate: 10, siteUrl: "https://ibig-eduform.com" },
          { slug: "formation-kobotoolbox", name: "KoBoToolbox & Collecte de Données", description: "Enquêtes, collecte terrain sur mobile et analyse des données. 14 heures.", price: 30000, pricingType: "COURSE", rate: 10, siteUrl: "https://ibig-eduform.com" },
          { slug: "formation-sage-etats-fiscaux", name: "Sage États Comptables & Fiscaux", description: "Bilan, compte de résultat et déclarations fiscales avec Sage. 7 heures.", price: 25000, pricingType: "COURSE", rate: 10, siteUrl: "https://ibig-eduform.com" },
          { slug: "formation-projets-humanitaires", name: "Projets Humanitaires & ONG 3 en 1", description: "Cycle de projet, reporting bailleur et gouvernance associative. 55 heures.", price: 300000, pricingType: "COURSE", rate: 10, siteUrl: "https://ibig-eduform.com" },
        ],
      },
      {
        slug: "ibig-immotrust",
        name: "IBIG IMMOTRUST",
        tagline: "Immobilier, BTP & sécurisation des investissements",
        description: "Accompagnement immobilier complet en Côte d'Ivoire : achat, vente, location, construction clé en main, rénovation et service diaspora. Zones : Abidjan, Bingerville, Grand Bassam, Yamoussoukro.",
        offerType: "Services immobiliers — commission sur opération",
        commissionModel: "5% N1 • 2,5% N2 • 1% N3 sur la valeur de l'opération",
        order: 3,
        products: [
          { slug: "immotrust-achat-vente", name: "Achat / Vente Immobilière", description: "Accompagnement pour l'achat ou la vente de villas, appartements, terrains, bureaux et commerces.", price: 0, pricingType: "SERVICE", rate: 5, siteUrl: "https://ibigimmotrust.com" },
          { slug: "gestion-locative", name: "Gestion Locative Garantie", description: "Revenus locatifs garantis : recherche de locataires, états des lieux, encaissement et reversement mensuel.", price: 0, pricingType: "SERVICE", rate: 5, siteUrl: "https://ibigimmotrust.com" },
          { slug: "immotrust-construction", name: "Construction Clé en Main", description: "Maisons, villas, immeubles et locaux professionnels — de la conception à la livraison.", price: 0, pricingType: "SERVICE", rate: 5, siteUrl: "https://ibigimmotrust.com" },
          { slug: "immotrust-renovation", name: "Rénovation & Réhabilitation", description: "Modernisation de biens pour augmenter leur valeur locative ou de revente.", price: 0, pricingType: "SERVICE", rate: 5, siteUrl: "https://ibigimmotrust.com" },
          { slug: "immotrust-recuperation-chantier", name: "Récupération de Chantiers Inachevés", description: "Reprise et finalisation de chantiers abandonnés ou bloqués.", price: 0, pricingType: "SERVICE", rate: 5, siteUrl: "https://ibigimmotrust.com" },
          { slug: "immotrust-diaspora", name: "Service Diaspora — Suivi à Distance", description: "Construction et investissement en Côte d'Ivoire depuis l'étranger avec suivi photo/vidéo.", price: 0, pricingType: "SERVICE", rate: 5, siteUrl: "https://ibigimmotrust.com" },
        ],
      },
      {
        slug: "ibig-market",
        name: "IBIG MARKET",
        tagline: "Commerce, distribution & e-commerce",
        description: "Plateforme e-commerce du groupe IBIG SARL : matériel informatique, électronique, mobilier professionnel et produits d'importation. Livraison Abidjan, paiement Mobile Money et carte.",
        offerType: "Produits physiques — achat unique",
        commissionModel: "8% N1 • 4% N2 • 2% N3 par vente",
        order: 4,
        products: [
          { slug: "ordinateur-portable", name: "Lenovo IdeaPad 1 Laptop", description: "Écran 15,6\" Full HD, 8 Go RAM, 256 Go SSD, Windows 11, audio Dolby.", price: 215000, pricingType: "PRODUCT", rate: 8, siteUrl: "https://ibig-market.com" },
          { slug: "imprimante-canon-pixma", name: "Canon PIXMA G3410 Multifonction", description: "Jet d'encre WiFi, format A4 — 12 000 pages noir, 7 000 pages couleur.", price: 90000, pricingType: "PRODUCT", rate: 8, siteUrl: "https://ibig-market.com" },
          { slug: "mobilier-bureau", name: "Mobilier & Aménagement Professionnel", description: "Bureaux, chaises ergonomiques, armoires et mobilier pour espaces professionnels.", price: 350000, pricingType: "PRODUCT", rate: 8, siteUrl: "https://ibig-market.com" },
          { slug: "fournitures-bureau-pme", name: "Fournitures de Bureau — Pack PME", description: "Kit complet de fournitures pour PME : papeterie, classeurs et consommables.", price: 150000, pricingType: "PRODUCT", rate: 8, siteUrl: "https://ibig-market.com" },
          { slug: "materiel-btp", name: "Matériel BTP & Construction", description: "Outils et équipements pour chantiers BTP. Sourcing professionnel et livraison sur site.", price: 0, pricingType: "PRODUCT", rate: 8, siteUrl: "https://ibig-market.com" },
        ],
      },
      {
        slug: "intermark-business",
        name: "INTERMARK BUSINESS",
        tagline: "Conseil stratégique, ingénierie de projets & structuration",
        description: "Pôle conseil du groupe IBIG SARL : diagnostic organisationnel, ingénierie financière, structuration de projets, digitalisation et développement commercial en Afrique.",
        offerType: "Services de conseil — devis personnalisé",
        commissionModel: "8% N1 • 4% N2 • 2% N3 sur la valeur de la mission",
        order: 5,
        products: [
          { slug: "conseil-diagnostic-strategique", name: "Conseil & Diagnostic Stratégique", description: "Analyse complète de votre entreprise et plan d'action priorisé.", price: 0, pricingType: "SERVICE", rate: 8, siteUrl: "https://intermark-business.com" },
          { slug: "accompagnement-structuration-projets", name: "Accompagnement & Structuration de Projets", description: "Business plan, montage financier, recherche de financement et mise en œuvre.", price: 0, pricingType: "SERVICE", rate: 8, siteUrl: "https://intermark-business.com" },
          { slug: "ingenierie-financiere-levee-fonds", name: "Ingénierie Financière & Levée de Fonds", description: "Structuration financière, dossiers bancaires et mobilisation de capitaux.", price: 0, pricingType: "SERVICE", rate: 8, siteUrl: "https://intermark-business.com" },
          { slug: "site-web-vitrine", name: "Digitalisation & Déploiement ERP", description: "Transformation digitale : audit des processus, déploiement d'ERP et accompagnement au changement.", price: 0, pricingType: "SERVICE", rate: 8, siteUrl: "https://intermark-business.com" },
          { slug: "developpement-commercial-partenariats", name: "Développement Commercial & Partenariats", description: "Stratégie commerciale, développement de marchés et partenariats stratégiques.", price: 0, pricingType: "SERVICE", rate: 8, siteUrl: "https://intermark-business.com" },
        ],
      },
    ];

    let totalProducts = 0;
    for (const b of branches) {
      const { products, ...branchFields } = b;
      const branch = await prisma.branch.create({ data: branchFields });
      for (const p of products) {
        await prisma.product.create({ data: { ...p, branchId: branch.id } });
        totalProducts++;
      }
    }

    // Paramètres plateforme
    await prisma.setting.createMany({
      data: [
        { key: "min_payout", value: "5000" },
        { key: "cookie_days", value: "90" },
        { key: "payment_delay_days", value: "7" },
        { key: "company_name", value: "IBIG SARL — Groupe Intermark Business International" },
        { key: "company_address", value: "Cocody Riviera Palmeraie — Abidjan, Côte d'Ivoire" },
      ],
      skipDuplicates: true,
    });

    // Notification de bienvenue
    await prisma.notification.create({
      data: {
        userId: null,
        title: "Bienvenue sur IBIG PARTNERS",
        body: "Le programme d'affiliation multi-niveaux du groupe IBIG SARL est en ligne. Activez vos produits et commencez à gagner !",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Base initialisée avec succès !",
      admin: "admin@ibigpartners.com",
      password: "Admin@IBIG2025!",
      branches: branches.length,
      products: totalProducts,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

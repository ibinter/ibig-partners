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

  // --- Branches & produits (données réelles — sites actifs du groupe IBIG SARL) ---
  // Sources : ibigsoft.com | ibig-eduform.com | ibigimmotrust.com | ibig-market.com | intermark-business.com
  const branchesData = [
    // ══════════════════════════════════════════════
    // 1. IBIG SOFT — ibigsoft.com
    // ══════════════════════════════════════════════
    {
      slug: "ibig-soft",
      name: "IBIG SOFT",
      tagline: "Édition logicielle, SaaS & applications métiers",
      description:
        "IBIG SOFT conçoit et commercialise des solutions SaaS et ERP adaptés aux réalités africaines. " +
        "De la gestion scolaire à la gestion de flotte en passant par le commerce et la livraison, " +
        "chaque logiciel est pensé pour les PME et institutions du continent.",
      offerType: "Abonnements mensuels & annuels",
      commissionModel: "20% N1 • 10% N2 • 5% N3 (dégressif sur 4 mois) | Annuel : 20% N1 • 8% N2 • 3% N3",
      order: 1,
      products: [
        {
          slug: "scolaby",
          name: "Scolaby",
          description: "Plateforme de gestion scolaire nouvelle génération pour l'Afrique — du préscolaire au supérieur. Gestion des élèves, inscriptions, notes, bulletins, absences, paiements de frais et communication parents-école.",
          price: 30000,
          pricingType: "MONTHLY_SUB",
          rate: 20,
          siteUrl: "https://scolaby.com",
        },
        {
          slug: "scolaby-annuel",
          name: "Scolaby (annuel)",
          description: "Abonnement annuel Scolaby avec 2 mois offerts. Toutes les fonctionnalités de gestion scolaire pour établissements de toutes tailles.",
          price: 300000,
          pricingType: "ANNUAL_SUB",
          rate: 20,
          siteUrl: "https://scolaby.com",
        },
        {
          slug: "ibig-fleet-360",
          name: "IBIG Fleet 360",
          description: "ERP tout-en-un de gestion de flotte conçu pour les réalités africaines. Cycle de vie des véhicules, coût au km, maintenance préventive, carburant, chauffeurs et affectations.",
          price: 45000,
          pricingType: "MONTHLY_SUB",
          rate: 20,
          siteUrl: "https://ibigfleet360.com",
        },
        {
          slug: "zelivry",
          name: "Zelivry",
          description: "Application web tout-en-un pour gérer une activité de livraison. Commandes, clients, livreurs, inventaire, paiements et suivi en temps réel depuis une interface unique.",
          price: 25000,
          pricingType: "MONTHLY_SUB",
          rate: 20,
          siteUrl: "https://zelivry.com",
        },
        {
          slug: "lokativo",
          name: "Lokativo",
          description: "Système de gestion immobilière panafricain pour agences, propriétaires et syndics. Centralise le cycle locatif complet : mandats, baux, quittances, charges, relances et reporting.",
          price: 35000,
          pricingType: "MONTHLY_SUB",
          rate: 20,
          siteUrl: "https://lokativo.com",
        },
        {
          slug: "gescomxel",
          name: "GESCOMXEL",
          description: "Solution intelligente de gestion commerciale pour PME, boutiques, supermarchés, pharmacies et sociétés de distribution. CRM intégré, facturation, gestion des stocks et outils Excel automatisés.",
          price: 20000,
          pricingType: "MONTHLY_SUB",
          rate: 20,
          siteUrl: "https://ibigsoft.com/gescomxel.php",
        },
        {
          slug: "stockflow",
          name: "STOCKFLOW ERP",
          description: "ERP commercial 100% cloud multi-tenant pour PME, boutiques, distributeurs et entreprises multi-sites en Afrique. Stocks, ventes, achats, comptabilité simplifiée et tableaux de bord en temps réel.",
          price: 40000,
          pricingType: "MONTHLY_SUB",
          rate: 20,
          siteUrl: "https://stockflow.ibigsoft.com",
        },
      ],
    },

    // ══════════════════════════════════════════════
    // 2. IBIG EDUFORM — ibig-eduform.com
    // ══════════════════════════════════════════════
    {
      slug: "ibig-eduform",
      name: "IBIG EDUFORM",
      tagline: "Formation professionnelle, certifications & insertion",
      description:
        "IBIG EDUFORM propose des formations professionnelles certifiantes en présentiel et en ligne, " +
        "couvrant la comptabilité, les RH, l'audit, les logiciels de gestion (Sage, SAP), " +
        "la data, l'IA, la logistique et bien d'autres domaines. Sessions mensuelles avec places limitées.",
      offerType: "Formations hybrides (en ligne & présentiel) — paiement unique par session",
      commissionModel: "10% N1 • 5% N2 • 2% N3 par inscription",
      order: 2,
      products: [
        {
          slug: "formation-comptabilite",
          name: "Comptabilité & Finance 4 en 1",
          description: "Formation certifiante en Comptabilité & Finance couvrant la comptabilité générale, analytique, la fiscalité et l'analyse financière. 65 heures, hybride.",
          price: 400000,
          pricingType: "COURSE",
          rate: 10,
          siteUrl: "https://ibig-eduform.com",
        },
        {
          slug: "formation-gescom-business",
          name: "GESCOM Business 4 en 1",
          description: "Formation complète en Commerce & Marketing : gestion commerciale, techniques de vente, marketing digital et CRM. 65 heures de contenu intensif avec certification.",
          price: 400000,
          pricingType: "COURSE",
          rate: 10,
          siteUrl: "https://ibig-eduform.com",
        },
        {
          slug: "formation-daf-dirigeant",
          name: "DAF Dirigeant",
          description: "Formation de haut niveau pour Directeurs Administratifs et Financiers : pilotage financier, contrôle de gestion, tableaux de bord, gestion de trésorerie. 100 heures.",
          price: 425000,
          pricingType: "COURSE",
          rate: 10,
          siteUrl: "https://ibig-eduform.com",
        },
        {
          slug: "formation-expert-rh",
          name: "Expert RH 3 en 1 — RH, Paie & Data Analytics",
          description: "Maîtrisez la GRH, la gestion de la paie et l'analyse de données RH dans une seule formation. 55 heures, profil idéal pour les gestionnaires RH en montée de compétences.",
          price: 450000,
          pricingType: "COURSE",
          rate: 10,
          siteUrl: "https://ibig-eduform.com",
        },
        {
          slug: "formation-audit-controle",
          name: "Audit & Contrôle de Gestion 4 en 1",
          description: "Formation complète couvrant l'audit interne/externe, le contrôle de gestion, le reporting financier et la conformité. 65 heures avec certification.",
          price: 400000,
          pricingType: "COURSE",
          rate: 10,
          siteUrl: "https://ibig-eduform.com",
        },
        {
          slug: "formation-qhse",
          name: "QHSE Expert 4 en 1",
          description: "Qualité, Hygiène, Sécurité, Environnement : formation complète pour responsables QHSE. Normes ISO, audits, plans d'action et culture sécurité. 65 heures.",
          price: 350000,
          pricingType: "COURSE",
          rate: 10,
          siteUrl: "https://ibig-eduform.com",
        },
        {
          slug: "formation-logistique-supply",
          name: "Logistique & Supply Chain Management 4 en 1",
          description: "Formation intensive en gestion de la chaîne logistique : approvisionnement, transport, entreposage, gestion des stocks et optimisation des coûts. 65 heures.",
          price: 450000,
          pricingType: "COURSE",
          rate: 10,
          siteUrl: "https://ibig-eduform.com",
        },
        {
          slug: "formation-marches-publics",
          name: "Passation des Marchés Publics & Gestion des Achats 3 en 1",
          description: "Maîtrisez la règlementation des marchés publics, la gestion des appels d'offres et les techniques d'achat professionnel. 55 heures.",
          price: 300000,
          pricingType: "COURSE",
          rate: 10,
          siteUrl: "https://ibig-eduform.com",
        },
        {
          slug: "formation-projets-humanitaires",
          name: "Gestion & Management de Projets Humanitaires & ONG 3 en 1",
          description: "Conception, gestion du cycle de projet, reporting bailleur et gouvernance associative pour professionnels des ONG et du secteur humanitaire. 55 heures.",
          price: 300000,
          pricingType: "COURSE",
          rate: 10,
          siteUrl: "https://ibig-eduform.com",
        },
        {
          slug: "formation-immobilier-pro",
          name: "Immobilier Professionnel 3 en 1",
          description: "Techniques de vente immobilière, gestion locative et investissement immobilier en Afrique. Formation pratique orientée terrain. 65 heures.",
          price: 475000,
          pricingType: "COURSE",
          rate: 10,
          siteUrl: "https://ibig-eduform.com",
        },
        {
          slug: "formation-power-bi",
          name: "Microsoft Power BI",
          description: "Maîtrisez Power BI pour créer des tableaux de bord interactifs, analyser vos données et produire des rapports professionnels. Formation pratique de 14 heures.",
          price: 35000,
          pricingType: "COURSE",
          rate: 10,
          siteUrl: "https://ibig-eduform.com",
        },
        {
          slug: "formation-sage-comptabilite",
          name: "Sage 100 Comptabilité",
          description: "Prise en main complète de Sage 100 Comptabilité : saisie, journaux, lettrage, grand livre, balances et éditions légales. 7 heures — formation spécialisée.",
          price: 25000,
          pricingType: "COURSE",
          rate: 10,
          siteUrl: "https://ibig-eduform.com",
        },
        {
          slug: "formation-sage-paie-rh",
          name: "Sage 100 Paie & RH",
          description: "Paramétrage et gestion de la paie avec Sage 100 : bulletins, cotisations, déclarations sociales et états RH. 7 heures de formation pratique.",
          price: 22500,
          pricingType: "COURSE",
          rate: 10,
          siteUrl: "https://ibig-eduform.com",
        },
        {
          slug: "formation-sage-gescom",
          name: "Sage 100 GESCOM",
          description: "Gestion commerciale avec Sage 100 : devis, commandes, bons de livraison, factures, stocks et reporting commercial. 7 heures de formation pratique.",
          price: 25000,
          pricingType: "COURSE",
          rate: 10,
          siteUrl: "https://ibig-eduform.com",
        },
        {
          slug: "formation-sap-fi",
          name: "SAP FI — Comptabilité Financière",
          description: "Introduction et pratique du module SAP FI : comptabilisation, gestion des fournisseurs/clients, clôtures et reportings dans l'environnement SAP. 14 heures.",
          price: 40000,
          pricingType: "COURSE",
          rate: 10,
          siteUrl: "https://ibig-eduform.com",
        },
        {
          slug: "formation-ia-professionnels",
          name: "Intelligence Artificielle pour Professionnels",
          description: "Découvrez et utilisez l'IA dans votre activité professionnelle : ChatGPT, Copilot, automatisation, rédaction assistée et cas d'usage métiers. 7 heures.",
          price: 25000,
          pricingType: "COURSE",
          rate: 10,
          siteUrl: "https://ibig-eduform.com",
        },
        {
          slug: "formation-canva-design",
          name: "Canva Pro & Design Marketing",
          description: "Créez des visuels professionnels pour vos réseaux sociaux, présentations, flyers et supports marketing avec Canva Pro. 7 heures — pratique et accessible à tous.",
          price: 25000,
          pricingType: "COURSE",
          rate: 10,
          siteUrl: "https://ibig-eduform.com",
        },
        {
          slug: "formation-kobotoolbox",
          name: "KoBoToolbox & Collecte de Données",
          description: "Conception d'enquêtes, collecte terrain sur mobile et analyse des données avec KoBoToolbox. Idéal pour ONG, chercheurs et institutions. 14 heures.",
          price: 30000,
          pricingType: "COURSE",
          rate: 10,
          siteUrl: "https://ibig-eduform.com",
        },
        {
          slug: "formation-microsoft-project",
          name: "Microsoft Project",
          description: "Planification, suivi et reporting de projets avec Microsoft Project. Création de Gantt, gestion des ressources, jalons et budget. 7 heures de formation pratique.",
          price: 25000,
          pricingType: "COURSE",
          rate: 10,
          siteUrl: "https://ibig-eduform.com",
        },
        {
          slug: "formation-sage-etats-fiscaux",
          name: "Sage États Comptables & Fiscaux",
          description: "Maîtrisez la production des états financiers (bilan, compte de résultat) et des déclarations fiscales avec Sage. 7 heures de formation avancée.",
          price: 25000,
          pricingType: "COURSE",
          rate: 10,
          siteUrl: "https://ibig-eduform.com",
        },
      ],
    },

    // ══════════════════════════════════════════════
    // 3. IBIG IMMOTRUST — ibigimmotrust.com
    // ══════════════════════════════════════════════
    {
      slug: "ibig-immotrust",
      name: "IBIG IMMOTRUST",
      tagline: "Immobilier, BTP & sécurisation des investissements",
      description:
        "IBIG IMMOTRUST accompagne particuliers, entreprises et diaspora dans tous leurs projets immobiliers en Côte d'Ivoire : " +
        "achat, vente, location, construction clé en main, rénovation et gestion locative garantie. " +
        "Zones couvertes : Abidjan, Bingerville, Grand Bassam, Yamoussoukro.",
      offerType: "Services immobiliers et BTP — commission sur opération",
      commissionModel: "5% N1 • 2,5% N2 • 1% N3 sur la valeur de l'opération",
      order: 3,
      products: [
        {
          slug: "immotrust-achat-vente",
          name: "Achat / Vente Immobilière",
          description: "Accompagnement complet pour l'achat ou la vente de villas, duplex, appartements, studios, immeubles, terrains, bureaux et commerces. Sécurisation juridique incluse.",
          price: 0,
          pricingType: "SERVICE",
          rate: 5,
          siteUrl: "https://ibigimmotrust.com",
        },
        {
          slug: "gestion-locative",
          name: "Gestion Locative Garantie",
          description: "Confiez votre bien à IBIG IMMOTRUST pour une gestion locative professionnelle avec revenus garantis : recherche de locataires, états des lieux, encaissement et reversement mensuel.",
          price: 0,
          pricingType: "SERVICE",
          rate: 5,
          siteUrl: "https://ibigimmotrust.com",
        },
        {
          slug: "immotrust-construction-cle-en-main",
          name: "Construction Clé en Main",
          description: "Réalisation complète de maisons individuelles, villas, immeubles et locaux professionnels — de la conception architecturale au suivi de chantier jusqu'à la livraison.",
          price: 0,
          pricingType: "SERVICE",
          rate: 5,
          siteUrl: "https://ibigimmotrust.com",
        },
        {
          slug: "immotrust-renovation",
          name: "Rénovation & Réhabilitation",
          description: "Modernisation et optimisation de biens existants pour augmenter leur valeur locative ou de revente. Diagnostic, devis détaillé, travaux et réception.",
          price: 0,
          pricingType: "SERVICE",
          rate: 5,
          siteUrl: "https://ibigimmotrust.com",
        },
        {
          slug: "immotrust-recuperation-chantier",
          name: "Récupération de Chantiers Inachevés",
          description: "Reprise et finalisation de chantiers abandonnés ou bloqués. Diagnostic technique, chiffrage exact, plan de relance et supervision jusqu'à livraison.",
          price: 0,
          pricingType: "SERVICE",
          rate: 5,
          siteUrl: "https://ibigimmotrust.com",
        },
        {
          slug: "immotrust-diaspora",
          name: "Service Diaspora — Suivi à Distance",
          description: "Pour les Africains de la diaspora souhaitant investir ou construire en Côte d'Ivoire sans être présents : suivi de chantier avec photos/vidéos, coordination d'équipes et reporting régulier.",
          price: 0,
          pricingType: "SERVICE",
          rate: 5,
          siteUrl: "https://ibigimmotrust.com",
        },
      ],
    },

    // ══════════════════════════════════════════════
    // 4. IBIG MARKET — ibig-market.com
    // ══════════════════════════════════════════════
    {
      slug: "ibig-market",
      name: "IBIG MARKET",
      tagline: "Commerce, distribution & e-commerce",
      description:
        "IBIG MARKET est la plateforme e-commerce et de distribution du groupe IBIG SARL. " +
        "Matériel informatique, électronique, mobilier professionnel, fournitures de bureau et produits d'importation. " +
        "Livraison sur Abidjan, paiement Mobile Money, Wave et carte bancaire.",
      offerType: "Produits physiques — achat unique",
      commissionModel: "8% N1 • 4% N2 • 2% N3 par vente réalisée",
      order: 4,
      products: [
        {
          slug: "ordinateur-portable",
          name: "Lenovo IdeaPad 1 Laptop",
          description: "Ordinateur portable Lenovo IdeaPad 1 — écran 15,6\" Full HD, processeur dual-core, 8 Go RAM, 256 Go SSD, Windows 11, audio Dolby. Idéal bureau et études.",
          price: 215000,
          pricingType: "PRODUCT",
          rate: 8,
          siteUrl: "https://ibig-market.com",
        },
        {
          slug: "imprimante-canon-pixma",
          name: "Canon PIXMA G3410 Multifonction",
          description: "Imprimante multifonction jet d'encre Canon PIXMA G3410 avec réservoirs rechargeables. WiFi, format A4 — jusqu'à 12 000 pages noir et 7 000 pages couleur.",
          price: 90000,
          pricingType: "PRODUCT",
          rate: 8,
          siteUrl: "https://ibig-market.com",
        },
        {
          slug: "mobilier-bureau",
          name: "Mobilier & Aménagement Professionnel",
          description: "Bureaux, chaises ergonomiques, armoires et mobilier professionnel pour équiper vos espaces de travail. Sourcing, livraison et montage sur Abidjan.",
          price: 350000,
          pricingType: "PRODUCT",
          rate: 8,
          siteUrl: "https://ibig-market.com",
        },
        {
          slug: "fournitures-bureau-pme",
          name: "Fournitures de Bureau — Pack PME",
          description: "Kit complet de fournitures de bureau pour PME et startups : papeterie, classeurs, matériel de bureau et consommables. Commande groupée avec devis personnalisé.",
          price: 150000,
          pricingType: "PRODUCT",
          rate: 8,
          siteUrl: "https://ibig-market.com",
        },
        {
          slug: "materiel-btp",
          name: "Matériel BTP & Construction",
          description: "Outils, équipements et matériaux pour chantiers BTP. Sourcing professionnel avec importation directe et livraison sur site. Devis sur mesure pour entreprises du BTP.",
          price: 0,
          pricingType: "PRODUCT",
          rate: 8,
          siteUrl: "https://ibig-market.com",
        },
      ],
    },

    // ══════════════════════════════════════════════
    // 5. INTERMARK BUSINESS — intermark-business.com
    // ══════════════════════════════════════════════
    {
      slug: "intermark-business",
      name: "INTERMARK BUSINESS",
      tagline: "Conseil stratégique, ingénierie de projets & structuration",
      description:
        "Intermark Business International est le pôle conseil et stratégie du groupe IBIG SARL. " +
        "Accompagnement des entreprises et porteurs de projets en Afrique : diagnostic organisationnel, " +
        "ingénierie financière, structuration de projets, digitalisation et développement commercial.",
      offerType: "Services de conseil et accompagnement — devis personnalisé",
      commissionModel: "8% N1 • 4% N2 • 2% N3 sur la valeur de la mission",
      order: 5,
      products: [
        {
          slug: "conseil-diagnostic-strategique",
          name: "Conseil & Diagnostic Stratégique",
          description: "Analyse complète de la situation de votre entreprise : forces, faiblesses, opportunités, menaces. Plan d'action priorisé et recommandations de structuration.",
          price: 0,
          pricingType: "SERVICE",
          rate: 8,
          siteUrl: "https://intermark-business.com",
        },
        {
          slug: "accompagnement-structuration-projets",
          name: "Accompagnement & Structuration de Projets",
          description: "Accompagnement opérationnel sur mesure pour structurer votre projet de A à Z : business plan, montage financier, recherche de financement et mise en œuvre.",
          price: 0,
          pricingType: "SERVICE",
          rate: 8,
          siteUrl: "https://intermark-business.com",
        },
        {
          slug: "ingenierie-financiere-levee-fonds",
          name: "Ingénierie Financière & Levée de Fonds",
          description: "Structuration financière de projets, préparation de dossiers bancaires, mobilisation de capitaux auprès d'investisseurs et réseau de partenaires financiers.",
          price: 0,
          pricingType: "SERVICE",
          rate: 8,
          siteUrl: "https://intermark-business.com",
        },
        {
          slug: "site-web-vitrine",
          name: "Digitalisation & Déploiement ERP",
          description: "Transformation digitale de votre organisation : audit des processus, sélection et déploiement d'ERP, formation des équipes et accompagnement au changement.",
          price: 0,
          pricingType: "SERVICE",
          rate: 8,
          siteUrl: "https://intermark-business.com",
        },
        {
          slug: "developpement-commercial-partenariats",
          name: "Développement Commercial & Partenariats",
          description: "Stratégie commerciale, développement de marchés, représentation commerciale et mise en relation avec des partenaires stratégiques en Afrique et dans la diaspora.",
          price: 0,
          pricingType: "SERVICE",
          rate: 8,
          siteUrl: "https://intermark-business.com",
        },
      ],
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
        active: (b as { active?: boolean }).active ?? true,
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
  for (const slug of ["scolaby", "ibig-fleet-360", "formation-comptabilite"]) {
    const product = productBySlug[slug];
    await prisma.affiliateLink.create({
      data: { userId: moussa.id, productId: product.id, code: moussa.code, clicks: Math.floor(Math.random() * 30) },
    });
  }
  await prisma.affiliateLink.create({ data: { userId: koffi.id, productId: productBySlug["scolaby"].id, code: koffi.code, clicks: 52 } });
  await prisma.affiliateLink.create({ data: { userId: aya.id, productId: productBySlug["formation-qhse"].id, code: aya.code, clicks: 18 } });
  await prisma.affiliateLink.create({ data: { userId: koffi.id, productId: productBySlug["gescomxel"].id, code: koffi.code, clicks: 24 } });

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
  await createSale({ sellerId: koffi.id, productSlug: "formation-daf-dirigeant", customerName: "Koné Dramane", daysAgo: 8 });

  // Aya (N2 sous Koffi) vend -> Aya touche N1, Koffi touche N2
  await createSale({ sellerId: aya.id, productSlug: "gescomxel", customerName: "Cabinet Konan & Associés", monthsPaid: 3, daysAgo: 90 });
  await createSale({ sellerId: aya.id, productSlug: "formation-qhse", customerName: "BTP Services SARL", daysAgo: 20 });
  await createSale({ sellerId: aya.id, productSlug: "gestion-locative", customerName: "Mme Adjoua Brou", daysAgo: 12 });

  // Moussa (N3 sous Aya sous Koffi) vend -> Moussa N1, Aya N2, Koffi N3
  await createSale({ sellerId: moussa.id, productSlug: "scolaby", customerName: "Institut Privé Wisdom", monthsPaid: 2, daysAgo: 45 });
  await createSale({ sellerId: moussa.id, productSlug: "ordinateur-portable", customerName: "Awa Cissé", daysAgo: 3 });
  await createSale({ sellerId: moussa.id, productSlug: "ibig-fleet-360", customerName: "Transport Express CI", monthsPaid: 1, daysAgo: 7 });

  // Une vente en attente de confirmation
  await createSale({ sellerId: koffi.id, productSlug: "stockflow", customerName: "Quincaillerie du Plateau", status: "PENDING", daysAgo: 1 });

  // --- Recalcule les statuts ---
  for (const u of [koffi.id, aya.id, moussa.id]) await recomputeStatus(u);

  // --- Kits marketing ---
  console.log("Création des kits marketing…");
  const softBranch    = await prisma.branch.findUnique({ where: { slug: "ibig-soft" } });
  const eduBranch     = await prisma.branch.findUnique({ where: { slug: "ibig-eduform" } });
  const immoBranch    = await prisma.branch.findUnique({ where: { slug: "ibig-immotrust" } });
  const marketBranch  = await prisma.branch.findUnique({ where: { slug: "ibig-market" } });
  const conseilBranch = await prisma.branch.findUnique({ where: { slug: "intermark-business" } });
  await prisma.marketingKit.createMany({
    data: [
      // IBIG SOFT
      { branchId: softBranch!.id, title: "Argumentaire Scolaby", type: "ARGUMENT", content: "Scolaby digitalise la gestion de votre établissement scolaire : inscriptions en ligne, notes, bulletins automatiques, paiements et SMS parents. Dites adieu aux cahiers et aux erreurs. Abonnement dès 30 000 FCFA/mois.", minStatus: "STARTER" },
      { branchId: softBranch!.id, title: "Argumentaire IBIG Fleet 360", type: "ARGUMENT", content: "IBIG Fleet 360 est l'ERP de gestion de flotte pensé pour l'Afrique. Gérez vos véhicules, chauffeurs, maintenances, carburant et coûts depuis un seul tableau de bord. Abonnement à partir de 45 000 FCFA/mois.", minStatus: "STARTER" },
      { branchId: softBranch!.id, title: "Argumentaire GESCOMXEL", type: "ARGUMENT", content: "GESCOMXEL est votre logiciel de gestion commerciale tout-en-un : CRM, devis, factures, stocks et caisse. Idéal pour boutiques, pharmacies, supermarchés et PME. Démarrez à 20 000 FCFA/mois.", minStatus: "STARTER" },
      { branchId: softBranch!.id, title: "Argumentaire Zelivry", type: "ARGUMENT", content: "Zelivry centralise toute votre activité de livraison : commandes, clients, livreurs, paiements et suivi en temps réel. La solution web sur mesure pour les startups de livraison africaines.", minStatus: "STARTER" },
      { branchId: softBranch!.id, title: "Visuel WhatsApp Scolaby", type: "VISUAL", content: "https://placehold.co/1080x1080/0b5fff/white?text=Scolaby+%E2%80%94+Gestion+Scolaire+SaaS", minStatus: "STARTER" },
      { branchId: softBranch!.id, title: "Vidéo démo IBIG SOFT", type: "VIDEO", content: "https://ibigsoft.com", minStatus: "SILVER" },
      // IBIG EDUFORM
      { branchId: eduBranch!.id, title: "Argumentaire formations EDUFORM", type: "ARGUMENT", content: "Boostez votre carrière avec IBIG EDUFORM ! Formations certifiantes en comptabilité, RH, QHSE, logistique, Sage, SAP, Power BI et bien plus. Sessions mensuelles, hybride présentiel/en ligne, places limitées. Tarifs de 22 500 à 475 000 FCFA.", minStatus: "STARTER" },
      { branchId: eduBranch!.id, title: "Argumentaire DAF Dirigeant", type: "ARGUMENT", content: "La formation DAF Dirigeant d'IBIG EDUFORM est la référence pour les directeurs financiers en Afrique. 100 heures de formation intensive avec experts-comptables et directeurs financiers confirmés. Inscriptions ouvertes !", minStatus: "STARTER" },
      { branchId: eduBranch!.id, title: "Argumentaire Sage 100", type: "ARGUMENT", content: "Maîtrisez Sage 100 en 7 heures de formation intensive ! Comptabilité, Paie & RH ou GESCOM — choisissez votre module. Certification à la clé, formation pratique sur cas réels. Dès 22 500 FCFA.", minStatus: "STARTER" },
      { branchId: eduBranch!.id, title: "Visuel formations EDUFORM", type: "VISUAL", content: "https://placehold.co/1080x1080/6d28d9/white?text=IBIG+EDUFORM+%E2%80%94+Formations+Certifiantes", minStatus: "STARTER" },
      // IBIG IMMOTRUST
      { branchId: immoBranch!.id, title: "Argumentaire Gestion Locative", type: "ARGUMENT", content: "Confiez votre bien à IBIG IMMOTRUST et percevez vos loyers sans stress. Gestion locative garantie : nous trouvons les locataires, encaissons les loyers et vous reversons chaque mois. Couverture : Abidjan, Bingerville, Grand Bassam, Yamoussoukro.", minStatus: "STARTER" },
      { branchId: immoBranch!.id, title: "Argumentaire Diaspora", type: "ARGUMENT", content: "Vous êtes en Europe, aux USA ou au Canada et souhaitez construire ou investir en Côte d'Ivoire ? IBIG IMMOTRUST gère tout à distance : suivi de chantier photographié, équipes sélectionnées, budget maîtrisé et compte-rendu régulier.", minStatus: "STARTER" },
      // IBIG MARKET
      { branchId: marketBranch!.id, title: "Argumentaire IBIG MARKET", type: "ARGUMENT", content: "IBIG MARKET : votre partenaire d'approvisionnement professionnel à Abidjan. Matériel informatique, mobilier de bureau, fournitures et équipements BTP. Livraison rapide, paiement Mobile Money, Wave ou carte. Devis B2B personnalisé disponible.", minStatus: "STARTER" },
      // INTERMARK BUSINESS
      { branchId: conseilBranch!.id, title: "Argumentaire Conseil Stratégique", type: "ARGUMENT", content: "Intermark Business International accompagne les dirigeants africains dans la structuration et le développement de leurs entreprises. Diagnostic, business plan, levée de fonds, digitalisation et partenariats — une équipe d'experts à vos côtés.", minStatus: "SILVER" },
    ],
  });

  // --- Prospects & opportunites ---
  console.log("Création des prospects et opportunités…");
  await prisma.prospect.createMany({
    data: [
      { userId: koffi.id, name: "Collège Moderne d'Abobo", contact: "+2250711223344", productId: productBySlug["scolaby"].id, status: "DEMO", note: "Démo Scolaby prévue vendredi" },
      { userId: koffi.id, name: "Pharmacie du Rond-Point", contact: "+2250755667788", productId: productBySlug["gescomxel"].id, status: "CONTACTED", note: "Intéressé par GESCOMXEL pour la gestion de stock" },
      { userId: koffi.id, name: "Transport Kossi SARL", contact: "+2250700112233", productId: productBySlug["ibig-fleet-360"].id, status: "DEMO", note: "Démo Fleet 360 prévue lundi" },
      { userId: aya.id, name: "Lycée Technique de Bouaké", contact: "+2250733445566", productId: productBySlug["scolaby"].id, status: "CONVERTED" },
      { userId: aya.id, name: "M. Seydou Konaté", contact: "+2250788991122", productId: productBySlug["formation-comptabilite"].id, status: "CONTACTED", note: "Cherche formation pour son équipe" },
      { userId: moussa.id, name: "Mme Adjoua Résidence", contact: "+2250744556677", productId: productBySlug["gestion-locative"].id, status: "CONTACTED", note: "Propriétaire de 3 appartements à Cocody" },
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

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BASE = "https://intermark-business.com/digital";

const DIGITAL_PRODUCTS = [
  // â”€â”€ Sites Web â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "digital-site-vitrine",
    name: "Site Web Vitrine",
    pricingType: "SERVICE",
    price: 175000,
    rate: 10,
    siteUrl: BASE,
    description: "CrÃ©ation d'un site web vitrine professionnel 5 Ã  10 pages : design sur mesure, responsive mobile, formulaire de contact, intÃ©gration rÃ©seaux sociaux, hÃ©bergement 1Ã¨re annÃ©e inclus. IdÃ©al pour PME, professions libÃ©rales et associations souhaitant une prÃ©sence en ligne crÃ©dible. Livraison 15 jours. Ã€ partir de 175 000 FCFA.",
  },
  {
    slug: "digital-site-ecommerce",
    name: "Site E-Commerce",
    pricingType: "SERVICE",
    price: 450000,
    rate: 10,
    siteUrl: BASE,
    description: "CrÃ©ation d'une boutique en ligne complÃ¨te : catalogue produits, panier, paiement sÃ©curisÃ© (Mobile Money, carte bancaire), gestion des commandes et tableau de bord administrateur. Pour commerces, artisans et entrepreneurs souhaitant vendre en ligne 24h/24. Livraison 30 jours. Ã€ partir de 450 000 FCFA.",
  },
  {
    slug: "digital-plateforme-sur-mesure",
    name: "Plateforme Web & Application sur Mesure",
    pricingType: "SERVICE",
    price: 900000,
    rate: 8,
    siteUrl: BASE,
    description: "DÃ©veloppement d'une plateforme web ou application mobile sur mesure : portail client, espace membre, marketplace, application mÃ©tier ou SaaS. Analyse des besoins, conception UX/UI, dÃ©veloppement, tests et dÃ©ploiement inclus. Pour entreprises ayant des besoins spÃ©cifiques non couverts par les solutions standard. Sur devis Ã  partir de 900 000 FCFA.",
  },
  {
    slug: "digital-refonte-site",
    name: "Refonte de Site Web",
    pricingType: "SERVICE",
    price: 120000,
    rate: 10,
    siteUrl: BASE,
    description: "Modernisation d'un site existant : nouveau design, optimisation mobile, amÃ©lioration des performances et du rÃ©fÃ©rencement naturel. Conservation du contenu existant avec mise Ã  jour et restructuration. Pour entreprises dont le site est vieillissant ou peu performant. Ã€ partir de 120 000 FCFA.",
  },

  // â”€â”€ IdentitÃ© Visuelle & Design â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "digital-logo-charte",
    name: "Logo & Charte Graphique",
    pricingType: "SERVICE",
    price: 85000,
    rate: 12,
    siteUrl: BASE,
    description: "CrÃ©ation d'une identitÃ© visuelle complÃ¨te : logo professionnel (3 propositions), charte graphique (couleurs, typographies, rÃ¨gles d'utilisation) et fichiers sources livrÃ©s (AI, PNG, PDF). Pour startups, PME et associations souhaitant une image de marque forte et cohÃ©rente. Livraison 7 jours. Ã€ partir de 85 000 FCFA.",
  },
  {
    slug: "digital-supports-communication",
    name: "Supports de Communication Print & Digital",
    pricingType: "SERVICE",
    price: 45000,
    rate: 12,
    siteUrl: BASE,
    description: "Conception de supports de communication professionnels : flyers, affiches, brochures, cartes de visite, banniÃ¨res web, prÃ©sentations PowerPoint et posts rÃ©seaux sociaux. Design sur mesure aux couleurs de votre marque. Pour entreprises souhaitant des supports visuels impactants. Ã€ partir de 45 000 FCFA.",
  },
  {
    slug: "digital-identite-marque",
    name: "StratÃ©gie de Marque & Branding Complet",
    pricingType: "SERVICE",
    price: 250000,
    rate: 10,
    siteUrl: BASE,
    description: "DÃ©veloppement complet de votre identitÃ© de marque : positionnement, naming, logo, charte graphique, tone of voice, guide de marque et kit de dÃ©marrage complet. Pour entreprises en crÃ©ation ou en repositionnement souhaitant construire une marque forte et mÃ©morable. Ã€ partir de 250 000 FCFA.",
  },

  // â”€â”€ Community Management & RÃ©seaux Sociaux â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "digital-cm-essentiel",
    name: "Community Management â€“ Formule Essentielle",
    pricingType: "SERVICE",
    price: 75000,
    rate: 10,
    siteUrl: BASE,
    description: "Gestion mensuelle de vos rÃ©seaux sociaux â€” Formule Essentielle : 2 plateformes (Facebook + Instagram), 12 publications par mois, modÃ©ration des commentaires, rapport mensuel de performance. Pour TPE et indÃ©pendants souhaitant une prÃ©sence active sans se soucier des rÃ©seaux. 75 000 FCFA/mois.",
  },
  {
    slug: "digital-cm-pro",
    name: "Community Management â€“ Formule Pro",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Gestion mensuelle de vos rÃ©seaux sociaux â€” Formule Pro : 3 plateformes (Facebook, Instagram, LinkedIn ou TikTok), 20 publications par mois, stories, modÃ©ration, rÃ©ponse aux messages, rapport hebdomadaire et stratÃ©gie Ã©ditoriale mensuelle. Pour PME souhaitant dÃ©velopper leur communautÃ©. 150 000 FCFA/mois.",
  },
  {
    slug: "digital-cm-premium",
    name: "Community Management â€“ Formule Premium",
    pricingType: "SERVICE",
    price: 250000,
    rate: 10,
    siteUrl: BASE,
    description: "Gestion complÃ¨te de votre prÃ©sence digitale â€” Formule Premium : toutes plateformes, 30 publications/mois, contenu vidÃ©o court, campagnes sponsorisÃ©es, veille e-rÃ©putation, rapport bimensuel et accompagnement stratÃ©gique. Pour entreprises voulant dominer leur marchÃ© sur les rÃ©seaux. 250 000 FCFA/mois.",
  },

  // â”€â”€ Production de Contenus Digitaux â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "digital-production-photo",
    name: "Shooting Photo Professionnel",
    pricingType: "SERVICE",
    price: 80000,
    rate: 10,
    siteUrl: BASE,
    description: "SÃ©ance photo professionnelle pour votre entreprise : photos produits, portraits corporate, reportage Ã©vÃ©nementiel ou ambiance de marque. Livraison de 30 Ã  50 photos retouchÃ©es en haute rÃ©solution. Pour e-commerces, marques et entreprises souhaitant des visuels professionnels. Ã€ partir de 80 000 FCFA.",
  },
  {
    slug: "digital-production-video",
    name: "Production VidÃ©o & Motion Design",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Production de contenus vidÃ©o professionnels : vidÃ©o de prÃ©sentation d'entreprise, spot publicitaire, tutoriel produit, tÃ©moignage client ou motion design animÃ©. Tournage, montage et sous-titrage inclus. Pour entreprises souhaitant un contenu vidÃ©o percutant pour leurs rÃ©seaux et site web. Ã€ partir de 150 000 FCFA.",
  },
  {
    slug: "digital-creation-contenu-mensuel",
    name: "Pack CrÃ©ation de Contenus Mensuel",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Production mensuelle de contenus digitaux prÃªts Ã  publier : 20 visuels personnalisÃ©s, 4 vidÃ©os courtes (Reels/TikTok), 8 stories et 1 newsletter. LivrÃ©s en dÃ©but de mois selon votre calendrier Ã©ditorial. Pour entreprises gÃ©rant elles-mÃªmes leurs rÃ©seaux mais manquant de temps ou de compÃ©tences. 100 000 FCFA/mois.",
  },

  // â”€â”€ Campagnes Publicitaires en Ligne â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "digital-pub-meta",
    name: "Campagne Publicitaire Meta (Facebook & Instagram)",
    pricingType: "SERVICE",
    price: 125000,
    rate: 10,
    siteUrl: BASE,
    description: "Gestion de campagnes publicitaires sur Facebook et Instagram : crÃ©ation des visuels publicitaires, paramÃ©trage des audiences, lancement, optimisation quotidienne et rapport de performance mensuel. Budget publicitaire non inclus (minimum recommandÃ© : 50 000 FCFA/mois). Pour entreprises souhaitant acquÃ©rir des clients via les rÃ©seaux sociaux. Frais de gestion : 125 000 FCFA/mois.",
  },
  {
    slug: "digital-pub-google",
    name: "Campagne Google Ads (SEA)",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Gestion de campagnes Google Ads : recherche de mots-clÃ©s, crÃ©ation des annonces, paramÃ©trage, optimisation et rapport mensuel. Budget publicitaire non inclus (minimum recommandÃ© : 75 000 FCFA/mois). Pour entreprises souhaitant apparaÃ®tre en 1Ã¨re position sur Google lors des recherches de leurs prospects. Frais de gestion : 150 000 FCFA/mois.",
  },
  {
    slug: "digital-strategie-marketing-digital",
    name: "StratÃ©gie Marketing Digital 360Â°",
    pricingType: "SERVICE",
    price: 200000,
    rate: 10,
    siteUrl: BASE,
    description: "Audit et Ã©laboration de votre stratÃ©gie marketing digital : analyse de la concurrence, dÃ©finition des personas, plan de contenu, roadmap SEO/SEA/Social Media et tableau de bord de pilotage. LivrÃ© sous forme de document stratÃ©gique opÃ©rationnel. Pour dirigeants et responsables marketing souhaitant structurer leur prÃ©sence digitale. 200 000 FCFA.",
  },
  {
    slug: "digital-seo",
    name: "RÃ©fÃ©rencement Naturel (SEO)",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Optimisation du rÃ©fÃ©rencement naturel de votre site : audit SEO, optimisation technique, crÃ©ation de contenus optimisÃ©s, netlinking et rapport mensuel de positionnement. Pour entreprises souhaitant apparaÃ®tre naturellement sur Google sans payer Ã  la publicitÃ©. RÃ©sultats visibles en 3 Ã  6 mois. 100 000 FCFA/mois.",
  },

  // â”€â”€ IA & Automatisation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "digital-chatbot",
    name: "Chatbot IA & Automatisation Client",
    pricingType: "SERVICE",
    price: 300000,
    rate: 8,
    siteUrl: BASE,
    description: "DÃ©veloppement d'un chatbot intelligent pour votre site web ou WhatsApp : rÃ©ponses automatiques aux questions frÃ©quentes, prise de rendez-vous, qualification de leads et transfert vers un agent humain. RÃ©duit le temps de rÃ©ponse client et amÃ©liore la satisfaction. Pour entreprises avec un fort volume de demandes entrantes. Ã€ partir de 300 000 FCFA.",
  },
  {
    slug: "digital-automatisation-processus",
    name: "Automatisation de Processus MÃ©tier",
    pricingType: "SERVICE",
    price: 250000,
    rate: 8,
    siteUrl: BASE,
    description: "Analyse et automatisation de vos processus rÃ©pÃ©titifs : envois d'emails automatiques, synchronisation de donnÃ©es, notifications, gÃ©nÃ©ration de rapports et intÃ©grations entre applications (CRM, ERP, outils collaboratifs). Pour entreprises souhaitant gagner du temps et rÃ©duire les erreurs humaines. Sur devis Ã  partir de 250 000 FCFA.",
  },
  {
    slug: "digital-assistant-virtuel-ia",
    name: "Assistant Virtuel IA sur Mesure",
    pricingType: "SERVICE",
    price: 500000,
    rate: 8,
    siteUrl: BASE,
    description: "DÃ©veloppement d'un assistant virtuel basÃ© sur l'intelligence artificielle : traitement du langage naturel, base de connaissances personnalisÃ©e, intÃ©gration site web/WhatsApp/Telegram et tableau de bord d'administration. Pour entreprises souhaitant offrir une expÃ©rience client innovante et disponible 24h/24. Sur devis Ã  partir de 500 000 FCFA.",
  },

  // â”€â”€ ERP & Outils NumÃ©riques â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "digital-integration-erp",
    name: "IntÃ©gration & ParamÃ©trage ERP (Odoo / SAP / Sage)",
    pricingType: "SERVICE",
    price: 400000,
    rate: 8,
    siteUrl: BASE,
    description: "DÃ©ploiement et paramÃ©trage d'un ERP adaptÃ© Ã  votre activitÃ© : Odoo (open source), SAP Business One ou Sage 100. Installation, configuration des modules (comptabilitÃ©, stock, ventes, RH), formation des utilisateurs et support post-dÃ©ploiement. Pour PME souhaitant digitaliser et centraliser leur gestion. Sur devis Ã  partir de 400 000 FCFA.",
  },
  {
    slug: "digital-ged",
    name: "Mise en Place GED (Gestion Ã‰lectronique des Documents)",
    pricingType: "SERVICE",
    price: 250000,
    rate: 8,
    siteUrl: BASE,
    description: "DÃ©ploiement d'un systÃ¨me de gestion Ã©lectronique des documents : archivage numÃ©rique sÃ©curisÃ©, classement automatique, recherche instantanÃ©e, accÃ¨s collaboratif et suppressions dÃ©finitives du papier. Pour entreprises souhaitant organiser leurs archives et faciliter le travail Ã  distance. Ã€ partir de 250 000 FCFA.",
  },
  {
    slug: "digital-tableau-bord-bi",
    name: "Tableau de Bord Interactif (Business Intelligence)",
    pricingType: "SERVICE",
    price: 180000,
    rate: 10,
    siteUrl: BASE,
    description: "Conception et dÃ©veloppement de tableaux de bord de pilotage sur mesure : connexion Ã  vos sources de donnÃ©es (Excel, ERP, CRM), visualisations interactives (graphiques, KPI, cartes) et accÃ¨s en temps rÃ©el. DÃ©veloppÃ© sous Power BI ou solution web. Pour dirigeants et managers souhaitant piloter leur activitÃ© avec des donnÃ©es fiables. Ã€ partir de 180 000 FCFA.",
  },
  {
    slug: "digital-formation-outils-numeriques",
    name: "Formation aux Outils NumÃ©riques",
    pricingType: "SERVICE",
    price: 75000,
    rate: 12,
    siteUrl: BASE,
    description: "Sessions de formation pratique aux outils numÃ©riques professionnels : Microsoft 365, Google Workspace, outils de collaboration (Trello, Notion, Slack), ERP ou logiciels mÃ©tier. En prÃ©sentiel ou en ligne, groupes de 5 Ã  15 personnes. Pour Ã©quipes souhaitant maÃ®triser leurs outils digitaux et gagner en efficacitÃ©. Ã€ partir de 75 000 FCFA/jour.",
  },
];

export async function POST() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Non autorisÃ©" }, { status: 403 });
  }

  const branch = await prisma.branch.findUnique({ where: { slug: "ibig-digital" } });
  if (!branch) {
    return NextResponse.json(
      { error: "Branche IBIG DIGITAL introuvable. Synchronisez d'abord les branches." },
      { status: 404 }
    );
  }

  const knownSlugs = DIGITAL_PRODUCTS.map((p) => p.slug);

  const deleted = await prisma.product.deleteMany({
    where: {
      branchId: branch.id,
      slug: { notIn: knownSlugs },
      sales: { none: {} },
        links: { none: {} },
    },
  });

  let upserted = 0;
  for (const p of DIGITAL_PRODUCTS) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        pricingType: p.pricingType,
        price: p.price,
        rate: p.rate,
        siteUrl: p.siteUrl,
        description: p.description,
        branchId: branch.id,
        active: true,
      },
      create: {
        slug: p.slug,
        name: p.name,
        pricingType: p.pricingType,
        price: p.price,
        rate: p.rate,
        siteUrl: p.siteUrl,
        description: p.description,
        branchId: branch.id,
        active: true,
      },
    });
    upserted++;
  }

  return NextResponse.json({
    ok: true,
    upserted,
    deleted: deleted.count,
    message: `${upserted} services IBIG DIGITAL synchronisÃ©s, ${deleted.count} doublon(s) supprimÃ©(s).`,
  });
}


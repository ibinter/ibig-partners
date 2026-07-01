import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BASE = "https://intermark-business.com/digital";

const DIGITAL_PRODUCTS = [
  // ── Sites Web ─────────────────────────────────────────────────────────
  {
    slug: "digital-site-vitrine",
    name: "Site Web Vitrine",
    pricingType: "SERVICE",
    price: 175000,
    rate: 10,
    siteUrl: BASE,
    description: "Création d'un site web vitrine professionnel 5 à 10 pages : design sur mesure, responsive mobile, formulaire de contact, intégration réseaux sociaux, hébergement 1ère année inclus. Idéal pour PME, professions libérales et associations souhaitant une présence en ligne crédible. Livraison 15 jours. À partir de 175 000 FCFA.",
  },
  {
    slug: "digital-site-ecommerce",
    name: "Site E-Commerce",
    pricingType: "SERVICE",
    price: 450000,
    rate: 10,
    siteUrl: BASE,
    description: "Création d'une boutique en ligne complète : catalogue produits, panier, paiement sécurisé (Mobile Money, carte bancaire), gestion des commandes et tableau de bord administrateur. Pour commerces, artisans et entrepreneurs souhaitant vendre en ligne 24h/24. Livraison 30 jours. À partir de 450 000 FCFA.",
  },
  {
    slug: "digital-plateforme-sur-mesure",
    name: "Plateforme Web & Application sur Mesure",
    pricingType: "SERVICE",
    price: 900000,
    rate: 8,
    siteUrl: BASE,
    description: "Développement d'une plateforme web ou application mobile sur mesure : portail client, espace membre, marketplace, application métier ou SaaS. Analyse des besoins, conception UX/UI, développement, tests et déploiement inclus. Pour entreprises ayant des besoins spécifiques non couverts par les solutions standard. Sur devis à partir de 900 000 FCFA.",
  },
  {
    slug: "digital-refonte-site",
    name: "Refonte de Site Web",
    pricingType: "SERVICE",
    price: 120000,
    rate: 10,
    siteUrl: BASE,
    description: "Modernisation d'un site existant : nouveau design, optimisation mobile, amélioration des performances et du référencement naturel. Conservation du contenu existant avec mise à jour et restructuration. Pour entreprises dont le site est vieillissant ou peu performant. À partir de 120 000 FCFA.",
  },

  // ── Identité Visuelle & Design ────────────────────────────────────────
  {
    slug: "digital-logo-charte",
    name: "Logo & Charte Graphique",
    pricingType: "SERVICE",
    price: 85000,
    rate: 12,
    siteUrl: BASE,
    description: "Création d'une identité visuelle complète : logo professionnel (3 propositions), charte graphique (couleurs, typographies, règles d'utilisation) et fichiers sources livrés (AI, PNG, PDF). Pour startups, PME et associations souhaitant une image de marque forte et cohérente. Livraison 7 jours. À partir de 85 000 FCFA.",
  },
  {
    slug: "digital-supports-communication",
    name: "Supports de Communication Print & Digital",
    pricingType: "SERVICE",
    price: 45000,
    rate: 12,
    siteUrl: BASE,
    description: "Conception de supports de communication professionnels : flyers, affiches, brochures, cartes de visite, bannières web, présentations PowerPoint et posts réseaux sociaux. Design sur mesure aux couleurs de votre marque. Pour entreprises souhaitant des supports visuels impactants. À partir de 45 000 FCFA.",
  },
  {
    slug: "digital-identite-marque",
    name: "Stratégie de Marque & Branding Complet",
    pricingType: "SERVICE",
    price: 250000,
    rate: 10,
    siteUrl: BASE,
    description: "Développement complet de votre identité de marque : positionnement, naming, logo, charte graphique, tone of voice, guide de marque et kit de démarrage complet. Pour entreprises en création ou en repositionnement souhaitant construire une marque forte et mémorable. À partir de 250 000 FCFA.",
  },

  // ── Community Management & Réseaux Sociaux ────────────────────────────
  {
    slug: "digital-cm-essentiel",
    name: "Community Management – Formule Essentielle",
    pricingType: "SERVICE",
    price: 75000,
    rate: 10,
    siteUrl: BASE,
    description: "Gestion mensuelle de vos réseaux sociaux — Formule Essentielle : 2 plateformes (Facebook + Instagram), 12 publications par mois, modération des commentaires, rapport mensuel de performance. Pour TPE et indépendants souhaitant une présence active sans se soucier des réseaux. 75 000 FCFA/mois.",
  },
  {
    slug: "digital-cm-pro",
    name: "Community Management – Formule Pro",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Gestion mensuelle de vos réseaux sociaux — Formule Pro : 3 plateformes (Facebook, Instagram, LinkedIn ou TikTok), 20 publications par mois, stories, modération, réponse aux messages, rapport hebdomadaire et stratégie éditoriale mensuelle. Pour PME souhaitant développer leur communauté. 150 000 FCFA/mois.",
  },
  {
    slug: "digital-cm-premium",
    name: "Community Management – Formule Premium",
    pricingType: "SERVICE",
    price: 250000,
    rate: 10,
    siteUrl: BASE,
    description: "Gestion complète de votre présence digitale — Formule Premium : toutes plateformes, 30 publications/mois, contenu vidéo court, campagnes sponsorisées, veille e-réputation, rapport bimensuel et accompagnement stratégique. Pour entreprises voulant dominer leur marché sur les réseaux. 250 000 FCFA/mois.",
  },

  // ── Production de Contenus Digitaux ──────────────────────────────────
  {
    slug: "digital-production-photo",
    name: "Shooting Photo Professionnel",
    pricingType: "SERVICE",
    price: 80000,
    rate: 10,
    siteUrl: BASE,
    description: "Séance photo professionnelle pour votre entreprise : photos produits, portraits corporate, reportage événementiel ou ambiance de marque. Livraison de 30 à 50 photos retouchées en haute résolution. Pour e-commerces, marques et entreprises souhaitant des visuels professionnels. À partir de 80 000 FCFA.",
  },
  {
    slug: "digital-production-video",
    name: "Production Vidéo & Motion Design",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Production de contenus vidéo professionnels : vidéo de présentation d'entreprise, spot publicitaire, tutoriel produit, témoignage client ou motion design animé. Tournage, montage et sous-titrage inclus. Pour entreprises souhaitant un contenu vidéo percutant pour leurs réseaux et site web. À partir de 150 000 FCFA.",
  },
  {
    slug: "digital-creation-contenu-mensuel",
    name: "Pack Création de Contenus Mensuel",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Production mensuelle de contenus digitaux prêts à publier : 20 visuels personnalisés, 4 vidéos courtes (Reels/TikTok), 8 stories et 1 newsletter. Livrés en début de mois selon votre calendrier éditorial. Pour entreprises gérant elles-mêmes leurs réseaux mais manquant de temps ou de compétences. 100 000 FCFA/mois.",
  },

  // ── Campagnes Publicitaires en Ligne ─────────────────────────────────
  {
    slug: "digital-pub-meta",
    name: "Campagne Publicitaire Meta (Facebook & Instagram)",
    pricingType: "SERVICE",
    price: 125000,
    rate: 10,
    siteUrl: BASE,
    description: "Gestion de campagnes publicitaires sur Facebook et Instagram : création des visuels publicitaires, paramétrage des audiences, lancement, optimisation quotidienne et rapport de performance mensuel. Budget publicitaire non inclus (minimum recommandé : 50 000 FCFA/mois). Pour entreprises souhaitant acquérir des clients via les réseaux sociaux. Frais de gestion : 125 000 FCFA/mois.",
  },
  {
    slug: "digital-pub-google",
    name: "Campagne Google Ads (SEA)",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Gestion de campagnes Google Ads : recherche de mots-clés, création des annonces, paramétrage, optimisation et rapport mensuel. Budget publicitaire non inclus (minimum recommandé : 75 000 FCFA/mois). Pour entreprises souhaitant apparaître en 1ère position sur Google lors des recherches de leurs prospects. Frais de gestion : 150 000 FCFA/mois.",
  },
  {
    slug: "digital-strategie-marketing-digital",
    name: "Stratégie Marketing Digital 360°",
    pricingType: "SERVICE",
    price: 200000,
    rate: 10,
    siteUrl: BASE,
    description: "Audit et élaboration de votre stratégie marketing digital : analyse de la concurrence, définition des personas, plan de contenu, roadmap SEO/SEA/Social Media et tableau de bord de pilotage. Livré sous forme de document stratégique opérationnel. Pour dirigeants et responsables marketing souhaitant structurer leur présence digitale. 200 000 FCFA.",
  },
  {
    slug: "digital-seo",
    name: "Référencement Naturel (SEO)",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Optimisation du référencement naturel de votre site : audit SEO, optimisation technique, création de contenus optimisés, netlinking et rapport mensuel de positionnement. Pour entreprises souhaitant apparaître naturellement sur Google sans payer à la publicité. Résultats visibles en 3 à 6 mois. 100 000 FCFA/mois.",
  },

  // ── IA & Automatisation ───────────────────────────────────────────────
  {
    slug: "digital-chatbot",
    name: "Chatbot IA & Automatisation Client",
    pricingType: "SERVICE",
    price: 300000,
    rate: 8,
    siteUrl: BASE,
    description: "Développement d'un chatbot intelligent pour votre site web ou WhatsApp : réponses automatiques aux questions fréquentes, prise de rendez-vous, qualification de leads et transfert vers un agent humain. Réduit le temps de réponse client et améliore la satisfaction. Pour entreprises avec un fort volume de demandes entrantes. À partir de 300 000 FCFA.",
  },
  {
    slug: "digital-automatisation-processus",
    name: "Automatisation de Processus Métier",
    pricingType: "SERVICE",
    price: 250000,
    rate: 8,
    siteUrl: BASE,
    description: "Analyse et automatisation de vos processus répétitifs : envois d'emails automatiques, synchronisation de données, notifications, génération de rapports et intégrations entre applications (CRM, ERP, outils collaboratifs). Pour entreprises souhaitant gagner du temps et réduire les erreurs humaines. Sur devis à partir de 250 000 FCFA.",
  },
  {
    slug: "digital-assistant-virtuel-ia",
    name: "Assistant Virtuel IA sur Mesure",
    pricingType: "SERVICE",
    price: 500000,
    rate: 8,
    siteUrl: BASE,
    description: "Développement d'un assistant virtuel basé sur l'intelligence artificielle : traitement du langage naturel, base de connaissances personnalisée, intégration site web/WhatsApp/Telegram et tableau de bord d'administration. Pour entreprises souhaitant offrir une expérience client innovante et disponible 24h/24. Sur devis à partir de 500 000 FCFA.",
  },

  // ── ERP & Outils Numériques ───────────────────────────────────────────
  {
    slug: "digital-integration-erp",
    name: "Intégration & Paramétrage ERP (Odoo / SAP / Sage)",
    pricingType: "SERVICE",
    price: 400000,
    rate: 8,
    siteUrl: BASE,
    description: "Déploiement et paramétrage d'un ERP adapté à votre activité : Odoo (open source), SAP Business One ou Sage 100. Installation, configuration des modules (comptabilité, stock, ventes, RH), formation des utilisateurs et support post-déploiement. Pour PME souhaitant digitaliser et centraliser leur gestion. Sur devis à partir de 400 000 FCFA.",
  },
  {
    slug: "digital-ged",
    name: "Mise en Place GED (Gestion Électronique des Documents)",
    pricingType: "SERVICE",
    price: 250000,
    rate: 8,
    siteUrl: BASE,
    description: "Déploiement d'un système de gestion électronique des documents : archivage numérique sécurisé, classement automatique, recherche instantanée, accès collaboratif et suppressions définitives du papier. Pour entreprises souhaitant organiser leurs archives et faciliter le travail à distance. À partir de 250 000 FCFA.",
  },
  {
    slug: "digital-tableau-bord-bi",
    name: "Tableau de Bord Interactif (Business Intelligence)",
    pricingType: "SERVICE",
    price: 180000,
    rate: 10,
    siteUrl: BASE,
    description: "Conception et développement de tableaux de bord de pilotage sur mesure : connexion à vos sources de données (Excel, ERP, CRM), visualisations interactives (graphiques, KPI, cartes) et accès en temps réel. Développé sous Power BI ou solution web. Pour dirigeants et managers souhaitant piloter leur activité avec des données fiables. À partir de 180 000 FCFA.",
  },
  {
    slug: "digital-formation-outils-numeriques",
    name: "Formation aux Outils Numériques",
    pricingType: "SERVICE",
    price: 75000,
    rate: 12,
    siteUrl: BASE,
    description: "Sessions de formation pratique aux outils numériques professionnels : Microsoft 365, Google Workspace, outils de collaboration (Trello, Notion, Slack), ERP ou logiciels métier. En présentiel ou en ligne, groupes de 5 à 15 personnes. Pour équipes souhaitant maîtriser leurs outils digitaux et gagner en efficacité. À partir de 75 000 FCFA/jour.",
  },
];

export async function POST() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
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
    message: `${upserted} services IBIG DIGITAL synchronisés, ${deleted.count} doublon(s) supprimé(s).`,
  });
}

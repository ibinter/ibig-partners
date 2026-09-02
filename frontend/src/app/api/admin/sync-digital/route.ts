import { NextResponse } from "next/server";
import { isSyncAuthorized } from "@/lib/sync-auth";
import { syncBranchWithFeed } from "@/lib/catalog-feed";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
  {
    slug: "digital-landing-page",
    name: "Landing Page Haute Conversion",
    pricingType: "SERVICE",
    price: 85000,
    rate: 12,
    siteUrl: BASE,
    description: "Création d'une page d'atterrissage optimisée pour la conversion : design percutant, copywriting persuasif, formulaire de capture, intégration pixel Meta/Google et tests A/B. Idéale pour lancer un produit, une formation ou une campagne publicitaire. Livraison 7 jours. À partir de 85 000 FCFA.",
  },
  {
    slug: "digital-site-portfolio",
    name: "Site Portfolio & CV en Ligne",
    pricingType: "SERVICE",
    price: 75000,
    rate: 12,
    siteUrl: BASE,
    description: "Création d'un site portfolio professionnel pour mettre en valeur vos réalisations, compétences et parcours. Design moderne, galerie de projets, page contact et blog intégré. Pour freelances, artistes, consultants et professionnels souhaitant se démarquer. Livraison 7 jours. À partir de 75 000 FCFA.",
  },
  {
    slug: "digital-site-intranet",
    name: "Intranet & Portail Collaboratif d'Entreprise",
    pricingType: "SERVICE",
    price: 650000,
    rate: 8,
    siteUrl: BASE,
    description: "Développement d'un intranet sur mesure pour votre entreprise : annuaire du personnel, partage de documents, agenda partagé, actualités internes, messagerie et gestion des congés. Renforce la communication interne et la cohésion d'équipe. Sur devis à partir de 650 000 FCFA.",
  },
  {
    slug: "digital-site-maintenance",
    name: "Maintenance & Hébergement Web Mensuel",
    pricingType: "SERVICE",
    price: 30000,
    rate: 12,
    siteUrl: BASE,
    description: "Contrat de maintenance mensuel pour votre site web : mises à jour CMS/plugins, sauvegardes automatiques, monitoring de disponibilité, corrections de bugs, hébergement sécurisé et rapport mensuel. Pour entreprises souhaitant un site toujours opérationnel sans se soucier de la technique. À partir de 30 000 FCFA/mois.",
  },

  // ── Application Mobile ────────────────────────────────────────────────
  {
    slug: "digital-app-mobile-android",
    name: "Application Mobile Android",
    pricingType: "SERVICE",
    price: 600000,
    rate: 8,
    siteUrl: BASE,
    description: "Développement d'une application Android native : conception UX/UI, développement, tests sur appareils, publication sur Google Play Store et support post-lancement. Commande en ligne, réservation, catalogue, espace client ou application métier. Pour entreprises et startups souhaitant toucher les utilisateurs Android en Afrique. Sur devis à partir de 600 000 FCFA.",
  },
  {
    slug: "digital-app-mobile-multiplateforme",
    name: "Application Mobile Multiplateforme (Android & iOS)",
    pricingType: "SERVICE",
    price: 1000000,
    rate: 8,
    siteUrl: BASE,
    description: "Développement d'une application mobile disponible sur Android et iOS avec une seule base de code (React Native / Flutter) : gain de temps, cohérence visuelle et publication simultanée sur Google Play et App Store. Pour startups et entreprises souhaitant couvrir l'ensemble du marché mobile. Sur devis à partir de 1 000 000 FCFA.",
  },
  {
    slug: "digital-app-mobile-maintenance",
    name: "Maintenance Application Mobile",
    pricingType: "SERVICE",
    price: 50000,
    rate: 10,
    siteUrl: BASE,
    description: "Contrat de maintenance mensuel pour votre application mobile : mises à jour compatibilité OS, corrections de bugs, améliorations mineures, monitoring de performance et support utilisateurs. Pour entreprises ayant une application existante et souhaitant la garder opérationnelle. À partir de 50 000 FCFA/mois.",
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
  {
    slug: "digital-design-packaging",
    name: "Design Packaging & Étiquettes Produits",
    pricingType: "SERVICE",
    price: 60000,
    rate: 12,
    siteUrl: BASE,
    description: "Conception graphique de packaging et d'étiquettes produits : design attractif aux normes d'impression, déclinaisons (formats, langues), fichiers prêts pour l'imprimerie. Pour producteurs, commercants et marques de produits de grande consommation. À partir de 60 000 FCFA.",
  },
  {
    slug: "digital-design-ux-ui",
    name: "Design UX/UI de Site ou Application",
    pricingType: "SERVICE",
    price: 200000,
    rate: 10,
    siteUrl: BASE,
    description: "Conception UX/UI professionnelle de votre site web ou application : wireframes, maquettes haute-fidélité, prototype interactif, système de design et spécifications de développement. Pour startups et entreprises souhaitant une expérience utilisateur irréprochable avant de développer. À partir de 200 000 FCFA.",
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
  {
    slug: "digital-gestion-whatsapp-business",
    name: "Mise en Place & Gestion WhatsApp Business",
    pricingType: "SERVICE",
    price: 80000,
    rate: 12,
    siteUrl: BASE,
    description: "Configuration complète de WhatsApp Business pour votre entreprise : profil professionnel, catalogue produits, messages automatiques de bienvenue et d'absence, étiquettes clients, diffusion de messages commerciaux et formation de votre équipe. Le canal de vente N°1 en Afrique. À partir de 80 000 FCFA.",
  },
  {
    slug: "digital-strategie-tiktok-youtube",
    name: "Stratégie & Gestion TikTok / YouTube",
    pricingType: "SERVICE",
    price: 175000,
    rate: 10,
    siteUrl: BASE,
    description: "Développement de votre présence sur TikTok et/ou YouTube : stratégie de contenu, production de vidéos courtes ou longues, optimisation des descriptions/tags, gestion de la chaîne et analyse de performance. Pour marques et entrepreneurs souhaitant toucher les audiences jeunes via la vidéo. 175 000 FCFA/mois.",
  },
  {
    slug: "digital-gestion-influenceurs",
    name: "Marketing d'Influence & Gestion de Campagnes",
    pricingType: "SERVICE",
    price: 200000,
    rate: 10,
    siteUrl: BASE,
    description: "Conception et pilotage de campagnes d'influence : identification des influenceurs pertinents, négociation et contractualisation, brief créatif, suivi des publications et rapport de performance. Pour marques souhaitant toucher de nouvelles audiences via des leaders d'opinion. Budget influenceurs non inclus. À partir de 200 000 FCFA.",
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
  {
    slug: "digital-podcast-production",
    name: "Production & Lancement de Podcast",
    pricingType: "SERVICE",
    price: 120000,
    rate: 10,
    siteUrl: BASE,
    description: "Lancement clé en main de votre podcast professionnel : stratégie éditoriale, identité sonore, enregistrement, montage, mixage, diffusion sur Spotify/Apple Podcasts et visuels de promotion. Pour experts, entrepreneurs et entreprises souhaitant asseoir leur autorité via l'audio. À partir de 120 000 FCFA.",
  },
  {
    slug: "digital-copywriting",
    name: "Copywriting & Rédaction Web Professionnelle",
    pricingType: "SERVICE",
    price: 50000,
    rate: 12,
    siteUrl: BASE,
    description: "Rédaction de contenus web convaincants et optimisés SEO : pages de vente, articles de blog, fiches produits, scripts vidéo, newsletters et posts réseaux sociaux. Pour entreprises souhaitant communiquer avec impact et améliorer leur positionnement sur Google. À partir de 50 000 FCFA.",
  },

  // ── Email Marketing ───────────────────────────────────────────────────
  {
    slug: "digital-email-marketing",
    name: "Email Marketing & Newsletters",
    pricingType: "SERVICE",
    price: 90000,
    rate: 10,
    siteUrl: BASE,
    description: "Mise en place et gestion de votre stratégie email marketing : configuration de l'outil d'envoi (Mailchimp, Brevo), création des templates, segmentation des listes, rédaction et envoi de newsletters mensuelles, automatisations de bienvenue et rapport de performance. Pour entreprises souhaitant fidéliser et convertir via l'email. 90 000 FCFA/mois.",
  },
  {
    slug: "digital-tunnel-vente",
    name: "Tunnel de Vente & Automatisation Marketing",
    pricingType: "SERVICE",
    price: 350000,
    rate: 10,
    siteUrl: BASE,
    description: "Conception et déploiement d'un tunnel de vente automatisé : page de capture, emails de nurturing, page de vente, upsell et suivi des conversions. Connecté à votre outil CRM, plateforme de paiement et liste email. Pour formateurs, coachs et entrepreneurs souhaitant vendre en automatique 24h/24. À partir de 350 000 FCFA.",
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
    slug: "digital-pub-tiktok",
    name: "Campagne Publicitaire TikTok Ads",
    pricingType: "SERVICE",
    price: 120000,
    rate: 10,
    siteUrl: BASE,
    description: "Gestion de campagnes TikTok Ads : création de vidéos publicitaires adaptées à la plateforme, ciblage d'audiences, optimisation et rapport de performance. Le réseau publicitaire à la plus forte croissance chez les 18-35 ans en Afrique. Budget publicitaire non inclus. Frais de gestion : 120 000 FCFA/mois.",
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
  {
    slug: "digital-audit-digital",
    name: "Audit Digital & Présence en Ligne",
    pricingType: "SERVICE",
    price: 100000,
    rate: 12,
    siteUrl: BASE,
    description: "Audit complet de votre présence digitale : analyse du site web (technique, SEO, UX), évaluation des réseaux sociaux, benchmark concurrentiel, analyse de réputation en ligne et rapport avec recommandations prioritaires. Idéal pour identifier les points d'amélioration avant d'investir. À partir de 100 000 FCFA.",
  },

  // ── CRM & Outils de Gestion ───────────────────────────────────────────
  {
    slug: "digital-crm-hubspot-zoho",
    name: "Déploiement CRM (HubSpot / Zoho / Odoo)",
    pricingType: "SERVICE",
    price: 300000,
    rate: 8,
    siteUrl: BASE,
    description: "Déploiement et paramétrage d'un CRM adapté à votre activité : HubSpot, Zoho CRM ou Odoo. Configuration des pipelines de vente, automatisations, formulaires de capture, intégrations email/réseaux sociaux, formation de l'équipe commerciale et support post-déploiement. À partir de 300 000 FCFA.",
  },
  {
    slug: "digital-gestion-projet-outils",
    name: "Mise en Place Outils de Gestion de Projet (Notion / Trello / Asana)",
    pricingType: "SERVICE",
    price: 80000,
    rate: 12,
    siteUrl: BASE,
    description: "Configuration complète de vos outils de gestion de projet et de collaboration : Notion (workspace structuré), Trello (tableaux Kanban), Asana (gestion des tâches), ou équivalents. Personnalisation selon vos processus, templates prêts à l'emploi et formation de l'équipe. À partir de 80 000 FCFA.",
  },

  // ── Formation Plateforme E-Learning ──────────────────────────────────
  {
    slug: "digital-plateforme-elearning",
    name: "Plateforme E-Learning & Espace Formation en Ligne",
    pricingType: "SERVICE",
    price: 750000,
    rate: 8,
    siteUrl: BASE,
    description: "Développement de votre plateforme de formation en ligne : espace apprenant sécurisé, hébergement des vidéos et modules, suivi de progression, quiz et certification automatique, espace forum et système de paiement. Pour formateurs, institutions et entreprises souhaitant vendre des formations en ligne. Sur devis à partir de 750 000 FCFA.",
  },
  {
    slug: "digital-production-cours-en-ligne",
    name: "Production de Cours en Ligne (Vidéo & Contenus)",
    pricingType: "SERVICE",
    price: 200000,
    rate: 10,
    siteUrl: BASE,
    description: "Production complète d'un cours en ligne : scripting, tournage ou enregistrement écran, montage vidéo professionnel, création des supports pédagogiques (PDF, slides), quiz interactifs et intégration sur votre plateforme. Pour formateurs souhaitant proposer une formation structurée et engageante. À partir de 200 000 FCFA.",
  },

  // ── Infrastructure IT & Hébergement ──────────────────────────────────
  {
    slug: "digital-hebergement-cloud",
    name: "Hébergement Cloud & Infrastructure Serveur",
    pricingType: "SERVICE",
    price: 50000,
    rate: 10,
    siteUrl: BASE,
    description: "Mise en place et gestion de votre infrastructure cloud : serveur VPS ou dédié, configuration DNS, certificat SSL, sauvegarde automatique, monitoring 24/7 et administration mensuelle. Pour entreprises souhaitant une infrastructure fiable, scalable et sécurisée. À partir de 50 000 FCFA/mois.",
  },
  {
    slug: "digital-migration-cloud",
    name: "Migration vers le Cloud (AWS / Google Cloud / Azure)",
    pricingType: "SERVICE",
    price: 400000,
    rate: 8,
    siteUrl: BASE,
    description: "Migration de vos systèmes et applications vers le cloud : audit de l'existant, plan de migration, transfert des données, configuration des services cloud (stockage, base de données, serveur), tests et formation. Pour entreprises souhaitant réduire leurs coûts d'infrastructure et améliorer la disponibilité. Sur devis à partir de 400 000 FCFA.",
  },

  // ── Cybersécurité ─────────────────────────────────────────────────────
  {
    slug: "digital-audit-cybersecurite",
    name: "Audit de Cybersécurité & Test de Pénétration",
    pricingType: "SERVICE",
    price: 350000,
    rate: 8,
    siteUrl: BASE,
    description: "Évaluation complète de la sécurité de votre système d'information : scan des vulnérabilités, test de pénétration (pentest) du site web et des applications, analyse des accès et des configurations, rapport de risques et plan de remédiation. Pour entreprises souhaitant sécuriser leur SI avant un incident. À partir de 350 000 FCFA.",
  },
  {
    slug: "digital-securisation-site",
    name: "Sécurisation de Site Web & Protection Anti-Piratage",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Mise en sécurité de votre site web : installation et configuration du pare-feu applicatif (WAF), protection anti-DDoS, certificat SSL, durcissement du CMS, suppression de malwares et rapport de sécurité. Pour entreprises ayant subi une attaque ou souhaitant prévenir les risques. À partir de 100 000 FCFA.",
  },
  {
    slug: "digital-formation-cybersecurite",
    name: "Formation Cybersécurité & Sensibilisation des Équipes",
    pricingType: "SERVICE",
    price: 120000,
    rate: 12,
    siteUrl: BASE,
    description: "Programme de sensibilisation à la cybersécurité pour vos collaborateurs : phishing, mots de passe, bonnes pratiques, réseaux sociaux professionnels et réponse aux incidents. En présentiel ou en ligne. Pour entreprises souhaitant faire de leurs employés le premier rempart contre les cybermenaces. À partir de 120 000 FCFA.",
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
  {
    slug: "digital-integration-ia-entreprise",
    name: "Intégration IA dans Vos Outils d'Entreprise",
    pricingType: "SERVICE",
    price: 400000,
    rate: 8,
    siteUrl: BASE,
    description: "Intégration de solutions d'intelligence artificielle dans vos outils existants : génération automatique de rapports, analyse prédictive des ventes, détection d'anomalies, aide à la décision et personnalisation des interactions clients. Pour entreprises souhaitant tirer parti de l'IA sans tout reconstruire. Sur devis à partir de 400 000 FCFA.",
  },
  {
    slug: "digital-nocode-solutions",
    name: "Solutions No-Code & Low-Code sur Mesure",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Développement rapide d'applications métier sans programmation intensive : applications Airtable, Notion, Glide, Webflow ou Make (Integromat). Idéal pour automatiser des workflows internes, créer un espace client ou un outil de suivi rapidement et à moindre coût. À partir de 150 000 FCFA.",
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

  // ── Conseil & Accompagnement Digital ─────────────────────────────────
  {
    slug: "digital-consulting-transformation",
    name: "Consulting Transformation Digitale",
    pricingType: "SERVICE",
    price: 0,
    rate: 8,
    siteUrl: BASE,
    description: "Accompagnement stratégique dans votre transformation digitale : diagnostic de maturité numérique, feuille de route de digitalisation, choix des outils et technologies, conduite du changement et suivi de la mise en œuvre. Pour dirigeants et DSI souhaitant piloter leur transformation avec méthode. Sur devis.",
  },
  {
    slug: "digital-accompagnement-startup",
    name: "Accompagnement Digital Startup & Porteurs de Projets Tech",
    pricingType: "SERVICE",
    price: 200000,
    rate: 10,
    siteUrl: BASE,
    description: "Accompagnement complet pour startups et porteurs de projets numériques : validation du concept, prototypage, développement MVP, stratégie go-to-market digitale, pitch deck et mise en relation avec des investisseurs. Pour entrepreneurs souhaitant lancer un projet tech avec les bons fondamentaux. À partir de 200 000 FCFA.",
  },
];

export async function POST() {
  try {
    if (!(await isSyncAuthorized())) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const result = await syncBranchWithFeed("ibig-digital", "IBIG DIGITAL", DIGITAL_PRODUCTS, { notify: true });
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
      message: `${diff.total} produits IBIG DIGITAL synchronisés (${diff.added.length} nouveau(x), ${diff.updated.length} mis à jour, ${diff.removed} retiré(s)).`,
    });
  } catch (err: any) {
    console.error("sync-digital error:", err);
    return NextResponse.json({ error: err?.message ?? "Erreur serveur" }, { status: 500 });
  }
}


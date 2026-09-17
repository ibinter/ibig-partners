import { NextResponse } from "next/server";
import { isSyncAuthorized } from "@/lib/sync-auth";
import { syncBranchWithFeed } from "@/lib/catalog-feed";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BASE = "https://ibig-digital.com";

// Fallback utilisé UNIQUEMENT si l'API live https://ibig-digital.com/api/catalogue est inaccessible.
// Mis à jour le 2026-09-17 depuis le flux officiel du site.
const DIGITAL_PRODUCTS = [
  // ── Sites Web & Présence Digitale ────────────────────────────────────
  { slug: "site-vitrine-essentiel",      name: "Site Vitrine Essentiel",            pricingType: "SERVICE", price: 120000,  rate: 10, siteUrl: `${BASE}/produits/site-vitrine-essentiel`,      description: "Site web 5 pages, design moderne, mobile-first, formulaire de contact et intégration réseaux sociaux." },
  { slug: "site-corporate-premium",      name: "Site Corporate Premium",            pricingType: "SERVICE", price: 350000,  rate: 10, siteUrl: `${BASE}/produits/site-corporate-premium`,      description: "Site institutionnel multi-pages avec espace blog, témoignages, multilingue et dashboard admin." },
  { slug: "site-portfolio-creatif",      name: "Site Portfolio / Créatif",          pricingType: "SERVICE", price: 150000,  rate: 10, siteUrl: `${BASE}/produits/site-portfolio-creatif`,      description: "Portfolio interactif pour freelances, agences, artistes et créatifs. Galerie dynamique, animations." },
  { slug: "landing-page-conversion",     name: "Landing Page Conversion",           pricingType: "SERVICE", price: 75000,   rate: 10, siteUrl: `${BASE}/produits/landing-page-conversion`,     description: "Page de vente ou de capture ultra-optimisée pour convertir vos visiteurs en clients ou prospects." },
  { slug: "refonte-site-web",            name: "Refonte de Site Web",               pricingType: "SERVICE", price: 200000,  rate: 10, siteUrl: `${BASE}/produits/refonte-site-web`,            description: "Modernisation complète de votre site existant : nouveau design, meilleure expérience utilisateur, SEO." },
  { slug: "site-association-ong",        name: "Site Association / ONG",            pricingType: "SERVICE", price: 100000,  rate: 10, siteUrl: `${BASE}/produits/site-association-ong`,        description: "Site web dédié aux associations et ONG avec gestion des membres, événements et donations." },
  { slug: "site-restaurant-hotel",       name: "Site Restaurant / Hôtel",           pricingType: "SERVICE", price: 180000,  rate: 10, siteUrl: `${BASE}/produits/site-restaurant-hotel`,       description: "Site spécialisé pour restaurants, hôtels et établissements avec menu digital, réservation en ligne." },

  // ── E-Commerce ───────────────────────────────────────────────────────
  { slug: "boutique-en-ligne-starter",   name: "Boutique en Ligne Starter",         pricingType: "SERVICE", price: 250000,  rate: 10, siteUrl: `${BASE}/produits/boutique-en-ligne-starter`,   description: "Boutique e-commerce complète jusqu'à 50 produits, paiement Mobile Money, gestion commandes." },
  { slug: "boutique-ecommerce-pro",      name: "Boutique E-commerce Pro",           pricingType: "SERVICE", price: 500000,  rate: 10, siteUrl: `${BASE}/produits/boutique-ecommerce-pro`,      description: "Plateforme e-commerce avancée : produits illimités, multi-vendeurs, promotions, analytics." },
  { slug: "marketplace-africaine",       name: "Marketplace Africaine",             pricingType: "SERVICE", price: 1500000, rate: 10, siteUrl: `${BASE}/produits/marketplace-africaine`,       description: "Plateforme marketplace multi-vendeurs type Jumia/Amazon adaptée au marché africain." },
  { slug: "integration-mobile-money",    name: "Intégration Mobile Money",          pricingType: "SERVICE", price: 80000,   rate: 10, siteUrl: `${BASE}/produits/integration-mobile-money`,    description: "Intégration des paiements Mobile Money (Orange, MTN, Wave, Moov) sur votre site existant." },
  { slug: "gestion-catalogue-produits",  name: "Gestion Catalogue Produits",        pricingType: "SERVICE", price: 50000,   rate: 10, siteUrl: `${BASE}/produits/gestion-catalogue-produits`,  description: "Saisie, organisation et optimisation de votre catalogue produits : photos, descriptions, SEO." },
  { slug: "click-and-collect",           name: "Click & Collect",                   pricingType: "SERVICE", price: 120000,  rate: 10, siteUrl: `${BASE}/produits/click-and-collect`,           description: "Système de commande en ligne avec retrait en magasin. Idéal pour les commerces physiques." },

  // ── Applications Web & Mobiles ────────────────────────────────────────
  { slug: "application-web-sur-mesure",       name: "Application Web Sur Mesure",            pricingType: "SERVICE", price: 0,       rate: 10, siteUrl: `${BASE}/produits/application-web-sur-mesure`,       description: "Application web métier entièrement personnalisée : CRM, ERP, gestion de stock, RH, logistique." },
  { slug: "application-mobile-ios-android",   name: "Application Mobile iOS/Android",        pricingType: "SERVICE", price: 0,       rate: 10, siteUrl: `${BASE}/produits/application-mobile-ios-android`,   description: "Application mobile native ou cross-platform (React Native, Flutter) pour iOS et Android." },
  { slug: "progressive-web-app",              name: "Progressive Web App (PWA)",             pricingType: "SERVICE", price: 350000,  rate: 10, siteUrl: `${BASE}/produits/progressive-web-app`,              description: "Application installable depuis le navigateur, fonctionne offline, performances natives." },
  { slug: "application-livraison",            name: "Application Livraison",                 pricingType: "SERVICE", price: 0,       rate: 10, siteUrl: `${BASE}/produits/application-livraison`,            description: "Plateforme complète de livraison à domicile : app client, app livreur, dashboard dispatch." },
  { slug: "systeme-reservation",              name: "Système de Réservation",                pricingType: "SERVICE", price: 200000,  rate: 10, siteUrl: `${BASE}/produits/systeme-reservation`,              description: "Plateforme de réservation en ligne : restaurants, salons, cliniques, hôtels, prestataires." },
  { slug: "tableau-de-bord-analytics",        name: "Tableau de Bord Analytics",             pricingType: "SERVICE", price: 150000,  rate: 10, siteUrl: `${BASE}/produits/tableau-de-bord-analytics`,        description: "Dashboard personnalisé avec vos KPIs business : ventes, clients, performance, rapports." },

  // ── Documents Authentifiables QR ──────────────────────────────────────
  { slug: "menu-digital-restaurant",    name: "Menu Digital Restaurant",           pricingType: "SERVICE", price: 45000,   rate: 10, siteUrl: `${BASE}/produits/menu-digital-restaurant`,    description: "Menu interactif accessible par QR code : catégories, photos, prix, allergènes. Mise à jour en temps réel." },
  { slug: "carte-de-visite-qr",         name: "Carte de Visite QR",               pricingType: "SERVICE", price: 25000,   rate: 10, siteUrl: `${BASE}/produits/carte-de-visite-qr`,         description: "Carte de visite digitale avec QR code redirigeant vers votre profil complet, contacts et réseaux." },
  { slug: "catalogue-digital-qr",       name: "Catalogue Digital",                pricingType: "SERVICE", price: 80000,   rate: 10, siteUrl: `${BASE}/produits/catalogue-digital-qr`,       description: "Catalogue produits ou services interactif avec QR code : photos HD, descriptions, tarifs." },
  { slug: "cv-interactif-qr",           name: "CV Interactif QR",                 pricingType: "SERVICE", price: 30000,   rate: 10, siteUrl: `${BASE}/produits/cv-interactif-qr`,           description: "CV digital premium avec QR code pour vos candidatures : portfolio, expériences, compétences." },
  { slug: "brochure-digitale",          name: "Brochure Digitale",                pricingType: "SERVICE", price: 60000,   rate: 10, siteUrl: `${BASE}/produits/brochure-digitale`,          description: "Brochure d'entreprise interactive accessible par QR : texte, images, vidéos, formulaire contact." },
  { slug: "evenement-qr",               name: "Événement QR",                     pricingType: "SERVICE", price: 40000,   rate: 10, siteUrl: `${BASE}/produits/evenement-qr`,               description: "Page événement accessible par QR : programme, invités, RSVP, localisation et galerie photos." },

  // ── Design & Identité Visuelle ────────────────────────────────────────
  { slug: "creation-logo",              name: "Création de Logo",                  pricingType: "SERVICE", price: 75000,   rate: 10, siteUrl: `${BASE}/produits/creation-logo`,              description: "Conception de logo professionnel avec 3 propositions créatives, retouches illimitées, tous formats." },
  { slug: "charte-graphique-complete",  name: "Charte Graphique Complète",         pricingType: "SERVICE", price: 180000,  rate: 10, siteUrl: `${BASE}/produits/charte-graphique-complete`,  description: "Identité visuelle complète : logo, couleurs, typographies, icônes, règles d'usage et mockups." },
  { slug: "flyer-affiche-evenement",    name: "Flyer & Affiche Événement",         pricingType: "SERVICE", price: 25000,   rate: 10, siteUrl: `${BASE}/produits/flyer-affiche-evenement`,    description: "Création de flyers, affiches et visuels pour vos événements, promotions et campagnes." },
  { slug: "kit-reseaux-sociaux",        name: "Kit Réseaux Sociaux",               pricingType: "SERVICE", price: 60000,   rate: 10, siteUrl: `${BASE}/produits/kit-reseaux-sociaux`,        description: "Pack de visuels cohérents pour tous vos réseaux : bannières, templates posts, highlights Instagram." },
  { slug: "packaging-etiquettes",       name: "Packaging & Étiquettes",            pricingType: "SERVICE", price: 90000,   rate: 10, siteUrl: `${BASE}/produits/packaging-etiquettes`,       description: "Design de packaging produit, étiquettes, boîtes et emballages adaptés à votre marque." },
  { slug: "presentation-powerpoint-pro", name: "Présentation PowerPoint Pro",      pricingType: "SERVICE", price: 50000,   rate: 10, siteUrl: `${BASE}/produits/presentation-powerpoint-pro`, description: "Template PowerPoint ou Google Slides professionnel aux couleurs de votre entreprise." },
  { slug: "identite-visuelle-startup",  name: "Identité Visuelle Startup",         pricingType: "SERVICE", price: 250000,  rate: 10, siteUrl: `${BASE}/produits/identite-visuelle-startup`,  description: "Pack complet pour les startups : logo, charte, pitch deck, site landing page et réseaux sociaux." },

  // ── Marketing Digital & Publicité ─────────────────────────────────────
  { slug: "gestion-publicite-facebook",  name: "Gestion Publicité Facebook/Instagram", pricingType: "SERVICE", price: 150000, rate: 10, siteUrl: `${BASE}/produits/gestion-publicite-facebook`,  description: "Création, gestion et optimisation de vos campagnes publicitaires Facebook et Instagram Ads." },
  { slug: "publicite-google-ads",        name: "Publicité Google Ads",                 pricingType: "SERVICE", price: 200000, rate: 10, siteUrl: `${BASE}/produits/publicite-google-ads`,        description: "Campagnes Google Ads (Search, Display, Shopping) pour apparaître en premier sur Google." },
  { slug: "strategie-marketing-digital", name: "Stratégie Marketing Digital",          pricingType: "SERVICE", price: 300000, rate: 10, siteUrl: `${BASE}/produits/strategie-marketing-digital`, description: "Audit et élaboration de votre stratégie digitale complète : canaux, budget, KPIs, planning." },
  { slug: "whatsapp-marketing",          name: "WhatsApp Marketing",                   pricingType: "SERVICE", price: 80000,  rate: 10, siteUrl: `${BASE}/produits/whatsapp-marketing`,          description: "Stratégie et exécution de campagnes WhatsApp : listes de diffusion, automation, relances." },
  { slug: "influence-marketing-afrique", name: "Influence Marketing Afrique",          pricingType: "SERVICE", price: 200000, rate: 10, siteUrl: `${BASE}/produits/influence-marketing-afrique`, description: "Campagnes avec des influenceurs africains : identification, négociation, brief, suivi résultats." },
  { slug: "growth-hacking",              name: "Growth Hacking",                       pricingType: "SERVICE", price: 250000, rate: 10, siteUrl: `${BASE}/produits/growth-hacking`,              description: "Stratégies d'acquisition rapide et peu coûteuses : viral, référencement, partenariats, automation." },

  // ── Community Management ──────────────────────────────────────────────
  { slug: "community-management-essentiel", name: "Community Management Essentiel", pricingType: "SERVICE", price: 120000, rate: 10, siteUrl: `${BASE}/produits/community-management-essentiel`, description: "3 publications/semaine sur 2 réseaux sociaux, réponse aux commentaires et rapport mensuel." },
  { slug: "community-management-premium",   name: "Community Management Premium",   pricingType: "SERVICE", price: 250000, rate: 10, siteUrl: `${BASE}/produits/community-management-premium`,   description: "7 publications/semaine sur 4 réseaux, Stories, Reels, modération et stratégie de contenu." },
  { slug: "audit-reseaux-sociaux",          name: "Audit Réseaux Sociaux",          pricingType: "SERVICE", price: 50000,  rate: 10, siteUrl: `${BASE}/produits/audit-reseaux-sociaux`,          description: "Analyse complète de vos réseaux : performance, contenu, audience, concurrence et recommandations." },
  { slug: "creation-compte-setup",          name: "Création Compte & Setup",        pricingType: "SERVICE", price: 40000,  rate: 10, siteUrl: `${BASE}/produits/creation-compte-setup`,          description: "Création et optimisation complète de vos comptes réseaux sociaux : profil, bio, visuels, liens." },
  { slug: "gestion-crise-reseaux",          name: "Gestion de Crise Réseaux",       pricingType: "SERVICE", price: 0,      rate: 10, siteUrl: `${BASE}/produits/gestion-crise-reseaux`,          description: "Réponse stratégique aux crises et bad buzz sur les réseaux sociaux : contenu, communication, suivi." },

  // ── IA & Automatisation ───────────────────────────────────────────────
  { slug: "chatbot-ia-service-client",  name: "Chatbot IA Service Client",         pricingType: "SERVICE", price: 200000, rate: 10, siteUrl: `${BASE}/produits/chatbot-ia-service-client`,  description: "Chatbot intelligent sur votre site web ou WhatsApp : répond 24h/24 aux questions fréquentes." },
  { slug: "automatisation-processus",   name: "Automatisation des Processus",      pricingType: "SERVICE", price: 300000, rate: 10, siteUrl: `${BASE}/produits/automatisation-processus`,   description: "Identification et automatisation de vos tâches répétitives : relances, rapports, notifications." },
  { slug: "agent-ia-personnalise",      name: "Agent IA Personnalisé",             pricingType: "SERVICE", price: 500000, rate: 10, siteUrl: `${BASE}/produits/agent-ia-personnalise`,      description: "Agent IA sur mesure qui connaît votre entreprise et répond à vos clients, prospects et équipes." },
  { slug: "generation-contenu-ia",      name: "Génération de Contenu IA",          pricingType: "SERVICE", price: 100000, rate: 10, siteUrl: `${BASE}/produits/generation-contenu-ia`,      description: "Mise en place d'un système de génération automatique de contenu : posts, descriptions, emails." },
  { slug: "integration-api-ia",         name: "Intégration API IA",               pricingType: "SERVICE", price: 150000, rate: 10, siteUrl: `${BASE}/produits/integration-api-ia`,         description: "Intégration d'API d'intelligence artificielle (OpenAI, Claude, Gemini) dans vos outils existants." },
  { slug: "analyse-predictive",         name: "Analyse Prédictive",               pricingType: "SERVICE", price: 0,      rate: 10, siteUrl: `${BASE}/produits/analyse-predictive`,         description: "Modèles d'analyse prédictive pour anticiper vos ventes, churn clients et comportements d'achat." },

  // ── SEO & Optimisation ────────────────────────────────────────────────
  { slug: "audit-seo-complet",           name: "Audit SEO Complet",               pricingType: "SERVICE", price: 80000,  rate: 10, siteUrl: `${BASE}/produits/audit-seo-complet`,           description: "Analyse technique, contenu et autorité de votre site. Rapport détaillé avec plan d'action prioritaire." },
  { slug: "seo-on-page",                 name: "SEO On-Page",                     pricingType: "SERVICE", price: 100000, rate: 10, siteUrl: `${BASE}/produits/seo-on-page`,                 description: "Optimisation technique et contenu de votre site pour améliorer son positionnement Google." },
  { slug: "seo-local-abidjan",           name: "SEO Local Abidjan",               pricingType: "SERVICE", price: 60000,  rate: 10, siteUrl: `${BASE}/produits/seo-local-abidjan`,           description: "Optimisation Google My Business et référencement local pour apparaître dans les recherches de votre zone." },
  { slug: "netlinking-backlinks",        name: "Netlinking & Backlinks",           pricingType: "SERVICE", price: 150000, rate: 10, siteUrl: `${BASE}/produits/netlinking-backlinks`,        description: "Acquisition de liens entrants de qualité pour renforcer l'autorité de votre site web sur Google." },
  { slug: "creation-contenu-seo",        name: "Création de Contenu SEO",          pricingType: "SERVICE", price: 80000,  rate: 10, siteUrl: `${BASE}/produits/creation-contenu-seo`,        description: "4 articles de blog optimisés par mois pour attirer un trafic organique qualifié et durable." },
  { slug: "seo-ecommerce",               name: "SEO E-commerce",                   pricingType: "SERVICE", price: 150000, rate: 10, siteUrl: `${BASE}/produits/seo-ecommerce`,               description: "Optimisation SEO spécifique aux boutiques en ligne : fiches produits, catégories, avis et données structurées." },
  { slug: "rapport-positionnement-mensuel", name: "Rapport de Positionnement Mensuel", pricingType: "SERVICE", price: 30000, rate: 10, siteUrl: `${BASE}/produits/rapport-positionnement-mensuel`, description: "Rapport mensuel détaillé de vos positions Google : mots-clés, évolutions, opportunités et recommandations." },

  // ── Hébergement & Infrastructure ─────────────────────────────────────
  { slug: "hebergement-pro-1-an",       name: "Hébergement Pro 1 An",             pricingType: "SERVICE", price: 60000,  rate: 10, siteUrl: `${BASE}/produits/hebergement-pro-1-an`,       description: "Hébergement web professionnel SSD, SSL gratuit, sauvegardes quotidiennes et support 24h/24." },
  { slug: "nom-de-domaine-hebergement", name: "Nom de Domaine + Hébergement",     pricingType: "SERVICE", price: 80000,  rate: 10, siteUrl: `${BASE}/produits/nom-de-domaine-hebergement`, description: "Enregistrement de votre nom de domaine .com, .ci ou autre + hébergement professionnel 1 an." },
  { slug: "serveur-vps-dedie",          name: "Serveur VPS Dédié",                pricingType: "SERVICE", price: 150000, rate: 10, siteUrl: `${BASE}/produits/serveur-vps-dedie`,          description: "Serveur privé virtuel pour sites et applications à forte charge : performance et contrôle total." },
  { slug: "maintenance-site-web-mensuelle", name: "Maintenance Site Web Mensuelle", pricingType: "SERVICE", price: 40000, rate: 10, siteUrl: `${BASE}/produits/maintenance-site-web-mensuelle`, description: "Maintenance préventive mensuelle : mises à jour, sauvegardes, monitoring et rapport d'état." },
  { slug: "migration-site-web",          name: "Migration de Site Web",            pricingType: "SERVICE", price: 70000,  rate: 10, siteUrl: `${BASE}/produits/migration-site-web`,          description: "Migration sécurisée de votre site vers un nouvel hébergeur sans perte de données ni downtime." },
  { slug: "email-pro-google-workspace",  name: "Email Pro Google Workspace",       pricingType: "SERVICE", price: 25000,  rate: 10, siteUrl: `${BASE}/produits/email-pro-google-workspace`,  description: "Configuration et gestion de Google Workspace pour votre entreprise : emails pro, Drive, Meet, Agenda partagé." },

  // ── Cybersécurité ─────────────────────────────────────────────────────
  { slug: "audit-securite-site-web",    name: "Audit de Sécurité Site Web",        pricingType: "SERVICE", price: 120000, rate: 10, siteUrl: `${BASE}/produits/audit-securite-site-web`,    description: "Test de sécurité complet de votre site web : vulnérabilités, failles, recommandations et rapport." },
  { slug: "protection-anti-malware",    name: "Protection Anti-Malware",            pricingType: "SERVICE", price: 80000,  rate: 10, siteUrl: `${BASE}/produits/protection-anti-malware`,    description: "Installation et configuration d'un pare-feu WAF, antivirus et protection contre les intrusions." },
  { slug: "nettoyage-site-pirate",      name: "Nettoyage Site Piraté",             pricingType: "SERVICE", price: 150000, rate: 10, siteUrl: `${BASE}/produits/nettoyage-site-pirate`,      description: "Diagnostic, nettoyage complet et sécurisation d'un site web piraté ou infecté par un malware." },
  { slug: "formation-cybersecurite-pme", name: "Formation Cybersécurité PME",      pricingType: "SERVICE", price: 100000, rate: 10, siteUrl: `${BASE}/produits/formation-cybersecurite-pme`, description: "Formation pratique de 4h pour vos équipes : phishing, mots de passe, bonnes pratiques, protocoles." },
  { slug: "conformite-rgpd",            name: "Conformité RGPD",                   pricingType: "SERVICE", price: 200000, rate: 10, siteUrl: `${BASE}/produits/conformite-rgpd`,            description: "Mise en conformité de votre site et processus avec le RGPD : politique confidentialité, cookies, registre." },

  // ── Vidéo & Contenu Digital ───────────────────────────────────────────
  { slug: "video-institutionnelle",     name: "Vidéo Institutionnelle",            pricingType: "SERVICE", price: 300000, rate: 10, siteUrl: `${BASE}/produits/video-institutionnelle`,     description: "Film de présentation de votre entreprise : tournage, montage, motion design et musique." },
  { slug: "video-publicitaire",         name: "Vidéo Publicitaire",                pricingType: "SERVICE", price: 200000, rate: 10, siteUrl: `${BASE}/produits/video-publicitaire`,         description: "Spot publicitaire 15–60 secondes pour vos campagnes réseaux sociaux, TV ou cinéma." },
  { slug: "reels-shorts",               name: "Reels & Shorts",                    pricingType: "SERVICE", price: 80000,  rate: 10, siteUrl: `${BASE}/produits/reels-shorts`,               description: "Création de 8 Reels ou Shorts par mois pour Instagram, TikTok et YouTube. Format viral." },
  { slug: "podcast-audio",              name: "Podcast & Audio",                   pricingType: "SERVICE", price: 100000, rate: 10, siteUrl: `${BASE}/produits/podcast-audio`,              description: "Enregistrement, montage et publication de vos podcasts professionnels sur toutes les plateformes." },
  { slug: "shooting-photo-professionnel", name: "Shooting Photo Professionnel",    pricingType: "SERVICE", price: 150000, rate: 10, siteUrl: `${BASE}/produits/shooting-photo-professionnel`, description: "Séance photo professionnelle pour votre entreprise : produits, équipe, locaux, portraits." },
  { slug: "motion-design-animation",    name: "Motion Design & Animation",         pricingType: "SERVICE", price: 120000, rate: 10, siteUrl: `${BASE}/produits/motion-design-animation`,    description: "Animations 2D/3D, logos animés, infographies animées et explainer videos pour votre marque." },
  { slug: "temoignages-clients-video",  name: "Témoignages Clients Vidéo",         pricingType: "SERVICE", price: 120000, rate: 10, siteUrl: `${BASE}/produits/temoignages-clients-video`,  description: "Tournage et montage de témoignages vidéo de vos clients satisfaits pour renforcer votre crédibilité." },

  // ── E-mailing & Marketing Automation ─────────────────────────────────
  { slug: "setup-email-marketing",      name: "Setup Email Marketing",             pricingType: "SERVICE", price: 80000,  rate: 10, siteUrl: `${BASE}/produits/setup-email-marketing`,      description: "Configuration complète de votre outil d'emailing (Mailchimp, Brevo, SendGrid) et premiers templates." },
  { slug: "newsletter-mensuelle",       name: "Newsletter Mensuelle",              pricingType: "SERVICE", price: 60000,  rate: 10, siteUrl: `${BASE}/produits/newsletter-mensuelle`,       description: "Rédaction, design et envoi de votre newsletter mensuelle avec rapport d'ouvertures et clics." },
  { slug: "sequence-email-automation",  name: "Séquence Email Automation",         pricingType: "SERVICE", price: 150000, rate: 10, siteUrl: `${BASE}/produits/sequence-email-automation`,  description: "Création de séquences email automatiques : bienvenue, relance panier, fidélisation, rétention." },
  { slug: "sms-marketing",              name: "SMS Marketing",                     pricingType: "SERVICE", price: 50000,  rate: 10, siteUrl: `${BASE}/produits/sms-marketing`,              description: "Campagnes SMS pour vos promotions, rappels et communications urgentes. Taux d'ouverture > 95%." },
  { slug: "audit-delivrabilite-email",  name: "Audit de Délivrabilité Email",      pricingType: "SERVICE", price: 60000,  rate: 10, siteUrl: `${BASE}/produits/audit-delivrabilite-email`,  description: "Analyse et correction de votre délivrabilité email : SPF, DKIM, DMARC, score expéditeur, listes noires." },
  { slug: "automatisation-facturation", name: "Automatisation Facturation",        pricingType: "SERVICE", price: 150000, rate: 10, siteUrl: `${BASE}/produits/automatisation-facturation`,  description: "Automatisation de vos devis, factures et relances de paiement. Intégration comptabilité et CRM." },

  // ── CRM / ERP / Outils Métiers ────────────────────────────────────────
  { slug: "crm-mise-en-place",          name: "CRM Mise en Place",                 pricingType: "SERVICE", price: 200000, rate: 10, siteUrl: `${BASE}/produits/crm-mise-en-place`,          description: "Choix, configuration et formation sur votre CRM (HubSpot, Zoho, Pipedrive) pour gérer vos prospects." },

  // ── Consulting & Stratégie Digitale ──────────────────────────────────
  { slug: "audit-digital-complet",             name: "Audit Digital Complet",             pricingType: "SERVICE", price: 150000, rate: 10, siteUrl: `${BASE}/produits/audit-digital-complet`,             description: "Évaluation complète de votre présence digitale : site, réseaux, SEO, publicité, réputation." },
  { slug: "strategie-transformation-digitale", name: "Stratégie de Transformation Digitale", pricingType: "SERVICE", price: 500000, rate: 10, siteUrl: `${BASE}/produits/strategie-transformation-digitale`, description: "Accompagnement stratégique pour digitaliser votre entreprise : roadmap, outils, équipes, budget." },
  { slug: "conseil-referencement",             name: "Conseil en Référencement",           pricingType: "SERVICE", price: 80000,  rate: 10, siteUrl: `${BASE}/produits/conseil-referencement`,             description: "Session de 2h avec un expert SEO pour analyser votre site et définir vos priorités de référencement." },
  { slug: "business-plan-digital",             name: "Business Plan Digital",             pricingType: "SERVICE", price: 300000, rate: 10, siteUrl: `${BASE}/produits/business-plan-digital`,             description: "Rédaction de votre business plan digital : marché, concurrence, stratégie, prévisionnel financier." },
  { slug: "veille-concurrentielle",            name: "Veille Concurrentielle",            pricingType: "SERVICE", price: 100000, rate: 10, siteUrl: `${BASE}/produits/veille-concurrentielle`,            description: "Mise en place d'un système de veille sur vos concurrents : prix, contenu, campagnes, actualités." },
  { slug: "accompagnement-startup-digitale",   name: "Accompagnement Startup Digitale",   pricingType: "SERVICE", price: 200000, rate: 10, siteUrl: `${BASE}/produits/accompagnement-startup-digitale`,   description: "Accompagnement mensuel pour startups : stratégie, outils, équipe, croissance et levée de fonds." },

  // ── Formation & Accompagnement ────────────────────────────────────────
  { slug: "formation-wordpress",              name: "Formation WordPress",                pricingType: "SERVICE", price: 80000,  rate: 10, siteUrl: `${BASE}/produits/formation-wordpress`,              description: "Formation pratique WordPress : administration, création de pages, blog, et gestion quotidienne." },
  { slug: "formation-marketing-digital",      name: "Formation Marketing Digital",        pricingType: "SERVICE", price: 120000, rate: 10, siteUrl: `${BASE}/produits/formation-marketing-digital`,      description: "Formation aux fondamentaux du marketing digital : réseaux sociaux, publicité, SEO, email." },
  { slug: "formation-ia-entreprises",         name: "Formation IA pour Entreprises",      pricingType: "SERVICE", price: 150000, rate: 10, siteUrl: `${BASE}/produits/formation-ia-entreprises`,         description: "Initiation pratique à l'IA (ChatGPT, Claude, Midjourney) pour gagner en productivité au quotidien." },
  { slug: "formation-ecommerce",              name: "Formation E-commerce",               pricingType: "SERVICE", price: 120000, rate: 10, siteUrl: `${BASE}/produits/formation-ecommerce`,              description: "Créer et gérer une boutique en ligne rentable : stratégie, produits, paiement, livraison, marketing." },
  { slug: "formation-canva-pro",              name: "Formation Canva Pro",                pricingType: "SERVICE", price: 60000,  rate: 10, siteUrl: `${BASE}/produits/formation-canva-pro`,              description: "Maîtriser Canva pour créer tous vos visuels professionnels : posts, flyers, présentations, vidéos." },
  { slug: "formation-community-management",   name: "Formation Community Management",     pricingType: "SERVICE", price: 80000,  rate: 10, siteUrl: `${BASE}/produits/formation-community-management`,   description: "Formation pratique à la gestion des réseaux sociaux pour les équipes marketing et communication." },
  { slug: "formation-google-analytics",       name: "Formation Google Analytics",         pricingType: "SERVICE", price: 60000,  rate: 10, siteUrl: `${BASE}/produits/formation-google-analytics`,       description: "Maîtriser Google Analytics 4 pour mesurer, analyser et optimiser vos performances digitales." },

  // ── Print & Supports de Communication ────────────────────────────────
  { slug: "cartes-de-visite-premium",   name: "Cartes de Visite Premium",          pricingType: "SERVICE", price: 35000,  rate: 10, siteUrl: `${BASE}/produits/cartes-de-visite-premium`,   description: "Conception graphique de cartes de visite professionnelles. Fichiers prêts à l'impression." },
  { slug: "flyers-depliants",           name: "Flyers & Dépliants",                pricingType: "SERVICE", price: 30000,  rate: 10, siteUrl: `${BASE}/produits/flyers-depliants`,           description: "Conception de flyers A5/A4, dépliants 3 volets et roll-up pour vos événements et promotions." },
  { slug: "rollup-kakemono",            name: "Roll-up & Kakémono",                pricingType: "SERVICE", price: 45000,  rate: 10, siteUrl: `${BASE}/produits/rollup-kakemono`,            description: "Design de roll-up et kakémono pour salons, événements et points de vente. Haute résolution." },
  { slug: "brochure-entreprise",        name: "Brochure d'Entreprise",             pricingType: "SERVICE", price: 100000, rate: 10, siteUrl: `${BASE}/produits/brochure-entreprise`,        description: "Brochure commerciale 8–16 pages pour présenter votre entreprise, services et réalisations." },
  { slug: "papeterie-professionnelle",  name: "Papeterie Professionnelle",         pricingType: "SERVICE", price: 80000,  rate: 10, siteUrl: `${BASE}/produits/papeterie-professionnelle`,  description: "Papier entête, enveloppes, dossiers, tampons et tous vos documents à votre charte graphique." },
  { slug: "goodies-objets-publicitaires", name: "Goodies & Objets Publicitaires",  pricingType: "SERVICE", price: 80000,  rate: 10, siteUrl: `${BASE}/produits/goodies-objets-publicitaires`, description: "Conception graphique de vos goodies personnalisés : stylos, mugs, tote bags, casquettes, t-shirts." },

  // ── Cartes Digitales & NFC ────────────────────────────────────────────
  { slug: "carte-de-visite-nfc",        name: "Carte de Visite NFC",               pricingType: "SERVICE", price: 25000,  rate: 10, siteUrl: `${BASE}/produits/carte-de-visite-nfc`,        description: "Carte de visite intelligente NFC : un simple tap transmet vos coordonnées sur n'importe quel smartphone." },
  { slug: "vcard-pro-qr",               name: "vCard Pro + QR",                    pricingType: "SERVICE", price: 20000,  rate: 10, siteUrl: `${BASE}/produits/vcard-pro-qr`,               description: "Page de profil professionnel en ligne avec QR code : photo, coordonnées, services, réseaux." },
  { slug: "carte-digitale-equipe",      name: "Carte Digitale Équipe",             pricingType: "SERVICE", price: 60000,  rate: 10, siteUrl: `${BASE}/produits/carte-digitale-equipe`,      description: "Pack cartes digitales pour toute votre équipe commerciale avec tableau de bord centralisé." },
  { slug: "carte-digitale-evenement",   name: "Carte Digitale Événement",          pricingType: "SERVICE", price: 35000,  rate: 10, siteUrl: `${BASE}/produits/carte-digitale-evenement`,   description: "Carte digitale temporaire pour salons, conférences et événements. QR code personnalisé à l'image de l'événement." },

  // ── WhatsApp Business & API ───────────────────────────────────────────
  { slug: "configuration-whatsapp-business", name: "Configuration WhatsApp Business", pricingType: "SERVICE", price: 30000,  rate: 10, siteUrl: `${BASE}/produits/configuration-whatsapp-business`, description: "Configuration complète de WhatsApp Business : profil, catalogue, réponses automatiques, étiquettes." },
  { slug: "whatsapp-api-automation",         name: "WhatsApp API & Automation",      pricingType: "SERVICE", price: 300000, rate: 10, siteUrl: `${BASE}/produits/whatsapp-api-automation`,         description: "Intégration de l'API WhatsApp Business pour des communications automatisées à grande échelle." },
  { slug: "chatbot-whatsapp",               name: "Chatbot WhatsApp",               pricingType: "SERVICE", price: 200000, rate: 10, siteUrl: `${BASE}/produits/chatbot-whatsapp`,               description: "Chatbot IA sur WhatsApp qui répond à vos clients 24h/24 : commandes, infos, rdv, support." },
  { slug: "strategie-whatsapp-marketing",   name: "Stratégie WhatsApp Marketing",   pricingType: "SERVICE", price: 100000, rate: 10, siteUrl: `${BASE}/produits/strategie-whatsapp-marketing`,   description: "Stratégie complète et exécution de campagnes marketing WhatsApp : listes, contenus, automation." },
  { slug: "formation-whatsapp-business",    name: "Formation WhatsApp Business",    pricingType: "SERVICE", price: 50000,  rate: 10, siteUrl: `${BASE}/produits/formation-whatsapp-business`,    description: "Formation pratique à WhatsApp Business : catalogue, réponses automatiques, listes de diffusion, étiquettes." },
  { slug: "integration-crm-whatsapp",      name: "Intégration CRM WhatsApp",       pricingType: "SERVICE", price: 180000, rate: 10, siteUrl: `${BASE}/produits/integration-crm-whatsapp`,      description: "Connexion de WhatsApp Business à votre CRM pour centraliser vos conversations et automatiser le suivi client." },

  // ── Divers ────────────────────────────────────────────────────────────
  { slug: "signature-email-professionnelle", name: "Signature Email Professionnelle", pricingType: "SERVICE", price: 15000, rate: 10, siteUrl: `${BASE}/produits/signature-email-professionnelle`, description: "Création et déploiement de signatures email professionnelles pour toute votre équipe avec logo et réseaux." },
  { slug: "veille-e-reputation",            name: "Veille e-réputation",             pricingType: "SERVICE", price: 80000, rate: 10, siteUrl: `${BASE}/produits/veille-e-reputation`,            description: "Surveillance de votre image en ligne : mentions, avis, commentaires et alertes en temps réel." },
  { slug: "calendrier-editorial",           name: "Calendrier Éditorial",            pricingType: "SERVICE", price: 40000, rate: 10, siteUrl: `${BASE}/produits/calendrier-editorial`,           description: "Création d'un calendrier éditorial sur 3 mois avec thématiques, formats et planning de publication." },
  { slug: "gestion-tiktok-business",        name: "Gestion TikTok Business",         pricingType: "SERVICE", price: 120000, rate: 10, siteUrl: `${BASE}/produits/gestion-tiktok-business`,        description: "Stratégie et création de contenu TikTok pour toucher les jeunes consommateurs africains." },
  { slug: "lancement-produit-digital",      name: "Lancement de Produit Digital",    pricingType: "SERVICE", price: 300000, rate: 10, siteUrl: `${BASE}/produits/lancement-produit-digital`,      description: "Stratégie complète de lancement d'un nouveau produit ou service : teasers, campagnes, influenceurs, presse." },
];

export async function POST() {
  try {
    if (!(await isSyncAuthorized())) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Enregistre l'URL du flux ibig-digital.com en DB (priorité sur le fallback codé en dur)
    await prisma.setting.upsert({
      where: { key: "catalog_feed_ibig-digital" },
      update: { value: `${BASE}/api/catalogue` },
      create: { key: "catalog_feed_ibig-digital", value: `${BASE}/api/catalogue` },
    });

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

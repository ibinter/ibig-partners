import { NextResponse } from "next/server";
import { isSyncAuthorized } from "@/lib/sync-auth";
import { syncBranchWithFeed } from "@/lib/catalog-feed";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BASE = "https://ibigpartners.com";

const PARTNERS_PRODUCTS = [
  // ── Adhésion au Programme ─────────────────────────────────────────────
  {
    slug: "partners-adhesion-standard",
    name: "Adhésion Affilié Standard (Gratuite)",
    pricingType: "SERVICE",
    price: 0,
    rate: 0,
    siteUrl: `${BASE}/register`,
    description: "Rejoignez gratuitement le réseau IBIG PARTNERS et commencez à générer des commissions en promouvant les services du groupe IBIG SARL. Accès à votre espace affilié, lien de parrainage unique, tableau de bord de suivi des commissions et catalogue complet des produits à promouvoir. Inscription gratuite, sans engagement.",
  },
  {
    slug: "partners-pack-demarrage",
    name: "Pack Démarrage Affilié",
    pricingType: "SERVICE",
    price: 25000,
    rate: 0,
    siteUrl: `${BASE}/register`,
    description: "Kit de démarrage complet pour les nouveaux affiliés : formation aux techniques de vente des produits IBIG, supports marketing personnalisés (flyers, visuels réseaux sociaux, scripts WhatsApp), accès prioritaire aux nouvelles offres et session de coaching individuel d'1h. Pour affiliés souhaitant démarrer efficacement et maximiser leurs premières commissions. 25 000 FCFA.",
  },
  {
    slug: "partners-pack-premium",
    name: "Pack Affilié Premium",
    pricingType: "SERVICE",
    price: 50000,
    rate: 0,
    siteUrl: `${BASE}/register`,
    description: "Passage au niveau Premium du réseau IBIG PARTNERS : commission bonifiée de +2% sur toutes les branches, accès aux offres exclusives avant lancement, support WhatsApp dédié, kit marketing mensuel (visuels, vidéos et textes prêts à partager) et invitation aux webinaires privés de formation avancée. Pour affiliés actifs souhaitant maximiser leurs revenus et accéder à plus d'outils. 50 000 FCFA/an.",
  },
  {
    slug: "partners-pack-ambassadeur",
    name: "Pack Ambassadeur IBIG",
    pricingType: "SERVICE",
    price: 75000,
    rate: 0,
    siteUrl: `${BASE}/register`,
    description: "Statut Ambassadeur IBIG avec avantages exclusifs : badge Ambassadeur officiel, commission bonifiée sur toutes les branches, accès aux offres B2B grand compte, support commercial dédié, kit marketing premium, invitation aux événements du groupe et présentation dans l'annuaire des ambassadeurs. Pour affiliés à fort potentiel commercial souhaitant maximiser leurs revenus. 75 000 FCFA.",
  },
  {
    slug: "partners-pack-associations",
    name: "Pack Affilié Association & Groupement",
    pricingType: "SERVICE",
    price: 30000,
    rate: 0,
    siteUrl: `${BASE}/register`,
    description: "Offre spéciale pour associations, groupements de femmes, mutuelles, GIE et syndicats professionnels souhaitant intégrer le réseau IBIG PARTNERS : inscription collective de 5 membres minimum, formation de groupe, supports co-brandés aux couleurs de l'association et commission partagée. Pour organisations souhaitant créer une source de revenus complémentaires pour leurs membres. 30 000 FCFA pour le groupe.",
  },
  {
    slug: "partners-pack-diaspora",
    name: "Pack Affilié Diaspora",
    pricingType: "SERVICE",
    price: 25000,
    rate: 0,
    siteUrl: `${BASE}/register`,
    description: "Programme d'affiliation spécial pour la diaspora africaine : promouvez les services IBIG auprès de vos proches en Côte d'Ivoire et dans la sous-région depuis l'étranger. Accès à la plateforme en ligne, suivi des commissions en temps réel, paiement des commissions par transfert international. Pour membres de la diaspora souhaitant générer des revenus depuis l'Europe, l'Amérique ou le reste du monde. 25 000 FCFA/an.",
  },

  // ── Représentation Commerciale ────────────────────────────────────────
  {
    slug: "partners-representation-commerciale",
    name: "Représentation Commerciale IBIG",
    pricingType: "SERVICE",
    price: 50000,
    rate: 0,
    siteUrl: BASE,
    description: "Mandat de représentation commerciale officielle du groupe IBIG SARL dans votre zone géographique : prospection active de nouveaux clients, présentation des offres du groupe, négociation et closing. Commissions sur toutes les ventes réalisées + forfait mensuel de représentation. Pour commerciaux expérimentés souhaitant représenter un groupe structuré. 50 000 FCFA/mois + commissions.",
  },
  {
    slug: "partners-developpement-marche",
    name: "Développement de Marché & Prospection B2B",
    pricingType: "SERVICE",
    price: 150000,
    rate: 0,
    siteUrl: BASE,
    description: "Mission de développement commercial : identification des prospects B2B dans un secteur ou une zone cible, prise de contact, qualification et présentation des offres IBIG. Rapport de prospection avec liste de leads qualifiés et comptes rendus de rendez-vous. Pour entreprises et institutions souhaitant s'appuyer sur le réseau IBIG pour accélérer leur développement. À partir de 150 000 FCFA.",
  },
  {
    slug: "partners-implantation-regionale",
    name: "Implantation Régionale IBIG",
    pricingType: "SERVICE",
    price: 200000,
    rate: 0,
    siteUrl: BASE,
    description: "Accompagnement pour l'ouverture d'un point de représentation IBIG dans une nouvelle région ou ville : étude de faisabilité, recrutement des premiers affiliés locaux, formation, lancement commercial et suivi de la montée en puissance. Pour entrepreneurs souhaitant devenir Responsable Régional du réseau IBIG PARTNERS. À partir de 200 000 FCFA.",
  },
  {
    slug: "partners-apporteur-affaires-b2b",
    name: "Programme Apporteur d'Affaires B2B Grand Compte",
    pricingType: "SERVICE",
    price: 0,
    rate: 0,
    siteUrl: BASE,
    description: "Programme dédié aux apporteurs d'affaires qui mettent en relation IBIG SARL avec des clients entreprises (PME, grandes entreprises, administrations) pour des contrats à fort volume. Commission négociée au cas par cas selon le montant du contrat apporté (5 à 10% selon les branches). Pour consultants, ex-directeurs, DG et personnes disposant d'un réseau B2B établi. Gratuit — sur dossier et validation.",
  },

  // ── Formation & Montée en Compétences ────────────────────────────────
  {
    slug: "partners-formation-vente-affiliation",
    name: "Formation Vente & Affiliation (Journée)",
    pricingType: "SERVICE",
    price: 35000,
    rate: 0,
    siteUrl: BASE,
    description: "Formation pratique d'une journée dédiée aux affiliés IBIG PARTNERS : maîtriser le catalogue des produits IBIG, techniques de prospection (WhatsApp, réseaux sociaux, bouche à oreille), scripts de vente par service, gestion des objections et suivi des prospects. Pour tout affilié souhaitant passer ses premières ventes rapidement. 35 000 FCFA.",
  },
  {
    slug: "partners-formation-marketing-digital",
    name: "Formation Marketing Digital pour Affiliés",
    pricingType: "SERVICE",
    price: 40000,
    rate: 0,
    siteUrl: BASE,
    description: "Formation pratique au marketing digital appliquée à la vente des produits IBIG : créer des contenus attractifs sur Facebook, Instagram et TikTok, rédiger des posts de vente percutants, lancer des stories et Reels, utiliser WhatsApp Business comme outil de vente et analyser ses résultats. Pour affiliés souhaitant utiliser les réseaux sociaux pour générer des ventes. 40 000 FCFA.",
  },
  {
    slug: "partners-formation-manager-reseau",
    name: "Formation Manager de Réseau d'Affiliés",
    pricingType: "SERVICE",
    price: 75000,
    rate: 0,
    siteUrl: BASE,
    description: "Formation pour devenir Manager de réseau d'affiliés IBIG : recrutement et animation d'une équipe d'affiliés, techniques de motivation, suivi des performances, gestion des conflits et développement d'un réseau durable. Pour affiliés souhaitant évoluer vers un rôle de leader et multiplier leurs revenus grâce aux commissions de niveau 2. 75 000 FCFA.",
  },
  {
    slug: "partners-atelier-vente-terrain",
    name: "Atelier Pratique Vente sur le Terrain",
    pricingType: "SERVICE",
    price: 20000,
    rate: 0,
    siteUrl: BASE,
    description: "Atelier pratique de demi-journée en présentiel : mise en situation réelle de vente des produits IBIG, jeux de rôle, correction des erreurs courantes et remise de scripts personnalisés. Pour affiliés qui ont du mal à convaincre leurs prospects ou à conclure leurs ventes. 20 000 FCFA.",
  },
  {
    slug: "partners-certification-affilié",
    name: "Certification Officielle Affilié IBIG PARTNERS",
    pricingType: "SERVICE",
    price: 15000,
    rate: 0,
    siteUrl: BASE,
    description: "Obtention de la certification officielle IBIG PARTNERS après validation d'un test de connaissances sur les produits et les techniques de vente du groupe. Délivrance d'un certificat numérique et physique, ajout dans l'annuaire certifié IBIG et badge certifié sur votre profil affilié. Pour affiliés souhaitant valoriser leur expertise auprès de leurs clients et prospects. 15 000 FCFA.",
  },

  // ── Outils & Supports Marketing ──────────────────────────────────────
  {
    slug: "partners-kit-marketing-physique",
    name: "Kit Marketing Physique Personnalisé",
    pricingType: "SERVICE",
    price: 30000,
    rate: 0,
    siteUrl: BASE,
    description: "Kit de supports marketing physiques à votre nom d'affilié : 500 flyers A5, 100 cartes de visite, 1 kakémono IBIG et des autocollants. Impression de qualité, livraison incluse. Pour affiliés souhaitant prospecter sur le terrain lors d'événements, dans les marchés, les entreprises et les administrations. 30 000 FCFA.",
  },
  {
    slug: "partners-kit-marketing-digital",
    name: "Kit Marketing Digital Mensuel",
    pricingType: "SERVICE",
    price: 10000,
    rate: 0,
    siteUrl: BASE,
    description: "Pack mensuel de contenus digitaux prêts à publier pour affiliés : 20 visuels Facebook/Instagram aux couleurs IBIG, 10 textes de posts de vente, 5 stories prêtes à l'emploi, scripts WhatsApp par type de service et vidéos courtes (Reels/TikTok). Pour affiliés actifs sur les réseaux sociaux souhaitant publier régulièrement sans créer eux-mêmes. 10 000 FCFA/mois.",
  },
  {
    slug: "partners-page-vitrine-affilié",
    name: "Page Vitrine Personnalisée pour Affilié",
    pricingType: "SERVICE",
    price: 20000,
    rate: 0,
    siteUrl: BASE,
    description: "Création d'une page de présentation personnalisée sur ibigpartners.com à votre nom : photo de profil, biographie, liste de vos services IBIG préférés et lien de parrainage intégré. Idéal pour partager un lien professionnel à vos prospects plutôt qu'un simple code. Pour affiliés souhaitant une présence en ligne crédible au nom d'IBIG PARTNERS. 20 000 FCFA.",
  },

  // ── Partenariats Institutionnels & B2B ────────────────────────────────
  {
    slug: "partners-partenariat-institutionnel",
    name: "Partenariat Institutionnel",
    pricingType: "SERVICE",
    price: 0,
    rate: 0,
    siteUrl: BASE,
    description: "Accord de partenariat institutionnel entre IBIG SARL et une organisation (entreprise, ONG, institution publique, association professionnelle) : promotion croisée, offres préférentielles pour les membres, co-branding et événements communs. Pour organisations souhaitant offrir des avantages exclusifs IBIG à leurs membres ou clients. Gratuit — sur dossier.",
  },
  {
    slug: "partners-accord-distribution",
    name: "Accord de Distribution & Revente",
    pricingType: "SERVICE",
    price: 0,
    rate: 0,
    siteUrl: BASE,
    description: "Accord de distribution officielle permettant à une structure (cabinet, école, association, entreprise) de revendre les produits et services IBIG SARL à ses clients avec une marge définie. Accès au catalogue wholesale, formations produits et support commercial dédié. Pour structures disposant d'une clientèle existante à fort potentiel. Gratuit — sur dossier.",
  },
  {
    slug: "partners-partenariat-ecole-université",
    name: "Partenariat École & Université",
    pricingType: "SERVICE",
    price: 0,
    rate: 0,
    siteUrl: BASE,
    description: "Accord de partenariat entre IBIG SARL et un établissement d'enseignement (lycée, université, école de commerce, institut de formation) : interventions de sensibilisation à l'entrepreneuriat, offres spéciales pour les étudiants, programme d'affiliation jeunes et opportunités de stage au sein du groupe. Pour établissements souhaitant enrichir leur parcours entrepreneurial. Gratuit — sur dossier.",
  },

  // ── Événements & Networking ───────────────────────────────────────────
  {
    slug: "partners-evenement-networking",
    name: "Événement Networking & Présentation IBIG",
    pricingType: "SERVICE",
    price: 50000,
    rate: 0,
    siteUrl: BASE,
    description: "Organisation d'un événement de networking IBIG PARTNERS dans votre ville : présentation du groupe et de ses produits, rencontre avec les affiliés de la zone, inscription de nouveaux partenaires et célébration des meilleures performances. Pour responsables régionaux souhaitant animer et développer leur réseau local. À partir de 50 000 FCFA.",
  },
  {
    slug: "partners-webinaire-produits",
    name: "Webinaire de Présentation des Produits IBIG",
    pricingType: "SERVICE",
    price: 0,
    rate: 0,
    siteUrl: BASE,
    description: "Webinaire en ligne gratuit pour tous les affiliés IBIG PARTNERS : présentation des nouveaux produits, techniques de vente, témoignages d'affiliés performants et session de questions-réponses. Organisé mensuellement par l'équipe IBIG PARTNERS. Gratuit pour tous les affiliés inscrits.",
  },
  {
    slug: "partners-gala-top-affilies",
    name: "Gala Annuel des Meilleurs Affiliés IBIG",
    pricingType: "SERVICE",
    price: 0,
    rate: 0,
    siteUrl: BASE,
    description: "Cérémonie annuelle de remise des prix aux meilleurs affiliés IBIG PARTNERS : trophées, primes exceptionnelles, reconnaissance officielle, couverture médiatique et networking de haut niveau. Participation gratuite sur invitation — réservée aux affiliés ayant atteint les objectifs de vente annuels. Gratuit sur invitation.",
  },

  // ── Support & Accompagnement ──────────────────────────────────────────
  {
    slug: "partners-coaching-individuel",
    name: "Coaching Commercial Individuel pour Affilié",
    pricingType: "SERVICE",
    price: 20000,
    rate: 0,
    siteUrl: BASE,
    description: "Session de coaching individuel d'1h30 avec un coach commercial IBIG PARTNERS : analyse de votre activité d'affilié, identification des blocages, plan d'action personnalisé et objectifs sur 30 jours. Pour affiliés en difficulté ou souhaitant franchir un palier de revenus. 20 000 FCFA/séance.",
  },
  {
    slug: "partners-accompagnement-declaration-revenus",
    name: "Accompagnement Déclaration des Revenus d'Affiliation",
    pricingType: "SERVICE",
    price: 15000,
    rate: 0,
    siteUrl: BASE,
    description: "Aide à la régularisation fiscale des revenus de commissions : conseils sur le statut le plus adapté (auto-entrepreneur, entreprise individuelle), aide à la déclaration des revenus d'affiliation auprès des impôts et calcul des charges sociales. Pour affiliés percevant des commissions régulières souhaitant être en règle avec l'administration fiscale. 15 000 FCFA.",
  },
];

export async function POST() {
  try {
    if (!(await isSyncAuthorized())) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const result = await syncBranchWithFeed("ibig-partners-branch", "IBIG PARTNERS", PARTNERS_PRODUCTS, { notify: true });
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
      message: `${diff.total} produits IBIG PARTNERS synchronisés (${diff.added.length} nouveau(x), ${diff.updated.length} mis à jour, ${diff.removed} retiré(s)).`,
    });
  } catch (err: any) {
    console.error("sync-partners error:", err);
    return NextResponse.json({ error: err?.message ?? "Erreur serveur" }, { status: 500 });
  }
}

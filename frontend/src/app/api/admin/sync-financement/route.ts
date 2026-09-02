import { NextResponse } from "next/server";
import { isSyncAuthorized } from "@/lib/sync-auth";
import { syncBranchWithFeed } from "@/lib/catalog-feed";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BASE = "https://intermark-business.com/financement";

const FINANCEMENT_PRODUCTS = [
  // ── Épargne & Tontines Digitales ──────────────────────────────────────
  {
    slug: "fin-tontine-digitale",
    name: "Tontine Digitale IBIG",
    pricingType: "SERVICE",
    price: 5000,
    rate: 10,
    siteUrl: BASE,
    description: "Rejoignez ou créez un groupe de tontine digitale sécurisé sur la plateforme IBIG FINANCEMENT : cotisations mensuelles, tours automatisés, traçabilité complète des versements et paiements via Mobile Money. Groupes de 5 à 30 membres, cotisations de 5 000 à 500 000 FCFA/mois. Pour particuliers et associations souhaitant épargner collectivement en toute sécurité. Frais d'adhésion à partir de 5 000 FCFA.",
  },
  {
    slug: "fin-epargne-projet",
    name: "Plan Épargne Projet",
    pricingType: "SERVICE",
    price: 2000,
    rate: 10,
    siteUrl: BASE,
    description: "Ouvrez un plan d'épargne projet sur la plateforme IBIG FINANCEMENT : définissez votre objectif (construction, études, mariage, achat véhicule), programmez des virements automatiques et suivez votre progression. Épargne sécurisée, rémunérée et disponible à maturité. Pour toute personne souhaitant épargner de manière disciplinée vers un objectif précis. Frais de gestion à partir de 2 000 FCFA/mois.",
  },
  {
    slug: "fin-epargne-retraite",
    name: "Plan Épargne Retraite",
    pricingType: "SERVICE",
    price: 5000,
    rate: 10,
    siteUrl: BASE,
    description: "Constitution d'une épargne retraite complémentaire à la CNPS : versements mensuels flexibles, capitalisation sur la durée et sortie en rente ou en capital. Mise en place avec un partenaire financier agréé par la CIMA. Pour salariés et travailleurs indépendants souhaitant préparer leur retraite sereinement. Cotisation minimale : 5 000 FCFA/mois.",
  },
  {
    slug: "fin-epargne-diaspora",
    name: "Plan Épargne Diaspora",
    pricingType: "SERVICE",
    price: 0,
    rate: 10,
    siteUrl: BASE,
    description: "Solution d'épargne dédiée aux membres de la diaspora africaine souhaitant constituer un capital en Côte d'Ivoire : versements depuis l'étranger via virement ou Mobile Money international, suivi en ligne, valorisation locale et déblocage au retour ou pour financer un projet. Pour expatriés souhaitant épargner dans leur pays d'origine. Conditions sur devis selon le pays de résidence.",
  },

  // ── Financement & Crédit (Intermédiation) ────────────────────────────
  {
    slug: "fin-accompagnement-pret-personnel",
    name: "Accompagnement Prêt Personnel",
    pricingType: "SERVICE",
    price: 30000,
    rate: 10,
    siteUrl: BASE,
    description: "Mise en relation et accompagnement pour l'obtention d'un prêt personnel auprès de nos partenaires financiers (banques, IMF, SFD) : analyse de votre capacité d'endettement, sélection du meilleur partenaire, montage du dossier de demande et suivi jusqu'au déblocage. Pour salariés et indépendants ayant besoin d'un financement rapide pour leurs projets personnels. Frais de dossier : 30 000 FCFA.",
  },
  {
    slug: "fin-credit-pme",
    name: "Accompagnement Crédit PME & TPE",
    pricingType: "SERVICE",
    price: 50000,
    rate: 10,
    siteUrl: BASE,
    description: "Intermédiation pour l'accès au crédit bancaire des PME et TPE : diagnostic financier de l'entreprise, identification du produit de crédit adapté (crédit de campagne, ligne de trésorerie, crédit investissement), montage du dossier complet et mise en relation avec les établissements partenaires. Pour dirigeants de PME souhaitant financer leur développement. Frais de dossier : 50 000 FCFA.",
  },
  {
    slug: "fin-leasing-equipement",
    name: "Leasing & Crédit-Bail Équipements",
    pricingType: "SERVICE",
    price: 0,
    rate: 10,
    siteUrl: BASE,
    description: "Financement d'équipements professionnels par crédit-bail (leasing) : véhicules utilitaires, matériel BTP, équipements informatiques, matériel médical, machines industrielles. Loyers mensuels avec option d'achat en fin de contrat. Mise en relation avec les sociétés de leasing partenaires. Pour entreprises souhaitant équiper leur activité sans immobiliser leur trésorerie. Tarif sur devis selon le matériel et la durée.",
  },
  {
    slug: "fin-credit-immobilier",
    name: "Accompagnement Crédit Immobilier",
    pricingType: "SERVICE",
    price: 75000,
    rate: 10,
    siteUrl: BASE,
    description: "Accompagnement complet pour l'obtention d'un crédit immobilier : simulation de capacité d'emprunt, sélection du meilleur établissement prêteur, constitution du dossier (titre foncier, devis, assurance), négociation du taux et suivi jusqu'au déblocage des fonds. Pour particuliers souhaitant financer l'achat ou la construction d'un bien immobilier en Côte d'Ivoire. Frais de dossier : 75 000 FCFA.",
  },
  {
    slug: "fin-pret-etudiant",
    name: "Financement Études & Prêt Étudiant",
    pricingType: "SERVICE",
    price: 25000,
    rate: 10,
    siteUrl: BASE,
    description: "Mise en relation pour l'obtention d'un prêt étudiant ou d'une bourse de financement des études : prêts à faible taux pour étudiants en formations certifiantes, grandes écoles ou universités en Côte d'Ivoire et à l'étranger. Constitution du dossier et accompagnement jusqu'à l'obtention du financement. Pour étudiants et familles souhaitant accéder à l'enseignement supérieur sans contrainte financière. Frais : 25 000 FCFA.",
  },
  {
    slug: "fin-financement-stock",
    name: "Financement de Stock & Fonds de Roulement",
    pricingType: "SERVICE",
    price: 50000,
    rate: 10,
    siteUrl: BASE,
    description: "Accompagnement pour le financement du stock et du fonds de roulement des commerçants et PME : crédit de campagne, escompte commercial, avance sur marché et affacturage. Mise en relation avec les IMF et banques partenaires spécialisées dans le financement des entreprises commerciales. Pour commerçants et PME en manque de liquidités pour acheter leur stock. Frais de dossier : 50 000 FCFA.",
  },
  {
    slug: "fin-microfinance-imo",
    name: "Microcrédit & Financement IMF",
    pricingType: "SERVICE",
    price: 15000,
    rate: 10,
    siteUrl: BASE,
    description: "Mise en relation avec des Institutions de Microfinance (IMF) partenaires pour l'obtention de microcrédits : prêts de 50 000 à 5 000 000 FCFA pour auto-entrepreneurs, artisans, commerçants et petits producteurs. Sans garantie immobilière dans certains cas. Pour porteurs de petits projets économiques n'ayant pas accès au crédit bancaire classique. Frais de mise en relation : 15 000 FCFA.",
  },

  // ── Assurance (Courtage & Intermédiation) ─────────────────────────────
  {
    slug: "fin-assurance-vie",
    name: "Assurance Vie & Prévoyance",
    pricingType: "SERVICE",
    price: 0,
    rate: 12,
    siteUrl: BASE,
    description: "Souscription à un contrat d'assurance vie ou de prévoyance auprès de nos partenaires assureurs agréés CIMA : capital décès, rente éducation pour les enfants, invalidité et épargne à long terme. Conseil personnalisé selon votre situation familiale et professionnelle. Pour toute personne souhaitant protéger ses proches et préparer l'avenir. Primes à partir de 5 000 FCFA/mois selon le capital choisi.",
  },
  {
    slug: "fin-assurance-auto",
    name: "Assurance Auto & Flotte de Véhicules",
    pricingType: "SERVICE",
    price: 0,
    rate: 12,
    siteUrl: BASE,
    description: "Souscription d'assurance automobile au meilleur tarif : responsabilité civile obligatoire, tous risques, assistance panne et protection du conducteur. Mise en concurrence de plusieurs compagnies pour obtenir la meilleure couverture au meilleur prix. Pour particuliers et entreprises souhaitant assurer un véhicule ou une flotte. Tarif selon le véhicule et la formule choisie — sur devis.",
  },
  {
    slug: "fin-assurance-habitation",
    name: "Assurance Habitation & Multirisque Professionnelle",
    pricingType: "SERVICE",
    price: 0,
    rate: 12,
    siteUrl: BASE,
    description: "Souscription d'assurance habitation pour locataires ou propriétaires et multirisque professionnelle pour bureaux, commerces et entrepôts : incendie, dégât des eaux, vol, bris de glace et responsabilité civile. Mise en concurrence de plusieurs assureurs partenaires. Tarif sur devis selon la superficie et les garanties souhaitées.",
  },
  {
    slug: "fin-assurance-sante",
    name: "Assurance Maladie & Mutuelle Santé",
    pricingType: "SERVICE",
    price: 0,
    rate: 12,
    siteUrl: BASE,
    description: "Souscription à une complémentaire santé ou à une mutuelle d'entreprise : consultations, hospitalisations, pharmacie, maternité et soins dentaires. Solutions individuelles, familiales et collectives (entreprise). Mise en relation avec les compagnies d'assurance santé partenaires agréées. Pour particuliers et employeurs souhaitant couvrir leurs frais médicaux. Tarif sur devis selon le niveau de couverture.",
  },
  {
    slug: "fin-assurance-voyage",
    name: "Assurance Voyage & Rapatriement",
    pricingType: "SERVICE",
    price: 15000,
    rate: 12,
    siteUrl: BASE,
    description: "Souscription rapide d'une assurance voyage pour vos déplacements à l'international : annulation, assistance médicale, rapatriement, perte de bagages et responsabilité civile à l'étranger. Couverture Schengen et mondiale disponible. Pour particuliers, étudiants et professionnels voyageant à l'étranger. À partir de 15 000 FCFA selon la destination et la durée.",
  },
  {
    slug: "fin-assurance-rc-professionnelle",
    name: "Assurance Responsabilité Civile Professionnelle",
    pricingType: "SERVICE",
    price: 0,
    rate: 12,
    siteUrl: BASE,
    description: "Souscription d'une assurance responsabilité civile professionnelle (RC Pro) : couverture des dommages causés à des tiers dans le cadre de votre activité professionnelle — matériels, corporels et immatériels. Obligatoire dans certains métiers (BTP, médecins, experts-comptables, avocats). Tarif sur devis selon la profession et le chiffre d'affaires.",
  },

  // ── Investissement & Placement ────────────────────────────────────────
  {
    slug: "fin-placement-opcvm",
    name: "Placement OPCVM & Fonds Communs",
    pricingType: "SERVICE",
    price: 25000,
    rate: 10,
    siteUrl: BASE,
    description: "Accès à des Organismes de Placement Collectif en Valeurs Mobilières (OPCVM) disponibles sur la BRVM : fonds monétaires, fonds obligataires et fonds diversifiés. Conseil d'allocation selon votre profil de risque et votre horizon de placement. Mise en relation avec les Sociétés de Gestion et d'Intermédiation (SGI) partenaires. Pour épargnants souhaitant faire fructifier leur argent sur les marchés financiers ouest-africains. Investissement minimum : 25 000 FCFA.",
  },
  {
    slug: "fin-obligations-etat",
    name: "Souscription Bons & Obligations d'État (UMOA)",
    pricingType: "SERVICE",
    price: 0,
    rate: 10,
    siteUrl: BASE,
    description: "Accès aux émissions de Bons du Trésor (BTA, BTAN) et d'obligations d'État des pays de l'UMOA via la BRVM : placements sécurisés, rendements garantis de 5 à 7% selon la maturité. Accompagnement dans la souscription auprès des SVT (Spécialistes en Valeurs du Trésor) partenaires. Pour investisseurs cherchant un placement sûr et rémunérateur. Montant minimum selon les émissions — sur devis.",
  },
  {
    slug: "fin-crowdfunding-pme",
    name: "Crowdfunding & Financement Participatif PME",
    pricingType: "SERVICE",
    price: 50000,
    rate: 10,
    siteUrl: BASE,
    description: "Accompagnement des PME africaines pour lever des fonds via le financement participatif (crowdfunding) : préparation du dossier de campagne, définition de la contrepartie investisseurs, mise en ligne sur les plateformes partenaires et animation de la campagne. Pour startups et PME souhaitant lever entre 5 et 50 millions FCFA auprès d'une communauté d'investisseurs. Frais de lancement : 50 000 FCFA.",
  },
  {
    slug: "fin-investissement-immobilier-locatif",
    name: "Investissement Immobilier Locatif (Club Deal)",
    pricingType: "SERVICE",
    price: 0,
    rate: 10,
    siteUrl: BASE,
    description: "Accès à des opportunités d'investissement immobilier locatif en club deal : acquisition groupée de biens immobiliers à rendement locatif, gestion déléguée à IBIG IMMO TRUST et répartition des loyers entre co-investisseurs. Pour particuliers souhaitant investir dans l'immobilier avec un ticket d'entrée réduit. Ticket minimum et rendements sur devis selon l'opération.",
  },

  // ── Conseil Financier & Coaching ──────────────────────────────────────
  {
    slug: "fin-coaching-finances-personnelles",
    name: "Coaching Finances Personnelles",
    pricingType: "SERVICE",
    price: 25000,
    rate: 10,
    siteUrl: BASE,
    description: "Séance de coaching individuel sur la gestion de vos finances personnelles : bilan financier, établissement d'un budget, plan de désendettement, stratégie d'épargne et premiers investissements. Pour salariés, entrepreneurs et ménages souhaitant prendre le contrôle de leur argent et construire un patrimoine. 25 000 FCFA/séance.",
  },
  {
    slug: "fin-formation-gestion-budget",
    name: "Formation Gestion du Budget & Finances du Foyer",
    pricingType: "SERVICE",
    price: 20000,
    rate: 10,
    siteUrl: BASE,
    description: "Atelier pratique de demi-journée sur la gestion du budget familial : comprendre ses revenus et dépenses, créer un budget réaliste, épargner chaque mois, éviter les pièges du crédit et les dettes. Pour particuliers, associations de femmes et groupements souhaitant améliorer leur gestion financière. 20 000 FCFA/personne.",
  },
  {
    slug: "fin-simulation-capacite-emprunt",
    name: "Simulation & Conseil Capacité d'Emprunt",
    pricingType: "SERVICE",
    price: 10000,
    rate: 10,
    siteUrl: BASE,
    description: "Analyse de votre capacité d'emprunt et simulation de crédit personnalisée : calcul du montant finançable selon vos revenus, simulation des mensualités, choix de la durée optimale et identification des garanties nécessaires. Pour toute personne souhaitant savoir combien elle peut emprunter avant de déposer un dossier. 10 000 FCFA.",
  },
  {
    slug: "fin-conseil-patrimoine",
    name: "Conseil en Gestion de Patrimoine",
    pricingType: "SERVICE",
    price: 75000,
    rate: 10,
    siteUrl: BASE,
    description: "Bilan patrimonial complet et conseil en gestion de patrimoine : inventaire des actifs et passifs, stratégie d'optimisation fiscale, allocation d'actifs (immobilier, marchés financiers, épargne), transmission et protection du patrimoine. Pour particuliers et chefs d'entreprise souhaitant faire fructifier et protéger leur patrimoine dans la durée. À partir de 75 000 FCFA.",
  },
  {
    slug: "fin-audit-financier-personnel",
    name: "Audit Financier Personnel & Plan de Redressement",
    pricingType: "SERVICE",
    price: 30000,
    rate: 10,
    siteUrl: BASE,
    description: "Audit complet de votre situation financière personnelle : analyse des revenus, des dettes, du niveau d'épargne et des dépenses, identification des postes à optimiser et élaboration d'un plan de redressement sur 6 à 12 mois. Pour personnes en difficulté financière ou souhaitant assainir leur situation avant de contracter un crédit. 30 000 FCFA.",
  },

  // ── Mobile Money & Transferts ─────────────────────────────────────────
  {
    slug: "fin-assistance-mobile-money",
    name: "Assistance & Formation Mobile Money",
    pricingType: "SERVICE",
    price: 10000,
    rate: 10,
    siteUrl: BASE,
    description: "Formation pratique à l'utilisation des services de Mobile Money (Orange Money, MTN MoMo, Wave, Moneroo…) : ouverture de compte, envoi et réception d'argent, paiement de factures, achat de crédit et bonnes pratiques de sécurité. Pour commerçants, artisans et particuliers souhaitant maîtriser le paiement mobile. 10 000 FCFA/personne.",
  },
  {
    slug: "fin-transfert-international",
    name: "Conseil & Orientation Transferts d'Argent Internationaux",
    pricingType: "SERVICE",
    price: 5000,
    rate: 10,
    siteUrl: BASE,
    description: "Orientation et conseil pour optimiser vos transferts d'argent internationaux : comparaison des opérateurs (Western Union, MoneyGram, Wave, Remitly, Wise…), sélection du service le moins cher et le plus rapide selon la destination, et assistance aux premières opérations. Pour membres de la diaspora et familles recevant des envois de fonds. 5 000 FCFA.",
  },
];

export async function POST() {
  try {
    if (!(await isSyncAuthorized())) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const result = await syncBranchWithFeed("ibig-financement", "IBIG FINANCEMENT", FINANCEMENT_PRODUCTS, { notify: true });
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
      message: `${diff.total} produits IBIG FINANCEMENT synchronisés (${diff.added.length} nouveau(x), ${diff.updated.length} mis à jour, ${diff.removed} retiré(s)).`,
    });
  } catch (err: any) {
    console.error("sync-financement error:", err);
    return NextResponse.json({ error: err?.message ?? "Erreur serveur" }, { status: 500 });
  }
}

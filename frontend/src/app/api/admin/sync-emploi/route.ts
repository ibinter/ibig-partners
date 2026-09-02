import { NextResponse } from "next/server";
import { isSyncAuthorized } from "@/lib/sync-auth";
import { syncBranchWithFeed } from "@/lib/catalog-feed";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BASE = "https://intermark-business.com/emploi";

const EMPLOI_PRODUCTS = [
  // ── Recrutement Cadres & Profils Qualifiés ────────────────────────────
  {
    slug: "emploi-recrutement-cadre-superieur",
    name: "Recrutement Cadre Supérieur & Dirigeant",
    pricingType: "SERVICE",
    price: 300000,
    rate: 10,
    siteUrl: BASE,
    description: "Chasse de têtes et recrutement de cadres supérieurs et dirigeants : DG, DAF, DRH, directeurs commerciaux, responsables de départements et managers seniors. Approche directe, vérification des références, évaluation des compétences et présentation d'une short-list de 3 candidats qualifiés. Pour entreprises cherchant des profils rares et expérimentés. À partir de 300 000 FCFA.",
  },
  {
    slug: "emploi-recrutement-profil-intermediaire",
    name: "Recrutement Profil Intermédiaire (Agent de maîtrise)",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Recrutement de profils de maîtrise et superviseurs : chefs d'équipe, superviseurs de production, assistants de direction, responsables administratifs, techniciens supérieurs et agents commerciaux confirmés. Tri des candidatures, entretiens de présélection et présentation d'une short-list qualifiée. Pour PME et grandes entreprises. À partir de 150 000 FCFA.",
  },
  {
    slug: "emploi-recrutement-profil-junior",
    name: "Recrutement Profil Junior & Premier Emploi",
    pricingType: "SERVICE",
    price: 75000,
    rate: 10,
    siteUrl: BASE,
    description: "Recrutement de jeunes diplômés et profils juniors pour leur premier emploi : assistants, conseillers, agents commerciaux débutants, opérateurs de saisie et stagiaires à embaucher. Accès à notre vivier de jeunes diplômés des meilleures écoles et universités de Côte d'Ivoire. Pour entreprises souhaitant intégrer des talents récents et motivés. À partir de 75 000 FCFA.",
  },
  {
    slug: "emploi-recrutement-commercial",
    name: "Recrutement Commercial & Force de Vente",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Recrutement spécialisé de profils commerciaux : représentants commerciaux, ingénieurs commerciaux, key account managers, responsables de zone, télévendeurs et agents de recouvrement. Test de personnalité commerciale, simulation de vente et vérification du track record. Pour entreprises souhaitant renforcer leur force de vente rapidement. À partir de 100 000 FCFA.",
  },
  {
    slug: "emploi-recrutement-comptable-financier",
    name: "Recrutement Comptable & Profil Financier",
    pricingType: "SERVICE",
    price: 120000,
    rate: 10,
    siteUrl: BASE,
    description: "Recrutement de profils comptables et financiers : comptables SYSCOHADA, chefs comptables, DAF, contrôleurs de gestion, auditeurs internes, trésoriers et fiscalistes. Vérification des diplômes, test technique comptable et présentation des meilleurs candidats. Pour entreprises et cabinets comptables. À partir de 120 000 FCFA.",
  },
  {
    slug: "emploi-recrutement-informatique",
    name: "Recrutement Informatique & Digital",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Recrutement de profils IT et digitaux : développeurs web et mobile, ingénieurs réseaux, administrateurs systèmes, chefs de projets IT, data analysts, designers UI/UX et community managers. Tests techniques inclus. Pour entreprises et startups en développement digital souhaitant trouver des talents tech qualifiés. À partir de 150 000 FCFA.",
  },
  {
    slug: "emploi-recrutement-rh",
    name: "Recrutement Profil RH & Juridique",
    pricingType: "SERVICE",
    price: 120000,
    rate: 10,
    siteUrl: BASE,
    description: "Recrutement de spécialistes RH et juristes : chargés RH, DRH, gestionnaires de paie, juristes d'entreprise, conseillers juridiques et compliance officers. Vérification des diplômes et expériences, entretiens structurés et présentation des candidats sélectionnés. Pour entreprises, cabinets juridiques et ONG. À partir de 120 000 FCFA.",
  },
  {
    slug: "emploi-recrutement-logistique-supply",
    name: "Recrutement Logistique, Supply Chain & Achat",
    pricingType: "SERVICE",
    price: 120000,
    rate: 10,
    siteUrl: BASE,
    description: "Recrutement de profils logistique et supply chain : responsables logistique, gestionnaires de stock, acheteurs, agents de transit douanier, coordinateurs transport et chefs magasinier. Pour entreprises industrielles, agro-alimentaires, et distributeurs souhaitant optimiser leur chaîne logistique. À partir de 120 000 FCFA.",
  },
  {
    slug: "emploi-recrutement-sante-medical",
    name: "Recrutement Médical & Paramédical",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Recrutement de profils médicaux et paramédicaux : médecins généralistes, spécialistes, infirmiers diplômés d'État, sages-femmes, techniciens de laboratoire, pharmaciens et kinésithérapeutes. Vérification des diplômes et ordres professionnels. Pour cliniques, hôpitaux, pharmacies et structures de santé. À partir de 150 000 FCFA.",
  },
  {
    slug: "emploi-recrutement-btp-ingenierie",
    name: "Recrutement BTP, Ingénierie & Architecture",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Recrutement de profils techniques BTP et ingénierie : ingénieurs génie civil, architectes, chefs de chantier, conducteurs de travaux, dessinateurs projeteurs, métreurs et ingénieurs HSE. Pour entreprises de construction, bureaux d'études et promoteurs immobiliers. À partir de 150 000 FCFA.",
  },

  // ── Placement Techniciens & Ouvriers Qualifiés ────────────────────────
  {
    slug: "emploi-placement-technicien-qualifie",
    name: "Placement Technicien Qualifié",
    pricingType: "SERVICE",
    price: 60000,
    rate: 10,
    siteUrl: BASE,
    description: "Recrutement et placement de techniciens qualifiés pour l'industrie, le BTP et les services : techniciens de maintenance industrielle, électrotechniciens, plombiers certifiés, frigoristes, soudeurs qualifiés, mécaniciens, techniciens automobiles, opticiens et techniciens de laboratoire. Tests de compétences pratiques inclus. Pour entreprises, ateliers et sites industriels. À partir de 60 000 FCFA.",
  },
  {
    slug: "emploi-placement-ouvrier-btp",
    name: "Placement Ouvriers BTP Qualifiés",
    pricingType: "SERVICE",
    price: 40000,
    rate: 10,
    siteUrl: BASE,
    description: "Mise à disposition d'ouvriers BTP qualifiés pour chantiers de construction, rénovation et génie civil : maçons, carreleurs, peintres en bâtiment, coffreurs-bancheurs, ferrailleurs, menuisiers bois et aluminium, plombiers, électriciens du bâtiment et poseurs de faux-plafonds. Vérification des compétences et remise de contrats. Pour promoteurs, maîtres d'ouvrage et entreprises BTP. À partir de 40 000 FCFA.",
  },
  {
    slug: "emploi-placement-ouvrier-industrie",
    name: "Placement Ouvriers Industriels & de Production",
    pricingType: "SERVICE",
    price: 35000,
    rate: 10,
    siteUrl: BASE,
    description: "Placement d'ouvriers qualifiés pour unités industrielles et sites de production : opérateurs de machines, conducteurs de ligne, agents de contrôle qualité, soudeurs, mécaniciens industriels, opérateurs de chariot élévateur (CACES) et manutentionnaires qualifiés. Pour usines, agro-industries et zones industrielles. À partir de 35 000 FCFA par placement.",
  },
  {
    slug: "emploi-placement-ouvrier-agricole",
    name: "Placement Main-d'œuvre Agricole & Agro-industrielle",
    pricingType: "SERVICE",
    price: 25000,
    rate: 10,
    siteUrl: BASE,
    description: "Recrutement et placement de main-d'œuvre agricole spécialisée : manœuvres agricoles, récolteurs, conducteurs d'engins agricoles, agents de traitement phytosanitaire, superviseurs de plantation et techniciens agronomes. Pour exploitations agricoles, coopératives et entreprises agro-industrielles. À partir de 25 000 FCFA par placement.",
  },
  {
    slug: "emploi-placement-chauffeur",
    name: "Placement Chauffeurs Professionnels",
    pricingType: "SERVICE",
    price: 30000,
    rate: 10,
    siteUrl: BASE,
    description: "Recrutement et placement de chauffeurs professionnels qualifiés : chauffeurs de direction (VTC), chauffeurs poids lourds (PL/SPL), conducteurs de bus scolaires, chauffeurs-livreurs et conducteurs d'engins (grue, chargeuse, pelleteuse). Vérification du permis, du casier judiciaire et des années d'expérience. Pour entreprises, ONG et particuliers. À partir de 30 000 FCFA.",
  },
  {
    slug: "emploi-placement-securite-gardiennage",
    name: "Placement Agents de Sécurité & Gardiens",
    pricingType: "SERVICE",
    price: 30000,
    rate: 10,
    siteUrl: BASE,
    description: "Placement d'agents de sécurité et gardiens qualifiés : agents de sûreté, rondiers, agents de contrôle d'accès, vigiles pour commerce et gardiens de nuit. Formation aux premiers secours incluse, vérification du casier judiciaire. Pour entreprises, résidences, chantiers et établissements publics. À partir de 30 000 FCFA par placement.",
  },

  // ── Personnel Domestique & de Maison ──────────────────────────────────
  {
    slug: "emploi-placement-personnel-domestique",
    name: "Placement Personnel Domestique",
    pricingType: "SERVICE",
    price: 25000,
    rate: 10,
    siteUrl: BASE,
    description: "Recrutement et placement de personnel domestique rigoureusement sélectionné : femmes de ménage, cuisiniers, cuisinières, nounous, baby-sitters, jardiniers, gardiens de maison et majordomes. Vérification des antécédents (casier judiciaire), entretien de présélection et période d'essai garantie. Pour familles ivoiriennes, expatriés et résidences haut de gamme. À partir de 25 000 FCFA.",
  },
  {
    slug: "emploi-placement-cuisinier-restauration",
    name: "Placement Cuisiniers & Personnel de Restauration",
    pricingType: "SERVICE",
    price: 40000,
    rate: 10,
    siteUrl: BASE,
    description: "Placement de professionnels de la restauration : chefs de cuisine, cuisiniers, commis de cuisine, serveurs, barmen, pâtissiers et gérants de restaurant. Tests culinaires pratiques et présentation des meilleurs profils. Pour restaurants, hôtels, traiteurs, cantines d'entreprise et particuliers. À partir de 40 000 FCFA.",
  },
  {
    slug: "emploi-placement-aide-soignant",
    name: "Placement Aides-Soignants & Personnel de Soin",
    pricingType: "SERVICE",
    price: 30000,
    rate: 10,
    siteUrl: BASE,
    description: "Placement d'aides-soignants, auxiliaires de vie et infirmiers à domicile : soins de base, aide au lever et au coucher, toilette, préparation des repas médicamenteux et accompagnement des personnes âgées ou dépendantes. Vérification des diplômes et expériences. Pour familles, maisons de retraite et cliniques. À partir de 30 000 FCFA.",
  },

  // ── Intérim & Mise à Disposition ──────────────────────────────────────
  {
    slug: "emploi-interim-agents-execution",
    name: "Intérim — Agents d'Exécution & Opérateurs",
    pricingType: "SERVICE",
    price: 50000,
    rate: 10,
    siteUrl: BASE,
    description: "Mise à disposition d'agents d'exécution en contrat intérimaire : opérateurs de saisie, agents de tri, manutentionnaires, agents de conditionnement, hôtes de caisse, agents d'accueil et opérateurs de production. Disponibles sous 48h, contrats gérés par IBIG EMPLOI & TALENTS. Pour entreprises en pic d'activité, saisonnalité ou remplacement d'effectifs. À partir de 50 000 FCFA/mois par agent.",
  },
  {
    slug: "emploi-interim-techniciens",
    name: "Intérim — Techniciens & Agents de Maîtrise",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Mise à disposition de techniciens et agents de maîtrise en contrat temporaire : techniciens de maintenance, chefs d'équipe, superviseurs de production, responsables qualité, agents HSE et chargés de projet juniors. Profils disponibles sous 72h pour des missions de 1 semaine à 6 mois. Pour industries, BTP et services. À partir de 100 000 FCFA/mois par agent.",
  },
  {
    slug: "emploi-interim-cadres",
    name: "Intérim Cadres & Management de Transition",
    pricingType: "SERVICE",
    price: 0,
    rate: 10,
    siteUrl: BASE,
    description: "Mise à disposition de cadres expérimentés en mission temporaire : directeurs de transition, DAF par intérim, DRH de mission, directeurs commerciaux, chefs de projet et experts sectoriels. Pour entreprises en restructuration, en croissance rapide ou en remplacement d'un cadre clé. Tarif sur devis selon le profil et la durée de la mission.",
  },
  {
    slug: "emploi-mise-disposition-equipe",
    name: "Mise à Disposition d'Équipe Complète",
    pricingType: "SERVICE",
    price: 0,
    rate: 10,
    siteUrl: BASE,
    description: "Constitution et mise à disposition d'une équipe clé en main pour un chantier, une opération ou un projet : équipe BTP complète, brigade de nettoyage, brigade de gardiennage, équipe de déménagement ou force de vente externalisée. Encadrement inclus. Pour projets nécessitant plusieurs profils sur une période définie. Tarif sur devis selon la taille et la durée de la mission.",
  },

  // ── RH Externalisée & Services Employeurs ─────────────────────────────
  {
    slug: "emploi-externalisation-paie-rh",
    name: "Externalisation Paie & Administration RH",
    pricingType: "SERVICE",
    price: 30000,
    rate: 10,
    siteUrl: BASE,
    description: "Gestion externalisée de la paie et de l'administration du personnel : bulletins de salaire conformes au Code du Travail ivoirien, déclarations CNPS et DIPE, suivi des congés, gestion des contrats et conseil en droit social. Pour TPE et PME souhaitant fiabiliser leur paie sans recruter un DRH. À partir de 30 000 FCFA/mois selon le nombre de salariés.",
  },
  {
    slug: "emploi-audit-social-conformite",
    name: "Audit Social & Mise en Conformité RH",
    pricingType: "SERVICE",
    price: 200000,
    rate: 10,
    siteUrl: BASE,
    description: "Audit complet de la conformité sociale de votre entreprise : vérification des contrats de travail, du registre du personnel, des obligations CNPS, des affichages obligatoires, du règlement intérieur et des procédures disciplinaires. Rapport d'anomalies et plan de mise en conformité inclus. Pour entreprises souhaitant éviter les contentieux prud'homaux et les redressements CNPS. À partir de 200 000 FCFA.",
  },
  {
    slug: "emploi-elaboration-grille-salaire",
    name: "Élaboration Grille Salariale & Classification des Postes",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Conception d'une grille salariale équitable et compétitive : classification des postes, benchmarking des salaires du marché ivoirien par secteur, attribution des niveaux de rémunération, prime de performance et politique de révision salariale. Pour entreprises souhaitant structurer leur politique de rémunération et fidéliser leurs talents. À partir de 150 000 FCFA.",
  },
  {
    slug: "emploi-outplacement",
    name: "Outplacement & Accompagnement Reclassement",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Programme d'outplacement pour salariés licenciés ou en transition professionnelle : bilan de compétences, redéfinition du projet professionnel, CV et lettre de motivation, préparation aux entretiens, activation du réseau et accompagnement jusqu'au reclassement. Pour entreprises souhaitant accompagner dignement leurs salariés sortants. À partir de 100 000 FCFA par bénéficiaire.",
  },

  // ── Insertion & Formation Professionnelle ─────────────────────────────
  {
    slug: "emploi-programme-insertion-jeunes",
    name: "Programme d'Insertion Professionnelle Jeunes",
    pricingType: "SERVICE",
    price: 75000,
    rate: 10,
    siteUrl: BASE,
    description: "Programme complet sur 3 mois pour l'insertion professionnelle des jeunes diplômés : bilan de compétences, ateliers CV et lettre de motivation, préparation aux entretiens, recherche active d'emploi et mise en réseau avec les entreprises partenaires IBIG EMPLOI. Pour jeunes diplômés sans expérience ou avec peu d'expérience professionnelle. 75 000 FCFA.",
  },
  {
    slug: "emploi-formation-reconversion",
    name: "Formation & Reconversion Professionnelle",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Accompagnement dans un projet de reconversion professionnelle : identification du nouveau métier cible, plan de formation pour acquérir les compétences manquantes, accompagnement dans la recherche de financement formation et suivi jusqu'à l'obtention du premier poste dans le nouveau domaine. Pour salariés et demandeurs d'emploi souhaitant changer de métier. À partir de 100 000 FCFA.",
  },
  {
    slug: "emploi-formation-soft-skills",
    name: "Formation Soft Skills & Préparation au Monde du Travail",
    pricingType: "SERVICE",
    price: 30000,
    rate: 10,
    siteUrl: BASE,
    description: "Atelier de préparation au monde professionnel : communication orale et écrite, travail en équipe, gestion du temps, sens du service, etiquette professionnelle et code vestimentaire. Pour étudiants en fin de cursus et jeunes actifs souhaitant développer les compétences comportementales attendues par les recruteurs. 30 000 FCFA/personne.",
  },

  // ── Conseils & Outils pour Candidats ─────────────────────────────────
  {
    slug: "emploi-cv-lettre-motivation",
    name: "Rédaction CV & Lettre de Motivation",
    pricingType: "SERVICE",
    price: 15000,
    rate: 12,
    siteUrl: BASE,
    description: "Rédaction ou refonte professionnelle de votre CV et lettre de motivation : mise en page soignée, valorisation de vos expériences et compétences, optimisation pour les recruteurs et les systèmes ATS. Livré en Word et PDF. Pour tout candidat souhaitant un dossier de candidature percutant. 15 000 FCFA le pack CV + lettre.",
  },
  {
    slug: "emploi-preparation-entretien",
    name: "Préparation aux Entretiens d'Embauche",
    pricingType: "SERVICE",
    price: 20000,
    rate: 12,
    siteUrl: BASE,
    description: "Coaching intensif pour réussir vos entretiens : simulation d'entretien en conditions réelles, debriefing, travail du pitch de présentation, réponses aux questions pièges, gestion du stress et négociation salariale. Pour candidats ayant des entretiens programmés et souhaitant maximiser leurs chances. 20 000 FCFA/séance.",
  },
  {
    slug: "emploi-veille-offres-candidature",
    name: "Veille Offres d'Emploi & Candidatures Ciblées",
    pricingType: "SERVICE",
    price: 20000,
    rate: 12,
    siteUrl: BASE,
    description: "Service mensuel de veille et de candidature active : identification des offres d'emploi correspondant à votre profil, envoi de candidatures ciblées au nom du candidat, relances et suivi. Pour demandeurs d'emploi souhaitant déléguer leur recherche à des professionnels tout en continuant leur quotidien. 20 000 FCFA/mois.",
  },
];

export async function POST() {
  try {
    if (!(await isSyncAuthorized())) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const result = await syncBranchWithFeed("ibig-emploi-talents", "IBIG EMPLOI & TALENTS", EMPLOI_PRODUCTS, { notify: true });
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
      message: `${diff.total} produits IBIG EMPLOI & TALENTS synchronisés (${diff.added.length} nouveau(x), ${diff.updated.length} mis à jour, ${diff.removed} retiré(s)).`,
    });
  } catch (err: any) {
    console.error("sync-emploi error:", err);
    return NextResponse.json({ error: err?.message ?? "Erreur serveur" }, { status: 500 });
  }
}

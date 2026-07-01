import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BASE = "https://intermark-business.com/conseil";

const CONSEIL_PRODUCTS = [
  // ── Comptabilité & Gestion Financière ─────────────────────────────────
  {
    slug: "conseil-compta-tpe-pme",
    name: "Gestion Comptable TPE/PME",
    pricingType: "SERVICE",
    price: 50000,
    rate: 10,
    siteUrl: BASE,
    description: "Externalisation de la comptabilité pour TPE et PME : saisie des pièces comptables, rapprochements bancaires, états financiers mensuels conformes SYSCOHADA, suivi de trésorerie et préparation de la déclaration fiscale annuelle. Pour dirigeants souhaitant une comptabilité fiable sans recruter un comptable à plein temps. À partir de 50 000 FCFA/mois.",
  },
  {
    slug: "conseil-compta-ong",
    name: "Gestion Comptable ONG & Associations",
    pricingType: "SERVICE",
    price: 60000,
    rate: 10,
    siteUrl: BASE,
    description: "Tenue de la comptabilité spécifique aux ONG et associations : comptabilité par projet (SYCEBNL), rapports financiers bailleurs, suivi des subventions, justification des dépenses et préparation des audits. Pour coordinateurs et directeurs d'ONG souhaitant des comptes transparents et conformes aux exigences des bailleurs. À partir de 60 000 FCFA/mois.",
  },
  {
    slug: "conseil-bilan-fiscal",
    name: "Bilan Annuel & Déclarations Fiscales",
    pricingType: "SERVICE",
    price: 120000,
    rate: 10,
    siteUrl: BASE,
    description: "Établissement du bilan annuel et des déclarations fiscales obligatoires : états financiers SYSCOHADA, liasse fiscale, déclaration de résultat, déclarations TVA et autres impôts. Pour toute entreprise souhaitant être en règle avec le fisc et éviter les pénalités. À partir de 120 000 FCFA selon la taille de la structure.",
  },
  {
    slug: "conseil-tableau-bord-financier",
    name: "Tableau de Bord Financier & Reporting",
    pricingType: "SERVICE",
    price: 80000,
    rate: 10,
    siteUrl: BASE,
    description: "Conception et suivi d'un tableau de bord financier personnalisé : indicateurs clés (CA, marges, trésorerie, dettes), alertes et rapports mensuels de pilotage. Pour dirigeants souhaitant suivre leur performance financière en temps réel et prendre de meilleures décisions. À partir de 80 000 FCFA.",
  },

  // ── Création & Structuration d'Entreprise ─────────────────────────────
  {
    slug: "conseil-creation-entreprise",
    name: "Création d'Entreprise Clé en Main",
    pricingType: "SERVICE",
    price: 150000,
    rate: 12,
    siteUrl: BASE,
    description: "Accompagnement complet à la création d'entreprise : choix du statut juridique (SARL, SAS, SA, EI…), rédaction des statuts, immatriculation au RCCM, obtention du compte contribuable, NCC, CNPS et compte bancaire professionnel. Pour porteurs de projets souhaitant créer leur entreprise rapidement et en toute légalité. À partir de 150 000 FCFA.",
  },
  {
    slug: "conseil-structuration-entreprise",
    name: "Structuration & Organisation d'Entreprise",
    pricingType: "SERVICE",
    price: 200000,
    rate: 10,
    siteUrl: BASE,
    description: "Diagnostic et restructuration de votre organisation : définition des fonctions, rédaction des fiches de poste, élaboration des procédures internes, organigramme, manuel de procédures et règlement intérieur. Pour entreprises en croissance souhaitant formaliser leur fonctionnement et préparer une montée en puissance. À partir de 200 000 FCFA.",
  },
  {
    slug: "conseil-audit-organisationnel",
    name: "Audit Organisationnel",
    pricingType: "SERVICE",
    price: 250000,
    rate: 10,
    siteUrl: BASE,
    description: "Diagnostic complet du fonctionnement de votre entreprise : analyse des processus, identification des dysfonctionnements, évaluation des risques organisationnels, benchmarking et plan d'action correctif. Livré sous forme de rapport d'audit avec recommandations priorisées. Pour dirigeants souhaitant optimiser leur organisation et améliorer leur performance. À partir de 250 000 FCFA.",
  },
  {
    slug: "conseil-modification-statuts",
    name: "Modification de Statuts & Formalités Juridiques",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Gestion des modifications statutaires et formalités juridiques : changement de dénomination, transfert de siège, augmentation de capital, cession de parts, nomination de gérant et dépôt au RCCM. Pour entreprises devant effectuer des changements juridiques sans se perdre dans les démarches administratives. À partir de 100 000 FCFA.",
  },

  // ── Études & Conseil Stratégique ──────────────────────────────────────
  {
    slug: "conseil-etude-marche",
    name: "Étude de Marché",
    pricingType: "SERVICE",
    price: 300000,
    rate: 10,
    siteUrl: BASE,
    description: "Réalisation d'une étude de marché professionnelle : analyse de la demande, étude de la concurrence, segmentation, analyse SWOT, opportunités et recommandations stratégiques. Livrée avec rapport complet et présentation. Pour porteurs de projets, investisseurs et entreprises souhaitant valider un marché avant de se lancer. À partir de 300 000 FCFA.",
  },
  {
    slug: "conseil-business-plan",
    name: "Rédaction de Business Plan",
    pricingType: "SERVICE",
    price: 200000,
    rate: 10,
    siteUrl: BASE,
    description: "Élaboration d'un business plan complet et finançable : résumé exécutif, présentation du projet, étude de marché, stratégie commerciale, plan opérationnel, projections financières sur 3 ans et analyse de rentabilité. Adapté aux exigences des banques et investisseurs. Pour porteurs de projets en recherche de financement. À partir de 200 000 FCFA.",
  },
  {
    slug: "conseil-redaction-projet",
    name: "Rédaction de Projets & Dossiers Techniques",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Rédaction professionnelle de projets, dossiers de candidature et documents techniques : notes conceptuelles, propositions de projets ONG, dossiers d'appels d'offres, rapports d'activités et plans stratégiques. Pour organisations et entrepreneurs devant produire des documents convaincants pour des bailleurs, partenaires ou clients. À partir de 150 000 FCFA.",
  },
  {
    slug: "conseil-strategie-developpement",
    name: "Conseil Stratégique & Plan de Développement",
    pricingType: "SERVICE",
    price: 350000,
    rate: 10,
    siteUrl: BASE,
    description: "Accompagnement stratégique pour définir la vision, les objectifs et la feuille de route de votre entreprise : diagnostic stratégique, analyse PESTEL/SWOT, définition des axes de développement et plan d'action sur 3 ans. Pour dirigeants souhaitant prendre du recul et construire une stratégie claire et actionnable. À partir de 350 000 FCFA.",
  },

  // ── Recherche de Financement ──────────────────────────────────────────
  {
    slug: "conseil-accompagnement-financement",
    name: "Accompagnement Recherche de Financement",
    pricingType: "SERVICE",
    price: 175000,
    rate: 10,
    siteUrl: BASE,
    description: "Accompagnement complet pour l'obtention d'un financement : identification des sources adaptées (banques, fonds, subventions, investisseurs), constitution du dossier de financement, préparation du pitch, mise en relation et suivi des négociations. Pour porteurs de projets et PME en besoin de financement (crédit, capital, subvention). À partir de 175 000 FCFA.",
  },
  {
    slug: "conseil-dossier-credit-bancaire",
    name: "Montage Dossier de Crédit Bancaire",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Préparation et montage de votre dossier de demande de crédit bancaire : business plan financier, garanties, projections de remboursement et présentation aux établissements bancaires partenaires. Pour entrepreneurs et PME souhaitant obtenir un financement bancaire avec un dossier solide et convaincant. À partir de 100 000 FCFA.",
  },
  {
    slug: "conseil-recherche-subventions",
    name: "Recherche de Subventions & Appels à Projets",
    pricingType: "SERVICE",
    price: 120000,
    rate: 10,
    siteUrl: BASE,
    description: "Veille et accompagnement pour l'obtention de subventions et financements non remboursables : identification des appels à projets, rédaction des candidatures, suivi et relances. Pour ONG, startups et PME souhaitant accéder à des fonds publics, programmes internationaux (AFD, Banque Mondiale, UE) et concours entrepreneuriaux. À partir de 120 000 FCFA.",
  },

  // ── Coaching & Développement ──────────────────────────────────────────
  {
    slug: "conseil-coaching-dirigeant",
    name: "Coaching de Dirigeant",
    pricingType: "SERVICE",
    price: 75000,
    rate: 12,
    siteUrl: BASE,
    description: "Accompagnement personnalisé du dirigeant : clarification de la vision, prise de décision, gestion du temps, leadership, équilibre vie pro/perso et dépassement des blocages. Séances individuelles d'1h30 avec plan d'action personnalisé. Pour entrepreneurs, cadres dirigeants et managers souhaitant progresser dans leur rôle et atteindre leurs objectifs. 75 000 FCFA/séance.",
  },
  {
    slug: "conseil-coaching-equipe",
    name: "Coaching d'Équipe & Team Building",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Accompagnement collectif de votre équipe : cohésion, communication interne, résolution de conflits, clarification des rôles et amélioration de la performance collective. Atelier d'une journée ou programme sur mesure. Pour managers et dirigeants souhaitant souder leur équipe et améliorer la collaboration. À partir de 150 000 FCFA.",
  },
  {
    slug: "conseil-coaching-entrepreneurial",
    name: "Coaching Entrepreneurial",
    pricingType: "SERVICE",
    price: 60000,
    rate: 12,
    siteUrl: BASE,
    description: "Accompagnement mensuel de l'entrepreneur dans le développement de son activité : validation de l'idée, structuration du modèle économique, premiers clients, gestion des difficultés et montée en compétences. Idéal pour les entrepreneurs en démarrage ou en phase de croissance souhaitant être guidés pas à pas. 60 000 FCFA/mois.",
  },

  // ── CV, Lettre de Motivation & Emploi ─────────────────────────────────
  {
    slug: "conseil-redaction-cv",
    name: "Rédaction CV Professionnel",
    pricingType: "SERVICE",
    price: 15000,
    rate: 15,
    siteUrl: BASE,
    description: "Création ou refonte de votre CV professionnel : mise en page soignée, mise en valeur de vos compétences et expériences, optimisation pour les recruteurs et les systèmes ATS. Livré en Word et PDF, prêt à envoyer. Pour tout professionnel souhaitant un CV percutant qui décroche des entretiens. 15 000 FCFA.",
  },
  {
    slug: "conseil-redaction-lettre-motivation",
    name: "Rédaction Lettre de Motivation",
    pricingType: "SERVICE",
    price: 10000,
    rate: 15,
    siteUrl: BASE,
    description: "Rédaction d'une lettre de motivation personnalisée et percutante, adaptée à l'offre et à l'entreprise ciblée. Mise en avant de votre valeur ajoutée et de votre motivation. Pour candidats souhaitant se démarquer dès la lecture de leur dossier. 10 000 FCFA.",
  },
  {
    slug: "conseil-pack-candidature",
    name: "Pack Candidature Complet (CV + Lettre + Préparation entretien)",
    pricingType: "SERVICE",
    price: 35000,
    rate: 15,
    siteUrl: BASE,
    description: "Pack complet pour maximiser vos chances d'embauche : CV professionnel, lettre de motivation personnalisée et séance de préparation aux entretiens (questions fréquentes, posture, pitch de présentation). Pour candidats souhaitant mettre toutes les chances de leur côté. 35 000 FCFA.",
  },

  // ── Insertion Professionnelle & Accompagnement Emploi ─────────────────
  {
    slug: "conseil-assistance-recherche-emploi",
    name: "Assistance à la Recherche d'Emploi",
    pricingType: "SERVICE",
    price: 30000,
    rate: 15,
    siteUrl: BASE,
    description: "Accompagnement mensuel dans votre recherche d'emploi : stratégie de candidature, activation du réseau, veille des offres, relecture des candidatures, préparation aux entretiens et suivi hebdomadaire. Pour demandeurs d'emploi souhaitant accélérer leur retour à l'emploi avec un accompagnement professionnel. 30 000 FCFA/mois.",
  },
  {
    slug: "conseil-insertion-professionnelle",
    name: "Programme d'Insertion Professionnelle",
    pricingType: "SERVICE",
    price: 75000,
    rate: 12,
    siteUrl: BASE,
    description: "Programme complet d'insertion professionnelle sur 3 mois : bilan de compétences, définition du projet professionnel, CV et lettre de motivation, préparation aux entretiens, mise en réseau et accompagnement jusqu'au placement. Pour jeunes diplômés, reconvertis et demandeurs d'emploi souhaitant une insertion rapide et durable. 75 000 FCFA.",
  },
  {
    slug: "conseil-bilan-competences",
    name: "Bilan de Compétences",
    pricingType: "SERVICE",
    price: 50000,
    rate: 12,
    siteUrl: BASE,
    description: "Bilan approfondi de vos compétences, aptitudes et motivations : identification de vos points forts, axes de développement et pistes d'évolution professionnelle. Livré avec un rapport de synthèse et un plan d'action personnalisé. Pour salariés en reconversion, cadres en transition et professionnels souhaitant évoluer. 50 000 FCFA.",
  },
  {
    slug: "conseil-orientation-professionnelle",
    name: "Conseil en Orientation & Évolution Professionnelle",
    pricingType: "SERVICE",
    price: 25000,
    rate: 12,
    siteUrl: BASE,
    description: "Séance d'orientation professionnelle : clarification de vos objectifs de carrière, identification des secteurs porteurs, conseils sur les formations à suivre et stratégie de montée en compétences. Pour étudiants, jeunes professionnels et personnes en questionnement sur leur avenir professionnel. 25 000 FCFA.",
  },

  // ── Recommandation & Réseau ───────────────────────────────────────────
  {
    slug: "conseil-lettre-recommandation",
    name: "Rédaction Lettre de Recommandation",
    pricingType: "SERVICE",
    price: 15000,
    rate: 15,
    siteUrl: BASE,
    description: "Rédaction d'une lettre de recommandation professionnelle percutante valorisant les compétences, le sérieux et les réalisations du candidat. Adaptée aux candidatures à l'emploi, aux admissions universitaires ou aux appels à projets. 15 000 FCFA.",
  },
  {
    slug: "conseil-mise-en-reseau",
    name: "Mise en Réseau & Recommandation Professionnelle",
    pricingType: "SERVICE",
    price: 20000,
    rate: 15,
    siteUrl: BASE,
    description: "Activation du réseau professionnel IBIG PARTNERS pour faciliter la mise en relation avec des employeurs, partenaires, investisseurs ou donneurs d'ordre. Recommandation directe auprès des entreprises partenaires du groupe. Pour professionnels et entrepreneurs souhaitant bénéficier d'introductions à fort potentiel. 20 000 FCFA.",
  },

  // ── Services Complémentaires ──────────────────────────────────────────
  {
    slug: "conseil-accompagnement-marches-publics",
    name: "Accompagnement Marchés Publics",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Assistance complète pour soumissionner aux marchés publics : veille des appels d'offres, constitution et vérification du dossier administratif, rédaction de l'offre technique et financière, dépôt et suivi. Pour entreprises souhaitant accéder à la commande publique en Côte d'Ivoire. À partir de 150 000 FCFA.",
  },
  {
    slug: "conseil-domiciliation-entreprise",
    name: "Domiciliation d'Entreprise",
    pricingType: "SERVICE",
    price: 20000,
    rate: 10,
    siteUrl: BASE,
    description: "Domiciliation légale de votre entreprise à une adresse professionnelle reconnue : réception du courrier, attestation de domiciliation fournie pour les formalités administratives. Pour entrepreneurs souhaitant créer leur entreprise sans local propre ou désirant une adresse professionnelle à moindre coût. 20 000 FCFA/mois.",
  },
  {
    slug: "conseil-mediation-contentieux",
    name: "Médiation & Gestion de Contentieux",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Accompagnement dans la résolution amiable de litiges commerciaux, sociaux ou partenariaux : médiation, négociation, rédaction de protocoles d'accord et suivi de l'exécution. Pour entreprises souhaitant régler leurs différends rapidement et sans recours judiciaire coûteux. À partir de 100 000 FCFA.",
  },
];

export async function POST() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const branch = await prisma.branch.findUnique({ where: { slug: "ibig-conseil-plus" } });
  if (!branch) {
    return NextResponse.json(
      { error: "Branche IBIG CONSEIL+ introuvable. Synchronisez d'abord les branches." },
      { status: 404 }
    );
  }

  const knownSlugs = CONSEIL_PRODUCTS.map((p) => p.slug);

  const deleted = await prisma.product.deleteMany({
    where: {
      branchId: branch.id,
      slug: { notIn: knownSlugs },
      sales: { none: {} },
    },
  });

  let upserted = 0;
  for (const p of CONSEIL_PRODUCTS) {
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
    message: `${upserted} services IBIG CONSEIL+ synchronisés, ${deleted.count} doublon(s) supprimé(s).`,
  });
}

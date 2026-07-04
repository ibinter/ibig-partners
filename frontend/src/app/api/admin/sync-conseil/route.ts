import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BASE = "https://intermark-business.com/conseil";

const CONSEIL_PRODUCTS = [
  // â”€â”€ ComptabilitÃ© & Gestion FinanciÃ¨re â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "conseil-compta-tpe-pme",
    name: "Gestion Comptable TPE/PME",
    pricingType: "SERVICE",
    price: 50000,
    rate: 10,
    siteUrl: BASE,
    description: "Externalisation de la comptabilitÃ© pour TPE et PME : saisie des piÃ¨ces comptables, rapprochements bancaires, Ã©tats financiers mensuels conformes SYSCOHADA, suivi de trÃ©sorerie et prÃ©paration de la dÃ©claration fiscale annuelle. Pour dirigeants souhaitant une comptabilitÃ© fiable sans recruter un comptable Ã  plein temps. Ã€ partir de 50 000 FCFA/mois.",
  },
  {
    slug: "conseil-compta-ong",
    name: "Gestion Comptable ONG & Associations",
    pricingType: "SERVICE",
    price: 60000,
    rate: 10,
    siteUrl: BASE,
    description: "Tenue de la comptabilitÃ© spÃ©cifique aux ONG et associations : comptabilitÃ© par projet (SYCEBNL), rapports financiers bailleurs, suivi des subventions, justification des dÃ©penses et prÃ©paration des audits. Pour coordinateurs et directeurs d'ONG souhaitant des comptes transparents et conformes aux exigences des bailleurs. Ã€ partir de 60 000 FCFA/mois.",
  },
  {
    slug: "conseil-bilan-fiscal",
    name: "Bilan Annuel & DÃ©clarations Fiscales",
    pricingType: "SERVICE",
    price: 120000,
    rate: 10,
    siteUrl: BASE,
    description: "Ã‰tablissement du bilan annuel et des dÃ©clarations fiscales obligatoires : Ã©tats financiers SYSCOHADA, liasse fiscale, dÃ©claration de rÃ©sultat, dÃ©clarations TVA et autres impÃ´ts. Pour toute entreprise souhaitant Ãªtre en rÃ¨gle avec le fisc et Ã©viter les pÃ©nalitÃ©s. Ã€ partir de 120 000 FCFA selon la taille de la structure.",
  },
  {
    slug: "conseil-tableau-bord-financier",
    name: "Tableau de Bord Financier & Reporting",
    pricingType: "SERVICE",
    price: 80000,
    rate: 10,
    siteUrl: BASE,
    description: "Conception et suivi d'un tableau de bord financier personnalisÃ© : indicateurs clÃ©s (CA, marges, trÃ©sorerie, dettes), alertes et rapports mensuels de pilotage. Pour dirigeants souhaitant suivre leur performance financiÃ¨re en temps rÃ©el et prendre de meilleures dÃ©cisions. Ã€ partir de 80 000 FCFA.",
  },

  // â”€â”€ CrÃ©ation & Structuration d'Entreprise â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "conseil-creation-entreprise",
    name: "CrÃ©ation d'Entreprise ClÃ© en Main",
    pricingType: "SERVICE",
    price: 150000,
    rate: 12,
    siteUrl: BASE,
    description: "Accompagnement complet Ã  la crÃ©ation d'entreprise : choix du statut juridique (SARL, SAS, SA, EIâ€¦), rÃ©daction des statuts, immatriculation au RCCM, obtention du compte contribuable, NCC, CNPS et compte bancaire professionnel. Pour porteurs de projets souhaitant crÃ©er leur entreprise rapidement et en toute lÃ©galitÃ©. Ã€ partir de 150 000 FCFA.",
  },
  {
    slug: "conseil-structuration-entreprise",
    name: "Structuration & Organisation d'Entreprise",
    pricingType: "SERVICE",
    price: 200000,
    rate: 10,
    siteUrl: BASE,
    description: "Diagnostic et restructuration de votre organisation : dÃ©finition des fonctions, rÃ©daction des fiches de poste, Ã©laboration des procÃ©dures internes, organigramme, manuel de procÃ©dures et rÃ¨glement intÃ©rieur. Pour entreprises en croissance souhaitant formaliser leur fonctionnement et prÃ©parer une montÃ©e en puissance. Ã€ partir de 200 000 FCFA.",
  },
  {
    slug: "conseil-audit-organisationnel",
    name: "Audit Organisationnel",
    pricingType: "SERVICE",
    price: 250000,
    rate: 10,
    siteUrl: BASE,
    description: "Diagnostic complet du fonctionnement de votre entreprise : analyse des processus, identification des dysfonctionnements, Ã©valuation des risques organisationnels, benchmarking et plan d'action correctif. LivrÃ© sous forme de rapport d'audit avec recommandations priorisÃ©es. Pour dirigeants souhaitant optimiser leur organisation et amÃ©liorer leur performance. Ã€ partir de 250 000 FCFA.",
  },
  {
    slug: "conseil-modification-statuts",
    name: "Modification de Statuts & FormalitÃ©s Juridiques",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Gestion des modifications statutaires et formalitÃ©s juridiques : changement de dÃ©nomination, transfert de siÃ¨ge, augmentation de capital, cession de parts, nomination de gÃ©rant et dÃ©pÃ´t au RCCM. Pour entreprises devant effectuer des changements juridiques sans se perdre dans les dÃ©marches administratives. Ã€ partir de 100 000 FCFA.",
  },

  // â”€â”€ Ã‰tudes & Conseil StratÃ©gique â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "conseil-etude-marche",
    name: "Ã‰tude de MarchÃ©",
    pricingType: "SERVICE",
    price: 300000,
    rate: 10,
    siteUrl: BASE,
    description: "RÃ©alisation d'une Ã©tude de marchÃ© professionnelle : analyse de la demande, Ã©tude de la concurrence, segmentation, analyse SWOT, opportunitÃ©s et recommandations stratÃ©giques. LivrÃ©e avec rapport complet et prÃ©sentation. Pour porteurs de projets, investisseurs et entreprises souhaitant valider un marchÃ© avant de se lancer. Ã€ partir de 300 000 FCFA.",
  },
  {
    slug: "conseil-business-plan",
    name: "RÃ©daction de Business Plan",
    pricingType: "SERVICE",
    price: 200000,
    rate: 10,
    siteUrl: BASE,
    description: "Ã‰laboration d'un business plan complet et finanÃ§able : rÃ©sumÃ© exÃ©cutif, prÃ©sentation du projet, Ã©tude de marchÃ©, stratÃ©gie commerciale, plan opÃ©rationnel, projections financiÃ¨res sur 3 ans et analyse de rentabilitÃ©. AdaptÃ© aux exigences des banques et investisseurs. Pour porteurs de projets en recherche de financement. Ã€ partir de 200 000 FCFA.",
  },
  {
    slug: "conseil-redaction-projet",
    name: "RÃ©daction de Projets & Dossiers Techniques",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "RÃ©daction professionnelle de projets, dossiers de candidature et documents techniques : notes conceptuelles, propositions de projets ONG, dossiers d'appels d'offres, rapports d'activitÃ©s et plans stratÃ©giques. Pour organisations et entrepreneurs devant produire des documents convaincants pour des bailleurs, partenaires ou clients. Ã€ partir de 150 000 FCFA.",
  },
  {
    slug: "conseil-strategie-developpement",
    name: "Conseil StratÃ©gique & Plan de DÃ©veloppement",
    pricingType: "SERVICE",
    price: 350000,
    rate: 10,
    siteUrl: BASE,
    description: "Accompagnement stratÃ©gique pour dÃ©finir la vision, les objectifs et la feuille de route de votre entreprise : diagnostic stratÃ©gique, analyse PESTEL/SWOT, dÃ©finition des axes de dÃ©veloppement et plan d'action sur 3 ans. Pour dirigeants souhaitant prendre du recul et construire une stratÃ©gie claire et actionnable. Ã€ partir de 350 000 FCFA.",
  },

  // â”€â”€ Recherche de Financement â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "conseil-accompagnement-financement",
    name: "Accompagnement Recherche de Financement",
    pricingType: "SERVICE",
    price: 175000,
    rate: 10,
    siteUrl: BASE,
    description: "Accompagnement complet pour l'obtention d'un financement : identification des sources adaptÃ©es (banques, fonds, subventions, investisseurs), constitution du dossier de financement, prÃ©paration du pitch, mise en relation et suivi des nÃ©gociations. Pour porteurs de projets et PME en besoin de financement (crÃ©dit, capital, subvention). Ã€ partir de 175 000 FCFA.",
  },
  {
    slug: "conseil-dossier-credit-bancaire",
    name: "Montage Dossier de CrÃ©dit Bancaire",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "PrÃ©paration et montage de votre dossier de demande de crÃ©dit bancaire : business plan financier, garanties, projections de remboursement et prÃ©sentation aux Ã©tablissements bancaires partenaires. Pour entrepreneurs et PME souhaitant obtenir un financement bancaire avec un dossier solide et convaincant. Ã€ partir de 100 000 FCFA.",
  },
  {
    slug: "conseil-recherche-subventions",
    name: "Recherche de Subventions & Appels Ã  Projets",
    pricingType: "SERVICE",
    price: 120000,
    rate: 10,
    siteUrl: BASE,
    description: "Veille et accompagnement pour l'obtention de subventions et financements non remboursables : identification des appels Ã  projets, rÃ©daction des candidatures, suivi et relances. Pour ONG, startups et PME souhaitant accÃ©der Ã  des fonds publics, programmes internationaux (AFD, Banque Mondiale, UE) et concours entrepreneuriaux. Ã€ partir de 120 000 FCFA.",
  },

  // â”€â”€ Coaching & DÃ©veloppement â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "conseil-coaching-dirigeant",
    name: "Coaching de Dirigeant",
    pricingType: "SERVICE",
    price: 75000,
    rate: 12,
    siteUrl: BASE,
    description: "Accompagnement personnalisÃ© du dirigeant : clarification de la vision, prise de dÃ©cision, gestion du temps, leadership, Ã©quilibre vie pro/perso et dÃ©passement des blocages. SÃ©ances individuelles d'1h30 avec plan d'action personnalisÃ©. Pour entrepreneurs, cadres dirigeants et managers souhaitant progresser dans leur rÃ´le et atteindre leurs objectifs. 75 000 FCFA/sÃ©ance.",
  },
  {
    slug: "conseil-coaching-equipe",
    name: "Coaching d'Ã‰quipe & Team Building",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Accompagnement collectif de votre Ã©quipe : cohÃ©sion, communication interne, rÃ©solution de conflits, clarification des rÃ´les et amÃ©lioration de la performance collective. Atelier d'une journÃ©e ou programme sur mesure. Pour managers et dirigeants souhaitant souder leur Ã©quipe et amÃ©liorer la collaboration. Ã€ partir de 150 000 FCFA.",
  },
  {
    slug: "conseil-coaching-entrepreneurial",
    name: "Coaching Entrepreneurial",
    pricingType: "SERVICE",
    price: 60000,
    rate: 12,
    siteUrl: BASE,
    description: "Accompagnement mensuel de l'entrepreneur dans le dÃ©veloppement de son activitÃ© : validation de l'idÃ©e, structuration du modÃ¨le Ã©conomique, premiers clients, gestion des difficultÃ©s et montÃ©e en compÃ©tences. IdÃ©al pour les entrepreneurs en dÃ©marrage ou en phase de croissance souhaitant Ãªtre guidÃ©s pas Ã  pas. 60 000 FCFA/mois.",
  },

  // â”€â”€ CV, Lettre de Motivation & Emploi â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "conseil-redaction-cv",
    name: "RÃ©daction CV Professionnel",
    pricingType: "SERVICE",
    price: 15000,
    rate: 15,
    siteUrl: BASE,
    description: "CrÃ©ation ou refonte de votre CV professionnel : mise en page soignÃ©e, mise en valeur de vos compÃ©tences et expÃ©riences, optimisation pour les recruteurs et les systÃ¨mes ATS. LivrÃ© en Word et PDF, prÃªt Ã  envoyer. Pour tout professionnel souhaitant un CV percutant qui dÃ©croche des entretiens. 15 000 FCFA.",
  },
  {
    slug: "conseil-redaction-lettre-motivation",
    name: "RÃ©daction Lettre de Motivation",
    pricingType: "SERVICE",
    price: 10000,
    rate: 15,
    siteUrl: BASE,
    description: "RÃ©daction d'une lettre de motivation personnalisÃ©e et percutante, adaptÃ©e Ã  l'offre et Ã  l'entreprise ciblÃ©e. Mise en avant de votre valeur ajoutÃ©e et de votre motivation. Pour candidats souhaitant se dÃ©marquer dÃ¨s la lecture de leur dossier. 10 000 FCFA.",
  },
  {
    slug: "conseil-pack-candidature",
    name: "Pack Candidature Complet (CV + Lettre + PrÃ©paration entretien)",
    pricingType: "SERVICE",
    price: 35000,
    rate: 15,
    siteUrl: BASE,
    description: "Pack complet pour maximiser vos chances d'embauche : CV professionnel, lettre de motivation personnalisÃ©e et sÃ©ance de prÃ©paration aux entretiens (questions frÃ©quentes, posture, pitch de prÃ©sentation). Pour candidats souhaitant mettre toutes les chances de leur cÃ´tÃ©. 35 000 FCFA.",
  },

  // â”€â”€ Insertion Professionnelle & Accompagnement Emploi â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "conseil-assistance-recherche-emploi",
    name: "Assistance Ã  la Recherche d'Emploi",
    pricingType: "SERVICE",
    price: 30000,
    rate: 15,
    siteUrl: BASE,
    description: "Accompagnement mensuel dans votre recherche d'emploi : stratÃ©gie de candidature, activation du rÃ©seau, veille des offres, relecture des candidatures, prÃ©paration aux entretiens et suivi hebdomadaire. Pour demandeurs d'emploi souhaitant accÃ©lÃ©rer leur retour Ã  l'emploi avec un accompagnement professionnel. 30 000 FCFA/mois.",
  },
  {
    slug: "conseil-insertion-professionnelle",
    name: "Programme d'Insertion Professionnelle",
    pricingType: "SERVICE",
    price: 75000,
    rate: 12,
    siteUrl: BASE,
    description: "Programme complet d'insertion professionnelle sur 3 mois : bilan de compÃ©tences, dÃ©finition du projet professionnel, CV et lettre de motivation, prÃ©paration aux entretiens, mise en rÃ©seau et accompagnement jusqu'au placement. Pour jeunes diplÃ´mÃ©s, reconvertis et demandeurs d'emploi souhaitant une insertion rapide et durable. 75 000 FCFA.",
  },
  {
    slug: "conseil-bilan-competences",
    name: "Bilan de CompÃ©tences",
    pricingType: "SERVICE",
    price: 50000,
    rate: 12,
    siteUrl: BASE,
    description: "Bilan approfondi de vos compÃ©tences, aptitudes et motivations : identification de vos points forts, axes de dÃ©veloppement et pistes d'Ã©volution professionnelle. LivrÃ© avec un rapport de synthÃ¨se et un plan d'action personnalisÃ©. Pour salariÃ©s en reconversion, cadres en transition et professionnels souhaitant Ã©voluer. 50 000 FCFA.",
  },
  {
    slug: "conseil-orientation-professionnelle",
    name: "Conseil en Orientation & Ã‰volution Professionnelle",
    pricingType: "SERVICE",
    price: 25000,
    rate: 12,
    siteUrl: BASE,
    description: "SÃ©ance d'orientation professionnelle : clarification de vos objectifs de carriÃ¨re, identification des secteurs porteurs, conseils sur les formations Ã  suivre et stratÃ©gie de montÃ©e en compÃ©tences. Pour Ã©tudiants, jeunes professionnels et personnes en questionnement sur leur avenir professionnel. 25 000 FCFA.",
  },

  // â”€â”€ Recommandation & RÃ©seau â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "conseil-lettre-recommandation",
    name: "RÃ©daction Lettre de Recommandation",
    pricingType: "SERVICE",
    price: 15000,
    rate: 15,
    siteUrl: BASE,
    description: "RÃ©daction d'une lettre de recommandation professionnelle percutante valorisant les compÃ©tences, le sÃ©rieux et les rÃ©alisations du candidat. AdaptÃ©e aux candidatures Ã  l'emploi, aux admissions universitaires ou aux appels Ã  projets. 15 000 FCFA.",
  },
  {
    slug: "conseil-mise-en-reseau",
    name: "Mise en RÃ©seau & Recommandation Professionnelle",
    pricingType: "SERVICE",
    price: 20000,
    rate: 15,
    siteUrl: BASE,
    description: "Activation du rÃ©seau professionnel IBIG PARTNERS pour faciliter la mise en relation avec des employeurs, partenaires, investisseurs ou donneurs d'ordre. Recommandation directe auprÃ¨s des entreprises partenaires du groupe. Pour professionnels et entrepreneurs souhaitant bÃ©nÃ©ficier d'introductions Ã  fort potentiel. 20 000 FCFA.",
  },

  // â”€â”€ Services ComplÃ©mentaires â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "conseil-accompagnement-marches-publics",
    name: "Accompagnement MarchÃ©s Publics",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Assistance complÃ¨te pour soumissionner aux marchÃ©s publics : veille des appels d'offres, constitution et vÃ©rification du dossier administratif, rÃ©daction de l'offre technique et financiÃ¨re, dÃ©pÃ´t et suivi. Pour entreprises souhaitant accÃ©der Ã  la commande publique en CÃ´te d'Ivoire. Ã€ partir de 150 000 FCFA.",
  },
  {
    slug: "conseil-domiciliation-entreprise",
    name: "Domiciliation d'Entreprise",
    pricingType: "SERVICE",
    price: 20000,
    rate: 10,
    siteUrl: BASE,
    description: "Domiciliation lÃ©gale de votre entreprise Ã  une adresse professionnelle reconnue : rÃ©ception du courrier, attestation de domiciliation fournie pour les formalitÃ©s administratives. Pour entrepreneurs souhaitant crÃ©er leur entreprise sans local propre ou dÃ©sirant une adresse professionnelle Ã  moindre coÃ»t. 20 000 FCFA/mois.",
  },
  {
    slug: "conseil-mediation-contentieux",
    name: "MÃ©diation & Gestion de Contentieux",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Accompagnement dans la rÃ©solution amiable de litiges commerciaux, sociaux ou partenariaux : mÃ©diation, nÃ©gociation, rÃ©daction de protocoles d'accord et suivi de l'exÃ©cution. Pour entreprises souhaitant rÃ©gler leurs diffÃ©rends rapidement et sans recours judiciaire coÃ»teux. Ã€ partir de 100 000 FCFA.",
  },
];

export async function POST() {`n  try {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Non autorisÃ©" }, { status: 403 });
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
    message: `${upserted} services IBIG CONSEIL+ synchronisÃ©s, ${deleted.count} doublon(s) supprimÃ©(s).`,
  });
  } catch (err: any) {
    console.error("sync-conseil error:", err);
    return NextResponse.json({ error: err?.message ?? "Erreur serveur" }, { status: 500 });
  }
}

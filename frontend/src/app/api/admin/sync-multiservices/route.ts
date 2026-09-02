import { NextResponse } from "next/server";
import { isSyncAuthorized } from "@/lib/sync-auth";
import { syncBranchWithFeed } from "@/lib/catalog-feed";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BASE = "https://intermark-business.com/multiservices";

const MULTISERVICES_PRODUCTS = [
  // ── Événementiel ──────────────────────────────────────────────────────
  {
    slug: "multi-evenement-corporate",
    name: "Organisation Événement Corporate",
    pricingType: "SERVICE",
    price: 300000,
    rate: 10,
    siteUrl: BASE,
    description: "Organisation complète d'événements d'entreprise : séminaires, conférences, assemblées générales, team buildings, lancements de produits et galas. Prise en charge intégrale : lieu, logistique, traiteur, décoration, animation, technique son/lumière et coordination le jour J. Pour entreprises et institutions souhaitant marquer leurs événements. Sur devis à partir de 300 000 FCFA.",
  },
  {
    slug: "multi-evenement-prive",
    name: "Organisation Événement Privé (Mariage, Gala, Anniversaire)",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Organisation d'événements privés haut de gamme : mariages, baptêmes, anniversaires, soirées de gala et cérémonies. Coordination complète de A à Z : décoration, traiteur, DJ/animation, photographe, vidéaste et accueil des invités. Pour particuliers et familles souhaitant un événement inoubliable sans stress. Sur devis à partir de 150 000 FCFA.",
  },
  {
    slug: "multi-location-materiel-evenementiel",
    name: "Location Matériel Événementiel",
    pricingType: "SERVICE",
    price: 50000,
    rate: 10,
    siteUrl: BASE,
    description: "Location de matériel pour événements : tentes, tables, chaises, nappes, podiums, sono, vidéoprojecteurs, éclairages et mobilier de réception. Livraison, installation et reprise incluses. Pour organisateurs d'événements, entreprises et particuliers. À partir de 50 000 FCFA selon le matériel.",
  },
  {
    slug: "multi-sono-dj-eclairage",
    name: "Sonorisation, DJ & Éclairage Événement",
    pricingType: "SERVICE",
    price: 75000,
    rate: 10,
    siteUrl: BASE,
    description: "Prestation complète son, lumière et animation musicale pour vos événements : installation de sono professionnelle, DJ expérimenté, jeux de lumières et light show. Pour mariages, soirées d'entreprise, anniversaires et galas. À partir de 75 000 FCFA selon la durée et le matériel.",
  },
  {
    slug: "multi-traiteur-evenementiel",
    name: "Traiteur & Restauration Événementielle",
    pricingType: "SERVICE",
    price: 0,
    rate: 10,
    siteUrl: BASE,
    description: "Service traiteur professionnel pour tous vos événements : buffets froids ou chauds, cocktails dînatoires, repas assis, petits-déjeuners d'affaires et plateaux-repas. Cuisine africaine, internationale et fusion. Personnalisation du menu selon vos souhaits et contraintes alimentaires. Tarif sur devis selon le nombre de convives — fourchette indicative : 5 000 à 15 000 FCFA/convive.",
  },
  {
    slug: "multi-photo-video-evenementielle",
    name: "Photographie & Vidéographie Événementielle",
    pricingType: "SERVICE",
    price: 80000,
    rate: 10,
    siteUrl: BASE,
    description: "Couverture photo et vidéo professionnelle de vos événements : mariages, séminaires, conférences, lancements et cérémonies. Remise des fichiers retouchés sous 7 jours, film souvenir de 3 à 5 minutes et album numérique inclus. Pour particuliers et entreprises souhaitant garder un souvenir de qualité. À partir de 80 000 FCFA.",
  },
  {
    slug: "multi-impression-baches-signalétique",
    name: "Impression & Signalétique Événementielle",
    pricingType: "SERVICE",
    price: 20000,
    rate: 10,
    siteUrl: BASE,
    description: "Impression et mise en place de supports de communication événementielle : bâches, kakémonos, roll-up, banderoles, flyers, programmes et badges. Fabrication rapide, livraison et installation sur site incluses. Pour entreprises, associations et particuliers organisant des événements. À partir de 20 000 FCFA.",
  },

  // ── Accueil VIP & Protocole ───────────────────────────────────────────
  {
    slug: "multi-accueil-vip",
    name: "Accueil VIP & Services Protocolaires",
    pricingType: "SERVICE",
    price: 75000,
    rate: 10,
    siteUrl: BASE,
    description: "Services d'accueil VIP pour dignitaires, délégations et personnalités : hôtesses protocolaires, assistance aéroport, coordination des arrivées, gestion du carnet d'adresses et accompagnement personnalisé tout au long du séjour. Pour entreprises, ambassades et organisateurs d'événements recevant des invités de marque. À partir de 75 000 FCFA.",
  },
  {
    slug: "multi-hotesses-accueil",
    name: "Hôtesses d'Accueil & Animation Stand",
    pricingType: "SERVICE",
    price: 35000,
    rate: 10,
    siteUrl: BASE,
    description: "Mise à disposition d'hôtesses et hôtes professionnels pour salons, foires, conférences, stands et événements corporates : accueil, orientation, remise de badges, distribution de supports et représentation de marque. Formation et briefing inclus. Pour entreprises participant à des salons ou organisant des événements. À partir de 35 000 FCFA/jour.",
  },
  {
    slug: "multi-interpretation-traduction",
    name: "Interprétariat & Traduction (Événements & Documents)",
    pricingType: "SERVICE",
    price: 50000,
    rate: 10,
    siteUrl: BASE,
    description: "Services d'interprétariat simultané ou consécutif pour conférences, réunions d'affaires et délégations internationales. Traduction de documents officiels, contrats et rapports (français, anglais, arabe et autres langues). Pour entreprises, ambassades et organisateurs d'événements internationaux. À partir de 50 000 FCFA/jour.",
  },

  // ── Déménagement & Transport ──────────────────────────────────────────
  {
    slug: "multi-demenagement-particuliers",
    name: "Déménagement Particuliers",
    pricingType: "SERVICE",
    price: 80000,
    rate: 10,
    siteUrl: BASE,
    description: "Service de déménagement complet pour particuliers : emballage soigneux des effets personnels, démontage et remontage des meubles, chargement, transport sécurisé et déchargement dans votre nouveau logement. Équipe professionnelle, véhicules adaptés et assurance des biens incluse. À partir de 80 000 FCFA selon le volume.",
  },
  {
    slug: "multi-demenagement-entreprises",
    name: "Déménagement & Transfert de Bureaux",
    pricingType: "SERVICE",
    price: 200000,
    rate: 10,
    siteUrl: BASE,
    description: "Déménagement professionnel de bureaux, entrepôts et locaux commerciaux : démontage et remontage du mobilier de bureau, transport sécurisé du matériel informatique, archivage et réinstallation complète dans les nouveaux locaux. Intervention en dehors des heures ouvrables possible. Sur devis à partir de 200 000 FCFA.",
  },
  {
    slug: "multi-debarras-vide-maison",
    name: "Débarras & Vide Maison",
    pricingType: "SERVICE",
    price: 50000,
    rate: 10,
    siteUrl: BASE,
    description: "Service de débarras complet : enlèvement de meubles, d'encombrants, de vieux équipements et de tout ce que vous souhaitez évacuer d'un logement, d'un bureau ou d'un entrepôt. Tri, recyclage et évacuation propre inclus. Pour particuliers en fin de bail, héritiers et entreprises changeant de locaux. À partir de 50 000 FCFA.",
  },
  {
    slug: "multi-transport-marchandises",
    name: "Transport & Livraison de Marchandises",
    pricingType: "SERVICE",
    price: 30000,
    rate: 10,
    siteUrl: BASE,
    description: "Transport et livraison de marchandises, colis et équipements en Côte d'Ivoire et dans la sous-région : camionnettes, camions et véhicules frigorifiques disponibles. Livraison express possible. Pour entreprises, commerçants et particuliers ayant des besoins ponctuels ou réguliers de transport. À partir de 30 000 FCFA.",
  },
  {
    slug: "multi-location-vehicules",
    name: "Location de Véhicules (sans chauffeur)",
    pricingType: "SERVICE",
    price: 25000,
    rate: 10,
    siteUrl: BASE,
    description: "Location de véhicules à la journée ou à la semaine : berlines, SUV, pick-up et utilitaires disponibles. Véhicules récents, assurés et entretenus. Pour particuliers, expatriés et entreprises ayant des besoins ponctuels de mobilité sans chauffeur. À partir de 25 000 FCFA/jour.",
  },

  // ── Nettoyage & Hygiène ───────────────────────────────────────────────
  {
    slug: "multi-nettoyage-locaux",
    name: "Nettoyage & Entretien de Locaux",
    pricingType: "SERVICE",
    price: 40000,
    rate: 10,
    siteUrl: BASE,
    description: "Service de nettoyage professionnel pour bureaux, commerces, résidences et sites industriels : nettoyage quotidien, hebdomadaire ou mensuel, entretien des sols, sanitaires et espaces communs, nettoyage de vitres et façades. Personnel formé, produits fournis. Pour entreprises et particuliers souhaitant un cadre propre et sain. À partir de 40 000 FCFA/mois.",
  },
  {
    slug: "multi-nettoyage-post-travaux",
    name: "Nettoyage de Fin de Chantier & Après Travaux",
    pricingType: "SERVICE",
    price: 50000,
    rate: 10,
    siteUrl: BASE,
    description: "Nettoyage complet de fin de chantier ou après travaux : enlèvement des gravats résiduels, dépoussiérage profond, nettoyage des vitres, sols, sanitaires et surfaces. Pour promoteurs, particuliers et entreprises BTP souhaitant livrer un chantier propre et prêt à habiter. À partir de 50 000 FCFA selon la surface.",
  },
  {
    slug: "multi-desinfection-3d",
    name: "Désinsectisation, Dératisation & Désinfection (3D)",
    pricingType: "SERVICE",
    price: 35000,
    rate: 10,
    siteUrl: BASE,
    description: "Traitement professionnel 3D pour logements, bureaux, restaurants et entrepôts : élimination des cafards, rats, fourmis, termites, moustiques et autres nuisibles. Produits homologués, intervention discrète et garantie de résultat. Pour particuliers, hôtels, restaurants et entreprises souhaitant un environnement sain. À partir de 35 000 FCFA.",
  },
  {
    slug: "multi-pressing-blanchisserie",
    name: "Pressing & Blanchisserie Professionnelle",
    pricingType: "SERVICE",
    price: 5000,
    rate: 10,
    siteUrl: BASE,
    description: "Service de pressing et blanchisserie de qualité : nettoyage à sec, lavage, séchage, repassage et livraison à domicile ou au bureau. Pour costumes, tenues de cérémonie, uniformes, nappes et rideaux. Ramassage et livraison disponibles. À partir de 5 000 FCFA par pièce selon le type de vêtement.",
  },
  {
    slug: "multi-entretien-piscine",
    name: "Entretien & Traitement de Piscine",
    pricingType: "SERVICE",
    price: 30000,
    rate: 10,
    siteUrl: BASE,
    description: "Entretien régulier de piscines privées et collectives : nettoyage du bassin, traitement de l'eau (pH, chlore), entretien du filtre, hivernage et remise en eau. Pour villas, résidences et hôtels souhaitant une piscine propre et sûre toute l'année. À partir de 30 000 FCFA/mois.",
  },

  // ── Maintenance & Dépannage ───────────────────────────────────────────
  {
    slug: "multi-maintenance-batiment",
    name: "Maintenance & Entretien de Bâtiment",
    pricingType: "SERVICE",
    price: 60000,
    rate: 10,
    siteUrl: BASE,
    description: "Contrat de maintenance mensuel pour bureaux, locaux commerciaux et résidences : plomberie, électricité, peinture, menuiserie, vitrerie et petits travaux d'entretien courant. Intervention rapide en cas de panne ou dégradation. Pour entreprises et propriétaires souhaitant un bâtiment toujours en bon état. À partir de 60 000 FCFA/mois.",
  },
  {
    slug: "multi-depannage-urgence",
    name: "Dépannage d'Urgence (Plomberie, Électricité, Serrurerie)",
    pricingType: "SERVICE",
    price: 25000,
    rate: 10,
    siteUrl: BASE,
    description: "Intervention d'urgence 24h/24 pour pannes et sinistres : fuite d'eau, panne électrique, serrurerie, vitre brisée, clim en panne. Techniciens qualifiés disponibles rapidement pour remettre en état votre habitation ou local professionnel. Pour particuliers et entreprises. À partir de 25 000 FCFA par intervention.",
  },
  {
    slug: "multi-installation-climatisation",
    name: "Installation, Entretien & Dépannage Climatisation",
    pricingType: "SERVICE",
    price: 0,
    rate: 10,
    siteUrl: BASE,
    description: "Service complet climatisation : fourniture et installation de climatiseurs split (toutes marques), entretien préventif semestriel, nettoyage des filtres, recharge de gaz et dépannage. Pour particuliers, bureaux et commerces souhaitant rester au frais avec un équipement en parfait état. Tarif sur devis selon la puissance — installation à partir de 80 000 FCFA.",
  },
  {
    slug: "multi-location-groupe-electrogene",
    name: "Location de Groupes Électrogènes",
    pricingType: "SERVICE",
    price: 50000,
    rate: 10,
    siteUrl: BASE,
    description: "Location de groupes électrogènes pour événements, chantiers et secours électrique : générateurs de 5 à 200 kVA disponibles, livraison, installation et opérateur inclus sur demande. Pour entreprises, organisateurs d'événements et chantiers BTP ayant besoin d'une alimentation électrique autonome. À partir de 50 000 FCFA/jour.",
  },
  {
    slug: "multi-jardinage-espaces-verts",
    name: "Jardinage & Entretien Espaces Verts",
    pricingType: "SERVICE",
    price: 30000,
    rate: 10,
    siteUrl: BASE,
    description: "Entretien régulier de jardins, cours et espaces verts : tonte de pelouse, taille des haies et arbustes, désherbage, arrosage et plantations. Pour particuliers, résidences et entreprises souhaitant des espaces extérieurs soignés toute l'année. À partir de 30 000 FCFA/mois.",
  },
  {
    slug: "multi-sécurité-incendie",
    name: "Sécurité Incendie & Équipements Anti-incendie",
    pricingType: "SERVICE",
    price: 40000,
    rate: 10,
    siteUrl: BASE,
    description: "Fourniture, installation et maintenance des équipements de sécurité incendie : extincteurs, détecteurs de fumée, plans d'évacuation et formation du personnel aux gestes de premiers secours. Conformité aux normes en vigueur. Pour entreprises et bâtiments recevant du public. À partir de 40 000 FCFA.",
  },

  // ── BTP & Travaux ─────────────────────────────────────────────────────
  {
    slug: "multi-travaux-renovation",
    name: "Travaux de Rénovation & Aménagement Intérieur",
    pricingType: "SERVICE",
    price: 200000,
    rate: 10,
    siteUrl: BASE,
    description: "Réalisation de travaux de rénovation et d'aménagement intérieur : peinture, carrelage, faux plafonds, cloisons, revêtements de sol, électricité et plomberie. Pour particuliers et entreprises souhaitant rénover ou aménager leur espace de vie ou de travail. Sur devis à partir de 200 000 FCFA selon l'ampleur des travaux.",
  },
  {
    slug: "multi-construction-batiment",
    name: "Construction & Génie Civil",
    pricingType: "SERVICE",
    price: 0,
    rate: 8,
    siteUrl: BASE,
    description: "Réalisation de projets de construction : maisons individuelles, immeubles, locaux commerciaux, entrepôts et infrastructures. Gestion complète du chantier : plans, permis de construire, approvisionnement en matériaux, main-d'œuvre qualifiée et suivi des travaux jusqu'à la réception. Tarif sur devis selon la nature et le volume du projet.",
  },
  {
    slug: "multi-amenagement-bureau",
    name: "Aménagement & Décoration de Bureaux",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Conception et aménagement de vos espaces de travail : plan d'aménagement, choix du mobilier, décoration intérieure, signalétique et mise en place complète. Pour entreprises emménageant dans de nouveaux locaux ou souhaitant moderniser leur espace de travail. Sur devis à partir de 150 000 FCFA.",
  },
  {
    slug: "multi-fourniture-mobilier",
    name: "Fourniture & Installation de Mobilier de Bureau",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Sourcing, livraison et installation de mobilier de bureau professionnel : bureaux, chaises ergonomiques, armoires, cloisons modulaires, salles de réunion et espaces de détente. Catalogue varié et prix compétitifs. Pour entreprises et administrations équipant ou rénovant leurs locaux. À partir de 100 000 FCFA.",
  },

  // ── Logistique ────────────────────────────────────────────────────────
  {
    slug: "multi-gestion-stock-logistique",
    name: "Gestion de Stock & Logistique Externalisée",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Externalisation de votre logistique : réception et stockage des marchandises, gestion des inventaires, préparation des commandes, expédition et retours. Pour e-commerces, importateurs et distributeurs souhaitant se concentrer sur leur cœur de métier sans gérer d'entrepôt. À partir de 100 000 FCFA/mois selon le volume.",
  },
  {
    slug: "multi-coursier-express",
    name: "Service Coursier Express",
    pricingType: "SERVICE",
    price: 5000,
    rate: 10,
    siteUrl: BASE,
    description: "Livraison express de documents, colis et courriers en ville : prise en charge sous 30 minutes, livraison dans la journée, accusé de réception et suivi en temps réel. Pour entreprises, cabinets d'avocats, administrations et particuliers ayant des envois urgents. À partir de 5 000 FCFA par livraison.",
  },
  {
    slug: "multi-livraison-domicile",
    name: "Service de Livraison à Domicile (e-commerce & commerces)",
    pricingType: "SERVICE",
    price: 2000,
    rate: 10,
    siteUrl: BASE,
    description: "Service de livraison à domicile pour e-commercants, boutiques et restaurants : collecte chez le commerçant, livraison au client final, gestion des retours et remontée de statut. Flotte disponible 7j/7 en ville et dans les quartiers périphériques. Pour commerces souhaitant proposer la livraison sans gérer leur propre flotte. À partir de 2 000 FCFA/livraison.",
  },

  // ── Tourisme & Hospitality ────────────────────────────────────────────
  {
    slug: "multi-organisation-voyage",
    name: "Organisation de Voyages & Séjours",
    pricingType: "SERVICE",
    price: 50000,
    rate: 10,
    siteUrl: BASE,
    description: "Planification et organisation complète de voyages : billets d'avion, hôtels, transferts, visas, assurance voyage et itinéraire personnalisé. Pour particuliers, familles et entreprises organisant des déplacements professionnels ou touristiques en Afrique et à l'international. Frais d'agence à partir de 50 000 FCFA.",
  },
  {
    slug: "multi-tourisme-affaires",
    name: "Tourisme d'Affaires & MICE",
    pricingType: "SERVICE",
    price: 200000,
    rate: 10,
    siteUrl: BASE,
    description: "Organisation de voyages d'affaires et d'événements MICE (Meetings, Incentives, Conferences, Exhibitions) : billets, hôtels, salles de conférence, activités de team building, gala dîners et transferts VIP. Pour entreprises organisant des déplacements d'équipes ou des événements professionnels à l'étranger. Sur devis à partir de 200 000 FCFA.",
  },
  {
    slug: "multi-chauffeur-prive",
    name: "Chauffeur Privé & Transport VIP",
    pricingType: "SERVICE",
    price: 30000,
    rate: 10,
    siteUrl: BASE,
    description: "Mise à disposition de chauffeurs privés professionnels pour transferts aéroport, déplacements en ville, mise à disposition à la journée et occasions spéciales. Véhicules climatisés, chauffeurs en tenue, ponctualité garantie. Pour particuliers, hommes d'affaires et entreprises accueillant des délégations. À partir de 30 000 FCFA.",
  },
  {
    slug: "multi-assistance-visa-formalites",
    name: "Assistance Visa & Formalités Administratives",
    pricingType: "SERVICE",
    price: 30000,
    rate: 10,
    siteUrl: BASE,
    description: "Accompagnement dans les démarches de visa et formalités administratives : constitution du dossier de visa Schengen, américain, canadien ou autre, apostille, légalisation de documents et traductions assermentées. Pour particuliers et entreprises souhaitant gagner du temps et éviter les refus de visa. À partir de 30 000 FCFA selon la destination.",
  },

  // ── Sécurité & Gardiennage ────────────────────────────────────────────
  {
    slug: "multi-gardiennage-securite",
    name: "Gardiennage & Sécurité",
    pricingType: "SERVICE",
    price: 80000,
    rate: 10,
    siteUrl: BASE,
    description: "Services de gardiennage et de sécurité pour résidences, entreprises, chantiers et événements : agents de sécurité formés, rondes de surveillance, contrôle d'accès et intervention rapide. Pour particuliers et entreprises souhaitant sécuriser leurs biens et personnes. À partir de 80 000 FCFA/mois.",
  },
  {
    slug: "multi-telesurveillance",
    name: "Télésurveillance & Installation Caméras",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Fourniture et installation de systèmes de vidéosurveillance et de télésurveillance : caméras IP intérieures et extérieures, enregistreur DVR/NVR, accès à distance depuis smartphone et intervention sur alarme. Pour résidences, commerces et entreprises souhaitant sécuriser leurs locaux 24h/24. À partir de 100 000 FCFA pour l'installation.",
  },

  // ── Services à la personne & Aide à domicile ──────────────────────────
  {
    slug: "multi-aide-domicile",
    name: "Aide à Domicile & Soins aux Personnes Âgées",
    pricingType: "SERVICE",
    price: 40000,
    rate: 10,
    siteUrl: BASE,
    description: "Services d'aide à domicile pour personnes âgées, dépendantes ou en convalescence : aide au lever, habillage, préparation des repas, compagnie, accompagnement aux rendez-vous médicaux et entretien du logement. Pour familles souhaitant maintenir leurs proches à domicile dans les meilleures conditions. À partir de 40 000 FCFA/mois.",
  },
  {
    slug: "multi-garde-enfants",
    name: "Garde d'Enfants & Nounou à Domicile",
    pricingType: "SERVICE",
    price: 35000,
    rate: 10,
    siteUrl: BASE,
    description: "Placement de nounous et baby-sitters qualifiés à domicile : garde régulière, garde ponctuelle, aide aux devoirs et activités éducatives. Personnel sélectionné, formé aux premiers secours et aux gestes d'urgence. Pour familles avec enfants en bas âge ou en âge scolaire. À partir de 35 000 FCFA/mois.",
  },
  {
    slug: "multi-courses-commissions",
    name: "Service de Courses & Commissions",
    pricingType: "SERVICE",
    price: 5000,
    rate: 10,
    siteUrl: BASE,
    description: "Service de courses et de commissions pour particuliers et professionnels : achats alimentaires, dépôt et retrait de documents administratifs, courses diverses, files d'attente et livraison à domicile. Pratique pour personnes occupées, expatriés ou à mobilité réduite. À partir de 5 000 FCFA par course.",
  },
  {
    slug: "multi-soins-infirmiers-domicile",
    name: "Soins Infirmiers à Domicile",
    pricingType: "SERVICE",
    price: 15000,
    rate: 10,
    siteUrl: BASE,
    description: "Soins infirmiers à domicile par du personnel qualifié : pansements, injections, prises de sang, suivi post-opératoire, perfusions et soins de plaies. Sur prescription médicale ou à la demande. Pour patients en convalescence, personnes âgées et familles souhaitant éviter les déplacements en clinique. À partir de 15 000 FCFA par visite.",
  },

  // ── Placement de Personnel & Intérim ─────────────────────────────────
  {
    slug: "multi-placement-ouvriers",
    name: "Placement d'Ouvriers & Personnel de Chantier",
    pricingType: "SERVICE",
    price: 30000,
    rate: 10,
    siteUrl: BASE,
    description: "Recrutement et placement d'ouvriers qualifiés et non qualifiés pour chantiers BTP, industries et sites de production : maçons, carreleurs, peintres, électriciens, plombiers, manœuvres et gardiens de chantier. Vérification des compétences, contrats et formalités inclus. Pour entreprises de BTP, promoteurs et maîtres d'ouvrage. À partir de 30 000 FCFA par placement.",
  },
  {
    slug: "multi-placement-personnel-domestique",
    name: "Placement Personnel Domestique",
    pricingType: "SERVICE",
    price: 25000,
    rate: 10,
    siteUrl: BASE,
    description: "Recrutement et placement de personnel domestique vérifié : femmes de ménage, cuisiniers, nounous, jardiniers, gardiens et chauffeurs personnels. Vérification des antécédents, entretien de présélection et suivi post-placement. Pour familles et expatriés souhaitant un personnel de confiance et fiable. À partir de 25 000 FCFA par placement.",
  },
  {
    slug: "multi-mise-a-disposition-personnel",
    name: "Mise à Disposition de Personnel Temporaire (Intérim)",
    pricingType: "SERVICE",
    price: 80000,
    rate: 10,
    siteUrl: BASE,
    description: "Mise à disposition de personnel temporaire pour renforcer vos équipes : agents de saisie, assistants administratifs, opérateurs de production, agents d'accueil, manutentionnaires et techniciens. Contrats gérés par IBIG MULTISERVICES, personnel disponible sous 48h. Pour entreprises en pic d'activité ou en remplacement d'effectifs. À partir de 80 000 FCFA/mois par agent.",
  },
  {
    slug: "multi-placement-emplois-qualifies",
    name: "Placement Emplois Qualifiés & Cadres",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Recrutement et placement de profils qualifiés et cadres : comptables, gestionnaires, commerciaux, informaticiens, ingénieurs et responsables de département. Présélection rigoureuse, tests de compétences et accompagnement jusqu'à l'intégration. Pour entreprises et ONG cherchant des profils compétents rapidement. À partir de 100 000 FCFA par recrutement.",
  },
  {
    slug: "multi-externalisation-rh",
    name: "Externalisation RH & Gestion de la Paie",
    pricingType: "SERVICE",
    price: 50000,
    rate: 10,
    siteUrl: BASE,
    description: "Externalisation complète des fonctions RH et paie : établissement des bulletins de salaire, déclarations CNPS et DIPE, gestion des congés, suivi des contrats et conseil en droit du travail. Pour TPE et PME souhaitant déléguer leur RH à des professionnels sans recruter un DRH. À partir de 50 000 FCFA/mois.",
  },
  {
    slug: "multi-formation-personnel",
    name: "Formation & Renforcement de Capacités du Personnel",
    pricingType: "SERVICE",
    price: 75000,
    rate: 10,
    siteUrl: BASE,
    description: "Conception et animation de formations sur mesure pour vos équipes : accueil et relation client, techniques de vente, gestion du temps, hygiène et sécurité au travail, informatique bureautique. En présentiel dans vos locaux ou en externe. Pour entreprises souhaitant monter en compétences leurs collaborateurs. À partir de 75 000 FCFA par session.",
  },
];

export async function POST() {
  try {
    if (!(await isSyncAuthorized())) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const result = await syncBranchWithFeed("ibig-multiservices", "IBIG MULTISERVICES", MULTISERVICES_PRODUCTS, { notify: true });
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
      message: `${diff.total} produits IBIG MULTISERVICES synchronisés (${diff.added.length} nouveau(x), ${diff.updated.length} mis à jour, ${diff.removed} retiré(s)).`,
    });
  } catch (err: any) {
    console.error("sync-multiservices error:", err);
    return NextResponse.json({ error: err?.message ?? "Erreur serveur" }, { status: 500 });
  }
}

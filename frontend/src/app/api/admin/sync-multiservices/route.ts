import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
    name: "Organisation Événement Privé",
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

  // ── Accueil VIP & Protocol ────────────────────────────────────────────
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
    name: "Hôtesses d'Accueil & Animation",
    pricingType: "SERVICE",
    price: 35000,
    rate: 10,
    siteUrl: BASE,
    description: "Mise à disposition d'hôtesses et hôtes professionnels pour salons, foires, conférences, stands et événements corporates : accueil, orientation, remise de badges, distribution de supports et représentation de marque. Formation et briefing inclus. Pour entreprises participant à des salons ou organisant des événements. À partir de 35 000 FCFA/jour.",
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
    slug: "multi-transport-marchandises",
    name: "Transport & Livraison de Marchandises",
    pricingType: "SERVICE",
    price: 30000,
    rate: 10,
    siteUrl: BASE,
    description: "Transport et livraison de marchandises, colis et équipements en Côte d'Ivoire et dans la sous-région : camionnettes, camions et véhicules frigorifiques disponibles. Livraison express possible. Pour entreprises, commerçants et particuliers ayant des besoins ponctuels ou réguliers de transport. À partir de 30 000 FCFA.",
  },

  // ── Maintenance & Dépannage ───────────────────────────────────────────
  {
    slug: "multi-maintenance-batiment",
    name: "Maintenance & Entretien de Bâtiment",
    pricingType: "MONTHLY_SUB",
    price: 60000,
    rate: 10,
    siteUrl: BASE,
    description: "Contrat de maintenance mensuel pour bureaux, locaux commerciaux et résidences : plomberie, électricité, peinture, menuiserie, vitrerie et petits travaux d'entretien courant. Intervention rapide en cas de panne ou dégradation. Pour entreprises et propriétaires souhaitant un bâtiment toujours en bon état. À partir de 60 000 FCFA/mois.",
  },
  {
    slug: "multi-depannage-urgence",
    name: "Dépannage d'Urgence",
    pricingType: "SERVICE",
    price: 25000,
    rate: 10,
    siteUrl: BASE,
    description: "Intervention d'urgence 24h/24 pour pannes et sinistres : fuite d'eau, panne électrique, serrurerie, vitre brisée, clim en panne. Techniciens qualifiés disponibles rapidement pour remettre en état votre habitation ou local professionnel. Pour particuliers et entreprises. À partir de 25 000 FCFA par intervention.",
  },
  {
    slug: "multi-nettoyage-locaux",
    name: "Nettoyage & Entretien de Locaux",
    pricingType: "MONTHLY_SUB",
    price: 40000,
    rate: 10,
    siteUrl: BASE,
    description: "Service de nettoyage professionnel pour bureaux, commerces, résidences et sites industriels : nettoyage quotidien, hebdomadaire ou mensuel, entretien des sols, sanitaires et espaces communs, nettoyage de vitres et façades. Personnel formé, produits fournis. Pour entreprises et particuliers souhaitant un cadre propre et sain. À partir de 40 000 FCFA/mois.",
  },
  {
    slug: "multi-jardinage-espaces-verts",
    name: "Jardinage & Entretien Espaces Verts",
    pricingType: "MONTHLY_SUB",
    price: 30000,
    rate: 10,
    siteUrl: BASE,
    description: "Entretien régulier de jardins, cours et espaces verts : tonte de pelouse, taille des haies et arbustes, désherbage, arrosage et plantations. Pour particuliers, résidences et entreprises souhaitant des espaces extérieurs soignés toute l'année. À partir de 30 000 FCFA/mois.",
  },

  // ── BTP & Travaux ─────────────────────────────────────────────────────
  {
    slug: "multi-travaux-renovation",
    name: "Travaux de Rénovation & Aménagement",
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
    price: 1000000,
    rate: 8,
    siteUrl: BASE,
    description: "Réalisation de projets de construction : maisons individuelles, immeubles, locaux commerciaux, entrepôts et infrastructures. Gestion complète du chantier : plans, permis de construire, approvisionnement en matériaux, main-d'œuvre qualifiée et suivi des travaux jusqu'à la réception. Sur devis à partir de 1 000 000 FCFA.",
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

  // ── Logistique ────────────────────────────────────────────────────────
  {
    slug: "multi-gestion-stock-logistique",
    name: "Gestion de Stock & Logistique Externalisée",
    pricingType: "MONTHLY_SUB",
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

  // ── Sécurité & Gardiennage ────────────────────────────────────────────
  {
    slug: "multi-gardiennage-securite",
    name: "Gardiennage & Sécurité",
    pricingType: "MONTHLY_SUB",
    price: 80000,
    rate: 10,
    siteUrl: BASE,
    description: "Services de gardiennage et de sécurité pour résidences, entreprises, chantiers et événements : agents de sécurité formés, rondes de surveillance, contrôle d'accès et intervention rapide. Pour particuliers et entreprises souhaitant sécuriser leurs biens et personnes. À partir de 80 000 FCFA/mois.",
  },
];

export async function POST() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const branch = await prisma.branch.findUnique({ where: { slug: "ibig-multiservices" } });
  if (!branch) {
    return NextResponse.json(
      { error: "Branche IBIG MULTISERVICES introuvable. Synchronisez d'abord les branches." },
      { status: 404 }
    );
  }

  const knownSlugs = MULTISERVICES_PRODUCTS.map((p) => p.slug);

  const deleted = await prisma.product.deleteMany({
    where: {
      branchId: branch.id,
      slug: { notIn: knownSlugs },
      sales: { none: {} },
    },
  });

  let upserted = 0;
  for (const p of MULTISERVICES_PRODUCTS) {
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
    message: `${upserted} services IBIG MULTISERVICES synchronisés, ${deleted.count} doublon(s) supprimé(s).`,
  });
}

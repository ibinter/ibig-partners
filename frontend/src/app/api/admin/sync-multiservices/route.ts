import { NextResponse } from "next/server";
import { isSyncAuthorized } from "@/lib/sync-auth";
import { syncBranchWithFeed } from "@/lib/catalog-feed";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BASE = "https://intermark-business.com/multiservices";

const MULTISERVICES_PRODUCTS = [
  // â”€â”€ Ã‰vÃ©nementiel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "multi-evenement-corporate",
    name: "Organisation Ã‰vÃ©nement Corporate",
    pricingType: "SERVICE",
    price: 300000,
    rate: 10,
    siteUrl: BASE,
    description: "Organisation complÃ¨te d'Ã©vÃ©nements d'entreprise : sÃ©minaires, confÃ©rences, assemblÃ©es gÃ©nÃ©rales, team buildings, lancements de produits et galas. Prise en charge intÃ©grale : lieu, logistique, traiteur, dÃ©coration, animation, technique son/lumiÃ¨re et coordination le jour J. Pour entreprises et institutions souhaitant marquer leurs Ã©vÃ©nements. Sur devis Ã  partir de 300 000 FCFA.",
  },
  {
    slug: "multi-evenement-prive",
    name: "Organisation Ã‰vÃ©nement PrivÃ©",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Organisation d'Ã©vÃ©nements privÃ©s haut de gamme : mariages, baptÃªmes, anniversaires, soirÃ©es de gala et cÃ©rÃ©monies. Coordination complÃ¨te de A Ã  Z : dÃ©coration, traiteur, DJ/animation, photographe, vidÃ©aste et accueil des invitÃ©s. Pour particuliers et familles souhaitant un Ã©vÃ©nement inoubliable sans stress. Sur devis Ã  partir de 150 000 FCFA.",
  },
  {
    slug: "multi-location-materiel-evenementiel",
    name: "Location MatÃ©riel Ã‰vÃ©nementiel",
    pricingType: "SERVICE",
    price: 50000,
    rate: 10,
    siteUrl: BASE,
    description: "Location de matÃ©riel pour Ã©vÃ©nements : tentes, tables, chaises, nappes, podiums, sono, vidÃ©oprojecteurs, Ã©clairages et mobilier de rÃ©ception. Livraison, installation et reprise incluses. Pour organisateurs d'Ã©vÃ©nements, entreprises et particuliers. Ã€ partir de 50 000 FCFA selon le matÃ©riel.",
  },

  // â”€â”€ Accueil VIP & Protocol â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "multi-accueil-vip",
    name: "Accueil VIP & Services Protocolaires",
    pricingType: "SERVICE",
    price: 75000,
    rate: 10,
    siteUrl: BASE,
    description: "Services d'accueil VIP pour dignitaires, dÃ©lÃ©gations et personnalitÃ©s : hÃ´tesses protocolaires, assistance aÃ©roport, coordination des arrivÃ©es, gestion du carnet d'adresses et accompagnement personnalisÃ© tout au long du sÃ©jour. Pour entreprises, ambassades et organisateurs d'Ã©vÃ©nements recevant des invitÃ©s de marque. Ã€ partir de 75 000 FCFA.",
  },
  {
    slug: "multi-hotesses-accueil",
    name: "HÃ´tesses d'Accueil & Animation",
    pricingType: "SERVICE",
    price: 35000,
    rate: 10,
    siteUrl: BASE,
    description: "Mise Ã  disposition d'hÃ´tesses et hÃ´tes professionnels pour salons, foires, confÃ©rences, stands et Ã©vÃ©nements corporates : accueil, orientation, remise de badges, distribution de supports et reprÃ©sentation de marque. Formation et briefing inclus. Pour entreprises participant Ã  des salons ou organisant des Ã©vÃ©nements. Ã€ partir de 35 000 FCFA/jour.",
  },

  // â”€â”€ DÃ©mÃ©nagement & Transport â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "multi-demenagement-particuliers",
    name: "DÃ©mÃ©nagement Particuliers",
    pricingType: "SERVICE",
    price: 80000,
    rate: 10,
    siteUrl: BASE,
    description: "Service de dÃ©mÃ©nagement complet pour particuliers : emballage soigneux des effets personnels, dÃ©montage et remontage des meubles, chargement, transport sÃ©curisÃ© et dÃ©chargement dans votre nouveau logement. Ã‰quipe professionnelle, vÃ©hicules adaptÃ©s et assurance des biens incluse. Ã€ partir de 80 000 FCFA selon le volume.",
  },
  {
    slug: "multi-demenagement-entreprises",
    name: "DÃ©mÃ©nagement & Transfert de Bureaux",
    pricingType: "SERVICE",
    price: 200000,
    rate: 10,
    siteUrl: BASE,
    description: "DÃ©mÃ©nagement professionnel de bureaux, entrepÃ´ts et locaux commerciaux : dÃ©montage et remontage du mobilier de bureau, transport sÃ©curisÃ© du matÃ©riel informatique, archivage et rÃ©installation complÃ¨te dans les nouveaux locaux. Intervention en dehors des heures ouvrables possible. Sur devis Ã  partir de 200 000 FCFA.",
  },
  {
    slug: "multi-transport-marchandises",
    name: "Transport & Livraison de Marchandises",
    pricingType: "SERVICE",
    price: 30000,
    rate: 10,
    siteUrl: BASE,
    description: "Transport et livraison de marchandises, colis et Ã©quipements en CÃ´te d'Ivoire et dans la sous-rÃ©gion : camionnettes, camions et vÃ©hicules frigorifiques disponibles. Livraison express possible. Pour entreprises, commerÃ§ants et particuliers ayant des besoins ponctuels ou rÃ©guliers de transport. Ã€ partir de 30 000 FCFA.",
  },

  // â”€â”€ Maintenance & DÃ©pannage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "multi-maintenance-batiment",
    name: "Maintenance & Entretien de BÃ¢timent",
    pricingType: "SERVICE",
    price: 60000,
    rate: 10,
    siteUrl: BASE,
    description: "Contrat de maintenance mensuel pour bureaux, locaux commerciaux et rÃ©sidences : plomberie, Ã©lectricitÃ©, peinture, menuiserie, vitrerie et petits travaux d'entretien courant. Intervention rapide en cas de panne ou dÃ©gradation. Pour entreprises et propriÃ©taires souhaitant un bÃ¢timent toujours en bon Ã©tat. Ã€ partir de 60 000 FCFA/mois.",
  },
  {
    slug: "multi-depannage-urgence",
    name: "DÃ©pannage d'Urgence",
    pricingType: "SERVICE",
    price: 25000,
    rate: 10,
    siteUrl: BASE,
    description: "Intervention d'urgence 24h/24 pour pannes et sinistres : fuite d'eau, panne Ã©lectrique, serrurerie, vitre brisÃ©e, clim en panne. Techniciens qualifiÃ©s disponibles rapidement pour remettre en Ã©tat votre habitation ou local professionnel. Pour particuliers et entreprises. Ã€ partir de 25 000 FCFA par intervention.",
  },
  {
    slug: "multi-nettoyage-locaux",
    name: "Nettoyage & Entretien de Locaux",
    pricingType: "SERVICE",
    price: 40000,
    rate: 10,
    siteUrl: BASE,
    description: "Service de nettoyage professionnel pour bureaux, commerces, rÃ©sidences et sites industriels : nettoyage quotidien, hebdomadaire ou mensuel, entretien des sols, sanitaires et espaces communs, nettoyage de vitres et faÃ§ades. Personnel formÃ©, produits fournis. Pour entreprises et particuliers souhaitant un cadre propre et sain. Ã€ partir de 40 000 FCFA/mois.",
  },
  {
    slug: "multi-jardinage-espaces-verts",
    name: "Jardinage & Entretien Espaces Verts",
    pricingType: "SERVICE",
    price: 30000,
    rate: 10,
    siteUrl: BASE,
    description: "Entretien rÃ©gulier de jardins, cours et espaces verts : tonte de pelouse, taille des haies et arbustes, dÃ©sherbage, arrosage et plantations. Pour particuliers, rÃ©sidences et entreprises souhaitant des espaces extÃ©rieurs soignÃ©s toute l'annÃ©e. Ã€ partir de 30 000 FCFA/mois.",
  },

  // â”€â”€ BTP & Travaux â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "multi-travaux-renovation",
    name: "Travaux de RÃ©novation & AmÃ©nagement",
    pricingType: "SERVICE",
    price: 200000,
    rate: 10,
    siteUrl: BASE,
    description: "RÃ©alisation de travaux de rÃ©novation et d'amÃ©nagement intÃ©rieur : peinture, carrelage, faux plafonds, cloisons, revÃªtements de sol, Ã©lectricitÃ© et plomberie. Pour particuliers et entreprises souhaitant rÃ©nover ou amÃ©nager leur espace de vie ou de travail. Sur devis Ã  partir de 200 000 FCFA selon l'ampleur des travaux.",
  },
  {
    slug: "multi-construction-batiment",
    name: "Construction & GÃ©nie Civil",
    pricingType: "SERVICE",
    price: 1000000,
    rate: 8,
    siteUrl: BASE,
    description: "RÃ©alisation de projets de construction : maisons individuelles, immeubles, locaux commerciaux, entrepÃ´ts et infrastructures. Gestion complÃ¨te du chantier : plans, permis de construire, approvisionnement en matÃ©riaux, main-d'Å“uvre qualifiÃ©e et suivi des travaux jusqu'Ã  la rÃ©ception. Sur devis Ã  partir de 1 000 000 FCFA.",
  },
  {
    slug: "multi-amenagement-bureau",
    name: "AmÃ©nagement & DÃ©coration de Bureaux",
    pricingType: "SERVICE",
    price: 150000,
    rate: 10,
    siteUrl: BASE,
    description: "Conception et amÃ©nagement de vos espaces de travail : plan d'amÃ©nagement, choix du mobilier, dÃ©coration intÃ©rieure, signalÃ©tique et mise en place complÃ¨te. Pour entreprises emmÃ©nageant dans de nouveaux locaux ou souhaitant moderniser leur espace de travail. Sur devis Ã  partir de 150 000 FCFA.",
  },

  // â”€â”€ Logistique â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "multi-gestion-stock-logistique",
    name: "Gestion de Stock & Logistique ExternalisÃ©e",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Externalisation de votre logistique : rÃ©ception et stockage des marchandises, gestion des inventaires, prÃ©paration des commandes, expÃ©dition et retours. Pour e-commerces, importateurs et distributeurs souhaitant se concentrer sur leur cÅ“ur de mÃ©tier sans gÃ©rer d'entrepÃ´t. Ã€ partir de 100 000 FCFA/mois selon le volume.",
  },
  {
    slug: "multi-coursier-express",
    name: "Service Coursier Express",
    pricingType: "SERVICE",
    price: 5000,
    rate: 10,
    siteUrl: BASE,
    description: "Livraison express de documents, colis et courriers en ville : prise en charge sous 30 minutes, livraison dans la journÃ©e, accusÃ© de rÃ©ception et suivi en temps rÃ©el. Pour entreprises, cabinets d'avocats, administrations et particuliers ayant des envois urgents. Ã€ partir de 5 000 FCFA par livraison.",
  },

  // â”€â”€ Tourisme & Hospitality â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "multi-organisation-voyage",
    name: "Organisation de Voyages & SÃ©jours",
    pricingType: "SERVICE",
    price: 50000,
    rate: 10,
    siteUrl: BASE,
    description: "Planification et organisation complÃ¨te de voyages : billets d'avion, hÃ´tels, transferts, visas, assurance voyage et itinÃ©raire personnalisÃ©. Pour particuliers, familles et entreprises organisant des dÃ©placements professionnels ou touristiques en Afrique et Ã  l'international. Frais d'agence Ã  partir de 50 000 FCFA.",
  },
  {
    slug: "multi-tourisme-affaires",
    name: "Tourisme d'Affaires & MICE",
    pricingType: "SERVICE",
    price: 200000,
    rate: 10,
    siteUrl: BASE,
    description: "Organisation de voyages d'affaires et d'Ã©vÃ©nements MICE (Meetings, Incentives, Conferences, Exhibitions) : billets, hÃ´tels, salles de confÃ©rence, activitÃ©s de team building, gala dÃ®ners et transferts VIP. Pour entreprises organisant des dÃ©placements d'Ã©quipes ou des Ã©vÃ©nements professionnels Ã  l'Ã©tranger. Sur devis Ã  partir de 200 000 FCFA.",
  },
  {
    slug: "multi-chauffeur-prive",
    name: "Chauffeur PrivÃ© & Transport VIP",
    pricingType: "SERVICE",
    price: 30000,
    rate: 10,
    siteUrl: BASE,
    description: "Mise Ã  disposition de chauffeurs privÃ©s professionnels pour transferts aÃ©roport, dÃ©placements en ville, mise Ã  disposition Ã  la journÃ©e et occasions spÃ©ciales. VÃ©hicules climatisÃ©s, chauffeurs en tenue, ponctualitÃ© garantie. Pour particuliers, hommes d'affaires et entreprises accueillant des dÃ©lÃ©gations. Ã€ partir de 30 000 FCFA.",
  },

  // â”€â”€ SÃ©curitÃ© & Gardiennage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "multi-gardiennage-securite",
    name: "Gardiennage & SÃ©curitÃ©",
    pricingType: "SERVICE",
    price: 80000,
    rate: 10,
    siteUrl: BASE,
    description: "Services de gardiennage et de sÃ©curitÃ© pour rÃ©sidences, entreprises, chantiers et Ã©vÃ©nements : agents de sÃ©curitÃ© formÃ©s, rondes de surveillance, contrÃ´le d'accÃ¨s et intervention rapide. Pour particuliers et entreprises souhaitant sÃ©curiser leurs biens et personnes. Ã€ partir de 80 000 FCFA/mois.",
  },

  // â”€â”€ Placement de Personnel & IntÃ©rim â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "multi-placement-ouvriers",
    name: "Placement d'Ouvriers & Personnel de Chantier",
    pricingType: "SERVICE",
    price: 30000,
    rate: 10,
    siteUrl: BASE,
    description: "Recrutement et placement d'ouvriers qualifiÃ©s et non qualifiÃ©s pour chantiers BTP, industries et sites de production : maÃ§ons, carreleurs, peintres, Ã©lectriciens, plombiers, manÅ“uvres et gardiens de chantier. VÃ©rification des compÃ©tences, contrats et formalitÃ©s inclus. Pour entreprises de BTP, promoteurs et maÃ®tres d'ouvrage. Ã€ partir de 30 000 FCFA par placement.",
  },
  {
    slug: "multi-placement-personnel-domestique",
    name: "Placement Personnel Domestique",
    pricingType: "SERVICE",
    price: 25000,
    rate: 10,
    siteUrl: BASE,
    description: "Recrutement et placement de personnel domestique vÃ©rifiÃ© : femmes de mÃ©nage, cuisiniers, nounous, jardiniers, gardiens et chauffeurs personnels. VÃ©rification des antÃ©cÃ©dents, entretien de prÃ©sÃ©lection et suivi post-placement. Pour familles et expatriÃ©s souhaitant un personnel de confiance et fiable. Ã€ partir de 25 000 FCFA par placement.",
  },
  {
    slug: "multi-mise-a-disposition-personnel",
    name: "Mise Ã  Disposition de Personnel (IntÃ©rim)",
    pricingType: "SERVICE",
    price: 80000,
    rate: 10,
    siteUrl: BASE,
    description: "Mise Ã  disposition de personnel temporaire pour renforcer vos Ã©quipes : agents de saisie, assistants administratifs, opÃ©rateurs de production, agents d'accueil, manutentionnaires et techniciens. Contrats gÃ©rÃ©s par IBIG MULTISERVICES, personnel disponible sous 48h. Pour entreprises en pic d'activitÃ© ou en remplacement d'effectifs. Ã€ partir de 80 000 FCFA/mois par agent.",
  },
  {
    slug: "multi-placement-emplois-qualifies",
    name: "Placement Emplois QualifiÃ©s & Cadres",
    pricingType: "SERVICE",
    price: 100000,
    rate: 10,
    siteUrl: BASE,
    description: "Recrutement et placement de profils qualifiÃ©s et cadres : comptables, gestionnaires, commerciaux, informaticiens, ingÃ©nieurs et responsables de dÃ©partement. PrÃ©sÃ©lection rigoureuse, tests de compÃ©tences et accompagnement jusqu'Ã  l'intÃ©gration. Pour entreprises et ONG cherchant des profils compÃ©tents rapidement. Ã€ partir de 100 000 FCFA par recrutement.",
  },
  {
    slug: "multi-externalisation-rh",
    name: "Externalisation RH & Gestion de la Paie",
    pricingType: "SERVICE",
    price: 50000,
    rate: 10,
    siteUrl: BASE,
    description: "Externalisation complÃ¨te des fonctions RH et paie : Ã©tablissement des bulletins de salaire, dÃ©clarations CNPS et DIPE, gestion des congÃ©s, suivi des contrats et conseil en droit du travail. Pour TPE et PME souhaitant dÃ©lÃ©guer leur RH Ã  des professionnels sans recruter un DRH. Ã€ partir de 50 000 FCFA/mois.",
  },
  {
    slug: "multi-formation-personnel",
    name: "Formation & Renforcement de CapacitÃ©s du Personnel",
    pricingType: "SERVICE",
    price: 75000,
    rate: 10,
    siteUrl: BASE,
    description: "Conception et animation de formations sur mesure pour vos Ã©quipes : accueil et relation client, techniques de vente, gestion du temps, hygiÃ¨ne et sÃ©curitÃ© au travail, informatique bureautique. En prÃ©sentiel dans vos locaux ou en externe. Pour entreprises souhaitant monter en compÃ©tences leurs collaborateurs. Ã€ partir de 75 000 FCFA par session.",
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


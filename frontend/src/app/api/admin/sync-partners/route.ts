import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BASE = "https://ibigpartners.com";

const PARTNERS_PRODUCTS = [
  // â”€â”€ AdhÃ©sion au Programme â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "partners-adhesion-standard",
    name: "AdhÃ©sion AffiliÃ© Standard",
    pricingType: "SERVICE",
    price: 0,
    rate: 0,
    siteUrl: `${BASE}/register`,
    description: "Rejoignez gratuitement le rÃ©seau IBIG PARTNERS et commencez Ã  gÃ©nÃ©rer des commissions en promouvant les services du groupe IBIG SARL. AccÃ¨s Ã  votre espace affiliÃ©, lien de parrainage unique, tableau de bord de suivi des commissions et catalogue complet des produits Ã  promouvoir. Inscription gratuite, sans engagement.",
  },
  {
    slug: "partners-pack-demarrage",
    name: "Pack DÃ©marrage AffiliÃ©",
    pricingType: "SERVICE",
    price: 25000,
    rate: 0,
    siteUrl: `${BASE}/register`,
    description: "Kit de dÃ©marrage complet pour les nouveaux affiliÃ©s : formation aux techniques de vente des produits IBIG, supports marketing personnalisÃ©s (flyers, visuels rÃ©seaux sociaux, scripts WhatsApp), accÃ¨s prioritaire aux nouvelles offres et session de coaching individuel d'1h. Pour affiliÃ©s souhaitant dÃ©marrer efficacement et maximiser leurs premiÃ¨res commissions. 25 000 FCFA.",
  },
  {
    slug: "partners-pack-ambassadeur",
    name: "Pack Ambassadeur IBIG",
    pricingType: "SERVICE",
    price: 75000,
    rate: 0,
    siteUrl: `${BASE}/register`,
    description: "Statut Ambassadeur IBIG avec avantages exclusifs : badge Ambassadeur officiel, commission bonifiÃ©e sur toutes les branches, accÃ¨s aux offres B2B grand compte, support commercial dÃ©diÃ©, kit marketing premium, invitation aux Ã©vÃ©nements du groupe et prÃ©sentation dans l'annuaire des ambassadeurs. Pour affiliÃ©s Ã  fort potentiel commercial souhaitant maximiser leurs revenus. 75 000 FCFA.",
  },

  // â”€â”€ ReprÃ©sentation Commerciale â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "partners-representation-commerciale",
    name: "ReprÃ©sentation Commerciale IBIG",
    pricingType: "SERVICE",
    price: 50000,
    rate: 0,
    siteUrl: BASE,
    description: "Mandat de reprÃ©sentation commerciale officielle du groupe IBIG SARL dans votre zone gÃ©ographique : prospection active de nouveaux clients, prÃ©sentation des offres du groupe, nÃ©gociation et closing. Commissions sur toutes les ventes rÃ©alisÃ©es + forfait mensuel de reprÃ©sentation. Pour commerciaux expÃ©rimentÃ©s souhaitant reprÃ©senter un groupe structurÃ©. 50 000 FCFA/mois + commissions.",
  },
  {
    slug: "partners-developpement-marche",
    name: "DÃ©veloppement de MarchÃ© & Prospection B2B",
    pricingType: "SERVICE",
    price: 150000,
    rate: 0,
    siteUrl: BASE,
    description: "Mission de dÃ©veloppement commercial : identification des prospects B2B dans un secteur ou une zone cible, prise de contact, qualification et prÃ©sentation des offres IBIG. Rapport de prospection avec liste de leads qualifiÃ©s et comptes rendus de rendez-vous. Pour entreprises et institutions souhaitant s'appuyer sur le rÃ©seau IBIG pour accÃ©lÃ©rer leur dÃ©veloppement. Ã€ partir de 150 000 FCFA.",
  },
  {
    slug: "partners-implantation-regionale",
    name: "Implantation RÃ©gionale IBIG",
    pricingType: "SERVICE",
    price: 200000,
    rate: 0,
    siteUrl: BASE,
    description: "Accompagnement pour l'ouverture d'un point de reprÃ©sentation IBIG dans une nouvelle rÃ©gion ou ville : Ã©tude de faisabilitÃ©, recrutement des premiers affiliÃ©s locaux, formation, lancement commercial et suivi de la montÃ©e en puissance. Pour entrepreneurs souhaitant devenir Responsable RÃ©gional du rÃ©seau IBIG PARTNERS. Ã€ partir de 200 000 FCFA.",
  },

  // â”€â”€ Formation & MontÃ©e en CompÃ©tences des AffiliÃ©s â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "partners-formation-vente-affiliation",
    name: "Formation Vente & Affiliation",
    pricingType: "SERVICE",
    price: 35000,
    rate: 0,
    siteUrl: BASE,
    description: "Formation pratique d'une journÃ©e dÃ©diÃ©e aux affiliÃ©s IBIG PARTNERS : maÃ®triser le catalogue des produits IBIG, techniques de prospection (WhatsApp, rÃ©seaux sociaux, bouche Ã  oreille), scripts de vente par service, gestion des objections et suivi des prospects. Pour tout affiliÃ© souhaitant passer ses premiÃ¨res ventes rapidement. 35 000 FCFA.",
  },
  {
    slug: "partners-formation-manager-reseau",
    name: "Formation Manager de RÃ©seau",
    pricingType: "SERVICE",
    price: 75000,
    rate: 0,
    siteUrl: BASE,
    description: "Formation pour devenir Manager de rÃ©seau d'affiliÃ©s IBIG : recrutement et animation d'une Ã©quipe d'affiliÃ©s, techniques de motivation, suivi des performances, gestion des conflits et dÃ©veloppement d'un rÃ©seau durable. Pour affiliÃ©s souhaitant Ã©voluer vers un rÃ´le de leader et multiplier leurs revenus grÃ¢ce aux commissions de niveau 2. 75 000 FCFA.",
  },

  // â”€â”€ Partenariats Institutionnels & B2B â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "partners-partenariat-institutionnel",
    name: "Partenariat Institutionnel",
    pricingType: "SERVICE",
    price: 0,
    rate: 0,
    siteUrl: BASE,
    description: "Accord de partenariat institutionnel entre IBIG SARL et une organisation (entreprise, ONG, institution publique, association professionnelle) : promotion croisÃ©e, offres prÃ©fÃ©rentielles pour les membres, co-branding et Ã©vÃ©nements communs. Pour organisations souhaitant offrir des avantages exclusifs IBIG Ã  leurs membres ou clients. Gratuit â€” sur dossier.",
  },
  {
    slug: "partners-accord-distribution",
    name: "Accord de Distribution & Revente",
    pricingType: "SERVICE",
    price: 0,
    rate: 0,
    siteUrl: BASE,
    description: "Accord de distribution officielle permettant Ã  une structure (cabinet, Ã©cole, association, entreprise) de revendre les produits et services IBIG SARL Ã  ses clients avec une marge dÃ©finie. AccÃ¨s au catalogue wholesale, formations produits et support commercial dÃ©diÃ©. Pour structures disposant d'une clientÃ¨le existante Ã  fort potentiel. Gratuit â€” sur dossier.",
  },

  // â”€â”€ Ã‰vÃ©nements & Networking â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    slug: "partners-evenement-networking",
    name: "Ã‰vÃ©nement Networking & PrÃ©sentation IBIG",
    pricingType: "SERVICE",
    price: 50000,
    rate: 0,
    siteUrl: BASE,
    description: "Organisation d'un Ã©vÃ©nement de networking IBIG PARTNERS dans votre ville : prÃ©sentation du groupe et de ses produits, rencontre avec les affiliÃ©s de la zone, inscription de nouveaux partenaires et cÃ©lÃ©bration des meilleures performances. Pour responsables rÃ©gionaux souhaitant animer et dÃ©velopper leur rÃ©seau local. Ã€ partir de 50 000 FCFA.",
  },
  {
    slug: "partners-webinaire-produits",
    name: "Webinaire de PrÃ©sentation des Produits IBIG",
    pricingType: "SERVICE",
    price: 0,
    rate: 0,
    siteUrl: BASE,
    description: "Webinaire en ligne gratuit pour tous les affiliÃ©s IBIG PARTNERS : prÃ©sentation des nouveaux produits, techniques de vente, tÃ©moignages d'affiliÃ©s performants et session de questions-rÃ©ponses. OrganisÃ© mensuellement par l'Ã©quipe IBIG PARTNERS. Gratuit pour tous les affiliÃ©s inscrits.",
  },
];

export async function POST() {`n  try {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Non autorisÃ©" }, { status: 403 });
  }

  const branch = await prisma.branch.findUnique({ where: { slug: "ibig-partners-branch" } });
  if (!branch) {
    return NextResponse.json(
      { error: "Branche IBIG PARTNERS introuvable. Synchronisez d'abord les branches." },
      { status: 404 }
    );
  }

  const knownSlugs = PARTNERS_PRODUCTS.map((p) => p.slug);

  const deleted = await prisma.product.deleteMany({
    where: {
      branchId: branch.id,
      slug: { notIn: knownSlugs },
      sales: { none: {} },
    },
  });

  let upserted = 0;
  for (const p of PARTNERS_PRODUCTS) {
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
    message: `${upserted} produits IBIG PARTNERS synchronisÃ©s, ${deleted.count} doublon(s) supprimÃ©(s).`,
  });
  } catch (err: any) {
    console.error("sync-partners error:", err);
    return NextResponse.json({ error: err?.message ?? "Erreur serveur" }, { status: 500 });
  }
}

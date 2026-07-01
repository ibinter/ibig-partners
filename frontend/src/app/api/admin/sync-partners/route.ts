import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BASE = "https://ibigpartners.com";

const PARTNERS_PRODUCTS = [
  // ── Adhésion au Programme ─────────────────────────────────────────────
  {
    slug: "partners-adhesion-standard",
    name: "Adhésion Affilié Standard",
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
    slug: "partners-pack-ambassadeur",
    name: "Pack Ambassadeur IBIG",
    pricingType: "SERVICE",
    price: 75000,
    rate: 0,
    siteUrl: `${BASE}/register`,
    description: "Statut Ambassadeur IBIG avec avantages exclusifs : badge Ambassadeur officiel, commission bonifiée sur toutes les branches, accès aux offres B2B grand compte, support commercial dédié, kit marketing premium, invitation aux événements du groupe et présentation dans l'annuaire des ambassadeurs. Pour affiliés à fort potentiel commercial souhaitant maximiser leurs revenus. 75 000 FCFA.",
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

  // ── Formation & Montée en Compétences des Affiliés ────────────────────
  {
    slug: "partners-formation-vente-affiliation",
    name: "Formation Vente & Affiliation",
    pricingType: "SERVICE",
    price: 35000,
    rate: 0,
    siteUrl: BASE,
    description: "Formation pratique d'une journée dédiée aux affiliés IBIG PARTNERS : maîtriser le catalogue des produits IBIG, techniques de prospection (WhatsApp, réseaux sociaux, bouche à oreille), scripts de vente par service, gestion des objections et suivi des prospects. Pour tout affilié souhaitant passer ses premières ventes rapidement. 35 000 FCFA.",
  },
  {
    slug: "partners-formation-manager-reseau",
    name: "Formation Manager de Réseau",
    pricingType: "SERVICE",
    price: 75000,
    rate: 0,
    siteUrl: BASE,
    description: "Formation pour devenir Manager de réseau d'affiliés IBIG : recrutement et animation d'une équipe d'affiliés, techniques de motivation, suivi des performances, gestion des conflits et développement d'un réseau durable. Pour affiliés souhaitant évoluer vers un rôle de leader et multiplier leurs revenus grâce aux commissions de niveau 2. 75 000 FCFA.",
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
];

export async function POST() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
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
    message: `${upserted} produits IBIG PARTNERS synchronisés, ${deleted.count} doublon(s) supprimé(s).`,
  });
}

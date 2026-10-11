import { NextResponse } from "next/server";
import { isSyncAuthorized } from "@/lib/sync-auth";
import { syncBranchWithFeed } from "@/lib/catalog-feed";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MARKET_PRODUCTS = [
  {
    slug: "ibig-market-vendeur-starter",
    name: "IBIG MARKET — Compte Vendeur Starter",
    pricingType: "MONTHLY_SUB",
    price: 5000,
    rate: 20,
    siteUrl: "https://ibig-market.com",
    description: "Ouvrez votre boutique sur IBIG MARKET : jusqu'à 30 produits, paiement mobile money intégré, tableau de bord ventes. 5 000 FCFA/mois.",
  },
  {
    slug: "ibig-market-vendeur-starter-annuel",
    name: "IBIG MARKET — Vendeur Starter (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 50000,
    rate: 20,
    siteUrl: "https://ibig-market.com",
    description: "Abonnement annuel Vendeur Starter IBIG MARKET. 50 000 FCFA/an (2 mois offerts).",
  },
  {
    slug: "ibig-market-vendeur-pro",
    name: "IBIG MARKET — Compte Vendeur Pro",
    pricingType: "MONTHLY_SUB",
    price: 12000,
    rate: 20,
    siteUrl: "https://ibig-market.com",
    description: "Boutique Pro IBIG MARKET : produits illimités, stats avancées, mise en avant catalogue, livraison intégrée Zelivry. 12 000 FCFA/mois.",
  },
  {
    slug: "ibig-market-vendeur-pro-annuel",
    name: "IBIG MARKET — Vendeur Pro (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 120000,
    rate: 20,
    siteUrl: "https://ibig-market.com",
    description: "Abonnement annuel Vendeur Pro IBIG MARKET. 120 000 FCFA/an.",
  },
  {
    slug: "ibig-market-vendeur-business",
    name: "IBIG MARKET — Compte Vendeur Business",
    pricingType: "MONTHLY_SUB",
    price: 25000,
    rate: 20,
    siteUrl: "https://ibig-market.com",
    description: "Boutique Business : multi-boutiques, API stock, programme fidélité, account manager dédié. 25 000 FCFA/mois.",
  },
  {
    slug: "ibig-market-vendeur-business-annuel",
    name: "IBIG MARKET — Vendeur Business (Annuel)",
    pricingType: "ANNUAL_SUB",
    price: 250000,
    rate: 20,
    siteUrl: "https://ibig-market.com",
    description: "Abonnement annuel Vendeur Business IBIG MARKET. 250 000 FCFA/an.",
  },
  {
    slug: "ibig-market-creation-boutique",
    name: "IBIG MARKET — Création & Configuration Boutique",
    pricingType: "SERVICE",
    price: 45000,
    rate: 20,
    siteUrl: "https://ibig-market.com",
    description: "Service de création et configuration complète de votre boutique IBIG MARKET : logo, bannière, catalogue initial (50 produits), paramétrage paiements. 45 000 FCFA.",
  },
  {
    slug: "ibig-market-mise-en-avant",
    name: "IBIG MARKET — Mise en Avant Produit (1 mois)",
    pricingType: "SERVICE",
    price: 15000,
    rate: 20,
    siteUrl: "https://ibig-market.com",
    description: "Mettre en avant 1 produit sur la page d'accueil IBIG MARKET pendant 1 mois. 15 000 FCFA.",
  },
  {
    slug: "ibig-market-campagne-promo",
    name: "IBIG MARKET — Campagne Promotionnelle",
    pricingType: "SERVICE",
    price: 30000,
    rate: 20,
    siteUrl: "https://ibig-market.com",
    description: "Campagne promotionnelle de votre boutique sur IBIG MARKET + réseaux sociaux IBIG. 30 000 FCFA.",
  },
  {
    slug: "ibig-market-formation-vendeur",
    name: "IBIG MARKET — Formation Vendre en Ligne",
    pricingType: "COURSE",
    price: 20000,
    rate: 20,
    siteUrl: "https://ibig-market.com",
    description: "Formation complète pour vendre efficacement sur IBIG MARKET : catalogue, prix, photos, gestion commandes, livraisons. 20 000 FCFA.",
  },
  {
    slug: "ibig-market-formation-dropshipping",
    name: "IBIG MARKET — Formation Dropshipping Afrique",
    pricingType: "COURSE",
    price: 35000,
    rate: 20,
    siteUrl: "https://ibig-market.com",
    description: "Démarrer un business dropshipping sur IBIG MARKET sans stock : fournisseurs, marges, logistique. 35 000 FCFA.",
  },
];

export async function POST() {
  try {
    if (!(await isSyncAuthorized())) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    await prisma.setting.upsert({
      where: { key: "catalog_feed_ibig-market" },
      update: { value: "https://ibig-market.com/api/catalogue.php" },
      create: { key: "catalog_feed_ibig-market", value: "https://ibig-market.com/api/catalogue.php" },
    }).catch(() => {});

    const result = await syncBranchWithFeed("ibig-market", "IBIG MARKET", MARKET_PRODUCTS, { notify: true });
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
      message: `${diff.total} produits IBIG MARKET synchronisés (${diff.added.length} nouveau(x), ${diff.updated.length} mis à jour, ${diff.removed} retiré(s)).`,
    });
  } catch (err: any) {
    console.error("sync-market error:", err);
    return NextResponse.json({ error: err?.message ?? "Erreur serveur" }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";
import { syncBranchCatalog, type SyncProduct, type SyncResult } from "@/lib/catalog-sync";

/**
 * VOIE A — Connecteur de flux externe.
 *
 * Permet à une branche de tirer son catalogue depuis une API JSON externe
 * (`/api/catalogue` d'une plateforme IBIG : EDUFORM, SOFT, Scolaby…) au lieu du
 * tableau codé en dur. La récupération est DÉFENSIVE : en cas d'URL non
 * configurée, non autorisée, injoignable, ou de flux invalide/vide, on retombe
 * automatiquement sur le catalogue de repli (`fallback`) — le catalogue n'est
 * JAMAIS vidé par un flux défaillant.
 *
 * Configuration de l'URL d'une branche (par ordre de priorité) :
 *  1. Réglage en base : Setting `catalog_feed_<branchSlug>` (modifiable à chaud)
 *  2. Variable d'env : `CATALOG_FEED_<BRANCH_SLUG_MAJUSCULE_AVEC_UNDERSCORES>`
 * Un jeton optionnel `CATALOG_FEED_TOKEN` est envoyé en `Authorization: Bearer`.
 */

const ALLOWED_PRICING = new Set(["MONTHLY_SUB", "ANNUAL_SUB", "COURSE", "SERVICE", "PRODUCT"]);

// Anti-SSRF : seules les URLs HTTPS de domaines IBIG connus sont autorisées.
const TRUSTED_HOST_SUFFIXES = [
  "ibigsoft.com",
  "ibigpartners.com",
  "intermark-business.com",
  "scolaby.com",
  "ibigfleet360.com",
  "lokativo.com",
  "zelivry.com",
  "construiro.com",
  "ibig-eduform.com",
  "ibigimmotrust.com",
  "ibig-market.com",
  "ibig-digital.com",
];

const MAX_PRODUCTS = 5000;
const FETCH_TIMEOUT_MS = 10_000;

export function isTrustedFeedUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return false;
    return TRUSTED_HOST_SUFFIXES.some((s) => u.hostname === s || u.hostname.endsWith(`.${s}`));
  } catch {
    return false;
  }
}

async function getFeedUrl(branchSlug: string): Promise<string | null> {
  const setting = await prisma.setting
    .findUnique({ where: { key: `catalog_feed_${branchSlug}` } })
    .catch(() => null);
  if (setting?.value && setting.value.trim()) return setting.value.trim();

  const envKey = `CATALOG_FEED_${branchSlug.toUpperCase().replace(/-/g, "_")}`;
  const fromEnv = process.env[envKey];
  return fromEnv && fromEnv.trim() ? fromEnv.trim() : null;
}

/** Valide et normalise un flux ; renvoie null si le moindre élément est invalide. */
export function validateFeed(data: unknown): SyncProduct[] | null {
  const arr = Array.isArray((data as { products?: unknown })?.products)
    ? (data as { products: unknown[] }).products
    : Array.isArray(data)
      ? (data as unknown[])
      : null;

  if (!arr || arr.length === 0 || arr.length > MAX_PRODUCTS) return null;

  const out: SyncProduct[] = [];
  const seen = new Set<string>();

  for (const raw of arr) {
    if (!raw || typeof raw !== "object") return null;
    const it = raw as Record<string, unknown>;
    const { slug, name, pricingType, price, rate, siteUrl, description } = it;

    if (typeof slug !== "string" || !slug.trim()) return null;
    if (seen.has(slug)) return null;
    seen.add(slug);
    if (typeof name !== "string" || !name.trim()) return null;
    if (typeof pricingType !== "string" || !ALLOWED_PRICING.has(pricingType)) return null;
    if (typeof price !== "number" || !Number.isFinite(price) || price < 0) return null;
    if (typeof rate !== "number" || !Number.isFinite(rate) || rate < 0 || rate > 100) return null;
    if (siteUrl != null && typeof siteUrl !== "string") return null;
    if (description != null && typeof description !== "string") return null;

    out.push({
      slug,
      name,
      pricingType,
      price,
      rate,
      siteUrl: typeof siteUrl === "string" ? siteUrl : undefined,
      description: typeof description === "string" ? description : undefined,
    });
  }

  return out;
}

/** Résout la source du catalogue : flux externe si configuré et valide, sinon fallback. */
export async function resolveCatalogSource(
  branchSlug: string,
  fallback: SyncProduct[]
): Promise<{ products: SyncProduct[]; source: "feed" | "fallback" }> {
  const url = await getFeedUrl(branchSlug);
  if (!url) return { products: fallback, source: "fallback" };

  if (!isTrustedFeedUrl(url)) {
    console.error(`catalog-feed: URL non autorisée pour ${branchSlug} → repli. URL=${url}`);
    return { products: fallback, source: "fallback" };
  }

  try {
    const token = process.env.CATALOG_FEED_TOKEN;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const products = validateFeed(data);
    if (!products) {
      console.error(`catalog-feed: flux invalide/vide pour ${branchSlug} → repli. URL=${url}`);
      return { products: fallback, source: "fallback" };
    }
    return { products, source: "feed" };
  } catch (err) {
    console.error(`catalog-feed: échec de récupération pour ${branchSlug} → repli. URL=${url}`, err);
    return { products: fallback, source: "fallback" };
  }
}

/**
 * Synchronise une branche depuis son flux externe (Voie A) si configuré, sinon
 * depuis le catalogue de repli fourni. Même moteur (diff + notification cloche).
 */
export async function syncBranchWithFeed(
  branchSlug: string,
  label: string,
  fallback: SyncProduct[],
  opts: { notify?: boolean } = {}
): Promise<SyncResult> {
  const { products, source } = await resolveCatalogSource(branchSlug, fallback);
  if (source === "feed") {
    console.log(`catalog-feed: ${branchSlug} synchronisé depuis le flux externe (${products.length} produits).`);
  }
  return syncBranchCatalog(branchSlug, label, products, opts);
}

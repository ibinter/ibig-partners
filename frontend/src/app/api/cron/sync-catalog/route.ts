import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Ordre important : les branches d'abord (les produits en dépendent), puis les
// catalogues. Chaque endpoint applique sa synchro et notifie sur changement.
const SYNC_ENDPOINTS = [
  "sync-branches",
  "sync-soft",
  "sync-eduform",
  "sync-immo",
  "sync-digital",
  "sync-digital-kits",
  "sync-conseil",
  "sync-multiservices",
  "sync-partners",
  "sync-academie",
  "sync-kits",
];

function siteUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  return url && url.startsWith("http") ? url : "https://ibigpartners.com";
}

/**
 * Synchronisation automatique du catalogue, déclenchée par un Vercel Cron Job.
 * Vercel envoie `Authorization: Bearer <CRON_SECRET>`. On relaie ensuite le
 * secret à chaque route de synchro via `x-cron-secret`.
 */
export async function GET() {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET non configuré" }, { status: 503 });
  }

  const h = await headers();
  const auth = h.get("authorization");
  const x = h.get("x-cron-secret");
  if (auth !== `Bearer ${secret}` && x !== secret) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const base = siteUrl();
  const results: Record<string, unknown>[] = [];

  for (const ep of SYNC_ENDPOINTS) {
    try {
      const r = await fetch(`${base}/api/admin/${ep}`, {
        method: "POST",
        headers: { "x-cron-secret": secret },
        cache: "no-store",
      });
      let data: { message?: string; error?: string } | null = null;
      try {
        data = await r.json();
      } catch {
        // réponse non JSON : on garde juste le statut
      }
      results.push({
        endpoint: ep,
        status: r.status,
        ...(data?.message ? { message: data.message } : {}),
        ...(data?.error ? { error: data.error } : {}),
      });
    } catch (err) {
      results.push({ endpoint: ep, error: err instanceof Error ? err.message : String(err) });
    }
  }

  return NextResponse.json({ ok: true, results });
}

/**
 * Rate limiter simple basé sur la mémoire du processus Node.js.
 * Fonctionne en serverless (Vercel) : chaque instance garde son propre compteur,
 * ce qui suffit pour bloquer les attaques concentrées sur une seule instance.
 * Pour un blocage cross-instance, utiliser Upstash Redis.
 */

type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

// Nettoyage périodique pour éviter les fuites mémoire
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 60_000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number; // secondes
}

/**
 * @param key      identifiant unique (ex: "login:1.2.3.4" ou "otp:user-id")
 * @param limit    nombre de requêtes autorisées dans la fenêtre
 * @param windowMs durée de la fenêtre en millisecondes
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  let entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return { allowed: true, remaining: limit - 1, resetIn: Math.ceil(windowMs / 1000) };
  }

  entry.count++;
  const remaining = Math.max(0, limit - entry.count);
  const resetIn = Math.ceil((entry.resetAt - now) / 1000);

  return { allowed: entry.count <= limit, remaining, resetIn };
}

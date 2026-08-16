import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth";

/**
 * Autorise une route de synchronisation si :
 *  - la requête porte le secret cron (déclenchement automatique planifié), OU
 *  - l'utilisateur connecté est ADMIN / SUPERADMIN (déclenchement manuel).
 *
 * Le secret cron est fourni via l'en-tête `Authorization: Bearer <CRON_SECRET>`
 * (envoyé automatiquement par les Vercel Cron Jobs) ou `x-cron-secret`.
 */
export async function isSyncAuthorized(): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const h = await headers();
    const auth = h.get("authorization");
    const x = h.get("x-cron-secret");
    if (auth === `Bearer ${secret}` || x === secret) return true;
  }
  const user = await getCurrentUser();
  return !!user && (user.role === "ADMIN" || user.role === "SUPERADMIN");
}

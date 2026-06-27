// Utilitaire de simulation de gains — réutilise le moteur de commissions réel
// (src/lib/commissions.ts) pour garantir des estimations fidèles à la production.

import { effectiveRate, commissionMonths } from "./commissions";
import type { PricingType } from "./constants";

export type PerSale = { n1: number; n2: number; n3: number };

/**
 * Commission totale (cumulée sur la durée de versement) générée par UNE vente,
 * pour chaque niveau, selon le type de produit et le statut du bénéficiaire.
 * - MONTHLY_SUB : cumul sur 4 mois.
 * - autres : one-shot.
 */
export function perSaleCommission(
  type: PricingType,
  amount: number,
  productRatePct: number,
  status: string,
): PerSale {
  const months = commissionMonths(type);
  let n1 = 0, n2 = 0, n3 = 0;
  for (let m = 1; m <= months; m++) {
    n1 += effectiveRate(type, 1, m, productRatePct, status) * amount;
    n2 += effectiveRate(type, 2, m, productRatePct, status) * amount;
    n3 += effectiveRate(type, 3, m, productRatePct, status) * amount;
  }
  return { n1: Math.round(n1), n2: Math.round(n2), n3: Math.round(n3) };
}

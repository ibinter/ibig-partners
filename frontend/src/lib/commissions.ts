// Moteur de calcul des commissions multi-niveaux IBIG PARTNERS.
//
// Principe : pour une vente realisee par un partenaire (le "vendeur"),
//   - le vendeur percoit la commission de Niveau 1,
//   - son parrain percoit la commission de Niveau 2,
//   - le parrain de son parrain percoit la commission de Niveau 3.
// Le bonus de statut de CHAQUE beneficiaire s'ajoute a son taux (points de %).

import {
  ANNUAL_RATES,
  COURSE_RATES,
  MONTHLY_DURATION,
  MONTHLY_RATES,
  SERVICE_LEVEL_FACTOR,
  STATUS_BONUS,
  type PricingType,
} from "./constants";

/** Taux de base (avant bonus) pour un type de produit, un niveau et un mois donnes. */
export function baseRate(
  pricingType: PricingType,
  level: number,
  monthIndex: number,
  productRatePct: number,
): number {
  switch (pricingType) {
    case "MONTHLY_SUB":
      return MONTHLY_RATES[monthIndex]?.[level] ?? 0;
    case "ANNUAL_SUB":
      return ANNUAL_RATES[level] ?? 0;
    case "COURSE":
      return COURSE_RATES[level] ?? 0;
    case "SERVICE":
    case "PRODUCT":
      return (productRatePct / 100) * (SERVICE_LEVEL_FACTOR[level] ?? 0);
    default:
      return 0;
  }
}

/** Taux effectif = taux de base + bonus de statut du beneficiaire. */
export function effectiveRate(
  pricingType: PricingType,
  level: number,
  monthIndex: number,
  productRatePct: number,
  earnerStatus: string,
): number {
  const base = baseRate(pricingType, level, monthIndex, productRatePct);
  if (base <= 0) return 0;
  return base + (STATUS_BONUS[earnerStatus] ?? 0);
}

/** Nombre de mois sur lesquels des commissions sont generees pour un type donne. */
export function commissionMonths(pricingType: PricingType): number {
  return pricingType === "MONTHLY_SUB" ? MONTHLY_DURATION : 1;
}

export type CommissionLine = {
  userId: string;
  level: number;
  monthIndex: number;
  rate: number;
  amount: number;
};

type UpchainMember = { id: string; status: string } | null;

/**
 * Calcule toutes les lignes de commission pour une vente, pour les mois 1..uptoMonth.
 * upchain = [vendeur (N1), parrain (N2), grand-parrain (N3)].
 */
export function computeCommissions(params: {
  pricingType: PricingType;
  amount: number; // montant par periode (mois) ou montant total one-shot
  productRatePct: number;
  upchain: [UpchainMember, UpchainMember, UpchainMember];
  uptoMonth: number; // mois confirmes (mensuel). 1 pour les one-shot.
}): CommissionLine[] {
  const { pricingType, amount, productRatePct, upchain, uptoMonth } = params;
  const months = pricingType === "MONTHLY_SUB" ? Math.min(uptoMonth, MONTHLY_DURATION) : 1;
  const lines: CommissionLine[] = [];

  for (let level = 1; level <= 3; level++) {
    const member = upchain[level - 1];
    if (!member) continue;
    for (let m = 1; m <= months; m++) {
      const rate = effectiveRate(pricingType, level, m, productRatePct, member.status);
      if (rate <= 0) continue;
      const amt = Math.round(amount * rate);
      if (amt <= 0) continue;
      lines.push({ userId: member.id, level, monthIndex: m, rate, amount: amt });
    }
  }
  return lines;
}

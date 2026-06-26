// Constantes metier IBIG PARTNERS — issues du cahier des charges.

export const ROLES = ["PARTNER", "ADMIN", "SUPERADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const STATUSES = ["STARTER", "SILVER", "GOLD", "MASTER"] as const;
export type Status = (typeof STATUSES)[number];

export const PRICING_TYPES = [
  "MONTHLY_SUB",
  "ANNUAL_SUB",
  "COURSE",
  "SERVICE",
  "PRODUCT",
] as const;
export type PricingType = (typeof PRICING_TYPES)[number];

export const PAYOUT_METHODS = ["ORANGE_MONEY", "WAVE", "MTN_MOMO", "BANK"] as const;
export type PayoutMethod = (typeof PAYOUT_METHODS)[number];

export const PAYOUT_METHOD_LABELS: Record<string, string> = {
  ORANGE_MONEY: "Orange Money",
  WAVE: "Wave",
  MTN_MOMO: "MTN MoMo",
  BANK: "Virement bancaire",
};

export const PRICING_TYPE_LABELS: Record<string, string> = {
  MONTHLY_SUB: "Abonnement mensuel",
  ANNUAL_SUB: "Abonnement annuel",
  COURSE: "Formation",
  SERVICE: "Prestation / service",
  PRODUCT: "Produit",
};

export const STATUS_LABELS: Record<string, string> = {
  STARTER: "⭐ Starter",
  SILVER: "⭐⭐ Silver",
  GOLD: "⭐⭐⭐ Gold",
  MASTER: "🏆 Master Partner",
};

export const COMMISSION_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  VALIDATED: "Validée",
  PAID: "Versée",
};

export const SALE_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
};

export const PROSPECT_STATUS_LABELS: Record<string, string> = {
  CONTACTED: "Contacté",
  DEMO: "Démo",
  CONVERTED: "Converti",
  LOST: "Perdu",
};

export const OPPORTUNITY_STATUS_LABELS: Record<string, string> = {
  NEW: "Nouvelle",
  IN_PROGRESS: "En cours",
  WON: "Gagnée",
  LOST: "Perdue",
};

// --- Grille de commissions (cahier des charges, sections 3.2 a 3.4) ---
// Taux de base AVANT bonus de statut, par niveau (1/2/3).

// 3.2 Abonnements mensuels : degressif sur 4 mois.
export const MONTHLY_RATES: Record<number, Record<number, number>> = {
  1: { 1: 0.2, 2: 0.1, 3: 0.05 },
  2: { 1: 0.15, 2: 0.08, 3: 0.03 },
  3: { 1: 0.1, 2: 0.05, 3: 0.02 },
  4: { 1: 0.05, 2: 0.03, 3: 0.01 },
};
export const MONTHLY_DURATION = 4;

// 3.3 Abonnements annuels : one-shot.
export const ANNUAL_RATES: Record<number, number> = { 1: 0.2, 2: 0.08, 3: 0.03 };

// 3.4 Formations IBIG EDUFORM : one-shot.
export const COURSE_RATES: Record<number, number> = { 1: 0.1, 2: 0.05, 3: 0.02 };

// SERVICE / PRODUCT : le taux N1 est defini par produit (Product.rate, en %).
// Les niveaux 2 et 3 percoivent une fraction du taux N1.
export const SERVICE_LEVEL_FACTOR: Record<number, number> = { 1: 1, 2: 0.5, 3: 0.25 };

// --- Bonus de statut (section 4) : ajout en points de pourcentage sur tous les taux. ---
export const STATUS_BONUS: Record<string, number> = {
  STARTER: 0,
  SILVER: 0.02,
  GOLD: 0.05,
  MASTER: 0.08,
};

// Regles de progression de statut (section 4).
export const STATUS_RULES = {
  SILVER: { sales: 5 },
  GOLD: { salesOr: 15, activeReferralsOr: 3 },
  MASTER: { sales: 30, activeReferrals: 5 },
};

// Section 5.2 — regles de paiement.
export const MIN_PAYOUT = 5000; // FCFA
export const COOKIE_TRACKING_DAYS = 90;

export const STATUS_DETAILS = [
  {
    status: "STARTER",
    condition: "Inscription gratuite",
    advantage: "Accès standard",
    bonus: "Taux standard",
  },
  {
    status: "SILVER",
    condition: "5 ventes cumulées",
    advantage: "Kit marketing premium",
    bonus: "+2% sur tous les taux",
  },
  {
    status: "GOLD",
    condition: "15 ventes OU 3 filleuls actifs",
    advantage: "Badge Ambassadeur IBIG",
    bonus: "+5% sur tous les taux",
  },
  {
    status: "MASTER",
    condition: "30 ventes ET 5 filleuls actifs",
    advantage: "Support dédié + visibilité IBIG",
    bonus: "+8% sur tous les taux",
  },
];

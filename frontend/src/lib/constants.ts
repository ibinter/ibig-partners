// Constantes metier IBIG PARTNERS — issues du cahier des charges.

export const ROLES = ["PARTNER", "ADMIN", "SUPERADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const STATUSES = ["STARTER", "SILVER", "GOLD", "MASTER", "ELITE"] as const;
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
  SILVER:  "⭐⭐ Silver",
  GOLD:    "⭐⭐⭐ Gold",
  MASTER:  "🏆 Master Partner",
  ELITE:   "👑 Elite Représentant",
};

export const STATUS_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
  STARTER: { bg: "bg-slate-100",  text: "text-slate-700",  badge: "bg-slate-100 text-slate-700" },
  SILVER:  { bg: "bg-blue-50",    text: "text-blue-700",   badge: "bg-blue-100 text-blue-700" },
  GOLD:    { bg: "bg-amber-50",   text: "text-amber-700",  badge: "bg-amber-100 text-amber-700" },
  MASTER:  { bg: "bg-violet-50",  text: "text-violet-700", badge: "bg-violet-100 text-violet-700" },
  ELITE:   { bg: "bg-yellow-50",  text: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700" },
};

export const COMMISSION_STATUS_LABELS: Record<string, string> = {
  PENDING:   "En attente",
  VALIDATED: "Validée",
  PAID:      "Versée",
};

export const SALE_STATUS_LABELS: Record<string, string> = {
  PENDING:   "En attente",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
};

export const PROSPECT_STATUS_LABELS: Record<string, string> = {
  CONTACTED: "Contacté",
  DEMO:      "Démo",
  CONVERTED: "Converti",
  LOST:      "Perdu",
};

export const OPPORTUNITY_STATUS_LABELS: Record<string, string> = {
  NEW:         "Nouvelle",
  IN_PROGRESS: "En cours",
  WON:         "Gagnée",
  LOST:        "Perdue",
};

// ─────────────────────────────────────────────────────────────────
// GRILLE DE COMMISSIONS (cahier des charges sections 3.2 à 3.5)
// ─────────────────────────────────────────────────────────────────

// 3.2 Abonnements mensuels SaaS — dégressif sur 4 mois
export const MONTHLY_RATES: Record<number, Record<number, number>> = {
  1: { 1: 0.20, 2: 0.10, 3: 0.05 },
  2: { 1: 0.15, 2: 0.08, 3: 0.03 },
  3: { 1: 0.10, 2: 0.05, 3: 0.02 },
  4: { 1: 0.05, 2: 0.03, 3: 0.01 },
};
export const MONTHLY_DURATION = 4;

// 3.3 Abonnements annuels — one-shot
export const ANNUAL_RATES: Record<number, number> = { 1: 0.20, 2: 0.08, 3: 0.03 };

// 3.4 Formations catalogue IBIG EDUFORM — one-shot
export const COURSE_RATES: Record<number, number> = { 1: 0.10, 2: 0.05, 3: 0.02 };

// 3.5 Services & Produits — taux N1 défini par produit (Product.rate en %)
// N2 = 50% du taux N1 — N3 = 25% du taux N1
export const SERVICE_LEVEL_FACTOR: Record<number, number> = { 1: 1, 2: 0.5, 3: 0.25 };

// NB : le moteur applique TOUJOURS SERVICE_LEVEL_FACTOR (100%/50%/25%) aux
// produits SERVICE/PRODUCT — il n'existe pas de mécanisme "N1 uniquement"
// ni de facteurs N2/N3 différents par catégorie. Toute variation se fait
// uniquement via le champ Product.rate (N1), N2/N3 en découlent automatiquement.
// IBIG DIGITAL KITS : rate = 15 sur tous les produits → 15% N1, 7,5% N2, 3,75% N3.
// IBIG IMMO TRUST : rate = 10 sur la plupart des produits → 10% N1, 5% N2, 2,5% N3
// (Gestion Locative Complète : rate = 50, une vente par mois de mandat = 50% du
// mois de commission d'agence à l'affilié).

// ─────────────────────────────────────────────────────────────────
// BONUS DE STATUT — s'ajoute à TOUS les taux de base
// ─────────────────────────────────────────────────────────────────
export const STATUS_BONUS: Record<string, number> = {
  STARTER: 0,
  SILVER:  0.02,
  GOLD:    0.05,
  MASTER:  0.08,
  ELITE:   0.12,
};

// ─────────────────────────────────────────────────────────────────
// RÈGLES DE PROGRESSION DE STATUT
// ─────────────────────────────────────────────────────────────────
// activeTeam = N1+N2+N3 ayant effectué au moins 1 vente confirmée
// directReferrals = filleuls N1 uniquement recrutés directement
export const STATUS_RULES = {
  SILVER: {
    sales: 10,
  },
  GOLD: {
    sales: 25,
    directReferrals: 10,
    activeTeam: 20,
  },
  MASTER: {
    sales: 50,
    directReferrals: 25,
    activeTeam: 50,
  },
  ELITE: {
    sales: 100,
    directReferrals: 50,
    activeTeam: 100,
  },
};

export const MIN_PAYOUT = 5000; // FCFA
export const COOKIE_TRACKING_DAYS = 90;

// ─────────────────────────────────────────────────────────────────
// DÉTAILS STATUTS (pour affichage formation / public)
// ─────────────────────────────────────────────────────────────────
export const STATUS_DETAILS = [
  {
    status:    "STARTER",
    label:     "⭐ Starter",
    condition: "Inscription gratuite",
    sales:     0,
    direct:    0,
    team:      0,
    bonus:     "+0%",
    advantage: "Accès complet à la plateforme",
    color:     "from-slate-500 to-slate-600",
  },
  {
    status:    "SILVER",
    label:     "⭐⭐ Silver",
    condition: "10 ventes confirmées",
    sales:     10,
    direct:    0,
    team:      0,
    bonus:     "+2% sur tous les taux",
    advantage: "Kit marketing premium",
    color:     "from-blue-400 to-blue-600",
  },
  {
    status:    "GOLD",
    label:     "⭐⭐⭐ Gold",
    condition: "25 ventes + 10 filleuls directs + équipe 20 actifs",
    sales:     25,
    direct:    10,
    team:      20,
    bonus:     "+5% sur tous les taux",
    advantage: "Badge Ambassadeur IBIG",
    color:     "from-amber-400 to-yellow-500",
  },
  {
    status:    "MASTER",
    label:     "🏆 Master Partner",
    condition: "50 ventes + 25 filleuls directs + équipe 50 actifs",
    sales:     50,
    direct:    25,
    team:      50,
    bonus:     "+8% sur tous les taux",
    advantage: "Représentant communal officiel possible",
    color:     "from-violet-500 to-purple-700",
  },
  {
    status:    "ELITE",
    label:     "👑 Elite Représentant",
    condition: "100 ventes + 50 filleuls directs + équipe 100 actifs",
    sales:     100,
    direct:    50,
    team:      100,
    bonus:     "+12% sur tous les taux",
    advantage: "Représentant Pays officiel IBIG SARL",
    color:     "from-yellow-400 to-orange-500",
  },
];

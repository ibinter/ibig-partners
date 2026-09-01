"use client";

import { useState, useMemo } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────
const MONTHLY_RATES: Record<number, Record<number, number>> = {
  1: { 1: 0.20, 2: 0.10, 3: 0.05 },
  2: { 1: 0.15, 2: 0.08, 3: 0.03 },
  3: { 1: 0.10, 2: 0.05, 3: 0.02 },
  4: { 1: 0.05, 2: 0.03, 3: 0.01 },
};
const MONTHLY_DURATION = 4;
const ANNUAL_RATES: Record<number, number> = { 1: 0.20, 2: 0.08, 3: 0.03 };
const COURSE_RATES: Record<number, number> = { 1: 0.10, 2: 0.05, 3: 0.02 };
const SERVICE_LEVEL_FACTOR: Record<number, number> = { 1: 1, 2: 0.5, 3: 0.25 };

const STATUS_BONUS: Record<string, number> = {
  STARTER: 0, SILVER: 0.02, GOLD: 0.05, MASTER: 0.08, ELITE: 0.12,
};

const PRODUCT_TYPES = [
  { key: "MONTHLY_SUB", label: "Abonnement mensuel", icon: "🔄" },
  { key: "ANNUAL_SUB",  label: "Abonnement annuel",  icon: "📅" },
  { key: "COURSE",      label: "Formation",           icon: "🎓" },
  { key: "SERVICE",     label: "Service / Produit",   icon: "🛠️" },
];

const STATUSES = [
  { key: "STARTER", label: "⭐ Starter",          bonus: 0,    color: "border-slate-300 text-slate-600" },
  { key: "SILVER",  label: "⭐⭐ Silver",          bonus: 0.02, color: "border-blue-300 text-blue-700" },
  { key: "GOLD",    label: "⭐⭐⭐ Gold",          bonus: 0.05, color: "border-amber-400 text-amber-700" },
  { key: "MASTER",  label: "🏆 Master",            bonus: 0.08, color: "border-violet-400 text-violet-700" },
  { key: "ELITE",   label: "👑 Elite",             bonus: 0.12, color: "border-yellow-400 text-yellow-700" },
];

// Scénarios prêts à l'emploi
const SCENARIOS = [
  {
    label: "🌱 Débutant",
    desc: "Vous commencez, 5 ventes/mois, pas encore de réseau",
    productType: "MONTHLY_SUB", price: 15000, myStatus: "STARTER", serviceRate: 10,
    mySales: 5, n1Count: 0, n1AvgSales: 0, n2Count: 0, n2AvgSales: 0, n3Count: 0, n3AvgSales: 0,
  },
  {
    label: "🚀 Actif",
    desc: "10 ventes/mois + 5 filleuls N1 actifs",
    productType: "MONTHLY_SUB", price: 15000, myStatus: "SILVER", serviceRate: 10,
    mySales: 10, n1Count: 5, n1AvgSales: 3, n2Count: 10, n2AvgSales: 1, n3Count: 0, n3AvgSales: 0,
  },
  {
    label: "⚡ Pro",
    desc: "Immo Trust : ventes de terrain avec une équipe large",
    productType: "SERVICE", price: 1500000, myStatus: "GOLD", serviceRate: 10,
    mySales: 2, n1Count: 10, n1AvgSales: 1, n2Count: 20, n2AvgSales: 0.5, n3Count: 5, n3AvgSales: 0.5,
  },
  {
    label: "👑 Elite",
    desc: "Formation + grand réseau, statut Elite",
    productType: "COURSE", price: 250000, myStatus: "ELITE", serviceRate: 10,
    mySales: 5, n1Count: 30, n1AvgSales: 2, n2Count: 80, n2AvgSales: 1, n3Count: 30, n3AvgSales: 1,
  },
];

// ── Calculations ──────────────────────────────────────────────────────────────
function calcComm(productType: string, price: number, level: number, status: string, serviceRate: number): number {
  const bonus = STATUS_BONUS[status] ?? 0;
  if (productType === "ANNUAL_SUB") return price * ((ANNUAL_RATES[level] ?? 0) + (level === 1 ? bonus : 0));
  if (productType === "COURSE") return price * ((COURSE_RATES[level] ?? 0) + (level === 1 ? bonus : 0));
  if (productType === "SERVICE") {
    const base = serviceRate / 100;
    return price * (base * (SERVICE_LEVEL_FACTOR[level] ?? 0) + (level === 1 ? bonus : 0));
  }
  // MONTHLY_SUB — total 4 mois
  let total = 0;
  for (let m = 1; m <= MONTHLY_DURATION; m++) {
    total += price * ((MONTHLY_RATES[m]?.[level] ?? 0) + (level === 1 ? bonus / MONTHLY_DURATION : 0));
  }
  return total;
}

function calcMonthlyBreakdown(price: number, status: string, mySales: number) {
  const bonus = STATUS_BONUS[status] ?? 0;
  return Array.from({ length: MONTHLY_DURATION }, (_, i) => ({
    month: i + 1,
    amount: mySales * price * ((MONTHLY_RATES[i + 1]?.[1] ?? 0) + bonus / MONTHLY_DURATION),
  }));
}

function simulate(p: {
  productType: string; price: number; mySales: number; myStatus: string; serviceRate: number;
  n1Count: number; n1AvgSales: number; n2Count: number; n2AvgSales: number;
  n3Count: number; n3AvgSales: number;
}) {
  const { productType, price, mySales, myStatus, serviceRate, n1Count, n1AvgSales, n2Count, n2AvgSales, n3Count, n3AvgSales } = p;
  const myN1 = mySales * calcComm(productType, price, 1, myStatus, serviceRate);
  const onN1  = n1Count * n1AvgSales * calcComm(productType, price, 2, myStatus, serviceRate);
  const onN2  = n2Count * n2AvgSales * calcComm(productType, price, 3, myStatus, serviceRate);
  const onN3  = n3Count * n3AvgSales * 0; // N3 earns level 3, we earn 0 beyond level 3
  const total = myN1 + onN1 + onN2 + onN3;
  const monthly = productType === "MONTHLY_SUB" ? calcMonthlyBreakdown(price, myStatus, mySales) : null;
  return { myN1, onN1, onN2, onN3, total, monthly };
}

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(n);

// ── Component ─────────────────────────────────────────────────────────────────
export default function SimulateurClient() {
  const [productType, setProductType] = useState("MONTHLY_SUB");
  const [price, setPrice]             = useState(15000);
  const [mySales, setMySales]         = useState(5);
  const [myStatus, setMyStatus]       = useState("STARTER");
  const [serviceRate, setServiceRate] = useState(10);
  const [n1Count, setN1Count]         = useState(3);
  const [n1AvgSales, setN1AvgSales]   = useState(2);
  const [n2Count, setN2Count]         = useState(5);
  const [n2AvgSales, setN2AvgSales]   = useState(1);
  const [n3Count, setN3Count]         = useState(0);
  const [n3AvgSales, setN3AvgSales]   = useState(0);
  const [annualMode, setAnnualMode]   = useState(false);

  function applyScenario(s: typeof SCENARIOS[0]) {
    setProductType(s.productType); setPrice(s.price); setMyStatus(s.myStatus);
    setServiceRate(s.serviceRate); setMySales(s.mySales);
    setN1Count(s.n1Count); setN1AvgSales(s.n1AvgSales);
    setN2Count(s.n2Count); setN2AvgSales(s.n2AvgSales);
    setN3Count(s.n3Count); setN3AvgSales(s.n3AvgSales);
  }

  const result = useMemo(() =>
    simulate({ productType, price, mySales, myStatus, serviceRate, n1Count, n1AvgSales, n2Count, n2AvgSales, n3Count, n3AvgSales }),
    [productType, price, mySales, myStatus, serviceRate, n1Count, n1AvgSales, n2Count, n2AvgSales, n3Count, n3AvgSales],
  );

  const multiplier = annualMode ? 12 : 1;
  const displayed = result.total * multiplier;
  const bonus = STATUS_BONUS[myStatus] ?? 0;
  const isMonthly = productType === "MONTHLY_SUB";
  const isService = productType === "SERVICE";

  return (
    <div className="space-y-5">

      {/* Scénarios */}
      <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4 space-y-2">
        <p className="text-xs font-bold text-violet-700 uppercase tracking-wide">⚡ Scénarios prêts</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {SCENARIOS.map(s => (
            <button key={s.label} onClick={() => applyScenario(s)}
              className="rounded-xl border border-violet-200 bg-white hover:bg-violet-50 px-3 py-2.5 text-left transition group">
              <p className="text-xs font-bold text-slate-800 group-hover:text-violet-700">{s.label}</p>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* ── LEFT ── */}
        <div className="space-y-4">

          {/* Type de produit */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Type de produit</h3>
            <div className="grid grid-cols-2 gap-2">
              {PRODUCT_TYPES.map(t => (
                <button key={t.key} onClick={() => setProductType(t.key)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition ${productType === t.key ? "border-blue-500 bg-blue-50 text-blue-700 shadow" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"}`}>
                  <span>{t.icon}</span><span className="leading-tight">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prix + statut */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Produit & Statut</h3>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Prix (FCFA)</label>
              <input type="number" min={0} step={500} value={price}
                onChange={e => setPrice(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-400" />
            </div>
            {isService && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Taux N1 du produit (%)</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={1} max={30} step={1} value={serviceRate}
                    onChange={e => setServiceRate(Number(e.target.value))} className="flex-1 accent-blue-600" />
                  <span className="w-10 text-right text-sm font-bold text-blue-700">{serviceRate}%</span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500">Mon statut</label>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map(s => (
                  <button key={s.key} onClick={() => setMyStatus(s.key)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${myStatus === s.key ? `${s.color} bg-white shadow ring-1 ring-current` : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
                    {s.label}
                  </button>
                ))}
              </div>
              {bonus > 0 && (
                <p className="text-xs text-emerald-600 font-semibold">✓ Bonus statut +{(bonus * 100).toFixed(0)}% sur vos taux N1</p>
              )}
            </div>
          </div>

          {/* Ventes & réseau */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Ventes & équipe</h3>
            <Slider label="Mes ventes directes" value={mySales} min={0} max={50} onChange={setMySales} color="blue" />

            <div className="border-t border-slate-100 pt-3 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Filleuls N1 directs</p>
              <Slider label="Nombre" value={n1Count} min={0} max={50} onChange={setN1Count} color="purple" />
              <Slider label="Ventes moy. / N1" value={n1AvgSales} min={0} max={20} onChange={setN1AvgSales} color="purple" />
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Filleuls N2 (vos filleuls&apos; filleuls)</p>
              <Slider label="Nombre" value={n2Count} min={0} max={200} onChange={setN2Count} color="indigo" />
              <Slider label="Ventes moy. / N2" value={n2AvgSales} min={0} max={10} onChange={setN2AvgSales} color="indigo" />
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Filleuls N3 (niveau 3)</p>
              <Slider label="Nombre" value={n3Count} min={0} max={500} onChange={setN3Count} color="teal" />
              <Slider label="Ventes moy. / N3" value={n3AvgSales} min={0} max={5} onChange={setN3AvgSales} color="teal" />
              <p className="text-[9px] text-slate-400 italic">Note : les commissions N3 (niveau 3 pour l&apos;upline) = 0 au-delà de 3 niveaux.</p>
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="space-y-4">

          {/* Total hero */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-violet-700 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
                Revenus estimés {isMonthly ? "(4 mois / vente)" : ""}
              </p>
              <button onClick={() => setAnnualMode(!annualMode)}
                className={`rounded-lg px-3 py-1 text-[10px] font-bold transition ${annualMode ? "bg-white text-blue-700" : "bg-white/20 text-white hover:bg-white/30"}`}>
                {annualMode ? "× 12 mois" : "Mensuel"}
              </button>
            </div>
            <p className="text-4xl font-extrabold tracking-tight">{fmt(displayed)}</p>
            {annualMode && (
              <p className="text-xs text-blue-200 mt-1">Projection annuelle (× 12 mois de ventes récurrentes)</p>
            )}
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-white/10 px-3 py-2">
                <p className="text-lg font-extrabold">{mySales + n1Count + n2Count + n3Count}</p>
                <p className="text-[9px] text-blue-200 uppercase tracking-wide">Pers. dans l&apos;équipe</p>
              </div>
              <div className="rounded-xl bg-white/10 px-3 py-2">
                <p className="text-lg font-extrabold">
                  {n1Count * n1AvgSales + n2Count * n2AvgSales + n3Count * n3AvgSales + mySales}
                </p>
                <p className="text-[9px] text-blue-200 uppercase tracking-wide">Ventes totales</p>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Détail des commissions</h3>
            <CommRow icon="💼" label="Mes ventes directes (Niveau 1)" value={result.myN1 * multiplier} color="blue" total={displayed} />
            <CommRow icon="👥" label={`${n1Count} filleuls N1 × ${n1AvgSales} ventes (Niv. 2 pour moi)`} value={result.onN1 * multiplier} color="purple" total={displayed} />
            <CommRow icon="🌐" label={`${n2Count} filleuls N2 × ${n2AvgSales} ventes (Niv. 3 pour moi)`} value={result.onN2 * multiplier} color="indigo" total={displayed} />
            {n3Count > 0 && (
              <CommRow icon="🔗" label={`${n3Count} filleuls N3 × ${n3AvgSales} ventes`} value={0} color="teal" total={displayed} />
            )}
            <div className="border-t border-slate-100 pt-3 flex justify-between">
              <span className="text-sm font-bold text-slate-800">Total {annualMode ? "(12 mois)" : ""}</span>
              <span className="text-sm font-extrabold text-emerald-700">{fmt(displayed)}</span>
            </div>
          </div>

          {/* Mensuel breakdown */}
          {isMonthly && result.monthly && (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Commissions mensuelles / vente</h3>
              <p className="text-xs text-slate-400">Chaque abonnement mensuel génère des commissions sur 4 mois.</p>
              {result.monthly.map(m => (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-14">Mois {m.month}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                      style={{ width: `${(m.amount / (result.monthly![0].amount || 1)) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 w-24 text-right">{fmt(m.amount)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Taux appliqués */}
          <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 space-y-2">
            <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wide">Taux appliqués</h3>
            <RateTable productType={productType} status={myStatus} serviceRate={serviceRate} />
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-700">Prêt à atteindre ces chiffres ?</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/espace/plan-compensation" className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm">
                Plan de compensation →
              </a>
              <a href="/espace/reseau" className="rounded-xl border border-blue-300 bg-white px-4 py-2 text-xs font-bold text-blue-700 hover:border-blue-400 transition shadow-sm">
                Recruter des filleuls
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function Slider({ label, value, min, max, onChange, color }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void; color: string;
}) {
  const accent: Record<string, string> = {
    blue: "accent-blue-600", purple: "accent-purple-600",
    indigo: "accent-indigo-600", teal: "accent-teal-600",
  };
  const textColor: Record<string, string> = {
    blue: "text-blue-700", purple: "text-purple-700",
    indigo: "text-indigo-700", teal: "text-teal-700",
  };
  return (
    <div className="flex items-center gap-3">
      <label className="text-xs text-slate-500 w-36 shrink-0">{label}</label>
      <input type="range" min={min} max={max} step={1} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className={`flex-1 ${accent[color] ?? "accent-blue-600"}`} />
      <span className={`w-8 text-right text-sm font-extrabold ${textColor[color] ?? "text-blue-700"}`}>{value}</span>
    </div>
  );
}

function CommRow({ icon, label, value, color, total }: {
  icon: string; label: string; value: number; color: string; total: number;
}) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-700 bg-blue-50", purple: "text-purple-700 bg-purple-50",
    indigo: "text-indigo-700 bg-indigo-50", teal: "text-teal-700 bg-teal-50",
  };
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span>{icon}</span>
          <span className="text-xs text-slate-600 truncate">{label}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {pct > 0 && <span className="text-[9px] text-slate-400">{pct}%</span>}
          <span className={`rounded-lg px-2 py-0.5 text-xs font-bold ${colorMap[color] ?? "text-slate-700 bg-slate-100"}`}>
            {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(value)}
          </span>
        </div>
      </div>
      {pct > 0 && (
        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${
            color === "blue" ? "bg-blue-400" : color === "purple" ? "bg-purple-400" :
            color === "indigo" ? "bg-indigo-400" : "bg-teal-400"
          }`} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

function RateTable({ productType, status, serviceRate }: { productType: string; status: string; serviceRate: number }) {
  const bonus = STATUS_BONUS[status] ?? 0;
  const pct = (n: number) => (n * 100).toFixed(1) + "%";

  if (productType === "MONTHLY_SUB") return (
    <div className="text-xs text-amber-700 space-y-1">
      <div className="grid grid-cols-4 gap-1 font-bold text-[10px] uppercase tracking-wide text-amber-500 mb-1">
        <span>Mois</span><span>N1 (vous)</span><span>N2 (upline N1)</span><span>N3 (upline N2)</span>
      </div>
      {[1,2,3,4].map(m => (
        <div key={m} className="grid grid-cols-4 gap-1">
          <span>Mois {m}</span>
          <span className="font-bold">{pct(MONTHLY_RATES[m]![1] + bonus / MONTHLY_DURATION)}</span>
          <span>{pct(MONTHLY_RATES[m]![2])}</span>
          <span>{pct(MONTHLY_RATES[m]![3])}</span>
        </div>
      ))}
    </div>
  );

  if (productType === "ANNUAL_SUB") return (
    <div className="flex gap-6 text-xs text-amber-700">
      <span><strong>N1 :</strong> {pct(ANNUAL_RATES[1] + bonus)}</span>
      <span><strong>N2 :</strong> {pct(ANNUAL_RATES[2])}</span>
      <span><strong>N3 :</strong> {pct(ANNUAL_RATES[3])}</span>
    </div>
  );

  if (productType === "COURSE") return (
    <div className="flex gap-6 text-xs text-amber-700">
      <span><strong>N1 :</strong> {pct(COURSE_RATES[1] + bonus)}</span>
      <span><strong>N2 :</strong> {pct(COURSE_RATES[2])}</span>
      <span><strong>N3 :</strong> {pct(COURSE_RATES[3])}</span>
    </div>
  );

  const r = serviceRate / 100;
  return (
    <div className="flex gap-6 text-xs text-amber-700">
      <span><strong>N1 :</strong> {pct(r + bonus)}</span>
      <span><strong>N2 :</strong> {pct(r * 0.5)}</span>
      <span><strong>N3 :</strong> {pct(r * 0.25)}</span>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";

// ── Constants (mirrors src/lib/constants.ts) ────────────────────────────────
const MONTHLY_RATES: Record<number, Record<number, number>> = {
  1: { 1: 0.20, 2: 0.10, 3: 0.05 },
  2: { 1: 0.15, 2: 0.08, 3: 0.03 },
  3: { 1: 0.10, 2: 0.05, 3: 0.02 },
  4: { 1: 0.05, 2: 0.03, 3: 0.01 },
};
const MONTHLY_DURATION = 4;

const ANNUAL_RATES:  Record<number, number> = { 1: 0.20, 2: 0.08, 3: 0.03 };
const COURSE_RATES:  Record<number, number> = { 1: 0.10, 2: 0.05, 3: 0.02 };
const SERVICE_LEVEL_FACTOR: Record<number, number> = { 1: 1, 2: 0.5, 3: 0.25 };

const STATUS_BONUS: Record<string, number> = {
  STARTER: 0, SILVER: 0.02, GOLD: 0.05, MASTER: 0.08, ELITE: 0.12,
};

const PRODUCT_TYPES = [
  { key: "MONTHLY_SUB",  label: "Abonnement mensuel",  icon: "🔄" },
  { key: "ANNUAL_SUB",   label: "Abonnement annuel",   icon: "📅" },
  { key: "COURSE",       label: "Formation",            icon: "🎓" },
  { key: "SERVICE",      label: "Service / Produit",    icon: "🛠️" },
];

const STATUSES = [
  { key: "STARTER", label: "Starter",  color: "text-slate-500" },
  { key: "SILVER",  label: "Silver",   color: "text-slate-400" },
  { key: "GOLD",    label: "Gold",     color: "text-yellow-500" },
  { key: "MASTER",  label: "Master",   color: "text-blue-600" },
  { key: "ELITE",   label: "Elite",    color: "text-purple-600" },
];

// ── Calculation logic ───────────────────────────────────────────────────────
interface SimInput {
  productType: string;
  price: number;
  mySales: number;
  myStatus: string;
  serviceRate: number; // for SERVICE type, % of price
  n1Count: number;
  n1AvgSales: number;
  n2Count: number;
  n2AvgSales: number;
  n3Count: number;
  n3AvgSales: number;
}

interface SimResult {
  myN1Total: number;       // commissions I earn on my own sales (level 1 of upline)
  earnedOnN1: number;      // commissions I earn on N1's sales
  earnedOnN2: number;      // commissions I earn on N2's sales
  earnedOnN3: number;      // commissions I earn on N3's sales
  total: number;
  monthlyBreakdown: { month: number; amount: number }[] | null;
}

function calcCommission(
  productType: string,
  price: number,
  level: number,
  status: string,
  serviceRate: number,
): number {
  const bonus = STATUS_BONUS[status] ?? 0;
  if (productType === "ANNUAL_SUB") {
    return price * ((ANNUAL_RATES[level] ?? 0) + bonus);
  }
  if (productType === "COURSE") {
    return price * ((COURSE_RATES[level] ?? 0) + bonus);
  }
  if (productType === "SERVICE") {
    const baseRate = serviceRate / 100;
    return price * (baseRate * (SERVICE_LEVEL_FACTOR[level] ?? 0) + (level === 1 ? bonus : 0));
  }
  // MONTHLY_SUB — returns total over MONTHLY_DURATION months
  let total = 0;
  for (let m = 1; m <= MONTHLY_DURATION; m++) {
    total += price * ((MONTHLY_RATES[m]?.[level] ?? 0) + (level === 1 ? bonus / MONTHLY_DURATION : 0));
  }
  return total;
}

function calcMonthlyBreakdown(price: number, status: string): { month: number; amount: number }[] {
  const bonus = STATUS_BONUS[status] ?? 0;
  return Array.from({ length: MONTHLY_DURATION }, (_, i) => ({
    month: i + 1,
    amount: price * ((MONTHLY_RATES[i + 1]?.[1] ?? 0) + bonus / MONTHLY_DURATION),
  }));
}

function simulate(inp: SimInput): SimResult {
  const { productType, price, mySales, myStatus, serviceRate, n1Count, n1AvgSales, n2Count, n2AvgSales, n3Count, n3AvgSales } = inp;

  // My own N1 commissions (level 1 from my sponsor's POV ≡ I earn level 1 on my sales)
  const perSaleComm = calcCommission(productType, price, 1, myStatus, serviceRate);
  const myN1Total = mySales * perSaleComm;

  // Commissions I earn on N1 filleuls' sales (I'm their upline → I earn level 2)
  const earnedOnN1 = n1Count * n1AvgSales * calcCommission(productType, price, 2, myStatus, serviceRate);

  // Commissions I earn on N2 filleuls' sales (level 3)
  const earnedOnN2 = n2Count * n2AvgSales * calcCommission(productType, price, 3, myStatus, serviceRate);

  // Level 4+ not modeled — level 3 is the deepest
  const earnedOnN3 = 0; // N3 earns their own level-3 from their N1, not level 4

  const total = myN1Total + earnedOnN1 + earnedOnN2 + earnedOnN3;

  const monthlyBreakdown =
    productType === "MONTHLY_SUB"
      ? calcMonthlyBreakdown(price, myStatus).map((m) => ({
          month: m.month,
          amount: mySales * m.amount,
        }))
      : null;

  return { myN1Total, earnedOnN1, earnedOnN2, earnedOnN3, total, monthlyBreakdown };
}

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(n);
}

// ── Component ───────────────────────────────────────────────────────────────
export default function SimulateurClient() {
  const [productType, setProductType] = useState("MONTHLY_SUB");
  const [price, setPrice] = useState(15000);
  const [mySales, setMySales] = useState(5);
  const [myStatus, setMyStatus] = useState("STARTER");
  const [serviceRate, setServiceRate] = useState(10);
  const [n1Count, setN1Count] = useState(3);
  const [n1AvgSales, setN1AvgSales] = useState(2);
  const [n2Count, setN2Count] = useState(5);
  const [n2AvgSales, setN2AvgSales] = useState(1);

  const result = useMemo(
    () =>
      simulate({
        productType, price, mySales, myStatus, serviceRate,
        n1Count, n1AvgSales, n2Count, n2AvgSales,
        n3Count: 0, n3AvgSales: 0,
      }),
    [productType, price, mySales, myStatus, serviceRate, n1Count, n1AvgSales, n2Count, n2AvgSales],
  );

  const isMonthly = productType === "MONTHLY_SUB";
  const isService = productType === "SERVICE";

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* ── LEFT: inputs ── */}
      <div className="space-y-5">
        {/* Type de produit */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Type de produit</h3>
          <div className="grid grid-cols-2 gap-2">
            {PRODUCT_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => setProductType(t.key)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition ${
                  productType === t.key
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                }`}
              >
                <span>{t.icon}</span>
                <span className="leading-tight">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Prix + Mon statut */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Paramètres du produit</h3>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">
              Prix du produit (FCFA)
            </label>
            <input
              type="number"
              min={0}
              step={500}
              value={price}
              onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
            />
          </div>

          {isService && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">
                Taux N1 du produit (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={1} max={30} step={1} value={serviceRate}
                  onChange={(e) => setServiceRate(Number(e.target.value))}
                  className="flex-1 accent-blue-600"
                />
                <span className="w-10 text-right text-sm font-bold text-blue-700">{serviceRate}%</span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Mon statut</label>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setMyStatus(s.key)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                    myStatus === s.key
                      ? "border-blue-500 bg-blue-600 text-white shadow"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {STATUS_BONUS[myStatus] > 0 && (
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                ✓ Bonus statut +{(STATUS_BONUS[myStatus] * 100).toFixed(0)}% appliqué
              </p>
            )}
          </div>
        </div>

        {/* Mes ventes + réseau */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Mes ventes & réseau</h3>

          <SliderField
            label="Mes ventes directes"
            value={mySales} min={0} max={50}
            onChange={setMySales}
            color="blue"
          />

          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
              Filleuls N1 (directs)
            </p>
            <SliderField label="Nombre de filleuls N1" value={n1Count} min={0} max={30} onChange={setN1Count} color="purple" />
            <SliderField label="Ventes moyennes / filleul N1" value={n1AvgSales} min={0} max={20} onChange={setN1AvgSales} color="purple" />
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
              Filleuls N2 (indirects)
            </p>
            <SliderField label="Nombre de filleuls N2" value={n2Count} min={0} max={100} onChange={setN2Count} color="indigo" />
            <SliderField label="Ventes moyennes / filleul N2" value={n2AvgSales} min={0} max={20} onChange={setN2AvgSales} color="indigo" />
          </div>
        </div>
      </div>

      {/* ── RIGHT: results ── */}
      <div className="space-y-5">
        {/* Total */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-lg">
          <p className="text-[11px] font-bold uppercase tracking-widest text-blue-200 mb-1">
            Revenus estimés {isMonthly ? "(4 mois)" : ""}
          </p>
          <p className="text-4xl font-extrabold tracking-tight">
            {fmt(result.total)}
          </p>
          <p className="mt-2 text-xs text-blue-200">
            Simulation basée sur {mySales} vente{mySales !== 1 ? "s" : ""} · {n1Count} filleul{n1Count !== 1 ? "s" : ""} N1 · {n2Count} N2
          </p>
        </div>

        {/* Breakdown */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Détail des commissions</h3>

          <CommRow label="Mes ventes directes (N1)" value={result.myN1Total} color="blue" icon="💼" />
          <CommRow label="Sur ventes filleuls N1 (N2 pour eux)" value={result.earnedOnN1} color="purple" icon="👥" />
          <CommRow label="Sur ventes filleuls N2 (N3 pour eux)" value={result.earnedOnN2} color="indigo" icon="🌐" />

          <div className="border-t border-slate-100 pt-3 flex justify-between">
            <span className="text-sm font-bold text-slate-800">Total</span>
            <span className="text-sm font-extrabold text-emerald-700">{fmt(result.total)}</span>
          </div>
        </div>

        {/* Monthly breakdown for MONTHLY_SUB */}
        {isMonthly && result.monthlyBreakdown && (
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Commissions mensuelles sur vos ventes</h3>
            <p className="text-xs text-slate-400">
              Pour chaque abonnement mensuel, vous touchez des commissions sur 4 mois.
            </p>
            <div className="space-y-2">
              {result.monthlyBreakdown.map((m) => (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-14">Mois {m.month}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                      style={{ width: `${(m.amount / (result.monthlyBreakdown![0].amount || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 w-24 text-right">{fmt(m.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Taux affichés */}
        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 space-y-2">
          <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wide">Taux appliqués</h3>
          <RateTable productType={productType} status={myStatus} serviceRate={serviceRate} />
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700">Prêt à atteindre ces chiffres ?</p>
          <div className="flex flex-wrap justify-center gap-2">
            <a href="/espace/coach" className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm">
              Coach IA →
            </a>
            <a href="/espace/reseau" className="rounded-xl border border-blue-300 bg-white px-4 py-2 text-xs font-bold text-blue-700 hover:border-blue-400 transition shadow-sm">
              Mon réseau
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────
function SliderField({
  label, value, min, max, onChange, color,
}: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void; color: string;
}) {
  const accentMap: Record<string, string> = {
    blue: "accent-blue-600",
    purple: "accent-purple-600",
    indigo: "accent-indigo-600",
  };
  return (
    <div className="flex items-center gap-3 mb-2">
      <label className="text-xs text-slate-500 w-40 shrink-0">{label}</label>
      <input
        type="range" min={min} max={max} step={1} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`flex-1 ${accentMap[color] ?? "accent-blue-600"}`}
      />
      <span className={`w-6 text-right text-sm font-extrabold ${color === "blue" ? "text-blue-700" : color === "purple" ? "text-purple-700" : "text-indigo-700"}`}>
        {value}
      </span>
    </div>
  );
}

function CommRow({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-700 bg-blue-50",
    purple: "text-purple-700 bg-purple-50",
    indigo: "text-indigo-700 bg-indigo-50",
  };
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="text-xs text-slate-600">{label}</span>
      </div>
      <span className={`rounded-lg px-2 py-0.5 text-xs font-bold ${colorMap[color] ?? "text-slate-700 bg-slate-100"}`}>
        {fmt(value)}
      </span>
    </div>
  );
}

function RateTable({ productType, status, serviceRate }: { productType: string; status: string; serviceRate: number }) {
  const bonus = STATUS_BONUS[status] ?? 0;

  if (productType === "MONTHLY_SUB") {
    return (
      <div className="text-xs text-amber-700 space-y-0.5">
        {[1, 2, 3, 4].map((m) => (
          <div key={m} className="flex gap-2">
            <span className="w-14">Mois {m}</span>
            <span>N1 {((MONTHLY_RATES[m]![1] + bonus / MONTHLY_DURATION) * 100).toFixed(1)}%</span>
            <span>N2 {(MONTHLY_RATES[m]![2] * 100).toFixed(1)}%</span>
            <span>N3 {(MONTHLY_RATES[m]![3] * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    );
  }
  if (productType === "ANNUAL_SUB") {
    return (
      <div className="text-xs text-amber-700 flex gap-4">
        <span>N1 {((ANNUAL_RATES[1] + bonus) * 100).toFixed(0)}%</span>
        <span>N2 {(ANNUAL_RATES[2] * 100).toFixed(0)}%</span>
        <span>N3 {(ANNUAL_RATES[3] * 100).toFixed(0)}%</span>
      </div>
    );
  }
  if (productType === "COURSE") {
    return (
      <div className="text-xs text-amber-700 flex gap-4">
        <span>N1 {((COURSE_RATES[1] + bonus) * 100).toFixed(0)}%</span>
        <span>N2 {(COURSE_RATES[2] * 100).toFixed(0)}%</span>
        <span>N3 {(COURSE_RATES[3] * 100).toFixed(0)}%</span>
      </div>
    );
  }
  // SERVICE
  const n1Rate = serviceRate / 100;
  return (
    <div className="text-xs text-amber-700 flex gap-4">
      <span>N1 {((n1Rate + bonus) * 100).toFixed(0)}%</span>
      <span>N2 {(n1Rate * 0.5 * 100).toFixed(0)}%</span>
      <span>N3 {(n1Rate * 0.25 * 100).toFixed(0)}%</span>
    </div>
  );
}

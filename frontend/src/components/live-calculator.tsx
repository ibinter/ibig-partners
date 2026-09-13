"use client";
import { useState, useMemo } from "react";

const BRANCHES = [
  {
    key: "SOFT",
    label: "IBIG SOFT",
    emoji: "💻",
    desc: "Logiciels SaaS & ERP",
    avgPrice: 25000,
    priceNote: "abonnement mensuel moyen",
    n1: 0.20,
    n2: 0.10,
    n3: 0.05,
  },
  {
    key: "EDUFORM",
    label: "IBIG EDUFORM",
    emoji: "🎓",
    desc: "Formations certifiantes",
    avgPrice: 300000,
    priceNote: "par formation vendue",
    n1: 0.10,
    n2: 0.05,
    n3: 0.02,
  },
  {
    key: "IMMO",
    label: "IBIG IMMO TRUST",
    emoji: "🏠",
    desc: "Immobilier & BTP",
    avgPrice: 2000000,
    priceNote: "par transaction",
    n1: 0.05,
    n2: 0.03,
    n3: 0.01,
  },
  {
    key: "MARKET",
    label: "IBIG MARKET",
    emoji: "🛍️",
    desc: "Produits & équipements",
    avgPrice: 300000,
    priceNote: "par vente produit",
    n1: 0.08,
    n2: 0.04,
    n3: 0.02,
  },
  {
    key: "DIGITAL",
    label: "IBIG DIGITAL",
    emoji: "🚀",
    desc: "Sites, apps & digital",
    avgPrice: 850000,
    priceNote: "pack digital moyen",
    n1: 0.10,
    n2: 0.05,
    n3: 0.02,
  },
  {
    key: "CONSEIL",
    label: "IBIG CONSEIL+",
    emoji: "📊",
    desc: "Conseil, audit & juridique",
    avgPrice: 500000,
    priceNote: "par prestation",
    n1: 0.10,
    n2: 0.05,
    n3: 0.02,
  },
  {
    key: "MULTISERVICES",
    label: "IBIG MULTISERVICES",
    emoji: "🔧",
    desc: "Événementiel & services",
    avgPrice: 300000,
    priceNote: "par prestation",
    n1: 0.10,
    n2: 0.05,
    n3: 0.02,
  },
  {
    key: "FINANCEMENT",
    label: "IBIG FINANCEMENT",
    emoji: "💰",
    desc: "Microfinance & assurance",
    avgPrice: 400000,
    priceNote: "par produit financier",
    n1: 0.05,
    n2: 0.03,
    n3: 0.01,
  },
  {
    key: "EMPLOI",
    label: "IBIG EMPLOI & TALENTS",
    emoji: "🤝",
    desc: "Recrutement & RH",
    avgPrice: 250000,
    priceNote: "par mission",
    n1: 0.10,
    n2: 0.05,
    n3: 0.02,
  },
];

const STATUS_BONUS: Record<string, number> = {
  STARTER: 0,
  SILVER: 0.02,
  GOLD: 0.05,
  MASTER: 0.08,
  ELITE: 0.12,
};

export function LiveCalculator() {
  const [branchKey, setBranchKey] = useState("SOFT");
  const [sales, setSales] = useState(5);
  const [team, setTeam] = useState(2);
  const [teamSales, setTeamSales] = useState(3);
  const [status, setStatus] = useState<"STARTER" | "SILVER" | "GOLD" | "MASTER" | "ELITE">("SILVER");

  const branch = BRANCHES.find((b) => b.key === branchKey) ?? BRANCHES[0];
  const bonus = STATUS_BONUS[status];

  const result = useMemo(() => {
    const n1 = branch.n1 + bonus;
    const n2 = branch.n2 + bonus * 0.5;
    const ownIncome = sales * branch.avgPrice * n1;
    const teamIncome = team * teamSales * branch.avgPrice * n2;
    const total = ownIncome + teamIncome;
    const annual = total * 12;
    const gainPerSale = branch.avgPrice * n1;
    return { ownIncome, teamIncome, total, annual, gainPerSale };
  }, [branch, bonus, sales, team, teamSales]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";

  return (
    <div data-testid="live-calculator" className="card-premium overflow-hidden p-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <span className="text-xl">🧮</span>
          </span>
          <div>
            <p className="label-caps text-gold-400">Simulateur LIVE</p>
            <h3 className="font-extrabold text-lg leading-tight">Calculez vos gains en temps réel</h3>
          </div>
        </div>
      </div>

      {/* Sélecteur de branche */}
      <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
          Quelle branche voulez-vous promouvoir ?
        </p>
        <div className="flex flex-wrap gap-2">
          {BRANCHES.map((b) => (
            <button
              key={b.key}
              onClick={() => setBranchKey(b.key)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                branchKey === b.key
                  ? "bg-brand-600 text-white shadow-md"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600"
              }`}
            >
              <span>{b.emoji}</span>
              <span>{b.label}</span>
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
          <span>📌 {branch.desc}</span>
          <span>💸 Prix moyen : <strong className="text-slate-700">{fmt(branch.avgPrice)}</strong> {branch.priceNote}</span>
          <span>🎯 Commission N1 : <strong className="text-brand-600">{Math.round(branch.n1 * 100)}%</strong></span>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-2">
        {/* Sliders + statut */}
        <div className="space-y-5">
          <Slider
            label="Vos ventes mensuelles"
            value={sales}
            min={0}
            max={30}
            step={1}
            onChange={setSales}
            suffix="ventes"
            testid="slider-sales"
          />
          <Slider
            label="Filleuls directs actifs"
            value={team}
            min={0}
            max={20}
            step={1}
            onChange={setTeam}
            suffix="filleuls"
            testid="slider-team"
          />
          <Slider
            label="Ventes moyennes par filleul"
            value={teamSales}
            min={0}
            max={15}
            step={1}
            onChange={setTeamSales}
            suffix="ventes/filleul"
            testid="slider-team-sales"
          />

          {/* Statut */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Votre statut</p>
            <div className="grid grid-cols-5 gap-1">
              {(["STARTER", "SILVER", "GOLD", "MASTER", "ELITE"] as const).map((s) => (
                <button
                  key={s}
                  data-testid={`status-${s}`}
                  onClick={() => setStatus(s)}
                  className={`rounded-lg px-1.5 py-2 text-[10px] font-bold transition-all leading-tight ${
                    status === s
                      ? "bg-brand-600 text-white shadow-md scale-105"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span className="block text-center">
                    {s === "STARTER" && "⭐"}
                    {s === "SILVER" && "⭐⭐"}
                    {s === "GOLD" && "⭐⭐⭐"}
                    {s === "MASTER" && "🏆"}
                    {s === "ELITE" && "👑"}
                  </span>
                  <span className="block mt-0.5 truncate">{s}</span>
                  {bonus > 0 && status === s && (
                    <span className="block text-[9px] text-gold-300 font-extrabold">+{Math.round(bonus * 100)}%</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Gain par vente */}
          <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm">
            <p className="text-xs text-muted">Votre gain par vente ({branch.label})</p>
            <p className="font-extrabold text-brand-700 text-lg">{fmt(result.gainPerSale)}</p>
          </div>
        </div>

        {/* Résultat */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-brand-900 to-brand-800 p-6 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gold-400/10 blur-2xl" />
          <p className="label-caps text-gold-400 relative">Revenu mensuel estimé</p>
          <p
            data-testid="result-monthly"
            className="text-numeral mt-2 text-4xl text-white sm:text-5xl relative tracking-tight"
          >
            {fmt(result.total)}
          </p>

          <div className="mt-6 space-y-2 text-sm relative">
            <div className="flex justify-between">
              <span className="text-brand-200">
                Ventes directes ({sales} × {fmt(branch.avgPrice)} × {Math.round((branch.n1 + bonus) * 100)}%)
              </span>
              <span className="font-bold text-emerald-300 shrink-0 ml-2">{fmt(result.ownIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-200">
                Réseau N1 ({team} filleuls × {teamSales} ventes × {Math.round((branch.n2 + bonus * 0.5) * 100)}%)
              </span>
              <span className="font-bold text-sky-300 shrink-0 ml-2">{fmt(result.teamIncome)}</span>
            </div>
            <div className="my-2 h-px bg-white/10" />
            <div className="flex justify-between">
              <span className="text-brand-100 font-semibold">Sur 12 mois</span>
              <span className="font-bold text-gold-400 text-lg">{fmt(result.annual)}</span>
            </div>
          </div>

          <div className="mt-6 relative">
            <a
              data-testid="calc-cta"
              href="/rejoindre"
              className="block w-full rounded-xl bg-gold-400 px-5 py-3 text-center font-bold text-brand-900 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-gold-500"
            >
              Atteindre ce revenu → Inscription gratuite
            </a>
            <p className="mt-2 text-center text-[10px] text-brand-300">
              * Estimation basée sur les taux officiels {branch.label}. Prix moyen : {fmt(branch.avgPrice)} {branch.priceNote}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label, value, min, max, step, onChange, suffix, testid,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; suffix: string; testid: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</label>
        <span className="text-numeral text-lg text-brand-600">
          {value} <span className="text-xs font-normal text-muted">{suffix}</span>
        </span>
      </div>
      <input
        data-testid={testid}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #0b5fff 0%, #0b5fff ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`,
        }}
      />
    </div>
  );
}

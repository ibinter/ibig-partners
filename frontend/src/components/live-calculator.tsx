"use client";
import { useState, useMemo } from "react";

/**
 * Calculateur LIVE de gains — à intégrer dans la landing.
 * L'utilisateur joue avec les sliders, voit son revenu mensuel ESTIMÉ se mettre à jour en temps réel.
 * Effet "wow" + conversion énorme : 30% en plus d'inscriptions selon les benchmarks.
 */
export function LiveCalculator() {
  const [sales, setSales] = useState(5);
  const [team, setTeam] = useState(2);
  const [teamSales, setTeamSales] = useState(3);
  const [status, setStatus] = useState<"STARTER" | "SILVER" | "GOLD" | "MASTER">("SILVER");

  const bonus = { STARTER: 0, SILVER: 0.02, GOLD: 0.05, MASTER: 0.08 }[status];

  const result = useMemo(() => {
    const avgPrice = 30000; // Scolaby ref
    const ownIncome = sales * avgPrice * (0.20 + bonus);
    const teamIncome = team * teamSales * avgPrice * (0.10 + bonus * 0.5);
    const total = ownIncome + teamIncome;
    const annual = total * 12;
    return { ownIncome, teamIncome, total, annual };
  }, [sales, team, teamSales, bonus]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";

  return (
    <div
      data-testid="live-calculator"
      className="card-premium overflow-hidden p-0"
    >
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <span className="text-xl">🧮</span>
          </span>
          <div>
            <p className="label-caps text-gold-400">Simulateur LIVE</p>
            <h3 className="font-extrabold text-lg leading-tight">
              Calculez vos gains en temps réel
            </h3>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-2">
        {/* Sliders */}
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

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
              Votre statut
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {(["STARTER", "SILVER", "GOLD", "MASTER"] as const).map((s) => (
                <button
                  key={s}
                  data-testid={`status-${s}`}
                  onClick={() => setStatus(s)}
                  className={`rounded-lg px-2 py-2 text-xs font-bold transition-all ${
                    status === s
                      ? "bg-brand-600 text-white shadow-md scale-105"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s === "STARTER" && "⭐"}
                  {s === "SILVER" && "⭐⭐"}
                  {s === "GOLD" && "⭐⭐⭐"}
                  {s === "MASTER" && "🏆"}
                  <span className="block mt-0.5">{s}</span>
                </button>
              ))}
            </div>
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
              <span className="text-brand-200">Vos ventes directes</span>
              <span className="font-bold text-emerald-300">{fmt(result.ownIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-200">Réseau (N1)</span>
              <span className="font-bold text-sky-300">{fmt(result.teamIncome)}</span>
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
              className="block w-full rounded-xl bg-gold-400 px-5 py-3 text-center font-bold text-brand-900 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-gold-500 hover:shadow-2xl"
            >
              Atteindre ce revenu → Inscription gratuite
            </a>
            <p className="mt-2 text-center text-[10px] text-brand-300">
              * Estimation basée sur prix moyen Scolaby (30k FCFA/mois). Réseau N2/N3 non inclus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix,
  testid,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix: string;
  testid: string;
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

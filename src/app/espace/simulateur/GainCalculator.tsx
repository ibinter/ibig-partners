"use client";

import { useState, useMemo } from "react";
import { perSaleCommission } from "@/lib/simulate";
import { STATUSES, STATUS_LABELS, STATUS_BONUS } from "@/lib/constants";
import type { PricingType } from "@/lib/constants";
import { fcfa } from "@/lib/format";

const GOAL = 500000;

type Preset = {
  key: string;
  label: string;
  type: PricingType;
  amount: number;
  rate: number;
  hint: string;
};

const PRESETS: Preset[] = [
  { key: "scolaby-m", label: "SaaS mensuel (Scolaby)", type: "MONTHLY_SUB", amount: 30000, rate: 20, hint: "Abonnement mensuel — commissions sur 4 mois" },
  { key: "scolaby-a", label: "Abonnement annuel",      type: "ANNUAL_SUB",  amount: 300000, rate: 20, hint: "Versement unique à la confirmation" },
  { key: "formation", label: "Formation EduForm",       type: "COURSE",      amount: 100000, rate: 10, hint: "Versement unique" },
  { key: "immo",      label: "Immobilier (commission agence)", type: "SERVICE", amount: 1000000, rate: 25, hint: "⚠️ Base = commission de l'agence, pas le prix du bien" },
  { key: "service",   label: "Service / Prestation",    type: "SERVICE",     amount: 200000, rate: 15, hint: "Taux N1 selon le produit" },
];

const TYPE_LABELS: Record<PricingType, string> = {
  MONTHLY_SUB: "Abonnement mensuel (4 mois)",
  ANNUAL_SUB: "Abonnement annuel",
  COURSE: "Formation",
  SERVICE: "Service / Prestation",
  PRODUCT: "Produit",
};

export function GainCalculator({ initialStatus = "STARTER" }: { initialStatus?: string }) {
  const [presetKey, setPresetKey] = useState(PRESETS[1].key);
  const preset = PRESETS.find((p) => p.key === presetKey) ?? PRESETS[1];

  const [amount, setAmount] = useState(preset.amount);
  const [rate, setRate] = useState(preset.rate);
  const [status, setStatus] = useState(initialStatus);
  const [nDirect, setNDirect] = useState(5);
  const [nN2, setNN2] = useState(0);
  const [nN3, setNN3] = useState(0);

  function applyPreset(key: string) {
    const p = PRESETS.find((x) => x.key === key);
    if (!p) return;
    setPresetKey(key);
    setAmount(p.amount);
    setRate(p.rate);
  }

  const result = useMemo(() => {
    const per = perSaleCommission(preset.type, amount, rate, status);
    const totalN1 = per.n1 * nDirect;
    const totalN2 = per.n2 * nN2;
    const totalN3 = per.n3 * nN3;
    const total = totalN1 + totalN2 + totalN3;
    return { per, totalN1, totalN2, totalN3, total };
  }, [preset.type, amount, rate, status, nDirect, nN2, nN3]);

  const pctGoal = Math.min(100, Math.round((result.total / GOAL) * 100));
  const reached = result.total >= GOAL;
  const isService = preset.type === "SERVICE";
  const isMonthly = preset.type === "MONTHLY_SUB";

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      {/* Contrôles */}
      <div className="card-premium p-5 lg:col-span-3">
        <h3 className="mb-4 text-sm font-bold text-ink">Paramètres de simulation</h3>

        {/* Presets */}
        <p className="mb-2 text-xs font-semibold text-slate-600">Type de produit</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => applyPreset(p.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                presetKey === p.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="mb-4 text-xs text-muted">{preset.hint}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">
              {isService ? "Montant de base (commission agence / prestation)" : isMonthly ? "Prix mensuel (FCFA)" : "Prix de vente (FCFA)"}
            </span>
            <input
              type="number" min={0} value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
            />
          </label>

          {isService && (
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Taux N1 du produit (%)</span>
              <input
                type="number" min={0} max={100} value={rate}
                onChange={(e) => setRate(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Votre statut</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]} (+{Math.round((STATUS_BONUS[s] ?? 0) * 100)}%)
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Vos ventes directes (N1)</span>
            <input
              type="number" min={0} value={nDirect}
              onChange={(e) => setNDirect(Number(e.target.value) || 0)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Ventes de vos filleuls (N2)</span>
            <input
              type="number" min={0} value={nN2}
              onChange={(e) => setNN2(Number(e.target.value) || 0)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Ventes du réseau (N3)</span>
            <input
              type="number" min={0} value={nN3}
              onChange={(e) => setNN3(Number(e.target.value) || 0)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
            />
          </label>
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-muted">
          Commission par vente — N1 : <strong className="text-brand-700">{fcfa(result.per.n1)}</strong>
          {result.per.n2 > 0 && <> · N2 : <strong className="text-indigo-700">{fcfa(result.per.n2)}</strong></>}
          {result.per.n3 > 0 && <> · N3 : <strong className="text-violet-700">{fcfa(result.per.n3)}</strong></>}
          {isMonthly && <span className="ml-1">(cumulé sur 4 mois)</span>}
        </div>
      </div>

      {/* Résultats */}
      <div className="space-y-4 lg:col-span-2">
        <div className={`rounded-2xl p-6 text-white shadow-md ${reached ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-blue-600 to-blue-800"}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Revenu total estimé</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight">{fcfa(result.total)}</p>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-white/80">
              <span>Objectif {fcfa(GOAL)}</span>
              <span>{pctGoal}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white/90 transition-all" style={{ width: `${pctGoal}%` }} />
            </div>
          </div>
          <p className="mt-3 text-sm text-white/90">
            {reached
              ? "🎉 Objectif atteint ! Vous dépassez 500 000 FCFA."
              : `Il vous manque ${fcfa(GOAL - result.total)} pour atteindre 500 000 FCFA.`}
          </p>
        </div>

        <div className="card-premium p-5">
          <h4 className="mb-3 text-sm font-bold text-ink">Répartition</h4>
          <div className="space-y-2.5 text-sm">
            <Row label={`Ventes directes (N1) × ${nDirect}`} value={result.totalN1} color="text-brand-700" />
            <Row label={`Réseau N2 × ${nN2}`} value={result.totalN2} color="text-indigo-700" />
            <Row label={`Réseau N3 × ${nN3}`} value={result.totalN3} color="text-violet-700" />
            <div className="border-t border-slate-100 pt-2.5">
              <Row label="Total" value={result.total} color="text-ink" bold />
            </div>
          </div>
          {isMonthly && (
            <p className="mt-3 text-xs text-muted">
              Pour les abonnements mensuels, ce total est cumulé sur les 4 mois de versement.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, color, bold }: { label: string; value: number; color: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "font-bold text-ink" : "text-slate-600"}>{label}</span>
      <span className={`${color} ${bold ? "text-base font-extrabold" : "font-semibold"}`}>{fcfa(value)}</span>
    </div>
  );
}

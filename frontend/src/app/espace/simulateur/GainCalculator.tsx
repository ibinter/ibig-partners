"use client";

import { useState, useMemo } from "react";
import { perSaleCommission } from "@/lib/simulate";
import { STATUSES, STATUS_LABELS, STATUS_BONUS } from "@/lib/constants";
import type { PricingType } from "@/lib/constants";
import { fcfa } from "@/lib/format";

const GOAL = 500000;

export type SimProduct = {
  slug: string;
  name: string;
  branchName: string;
  price: number;
  pricingType: PricingType;
  rate: number;
};

const TYPE_LABELS: Record<PricingType, string> = {
  MONTHLY_SUB: "Abonnement mensuel (4 mois)",
  ANNUAL_SUB: "Abonnement annuel",
  COURSE: "Formation",
  SERVICE: "Service / Prestation",
  PRODUCT: "Produit",
};

const CUSTOM_KEY = "__custom__";

export function GainCalculator({ initialStatus = "STARTER", products }: { initialStatus?: string; products: SimProduct[] }) {
  const firstProduct = products[0];
  const [productKey, setProductKey] = useState(firstProduct?.slug ?? CUSTOM_KEY);
  const selectedProduct = products.find((p) => p.slug === productKey);
  const type: PricingType = selectedProduct?.pricingType ?? "SERVICE";

  const [amount, setAmount] = useState(firstProduct?.price ?? 100000);
  const [rate, setRate] = useState(firstProduct?.rate ?? 10);
  const [status, setStatus] = useState(initialStatus);
  const [nDirect, setNDirect] = useState(5);
  const [nN2, setNN2] = useState(0);
  const [nN3, setNN3] = useState(0);

  function applyProduct(slug: string) {
    setProductKey(slug);
    if (slug === CUSTOM_KEY) return;
    const p = products.find((x) => x.slug === slug);
    if (!p) return;
    setAmount(p.price);
    setRate(p.rate);
  }

  // Regroupement par branche pour le menu déroulant
  const byBranch = useMemo(() => {
    const map = new Map<string, SimProduct[]>();
    for (const p of products) {
      if (!map.has(p.branchName)) map.set(p.branchName, []);
      map.get(p.branchName)!.push(p);
    }
    return map;
  }, [products]);

  const result = useMemo(() => {
    const per = perSaleCommission(type, amount, rate, status);
    const totalN1 = per.n1 * nDirect;
    const totalN2 = per.n2 * nN2;
    const totalN3 = per.n3 * nN3;
    const total = totalN1 + totalN2 + totalN3;
    return { per, totalN1, totalN2, totalN3, total };
  }, [type, amount, rate, status, nDirect, nN2, nN3]);

  const pctGoal = Math.min(100, Math.round((result.total / GOAL) * 100));
  const reached = result.total >= GOAL;
  const isCustom = productKey === CUSTOM_KEY;
  const isMonthly = type === "MONTHLY_SUB";

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      {/* Contrôles */}
      <div className="card-premium p-5 lg:col-span-3">
        <h3 className="mb-4 text-sm font-bold text-ink">Paramètres de simulation</h3>

        {/* Sélection d'un vrai produit du catalogue */}
        <label className="mb-4 block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-600">Produit du catalogue IBIG</span>
          <select
            value={productKey}
            onChange={(e) => applyProduct(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          >
            {Array.from(byBranch.entries()).map(([branchName, items]) => (
              <optgroup key={branchName} label={branchName}>
                {items.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name} — {fcfa(p.price)}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value={CUSTOM_KEY}>Autre / montant personnalisé…</option>
          </select>
        </label>
        <p className="mb-4 text-xs text-muted">
          {isCustom
            ? "Renseignez librement un montant et un taux pour simuler un cas personnalisé."
            : `${TYPE_LABELS[type]} — taux N1 réel : ${rate}%`}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">
              {isMonthly ? "Prix mensuel (FCFA)" : "Prix / montant de base (FCFA)"}
            </span>
            <input
              type="number" min={0} value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              disabled={!isCustom}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500"
            />
          </label>

          {(isCustom || type === "SERVICE" || type === "PRODUCT") && (
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Taux N1 du produit (%)</span>
              <input
                type="number" min={0} max={100} value={rate}
                onChange={(e) => setRate(Number(e.target.value) || 0)}
                disabled={!isCustom}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500"
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

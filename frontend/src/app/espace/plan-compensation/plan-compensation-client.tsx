"use client";

import { useState } from "react";
import Link from "next/link";

// ── Constants (mirrors src/lib/constants.ts) ──────────────────────────────────
const MONTHLY_RATES: Record<number, Record<number, number>> = {
  1: { 1: 0.20, 2: 0.10, 3: 0.05 },
  2: { 1: 0.15, 2: 0.08, 3: 0.03 },
  3: { 1: 0.10, 2: 0.05, 3: 0.02 },
  4: { 1: 0.05, 2: 0.03, 3: 0.01 },
};
const ANNUAL_RATES: Record<number, number> = { 1: 0.20, 2: 0.08, 3: 0.03 };
const COURSE_RATES: Record<number, number> = { 1: 0.10, 2: 0.05, 3: 0.02 };
const STATUS_BONUS: Record<string, number> = {
  STARTER: 0, SILVER: 0.02, GOLD: 0.05, MASTER: 0.08, ELITE: 0.12,
};
const STATUS_RULES = {
  STARTER: { sales: 0,   direct: 0,  team: 0   },
  SILVER:  { sales: 10,  direct: 0,  team: 0   },
  GOLD:    { sales: 25,  direct: 10, team: 20  },
  MASTER:  { sales: 50,  direct: 25, team: 50  },
  ELITE:   { sales: 100, direct: 50, team: 100 },
};

const STATUSES = [
  { key: "STARTER", label: "Starter",       stars: "⭐",    gradient: "from-slate-500 to-slate-600",    ring: "ring-slate-300" },
  { key: "SILVER",  label: "Silver",        stars: "⭐⭐",  gradient: "from-blue-400 to-blue-600",      ring: "ring-blue-300"  },
  { key: "GOLD",    label: "Gold",          stars: "⭐⭐⭐", gradient: "from-amber-400 to-yellow-500",   ring: "ring-amber-300" },
  { key: "MASTER",  label: "Master",        stars: "🏆",    gradient: "from-violet-500 to-purple-700",  ring: "ring-violet-300"},
  { key: "ELITE",   label: "Elite",         stars: "👑",    gradient: "from-yellow-400 to-orange-500",  ring: "ring-yellow-300"},
];

// Exemples concrets avec 3 types de produits
const EXAMPLES = [
  {
    name: "IBIG SOFT RH (abonnement mensuel)",
    type: "MONTHLY_SUB",
    price: 45000,
    serviceRate: 0,
    icon: "⚙️",
    desc: "Logiciel de gestion RH pour PME · 45 000 F/mois",
  },
  {
    name: "Formation Finance d'Entreprise",
    type: "COURSE",
    price: 250000,
    serviceRate: 0,
    icon: "🎓",
    desc: "Formation catalogue IBIG EDUFORM · 250 000 F",
  },
  {
    name: "Terrain Résidentiel Abidjan",
    type: "SERVICE",
    price: 5000000,
    serviceRate: 10,
    icon: "🏠",
    desc: "IBIG IMMO TRUST · taux N1 = 10%",
  },
];

function pct(n: number) { return (n * 100).toFixed(1).replace(".0", "") + "%"; }
const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " F";

function calcExample(ex: typeof EXAMPLES[0], status: string) {
  const bonus = STATUS_BONUS[status] ?? 0;
  if (ex.type === "COURSE") {
    return {
      n1: ex.price * (COURSE_RATES[1] + bonus),
      n2: ex.price * COURSE_RATES[2],
      n3: ex.price * COURSE_RATES[3],
    };
  }
  if (ex.type === "SERVICE") {
    const r = ex.serviceRate / 100;
    return { n1: ex.price * (r + bonus), n2: ex.price * r * 0.5, n3: ex.price * r * 0.25 };
  }
  // MONTHLY_SUB — total 4 mois
  let n1 = 0, n2 = 0, n3 = 0;
  for (let m = 1; m <= 4; m++) {
    n1 += ex.price * (MONTHLY_RATES[m]![1] + bonus / 4);
    n2 += ex.price * MONTHLY_RATES[m]![2];
    n3 += ex.price * MONTHLY_RATES[m]![3];
  }
  return { n1, n2, n3 };
}

export default function PlanCompensationClient({ userStatus }: { userStatus: string }) {
  const [activeStatus, setActiveStatus] = useState(userStatus || "STARTER");
  const [activeExample, setActiveExample] = useState(0);

  const currentStatusIdx = STATUSES.findIndex(s => s.key === activeStatus);
  const nextStatus = STATUSES[currentStatusIdx + 1];
  const rules = STATUS_RULES[activeStatus as keyof typeof STATUS_RULES];
  const bonus = STATUS_BONUS[activeStatus] ?? 0;
  const ex = EXAMPLES[activeExample];
  const exResult = calcExample(ex, activeStatus);

  return (
    <div className="space-y-8 max-w-5xl">

      {/* ── HERO ── */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-1">IBIG PARTNERS — Multi-niveaux</p>
        <h2 className="text-2xl font-extrabold mb-2">Le système de commission le plus transparent d&apos;Afrique.</h2>
        <p className="text-sm text-white/70 max-w-2xl leading-relaxed">
          3 niveaux. 5 statuts. Des taux croissants. Plus vous vendez et recrutez, plus vous gagnez —
          sur vos propres ventes ET sur celles de votre équipe, jusqu&apos;à 3 générations.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="rounded-xl bg-white/10 px-4 py-2 text-center">
            <p className="text-xl font-extrabold">3</p>
            <p className="text-[10px] text-white/60 uppercase tracking-wide">Niveaux de commission</p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-2 text-center">
            <p className="text-xl font-extrabold">5</p>
            <p className="text-[10px] text-white/60 uppercase tracking-wide">Statuts</p>
          </div>
          <div className="rounded-xl bg-emerald-500/20 px-4 py-2 text-center">
            <p className="text-xl font-extrabold text-emerald-300">+12%</p>
            <p className="text-[10px] text-white/60 uppercase tracking-wide">Bonus Elite max</p>
          </div>
          <div className="rounded-xl bg-amber-500/20 px-4 py-2 text-center">
            <p className="text-xl font-extrabold text-amber-300">90j</p>
            <p className="text-[10px] text-white/60 uppercase tracking-wide">Cookie tracking</p>
          </div>
        </div>
      </div>

      {/* ── PRINCIPE DES 3 NIVEAUX ── */}
      <section className="space-y-4">
        <h2 className="text-sm font-extrabold text-slate-800">Comment fonctionnent les 3 niveaux ?</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { level: "N1", label: "Vous vendez directement", icon: "💼", desc: "Vous recommandez un produit, le client signe. Vous touchez la commission de Niveau 1 — la plus élevée.", bg: "bg-blue-50 border-blue-200", text: "text-blue-800" },
            { level: "N2", label: "Votre filleul vend", icon: "👥", desc: "Un partenaire que vous avez recruté fait une vente. Vous touchez une commission de Niveau 2 automatiquement.", bg: "bg-purple-50 border-purple-200", text: "text-purple-800" },
            { level: "N3", label: "Le filleul de votre filleul", icon: "🌐", desc: "Le filleul de votre filleul réalise une vente. Vous touchez une commission de Niveau 3 — jusqu'à 3 générations.", bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-800" },
          ].map(l => (
            <div key={l.level} className={`rounded-2xl border p-4 ${l.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{l.icon}</span>
                <div>
                  <p className={`text-xs font-extrabold uppercase tracking-wide ${l.text}`}>{l.level}</p>
                  <p className={`text-sm font-bold ${l.text}`}>{l.label}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{l.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── GRILLES DE TAUX ── */}
      <section className="space-y-4">
        <h2 className="text-sm font-extrabold text-slate-800">Grilles de taux par type de produit</h2>
        <div className="grid gap-4 sm:grid-cols-2">

          {/* Abonnement mensuel */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
              <p className="text-xs font-bold text-white/80 uppercase tracking-wide">🔄 Abonnement mensuel (SaaS)</p>
              <p className="text-[10px] text-blue-200">Commissions sur 4 mois · dégressives</p>
            </div>
            <table className="w-full text-xs">
              <thead><tr className="border-b border-slate-100">
                <th className="px-3 py-2 text-left text-slate-400 font-bold uppercase tracking-wide">Mois</th>
                <th className="px-3 py-2 text-center text-blue-600 font-bold">N1</th>
                <th className="px-3 py-2 text-center text-purple-600 font-bold">N2</th>
                <th className="px-3 py-2 text-center text-indigo-600 font-bold">N3</th>
              </tr></thead>
              <tbody>
                {[1,2,3,4].map(m => (
                  <tr key={m} className="border-b border-slate-50 last:border-0">
                    <td className="px-3 py-2 text-slate-500">Mois {m}</td>
                    <td className="px-3 py-2 text-center font-bold text-blue-700">{pct(MONTHLY_RATES[m]![1])}</td>
                    <td className="px-3 py-2 text-center text-purple-600">{pct(MONTHLY_RATES[m]![2])}</td>
                    <td className="px-3 py-2 text-center text-indigo-600">{pct(MONTHLY_RATES[m]![3])}</td>
                  </tr>
                ))}
                <tr className="bg-blue-50">
                  <td className="px-3 py-2 text-blue-700 font-bold">Total</td>
                  <td className="px-3 py-2 text-center font-extrabold text-blue-700">{pct(0.50)}</td>
                  <td className="px-3 py-2 text-center font-bold text-purple-600">{pct(0.26)}</td>
                  <td className="px-3 py-2 text-center font-bold text-indigo-600">{pct(0.11)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Annuel */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-emerald-700 px-4 py-3">
              <p className="text-xs font-bold text-white/80 uppercase tracking-wide">📅 Abonnement annuel</p>
              <p className="text-[10px] text-teal-200">One-shot à la signature</p>
            </div>
            <table className="w-full text-xs">
              <thead><tr className="border-b border-slate-100">
                <th className="px-3 py-2 text-left text-slate-400 font-bold uppercase tracking-wide">Niveau</th>
                <th className="px-3 py-2 text-center font-bold">Taux</th>
                <th className="px-3 py-2 text-center text-slate-400">Exemple 200k</th>
              </tr></thead>
              <tbody>
                {[1,2,3].map(l => (
                  <tr key={l} className="border-b border-slate-50 last:border-0">
                    <td className={`px-3 py-2 font-bold ${l===1?"text-blue-700":l===2?"text-purple-600":"text-indigo-600"}`}>Niveau {l}</td>
                    <td className={`px-3 py-2 text-center font-extrabold ${l===1?"text-blue-700":l===2?"text-purple-600":"text-indigo-600"}`}>{pct(ANNUAL_RATES[l])}</td>
                    <td className="px-3 py-2 text-center text-slate-500">{fmt(200000 * ANNUAL_RATES[l])}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-3 mt-0">
              <p className="text-xs font-bold text-white/80 uppercase tracking-wide">🎓 Formation / Cours</p>
              <p className="text-[10px] text-amber-200">One-shot · catalogue IBIG EDUFORM</p>
            </div>
            <table className="w-full text-xs">
              <thead><tr className="border-b border-slate-100">
                <th className="px-3 py-2 text-left text-slate-400 font-bold uppercase tracking-wide">Niveau</th>
                <th className="px-3 py-2 text-center font-bold">Taux</th>
                <th className="px-3 py-2 text-center text-slate-400">Exemple 250k</th>
              </tr></thead>
              <tbody>
                {[1,2,3].map(l => (
                  <tr key={l} className="border-b border-slate-50 last:border-0">
                    <td className={`px-3 py-2 font-bold ${l===1?"text-amber-700":l===2?"text-orange-600":"text-rose-600"}`}>Niveau {l}</td>
                    <td className={`px-3 py-2 text-center font-extrabold ${l===1?"text-amber-700":l===2?"text-orange-600":"text-rose-600"}`}>{pct(COURSE_RATES[l])}</td>
                    <td className="px-3 py-2 text-center text-slate-500">{fmt(250000 * COURSE_RATES[l])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Services */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden sm:col-span-2">
            <div className="bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-3">
              <p className="text-xs font-bold text-white/80 uppercase tracking-wide">🛠️ Services & Produits (taux variable)</p>
              <p className="text-[10px] text-rose-200">N1 = taux du produit · N2 = N1 × 50% · N3 = N1 × 25%</p>
            </div>
            <div className="p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { branch: "IBIG IMMO TRUST", rate: 10, example: 5000000 },
                  { branch: "IBIG CONSEIL+",   rate: 20, example: 500000 },
                  { branch: "IBIG DIGITAL",    rate: 15, example: 300000 },
                ].map(r => (
                  <div key={r.branch} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-2">{r.branch}</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-blue-600 font-bold">N1 ({r.rate}%)</span><span className="font-bold text-slate-700">{fmt(r.example * r.rate / 100)}</span></div>
                      <div className="flex justify-between"><span className="text-purple-600">N2 ({r.rate/2}%)</span><span className="text-slate-500">{fmt(r.example * r.rate / 200)}</span></div>
                      <div className="flex justify-between"><span className="text-indigo-600">N3 ({r.rate/4}%)</span><span className="text-slate-400">{fmt(r.example * r.rate / 400)}</span></div>
                      <div className="border-t border-slate-200 pt-1 text-[10px] text-slate-400">Exemple : {fmt(r.example)} de vente</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BONUS DE STATUT ── */}
      <section className="space-y-4">
        <h2 className="text-sm font-extrabold text-slate-800">Bonus de statut — plus vous progressez, plus vous gagnez</h2>
        <p className="text-xs text-slate-400">Le bonus s&apos;ajoute à votre taux N1 sur TOUS les types de produits.</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map(s => (
            <button key={s.key} onClick={() => setActiveStatus(s.key)}
              className={`rounded-2xl border-2 px-5 py-3 text-center transition font-bold ${activeStatus === s.key ? `bg-gradient-to-br ${s.gradient} text-white border-transparent shadow-lg` : `border-slate-200 bg-white text-slate-600 hover:border-slate-300 ${s.ring}`}`}>
              <p className="text-base">{s.stars}</p>
              <p className="text-xs">{s.label}</p>
              <p className={`text-xs font-bold mt-0.5 ${activeStatus === s.key ? "text-white/80" : "text-emerald-600"}`}>
                +{((STATUS_BONUS[s.key] ?? 0) * 100).toFixed(0)}%
              </p>
            </button>
          ))}
        </div>

        {/* Détail statut sélectionné */}
        <div className={`rounded-2xl bg-gradient-to-br ${STATUSES[currentStatusIdx]?.gradient ?? "from-slate-500 to-slate-600"} p-5 text-white`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-lg font-extrabold">{STATUSES[currentStatusIdx]?.stars} {STATUSES[currentStatusIdx]?.label}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                <span className="rounded-lg bg-white/20 px-3 py-1">
                  {rules.sales > 0 ? `${rules.sales} ventes confirmées` : "Inscription gratuite"}
                </span>
                {rules.direct > 0 && <span className="rounded-lg bg-white/20 px-3 py-1">{rules.direct} filleuls directs</span>}
                {rules.team > 0 && <span className="rounded-lg bg-white/20 px-3 py-1">{rules.team} actifs équipe</span>}
              </div>
              <p className="mt-2 text-sm text-white/80">
                Bonus N1 : <span className="font-extrabold text-white">+{(bonus * 100).toFixed(0)}%</span> sur tous vos taux
              </p>
            </div>
            {nextStatus && (
              <div className="text-right text-sm text-white/70">
                <p className="text-[10px] uppercase tracking-wide mb-1">Prochain niveau</p>
                <p className="font-extrabold text-white">{nextStatus.label}</p>
                <p>Bonus → +{((STATUS_BONUS[nextStatus.key] ?? 0) * 100).toFixed(0)}%</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── EXEMPLE CONCRET ── */}
      <section className="space-y-4">
        <h2 className="text-sm font-extrabold text-slate-800">Exemples concrets — ce que vous gagnez par vente</h2>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((e, i) => (
            <button key={i} onClick={() => setActiveExample(i)}
              className={`rounded-xl border px-4 py-2 text-xs font-bold transition ${activeExample === i ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
              {e.icon} {e.name.split(" (")[0]}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4 bg-slate-50">
            <p className="font-bold text-slate-800 text-sm">{ex.icon} {ex.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{ex.desc}</p>
          </div>
          <div className="p-5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-3">
              Commission pour statut : {STATUSES[currentStatusIdx]?.label} (bonus +{(bonus * 100).toFixed(0)}%)
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { level: "N1 — Votre vente directe", value: exResult.n1, color: "bg-blue-600", light: "bg-blue-50 border-blue-200 text-blue-800" },
                { level: "N2 — Votre filleul vend", value: exResult.n2, color: "bg-purple-600", light: "bg-purple-50 border-purple-200 text-purple-800" },
                { level: "N3 — Votre filleul² vend", value: exResult.n3, color: "bg-indigo-600", light: "bg-indigo-50 border-indigo-200 text-indigo-800" },
              ].map(r => (
                <div key={r.level} className={`rounded-2xl border p-4 ${r.light}`}>
                  <p className="text-[10px] font-bold uppercase tracking-wide opacity-70 mb-1">{r.level}</p>
                  <p className="text-2xl font-extrabold">{fmt(r.value)}</p>
                  <div className="mt-2 w-full h-1.5 rounded-full bg-black/10 overflow-hidden">
                    <div className={`h-full rounded-full ${r.color}`}
                      style={{ width: `${(r.value / (exResult.n1 || 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 p-3 flex items-center justify-between">
              <p className="text-sm text-emerald-800">Si 5 ventes N1 + 10 filleuls N1 (2 ventes chacun) + 20 N2 (1 vente)</p>
              <p className="text-lg font-extrabold text-emerald-700 shrink-0 ml-4">
                {fmt(5 * exResult.n1 + 10 * 2 * exResult.n2 + 20 * 1 * exResult.n3)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROGRESSION LADDER ── */}
      <section className="space-y-4">
        <h2 className="text-sm font-extrabold text-slate-800">Votre trajectoire de progression</h2>
        <div className="relative">
          <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gradient-to-b from-slate-200 via-violet-300 to-yellow-400" />
          <div className="space-y-4 pl-12 relative">
            {STATUSES.map((s, i) => {
              const r = STATUS_RULES[s.key as keyof typeof STATUS_RULES];
              const isCurrent = s.key === userStatus;
              return (
                <div key={s.key} className={`rounded-2xl border p-4 transition ${isCurrent ? "border-blue-400 bg-blue-50 ring-1 ring-blue-200" : "border-slate-100 bg-white"}`}>
                  <div className="absolute left-3.5 -translate-x-1/2 w-3 h-3 rounded-full border-2"
                    style={{ top: `${i * 88 + 24}px`, borderColor: isCurrent ? "#3b82f6" : "#e2e8f0", backgroundColor: isCurrent ? "#3b82f6" : "white" }} />
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className={`shrink-0 rounded-full bg-gradient-to-br ${s.gradient} w-10 h-10 flex items-center justify-center text-lg`}>
                      {s.stars.slice(-2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-800 text-sm">{s.label}</p>
                        {isCurrent && <span className="rounded-full bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-wide">Mon statut actuel</span>}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {r.sales > 0 ? `${r.sales} ventes` : "Dès l'inscription"}
                        {r.direct > 0 && ` · ${r.direct} filleuls directs`}
                        {r.team > 0 && ` · ${r.team} actifs équipe`}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-slate-400">Bonus N1</p>
                      <p className="text-sm font-extrabold text-emerald-600">
                        +{((STATUS_BONUS[s.key] ?? 0) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 p-6 text-white text-center">
        <p className="text-lg font-extrabold mb-2">Simulez vos revenus en temps réel</p>
        <p className="text-sm text-white/80 mb-4 max-w-lg mx-auto">
          Entrez votre situation (ventes, filleuls, statut) et voyez exactement ce que vous pouvez gagner.
        </p>
        <Link href="/espace/simulateur"
          className="inline-block rounded-xl bg-white text-blue-700 font-bold text-sm px-6 py-3 hover:bg-blue-50 transition shadow-lg">
          Ouvrir le simulateur →
        </Link>
      </div>

    </div>
  );
}

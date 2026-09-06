"use client";

import { useState } from "react";
import { fcfa, formatDate } from "@/lib/format";

const CATEGORY_LABELS: Record<string, string> = {
  FORMATION: "Formation", DIGITAL: "Digital / IT", IMMOBILIER: "Immobilier",
  PARTENARIAT: "Partenariat", COMMERCIAL: "Commercial", CONSEIL: "Conseil",
  FINANCEMENT: "Financement", EMPLOI_RH: "Emploi / RH",
  FOURNISSEUR: "Fournisseur", INVESTISSEMENT: "Investissement",
  BTP: "BTP", AGRICULTURE: "Agriculture", TRANSPORT: "Transport",
  TECHNOLOGIE: "Technologie", LOGICIEL: "Logiciel / ERP",
  AUTRE: "Autre",
};

const CATEGORIES = Object.keys(CATEGORY_LABELS);

const STATUS_INFO: Record<string, { label: string; color: string }> = {
  NEW:      { label: "En attente",  color: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "Approuvé",   color: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Non retenu", color: "bg-rose-100 text-rose-700" },
  FULFILLED:{ label: "Comblé ✓",  color: "bg-emerald-100 text-emerald-700" },
  CLOSED:   { label: "Clôturé",    color: "bg-slate-100 text-slate-500" },
};

type MyRow = {
  id: string; code: string; title: string; category: string; description: string;
  budget: number; location: string; status: string; visibility: string;
  adminNote: string; commission: number; commissionType: string;
  responseCount: number; createdAt: string;
};
type PublicRow = {
  id: string; code: string; title: string; category: string; description: string;
  budget: number; location: string; adminNote: string;
  commission: number; commissionType: string;
  responseCount: number; createdAt: string; hasResponded: boolean;
};

export default function BesoinsAffilieClient({
  myRows, publicRows, submitAction, respondAction,
}: {
  myRows: MyRow[];
  publicRows: PublicRow[];
  submitAction: (fd: FormData) => Promise<void>;
  respondAction: (fd: FormData) => Promise<void>;
}) {
  const [tab, setTab] = useState<"public" | "mine" | "submit">("public");
  const [submitting, setSubmitting] = useState(false);
  const [responding, setResponding] = useState<string | null>(null);
  const [msgMap, setMsgMap] = useState<Record<string, string>>({});
  const [responded, setResponded] = useState<Set<string>>(
    new Set(publicRows.filter(r => r.hasResponded).map(r => r.id))
  );

  const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    await submitAction(fd);
    (e.target as HTMLFormElement).reset();
    setSubmitting(false);
    setTab("mine");
  }

  async function handleRespond(row: PublicRow) {
    const msg = (msgMap[row.id] ?? "").trim();
    const fd = new FormData();
    fd.append("needId", row.id);
    fd.append("message", msg);
    await respondAction(fd);
    setResponded(prev => new Set([...prev, row.id]));
    setResponding(null);
    setMsgMap(prev => ({ ...prev, [row.id]: "" }));
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: "public", label: `🔍 Besoins du réseau (${publicRows.length})` },
          { key: "mine",   label: `📋 Mes besoins (${myRows.length})` },
          { key: "submit", label: "➕ Publier un besoin" },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${tab === t.key ? "bg-brand-600 text-white shadow" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Réseau public ── */}
      {tab === "public" && (
        <div className="space-y-4">
          {publicRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-semibold text-slate-600">Aucun besoin publié pour le moment</p>
              <p className="text-sm text-slate-400 mt-1">Revenez bientôt — les besoins approuvés par IBIG apparaissent ici.</p>
            </div>
          ) : publicRows.map(row => {
            const alreadyIn = responded.has(row.id);
            const isOpen = responding === row.id;
            return (
              <div key={row.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    {row.code && <p className="text-[10px] font-mono font-bold text-blue-600 mb-0.5">{row.code}</p>}
                    <p className="font-bold text-slate-900 text-base">{row.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                        {CATEGORY_LABELS[row.category] ?? row.category}
                      </span>
                      {row.location && (
                        <span className="text-xs text-slate-400">📍 {row.location}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {row.budget > 0 && (
                      <>
                        <p className="text-xs text-slate-400">Budget</p>
                        <p className="font-extrabold text-slate-800 text-base">{fcfa(row.budget)}</p>
                      </>
                    )}
                    {row.commission > 0 && (
                      <p className="text-xs font-bold text-emerald-600 mt-1">
                        Commission : {row.commissionType === "FIXED" ? fcfa(row.commission) : `${row.commission}%`}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">{row.description}</p>

                <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                  <span>📅 {formatDate(row.createdAt)}</span>
                  <span>💬 {row.responseCount} réponse{row.responseCount !== 1 ? "s" : ""}</span>
                </div>

                {row.adminNote && (
                  <div className="rounded-xl bg-brand-50 border border-brand-100 px-4 py-2 text-sm text-brand-700">
                    <span className="font-semibold">Note IBIG :</span> {row.adminNote}
                  </div>
                )}

                {alreadyIn ? (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-2 text-sm text-emerald-700 font-semibold">
                    ✅ Vous avez répondu à ce besoin — l'équipe IBIG vous contactera si correspondance.
                  </div>
                ) : isOpen ? (
                  <div className="space-y-2">
                    <textarea
                      value={msgMap[row.id] ?? ""}
                      onChange={e => setMsgMap(prev => ({ ...prev, [row.id]: e.target.value }))}
                      rows={3}
                      placeholder="Expliquez comment vous pouvez répondre à ce besoin — vos ressources, réseau, compétences disponibles…"
                      className={inputCls + " resize-none"}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespond(row)}
                        className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700 transition-colors">
                        Envoyer ma réponse ↗
                      </button>
                      <button
                        onClick={() => setResponding(null)}
                        className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200">
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setResponding(row.id)}
                    className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition-colors">
                    🤝 Je peux répondre à ce besoin
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Mes besoins ── */}
      {tab === "mine" && (
        <div className="space-y-3">
          {myRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="font-semibold text-slate-600">Aucun besoin publié</p>
              <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                Publiez ce que vous recherchez — l'équipe IBIG et le réseau de partenaires peuvent vous connecter.
              </p>
              <button onClick={() => setTab("submit")} className="mt-4 rounded-xl bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700">
                ➕ Publier un besoin
              </button>
            </div>
          ) : myRows.map(row => {
            const s = STATUS_INFO[row.status] ?? { label: row.status, color: "bg-slate-100 text-slate-600" };
            return (
              <div key={row.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    {row.code && <p className="text-[10px] font-mono font-bold text-blue-600">{row.code}</p>}
                    <p className="font-semibold text-slate-900 truncate">{row.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-slate-400">{CATEGORY_LABELS[row.category] ?? row.category}</span>
                      {row.location && <span className="text-xs text-slate-400">· {row.location}</span>}
                      <span className="text-xs text-slate-400">· {formatDate(row.createdAt)}</span>
                    </div>
                    {row.adminNote && (
                      <p className="text-xs text-brand-600 mt-1 truncate">💬 {row.adminNote}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {row.responseCount > 0 && (
                      <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        {row.responseCount}
                      </span>
                    )}
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.color}`}>{s.label}</span>
                    {row.budget > 0 && (
                      <span className="text-xs font-bold text-slate-600">{fcfa(row.budget)}</span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{row.description}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Publier ── */}
      {tab === "submit" && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 max-w-2xl">
          <p className="font-bold text-slate-900 text-base mb-1">Publier un besoin</p>
          <p className="text-sm text-slate-500 mb-5">
            Décrivez ce que vous recherchez. IBIG examine votre demande et mobilise son réseau pour vous trouver la bonne connexion.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Ce que je recherche <span className="text-rose-500">*</span></label>
              <input name="title" required placeholder="Ex : Investisseur pour projet immobilier 100 M FCFA" className={inputCls} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Catégorie</label>
                <select name="category" className={inputCls}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Localisation</label>
                <input name="location" placeholder="Ex : Abidjan, Côte d'Ivoire" className={inputCls} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description complète <span className="text-rose-500">*</span></label>
              <textarea
                name="description"
                required
                rows={4}
                placeholder="Détaillez votre besoin : quantité, délai, conditions, profil recherché, ce que vous offrez en échange…"
                className={inputCls + " resize-none"}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Budget disponible (FCFA)</label>
              <input name="budget" type="number" min="0" placeholder="Ex : 50000000" className={inputCls} />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60 transition-colors">
              {submitting ? "Envoi en cours…" : "📋 Soumettre mon besoin à IBIG"}
            </button>
            <p className="text-xs text-slate-400 text-center">
              IBIG examinera votre besoin et le diffusera au réseau si approuvé. Vous serez notifié(e) dans les 48h.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}

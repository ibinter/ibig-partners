"use client";

import { useState } from "react";
import { fcfa, formatDate } from "@/lib/format";

const CATEGORY_LABELS: Record<string, string> = {
  FORMATION: "Formation", DIGITAL: "Digital / IT", IMMOBILIER: "Immobilier",
  PARTENARIAT: "Partenariat", COMMERCIAL: "Commercial", CONSEIL: "Conseil",
  FINANCEMENT: "Financement", EMPLOI_RH: "Emploi / RH",
  FOURNISSEUR: "Fournisseur", INVESTISSEMENT: "Investissement",
  BTP: "BTP", AGRICULTURE: "Agriculture", TRANSPORT: "Transport",
  TECHNOLOGIE: "Technologie", LOGICIEL: "Logiciel / ERP", AUTRE: "Autre",
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "Nouveau", APPROVED: "Approuvé", REJECTED: "Non retenu",
  FULFILLED: "Comblé", CLOSED: "Clôturé",
};
const STATUS_STYLES: Record<string, string> = {
  NEW:      "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  FULFILLED:"bg-blue-50 text-blue-700 border-blue-200",
  CLOSED:   "bg-slate-50 text-slate-500 border-slate-200",
};

type Row = {
  id: string; title: string; category: string; description: string;
  budget: number; location: string; status: string; visibility: string;
  adminNote: string; commission: number; commissionType: string;
  responseCount: number; createdAt: string;
  partnerName: string; partnerCode: string; partnerPhone: string;
};

export default function BesoinsAdminClient({
  rows, approveAction, rejectAction, updateAction,
}: {
  rows: Row[];
  approveAction: (fd: FormData) => Promise<void>;
  rejectAction: (fd: FormData) => Promise<void>;
  updateAction: (fd: FormData) => Promise<void>;
}) {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  const filtered = rows.filter(r => {
    const matchStatus = filter === "ALL" || r.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) || r.partnerName.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {
    ALL: rows.length,
    NEW: rows.filter(r => r.status === "NEW").length,
    APPROVED: rows.filter(r => r.status === "APPROVED").length,
    REJECTED: rows.filter(r => r.status === "REJECTED").length,
  };

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-wrap gap-2 items-center">
        {(["ALL", "NEW", "APPROVED", "REJECTED"] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${filter === s ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {s === "ALL" ? "Tous" : STATUS_LABELS[s]} ({counts[s]})
          </button>
        ))}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher…"
          className="ml-auto rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-400 w-48"
        />
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white py-16 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-slate-500 text-sm">Aucun besoin trouvé.</p>
          </div>
        )}

        {filtered.map(n => {
          const isExpanded = expanded === n.id;
          const isEditing  = editing === n.id;

          return (
            <div key={n.id}
              className={`rounded-2xl border bg-white shadow-sm transition-all ${n.status === "NEW" ? "border-amber-200" : "border-slate-100"}`}>

              {/* Header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : n.id)}
                className="w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-slate-50/50 rounded-2xl transition-colors">
                <span className={`mt-0.5 shrink-0 rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[n.status]}`}>
                  {STATUS_LABELS[n.status]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm leading-snug">{n.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[10px] text-blue-600 font-semibold">{CATEGORY_LABELS[n.category] ?? n.category}</span>
                    {n.location && <span className="text-xs text-slate-400">📍 {n.location}</span>}
                    <p className="text-xs text-slate-400 truncate">{n.description.slice(0, 60)}…</p>
                  </div>
                </div>
                <div className="shrink-0 text-right ml-3">
                  {n.budget > 0 ? (
                    <p className="text-sm font-bold text-slate-700">{fcfa(n.budget)}</p>
                  ) : (
                    <p className="text-xs text-slate-400">Budget n/c</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(n.createdAt)}</p>
                </div>
                <span className={`shrink-0 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>▼</span>
              </button>

              {/* Détail */}
              {isExpanded && (
                <div className="border-t border-slate-100 px-5 py-4 space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Partenaire</p>
                      <p className="text-sm font-semibold text-slate-700">{n.partnerName}</p>
                      <p className="text-xs font-mono text-slate-400">{n.partnerCode}</p>
                      {n.partnerPhone && (
                        <a href={`https://wa.me/${n.partnerPhone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline">
                          📱 {n.partnerPhone}
                        </a>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Budget</p>
                      <p className="text-sm font-bold text-slate-700">
                        {n.budget > 0 ? fcfa(n.budget) : <span className="text-slate-400 italic">Non renseigné</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Réponses reçues</p>
                      <p className="text-sm font-bold text-blue-600">{n.responseCount}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Description</p>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{n.description}</p>
                  </div>

                  {n.adminNote && (
                    <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-2 text-sm text-blue-700">
                      <span className="font-semibold">Note admin :</span> {n.adminNote}
                    </div>
                  )}

                  {/* Panneau approbation pour NEW */}
                  {n.status === "NEW" && (
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600 mb-3">⚡ Décision IBIG</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <form action={async (fd) => { await approveAction(fd); }}
                          className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 space-y-2">
                          <input type="hidden" name="id" value={n.id} />
                          <p className="text-xs font-bold text-emerald-700">✅ Approuver & publier</p>
                          <input name="adminNote" placeholder="Note pour le partenaire (optionnel)"
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-400" />
                          <div className="flex gap-2">
                            <input name="commission" type="number" min="0" placeholder="Commission (FCFA)"
                              className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-400" />
                            <select name="commissionType"
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-400">
                              <option value="FIXED">FCFA</option>
                              <option value="PERCENT">%</option>
                            </select>
                          </div>
                          <button type="submit"
                            className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 transition">
                            Approuver →
                          </button>
                        </form>

                        <form action={async (fd) => { await rejectAction(fd); }}
                          className="rounded-xl border border-rose-200 bg-rose-50 p-3 space-y-2">
                          <input type="hidden" name="id" value={n.id} />
                          <p className="text-xs font-bold text-rose-700">❌ Rejeter</p>
                          <input name="adminNote" placeholder="Raison du rejet"
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-rose-400" />
                          <button type="submit"
                            className="w-full rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2 transition">
                            Rejeter
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Mise à jour statut */}
                  <div className="pt-3 border-t border-slate-100">
                    {!isEditing ? (
                      <button onClick={() => setEditing(n.id)}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 transition">
                        ✏️ Mettre à jour le statut
                      </button>
                    ) : (
                      <form action={async (fd) => { await updateAction(fd); setEditing(null); }}
                        className="flex flex-wrap items-end gap-3">
                        <input type="hidden" name="id" value={n.id} />
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Statut</label>
                          <select name="status" defaultValue={n.status}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400">
                            {Object.entries(STATUS_LABELS).map(([v, l]) => (
                              <option key={v} value={v}>{l}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Note admin</label>
                          <input name="adminNote" defaultValue={n.adminNote} placeholder="Note interne ou pour le partenaire"
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400" />
                        </div>
                        <div className="flex gap-2">
                          <button type="submit"
                            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 transition">
                            Enregistrer
                          </button>
                          <button type="button" onClick={() => setEditing(null)}
                            className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2 transition">
                            Annuler
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

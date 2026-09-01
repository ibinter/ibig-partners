"use client";

import { useState } from "react";

const CONNECTION_TYPE_LABELS: Record<string, string> = {
  FINANCEMENT: "💰 Financement", PARTENARIAT: "🤝 Partenariat", CLIENT: "🎯 Client",
  RECRUTEMENT: "👥 Recrutement", FOURNISSEUR: "🚚 Fournisseur", INVESTISSEMENT: "📈 Investissement",
  TRANSACTION_IMMOBILIERE: "🏠 Immobilier", AUTRE: "💡 Autre",
};

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  NEW:       { label: "Nouveau",      badge: "bg-slate-100 text-slate-600" },
  ANALYZING: { label: "En analyse",   badge: "bg-amber-100 text-amber-700" },
  MATCHED:   { label: "Mis en relation", badge: "bg-blue-100 text-blue-700" },
  COMPLETED: { label: "Finalisé",     badge: "bg-emerald-100 text-emerald-700" },
  REJECTED:  { label: "Rejeté",       badge: "bg-rose-100 text-rose-700" },
};

const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " F";
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

type Row = {
  id: string; title: string; connectionType: string; needSide: string; provideSide: string;
  zone: string; estimatedValue: number; commissionEstimate: number;
  status: string; adminNote: string; createdAt: string;
  partnerName: string; partnerCode: string; partnerPhone: string; partnerEmail: string;
};

export default function ConnectAdminClient({
  rows, stats, updateAction,
}: {
  rows: Row[];
  stats: { total: number; new: number; analyzing: number; matched: number; completed: number; totalValue: number; totalCommissions: number };
  updateAction: (fd: FormData) => Promise<void>;
}) {
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const filtered = rows.filter(r => filterStatus === "ALL" || r.status === filterStatus);

  return (
    <div className="space-y-6">

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-4 lg:grid-cols-7">
        {[
          { label: "Total", value: stats.total, color: "text-slate-800" },
          { label: "Nouveaux", value: stats.new, color: "text-slate-600" },
          { label: "En analyse", value: stats.analyzing, color: "text-amber-700" },
          { label: "Mis en relation", value: stats.matched, color: "text-blue-700" },
          { label: "Finalisés", value: stats.completed, color: "text-emerald-700" },
          { label: "Valeur totale", value: stats.totalValue > 0 ? fmt(stats.totalValue) : "—", color: "text-slate-700", wide: true },
          { label: "Commissions dues", value: stats.totalCommissions > 0 ? fmt(stats.totalCommissions) : "—", color: "text-emerald-700", wide: true },
        ].map((k, i) => (
          <div key={i} className={`rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm ${(k as any).wide ? "sm:col-span-2 lg:col-span-1" : ""}`}>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{k.label}</p>
            <p className={`text-xl font-extrabold mt-1 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "NEW", "ANALYZING", "MATCHED", "COMPLETED", "REJECTED"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold border transition ${filterStatus === s ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
            {s === "ALL" ? "Toutes" : (STATUS_CONFIG[s]?.label ?? s)} {s !== "ALL" && `(${rows.filter(r => r.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
            <p className="text-3xl mb-2">🔗</p>
            <p className="text-slate-500 text-sm">Aucune demande dans ce statut.</p>
          </div>
        )}
        {filtered.map(r => {
          const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.NEW;
          const isOpen = expanded === r.id;
          return (
            <div key={r.id} className="rounded-2xl border border-slate-100 bg-white shadow-sm">
              <button onClick={() => setExpanded(isOpen ? null : r.id)}
                className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-slate-50/40 rounded-2xl transition-colors">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`rounded-lg border px-2 py-0.5 text-[9px] font-bold uppercase ${cfg.badge}`}>{cfg.label}</span>
                    <span className="text-[10px] text-slate-400">{CONNECTION_TYPE_LABELS[r.connectionType] ?? r.connectionType}</span>
                    <span className="text-[10px] text-slate-400">{r.zone}</span>
                  </div>
                  <p className="font-semibold text-slate-800 text-sm">{r.title}</p>
                  <p className="text-xs text-slate-500">
                    {r.partnerName} · <span className="font-mono text-slate-400">{r.partnerCode}</span> · {r.partnerPhone}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  {r.estimatedValue > 0 && <p className="text-xs text-slate-500">{fmt(r.estimatedValue)}</p>}
                  {r.commissionEstimate > 0 && <p className="text-xs font-bold text-emerald-600">{fmt(r.commissionEstimate)}</p>}
                  <p className="text-[10px] text-slate-400">{fmtDate(r.createdAt)}</p>
                </div>
                <span className={`shrink-0 text-slate-400 transition-transform pt-0.5 ${isOpen ? "rotate-180" : ""}`}>▼</span>
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 px-5 py-5 space-y-5">
                  {/* Détail partenaire */}
                  <div className="flex gap-4 flex-wrap text-xs text-slate-600">
                    <span>📧 {r.partnerEmail}</span>
                    <span>📞 {r.partnerPhone}</span>
                    <span>🏷️ {r.partnerCode}</span>
                  </div>

                  {/* Côtés */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-2">🔵 Côté Besoin</p>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{r.needSide}</p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mb-2">🟢 Côté Solution</p>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{r.provideSide}</p>
                    </div>
                  </div>

                  {/* Note admin + changement statut */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Note interne / Retour au partenaire</label>
                      <textarea rows={2} value={notes[r.id] ?? r.adminNote}
                        onChange={e => setNotes(prev => ({ ...prev, [r.id]: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none resize-none focus:border-teal-400" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["ANALYZING", "MATCHED", "COMPLETED", "REJECTED"].map(s => (
                        <form key={s} action={updateAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value={s} />
                          <input type="hidden" name="adminNote" value={notes[r.id] ?? ""} />
                          <button type="submit" disabled={r.status === s}
                            className={`rounded-xl px-3 py-1.5 text-xs font-bold border transition disabled:opacity-40 ${
                              r.status === s ? "bg-slate-900 text-white border-slate-900" :
                              s === "COMPLETED" ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50" :
                              s === "REJECTED" ? "border-rose-200 text-rose-700 hover:bg-rose-50" :
                              s === "MATCHED" ? "border-blue-200 text-blue-700 hover:bg-blue-50" :
                              "border-amber-200 text-amber-700 hover:bg-amber-50"
                            } bg-white`}>
                            {STATUS_CONFIG[s]?.label ?? s}
                          </button>
                        </form>
                      ))}
                    </div>
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

"use client";

import { useState } from "react";
import { formatDate } from "@/lib/format";

const DOC_TYPE_LABELS: Record<string, string> = {
  RCCM: "RCCM", NIF: "NIF", STATUTS: "Statuts", ID_GERANT: "CNI Gérant", AUTRE: "Autre",
};
const DOC_STATUS_STYLES: Record<string, string> = {
  PENDING:  "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
};
const DOC_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente", APPROVED: "Validé ✓", REJECTED: "Rejeté",
};
const KYB_STATUS_STYLES: Record<string, string> = {
  NONE:      "bg-slate-100 text-slate-500 border-slate-200",
  SUBMITTED: "bg-amber-50 text-amber-700 border-amber-200",
  VERIFIED:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED:  "bg-rose-50 text-rose-700 border-rose-200",
};
const KYB_STATUS_LABELS: Record<string, string> = {
  NONE: "Aucun dossier", SUBMITTED: "En attente", VERIFIED: "Vérifié ✓", REJECTED: "Rejeté",
};

type Doc = {
  id: string; docType: string; docName: string; fileUrl: string;
  note: string; status: string; adminNote: string; createdAt: string;
};
type Row = {
  userId: string; partnerName: string; partnerCode: string; partnerPhone: string;
  kybStatus: string; docs: Doc[];
};

export default function KybAdminClient({
  rows, approveUserAction, rejectUserAction, approveDocAction, rejectDocAction,
}: {
  rows: Row[];
  approveUserAction: (fd: FormData) => Promise<void>;
  rejectUserAction:  (fd: FormData) => Promise<void>;
  approveDocAction:  (fd: FormData) => Promise<void>;
  rejectDocAction:   (fd: FormData) => Promise<void>;
}) {
  const [filter, setFilter]   = useState("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectingDoc, setRejectingDoc] = useState<string | null>(null);

  const pending   = rows.filter(r => r.kybStatus === "SUBMITTED").length;
  const verified  = rows.filter(r => r.kybStatus === "VERIFIED").length;

  const filtered = rows.filter(r =>
    filter === "ALL" || r.kybStatus === filter
  );

  return (
    <div className="space-y-4">

      {/* Compteurs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-2xl font-extrabold text-amber-700">{pending}</p>
          <p className="text-xs text-slate-500 mt-1">En attente</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-2xl font-extrabold text-emerald-700">{verified}</p>
          <p className="text-xs text-slate-500 mt-1">Entreprises vérifiées</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <p className="text-2xl font-extrabold text-slate-700">{rows.length}</p>
          <p className="text-xs text-slate-500 mt-1">Total dossiers</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {(["ALL", "SUBMITTED", "VERIFIED", "REJECTED"] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${filter === s ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {s === "ALL" ? `Tous (${rows.length})` : `${KYB_STATUS_LABELS[s]} (${rows.filter(r => r.kybStatus === s).length})`}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white py-16 text-center">
            <p className="text-4xl mb-3">🏢</p>
            <p className="text-slate-500 text-sm">Aucun dossier KYB trouvé.</p>
          </div>
        )}

        {filtered.map(row => {
          const isExpanded = expanded === row.userId;
          const pendingDocs = row.docs.filter(d => d.status === "PENDING").length;

          return (
            <div key={row.userId}
              className={`rounded-2xl border bg-white shadow-sm transition-all ${row.kybStatus === "SUBMITTED" ? "border-amber-200" : "border-slate-100"}`}>

              {/* Header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : row.userId)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50/50 rounded-2xl transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-800">{row.partnerName}</p>
                    <span className="text-xs font-mono text-slate-400">{row.partnerCode}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${KYB_STATUS_STYLES[row.kybStatus]}`}>
                      🏢 {KYB_STATUS_LABELS[row.kybStatus]}
                    </span>
                    <span className="text-xs text-slate-400">{row.docs.length} doc{row.docs.length !== 1 ? "s" : ""}</span>
                    {pendingDocs > 0 && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        {pendingDocs} en attente
                      </span>
                    )}
                  </div>
                </div>
                <span className={`shrink-0 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>▼</span>
              </button>

              {/* Détail */}
              {isExpanded && (
                <div className="border-t border-slate-100 px-5 py-4 space-y-4">

                  {/* Documents */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Documents soumis</p>
                    {row.docs.map(doc => (
                      <div key={doc.id}
                        className={`rounded-xl border p-3 ${doc.status === "REJECTED" ? "border-rose-200 bg-rose-50" : "border-slate-100 bg-slate-50"}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-lg shrink-0">{doc.fileUrl.includes(".pdf") ? "📄" : "🖼️"}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 text-sm truncate">{doc.docName}</p>
                            <p className="text-xs text-slate-400">
                              {DOC_TYPE_LABELS[doc.docType] ?? doc.docType} · {formatDate(doc.createdAt)}
                            </p>
                            {doc.note && <p className="text-xs text-slate-500 italic">{doc.note}</p>}
                            {doc.adminNote && <p className="text-xs text-rose-600 font-medium">Refusé : {doc.adminNote}</p>}
                          </div>
                          <div className="shrink-0 flex items-center gap-2">
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline font-semibold">Voir →</a>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${DOC_STATUS_STYLES[doc.status] ?? "bg-slate-100 text-slate-500"}`}>
                              {DOC_STATUS_LABELS[doc.status] ?? doc.status}
                            </span>
                          </div>
                        </div>

                        {/* Actions par document */}
                        {doc.status === "PENDING" && (
                          <div className="mt-2 flex gap-2">
                            <form action={approveDocAction}>
                              <input type="hidden" name="id" value={doc.id} />
                              <button type="submit"
                                className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 transition">
                                ✅ Valider
                              </button>
                            </form>
                            {rejectingDoc !== doc.id ? (
                              <button onClick={() => setRejectingDoc(doc.id)}
                                className="rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-3 py-1.5 hover:bg-rose-100 transition">
                                ❌ Refuser
                              </button>
                            ) : (
                              <form action={async (fd) => { await rejectDocAction(fd); setRejectingDoc(null); }}
                                className="flex gap-2 flex-1">
                                <input type="hidden" name="id" value={doc.id} />
                                <input name="adminNote" placeholder="Motif du refus" autoFocus
                                  className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-rose-400" />
                                <button type="submit"
                                  className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 transition">
                                  Confirmer
                                </button>
                                <button type="button" onClick={() => setRejectingDoc(null)}
                                  className="rounded-lg bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1.5 hover:bg-slate-200 transition">
                                  Annuler
                                </button>
                              </form>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Décision globale */}
                  {row.kybStatus === "SUBMITTED" && (
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600 mb-3">⚡ Décision globale KYB</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <form action={approveUserAction}
                          className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 space-y-2">
                          <input type="hidden" name="userId" value={row.userId} />
                          <p className="text-xs font-bold text-emerald-700">✅ Approuver — activer le badge</p>
                          <p className="text-xs text-emerald-600">Valide tous les documents en attente et active le badge Entreprise vérifiée.</p>
                          <button type="submit"
                            className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 transition">
                            Approuver l'entreprise →
                          </button>
                        </form>

                        {rejecting !== row.userId ? (
                          <button onClick={() => setRejecting(row.userId)}
                            className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700 text-xs font-bold hover:bg-rose-100 transition text-left">
                            ❌ Rejeter le dossier
                          </button>
                        ) : (
                          <form action={async (fd) => { await rejectUserAction(fd); setRejecting(null); }}
                            className="rounded-xl border border-rose-200 bg-rose-50 p-3 space-y-2">
                            <input type="hidden" name="userId" value={row.userId} />
                            <p className="text-xs font-bold text-rose-700">❌ Rejeter le dossier</p>
                            <input name="adminNote" placeholder="Motif du rejet (optionnel)"
                              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-rose-400" />
                            <div className="flex gap-2">
                              <button type="submit"
                                className="flex-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2 transition">
                                Confirmer le rejet
                              </button>
                              <button type="button" onClick={() => setRejecting(null)}
                                className="rounded-lg bg-slate-100 text-slate-600 text-xs font-bold px-3 py-2 hover:bg-slate-200 transition">
                                Annuler
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  )}

                  {row.kybStatus === "VERIFIED" && (
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                      <span className="text-lg">🏢</span>
                      <p className="text-sm font-semibold text-emerald-700">Badge Entreprise vérifiée actif</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

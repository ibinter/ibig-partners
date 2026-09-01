"use client";

import { useState } from "react";

const STATUS_LABELS: Record<string, string> = {
  NEW: "Nouveau",
  IN_PROGRESS: "En cours ⚙️",
  WON: "Gagné 🏆",
  LOST: "Non retenu",
};

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-amber-100 text-amber-800 border-amber-200",
  IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
  WON: "bg-emerald-100 text-emerald-800 border-emerald-200",
  LOST: "bg-rose-100 text-rose-800 border-rose-200",
};

type Message = {
  id: string;
  fromAdmin: boolean;
  senderName: string;
  body: string;
  createdAt: string;
};

type Row = {
  id: string;
  title: string;
  description: string;
  estimatedValue: number;
  status: string;
  handler: string;
  createdAt: string;
  messages: Message[];
  unreadCount: number;
};

function fcfaFmt(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(n);
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function OpportunitesAffilieClient({
  rows,
  replyAction,
}: {
  rows: Row[];
  replyAction: (fd: FormData) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState<string | null>(rows[0]?.id ?? null);
  const [sending, setSending] = useState(false);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const totalValue = rows.reduce((s, r) => s + r.estimatedValue, 0);
  const wonCount   = rows.filter(r => r.status === "WON").length;
  const adminMsgs  = rows.reduce((s, r) => s + r.messages.filter(m => m.fromAdmin).length, 0);

  async function handleReply(opportunityId: string) {
    const body = (replyText[opportunityId] ?? "").trim();
    if (!body) return;
    setSending(true);
    const fd = new FormData();
    fd.set("opportunityId", opportunityId);
    fd.set("body", body);
    await replyAction(fd);
    setReplyText(prev => ({ ...prev, [opportunityId]: "" }));
    setSending(false);
  }

  return (
    <div className="space-y-6">

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Opportunités soumises</p>
          <p className="text-3xl font-extrabold text-slate-800 mt-1">{rows.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">Gagnées</p>
          <p className="text-3xl font-extrabold text-emerald-700 mt-1">{wonCount}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Messages de l'équipe IBIG</p>
          <p className="text-3xl font-extrabold text-blue-700 mt-1">{adminMsgs}</p>
        </div>
      </div>

      {/* Liste */}
      <div className="space-y-4">
        {rows.map(o => {
          const isOpen = expanded === o.id;
          const adminMessages = o.messages.filter(m => m.fromAdmin).length;

          return (
            <div
              key={o.id}
              className={`rounded-2xl border bg-white shadow-sm transition-all ${
                o.status === "NEW" ? "border-amber-200" :
                o.status === "WON" ? "border-emerald-200" :
                o.status === "LOST" ? "border-rose-200" : "border-blue-200"
              }`}
            >
              {/* Header */}
              <button
                onClick={() => setExpanded(isOpen ? null : o.id)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50/40 rounded-2xl transition-colors"
              >
                <span className={`shrink-0 rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[o.status]}`}>
                  {STATUS_LABELS[o.status] ?? o.status}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">{o.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{o.description}</p>
                </div>

                {adminMessages > 0 && (
                  <span className="shrink-0 rounded-full bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5">
                    {adminMessages} msg
                  </span>
                )}

                <div className="shrink-0 text-right">
                  {o.estimatedValue > 0 && (
                    <p className="text-xs font-bold text-slate-600">{fcfaFmt(o.estimatedValue)}</p>
                  )}
                  <p className="text-[10px] text-slate-400">{fmtDateTime(o.createdAt).split(" à ")[0]}</p>
                </div>

                <span className={`shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>▼</span>
              </button>

              {/* Contenu expandé */}
              {isOpen && (
                <div className="border-t border-slate-100 px-5 py-5 space-y-5">

                  {/* Détail */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Description</p>
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{o.description}</p>
                    </div>
                    <div className="space-y-3">
                      {o.estimatedValue > 0 && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">Valeur estimée</p>
                          <p className="text-sm font-bold text-slate-700">{fcfaFmt(o.estimatedValue)}</p>
                        </div>
                      )}
                      {o.handler && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">Chargé de compte IBIG</p>
                          <p className="text-sm text-slate-700">👤 {o.handler}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">Soumise le</p>
                        <p className="text-sm text-slate-600">{fmtDateTime(o.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Fil de messages */}
                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">
                      💬 Échanges avec l'équipe IBIG
                    </p>

                    {o.messages.length === 0 ? (
                      <p className="text-sm text-slate-400 italic text-center py-4">
                        Aucun message pour le moment. L'équipe vous répondra ici.
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {o.messages.map(m => (
                          <div
                            key={m.id}
                            className={`flex flex-col rounded-xl px-4 py-3 text-sm ${
                              m.fromAdmin
                                ? "bg-blue-50 border border-blue-100 ml-0 mr-8"
                                : "bg-slate-50 border border-slate-200 ml-8 mr-0"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-[10px] font-bold uppercase tracking-wide ${m.fromAdmin ? "text-blue-600" : "text-slate-500"}`}>
                                {m.fromAdmin ? `🏢 ${m.senderName} — IBIG Partners` : `👤 Vous`}
                              </span>
                              <span className="text-[10px] text-slate-400">{fmtDateTime(m.createdAt)}</span>
                            </div>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-line">{m.body}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Zone de réponse */}
                    <div className="mt-4 flex gap-2 items-end">
                      <textarea
                        rows={2}
                        value={replyText[o.id] ?? ""}
                        onChange={e => setReplyText(prev => ({ ...prev, [o.id]: e.target.value }))}
                        placeholder="Écrire un message à l'équipe IBIG…"
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                      <button
                        onClick={() => handleReply(o.id)}
                        disabled={sending || !(replyText[o.id] ?? "").trim()}
                        className="shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold px-4 py-2.5 transition"
                      >
                        {sending ? "…" : "Envoyer ↗"}
                      </button>
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

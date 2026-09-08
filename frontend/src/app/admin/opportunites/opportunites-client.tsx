"use client";

import { useState, useMemo, useRef } from "react";

const STATUS_LABELS: Record<string, string> = {
  NEW: "Nouveau",
  IN_PROGRESS: "En cours",
  APPROVED: "Approuvé ✅",
  REJECTED: "Non retenu",
  WON: "Gagné",
  LOST: "Perdu",
};

const CATEGORY_LABELS: Record<string, string> = {
  FORMATION: "🎓 Formation",
  DIGITAL: "💻 Digital & Web",
  INFORMATIQUE: "⚙️ Logiciels & IT",
  IMMOBILIER: "🏠 Immobilier",
  BTP: "🏗️ BTP & Construction",
  CONSEIL: "📋 Conseil",
  FINANCEMENT: "💰 Financement",
  COMMERCIAL: "🤝 Commercial",
  PARTENARIAT: "🌐 Partenariat",
  MISE_EN_RELATION: "🔗 Mise en relation",
  EMPLOI_RH: "👥 Emploi & RH",
  EVENEMENTIEL: "🎪 Événementiel",
  MARKETING: "📢 Marketing",
  SERVICES: "🛠️ Services B2B",
  COMMERCE: "🛒 Commerce",
  LOGISTIQUE: "🚚 Logistique",
  SANTE: "🏥 Santé",
  AGRI: "🌱 Agriculture",
  ENERGIE: "⚡ Énergie",
  INTERNATIONAL: "🌍 International",
  AUTRE: "💡 Autre",
};

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-amber-100 text-amber-800 border-amber-200",
  IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
  APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  REJECTED: "bg-rose-100 text-rose-800 border-rose-200",
  WON: "bg-emerald-100 text-emerald-800 border-emerald-200",
  LOST: "bg-rose-100 text-rose-800 border-rose-200",
};

const KPI_GRADIENTS: Record<string, string> = {
  NEW: "from-amber-500 to-orange-400",
  IN_PROGRESS: "from-blue-600 to-blue-400",
  WON: "from-emerald-600 to-teal-400",
  LOST: "from-rose-500 to-rose-400",
};

const KPI_ICONS: Record<string, string> = {
  NEW: "🆕",
  IN_PROGRESS: "⚙️",
  WON: "✅",
  LOST: "❌",
};

type Message = {
  id: string;
  fromAdmin: boolean;
  senderName: string;
  body: string;
  createdAt: string;
};

type Share = {
  id: string; userId: string; partnerName: string; partnerCode: string;
  role: string; shareAmount: number; shareType: string; note: string;
  status: string; createdAt: string;
};

type MatchRow = {
  id: string;
  userId: string;
  partnerName: string;
  partnerCode: string;
  partnerStatus: string;
  score: number;
  status: string; // SUGGESTED | INVITED | DECLINED
};

type LeadRow = {
  id: string;
  userId: string;
  partnerName: string;
  partnerCode: string;
  partnerStatus: string;
  partnerPhone: string;
  status: string;
  note: string;
  result: string;
  createdAt: string;
};

type ActivityRow = {
  id: string;
  leadId: string | null;
  type: string;
  content: string;
  createdAt: string;
};

type Row = {
  id: string;
  code: string;
  title: string;
  category: string;
  description: string;
  estimatedValue: number;
  status: string;
  handler: string;
  visibility: string;
  commission: number;
  commissionType: string;
  adminNote: string;
  leadCount: number;
  createdAt: string;
  partnerName: string;
  partnerCode: string;
  partnerPhone: string;
  messages: Message[];
  shares: Share[];
  matches: MatchRow[];
  leads: LeadRow[];
  activities: ActivityRow[];
};

function getMsgBodyType(body: string): "image" | "pdf" | "doc" | "sheet" | "ppt" | "zip" | "file" | "text" {
  if (/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(body)) return "image";
  if (/\.pdf(\?.*)?$/i.test(body)) return "pdf";
  if (/\.(docx?)(\?.*)?$/i.test(body)) return "doc";
  if (/\.(xlsx?|csv)(\?.*)?$/i.test(body)) return "sheet";
  if (/\.(pptx?)(\?.*)?$/i.test(body)) return "ppt";
  if (/\.(zip|rar)(\?.*)?$/i.test(body)) return "zip";
  if (/res\.cloudinary\.com/i.test(body)) return "file";
  return "text";
}

const FILE_ICONS: Record<string, string> = {
  pdf: "📄", doc: "📝", sheet: "📊", ppt: "📑", zip: "🗜️", file: "📁",
};

function fileLabel(url: string, type: string) {
  try {
    const last = new URL(url).pathname.split("/").pop() ?? "";
    if (last.includes(".")) return decodeURIComponent(last);
  } catch {}
  const labels: Record<string, string> = {
    pdf: "Document PDF", doc: "Document Word", sheet: "Feuille Excel",
    ppt: "Présentation", zip: "Archive ZIP", file: "Fichier",
  };
  return labels[type] ?? "Fichier";
}

function MsgBody({ body, fromAdmin }: { body: string; fromAdmin: boolean }) {
  const type = getMsgBodyType(body);
  if (type === "image") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={body} alt="image partagée" className="max-w-[220px] max-h-[180px] rounded-lg object-cover mt-1" />;
  }
  if (type !== "text") {
    return (
      <a href={body} target="_blank" rel="noopener noreferrer" download
        className={`inline-flex items-center gap-2 mt-1 rounded-lg px-3 py-2 text-sm font-medium ${fromAdmin ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
        <span>{FILE_ICONS[type] ?? "📁"}</span>
        <span className="max-w-[180px] truncate underline underline-offset-2">{fileLabel(body, type)}</span>
        <span className="text-xs opacity-60">↓</span>
      </a>
    );
  }
  return <p className="text-slate-700 whitespace-pre-line">{body}</p>;
}

function fcfaFmt(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(n);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

const SHARE_ROLES = [
  { value: "APPORTEUR_OPPORTUNITE", label: "Apporteur opportunité" },
  { value: "APPORTEUR_CLIENT",      label: "Apporteur client" },
  { value: "FACILITATEUR",          label: "Facilitateur / Clôture" },
  { value: "COORDINATEUR_IBIG",     label: "Coordinateur IBIG" },
  { value: "PARTENAIRE",            label: "Partenaire" },
  { value: "AUTRE",                 label: "Autre" },
];

const SHARE_STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PAID:      "bg-emerald-100 text-emerald-700",
};
const SHARE_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente", CONFIRMED: "Confirmé", PAID: "Payé",
};

const MATCH_STATUS_STYLES: Record<string, string> = {
  SUGGESTED: "bg-slate-100 text-slate-600",
  INVITED:   "bg-blue-100 text-blue-700",
  DECLINED:  "bg-rose-100 text-rose-600",
};
const MATCH_STATUS_LABELS: Record<string, string> = {
  SUGGESTED: "Suggéré", INVITED: "Invité ✉️", DECLINED: "Décliné",
};

const LEAD_STATUSES = ["INTERESTED","CONTACTED","MEETING","WON","LOST"];
const LEAD_STATUS_LABELS: Record<string,string> = {
  INTERESTED:"Intéressé", CONTACTED:"Contacté", MEETING:"RDV planifié", WON:"Gagné ✅", LOST:"Perdu ❌",
};
const LEAD_STATUS_STYLES: Record<string,string> = {
  INTERESTED:"bg-amber-100 text-amber-700",
  CONTACTED:"bg-blue-100 text-blue-700",
  MEETING:"bg-violet-100 text-violet-700",
  WON:"bg-emerald-100 text-emerald-700",
  LOST:"bg-rose-100 text-rose-700",
};
const ACTIVITY_ICONS: Record<string,string> = {
  STATUS_CHANGE:"🔄", NOTE:"📝", MESSAGE:"💬", MATCH_INVITE:"📩",
};

export default function OpportunitesClient({
  rows,
  updateAction,
  messageAction,
  approveAction,
  rejectAction,
  addShareAction,
  removeShareAction,
  confirmSharesAction,
  markSharePaidAction,
  computeMatchesAction,
  inviteMatchAction,
  declineMatchAction,
  updateLeadStatusAction,
  addLeadNoteAction,
}: {
  rows: Row[];
  updateAction: (fd: FormData) => Promise<void>;
  messageAction: (fd: FormData) => Promise<void>;
  approveAction: (fd: FormData) => Promise<void>;
  rejectAction: (fd: FormData) => Promise<void>;
  addShareAction: (fd: FormData) => Promise<void>;
  removeShareAction: (fd: FormData) => Promise<void>;
  confirmSharesAction: (fd: FormData) => Promise<void>;
  markSharePaidAction: (fd: FormData) => Promise<void>;
  computeMatchesAction: (fd: FormData) => Promise<void>;
  inviteMatchAction: (fd: FormData) => Promise<void>;
  declineMatchAction: (fd: FormData) => Promise<void>;
  updateLeadStatusAction: (fd: FormData) => Promise<void>;
  addLeadNoteAction: (fd: FormData) => Promise<void>;
}) {
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [messaging, setMessaging] = useState<string | null>(null);
  const [msgText, setMsgText] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: rows.length, NEW: 0, IN_PROGRESS: 0, WON: 0, LOST: 0 };
    for (const r of rows) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [rows]);

  const totalValue = useMemo(() => rows.reduce((s, r) => s + r.estimatedValue, 0), [rows]);
  const wonValue   = useMemo(() => rows.filter(r => r.status === "WON").reduce((s, r) => s + r.estimatedValue, 0), [rows]);

  async function handleMessage(opportunityId: string, body?: string) {
    const text = body ?? (msgText[opportunityId] ?? "").trim();
    if (!text) return;
    setSending(true);
    const fd = new FormData();
    fd.set("opportunityId", opportunityId);
    fd.set("body", text);
    await messageAction(fd);
    if (!body) setMsgText(prev => ({ ...prev, [opportunityId]: "" }));
    setSending(false);
  }

  async function handleFileUpload(opportunityId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    if (file.size > 20 * 1024 * 1024) { setUploadError("Fichier trop volumineux (max 20 Mo)."); return; }
    setUploading(opportunityId);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "ibig-opportunites");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) { const err = await res.json().catch(() => ({})); setUploadError((err as any).error ?? "Échec upload"); return; }
      const { url } = await res.json() as { url: string };
      await handleMessage(opportunityId, url);
    } catch { setUploadError("Impossible d'envoyer le fichier."); }
    finally {
      setUploading(null);
      if (fileRefs.current[opportunityId]) fileRefs.current[opportunityId]!.value = "";
    }
  }

  const filtered = useMemo(() => {
    let list = filter === "ALL" ? rows : rows.filter(r => r.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.partnerName.toLowerCase().includes(q) ||
        r.partnerCode.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.handler && r.handler.toLowerCase().includes(q))
      );
    }
    return list;
  }, [rows, filter, search]);

  return (
    <div className="space-y-6">

      {/* ── KPI cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(["NEW", "IN_PROGRESS", "WON", "LOST"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(f => f === s ? "ALL" : s)}
            className={`rounded-2xl p-4 text-left transition-all shadow-sm border-2 ${
              filter === s ? "border-blue-500 ring-2 ring-blue-200" : "border-transparent"
            } bg-gradient-to-br ${KPI_GRADIENTS[s]} text-white`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{KPI_ICONS[s]}</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">{counts[s] ?? 0}</span>
            </div>
            <p className="text-sm font-semibold opacity-90">{STATUS_LABELS[s]}</p>
          </button>
        ))}
      </div>

      {/* ── Totaux valeur ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm flex items-center gap-4">
          <span className="text-3xl">💼</span>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Valeur pipeline total</p>
            <p className="text-xl font-extrabold text-slate-800 mt-0.5">{fcfaFmt(totalValue)}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 shadow-sm flex items-center gap-4">
          <span className="text-3xl">🏆</span>
          <div>
            <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Valeur opportunités gagnées</p>
            <p className="text-xl font-extrabold text-emerald-700 mt-0.5">{fcfaFmt(wonValue)}</p>
          </div>
        </div>
      </div>

      {/* ── Barre recherche + filtre texte ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par titre, partenaire, chargé…"
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["ALL", "NEW", "IN_PROGRESS", "WON", "LOST"] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all border ${
                filter === s
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {s === "ALL" ? `Toutes (${counts.ALL})` : `${STATUS_LABELS[s]} (${counts[s] ?? 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Liste des opportunités ── */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white py-16 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-slate-500 text-sm">Aucune opportunité trouvée.</p>
          </div>
        )}

        {filtered.map(o => {
          const isExpanded = expanded === o.id;
          const isEditing  = editing === o.id;

          return (
            <div
              key={o.id}
              className={`rounded-2xl border bg-white shadow-sm transition-all ${
                o.status === "NEW" ? "border-amber-200" :
                o.status === "WON" ? "border-emerald-200" :
                o.status === "LOST" ? "border-rose-200" : "border-slate-100"
              }`}
            >
              {/* Header cliquable */}
              <button
                onClick={() => setExpanded(isExpanded ? null : o.id)}
                className="w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-slate-50/50 rounded-2xl transition-colors"
              >
                {/* Badge statut */}
                <span className={`mt-0.5 shrink-0 rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[o.status]}`}>
                  {STATUS_LABELS[o.status]}
                </span>

                <div className="flex-1 min-w-0">
                  {o.code && <p className="text-[10px] font-mono font-bold text-amber-600 mb-0.5">{o.code}</p>}
                  <p className="font-semibold text-slate-800 text-sm leading-snug">{o.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {o.category && o.category !== "AUTRE" && (
                      <span className="text-[10px] text-blue-600 font-semibold">
                        {CATEGORY_LABELS[o.category] ?? o.category}
                      </span>
                    )}
                    <p className="text-xs text-slate-400 line-clamp-1">{o.description}</p>
                  </div>
                </div>

                <div className="shrink-0 text-right ml-3">
                  {o.estimatedValue > 0 ? (
                    <p className="text-sm font-bold text-slate-700">{fcfaFmt(o.estimatedValue)}</p>
                  ) : (
                    <p className="text-xs text-slate-400">Valeur n/c</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-0.5">{fmtDate(o.createdAt)}</p>
                </div>

                <span className={`shrink-0 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>▼</span>
              </button>

              {/* Contenu expandé */}
              {isExpanded && (
                <div className="border-t border-slate-100 px-5 py-4 space-y-4">

                  {/* Infos détail */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Partenaire</p>
                      <p className="text-sm font-semibold text-slate-700">{o.partnerName}</p>
                      <p className="text-xs font-mono text-slate-400">{o.partnerCode}</p>
                      {o.partnerPhone && (
                        <a
                          href={`https://wa.me/${o.partnerPhone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline"
                        >
                          <svg viewBox="0 0 24 24" className="h-3 w-3 fill-emerald-600"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          {o.partnerPhone}
                        </a>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Chargé de compte</p>
                      <p className="text-sm text-slate-700">{o.handler || <span className="text-slate-400 italic">Non assigné</span>}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Valeur estimée</p>
                      <p className="text-sm font-bold text-slate-700">
                        {o.estimatedValue > 0 ? fcfaFmt(o.estimatedValue) : <span className="text-slate-400 italic">Non renseignée</span>}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Description</p>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{o.description}</p>
                  </div>

                  {/* Fil de messages */}
                  <div className="border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        💬 Messages avec l'affilié ({o.messages?.length ?? 0})
                      </p>
                      <button
                        onClick={() => setMessaging(messaging === o.id ? null : o.id)}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        {messaging === o.id ? "Annuler" : "+ Envoyer un message"}
                      </button>
                    </div>

                    {(o.messages?.length ?? 0) > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                        {o.messages.map(m => (
                          <div
                            key={m.id}
                            className={`rounded-xl px-3 py-2 text-sm ${
                              m.fromAdmin
                                ? "bg-blue-50 border border-blue-100 mr-8"
                                : "bg-slate-50 border border-slate-200 ml-8"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className={`text-[10px] font-bold uppercase ${m.fromAdmin ? "text-blue-600" : "text-slate-500"}`}>
                                {m.fromAdmin ? `🏢 ${m.senderName} (IBIG)` : `👤 ${m.senderName}`}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(m.createdAt).toLocaleString("fr-FR", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" })}
                              </span>
                            </div>
                            <MsgBody body={m.body} fromAdmin={m.fromAdmin} />
                          </div>
                        ))}
                      </div>
                    )}

                    {messaging === o.id && (
                      <div className="space-y-2">
                        <div className="flex gap-2 items-end">
                          <button
                            type="button"
                            title="Joindre un fichier"
                            disabled={!!uploading || sending}
                            onClick={() => fileRefs.current[o.id]?.click()}
                            className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40 transition"
                          >
                            {uploading === o.id ? "⏳" : "📎"}
                          </button>
                          <input
                            type="file"
                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.zip"
                            className="hidden"
                            ref={el => { fileRefs.current[o.id] = el; }}
                            onChange={e => handleFileUpload(o.id, e)}
                          />
                          <textarea
                            rows={2}
                            value={msgText[o.id] ?? ""}
                            onChange={e => setMsgText(prev => ({ ...prev, [o.id]: e.target.value }))}
                            placeholder="Écrire un message à l'affilié…"
                            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                          />
                          <button
                            onClick={() => handleMessage(o.id)}
                            disabled={sending || uploading === o.id || !(msgText[o.id] ?? "").trim()}
                            className="shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold px-4 py-2.5 transition"
                          >
                            {sending ? "…" : "Envoyer ↗"}
                          </button>
                        </div>
                        {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
                        <p className="text-[10px] text-slate-400">📎 Images, PDF, Word, Excel, ZIP (max 20 Mo)</p>
                      </div>
                    )}
                  </div>

                  {/* Panneau Approbation (NEW uniquement) */}
                  {o.status === "NEW" && (
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600 mb-3">⚡ Décision IBIG</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {/* Approuver */}
                        <form
                          action={async (fd) => { await approveAction(fd); }}
                          className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 space-y-2"
                        >
                          <input type="hidden" name="id" value={o.id} />
                          <p className="text-xs font-bold text-emerald-700">✅ Approuver &amp; publier</p>
                          <div className="flex gap-2">
                            <div className="flex flex-col gap-1 flex-1">
                              <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Commission</label>
                              <input
                                name="commission"
                                type="number"
                                min="0"
                                placeholder="Ex : 50000"
                                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-400"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Type</label>
                              <select
                                name="commissionType"
                                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-400"
                              >
                                <option value="FIXED">FCFA fixe</option>
                                <option value="PERCENT">% valeur</option>
                              </select>
                            </div>
                          </div>
                          <input
                            name="adminNote"
                            placeholder="Note pour les partenaires (optionnel)"
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-400"
                          />
                          <button
                            type="submit"
                            className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 transition"
                          >
                            Approuver →
                          </button>
                        </form>

                        {/* Rejeter */}
                        <form
                          action={async (fd) => { await rejectAction(fd); }}
                          className="rounded-xl border border-rose-200 bg-rose-50 p-3 space-y-2"
                        >
                          <input type="hidden" name="id" value={o.id} />
                          <p className="text-xs font-bold text-rose-700">❌ Rejeter</p>
                          <input
                            name="adminNote"
                            placeholder="Raison du rejet (transmise au partenaire)"
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-rose-400"
                          />
                          <button
                            type="submit"
                            className="w-full rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2 transition"
                          >
                            Rejeter
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Commission partagée */}
                  {(o.status === "APPROVED" || o.status === "IN_PROGRESS" || o.status === "WON") && (
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          💰 Répartition commission ({o.shares.length} part{o.shares.length !== 1 ? "s" : ""})
                        </p>
                        {o.commission > 0 && (
                          <span className="text-xs font-bold text-emerald-600">
                            Pool : {fcfaFmt(o.commission)}
                            {o.shares.length > 0 && ` — attribué : ${fcfaFmt(o.shares.reduce((s: number, sh: Share) => s + sh.shareAmount, 0))}`}
                          </span>
                        )}
                      </div>

                      {/* Parts existantes */}
                      {o.shares.length > 0 && (
                        <div className="space-y-2">
                          {o.shares.map((sh: Share) => (
                            <div key={sh.id} className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-sm">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-800 truncate">{sh.partnerName} <span className="text-slate-400 font-normal text-xs">({sh.partnerCode})</span></p>
                                <p className="text-xs text-slate-500">{SHARE_ROLES.find(r => r.value === sh.role)?.label ?? sh.role} · {sh.shareType === "FIXED" ? fcfaFmt(sh.shareAmount) : `${sh.shareAmount}%`}</p>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${SHARE_STATUS_STYLES[sh.status] ?? "bg-slate-100 text-slate-500"}`}>
                                {SHARE_STATUS_LABELS[sh.status] ?? sh.status}
                              </span>
                              {sh.status === "CONFIRMED" && (
                                <form action={async (fd) => { await markSharePaidAction(fd); }}>
                                  <input type="hidden" name="id" value={sh.id} />
                                  <button type="submit" className="text-[10px] font-bold text-emerald-600 hover:underline">Marquer payé</button>
                                </form>
                              )}
                              {sh.status === "PENDING" && (
                                <form action={async (fd) => { await removeShareAction(fd); }}>
                                  <input type="hidden" name="id" value={sh.id} />
                                  <button type="submit" className="text-[10px] text-rose-500 hover:underline">✕</button>
                                </form>
                              )}
                            </div>
                          ))}
                          {o.shares.some((sh: Share) => sh.status === "PENDING") && (
                            <form action={async (fd) => { await confirmSharesAction(fd); }}>
                              <input type="hidden" name="opportunityId" value={o.id} />
                              <button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 transition">
                                ✅ Confirmer toutes les parts en attente
                              </button>
                            </form>
                          )}
                        </div>
                      )}

                      {/* Ajouter un partner */}
                      <form action={async (fd) => { await addShareAction(fd); }}
                        className="flex flex-wrap items-end gap-2 p-3 rounded-xl border border-dashed border-slate-300 bg-white">
                        <input type="hidden" name="opportunityId" value={o.id} />
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Code partner</label>
                          <input name="partnerCode" placeholder="Ex : IBP-XXXX" required
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm w-32 outline-none focus:border-blue-400" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Rôle</label>
                          <select name="role" className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none focus:border-blue-400">
                            {SHARE_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Montant</label>
                          <input name="shareAmount" type="number" min="0" placeholder="FCFA" required
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm w-28 outline-none focus:border-blue-400" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Type</label>
                          <select name="shareType" className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none focus:border-blue-400">
                            <option value="FIXED">FCFA fixe</option>
                            <option value="PERCENT">% valeur</option>
                          </select>
                        </div>
                        <button type="submit" className="rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 transition">
                          + Ajouter
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Panneau Matching IA */}
                  {o.status === "APPROVED" && (
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-violet-600">🎯 Matching — Partenaires suggérés</p>
                        <form action={async (fd) => { await computeMatchesAction(fd); }}>
                          <input type="hidden" name="opportunityId" value={o.id} />
                          <button type="submit" className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-bold px-3 py-1.5 transition">
                            ⟳ Calculer les matches
                          </button>
                        </form>
                      </div>
                      {o.matches.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Aucun match calculé. Cliquez sur "Calculer les matches" pour trouver les partenaires les plus adaptés.</p>
                      ) : (
                        <div className="space-y-2">
                          {o.matches.map((m: MatchRow) => (
                            <div key={m.id} className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-sm">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-800 truncate">
                                  {m.partnerName} <span className="text-slate-400 font-normal text-xs">({m.partnerCode})</span>
                                </p>
                                <p className="text-xs text-slate-500">Score : {m.score} · Niveau {m.partnerStatus}</p>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${MATCH_STATUS_STYLES[m.status] ?? "bg-slate-100 text-slate-500"}`}>
                                {MATCH_STATUS_LABELS[m.status] ?? m.status}
                              </span>
                              {m.status === "SUGGESTED" && (
                                <form action={async (fd) => { await inviteMatchAction(fd); }}>
                                  <input type="hidden" name="matchId" value={m.id} />
                                  <input type="hidden" name="opportunityId" value={o.id} />
                                  <button type="submit" className="text-[10px] font-bold text-blue-600 hover:underline">Inviter ✉️</button>
                                </form>
                              )}
                              {m.status !== "DECLINED" && (
                                <form action={async (fd) => { await declineMatchAction(fd); }}>
                                  <input type="hidden" name="matchId" value={m.id} />
                                  <button type="submit" className="text-[10px] text-rose-400 hover:underline">✕</button>
                                </form>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* CRM — Candidatures / Leads */}
                  {o.leads.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">CRM · Candidatures ({o.leads.length})</h4>
                      <div className="space-y-3">
                        {o.leads.map((lead) => (
                          <div key={lead.id} className="rounded-xl border bg-slate-50 p-3 space-y-2">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div>
                                <p className="text-sm font-semibold">{lead.partnerName} <span className="text-xs text-slate-400">#{lead.partnerCode}</span></p>
                                <p className="text-xs text-slate-500">{lead.partnerPhone} · {fmtDate(lead.createdAt)}</p>
                              </div>
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${LEAD_STATUS_STYLES[lead.status] ?? "bg-gray-100 text-gray-600"}`}>
                                {LEAD_STATUS_LABELS[lead.status] ?? lead.status}
                              </span>
                            </div>
                            {lead.note && <p className="text-xs text-slate-600 italic">📝 {lead.note}</p>}
                            {/* Changer statut */}
                            <form action={updateLeadStatusAction} className="flex items-center gap-2 flex-wrap">
                              <input type="hidden" name="leadId" value={lead.id} />
                              <input type="hidden" name="opportunityId" value={o.id} />
                              <select name="status" defaultValue={lead.status} className="rounded-lg border px-2 py-1 text-xs">
                                {LEAD_STATUSES.map(s => <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>)}
                              </select>
                              <button type="submit" className="rounded-lg bg-slate-700 text-white px-3 py-1 text-xs font-medium hover:bg-slate-800">Mettre à jour</button>
                            </form>
                            {/* Ajouter note */}
                            <form action={addLeadNoteAction} className="flex items-center gap-2">
                              <input type="hidden" name="leadId" value={lead.id} />
                              <input type="hidden" name="opportunityId" value={o.id} />
                              <input name="note" defaultValue={lead.note} placeholder="Note interne…" className="flex-1 rounded-lg border px-2 py-1 text-xs" />
                              <button type="submit" className="rounded-lg bg-violet-600 text-white px-3 py-1 text-xs font-medium hover:bg-violet-700">Enregistrer</button>
                            </form>
                          </div>
                        ))}
                      </div>
                      {/* Timeline activité */}
                      {o.activities.length > 0 && (
                        <div className="pt-2 space-y-1">
                          <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Timeline</h5>
                          {o.activities.map(a => (
                            <div key={a.id} className="flex items-start gap-2 text-xs text-slate-600">
                              <span className="shrink-0">{ACTIVITY_ICONS[a.type] ?? "•"}</span>
                              <span className="text-slate-400 shrink-0">{fmtDate(a.createdAt)}</span>
                              <span>{a.content}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Formulaire mise à jour */}
                  <div className="pt-3 border-t border-slate-100">
                    {!isEditing ? (
                      <button
                        onClick={() => setEditing(o.id)}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 transition"
                      >
                        ✏️ Mettre à jour le statut
                      </button>
                    ) : (
                      <form
                        action={async (fd) => {
                          await updateAction(fd);
                          setEditing(null);
                        }}
                        className="flex flex-wrap items-end gap-3"
                      >
                        <input type="hidden" name="id" value={o.id} />

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Statut</label>
                          <select
                            name="status"
                            defaultValue={o.status}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                          >
                            {Object.entries(STATUS_LABELS).map(([v, l]) => (
                              <option key={v} value={v}>{l}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Chargé de compte</label>
                          <input
                            name="handler"
                            defaultValue={o.handler}
                            placeholder="Nom du responsable"
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Commission IBIG</label>
                          <input
                            name="commission"
                            type="number"
                            min="0"
                            defaultValue={o.commission || ""}
                            placeholder="Ex : 50000"
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm w-32 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Type</label>
                          <select
                            name="commissionType"
                            defaultValue={o.commissionType || "FIXED"}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                          >
                            <option value="FIXED">FCFA fixe</option>
                            <option value="PERCENT">% valeur</option>
                          </select>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 transition"
                          >
                            Enregistrer
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditing(null)}
                            className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2 transition"
                          >
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

      {/* Légende */}
      <p className="text-center text-xs text-slate-400">
        {filtered.length} opportunité{filtered.length !== 1 ? "s" : ""} affichée{filtered.length !== 1 ? "s" : ""}
        {filter !== "ALL" ? ` · filtre : ${STATUS_LABELS[filter]}` : ""}
        {search ? ` · recherche : "${search}"` : ""}
      </p>
    </div>
  );
}

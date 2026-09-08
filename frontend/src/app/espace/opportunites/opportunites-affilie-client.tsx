"use client";

import { useState } from "react";
import { fcfa, formatDate } from "@/lib/format";

const CATEGORY_LABELS: Record<string, string> = {
  FORMATION: "Formation", DIGITAL: "Digital / IT", IMMOBILIER: "Immobilier",
  PARTENARIAT: "Partenariat", COMMERCIAL: "Commercial", CONSEIL: "Conseil",
  FINANCEMENT: "Financement", EMPLOI_RH: "Emploi / RH", AUTRE: "Autre",
};
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NEW:      { label: "Nouveau",    color: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "En cours", color: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "Approuvé",  color: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Non retenu", color: "bg-rose-100 text-rose-700" },
  WON:      { label: "Gagné 🎉",  color: "bg-emerald-100 text-emerald-700" },
  LOST:     { label: "Perdu",     color: "bg-slate-100 text-slate-500" },
};
const CATEGORIES = ["FORMATION","DIGITAL","IMMOBILIER","PARTENARIAT","COMMERCIAL","CONSEIL","FINANCEMENT","EMPLOI_RH","AUTRE"];

type Message = { id: string; fromAdmin: boolean; senderName: string; body: string; createdAt: string };
type MyRow = {
  id: string; code: string; title: string; category: string; description: string;
  estimatedValue: number; status: string; handler: string; adminNote: string;
  commission: number; commissionType: string;
  createdAt: string; messages: Message[]; unreadCount: number;
};
type PublicRow = {
  id: string; code: string; title: string; category: string; description: string;
  estimatedValue: number; commission: number; commissionType: string;
  adminNote: string; deadline: string | null; leadCount: number;
  partnerVerified: boolean;
  isRecommended: boolean;
  createdAt: string; myLead: { status: string; createdAt: string } | null;
};

export default function OpportunitesAffilieClient({
  myRows, publicRows, replyAction, submitAction, interestAction,
}: {
  myRows: MyRow[];
  publicRows: PublicRow[];
  replyAction: (fd: FormData) => Promise<void>;
  submitAction: (fd: FormData) => Promise<void>;
  interestAction: (fd: FormData) => Promise<void>;
}) {
  const [tab, setTab]           = useState<"public" | "mine" | "submit">("public");
  const [selected, setSelected] = useState<MyRow | null>(null);
  const [reply, setReply]       = useState("");
  const [note, setNote]         = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [interested, setInterested] = useState<Set<string>>(
    new Set(publicRows.filter(r => r.myLead).map(r => r.id))
  );

  async function handleReply(opp: MyRow) {
    if (!reply.trim()) return;
    const fd = new FormData();
    fd.append("opportunityId", opp.id);
    fd.append("body", reply.trim());
    await replyAction(fd);
    setReply("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    await submitAction(fd);
    (e.target as HTMLFormElement).reset();
    setSubmitting(false);
    setTab("mine");
  }

  async function handleInterest(row: PublicRow) {
    const fd = new FormData();
    fd.append("opportunityId", row.id);
    fd.append("note", note);
    await interestAction(fd);
    setInterested(prev => new Set([...prev, row.id]));
    setNote("");
  }

  const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

  return (
    <div className="space-y-4">
      {/* Onglets */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: "public", label: `🌐 Opportunités disponibles (${publicRows.length})` },
          { key: "mine",   label: `📤 Mes soumissions (${myRows.length})` },
          { key: "submit", label: "➕ Soumettre une opportunité" },
        ] as const).map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setSelected(null); }}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${tab === t.key ? "bg-brand-600 text-white shadow" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Onglet : Opportunités publiques ── */}
      {tab === "public" && (
        <div className="space-y-4">
          {publicRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
              <p className="text-4xl mb-3">🤝</p>
              <p className="font-semibold text-slate-600">Aucune opportunité disponible pour le moment</p>
              <p className="text-sm text-slate-400 mt-1">Revenez bientôt — l'équipe IBIG publie régulièrement de nouvelles opportunités.</p>
            </div>
          ) : (
            publicRows.map(row => {
              const alreadyIn = interested.has(row.id);
              return (
                <div key={row.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        {row.code && <p className="text-[10px] font-mono font-bold text-amber-600">{row.code}</p>}
                        {row.isRecommended && (
                          <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full border border-violet-200">
                            🎯 Pour vous
                          </span>
                        )}
                        {row.partnerVerified && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                            🏢 Entreprise vérifiée
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-slate-900 text-base">{row.title}</p>
                      <span className="inline-block mt-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                        {CATEGORY_LABELS[row.category] ?? row.category}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-400">Rémunération</p>
                      <p className="font-extrabold text-emerald-600 text-sm">Sur résultat ✓</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">{row.description}</p>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                    {row.estimatedValue > 0 && <span>💰 Valeur estimée : <strong className="text-slate-600">{fcfa(row.estimatedValue)}</strong></span>}
                    {row.deadline && <span>⏳ Deadline : <strong className="text-slate-600">{formatDate(row.deadline)}</strong></span>}
                    <span>👥 {row.leadCount} partenaire{row.leadCount !== 1 ? "s" : ""} intéressé{row.leadCount !== 1 ? "s" : ""}</span>
                  </div>

                  {row.adminNote && (
                    <div className="rounded-xl bg-brand-50 border border-brand-100 px-4 py-2 text-sm text-brand-700">
                      <span className="font-semibold">Note IBIG :</span> {row.adminNote}
                    </div>
                  )}

                  {alreadyIn ? (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-2 text-sm text-emerald-700 font-semibold">
                      ✅ Vous êtes inscrit(e) sur cette opportunité — l'équipe IBIG vous contactera.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                        placeholder="Message optionnel : précisez votre approche ou votre réseau sur cette opportunité…"
                        className={inputCls + " resize-none"} />
                      <button onClick={() => handleInterest(row)}
                        className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition-colors">
                        🤝 Je me porte volontaire
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Onglet : Mes soumissions ── */}
      {tab === "mine" && !selected && (
        <div className="space-y-3">
          {myRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
              <p className="text-4xl mb-3">📤</p>
              <p className="font-semibold text-slate-600">Aucune opportunité soumise</p>
              <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">Transmettez une piste commerciale à l'équipe IBIG — si elle est retenue, elle sera partagée à tous les partenaires.</p>
              <button onClick={() => setTab("submit")} className="mt-4 rounded-xl bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700">
                ➕ Soumettre une opportunité
              </button>
            </div>
          ) : (
            myRows.map(row => {
              const s = STATUS_LABELS[row.status] ?? { label: row.status, color: "bg-slate-100 text-slate-600" };
              return (
                <div key={row.id} onClick={() => setSelected(row)}
                  className="cursor-pointer rounded-2xl border border-slate-100 bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    {row.code && <p className="text-[10px] font-mono font-bold text-amber-600">{row.code}</p>}
                    <p className="font-semibold text-slate-900 truncate">{row.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{CATEGORY_LABELS[row.category] ?? row.category} · {formatDate(row.createdAt)}</p>
                    {row.adminNote && <p className="text-xs text-brand-600 mt-1 truncate">💬 {row.adminNote}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {row.unreadCount > 0 && (
                      <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">{row.unreadCount}</span>
                    )}
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.color}`}>{s.label}</span>
                    <span className="text-xs font-bold text-emerald-600">Sur résultat ✓</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Détail d'une soumission ── */}
      {tab === "mine" && selected && (
        <div className="space-y-4">
          <button onClick={() => setSelected(null)} className="text-sm text-brand-600 hover:underline">← Retour</button>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900 text-lg">{selected.title}</p>
                <span className="text-xs text-slate-400">{CATEGORY_LABELS[selected.category] ?? selected.category}</span>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${(STATUS_LABELS[selected.status] ?? {color:"bg-slate-100 text-slate-600"}).color}`}>
                {(STATUS_LABELS[selected.status] ?? {label:selected.status}).label}
              </span>
            </div>
            <p className="text-sm text-slate-600">{selected.description}</p>
            {selected.adminNote && (
              <div className="rounded-xl bg-brand-50 border border-brand-100 px-4 py-2 text-sm text-brand-700">
                <span className="font-semibold">Réponse IBIG :</span> {selected.adminNote}
              </div>
            )}
            {selected.commission > 0 && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-2 text-sm text-emerald-700">
                <span className="font-semibold">Frais de mise en relation IBIG :</span> {fcfa(selected.commission)}
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Messages avec l'équipe IBIG</p>
            {selected.messages.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Aucun échange pour le moment.</p>
            ) : (
              selected.messages.map(m => (
                <div key={m.id} className={`rounded-xl px-4 py-3 text-sm ${m.fromAdmin ? "bg-brand-50 border border-brand-100" : "bg-slate-50 border border-slate-100"}`}>
                  <p className="font-semibold text-xs text-slate-500 mb-1">{m.senderName} · {formatDate(m.createdAt)}</p>
                  <p className="text-slate-700">{m.body}</p>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <textarea value={reply} onChange={e => setReply(e.target.value)} rows={2} placeholder="Votre réponse…" className={inputCls + " resize-none flex-1"} />
            <button onClick={() => handleReply(selected)} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 self-end">
              Envoyer
            </button>
          </div>
        </div>
      )}

      {/* ── Onglet : Soumettre ── */}
      {tab === "submit" && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 max-w-2xl">
          <p className="font-bold text-slate-900 text-base mb-1">Soumettre une opportunité B2B</p>
          <p className="text-sm text-slate-500 mb-5">Vous avez une piste commerciale ? Transmettez-la à l'équipe IBIG. Si elle est validée, elle sera partagée à tout le réseau avec une commission.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Titre de l'opportunité <span className="text-rose-500">*</span></label>
              <input name="title" required placeholder="Ex : PME cherche logiciel de gestion RH" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Catégorie</label>
              <select name="category" className={inputCls}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description complète <span className="text-rose-500">*</span></label>
              <textarea name="description" required rows={4} placeholder="Décrivez l'opportunité : qui, quoi, où, budget estimé, contacts disponibles…" className={inputCls + " resize-none"} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Valeur estimée du deal (FCFA)</label>
              <input name="estimatedValue" type="number" min="0" placeholder="Ex : 500000" className={inputCls} />
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-amber-800">💰 Rémunération de la mise en relation</p>
              <p className="text-xs text-amber-700">Indiquez ce que vous êtes prêt(e) à verser à IBIG pour organiser et formaliser la mise en relation avec un partenaire qualifié.</p>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-semibold text-slate-600 uppercase tracking-wide">Montant proposé</label>
                  <input name="proposedCommission" type="number" min="0" placeholder="Ex : 25000"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 uppercase tracking-wide">Type</label>
                  <select name="proposedCommissionType"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100">
                    <option value="FIXED">FCFA fixe</option>
                    <option value="PERCENT">% de la valeur</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-amber-600">Ce montant sera confirmé ou ajusté par l'équipe IBIG avant publication.</p>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60 transition-colors">
              {submitting ? "Envoi en cours…" : "📤 Soumettre à l'équipe IBIG"}
            </button>
            <p className="text-xs text-slate-400 text-center">L'équipe IBIG examinera votre soumission et vous répondra dans les 48h.</p>
          </form>
        </div>
      )}
    </div>
  );
}

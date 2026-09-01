"use client";

import { useState } from "react";

const CATEGORY_LABELS: Record<string, string> = {
  FORMATION: "🎓 Formation", DIGITAL: "💻 Digital", INFORMATIQUE: "⚙️ Logiciels",
  IMMOBILIER: "🏠 Immobilier", BTP: "🏗️ BTP", CONSEIL: "📋 Conseil",
  FINANCEMENT: "💰 Financement", COMMERCIAL: "🤝 Commercial", PARTENARIAT: "🌐 Partenariat",
  MISE_EN_RELATION: "🔗 Mise en relation", EMPLOI_RH: "👥 Emploi & RH",
  EVENEMENTIEL: "🎪 Événementiel", MARKETING: "📢 Marketing", SERVICES: "🛠️ Services",
  COMMERCE: "🛒 Commerce", LOGISTIQUE: "🚚 Logistique", SANTE: "🏥 Santé",
  AGRI: "🌱 Agriculture", ENERGIE: "⚡ Énergie", INTERNATIONAL: "🌍 International",
  AUTRE: "💡 Autre",
};

const MISSION_TYPE_LABELS: Record<string, string> = {
  LEAD: "Apport de lead", VENTE: "Vente directe", RECRUTEMENT: "Recrutement partenaires",
  REPRESENTATION: "Représentation", PROSPECTION: "Prospection", AUTRE: "Autre",
};

const DIFFICULTY_BADGE: Record<string, string> = {
  EASY: "bg-emerald-100 text-emerald-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HARD: "bg-rose-100 text-rose-700",
};

const STATUS_BADGE: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  CLOSED: "bg-slate-100 text-slate-500",
  COMPLETED: "bg-emerald-100 text-emerald-700",
};

const APP_STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  REJECTED: "bg-rose-100 text-rose-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
};

type Application = {
  id: string; status: string; note: string; result: string; createdAt: string;
  partnerName: string; partnerCode: string; partnerPhone: string; partnerEmail: string;
};

type MissionRow = {
  id: string; title: string; description: string; category: string; missionType: string;
  compensationType: string; compensationAmount: number; zone: string; difficulty: string;
  slots: number; deadline: string | null; status: string; createdAt: string;
  applications: Application[];
};

function compensationLabel(row: MissionRow) {
  if (row.compensationType === "FIXED") {
    return new Intl.NumberFormat("fr-FR").format(row.compensationAmount) + " F CFA";
  }
  return (row.compensationAmount / 100).toFixed(1) + " %";
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function MissionsAdminClient({
  rows, stats, createAction, updateStatusAction, updateAppAction,
}: {
  rows: MissionRow[];
  stats: { total: number; open: number; applications: number; pending: number };
  createAction: (fd: FormData) => Promise<void>;
  updateStatusAction: (fd: FormData) => Promise<void>;
  updateAppAction: (fd: FormData) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const filtered = rows.filter(r => filterStatus === "ALL" || r.status === filterStatus);

  return (
    <div className="space-y-6">

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Missions créées", value: stats.total, color: "text-slate-800" },
          { label: "Missions ouvertes", value: stats.open, color: "text-blue-700" },
          { label: "Candidatures reçues", value: stats.applications, color: "text-violet-700" },
          { label: "En attente de validation", value: stats.pending, color: "text-amber-700" },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{k.label}</p>
            <p className={`text-3xl font-extrabold mt-1 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Barre d'outils */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2">
          {["ALL", "OPEN", "CLOSED", "COMPLETED"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold border transition ${filterStatus === s ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
              {s === "ALL" ? "Toutes" : s === "OPEN" ? "Ouvertes" : s === "CLOSED" ? "Fermées" : "Terminées"}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 transition">
          {showForm ? "✕ Annuler" : "+ Créer une mission"}
        </button>
      </div>

      {/* Formulaire de création */}
      {showForm && (
        <form action={async (fd) => { await createAction(fd); setShowForm(false); }}
          className="rounded-2xl border border-blue-100 bg-blue-50 p-5 space-y-4">
          <p className="font-bold text-blue-800 text-sm mb-1">Nouvelle mission</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Titre *</label>
              <input name="title" required className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Description *</label>
              <textarea name="description" required rows={3} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none resize-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Catégorie</label>
              <select name="category" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Type de mission</label>
              <select name="missionType" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                {Object.entries(MISSION_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Rémunération (type)</label>
              <select name="compensationType" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                <option value="FIXED">Montant fixe (F CFA)</option>
                <option value="PERCENT">Pourcentage (× 100 ex: 1000 = 10%)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Montant / Taux</label>
              <input name="compensationAmount" type="number" min="0" defaultValue="25000" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Zone géographique</label>
              <select name="zone" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                {["Côte d'Ivoire","Abidjan","Afrique de l'Ouest","Afrique","International"].map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Difficulté</label>
              <select name="difficulty" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                <option value="EASY">Facile</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="HARD">Difficile</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Places disponibles</label>
              <input name="slots" type="number" min="1" defaultValue="10" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Date limite (optionnel)</label>
              <input name="deadline" type="date" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
          </div>
          <button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-2.5 transition">
            Créer la mission →
          </button>
        </form>
      )}

      {/* Liste des missions */}
      <div className="space-y-4">
        {filtered.map(m => {
          const isOpen = expanded === m.id;
          const pending = m.applications.filter(a => a.status === "PENDING").length;
          return (
            <div key={m.id} className="rounded-2xl border border-slate-100 bg-white shadow-sm">
              <button onClick={() => setExpanded(isOpen ? null : m.id)}
                className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-slate-50/40 rounded-2xl transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${STATUS_BADGE[m.status] ?? "bg-slate-100 text-slate-500"}`}>
                      {m.status === "OPEN" ? "Ouverte" : m.status === "CLOSED" ? "Fermée" : "Terminée"}
                    </span>
                    <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${DIFFICULTY_BADGE[m.difficulty]}`}>
                      {m.difficulty === "EASY" ? "Facile" : m.difficulty === "MEDIUM" ? "Moyenne" : "Difficile"}
                    </span>
                    <span className="text-[10px] text-slate-400">{CATEGORY_LABELS[m.category] ?? m.category}</span>
                  </div>
                  <p className="font-semibold text-slate-800 text-sm mt-1">{m.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {MISSION_TYPE_LABELS[m.missionType]} · {compensationLabel(m)} · {m.zone} · {m.slots} place{m.slots > 1 ? "s" : ""}
                    {m.deadline ? ` · jusqu'au ${fmtDate(m.deadline)}` : ""}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {pending > 0 && (
                    <span className="rounded-full bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5">
                      {pending} en attente
                    </span>
                  )}
                  <span className="text-xs text-slate-400">{m.applications.length} candid.</span>
                  <span className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 px-5 py-5 space-y-5">
                  {/* Description */}
                  <p className="text-sm text-slate-600 leading-relaxed">{m.description}</p>

                  {/* Actions statut mission */}
                  <div className="flex gap-2 flex-wrap">
                    {["OPEN","CLOSED","COMPLETED"].map(s => (
                      <form key={s} action={updateStatusAction}>
                        <input type="hidden" name="id" value={m.id} />
                        <input type="hidden" name="status" value={s} />
                        <button type="submit" disabled={m.status === s}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold border transition disabled:opacity-40 ${m.status === s ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                          {s === "OPEN" ? "Ouverte" : s === "CLOSED" ? "Fermer" : "Marquer terminée"}
                        </button>
                      </form>
                    ))}
                  </div>

                  {/* Candidatures */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">
                      Candidatures ({m.applications.length})
                    </p>
                    {m.applications.length === 0 ? (
                      <p className="text-sm text-slate-400 italic">Aucune candidature pour le moment.</p>
                    ) : (
                      <div className="space-y-3">
                        {m.applications.map(a => (
                          <div key={a.id} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                            <div className="flex items-start gap-3 flex-wrap">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-sm text-slate-800">{a.partnerName}</p>
                                  <span className="text-[10px] text-slate-400">{a.partnerCode}</span>
                                  <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${APP_STATUS_BADGE[a.status] ?? "bg-slate-100 text-slate-500"}`}>
                                    {a.status === "PENDING" ? "En attente" : a.status === "ACCEPTED" ? "Acceptée" : a.status === "REJECTED" ? "Refusée" : "Terminée"}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500">{a.partnerEmail} · {a.partnerPhone}</p>
                                {a.note && <p className="text-xs text-slate-600 mt-1 italic">« {a.note} »</p>}
                                {a.result && <p className="text-xs text-emerald-700 mt-1 font-medium">Résultat : {a.result}</p>}
                                <p className="text-[10px] text-slate-400 mt-1">{fmtDate(a.createdAt)}</p>
                              </div>
                              <div className="flex gap-1.5 flex-wrap">
                                {["ACCEPTED","REJECTED","COMPLETED"].map(s => (
                                  <form key={s} action={updateAppAction}>
                                    <input type="hidden" name="id" value={a.id} />
                                    <input type="hidden" name="status" value={s} />
                                    <button type="submit" disabled={a.status === s}
                                      className={`rounded-lg px-2.5 py-1 text-[10px] font-bold border transition disabled:opacity-40 ${
                                        s === "ACCEPTED" ? "border-blue-200 text-blue-700 hover:bg-blue-50" :
                                        s === "REJECTED" ? "border-rose-200 text-rose-700 hover:bg-rose-50" :
                                        "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                      } bg-white`}>
                                      {s === "ACCEPTED" ? "✓ Accepter" : s === "REJECTED" ? "✗ Refuser" : "★ Terminée"}
                                    </button>
                                  </form>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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

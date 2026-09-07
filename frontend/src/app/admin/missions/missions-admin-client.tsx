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
  LEAD: "Apport de lead", VENTE: "Vente directe", RECRUTEMENT: "Recrutement",
  REPRESENTATION: "Représentation", PROSPECTION: "Prospection",
  SOURCING: "Sourcing", MISE_EN_RELATION: "Mise en relation",
  ETUDE: "Étude", ANIMATION: "Animation", PARTENARIAT: "Partenariat",
  IDENTIFICATION: "Identification d'opportunité", AUTRE: "Autre",
};

const BRANCH_LABELS: Record<string, string> = {
  EDUFORM: "IBIG EDUFORM", DIGITAL: "IBIG DIGITAL", SOFT: "IBIG SOFT",
  IMMOTRUST: "IBIG IMMOTRUST", CONSEIL: "IBIG CONSEIL+", PARTNERS: "IBIG PARTNERS",
  MARKET: "IBIG MARKET", MULTISERVICES: "IBIG MULTISERVICES",
};

const LEVEL_LABELS: Record<string, string> = {
  "": "Tous niveaux", CONNECTEUR: "Connecteur", PARTNER: "Partner",
  BUSINESS_PARTNER: "Business Partner", PREMIUM_PARTNER: "Premium Partner", ELITE_PARTNER: "Elite Partner",
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
  ARCHIVED: "bg-stone-100 text-stone-500",
};

const APP_STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  REJECTED: "bg-rose-100 text-rose-700",
  SUBMITTED: "bg-violet-100 text-violet-700",
  VALIDATED: "bg-emerald-100 text-emerald-700",
  REJECTED_PROOF: "bg-rose-200 text-rose-800",
  COMPLETED: "bg-emerald-100 text-emerald-700",
};

const APP_STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente", ACCEPTED: "Acceptée", REJECTED: "Refusée",
  SUBMITTED: "Preuve soumise", VALIDATED: "Validée ✓", REJECTED_PROOF: "Preuve rejetée", COMPLETED: "Terminée",
};

const REWARD_BADGE: Record<string, string> = {
  CASH: "bg-emerald-100 text-emerald-700",
  CP: "bg-violet-100 text-violet-700",
  MIXED: "bg-blue-100 text-blue-700",
};

type Application = {
  id: string; status: string; note: string; result: string;
  proofUrl: string; proofNote: string; submittedAt: string | null;
  validatedAt: string | null; cpEarned: number; commissionEarned: number;
  createdAt: string;
  partnerName: string; partnerCode: string; partnerPhone: string; partnerEmail: string;
};

type MissionRow = {
  id: string; code: string; title: string; description: string;
  category: string; missionType: string; branch: string;
  rewardType: string; compensationType: string; compensationAmount: number;
  cpAmount: number; rewardTrigger: string; zone: string;
  difficulty: string; minLevel: string; slots: number;
  proofInstructions: string; adminNote: string;
  deadline: string | null; status: string; active: boolean; createdAt: string;
  applications: Application[];
};

function rewardLabel(row: MissionRow) {
  const cash = row.compensationType === "PERCENT"
    ? (row.compensationAmount / 100).toFixed(1) + "%"
    : new Intl.NumberFormat("fr-FR").format(row.compensationAmount) + " F";
  if (row.rewardType === "CASH") return cash;
  if (row.rewardType === "CP") return `${row.cpAmount} CP`;
  return `${cash} + ${row.cpAmount} CP`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function MissionsAdminClient({
  rows, stats, createAction, updateAction, updateStatusAction, updateAppAction, validateAppAction,
}: {
  rows: MissionRow[];
  stats: { total: number; open: number; applications: number; pending: number; submitted: number };
  createAction: (fd: FormData) => Promise<void>;
  updateAction: (fd: FormData) => Promise<void>;
  updateStatusAction: (fd: FormData) => Promise<void>;
  updateAppAction: (fd: FormData) => Promise<void>;
  validateAppAction: (fd: FormData) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [rewardTypeForm, setRewardTypeForm] = useState("CASH");

  const filtered = rows.filter(r => filterStatus === "ALL" || r.status === filterStatus);

  return (
    <div className="space-y-6">

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-5">
        {[
          { label: "Missions", value: stats.total, color: "text-slate-800" },
          { label: "Ouvertes", value: stats.open, color: "text-blue-700" },
          { label: "Candidatures", value: stats.applications, color: "text-violet-700" },
          { label: "En attente", value: stats.pending, color: "text-amber-700" },
          { label: "Preuves à valider", value: stats.submitted, color: "text-violet-800" },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{k.label}</p>
            <p className={`text-3xl font-extrabold mt-1 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Barre d'outils */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
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
          className="rounded-2xl border border-blue-100 bg-blue-50 p-6 space-y-5">
          <p className="font-bold text-blue-800 text-sm">Nouvelle mission</p>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Titre */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Titre *</label>
              <input name="title" required className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Description *</label>
              <textarea name="description" required rows={3} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none resize-none focus:border-blue-400" />
            </div>
            {/* Code */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Code mission (ex: EDU-001)</label>
              <input name="code" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" placeholder="EDU-001" />
            </div>
            {/* Branche */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Branche IBIG</label>
              <select name="branch" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                <option value="">Toutes branches</option>
                {Object.entries(BRANCH_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            {/* Catégorie */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Catégorie</label>
              <select name="category" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            {/* Type de mission */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Type de mission</label>
              <select name="missionType" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                {Object.entries(MISSION_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>

            {/* Type de récompense */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Type de récompense *</label>
              <select name="rewardType" value={rewardTypeForm} onChange={e => setRewardTypeForm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                <option value="CASH">💵 CASH uniquement</option>
                <option value="CP">🪙 Crédits Partners (CP) uniquement</option>
                <option value="MIXED">💎 MIXTE (Cash + CP)</option>
              </select>
            </div>
            {/* Déclencheur */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Déclencheur récompense</label>
              <select name="rewardTrigger" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                <option value="VALIDATION">À la validation de la preuve</option>
                <option value="COMMERCIAL_RESULT">Au résultat commercial</option>
                <option value="BOTH">Les deux étapes</option>
              </select>
            </div>

            {/* Montant CASH (masqué si CP pur) */}
            {rewardTypeForm !== "CP" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Type montant CASH</label>
                  <select name="compensationType" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                    <option value="FIXED">Montant fixe (F CFA)</option>
                    <option value="PERCENT">Pourcentage (× 100 ex: 1000 = 10%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Montant CASH (F CFA)</label>
                  <input name="compensationAmount" type="number" min="0" defaultValue="25000" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
              </>
            )}

            {/* CP (masqué si CASH pur) */}
            {rewardTypeForm !== "CASH" && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Crédits Partners (CP)</label>
                <input name="cpAmount" type="number" min="0" defaultValue="20" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
              </div>
            )}

            {/* Zone */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Zone géographique</label>
              <select name="zone" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                {["Côte d'Ivoire","Abidjan","Afrique de l'Ouest","Afrique","International"].map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            {/* Difficulté */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Difficulté</label>
              <select name="difficulty" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                <option value="EASY">Facile</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="HARD">Difficile</option>
              </select>
            </div>
            {/* Niveau minimum */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Niveau minimum</label>
              <select name="minLevel" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                {Object.entries(LEVEL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            {/* Places */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Places disponibles</label>
              <input name="slots" type="number" min="1" defaultValue="10" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            {/* Date limite */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Date limite (optionnel)</label>
              <input name="deadline" type="date" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            {/* Preuves */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Instructions de preuve</label>
              <textarea name="proofInstructions" rows={2} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none resize-none focus:border-blue-400"
                placeholder="Ex : Fournir une fiche prospect complète (nom, prénom, entreprise, téléphone, email, poste). Photo du RV ou email de confirmation." />
            </div>
            {/* Note admin */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Note interne (admin)</label>
              <input name="adminNote" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
          </div>

          <button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-2.5 transition">
            Créer la mission →
          </button>
        </form>
      )}

      {/* Liste des missions */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
            <p className="text-sm text-slate-400">Aucune mission à afficher.</p>
          </div>
        )}
        {filtered.map(m => {
          const isOpen = expanded === m.id;
          const pending = m.applications.filter(a => a.status === "PENDING").length;
          const submitted = m.applications.filter(a => a.status === "SUBMITTED").length;
          return (
            <div key={m.id} className="rounded-2xl border border-slate-100 bg-white shadow-sm">
              <button onClick={() => setExpanded(isOpen ? null : m.id)}
                className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-slate-50/40 rounded-2xl transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase border ${STATUS_BADGE[m.status] ?? "bg-slate-100 text-slate-500"}`}>
                      {m.status === "OPEN" ? "Ouverte" : m.status === "CLOSED" ? "Fermée" : m.status === "COMPLETED" ? "Terminée" : "Archivée"}
                    </span>
                    <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${REWARD_BADGE[m.rewardType] ?? "bg-slate-100 text-slate-500"}`}>
                      {m.rewardType}
                    </span>
                    {m.branch && (
                      <span className="rounded-lg px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {BRANCH_LABELS[m.branch] ?? m.branch}
                      </span>
                    )}
                    <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${DIFFICULTY_BADGE[m.difficulty]}`}>
                      {m.difficulty === "EASY" ? "Facile" : m.difficulty === "MEDIUM" ? "Moyenne" : "Difficile"}
                    </span>
                    {m.code && <span className="text-[10px] text-slate-400 font-mono">{m.code}</span>}
                  </div>
                  <p className="font-semibold text-slate-800 text-sm mt-1">{m.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {MISSION_TYPE_LABELS[m.missionType] ?? m.missionType} · {rewardLabel(m)} · {m.zone} · {m.slots} place{m.slots > 1 ? "s" : ""}
                    {m.minLevel ? ` · min. ${LEVEL_LABELS[m.minLevel] ?? m.minLevel}` : ""}
                    {m.deadline ? ` · jusqu'au ${fmtDate(m.deadline)}` : ""}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {submitted > 0 && (
                    <span className="rounded-full bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5">
                      {submitted} preuve{submitted > 1 ? "s" : ""} à valider
                    </span>
                  )}
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
                  {/* Description + infos */}
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 leading-relaxed">{m.description}</p>
                    {m.proofInstructions && (
                      <div className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-3">
                        <p className="text-xs font-bold text-violet-700 mb-1">📎 Preuves attendues</p>
                        <p className="text-xs text-violet-800">{m.proofInstructions}</p>
                      </div>
                    )}
                    {m.adminNote && (
                      <p className="text-xs text-slate-400 italic">Note : {m.adminNote}</p>
                    )}
                  </div>

                  {/* Actions statut mission */}
                  <div className="flex gap-2 flex-wrap items-center">
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
                    <button onClick={() => setEditing(editing === m.id ? null : m.id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold border transition ${editing === m.id ? "bg-amber-600 text-white border-amber-600" : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"}`}>
                      {editing === m.id ? "✕ Annuler édition" : "✏️ Modifier cette mission"}
                    </button>
                  </div>

                  {/* Formulaire d'édition rapide */}
                  {editing === m.id && (
                    <form action={async (fd) => { await updateAction(fd); setEditing(null); }}
                      className="rounded-2xl border border-amber-100 bg-amber-50 p-5 space-y-4">
                      <p className="font-bold text-amber-800 text-sm">✏️ Modifier la mission</p>
                      <input type="hidden" name="id" value={m.id} />

                      <div className="grid sm:grid-cols-2 gap-4">
                        {/* Titre */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-1">Titre</label>
                          <input name="title" defaultValue={m.title}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400" />
                        </div>
                        {/* Description */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-1">Description — ce que doit faire l&apos;affilié</label>
                          <textarea name="description" defaultValue={m.description} rows={4}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none resize-y focus:border-amber-400" />
                        </div>
                        {/* Instructions de preuve */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-1">Instructions de preuve</label>
                          <textarea name="proofInstructions" defaultValue={m.proofInstructions} rows={3}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none resize-y focus:border-amber-400"
                            placeholder="Ex : Fiche prospect complète + photo du RV ou email de confirmation." />
                        </div>
                        {/* Type mission */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Type de mission</label>
                          <select name="missionType" defaultValue={m.missionType}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                            {Object.entries(MISSION_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                          </select>
                        </div>
                        {/* Montant */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Montant CASH (F CFA)</label>
                          <input name="compensationAmount" type="number" min="0" defaultValue={m.compensationAmount}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400" />
                        </div>
                        {/* Places */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Places disponibles</label>
                          <input name="slots" type="number" min="1" defaultValue={m.slots}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400" />
                        </div>
                        {/* Zone */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Zone géographique</label>
                          <select name="zone" defaultValue={m.zone}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                            {["Côte d'Ivoire","Abidjan","Afrique de l'Ouest","Afrique","International"].map(z => <option key={z} value={z}>{z}</option>)}
                          </select>
                        </div>
                        {/* Date limite */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Date limite</label>
                          <input name="deadline" type="date" defaultValue={m.deadline ? m.deadline.slice(0, 10) : ""}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400" />
                        </div>
                        {/* Note admin */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-1">Note interne (admin)</label>
                          <input name="adminNote" defaultValue={m.adminNote}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400" />
                        </div>
                      </div>

                      <button type="submit"
                        className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold px-6 py-2.5 transition">
                        Enregistrer les modifications →
                      </button>
                    </form>
                  )}

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
                          <div key={a.id} className={`rounded-xl border px-4 py-3 ${a.status === "SUBMITTED" ? "border-violet-200 bg-violet-50" : "border-slate-100 bg-slate-50"}`}>
                            <div className="flex items-start gap-3 flex-wrap">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold text-sm text-slate-800">{a.partnerName}</p>
                                  <span className="text-[10px] text-slate-400">{a.partnerCode}</span>
                                  <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${APP_STATUS_BADGE[a.status] ?? "bg-slate-100 text-slate-500"}`}>
                                    {APP_STATUS_LABEL[a.status] ?? a.status}
                                  </span>
                                  {a.cpEarned > 0 && (
                                    <span className="rounded-md px-1.5 py-0.5 text-[9px] font-bold bg-violet-100 text-violet-700">+{a.cpEarned} CP</span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500">{a.partnerEmail} · {a.partnerPhone}</p>
                                {a.note && <p className="text-xs text-slate-600 mt-1 italic">« {a.note} »</p>}
                                {a.result && <p className="text-xs text-emerald-700 mt-1 font-medium">Résultat : {a.result}</p>}

                                {/* Preuve soumise */}
                                {(a.proofNote || a.proofUrl) && (
                                  <div className="mt-2 rounded-lg border border-violet-200 bg-white px-3 py-2 space-y-1">
                                    <p className="text-[10px] font-bold text-violet-700">Preuve soumise {a.submittedAt ? `le ${fmtDate(a.submittedAt)}` : ""}</p>
                                    {a.proofNote && <p className="text-xs text-slate-700">{a.proofNote}</p>}
                                    {a.proofUrl && (
                                      <a href={a.proofUrl} target="_blank" rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline break-all">🔗 {a.proofUrl}</a>
                                    )}
                                  </div>
                                )}

                                <p className="text-[10px] text-slate-400 mt-1">{fmtDate(a.createdAt)}</p>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-col gap-1.5">
                                {/* Accepter/Refuser une candidature PENDING */}
                                {(a.status === "PENDING") && (
                                  <div className="flex gap-1.5">
                                    <form action={updateAppAction}>
                                      <input type="hidden" name="id" value={a.id} />
                                      <input type="hidden" name="status" value="ACCEPTED" />
                                      <button type="submit" className="rounded-lg px-2.5 py-1 text-[10px] font-bold border border-blue-200 text-blue-700 bg-white hover:bg-blue-50 transition">✓ Accepter</button>
                                    </form>
                                    <form action={updateAppAction}>
                                      <input type="hidden" name="id" value={a.id} />
                                      <input type="hidden" name="status" value="REJECTED" />
                                      <button type="submit" className="rounded-lg px-2.5 py-1 text-[10px] font-bold border border-rose-200 text-rose-700 bg-white hover:bg-rose-50 transition">✗ Refuser</button>
                                    </form>
                                  </div>
                                )}

                                {/* Valider/Rejeter une preuve SUBMITTED */}
                                {a.status === "SUBMITTED" && (
                                  <div className="flex flex-col gap-1.5">
                                    <form action={validateAppAction} className="flex gap-1.5">
                                      <input type="hidden" name="id" value={a.id} />
                                      <input type="hidden" name="action" value="VALIDATE" />
                                      <button type="submit"
                                        className="rounded-lg px-2.5 py-1 text-[10px] font-bold border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition">
                                        ✓ Valider {m.rewardType !== "CASH" ? `+${m.cpAmount} CP` : ""}
                                      </button>
                                    </form>
                                    <form action={validateAppAction} className="flex gap-1.5">
                                      <input type="hidden" name="id" value={a.id} />
                                      <input type="hidden" name="action" value="REJECT_PROOF" />
                                      <button type="submit"
                                        className="rounded-lg px-2.5 py-1 text-[10px] font-bold border border-rose-200 text-rose-700 bg-white hover:bg-rose-50 transition">
                                        ✗ Rejeter preuve
                                      </button>
                                    </form>
                                  </div>
                                )}

                                {/* Marquer COMPLETED si VALIDATED */}
                                {a.status === "VALIDATED" && (
                                  <form action={updateAppAction}>
                                    <input type="hidden" name="id" value={a.id} />
                                    <input type="hidden" name="status" value="COMPLETED" />
                                    <button type="submit" className="rounded-lg px-2.5 py-1 text-[10px] font-bold border border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50 transition">★ Terminée</button>
                                  </form>
                                )}
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

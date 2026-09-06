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
  IDENTIFICATION: "Identification", AUTRE: "Autre",
};

const BRANCH_LABELS: Record<string, string> = {
  EDUFORM: "IBIG EDUFORM", DIGITAL: "IBIG DIGITAL", SOFT: "IBIG SOFT",
  IMMOTRUST: "IBIG IMMOTRUST", CONSEIL: "IBIG CONSEIL+", PARTNERS: "IBIG PARTNERS",
  MARKET: "IBIG MARKET", MULTISERVICES: "IBIG MULTISERVICES",
};

const DIFFICULTY_CONFIG: Record<string, { label: string; badge: string }> = {
  EASY: { label: "Facile", badge: "bg-emerald-100 text-emerald-700" },
  MEDIUM: { label: "Moyenne", badge: "bg-amber-100 text-amber-700" },
  HARD: { label: "Difficile", badge: "bg-rose-100 text-rose-700" },
};

const APP_STATUS: Record<string, { label: string; badge: string }> = {
  PENDING:       { label: "En attente", badge: "bg-amber-100 text-amber-700" },
  ACCEPTED:      { label: "Acceptée ✓", badge: "bg-blue-100 text-blue-700" },
  REJECTED:      { label: "Non retenue", badge: "bg-rose-100 text-rose-700" },
  SUBMITTED:     { label: "Preuve soumise", badge: "bg-violet-100 text-violet-700" },
  VALIDATED:     { label: "Validée 🏆", badge: "bg-emerald-100 text-emerald-700" },
  REJECTED_PROOF:{ label: "Preuve rejetée", badge: "bg-rose-200 text-rose-800" },
  COMPLETED:     { label: "Terminée 🏆", badge: "bg-emerald-100 text-emerald-700" },
};

type MissionApp = {
  id: string; status: string; note: string; result: string;
  proofUrl: string; proofNote: string; submittedAt: string | null;
  cpEarned: number; commissionEarned: number; createdAt: string;
};

type MyApp = MissionApp & {
  missionId: string; missionTitle: string; missionStatus: string;
};

type MissionRow = {
  id: string; code: string; title: string; description: string;
  category: string; missionType: string; branch: string;
  rewardType: string; compensationType: string; compensationAmount: number;
  cpAmount: number; minLevel: string; proofInstructions: string;
  zone: string; difficulty: string; slots: number;
  deadline: string | null; status: string; createdAt: string;
  totalApplications: number; myApplication: MissionApp | null;
};

function rewardLabel(m: MissionRow) {
  const cash = m.compensationType === "FIXED"
    ? new Intl.NumberFormat("fr-FR").format(m.compensationAmount) + " F"
    : (m.compensationAmount / 100).toFixed(1) + " %";
  if (m.rewardType === "CP") return `${m.cpAmount} CP`;
  if (m.rewardType === "MIXED") return `${cash} + ${m.cpAmount} CP`;
  return cash;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function MissionCard({
  m, applyAction, withdrawAction, submitProofAction,
}: {
  m: MissionRow;
  applyAction: (fd: FormData) => Promise<void>;
  withdrawAction: (fd: FormData) => Promise<void>;
  submitProofAction: (fd: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [proofNote, setProofNote] = useState("");
  const diff = DIFFICULTY_CONFIG[m.difficulty] ?? DIFFICULTY_CONFIG.MEDIUM;
  const spots = m.slots - m.totalApplications;
  const app = m.myApplication;
  const hasApp = app !== null;

  const rewardBadge = m.rewardType === "CP" ? "bg-violet-100 text-violet-700"
    : m.rewardType === "MIXED" ? "bg-blue-100 text-blue-700"
    : "bg-emerald-100 text-emerald-700";

  return (
    <div className={`rounded-2xl border bg-white shadow-sm transition-all ${hasApp ? "border-blue-200 ring-1 ring-blue-100" : "border-slate-100"}`}>
      <div className="p-4 space-y-2">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              <span className="text-[10px] font-bold text-slate-500">{CATEGORY_LABELS[m.category] ?? m.category}</span>
              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${diff.badge}`}>{diff.label}</span>
              {m.branch && (
                <span className="rounded-md px-1.5 py-0.5 text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {BRANCH_LABELS[m.branch] ?? m.branch}
                </span>
              )}
            </div>
            <p className="font-bold text-slate-900 text-sm leading-snug">{m.title}</p>
          </div>
          {hasApp && (
            <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase ${APP_STATUS[app!.status]?.badge ?? "bg-slate-100 text-slate-500"}`}>
              {APP_STATUS[app!.status]?.label ?? app!.status}
            </span>
          )}
        </div>

        {/* Récompense + zone + places */}
        <div className="grid grid-cols-3 gap-2">
          <div className={`rounded-xl px-3 py-2 ${m.rewardType === "CP" ? "bg-violet-50" : m.rewardType === "MIXED" ? "bg-blue-50" : "bg-emerald-50"}`}>
            <p className={`text-[9px] font-bold uppercase tracking-wide ${m.rewardType === "CP" ? "text-violet-500" : m.rewardType === "MIXED" ? "text-blue-500" : "text-emerald-500"}`}>
              {m.rewardType === "CP" ? "CP" : m.rewardType === "MIXED" ? "Cash + CP" : "Prime"}
            </p>
            <p className={`text-sm font-extrabold ${m.rewardType === "CP" ? "text-violet-700" : m.rewardType === "MIXED" ? "text-blue-700" : "text-emerald-700"}`}>
              {rewardLabel(m)}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Zone</p>
            <p className="text-xs font-semibold text-slate-700 truncate">{m.zone}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Places</p>
            <p className={`text-xs font-bold ${spots <= 2 ? "text-rose-600" : "text-slate-700"}`}>
              {spots > 0 ? `${spots} dispo.` : "Complet"}
            </p>
          </div>
        </div>

        {m.deadline && (
          <p className="text-[10px] text-rose-600 font-semibold">⏰ Jusqu&apos;au {fmtDate(m.deadline)}</p>
        )}
      </div>

      <div className="border-t border-slate-50">
        <button onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition">
          <span>{open ? "Masquer les détails" : "Voir les détails et postuler"}</span>
          <span className={`transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
        </button>

        {open && (
          <div className="px-4 pb-4 space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">{m.description}</p>

            {/* Infos preuve attendue */}
            {m.proofInstructions && (
              <div className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-3">
                <p className="text-[10px] font-bold text-violet-700 uppercase tracking-wide mb-1">📎 Preuves attendues</p>
                <p className="text-xs text-violet-800 leading-relaxed">{m.proofInstructions}</p>
              </div>
            )}

            {/* CP gagnés si validée */}
            {app && (app.status === "VALIDATED" || app.status === "COMPLETED") && app.cpEarned > 0 && (
              <div className="rounded-xl bg-violet-50 border border-violet-100 px-4 py-3">
                <p className="text-xs font-bold text-violet-700">🪙 +{app.cpEarned} Crédits Partners gagnés !</p>
              </div>
            )}

            {/* Résultat */}
            {app?.result && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mb-1">Résultat</p>
                <p className="text-sm text-emerald-800">{app.result}</p>
              </div>
            )}

            {/* Preuve soumise affichage */}
            {app && (app.status === "SUBMITTED" || app.status === "VALIDATED" || app.status === "REJECTED_PROOF") && (app.proofNote || app.proofUrl) && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Votre preuve soumise {app.submittedAt ? `le ${fmtDate(app.submittedAt)}` : ""}</p>
                {app.proofNote && <p className="text-xs text-slate-700">{app.proofNote}</p>}
                {app.proofUrl && <a href={app.proofUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline break-all">🔗 {app.proofUrl}</a>}
              </div>
            )}

            {/* Formulaire soumission preuve (si ACCEPTED) */}
            {app && app.status === "ACCEPTED" && (
              <form action={submitProofAction} className="space-y-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-bold text-blue-800">📤 Soumettre votre preuve de réalisation</p>
                <input type="hidden" name="applicationId" value={app.id} />
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Lien (URL de preuve)</label>
                  <input name="proofUrl" type="url" value={proofUrl} onChange={e => setProofUrl(e.target.value)}
                    placeholder="https://… (Google Drive, capture, document…)"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Description de la preuve *</label>
                  <textarea name="proofNote" rows={3} value={proofNote} onChange={e => setProofNote(e.target.value)} required
                    placeholder="Décrivez ce que vous avez réalisé, le contact établi, le résultat obtenu…"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none resize-none focus:border-blue-400" />
                </div>
                <button type="submit"
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 transition">
                  Soumettre ma preuve →
                </button>
              </form>
            )}

            {/* Formulaire candidature */}
            {!hasApp && spots > 0 && (
              <form action={applyAction} className="space-y-3">
                <input type="hidden" name="missionId" value={m.id} />
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Message de candidature (optionnel)</label>
                  <textarea name="note" rows={3} value={note} onChange={e => setNote(e.target.value)}
                    placeholder="Présentez votre motivation, votre réseau ou vos atouts pour cette mission…"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
                <button type="submit"
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 transition shadow-sm">
                  Je candidate à cette mission →
                </button>
              </form>
            )}

            {/* Retirer candidature si pending */}
            {hasApp && app!.status === "PENDING" && (
              <form action={withdrawAction} className="flex items-center gap-3">
                <input type="hidden" name="missionId" value={m.id} />
                <p className="text-xs text-slate-500 flex-1">Candidature soumise le {fmtDate(app!.createdAt)}</p>
                <button type="submit" className="rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold px-3 py-1.5 transition">
                  Retirer
                </button>
              </form>
            )}

            {spots === 0 && !hasApp && (
              <p className="text-sm text-slate-400 italic text-center py-2">Mission complète — plus de place disponible.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MissionsAffilieClient({
  rows, myApps, applyAction, withdrawAction, submitProofAction,
}: {
  rows: MissionRow[];
  myApps: MyApp[];
  applyAction: (fd: FormData) => Promise<void>;
  withdrawAction: (fd: FormData) => Promise<void>;
  submitProofAction: (fd: FormData) => Promise<void>;
}) {
  const [tab, setTab] = useState<"missions" | "mes-candidatures">("missions");
  const [filterType, setFilterType] = useState("ALL");

  const myCompleted = myApps.filter(a => a.status === "COMPLETED" || a.status === "VALIDATED").length;
  const mySubmitted = myApps.filter(a => a.status === "SUBMITTED").length;
  const totalCp = myApps.reduce((s, a) => s + (a.cpEarned ?? 0), 0);

  const filtered = rows.filter(m => filterType === "ALL" || m.missionType === filterType);

  return (
    <div className="space-y-6">

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-900 to-blue-900 px-6 py-7 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 30%, #a78bfa 0%, transparent 60%)" }} />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-300 mb-1">IBIG PARTNERS — Missions</p>
          <h2 className="text-xl font-extrabold mb-1">Des missions. Des primes. Des résultats.</h2>
          <p className="text-sm text-white/70 max-w-lg leading-relaxed">
            Choisissez une mission adaptée à votre réseau et votre territoire. Accomplissez-la et recevez votre récompense (cash et/ou Crédits Partners).
          </p>
          <div className="mt-4 flex gap-3 flex-wrap">
            <div className="rounded-xl bg-white/10 px-4 py-2 text-center">
              <p className="text-xl font-extrabold">{rows.length}</p>
              <p className="text-[10px] text-white/60 uppercase tracking-wide">Missions disponibles</p>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-2 text-center">
              <p className="text-xl font-extrabold">{myApps.length}</p>
              <p className="text-[10px] text-white/60 uppercase tracking-wide">Mes candidatures</p>
            </div>
            <div className="rounded-xl bg-emerald-500/20 px-4 py-2 text-center">
              <p className="text-xl font-extrabold text-emerald-300">{myCompleted}</p>
              <p className="text-[10px] text-white/60 uppercase tracking-wide">Missions accomplies</p>
            </div>
            {totalCp > 0 && (
              <div className="rounded-xl bg-violet-500/20 px-4 py-2 text-center">
                <p className="text-xl font-extrabold text-violet-300">{totalCp}</p>
                <p className="text-[10px] text-white/60 uppercase tracking-wide">CP gagnés</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerte preuves en attente */}
      {mySubmitted > 0 && (
        <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 flex items-center gap-3">
          <span className="text-violet-600 text-lg">🔔</span>
          <p className="text-sm text-violet-800 font-semibold">
            {mySubmitted} preuve{mySubmitted > 1 ? "s" : ""} soumise{mySubmitted > 1 ? "s" : ""} en cours de validation par l'équipe IBIG.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-100">
        {(["missions","mes-candidatures"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-2.5 px-1 text-sm font-bold border-b-2 transition ${tab === t ? "border-blue-600 text-blue-700" : "border-transparent text-slate-400 hover:text-slate-700"}`}>
            {t === "missions" ? `🎯 Missions (${rows.length})` : `📋 Mes candidatures (${myApps.length})`}
          </button>
        ))}
      </div>

      {tab === "missions" && (
        <>
          <div className="overflow-x-auto pb-1">
            <div className="flex gap-2 min-w-max">
              <button onClick={() => setFilterType("ALL")}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold border transition ${filterType === "ALL" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                Toutes
              </button>
              {Object.entries(MISSION_TYPE_LABELS).map(([v, l]) => (
                <button key={v} onClick={() => setFilterType(v)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold border transition ${filterType === v ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(m => (
              <MissionCard key={m.id} m={m} applyAction={applyAction} withdrawAction={withdrawAction} submitProofAction={submitProofAction} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-200 py-12 text-center">
                <p className="text-3xl mb-2">🎯</p>
                <p className="text-slate-500 text-sm">Aucune mission dans cette catégorie.</p>
              </div>
            )}
          </div>
        </>
      )}

      {tab === "mes-candidatures" && (
        <div className="space-y-3">
          {myApps.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-slate-500 text-sm font-semibold">Aucune candidature</p>
              <p className="text-xs text-slate-400 mt-1">Parcourez les missions disponibles et postulez.</p>
            </div>
          ) : (
            myApps.map(a => (
              <div key={a.id} className={`rounded-2xl border bg-white p-4 flex items-center gap-4 ${a.status === "SUBMITTED" ? "border-violet-200 ring-1 ring-violet-100" : "border-slate-100"}`}>
                <span className={`shrink-0 rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase ${APP_STATUS[a.status]?.badge ?? "bg-slate-100 text-slate-500"}`}>
                  {APP_STATUS[a.status]?.label ?? a.status}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-800 truncate">{a.missionTitle}</p>
                  {a.note && <p className="text-xs text-slate-400 truncate">« {a.note} »</p>}
                  {a.proofNote && <p className="text-xs text-violet-600 truncate">Preuve : {a.proofNote}</p>}
                  {a.result && <p className="text-xs text-emerald-600 font-medium truncate">Résultat : {a.result}</p>}
                  {a.cpEarned > 0 && <p className="text-xs text-violet-700 font-bold">+{a.cpEarned} CP gagnés</p>}
                </div>
                <p className="shrink-0 text-xs text-slate-400">{fmtDate(a.createdAt)}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

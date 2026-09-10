"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const DIFFICULTY_CONFIG: Record<string, { label: string; badge: string; icon: string }> = {
  EASY:   { label: "Facile",    badge: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: "🟢" },
  MEDIUM: { label: "Moyenne",   badge: "bg-amber-100 text-amber-700 border-amber-200",       icon: "🟡" },
  HARD:   { label: "Difficile", badge: "bg-rose-100 text-rose-700 border-rose-200",           icon: "🔴" },
};

const MISSION_TYPE_CONFIG: Record<string, { label: string; icon: string; action: string }> = {
  LEAD:            { label: "Apport de prospect",   icon: "🎯", action: "Trouvez un prospect intéressé et transmettez ses coordonnées" },
  VENTE:           { label: "Réaliser une vente",    icon: "💰", action: "Vendez le produit/service et déclarez la vente" },
  RECRUTEMENT:     { label: "Recruter un affilié",   icon: "👥", action: "Recrutez un nouveau partenaire dans votre réseau" },
  REPRESENTATION:  { label: "Représentation",        icon: "🏢", action: "Représentez IBIG lors d'un événement ou rendez-vous" },
  PROSPECTION:     { label: "Prospection terrain",   icon: "🗺️", action: "Prospectez une zone géographique ou un secteur cible" },
  SOURCING:        { label: "Sourcing",              icon: "🔎", action: "Identifiez et qualifiez des opportunités ou contacts" },
  MISE_EN_RELATION: { label: "Mise en relation",    icon: "🤝", action: "Connectez deux parties ayant des intérêts communs" },
  ETUDE:           { label: "Étude de marché",       icon: "📊", action: "Réalisez une étude ou collectez des données terrain" },
  ANIMATION:       { label: "Animation réseau",      icon: "📣", action: "Animez votre réseau ou un groupe de partenaires" },
  PARTENARIAT:     { label: "Partenariat",           icon: "🌐", action: "Négociez et concrétisez un accord de partenariat" },
  AUTRE:           { label: "Mission spéciale",      icon: "⭐", action: "Consultez les détails ci-dessous" },
};

const APP_STATUS: Record<string, { label: string; badge: string }> = {
  PENDING:        { label: "En attente",      badge: "bg-amber-100 text-amber-700" },
  ACCEPTED:       { label: "Acceptée ✓",      badge: "bg-blue-100 text-blue-700" },
  REJECTED:       { label: "Non retenue",     badge: "bg-rose-100 text-rose-700" },
  SUBMITTED:      { label: "Preuve soumise",  badge: "bg-violet-100 text-violet-700" },
  VALIDATED:      { label: "Validée 🏆",      badge: "bg-emerald-100 text-emerald-700" },
  REJECTED_PROOF: { label: "Preuve rejetée",  badge: "bg-rose-200 text-rose-800" },
  COMPLETED:      { label: "Terminée 🏆",     badge: "bg-emerald-100 text-emerald-700" },
};

const REWARD_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  CASH:  { label: "💵 Cash",     bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  CP:    { label: "⭐ CP",       bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200" },
  MIXED: { label: "💎 Cash + CP", bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
};

const ZONE_ICONS: Record<string, string> = {
  "Côte d'Ivoire": "🇨🇮",
  "Abidjan": "🏙️",
  "Afrique de l'Ouest": "🌍",
  "Afrique Centrale": "🌍",
  "Afrique": "🌍",
  "International": "🌐",
  "Tout pays": "🌐",
  "Europe & Diaspora": "🇪🇺",
};

type MissionApp = {
  id: string; status: string; note: string; result: string;
  proofUrl: string; proofNote: string; submittedAt: string | null;
  cpEarned: number; commissionEarned: number; createdAt: string;
};

type MyApp = MissionApp & { missionId: string; missionTitle: string; missionStatus: string; };

type MediaItem = { url: string; mediaType: string; name: string };

type MissionRow = {
  id: string; code: string; title: string; description: string;
  category: string; missionType: string; branch: string;
  rewardType: string; compensationType: string; compensationAmount: number;
  cpAmount: number; minLevel: string; proofInstructions: string;
  zone: string; difficulty: string; slots: number;
  deadline: string | null; status: string; createdAt: string;
  totalApplications: number; myApplication: MissionApp | null;
  // soumission partenaire
  source: string; submissionType: string;
  media: MediaItem[];
  myInterest: { id: string; status: string } | null;
};

function rewardLabel(m: MissionRow) {
  if (m.rewardType === "CP") return `${m.cpAmount} CP`;
  if (m.compensationAmount === 0 && m.compensationType !== "PERCENT") return "Variable";
  const cash = m.compensationType === "PERCENT"
    ? (m.compensationAmount / 100).toFixed(1) + "%"
    : new Intl.NumberFormat("fr-FR").format(m.compensationAmount) + " FCFA";
  if (m.rewardType === "MIXED") return `${cash} + ${m.cpAmount} CP`;
  return cash;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function daysLeft(iso: string) {
  const d = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
  return d;
}

function MissionCard({ m, applyAction, withdrawAction, submitProofAction }: {
  m: MissionRow;
  applyAction: (fd: FormData) => Promise<void>;
  withdrawAction: (fd: FormData) => Promise<void>;
  submitProofAction: (fd: FormData) => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [note, setNote] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [proofNote, setProofNote] = useState("");
  const [interestNote, setInterestNote] = useState("");
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [interestDone, setInterestDone] = useState(!!m.myInterest);
  const [interestLoading, setInterestLoading] = useState(false);

  const isPartnerMission = m.source === "PARTNER";

  async function handleInterest() {
    setInterestLoading(true);
    await fetch("/api/missions/interest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ missionId: m.id, note: interestNote }),
    });
    setInterestDone(true);
    setShowInterestForm(false);
    setInterestLoading(false);
  }
  const diff = DIFFICULTY_CONFIG[m.difficulty] ?? DIFFICULTY_CONFIG.MEDIUM;
  const reward = REWARD_CONFIG[m.rewardType] ?? REWARD_CONFIG.CASH;
  const mtype = MISSION_TYPE_CONFIG[m.missionType] ?? MISSION_TYPE_CONFIG.AUTRE;
  const spots = Math.max(0, m.slots - m.totalApplications);
  const app = m.myApplication;
  const hasApp = app !== null;
  const dl = m.deadline ? daysLeft(m.deadline) : null;
  const urgent = dl !== null && dl <= 7;
  const full = spots === 0 && !hasApp;

  return (
    <div className={`rounded-2xl border bg-white dark:bg-gray-900 shadow-sm flex flex-col transition-all hover:shadow-md ${
      hasApp ? "border-blue-300 ring-2 ring-blue-100 dark:ring-blue-900/40" :
      urgent ? "border-amber-300" :
      full ? "border-slate-100 opacity-70" : "border-slate-200"
    }`}>

      {/* Bandeau type de mission */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-0">
        <span className="text-base">{mtype.icon}</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{mtype.label}</span>
        {m.code && <span className="ml-auto text-[9px] text-slate-300 dark:text-slate-600 font-mono">{m.code}</span>}
      </div>

      {/* Corps principal */}
      <div className="p-4 flex-1 space-y-3">

        {/* Badges statut + difficulté + branche */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase border ${diff.badge}`}>
            {diff.icon} {diff.label}
          </span>
          {m.branch && (
            <span className="rounded-full px-2 py-0.5 text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800">
              {m.branch}
            </span>
          )}
          {hasApp && (
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${APP_STATUS[app!.status]?.badge ?? "bg-slate-100 text-slate-500"}`}>
              {APP_STATUS[app!.status]?.label ?? app!.status}
            </span>
          )}
          {urgent && !hasApp && (
            <span className="rounded-full px-2 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
              ⏰ Expire bientôt
            </span>
          )}
          {full && <span className="rounded-full px-2 py-0.5 text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-200">Complet</span>}
        </div>

        {/* Titre */}
        <h3 className="font-extrabold text-slate-900 dark:text-white text-sm leading-snug">{m.title}</h3>

        {/* Description — toujours visible */}
        {m.description && (
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{m.description}</p>
        )}

        {/* Récompense — bien mise en avant */}
        <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 border ${reward.bg} ${reward.border}`}>
          <div className="flex-1">
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-60" style={{ color: "inherit" }}>Récompense</p>
            <p className={`text-lg font-extrabold tabular-nums ${reward.text}`}>{rewardLabel(m)}</p>
          </div>
          <span className={`text-xs font-bold uppercase ${reward.text} opacity-70`}>{reward.label}</span>
        </div>

        {/* Méta infos */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span>{ZONE_ICONS[m.zone] ?? "📍"}</span>
            <span>{m.zone}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span>👥</span>
            {spots > 0
              ? <span className="font-semibold text-emerald-600 dark:text-emerald-400">{spots} place{spots > 1 ? "s" : ""} disponible{spots > 1 ? "s" : ""}</span>
              : <span className="font-semibold text-rose-500">Complet</span>}
          </div>
          {m.deadline && (
            <div className={`flex items-center gap-1.5 col-span-2 ${urgent ? "text-amber-600 font-bold" : "text-slate-400"}`}>
              <span>⏰</span>
              <span>Deadline : {fmtDate(m.deadline)} {dl !== null && dl >= 0 ? `(J-${dl})` : "(expiré)"}</span>
            </div>
          )}
        </div>

        {/* Preuves attendues — toujours visible si renseigné */}
        {m.proofInstructions && (
          <div className="rounded-xl border border-violet-100 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 px-3 py-2.5">
            <p className="text-[9px] font-black uppercase tracking-widest text-violet-500 mb-1">📎 Preuves attendues</p>
            <p className="text-xs text-violet-800 dark:text-violet-300 leading-relaxed">{m.proofInstructions}</p>
          </div>
        )}
      </div>

      {/* Zone résultat / preuve soumise */}
      {app && (app.status === "VALIDATED" || app.status === "COMPLETED") && app.cpEarned > 0 && (
        <div className="mx-4 mb-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 px-4 py-3">
          <p className="text-xs font-bold text-violet-700 dark:text-violet-300">🪙 +{app.cpEarned} Crédits Partners gagnés !</p>
        </div>
      )}
      {app?.result && (
        <div className="mx-4 mb-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 px-4 py-3">
          <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide mb-1">Résultat</p>
          <p className="text-sm text-emerald-800 dark:text-emerald-300">{app.result}</p>
        </div>
      )}
      {app && ["SUBMITTED","VALIDATED","REJECTED_PROOF"].includes(app.status) && (app.proofNote || app.proofUrl) && (
        <div className="mx-4 mb-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 space-y-1">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Votre preuve {app.submittedAt ? `— ${fmtDate(app.submittedAt)}` : ""}</p>
          {app.proofNote && <p className="text-xs text-slate-700 dark:text-slate-300">{app.proofNote}</p>}
          {app.proofUrl && <a href={app.proofUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline break-all">🔗 {app.proofUrl}</a>}
        </div>
      )}

      {/* Médias partenaire */}
      {isPartnerMission && m.media.length > 0 && (
        <div className="mx-4 mb-3">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-2">📎 Pièces jointes</p>
          <div className="flex flex-wrap gap-2">
            {m.media.map((med, i) => (
              <a key={i} href={med.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs hover:border-blue-300 transition">
                <span>{med.mediaType === "IMAGE" ? "🖼" : med.mediaType === "PDF" ? "📄" : "🎥"}</span>
                <span className="text-blue-600 underline">{med.name || "Voir"}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pb-4 space-y-3 border-t border-slate-50 dark:border-slate-800 pt-3">

        {/* Formulaire preuve si ACCEPTED */}
        {app && app.status === "ACCEPTED" && (
          <form action={submitProofAction} className="space-y-3 rounded-xl border border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
            <p className="text-xs font-bold text-blue-800 dark:text-blue-300">📤 Soumettre votre preuve de réalisation</p>
            <input type="hidden" name="applicationId" value={app.id} />
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Lien (URL de preuve)</label>
              <input name="proofUrl" type="url" value={proofUrl} onChange={e => setProofUrl(e.target.value)}
                placeholder="https://… (Drive, capture, document…)"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Description de la preuve *</label>
              <textarea name="proofNote" rows={3} value={proofNote} onChange={e => setProofNote(e.target.value)} required
                placeholder="Décrivez ce que vous avez réalisé, le résultat obtenu…"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none resize-none focus:border-blue-400" />
            </div>
            <button type="submit" className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 transition">
              Soumettre ma preuve →
            </button>
          </form>
        )}

        {/* Candidature */}
        {!hasApp && spots > 0 && (
          <>
            {!showForm ? (
              <button onClick={() => setShowForm(true)}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold py-3 transition shadow-sm">
                ✋ Je candidate à cette mission
              </button>
            ) : (
              <form action={applyAction} className="space-y-3">
                <input type="hidden" name="missionId" value={m.id} />
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Message de candidature (optionnel)</label>
                  <textarea name="note" rows={3} value={note} onChange={e => setNote(e.target.value)}
                    placeholder="Présentez votre motivation, votre réseau ou vos atouts pour cette mission…"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm outline-none resize-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 text-sm font-bold py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                    Annuler
                  </button>
                  <button type="submit"
                    className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold py-2.5 transition shadow-sm">
                    Envoyer →
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* Retirer candidature */}
        {hasApp && app!.status === "PENDING" && (
          <form action={withdrawAction} className="flex items-center gap-3">
            <input type="hidden" name="missionId" value={m.id} />
            <p className="text-xs text-slate-400 flex-1">Candidature soumise le {fmtDate(app!.createdAt)}</p>
            <button type="submit" className="rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-xs font-bold px-3 py-1.5 transition">
              Retirer
            </button>
          </form>
        )}

        {full && !isPartnerMission && (
          <p className="text-xs text-slate-400 italic text-center py-1">Mission complète — plus de place disponible.</p>
        )}

        {/* Bouton intérêt pour missions partenaires (OFFER/DEMAND) */}
        {isPartnerMission && !app && (
          interestDone ? (
            <div className="rounded-xl border border-purple-200 bg-purple-50 dark:bg-purple-900/20 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                ✅ Intérêt signalé — IBIG vous contactera si une mise en relation est possible.
              </p>
            </div>
          ) : showInterestForm ? (
            <div className="space-y-2">
              <textarea rows={2} value={interestNote} onChange={e => setInterestNote(e.target.value)}
                placeholder="Précisez votre intérêt (optionnel)…"
                className="w-full rounded-xl border border-purple-200 bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none resize-none focus:border-purple-400" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowInterestForm(false)}
                  className="flex-1 rounded-xl border border-slate-200 text-slate-500 text-sm font-bold py-2.5 hover:bg-slate-50 transition">
                  Annuler
                </button>
                <button type="button" onClick={handleInterest} disabled={interestLoading}
                  className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-extrabold py-2.5 transition">
                  {interestLoading ? "Envoi…" : "Envoyer →"}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowInterestForm(true)}
              className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-extrabold py-3 transition shadow-sm">
              🤝 Je suis intéressé(e) — Contacter via IBIG
            </button>
          )
        )}
      </div>
    </div>
  );
}

const PAGE_SIZE = 24;

export default function MissionsAffilieClient({
  rows, myApps, mySubmissions, applyAction, withdrawAction, submitProofAction,
}: {
  rows: MissionRow[];
  myApps: MyApp[];
  mySubmissions: { id: string; title: string; submissionType: string; validationStatus: string; createdAt: string; rejectionNote: string }[];
  applyAction: (fd: FormData) => Promise<void>;
  withdrawAction: (fd: FormData) => Promise<void>;
  submitProofAction: (fd: FormData) => Promise<void>;
}) {
  const [tab, setTab] = useState<"missions" | "mes-candidatures" | "mes-soumissions">("missions");
  const [search, setSearch] = useState("");
  const [filterReward, setFilterReward] = useState("ALL");
  const [filterDiff, setFilterDiff] = useState("ALL");
  const [filterZone, setFilterZone] = useState("ALL");
  const [filterBranch, setFilterBranch] = useState("ALL");
  const [filterSource, setFilterSource] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterMinAmount, setFilterMinAmount] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const myCompleted = myApps.filter(a => a.status === "COMPLETED" || a.status === "VALIDATED").length;
  const mySubmitted = myApps.filter(a => a.status === "SUBMITTED").length;
  const totalCp = myApps.reduce((s, a) => s + (a.cpEarned ?? 0), 0);

  // Listes dynamiques de zones, branches et catégories
  const zones = useMemo(() => Array.from(new Set(rows.map(r => r.zone).filter(Boolean))).sort(), [rows]);
  const branches = useMemo(() => Array.from(new Set(rows.map(r => r.branch).filter(Boolean))).sort(), [rows]);
  const categories = useMemo(() => Array.from(new Set(rows.map(r => r.category).filter(Boolean))).sort(), [rows]);

  const filtered = useMemo(() => {
    let list = rows;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m => m.title.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q) || m.branch?.toLowerCase().includes(q) || m.category?.toLowerCase().includes(q) || m.zone?.toLowerCase().includes(q));
    }
    if (filterSource !== "ALL") {
      if (filterSource === "IBIG") list = list.filter(m => m.source === "IBIG");
      else if (filterSource === "OFFER") list = list.filter(m => m.source === "PARTNER" && m.submissionType === "OFFER");
      else if (filterSource === "DEMAND") list = list.filter(m => m.source === "PARTNER" && m.submissionType === "DEMAND");
    }
    if (filterCategory !== "ALL") list = list.filter(m => m.category === filterCategory);
    if (filterReward !== "ALL") list = list.filter(m => m.rewardType === filterReward);
    if (filterDiff !== "ALL") list = list.filter(m => m.difficulty === filterDiff);
    if (filterZone !== "ALL") list = list.filter(m => m.zone === filterZone);
    if (filterBranch !== "ALL") list = list.filter(m => m.branch === filterBranch);
    if (filterMinAmount > 0) list = list.filter(m => m.compensationAmount >= filterMinAmount);

    list = [...list].sort((a, b) => {
      if (sortBy === "reward_desc") return (b.compensationAmount + b.cpAmount * 100) - (a.compensationAmount + a.cpAmount * 100);
      if (sortBy === "reward_asc") return (a.compensationAmount + a.cpAmount * 100) - (b.compensationAmount + b.cpAmount * 100);
      if (sortBy === "deadline") {
        if (!a.deadline) return 1; if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === "easy_first") return (a.difficulty === "EASY" ? 0 : a.difficulty === "MEDIUM" ? 1 : 2) - (b.difficulty === "EASY" ? 0 : b.difficulty === "MEDIUM" ? 1 : 2);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return list;
  }, [rows, search, filterSource, filterCategory, filterReward, filterDiff, filterZone, filterBranch, filterMinAmount, sortBy]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  const activeFilterCount = [
    search.trim() ? 1 : 0,
    filterSource !== "ALL" ? 1 : 0,
    filterCategory !== "ALL" ? 1 : 0,
    filterReward !== "ALL" ? 1 : 0,
    filterDiff !== "ALL" ? 1 : 0,
    filterZone !== "ALL" ? 1 : 0,
    filterBranch !== "ALL" ? 1 : 0,
    filterMinAmount > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  function resetFilters() {
    setSearch(""); setFilterSource("ALL"); setFilterCategory("ALL");
    setFilterReward("ALL"); setFilterDiff("ALL");
    setFilterZone("ALL"); setFilterBranch("ALL");
    setFilterMinAmount(0); setSortBy("newest"); setPage(1);
  }

  return (
    <div className="space-y-6">

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-900 via-violet-900 to-blue-900 px-6 py-7 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 75% 20%, #a78bfa 0%, transparent 55%), radial-gradient(circle at 20% 80%, #3b82f6 0%, transparent 50%)" }} />
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-300 mb-1">IBIG PARTNERS — Catalogue missions</p>
          <h2 className="text-2xl font-extrabold mb-1">Missions Partners</h2>
          <p className="text-sm text-white/70 max-w-xl leading-relaxed">
            {rows.length.toLocaleString("fr-FR")} missions disponibles dans tous les secteurs. Choisissez, candidatez, accomplissez et percevez votre récompense.
          </p>
          <div className="mt-4 flex gap-3 flex-wrap items-center">
            <Link href="/espace/missions/soumettre"
              className="rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-sm font-bold px-4 py-2 transition backdrop-blur">
              ✨ Soumettre une opportunité →
            </Link>
          </div>
          <div className="mt-3 flex gap-3 flex-wrap">
            <div className="rounded-xl bg-white/10 backdrop-blur px-4 py-2 text-center">
              <p className="text-2xl font-extrabold">{rows.length.toLocaleString("fr-FR")}</p>
              <p className="text-[10px] text-white/60 uppercase tracking-wide">Missions ouvertes</p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur px-4 py-2 text-center">
              <p className="text-2xl font-extrabold">{myApps.length}</p>
              <p className="text-[10px] text-white/60 uppercase tracking-wide">Mes candidatures</p>
            </div>
            <div className="rounded-xl bg-emerald-500/20 backdrop-blur px-4 py-2 text-center">
              <p className="text-2xl font-extrabold text-emerald-300">{myCompleted}</p>
              <p className="text-[10px] text-white/60 uppercase tracking-wide">Accomplies</p>
            </div>
            {totalCp > 0 && (
              <div className="rounded-xl bg-violet-500/20 backdrop-blur px-4 py-2 text-center">
                <p className="text-2xl font-extrabold text-violet-300">{totalCp}</p>
                <p className="text-[10px] text-white/60 uppercase tracking-wide">CP gagnés</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerte preuves */}
      {mySubmitted > 0 && (
        <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 flex items-center gap-3">
          <span className="text-violet-600 text-lg">🔔</span>
          <p className="text-sm text-violet-800 font-semibold">
            {mySubmitted} preuve{mySubmitted > 1 ? "s" : ""} en cours de validation par l'équipe IBIG.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {([
          { id: "missions", label: `🎯 Missions (${rows.length.toLocaleString("fr-FR")})` },
          { id: "mes-candidatures", label: `📋 Candidatures (${myApps.length})` },
          { id: "mes-soumissions", label: `📤 Mes soumissions (${mySubmissions.length})` },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${tab === t.id ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "missions" && (
        <>
          {/* Barre de recherche + filtres */}
          <div className="space-y-3">
            {/* Recherche + bouton filtres */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Rechercher une mission, un secteur, un mot-clé…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-bold transition ${showFilters || activeFilterCount > 0 ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"}`}>
                ⚙️ Filtres
                {activeFilterCount > 0 && <span className="rounded-full bg-white text-blue-600 text-[10px] font-black w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>}
              </button>
              {activeFilterCount > 0 && (
                <button onClick={resetFilters} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50 transition">✕</button>
              )}
            </div>

            {/* Chips rapides — toujours visibles */}
            <div className="flex flex-wrap gap-2">
              {(["ALL","IBIG","OFFER","DEMAND"] as const).map(s => {
                const labels: Record<string,string> = { ALL: "Tout", IBIG: "🏢 Missions IBIG", OFFER: "📤 Offres partenaires", DEMAND: "🔍 Demandes partenaires" };
                return (
                  <button key={s} onClick={() => { setFilterSource(s); setPage(1); }}
                    className={`rounded-full px-3 py-1 text-xs font-bold border transition ${filterSource === s ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:bg-indigo-50"}`}>
                    {labels[s]}
                  </button>
                );
              })}
              <div className="w-px bg-slate-200 mx-1" />
              {(["ALL","EASY","MEDIUM","HARD"] as const).map(d => {
                const labels: Record<string,string> = { ALL: "Toutes difficultés", EASY: "🟢 Facile", MEDIUM: "🟡 Moyenne", HARD: "🔴 Difficile" };
                return (
                  <button key={d} onClick={() => { setFilterDiff(d); setPage(1); }}
                    className={`rounded-full px-3 py-1 text-xs font-bold border transition ${filterDiff === d && d !== "ALL" ? "bg-amber-500 text-white border-amber-500" : d === "ALL" && filterDiff === "ALL" ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-white text-slate-600 border-slate-200 hover:bg-amber-50"}`}>
                    {labels[d]}
                  </button>
                );
              })}
            </div>

            {/* Panneau filtres avancés */}
            {showFilters && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Tri */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Trier par</label>
                  <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:border-blue-400">
                    <option value="newest">Plus récentes</option>
                    <option value="reward_desc">Gain le + élevé</option>
                    <option value="reward_asc">Gain le + bas</option>
                    <option value="deadline">Échéance proche</option>
                    <option value="easy_first">Plus faciles d'abord</option>
                  </select>
                </div>

                {/* Catégorie / Secteur */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Secteur d'activité</label>
                  <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:border-blue-400">
                    <option value="ALL">Tous les secteurs</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Type de gain */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Type de gain</label>
                  <select value={filterReward} onChange={e => { setFilterReward(e.target.value); setPage(1); }}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:border-blue-400">
                    <option value="ALL">Tous les gains</option>
                    <option value="CASH">💵 Cash uniquement</option>
                    <option value="CP">⭐ Crédits CP</option>
                    <option value="MIXED">💎 Cash + CP</option>
                  </select>
                </div>

                {/* Montant minimum */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Gain minimum — {filterMinAmount > 0 ? new Intl.NumberFormat("fr-FR").format(filterMinAmount) + " FCFA" : "Aucun"}
                  </label>
                  <input type="range" min={0} max={500000} step={5000} value={filterMinAmount}
                    onChange={e => { setFilterMinAmount(Number(e.target.value)); setPage(1); }}
                    className="w-full accent-blue-600" />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>0</span><span>250 000</span><span>500 000</span>
                  </div>
                </div>

                {/* Zone / Pays */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Pays / Zone géographique</label>
                  <select value={filterZone} onChange={e => { setFilterZone(e.target.value); setPage(1); }}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:border-blue-400">
                    <option value="ALL">Tous les pays / zones</option>
                    {zones.map(z => <option key={z} value={z}>{ZONE_ICONS[z] ?? "📍"} {z}</option>)}
                  </select>
                </div>

                {/* Branche */}
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Branche IBIG</label>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => { setFilterBranch("ALL"); setPage(1); }}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold border transition ${filterBranch === "ALL" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                      Toutes
                    </button>
                    {branches.map(b => (
                      <button key={b} onClick={() => { setFilterBranch(b); setPage(1); }}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold border transition ${filterBranch === b ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Résumé des résultats */}
            <div className="flex items-center justify-between text-sm">
              <p className="text-slate-500">
                <span className="font-bold text-slate-800">{filtered.length.toLocaleString("fr-FR")}</span> mission{filtered.length > 1 ? "s" : ""}
                {activeFilterCount > 0 && <span className="text-blue-600"> filtrée{filtered.length > 1 ? "s" : ""}</span>}
              </p>
              {filtered.length !== rows.length && (
                <button onClick={resetFilters} className="text-xs text-blue-600 hover:underline">Réinitialiser</button>
              )}
            </div>
          </div>

          {/* Grille missions */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map(m => (
              <MissionCard key={m.id} m={m} applyAction={applyAction} withdrawAction={withdrawAction} submitProofAction={submitProofAction} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-200 py-16 text-center">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-slate-600 font-semibold">Aucune mission ne correspond à vos critères.</p>
                <button onClick={resetFilters} className="mt-3 text-sm text-blue-600 hover:underline">Réinitialiser les filtres</button>
              </div>
            )}
          </div>

          {/* Pagination - Charger plus */}
          {hasMore && (
            <div className="text-center">
              <button onClick={() => setPage(p => p + 1)}
                className="rounded-2xl bg-slate-900 hover:bg-slate-700 text-white px-8 py-3 text-sm font-bold transition shadow">
                Charger {Math.min(PAGE_SIZE, filtered.length - paginated.length)} missions de plus
                <span className="ml-2 opacity-60">({paginated.length}/{filtered.length})</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Mes candidatures */}
      {tab === "mes-candidatures" && (
        <div className="space-y-3">
          {myApps.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-slate-500 text-sm font-semibold">Aucune candidature pour le moment</p>
              <p className="text-xs text-slate-400 mt-1">Parcourez les missions et postulez à celles qui vous correspondent.</p>
              <button onClick={() => setTab("missions")} className="mt-4 rounded-xl bg-blue-600 text-white text-sm font-bold px-5 py-2 hover:bg-blue-700 transition">
                Voir les missions →
              </button>
            </div>
          ) : (
            <>
              {/* Stats candidatures */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Total", val: myApps.length, color: "text-slate-800" },
                  { label: "En attente", val: myApps.filter(a => a.status === "PENDING").length, color: "text-amber-600" },
                  { label: "Acceptées", val: myApps.filter(a => a.status === "ACCEPTED").length, color: "text-blue-600" },
                  { label: "Accomplies", val: myCompleted, color: "text-emerald-600" },
                ].map(s => (
                  <div key={s.label} className="rounded-xl border border-slate-100 bg-white p-3 text-center">
                    <p className={`text-2xl font-extrabold ${s.color}`}>{s.val}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">{s.label}</p>
                  </div>
                ))}
              </div>

              {(myApps as any).map((a: any) => (
                <div key={a.id} className={`rounded-2xl border bg-white p-4 flex items-center gap-4 ${a.status === "SUBMITTED" ? "border-violet-200 ring-1 ring-violet-100" : "border-slate-100"}`}>
                  <span className={`shrink-0 rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase ${APP_STATUS[a.status]?.badge ?? "bg-slate-100 text-slate-500"}`}>
                    {APP_STATUS[a.status]?.label ?? a.status}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800 truncate">{a.missionTitle}</p>
                    {a.note && <p className="text-xs text-slate-400 truncate">« {a.note} »</p>}
                    {a.proofNote && <p className="text-xs text-violet-600 truncate">Preuve : {a.proofNote}</p>}
                    {a.result && <p className="text-xs text-emerald-600 font-medium truncate">✓ {a.result}</p>}
                    {a.cpEarned > 0 && <p className="text-xs text-violet-700 font-bold">+{a.cpEarned} CP gagnés</p>}
                  </div>
                  <p className="shrink-0 text-xs text-slate-400">{fmtDate(a.createdAt)}</p>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Mes soumissions */}
      {tab === "mes-soumissions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Vos soumissions d'opportunités à IBIG</p>
            <Link href="/espace/missions/soumettre"
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 transition">
              + Soumettre
            </Link>
          </div>
          {mySubmissions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center">
              <p className="text-4xl mb-3">📤</p>
              <p className="text-slate-500 text-sm font-semibold">Vous n'avez encore rien soumis</p>
              <p className="text-xs text-slate-400 mt-1">Partagez une offre ou une demande — IBIG la valide et la publie pour tous.</p>
              <Link href="/espace/missions/soumettre"
                className="mt-4 inline-block rounded-xl bg-indigo-600 text-white text-sm font-bold px-5 py-2 hover:bg-indigo-700 transition">
                Soumettre une opportunité →
              </Link>
            </div>
          ) : mySubmissions.map(s => {
            const vstatus = s.validationStatus;
            const badge = vstatus === "VALIDATED"
              ? { label: "✅ Publiée", cls: "bg-emerald-100 text-emerald-700" }
              : vstatus === "REJECTED"
              ? { label: "❌ Refusée", cls: "bg-rose-100 text-rose-700" }
              : { label: "⏳ En attente", cls: "bg-amber-100 text-amber-700" };
            return (
              <div key={s.id} className={`rounded-2xl border bg-white dark:bg-slate-900 p-4 flex items-start gap-4 ${vstatus === "REJECTED" ? "border-rose-100" : vstatus === "VALIDATED" ? "border-emerald-100" : "border-amber-100"}`}>
                <span className={`shrink-0 rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase whitespace-nowrap ${badge.cls}`}>{badge.label}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">{s.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {s.submissionType === "OFFER" ? "📤 Offre" : "📥 Demande"} · {fmtDate(s.createdAt)}
                  </p>
                  {vstatus === "REJECTED" && s.rejectionNote && (
                    <p className="text-xs text-rose-600 mt-1 italic">Motif : {s.rejectionNote}</p>
                  )}
                  {vstatus === "VALIDATED" && (
                    <p className="text-xs text-emerald-600 mt-1">Visible par tous les partenaires dans la bourse d'opportunités.</p>
                  )}
                  {vstatus === "PENDING_VALIDATION" && (
                    <p className="text-xs text-amber-600 mt-1">IBIG examine votre soumission. Vous serez notifié(e).</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

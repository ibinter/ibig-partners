"use client";

import { useState, useMemo } from "react";

const DIFFICULTY_CONFIG: Record<string, { label: string; badge: string; icon: string }> = {
  EASY:   { label: "Facile",    badge: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: "🟢" },
  MEDIUM: { label: "Moyenne",   badge: "bg-amber-100 text-amber-700 border-amber-200",       icon: "🟡" },
  HARD:   { label: "Difficile", badge: "bg-rose-100 text-rose-700 border-rose-200",           icon: "🔴" },
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
  if (m.rewardType === "CP") return `${m.cpAmount} CP`;
  const cash = m.compensationType === "FIXED"
    ? new Intl.NumberFormat("fr-FR").format(m.compensationAmount) + " FCFA"
    : (m.compensationAmount / 100).toFixed(1) + "%";
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
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [proofNote, setProofNote] = useState("");
  const diff = DIFFICULTY_CONFIG[m.difficulty] ?? DIFFICULTY_CONFIG.MEDIUM;
  const reward = REWARD_CONFIG[m.rewardType] ?? REWARD_CONFIG.CASH;
  const spots = Math.max(0, m.slots - m.totalApplications);
  const app = m.myApplication;
  const hasApp = app !== null;
  const dl = m.deadline ? daysLeft(m.deadline) : null;
  const urgent = dl !== null && dl <= 7;

  return (
    <div className={`rounded-2xl border bg-white shadow-sm flex flex-col transition-all hover:shadow-md ${
      hasApp ? "border-blue-200 ring-1 ring-blue-100" : urgent ? "border-amber-200" : "border-slate-100"
    }`}>
      {/* Header */}
      <div className="p-4 flex-1 space-y-3">
        {/* Badges top */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase border ${diff.badge}`}>
            {diff.icon} {diff.label}
          </span>
          {m.branch && (
            <span className="rounded-full px-2 py-0.5 text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
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
        </div>

        {/* Titre */}
        <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">{m.title}</h3>

        {/* Récompense */}
        <div className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 border ${reward.bg} ${reward.border}`}>
          <span className={`text-sm font-extrabold ${reward.text}`}>{rewardLabel(m)}</span>
          <span className={`text-[9px] font-bold uppercase tracking-wide ${reward.text} opacity-70`}>{reward.label}</span>
        </div>

        {/* Méta */}
        <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
          <span>{ZONE_ICONS[m.zone] ?? "📍"} {m.zone}</span>
          <span>·</span>
          <span>👥 {spots > 0 ? `${spots} place${spots > 1 ? "s" : ""}` : <span className="text-rose-500">Complet</span>}</span>
          {m.deadline && (
            <>
              <span>·</span>
              <span className={urgent ? "text-amber-600 font-semibold" : ""}>
                ⏰ {dl! > 0 ? `J-${dl}` : "Expire aujourd'hui"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Toggle détails */}
      <div className="border-t border-slate-50">
        <button onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition">
          <span>{open ? "▲ Masquer" : "▼ Voir les détails et postuler"}</span>
          {!hasApp && spots > 0 && <span className="rounded-full bg-blue-600 text-white px-2 py-0.5 text-[9px]">Postuler</span>}
        </button>

        {open && (
          <div className="px-4 pb-4 space-y-4 border-t border-slate-50 pt-3">
            {/* Description */}
            {m.description && (
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{m.description}</div>
            )}

            {/* Preuves attendues */}
            {m.proofInstructions && (
              <div className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-3">
                <p className="text-[10px] font-bold text-violet-700 uppercase tracking-wide mb-1">📎 Preuves attendues</p>
                <p className="text-xs text-violet-800 leading-relaxed">{m.proofInstructions}</p>
              </div>
            )}

            {/* CP gagnés */}
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

            {/* Preuve soumise */}
            {app && ["SUBMITTED","VALIDATED","REJECTED_PROOF"].includes(app.status) && (app.proofNote || app.proofUrl) && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Votre preuve {app.submittedAt ? `— ${fmtDate(app.submittedAt)}` : ""}</p>
                {app.proofNote && <p className="text-xs text-slate-700">{app.proofNote}</p>}
                {app.proofUrl && <a href={app.proofUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline break-all">🔗 {app.proofUrl}</a>}
              </div>
            )}

            {/* Formulaire preuve (ACCEPTED) */}
            {app && app.status === "ACCEPTED" && (
              <form action={submitProofAction} className="space-y-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-bold text-blue-800">📤 Soumettre votre preuve de réalisation</p>
                <input type="hidden" name="applicationId" value={app.id} />
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Lien (URL de preuve)</label>
                  <input name="proofUrl" type="url" value={proofUrl} onChange={e => setProofUrl(e.target.value)}
                    placeholder="https://… (Drive, capture, document…)"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Description de la preuve *</label>
                  <textarea name="proofNote" rows={3} value={proofNote} onChange={e => setProofNote(e.target.value)} required
                    placeholder="Décrivez ce que vous avez réalisé, le résultat obtenu…"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none resize-none focus:border-blue-400" />
                </div>
                <button type="submit" className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 transition">
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
                    placeholder="Présentez votre motivation, réseau ou atouts pour cette mission…"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
                <button type="submit"
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 transition shadow-sm">
                  Je candidate à cette mission →
                </button>
              </form>
            )}

            {/* Retirer candidature */}
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

const PAGE_SIZE = 24;

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
  const [search, setSearch] = useState("");
  const [filterReward, setFilterReward] = useState("ALL");
  const [filterDiff, setFilterDiff] = useState("ALL");
  const [filterZone, setFilterZone] = useState("ALL");
  const [filterBranch, setFilterBranch] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const myCompleted = myApps.filter(a => a.status === "COMPLETED" || a.status === "VALIDATED").length;
  const mySubmitted = myApps.filter(a => a.status === "SUBMITTED").length;
  const totalCp = myApps.reduce((s, a) => s + (a.cpEarned ?? 0), 0);

  // Listes dynamiques de zones et branches
  const zones = useMemo(() => Array.from(new Set(rows.map(r => r.zone).filter(Boolean))).sort(), [rows]);
  const branches = useMemo(() => Array.from(new Set(rows.map(r => r.branch).filter(Boolean))).sort(), [rows]);

  const filtered = useMemo(() => {
    let list = rows;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m => m.title.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q) || m.branch?.toLowerCase().includes(q));
    }
    if (filterReward !== "ALL") list = list.filter(m => m.rewardType === filterReward);
    if (filterDiff !== "ALL") list = list.filter(m => m.difficulty === filterDiff);
    if (filterZone !== "ALL") list = list.filter(m => m.zone === filterZone);
    if (filterBranch !== "ALL") list = list.filter(m => m.branch === filterBranch);

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
  }, [rows, search, filterReward, filterDiff, filterZone, filterBranch, sortBy]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  const activeFilterCount = [
    search.trim() ? 1 : 0,
    filterReward !== "ALL" ? 1 : 0,
    filterDiff !== "ALL" ? 1 : 0,
    filterZone !== "ALL" ? 1 : 0,
    filterBranch !== "ALL" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  function resetFilters() {
    setSearch(""); setFilterReward("ALL"); setFilterDiff("ALL");
    setFilterZone("ALL"); setFilterBranch("ALL"); setSortBy("newest"); setPage(1);
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
          <div className="mt-4 flex gap-3 flex-wrap">
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
        {(["missions", "mes-candidatures"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${tab === t ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>
            {t === "missions" ? `🎯 Missions (${rows.length.toLocaleString("fr-FR")})` : `📋 Mes candidatures (${myApps.length})`}
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

                {/* Difficulté */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Difficulté</label>
                  <select value={filterDiff} onChange={e => { setFilterDiff(e.target.value); setPage(1); }}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:border-blue-400">
                    <option value="ALL">Toutes</option>
                    <option value="EASY">🟢 Facile</option>
                    <option value="MEDIUM">🟡 Moyenne</option>
                    <option value="HARD">🔴 Difficile</option>
                  </select>
                </div>

                {/* Zone */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Zone géographique</label>
                  <select value={filterZone} onChange={e => { setFilterZone(e.target.value); setPage(1); }}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:border-blue-400">
                    <option value="ALL">Toutes les zones</option>
                    {zones.map(z => <option key={z} value={z}>{ZONE_ICONS[z] ?? "📍"} {z}</option>)}
                  </select>
                </div>

                {/* Branche */}
                <div className="md:col-span-4">
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

              {myApps.map(a => (
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
    </div>
  );
}

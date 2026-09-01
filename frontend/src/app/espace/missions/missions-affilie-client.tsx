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
  REPRESENTATION: "Représentation", PROSPECTION: "Prospection", AUTRE: "Autre",
};

const DIFFICULTY_CONFIG: Record<string, { label: string; badge: string; stars: string }> = {
  EASY: { label: "Facile", badge: "bg-emerald-100 text-emerald-700", stars: "⭐" },
  MEDIUM: { label: "Moyenne", badge: "bg-amber-100 text-amber-700", stars: "⭐⭐" },
  HARD: { label: "Difficile", badge: "bg-rose-100 text-rose-700", stars: "⭐⭐⭐" },
};

const APP_STATUS: Record<string, { label: string; badge: string }> = {
  PENDING:   { label: "Candidature en attente", badge: "bg-amber-100 text-amber-700" },
  ACCEPTED:  { label: "Candidature acceptée ✓", badge: "bg-blue-100 text-blue-700" },
  REJECTED:  { label: "Non retenu", badge: "bg-rose-100 text-rose-700" },
  COMPLETED: { label: "Mission accomplie 🏆", badge: "bg-emerald-100 text-emerald-700" },
};

type MyApp = {
  id: string; status: string; note: string; result: string; createdAt: string;
  missionId: string; missionTitle: string; missionStatus: string;
};

type MissionApp = { id: string; status: string; note: string; result: string; createdAt: string };

type MissionRow = {
  id: string; title: string; description: string; category: string; missionType: string;
  compensationType: string; compensationAmount: number; zone: string; difficulty: string;
  slots: number; deadline: string | null; status: string; createdAt: string;
  totalApplications: number; myApplication: MissionApp | null;
};

function compensationLabel(m: MissionRow) {
  if (m.compensationType === "FIXED")
    return new Intl.NumberFormat("fr-FR").format(m.compensationAmount) + " F CFA";
  return (m.compensationAmount / 100).toFixed(1) + " %";
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function MissionCard({
  m, applyAction, withdrawAction,
}: {
  m: MissionRow;
  applyAction: (fd: FormData) => Promise<void>;
  withdrawAction: (fd: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const diff = DIFFICULTY_CONFIG[m.difficulty] ?? DIFFICULTY_CONFIG.MEDIUM;
  const spots = m.slots - m.totalApplications;
  const hasApp = m.myApplication !== null;

  return (
    <div className={`rounded-2xl border bg-white shadow-sm transition-all ${hasApp ? "border-blue-200 ring-1 ring-blue-100" : "border-slate-100"}`}>
      {/* Header */}
      <div className="p-4 space-y-2">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              <span className="text-[10px] font-bold text-slate-500">{CATEGORY_LABELS[m.category] ?? m.category}</span>
              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${diff.badge}`}>{diff.label}</span>
              <span className="text-[10px] text-slate-400">{MISSION_TYPE_LABELS[m.missionType]}</span>
            </div>
            <p className="font-bold text-slate-900 text-sm leading-snug">{m.title}</p>
          </div>
          {hasApp && (
            <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase ${APP_STATUS[m.myApplication!.status]?.badge ?? "bg-slate-100 text-slate-500"}`}>
              {APP_STATUS[m.myApplication!.status]?.label ?? m.myApplication!.status}
            </span>
          )}
        </div>

        {/* Rémunération + zone */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-emerald-50 px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-wide text-emerald-500">Prime</p>
            <p className="text-sm font-extrabold text-emerald-700">{compensationLabel(m)}</p>
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

      {/* Détail expandable */}
      <div className="border-t border-slate-50">
        <button onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition">
          <span>{open ? "Masquer les détails" : "Voir les détails et postuler"}</span>
          <span className={`transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
        </button>

        {open && (
          <div className="px-4 pb-4 space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">{m.description}</p>

            {/* Résultat si mission complète */}
            {m.myApplication?.result && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mb-1">Résultat de votre mission</p>
                <p className="text-sm text-emerald-800">{m.myApplication.result}</p>
              </div>
            )}

            {/* Formulaire candidature */}
            {!hasApp && spots > 0 && (
              <form action={applyAction} className="space-y-3">
                <input type="hidden" name="missionId" value={m.id} />
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Message de candidature (optionnel)
                  </label>
                  <textarea
                    name="note"
                    rows={3}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Présentez votre motivation, votre réseau ou vos atouts pour cette mission…"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <button type="submit"
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 transition shadow-sm">
                  Je candidate à cette mission →
                </button>
              </form>
            )}

            {/* Retirer candidature si pending */}
            {hasApp && m.myApplication!.status === "PENDING" && (
              <form action={withdrawAction} className="flex items-center gap-3">
                <input type="hidden" name="missionId" value={m.id} />
                <p className="text-xs text-slate-500 flex-1">Candidature soumise le {fmtDate(m.myApplication!.createdAt)}</p>
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
  rows, myApps, applyAction, withdrawAction,
}: {
  rows: MissionRow[];
  myApps: MyApp[];
  applyAction: (fd: FormData) => Promise<void>;
  withdrawAction: (fd: FormData) => Promise<void>;
}) {
  const [tab, setTab] = useState<"missions" | "mes-candidatures">("missions");
  const [filterType, setFilterType] = useState("ALL");

  const myAccepted = myApps.filter(a => a.status === "ACCEPTED").length;
  const myCompleted = myApps.filter(a => a.status === "COMPLETED").length;

  const filtered = rows.filter(m => filterType === "ALL" || m.missionType === filterType);

  return (
    <div className="space-y-6">

      {/* Hero missions */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-900 to-blue-900 px-6 py-7 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 30%, #a78bfa 0%, transparent 60%)" }} />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-300 mb-1">IBIG PARTNERS — Missions</p>
          <h2 className="text-xl font-extrabold mb-1">Des missions. Des primes. Des résultats.</h2>
          <p className="text-sm text-white/70 max-w-lg leading-relaxed">
            Choisissez une mission adaptée à votre réseau et votre territoire. Accomplissez-la et recevez votre prime directement sur votre compte.
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
          </div>
        </div>
      </div>

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
          {/* Filtre par type */}
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
              <MissionCard key={m.id} m={m} applyAction={applyAction} withdrawAction={withdrawAction} />
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
              <div key={a.id} className="rounded-2xl border border-slate-100 bg-white p-4 flex items-center gap-4">
                <span className={`shrink-0 rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase ${APP_STATUS[a.status]?.badge ?? "bg-slate-100 text-slate-500"}`}>
                  {APP_STATUS[a.status]?.label ?? a.status}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-800 truncate">{a.missionTitle}</p>
                  {a.note && <p className="text-xs text-slate-400 truncate">« {a.note} »</p>}
                  {a.result && <p className="text-xs text-emerald-600 font-medium truncate">Résultat : {a.result}</p>}
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

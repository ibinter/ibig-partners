import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catalogue des missions | IBIG PARTNERS",
  description:
    "Parcourez les missions disponibles sur IBIG PARTNERS : génération de leads, ventes, formations, logiciels SaaS et plus. Inscrivez-vous pour candidater.",
  openGraph: {
    title: "Catalogue des missions IBIG PARTNERS",
    description:
      "Des missions concrètes à accomplir pour gagner des commissions. Visibles sans inscription — candidature réservée aux partenaires.",
    type: "website",
  },
};

const BRANCH_COLOR: Record<string, { bg: string; text: string; border: string; emoji: string; gradient: string }> = {
  "Commercial — transversal":  { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa", emoji: "💼", gradient: "from-orange-500 to-red-600" },
  "IBIG Soft":                 { bg: "#f5f3ff", text: "#6d28d9", border: "#ddd6fe", emoji: "⚙️", gradient: "from-violet-500 to-purple-700" },
  "IBIG EduForm":              { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", emoji: "🎓", gradient: "from-blue-500 to-indigo-700" },
  "IBIG Immo Trust":           { bg: "#fffbeb", text: "#b45309", border: "#fde68a", emoji: "🏠", gradient: "from-amber-500 to-orange-600" },
  "IBIG Digital":              { bg: "#f0f9ff", text: "#0e7490", border: "#a5f3fc", emoji: "💻", gradient: "from-cyan-500 to-sky-700" },
  "IBIG Digital Kits":         { bg: "#f0fdfa", text: "#0f766e", border: "#99f6e4", emoji: "🔧", gradient: "from-teal-500 to-emerald-700" },
  "IBIG Conseil Plus":         { bg: "#f8fafc", text: "#475569", border: "#cbd5e1", emoji: "📋", gradient: "from-slate-500 to-slate-700" },
  "IBIG Market":               { bg: "#fff1f2", text: "#be123c", border: "#fecdd3", emoji: "🛒", gradient: "from-rose-500 to-pink-700" },
  "IBIG Multiservices":        { bg: "#fff7ed", text: "#ea580c", border: "#fed7aa", emoji: "🛠️", gradient: "from-orange-400 to-amber-600" },
  "IBIG Financement":          { bg: "#ecfdf5", text: "#047857", border: "#a7f3d0", emoji: "💰", gradient: "from-emerald-500 to-green-700" },
  "IBIG Emploi & Talents":     { bg: "#fdf4ff", text: "#86198f", border: "#f0abfc", emoji: "👥", gradient: "from-fuchsia-500 to-purple-700" },
  "IBIG PARTNERS & alliances": { bg: "#f0f9ff", text: "#0369a1", border: "#bae6fd", emoji: "🤝", gradient: "from-sky-500 to-blue-700" },
};
const DEFAULT_COLOR = { bg: "#f8fafc", text: "#334155", border: "#cbd5e1", emoji: "📦", gradient: "from-slate-500 to-slate-700" };

function getBranchColor(branch: string) {
  if (BRANCH_COLOR[branch]) return BRANCH_COLOR[branch];
  for (const [key, val] of Object.entries(BRANCH_COLOR)) {
    if (branch.toLowerCase().includes(key.toLowerCase().split(" ")[1] ?? "x")) return val;
  }
  return DEFAULT_COLOR;
}

const REWARD_CONFIG: Record<string, { bg: string; text: string; label: string; icon: string }> = {
  CP:    { bg: "#dbeafe", text: "#1e40af", label: "CP (Lead validé)",     icon: "🔵" },
  CASH:  { bg: "#dcfce7", text: "#15803d", label: "CASH (Vente)",         icon: "💵" },
  MIXED: { bg: "#fef9c3", text: "#854d0e", label: "Lead + Vente",         icon: "🏆" },
};

const DIFF_CONFIG: Record<string, { label: string; color: string; bg: string; bars: number }> = {
  EASY:   { label: "Facile",    color: "#16a34a", bg: "#dcfce7", bars: 1 },
  MEDIUM: { label: "Moyen",     color: "#d97706", bg: "#fef3c7", bars: 2 },
  HARD:   { label: "Difficile", color: "#dc2626", bg: "#fee2e2", bars: 3 },
};

function DifficultyBars({ level }: { level: string | null }) {
  const cfg = DIFF_CONFIG[level ?? "MEDIUM"] ?? DIFF_CONFIG.MEDIUM;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold" style={{ background: cfg.bg, color: cfg.color }}>
      <span className="flex items-center gap-0.5">
        {[1,2,3].map(i => (
          <span key={i} className="w-1 rounded-full inline-block" style={{ height: 10 + i * 2, background: i <= cfg.bars ? cfg.color : cfg.color + "33" }} />
        ))}
      </span>
      {cfg.label}
    </span>
  );
}

export default async function MissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string; type?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const branchFilter = sp.branch ?? null;
  const typeFilter   = sp.type   ?? null;
  const search       = sp.q?.trim() ?? null;
  const user = await getCurrentUser();

  const where: Record<string, unknown> = { active: true, status: { not: "ARCHIVED" } };
  if (branchFilter) where.branch     = branchFilter;
  if (typeFilter)   where.rewardType = typeFilter;
  if (search) {
    where.OR = [
      { title:       { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [missions, branches, total] = await Promise.all([
    (prisma as any).mission.findMany({
      where,
      orderBy: [{ compensationAmount: "desc" }, { cpAmount: "desc" }, { branch: "asc" }],
      take: 60,
      select: {
        id: true, title: true, description: true, branch: true,
        rewardType: true, compensationType: true, compensationAmount: true,
        cpAmount: true, difficulty: true, deadline: true, slots: true,
        missionType: true, zone: true,
        _count: { select: { applications: true } },
      },
    }),
    (prisma as any).mission.groupBy({
      by: ["branch"],
      where: { active: true, status: { not: "ARCHIVED" } },
      _count: { _all: true },
      orderBy: { _count: { branch: "desc" } },
    }),
    (prisma as any).mission.count({ where: { active: true, status: { not: "ARCHIVED" } } }),
  ]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <SiteHeader />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#030f2e] via-[#041B4D] to-[#0d2d72] text-white">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 20% 60%, #FF6A00 0%, transparent 50%), radial-gradient(circle at 80% 30%, #6366f1 0%, transparent 50%)" }} />
        <div className="relative mx-auto max-w-4xl px-4 py-16 sm:py-20 text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-300">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Catalogue des missions
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            <span className="text-orange-400">{total.toLocaleString("fr-FR")}</span> missions<br />
            <span className="text-white/75 text-3xl sm:text-4xl font-bold">à accomplir sur 11 pays</span>
          </h1>
          <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            Choisissez une mission, accomplissez-la, encaissez votre récompense.
            Commissions en FCFA, Crédits PARTNERS ou les deux. Inscription 100% gratuite.
          </p>
          {/* Stats rapides */}
          <div className="flex flex-wrap justify-center gap-6 pt-1">
            {[
              { label: "Branches actives", value: String(branches.length) },
              { label: "Missions disponibles", value: String(total) },
              { label: "Types de récompenses", value: "3" },
              { label: "Pays couverts", value: "11" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-extrabold text-orange-400">{s.value}</p>
                <p className="text-[11px] font-medium text-white/50 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/rejoindre" className="inline-flex items-center gap-2 rounded-2xl bg-[#FF6A00] hover:bg-orange-500 active:scale-95 transition-all px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-orange-900/30">
              🚀 S&apos;inscrire gratuitement
            </Link>
            {!user && (
              <Link href="/connexion" className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/8 hover:bg-white/15 transition px-6 py-3.5 text-sm font-semibold text-white">
                Déjà partenaire ? Connexion
              </Link>
            )}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl w-full px-4 py-10 flex-1">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── SIDEBAR filtres ── */}
          <aside className="lg:w-72 shrink-0 space-y-5">

            {/* Recherche */}
            <form method="GET" action="/missions">
              {branchFilter && <input type="hidden" name="branch" value={branchFilter} />}
              {typeFilter   && <input type="hidden" name="type"   value={typeFilter}   />}
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input type="text" name="q" defaultValue={search ?? ""} placeholder="Rechercher une mission…"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#041B4D]/20 shadow-sm"
                />
              </div>
            </form>

            {/* Filtre récompense */}
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Type de récompense</p>
              </div>
              <div className="p-2 space-y-1">
                {[
                  { value: "",     label: "Toutes les récompenses", icon: "✦" },
                  { value: "CP",   label: "🔵 Crédits PARTNERS (CP)", icon: "" },
                  { value: "CASH", label: "💵 Commission CASH",       icon: "" },
                  { value: "MIXED",label: "🏆 Lead + Vente (MIXED)",  icon: "" },
                ].map((opt) => (
                  <Link key={opt.value}
                    href={`/missions?${branchFilter ? `branch=${encodeURIComponent(branchFilter)}&` : ""}${opt.value ? `type=${opt.value}` : ""}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
                    className={`flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      (typeFilter ?? "") === opt.value
                        ? "bg-[#041B4D] text-white font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Filtre branche */}
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Branches</p>
                <span className="text-xs font-bold text-slate-500">{total} missions</span>
              </div>
              <div className="p-2 space-y-0.5 max-h-80 overflow-y-auto">
                <Link
                  href={`/missions?${typeFilter ? `type=${typeFilter}&` : ""}${search ? `q=${encodeURIComponent(search)}` : ""}`}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${!branchFilter ? "bg-[#041B4D] text-white font-bold" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <span>Toutes les branches</span>
                  <span className="text-xs opacity-60 tabular-nums">{total}</span>
                </Link>
                {branches.map((b: { branch: string; _count: { _all: number } }) => {
                  const c = getBranchColor(b.branch);
                  const isActive = branchFilter === b.branch;
                  return (
                    <Link key={b.branch}
                      href={`/missions?branch=${encodeURIComponent(b.branch)}${typeFilter ? `&type=${typeFilter}` : ""}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive ? "font-bold" : "text-slate-600 hover:bg-slate-50"}`}
                      style={isActive ? { background: c.text, color: "#fff" } : {}}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-sm" style={{ background: isActive ? "rgba(255,255,255,0.2)" : c.bg }}>
                          {c.emoji}
                        </span>
                        <span className="truncate text-xs">{b.branch}</span>
                      </span>
                      <span className="text-xs opacity-60 tabular-nums shrink-0 ml-2">{b._count._all}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {(branchFilter || typeFilter || search) && (
              <Link href="/missions" className="flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100 py-2.5 text-sm font-semibold transition">
                ✕ Effacer les filtres
              </Link>
            )}
          </aside>

          {/* ── LISTE MISSIONS ── */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* En-tête résultats */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                <span className="font-extrabold text-slate-800">{missions.length}{missions.length === 60 ? "+" : ""}</span> mission{missions.length > 1 ? "s" : ""}
                {branchFilter && <span> · <span className="font-semibold text-[#041B4D]">{branchFilter}</span></span>}
                {typeFilter   && <span> · <span className="font-semibold">{REWARD_CONFIG[typeFilter]?.label}</span></span>}
                {search       && <span> · <em className="not-italic font-semibold">&laquo;{search}&raquo;</em></span>}
              </p>
            </div>

            {missions.length === 0 ? (
              <div className="text-center py-32 space-y-3">
                <p className="text-5xl">🔍</p>
                <p className="text-lg font-bold text-slate-700">Aucune mission trouvée</p>
                <p className="text-sm text-slate-400">Essayez d&apos;autres filtres ou termes de recherche.</p>
                <Link href="/missions" className="inline-block mt-2 text-sm font-semibold text-[#FF6A00] hover:underline">Réinitialiser →</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {missions.map((m: any) => {
                  const c  = getBranchColor(m.branch);
                  const rc = REWARD_CONFIG[m.rewardType] ?? { bg: "#f1f5f9", text: "#475569", label: m.rewardType, icon: "📦" };

                  const cashAmt = m.compensationAmount ?? 0;
                  const cpAmt   = m.cpAmount ?? 0;
                  const isPct   = m.compensationType === "PERCENT";
                  const cashFmt = isPct ? `${(cashAmt / 100).toFixed(1)}%` : `${cashAmt.toLocaleString("fr-FR")} FCFA`;

                  let rewardMain = "", rewardSub = "";
                  if (m.rewardType === "CASH" && cashAmt > 0)       { rewardMain = cashFmt; }
                  else if (m.rewardType === "CP" && cpAmt > 0)       { rewardMain = `${cpAmt.toLocaleString("fr-FR")} CP`; }
                  else if (m.rewardType === "MIXED") {
                    rewardMain = cashAmt > 0 ? cashFmt : "";
                    rewardSub  = cpAmt > 0 ? `+ ${cpAmt.toLocaleString("fr-FR")} CP` : "";
                  }

                  const hasDeadline = m.deadline && new Date(m.deadline) > new Date();
                  const deadlineDays = hasDeadline
                    ? Math.ceil((new Date(m.deadline).getTime() - Date.now()) / 86400000)
                    : null;

                  const slotsLeft = m.slots ? Math.max(0, m.slots - (m._count?.applications ?? 0)) : null;

                  return (
                    <article key={m.id}
                      className="group flex flex-col sm:flex-row gap-0 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                    >
                      {/* Bande latérale colorée */}
                      <div className={`sm:w-1.5 h-1.5 sm:h-auto bg-gradient-to-b ${c.gradient} shrink-0`} />

                      <div className="flex flex-col sm:flex-row flex-1 p-5 gap-4">
                        {/* Icône branche */}
                        <div className="hidden sm:flex w-12 h-12 rounded-2xl items-center justify-center text-2xl shrink-0 mt-0.5" style={{ background: c.bg }}>
                          {c.emoji}
                        </div>

                        {/* Contenu principal */}
                        <div className="flex-1 min-w-0 space-y-3">
                          {/* Badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold border" style={{ background: c.bg, color: c.text, borderColor: c.border }}>
                              <span className="sm:hidden">{c.emoji} </span>
                              {m.branch.replace(/^IBIG\s/, "")}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold" style={{ background: rc.bg, color: rc.text }}>
                              {rc.icon} {rc.label}
                            </span>
                            {m.zone && m.zone !== "Côte d'Ivoire" && (
                              <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                                📍 {m.zone}
                              </span>
                            )}
                            {deadlineDays !== null && deadlineDays <= 7 && (
                              <span className="rounded-lg bg-rose-50 border border-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                                ⏱ {deadlineDays}j restants
                              </span>
                            )}
                          </div>

                          {/* Titre */}
                          <h2 className="text-base font-extrabold text-slate-800 leading-snug group-hover:text-[#041B4D] transition">
                            {m.title}
                          </h2>

                          {/* Description */}
                          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                            {m.description}
                          </p>

                          {/* Footer carte */}
                          <div className="flex items-center gap-3 flex-wrap pt-1">
                            <DifficultyBars level={m.difficulty} />
                            {slotsLeft !== null && slotsLeft <= 5 && (
                              <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 rounded-lg px-2 py-1">
                                {slotsLeft === 0 ? "Complet" : `${slotsLeft} place${slotsLeft > 1 ? "s" : ""} restante${slotsLeft > 1 ? "s" : ""}`}
                              </span>
                            )}
                            {(m._count?.applications ?? 0) > 0 && (
                              <span className="text-[11px] text-slate-400 font-medium">
                                {m._count.applications} candidature{m._count.applications > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Colonne droite — récompense + CTA */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:gap-4 sm:min-w-[140px]">
                          {/* Récompense */}
                          {rewardMain ? (
                            <div className="rounded-2xl border px-4 py-2.5 text-center" style={{ background: rc.bg, borderColor: rc.text + "33" }}>
                              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: rc.text }}>Récompense</p>
                              <p className="text-lg font-extrabold" style={{ color: rc.text }}>{rewardMain}</p>
                              {rewardSub && <p className="text-[10px] font-semibold" style={{ color: rc.text }}>{rewardSub}</p>}
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-center">
                              <p className="text-xs font-semibold text-slate-400">Voir les détails</p>
                            </div>
                          )}

                          {/* CTA */}
                          {user ? (
                            <Link href={`/missions/${m.id}`}
                              className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#041B4D] hover:bg-[#0c2d6b] text-white px-4 py-2.5 text-xs font-extrabold transition whitespace-nowrap"
                            >
                              🎯 Candidater →
                            </Link>
                          ) : (
                            <Link href={`/missions/${m.id}`}
                              className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-2.5 text-xs font-bold transition whitespace-nowrap"
                            >
                              Voir la mission →
                            </Link>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* CTA final */}
            {missions.length > 0 && (
              <div className="mt-10 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#030f2e] via-[#041B4D] to-[#0d2d72] text-white p-10 text-center space-y-4">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #FF6A00 0%, transparent 50%), radial-gradient(circle at 80% 50%, #6366f1 0%, transparent 50%)" }} />
                <div className="relative">
                  <p className="text-2xl sm:text-3xl font-extrabold">
                    {user ? "Accédez à toutes vos missions" : "Prêt à décrocher vos premières missions ?"}
                  </p>
                  <p className="text-sm text-white/60 mt-2">
                    {user
                      ? "Retrouvez vos candidatures et suivez votre progression depuis votre espace."
                      : "Inscription gratuite · Commissions immédiates · Mobile Money · 11 pays"}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                    {user ? (
                      <Link href="/espace/missions" className="inline-flex items-center gap-2 rounded-2xl bg-[#FF6A00] hover:bg-orange-500 transition px-8 py-3.5 text-sm font-extrabold text-white shadow-lg">
                        🎯 Mes missions →
                      </Link>
                    ) : (
                      <>
                        <Link href="/rejoindre" className="inline-flex items-center gap-2 rounded-2xl bg-[#FF6A00] hover:bg-orange-500 transition px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-orange-900/30">
                          🚀 Rejoindre gratuitement →
                        </Link>
                        <Link href="/connexion" className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/8 hover:bg-white/15 transition px-6 py-3.5 text-sm font-semibold text-white">
                          Déjà partenaire ? Connexion
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

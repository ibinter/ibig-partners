import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catalogue des missions | IBIG PARTNERS",
  description:
    "Parcourez les 1 000+ missions disponibles sur IBIG PARTNERS : génération de leads, ventes, formations, logiciels SaaS et plus. Inscrivez-vous pour candidater.",
  openGraph: {
    title: "Catalogue des missions IBIG PARTNERS",
    description:
      "1 000+ missions concrètes à accomplir pour gagner des commissions. Visibles sans inscription — candidature réservée aux partenaires.",
    type: "website",
  },
};

const BRANCH_COLOR: Record<string, { bg: string; text: string; border: string; emoji: string }> = {
  "Commercial — transversal":        { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa", emoji: "💼" },
  "IBIG Soft":                       { bg: "#f5f3ff", text: "#6d28d9", border: "#ddd6fe", emoji: "⚙️" },
  "IBIG EduForm":                    { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", emoji: "🎓" },
  "IBIG Immo Trust":                 { bg: "#fffbeb", text: "#b45309", border: "#fde68a", emoji: "🏠" },
  "IBIG Digital":                    { bg: "#ecfeff", text: "#0e7490", border: "#a5f3fc", emoji: "💻" },
  "IBIG Digital Kits":               { bg: "#f0fdfa", text: "#0f766e", border: "#99f6e4", emoji: "🔧" },
  "IBIG Conseil Plus":               { bg: "#f8fafc", text: "#475569", border: "#cbd5e1", emoji: "📋" },
  "IBIG Market":                     { bg: "#fff1f2", text: "#be123c", border: "#fecdd3", emoji: "🛒" },
  "IBIG Multiservices":              { bg: "#fff7ed", text: "#ea580c", border: "#fed7aa", emoji: "🛠️" },
  "IBIG Financement":                { bg: "#ecfdf5", text: "#047857", border: "#a7f3d0", emoji: "💰" },
  "IBIG Emploi & Talents":           { bg: "#fdf4ff", text: "#86198f", border: "#f0abfc", emoji: "👥" },
  "IBIG PARTNERS & alliances":       { bg: "#f0f9ff", text: "#0369a1", border: "#bae6fd", emoji: "🤝" },
};

const DEFAULT_COLOR = { bg: "#f8fafc", text: "#334155", border: "#cbd5e1", emoji: "📦" };

function getBranchColor(branch: string) {
  if (BRANCH_COLOR[branch]) return BRANCH_COLOR[branch];
  for (const [key, val] of Object.entries(BRANCH_COLOR)) {
    if (branch.toLowerCase().includes(key.toLowerCase().split(" ")[1] ?? "")) return val;
  }
  return DEFAULT_COLOR;
}

const REWARD_LABEL: Record<string, string> = {
  CP:    "Lead validé",
  CASH:  "Vente encaissée",
  MIXED: "Lead + Vente",
};

const REWARD_COLOR: Record<string, { bg: string; text: string }> = {
  CP:    { bg: "#dbeafe", text: "#1e40af" },
  CASH:  { bg: "#dcfce7", text: "#15803d" },
  MIXED: { bg: "#fef9c3", text: "#854d0e" },
};

export default async function MissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string; type?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const branchFilter = sp.branch ?? null;
  const typeFilter   = sp.type   ?? null;
  const search       = sp.q?.trim() ?? null;

  const where: Record<string, unknown> = { active: true, status: { not: "ARCHIVED" } };
  if (branchFilter) where.branch = branchFilter;
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
      orderBy: [{ branch: "asc" }, { title: "asc" }],
      take: 60,
      select: {
        id: true,
        title: true,
        description: true,
        branch: true,
        rewardType: true,
        rewardValue: true,
        compensationType: true,
        compensationAmount: true,
        cpAmount: true,
        difficulty: true,
      },
    }),
    (prisma as any).mission.groupBy({
      by: ["branch"],
      where: { active: true, status: { not: "ARCHIVED" } },
      _count: { _all: true },
      orderBy: { branch: "asc" },
    }),
    (prisma as any).mission.count({ where: { active: true, status: { not: "ARCHIVED" } } }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#041B4D] to-[#0c2d6b] text-white py-12 px-4">
        <div className="mx-auto max-w-4xl text-center space-y-4">
          <span className="inline-block rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-orange-300">
            🎯 Catalogue public
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            {total.toLocaleString("fr-FR")}+ missions à accomplir
          </h1>
          <p className="text-base sm:text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
            Parcourez librement toutes les missions disponibles. Pour candidater à une offre, une inscription gratuite est requise.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/rejoindre"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#FF6A00] hover:bg-orange-600 transition px-6 py-3 text-sm font-extrabold text-white shadow-lg"
            >
              🚀 S&apos;inscrire gratuitement →
            </Link>
            <Link
              href="/connexion"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 transition px-6 py-3 text-sm font-semibold text-white"
            >
              Déjà partenaire ? Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* Stats rapides */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-3 overflow-x-auto">
          <div className="flex items-center gap-6 min-w-max text-xs font-semibold text-slate-500">
            <span>🏢 {branches.length} branches</span>
            <span>💼 {total.toLocaleString("fr-FR")} missions</span>
            <span>💰 Commissions CP, CASH & MIXED</span>
            <span>✅ Inscription gratuite</span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl w-full px-4 py-8 flex-1">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar filtres */}
          <aside className="lg:w-64 shrink-0 space-y-6">

            {/* Recherche */}
            <form method="GET" action="/missions">
              {branchFilter && <input type="hidden" name="branch" value={branchFilter} />}
              {typeFilter   && <input type="hidden" name="type"   value={typeFilter}   />}
              <div className="relative">
                <input
                  type="text"
                  name="q"
                  defaultValue={search ?? ""}
                  placeholder="Rechercher une mission…"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#041B4D]/20 shadow-sm"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </button>
              </div>
            </form>

            {/* Filtre type de récompense */}
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 space-y-2">
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Type de commission</p>
              {[
                { value: "", label: "Tous les types" },
                { value: "CP",    label: "🔵 Lead validé (CP)" },
                { value: "CASH",  label: "🟢 Vente encaissée (CASH)" },
                { value: "MIXED", label: "🟡 Lead + Vente (MIXED)" },
              ].map((opt) => (
                <Link
                  key={opt.value}
                  href={`/missions?${branchFilter ? `branch=${encodeURIComponent(branchFilter)}&` : ""}${opt.value ? `type=${opt.value}` : ""}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
                  className={`block rounded-xl px-3 py-2 text-sm font-medium transition ${typeFilter === opt.value || (!typeFilter && !opt.value) ? "bg-[#041B4D] text-white" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>

            {/* Filtre branche */}
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 space-y-1">
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Branches</p>
              <Link
                href={`/missions?${typeFilter ? `type=${typeFilter}&` : ""}${search ? `q=${encodeURIComponent(search)}` : ""}`}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${!branchFilter ? "bg-[#041B4D] text-white" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <span>Toutes les branches</span>
                <span className="text-xs opacity-60">{total}</span>
              </Link>
              {branches.map((b: { branch: string; _count: { _all: number } }) => {
                const c = getBranchColor(b.branch);
                const isActive = branchFilter === b.branch;
                return (
                  <Link
                    key={b.branch}
                    href={`/missions?branch=${encodeURIComponent(b.branch)}${typeFilter ? `&type=${typeFilter}` : ""}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? "text-white" : "text-slate-600 hover:bg-slate-50"}`}
                    style={isActive ? { background: c.text } : {}}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{c.emoji}</span>
                      <span className="truncate max-w-[140px]">{b.branch}</span>
                    </span>
                    <span className="text-xs opacity-60 shrink-0">{b._count._all}</span>
                  </Link>
                );
              })}
            </div>
          </aside>

          {/* Grille de missions */}
          <div className="flex-1 min-w-0">
            {/* En-tête résultats */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-slate-500">
                <span className="font-bold text-slate-800">{missions.length}</span>
                {missions.length === 60 ? "+" : ""} mission{missions.length > 1 ? "s" : ""} affichée{missions.length > 1 ? "s" : ""}
                {branchFilter && <span> — <span className="text-[#041B4D] font-semibold">{branchFilter}</span></span>}
                {typeFilter   && <span> — <span className="font-semibold">{REWARD_LABEL[typeFilter]}</span></span>}
              </p>
              {(branchFilter || typeFilter || search) && (
                <Link href="/missions" className="text-xs font-semibold text-slate-500 hover:text-[#FF6A00] transition">
                  Effacer les filtres ✕
                </Link>
              )}
            </div>

            {missions.length === 0 ? (
              <div className="text-center py-24 text-slate-400">
                <span className="text-5xl mb-4 block">🔍</span>
                <p className="text-lg font-semibold">Aucune mission trouvée</p>
                <p className="text-sm mt-1">Essayez d&apos;autres filtres ou termes de recherche.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {missions.map((m: { id: string; title: string; description: string; branch: string; rewardType: string; rewardValue: number | null; compensationType: string | null; compensationAmount: number | null; cpAmount: number | null; difficulty: string | null }) => {
                  const c = getBranchColor(m.branch);
                  const rc = REWARD_COLOR[m.rewardType] ?? { bg: "#f1f5f9", text: "#475569" };

                  // Calcul affichage récompense
                  const cashAmt   = m.compensationAmount ?? 0;
                  const cpAmt     = m.cpAmount ?? 0;
                  const isPct     = m.compensationType === "PERCENT";
                  const cashFmt   = isPct ? `${(cashAmt / 100).toFixed(1)}%` : `${cashAmt.toLocaleString("fr-FR")} FCFA`;
                  let rewardLine  = "";
                  if (m.rewardType === "CP")    rewardLine = cpAmt > 0 ? `${cpAmt.toLocaleString("fr-FR")} CP` : "";
                  else if (m.rewardType === "CASH")  rewardLine = cashAmt > 0 ? cashFmt : "";
                  else if (m.rewardType === "MIXED") rewardLine = [cashAmt > 0 ? cashFmt : "", cpAmt > 0 ? `${cpAmt.toLocaleString("fr-FR")} CP` : ""].filter(Boolean).join(" + ");

                  return (
                    <Link
                      key={m.id}
                      href={`/missions/${m.id}`}
                      className="group flex flex-col rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden"
                    >
                      {/* Bande couleur branche */}
                      <div className="h-1.5 w-full" style={{ background: c.text }} />
                      <div className="p-4 flex flex-col flex-1 gap-3">
                        {/* Branche + type */}
                        <div className="flex items-start gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold border" style={{ background: c.bg, color: c.text, borderColor: c.border }}>
                            {c.emoji} {m.branch.replace(/^IBIG\s/, "")}
                          </span>
                          <span className="inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-bold" style={{ background: rc.bg, color: rc.text }}>
                            {REWARD_LABEL[m.rewardType] ?? m.rewardType}
                          </span>
                        </div>

                        {/* Titre */}
                        <h2 className="text-sm font-extrabold text-slate-800 leading-snug group-hover:text-[#041B4D] transition line-clamp-2">
                          {m.title}
                        </h2>

                        {/* Description */}
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1">
                          {m.description}
                        </p>

                        {/* Récompense mise en avant */}
                        <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 flex items-center justify-between">
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600">🏆 Récompense</p>
                          <p className="text-sm font-extrabold text-amber-700">
                            {rewardLine || "Voir les détails →"}
                          </p>
                        </div>

                        {/* Footer carte */}
                        <div className="flex items-center justify-between mt-auto">
                          {m.difficulty && (
                            <span className="text-[11px] font-semibold text-slate-400">
                              {m.difficulty === "EASY" ? "🟢 Facile" : m.difficulty === "MEDIUM" ? "🟡 Moyen" : "🔴 Difficile"}
                            </span>
                          )}
                          <span className="ml-auto text-[11px] font-bold text-[#041B4D] group-hover:text-[#FF6A00] transition">
                            Voir la mission →
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* CTA inscription bas de page */}
            {missions.length > 0 && (
              <div className="mt-10 rounded-3xl bg-gradient-to-br from-[#041B4D] to-[#0c2d6b] text-white p-8 text-center space-y-4">
                <p className="text-xl font-extrabold">Prêt à candidater à ces missions ?</p>
                <p className="text-sm text-white/70">L&apos;inscription est gratuite et vous donne accès à toutes les missions et à votre tableau de bord partenaire.</p>
                <Link
                  href="/rejoindre"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#FF6A00] hover:bg-orange-600 transition px-8 py-3 text-sm font-extrabold text-white shadow-lg"
                >
                  🚀 Rejoindre gratuitement →
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

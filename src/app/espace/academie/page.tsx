import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  VIDEO: "Vidéo",
  PDF: "Guide PDF",
  ARTICLE: "Article",
  AI: "Assistant IA",
  QUIZ: "Quiz",
};

const TYPE_ICONS: Record<string, string> = {
  VIDEO: "🎬",
  PDF: "📄",
  ARTICLE: "📝",
  AI: "🤖",
  QUIZ: "🧠",
};

const TYPE_COLORS: Record<string, string> = {
  VIDEO: "bg-blue-100 text-blue-700",
  PDF: "bg-amber-100 text-amber-700",
  ARTICLE: "bg-green-100 text-green-700",
  AI: "bg-violet-100 text-violet-700",
  QUIZ: "bg-orange-100 text-orange-700",
};

const EMOJI_THUMBS: Record<string, string> = {
  VIDEO: "🎬",
  PDF: "📋",
  ARTICLE: "📰",
  AI: "🤖",
  QUIZ: "🧪",
};

const TABS = [
  { key: "TOUS", label: "Tous" },
  { key: "VIDEO", label: "Vidéos" },
  { key: "PDF", label: "Guides PDF" },
  { key: "ARTICLE", label: "Articles" },
  { key: "AI", label: "Assistant IA" },
  { key: "QUIZ", label: "Quiz" },
];

export default async function AcademiePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const user = await requireUser();
  const { type, q } = await searchParams;
  const activeType = type && type !== "TOUS" ? type : null;

  // Statuts accessibles par l'utilisateur (cumulatif)
  const STATUS_ORDER = ["STARTER", "SILVER", "GOLD", "MASTER", "ELITE"];
  const userRank = STATUS_ORDER.indexOf(user.status);
  const accessibleStatuses = STATUS_ORDER.slice(0, userRank + 1);

  const where: Record<string, unknown> = {
    active: true,
    minStatus: { in: accessibleStatuses },
  };
  if (activeType) where.type = activeType;
  if (q) where.title = { contains: q, mode: "insensitive" };

  const modules = await (prisma as any).trainingModule.findMany({
    where,
    orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
  });

  const progressList = await (prisma as any).trainingProgress.findMany({
    where: { userId: user.id },
  });

  const progressMap = new Map<string, { startedAt: Date | null; completedAt: Date | null }>();
  for (const p of progressList) {
    progressMap.set(p.moduleId, p);
  }

  const completedCount = progressList.filter((p: any) => p.completedAt).length;

  const allCount = await (prisma as any).trainingModule.count({ where: { active: true } });

  return (
    <div>
      <PageHeader
        title="Académie IBIG"
        subtitle="Formez-vous pour mieux vendre et développer votre réseau"
      />

      {/* Stats hero */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card-premium p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{allCount}</p>
          <p className="text-xs text-muted mt-0.5">Modules disponibles</p>
        </div>
        <div className="card-premium p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{completedCount}</p>
          <p className="text-xs text-muted mt-0.5">Complétés</p>
        </div>
        <div className="card-premium p-4 text-center">
          <p className="text-2xl font-bold text-violet-600">{progressList.filter((p: any) => p.startedAt && !p.completedAt).length}</p>
          <p className="text-xs text-muted mt-0.5">En cours</p>
        </div>
        <div className="card-premium p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">
            {allCount > 0 ? Math.round((completedCount / allCount) * 100) : 0}%
          </p>
          <p className="text-xs text-muted mt-0.5">Progression</p>
        </div>
      </div>

      {/* Search */}
      <form className="mb-4 flex gap-2">
        {activeType && <input type="hidden" name="type" value={activeType} />}
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Rechercher un module..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          Rechercher
        </button>
      </form>

      {/* Type filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const isActive = (tab.key === "TOUS" && !activeType) || tab.key === activeType;
          const params = new URLSearchParams();
          if (tab.key !== "TOUS") params.set("type", tab.key);
          if (q) params.set("q", q);
          return (
            <Link
              key={tab.key}
              href={`/espace/academie?${params.toString()}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Module grid */}
      {modules.length === 0 ? (
        <EmptyState>Aucun module de formation disponible pour le moment.</EmptyState>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod: any) => {
            const progress = progressMap.get(mod.id);
            const isCompleted = !!progress?.completedAt;
            const isStarted = !!progress?.startedAt && !isCompleted;

            return (
              <Link
                key={mod.id}
                href={`/espace/academie/${mod.slug}`}
                className={`group flex flex-col rounded-2xl bg-white border shadow-sm hover:shadow-md transition-all overflow-hidden ${
                  mod.featured ? "border-amber-300 ring-1 ring-amber-200" : "border-slate-100"
                }`}
              >
                {/* Thumbnail */}
                <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                  {mod.thumbnail ? (
                    <img
                      src={mod.thumbnail}
                      alt={mod.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl opacity-60">{EMOJI_THUMBS[mod.type] ?? "📚"}</span>
                  )}
                  {mod.featured && (
                    <span className="absolute top-2 right-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-900">
                      ⭐ À la une
                    </span>
                  )}
                  {/* Progress badge */}
                  {isCompleted && (
                    <span className="absolute bottom-2 left-2 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
                      ✓ Complété
                    </span>
                  )}
                  {isStarted && (
                    <span className="absolute bottom-2 left-2 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-bold text-white">
                      ▶ En cours
                    </span>
                  )}
                  {!progress && (
                    <span className="absolute bottom-2 left-2 rounded-full bg-slate-600 px-2 py-0.5 text-xs font-bold text-white">
                      Nouveau
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_COLORS[mod.type] ?? "bg-slate-100 text-slate-700"}`}>
                      {TYPE_ICONS[mod.type]} {TYPE_LABELS[mod.type] ?? mod.type}
                    </span>
                    {mod.duration && (
                      <span className="text-xs text-muted">⏱ {mod.duration}</span>
                    )}
                  </div>

                  <h3 className="mb-1 font-semibold text-ink text-sm leading-snug group-hover:text-blue-700 transition-colors">
                    {mod.title}
                  </h3>

                  {mod.description && (
                    <p className="mb-3 flex-1 text-xs text-muted leading-relaxed line-clamp-2">
                      {mod.description}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                      Voir le module →
                    </span>
                    {mod.viewCount > 0 && (
                      <span className="text-xs text-muted">{mod.viewCount} vues</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

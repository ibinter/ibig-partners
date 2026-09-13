import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { CertificationBanner } from "@/components/certification-banner";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  VIDEO: "Vidéo", PDF: "Guide PDF", ARTICLE: "Article", AI: "Assistant IA",
  QUIZ: "Quiz", AUDIO: "Audio", IMAGE: "Image",
};
const TYPE_ICONS: Record<string, string> = {
  VIDEO: "🎬", PDF: "📄", ARTICLE: "📝", AI: "🤖", QUIZ: "🧠", AUDIO: "🎧", IMAGE: "🖼️",
};
const TYPE_COLORS: Record<string, string> = {
  VIDEO: "bg-blue-100 text-blue-700", PDF: "bg-amber-100 text-amber-700",
  ARTICLE: "bg-green-100 text-green-700", AI: "bg-violet-100 text-violet-700",
  QUIZ: "bg-orange-100 text-orange-700", AUDIO: "bg-pink-100 text-pink-700",
  IMAGE: "bg-teal-100 text-teal-700",
};
const EMOJI_THUMBS: Record<string, string> = {
  VIDEO: "🎬", PDF: "📋", ARTICLE: "📰", AI: "🤖", QUIZ: "🧪", AUDIO: "🎧", IMAGE: "🖼️",
};
const TABS = [
  { key: "TOUS", label: "Tous" }, { key: "VIDEO", label: "Vidéos" },
  { key: "PDF", label: "Guides PDF" }, { key: "ARTICLE", label: "Articles" },
  { key: "AUDIO", label: "Audios" }, { key: "AI", label: "Assistant IA" }, { key: "QUIZ", label: "Quiz" },
];

// ── Parcours d'onboarding recommandé ─────────────────────────────────────────
const PARCOURS = [
  {
    step: 1, emoji: "📖", title: "Comprendre le système",
    desc: "Lisez la page Formation : grille des taux, système 3 niveaux, exemples de gains.",
    href: "/espace/formation", cta: "Voir la Formation →",
    color: "from-blue-500 to-blue-600",
  },
  {
    step: 2, emoji: "🧩", title: "Activer vos produits",
    desc: "Activez les produits IBIG que vous souhaitez promouvoir et récupérez vos liens affiliés.",
    href: "/espace/produits", cta: "Activer mes produits →",
    color: "from-violet-500 to-violet-600",
  },
  {
    step: 3, emoji: "🔗", title: "Générer vos liens",
    desc: "Créez vos liens UTM trackés et téléchargez vos QR codes pour partager partout.",
    href: "/espace/liens", cta: "Mes liens →",
    color: "from-emerald-500 to-teal-600",
  },
  {
    step: 4, emoji: "🤖", title: "Préparer vos arguments",
    desc: "Parlez au Coach IA IBIG pour maîtriser les produits, préparer vos pitchs et réponses aux objections.",
    href: "/espace/academie/assistant", cta: "Parler au Coach IA →",
    color: "from-amber-500 to-orange-500",
  },
  {
    step: 5, emoji: "📦", title: "Télécharger le kit marketing",
    desc: "Visuels, scripts WhatsApp, arguments clés — tout ce qu'il faut pour prospecter efficacement.",
    href: "/espace/kit", cta: "Kit Marketing →",
    color: "from-rose-500 to-pink-600",
  },
  {
    step: 6, emoji: "👥", title: "Recruter vos filleuls",
    desc: "Partagez votre lien de parrainage et formez vos filleuls pour gagner des commissions N2/N3.",
    href: "/espace/reseau", cta: "Mon réseau →",
    color: "from-slate-500 to-slate-700",
  },
];

// ── Ressources rapides ────────────────────────────────────────────────────────
const RESSOURCES = [
  { icon: "📚", label: "Ma Formation", desc: "Grille des taux, exemples, FAQ", href: "/espace/formation", color: "border-blue-200 bg-blue-50 text-blue-700" },
  { icon: "🤖", label: "Coach IA",     desc: "Préparer argumentaires & réponses", href: "/espace/academie/assistant", color: "border-violet-200 bg-violet-50 text-violet-700" },
  { icon: "📖", label: "Guide PDF",    desc: "Manuel officiel du partenaire", href: "/espace/guide", color: "border-amber-200 bg-amber-50 text-amber-700" },
  { icon: "📦", label: "Kit Marketing",desc: "Scripts, visuels, QR codes", href: "/espace/kit", color: "border-rose-200 bg-rose-50 text-rose-700" },
  { icon: "🧮", label: "Simulateur",   desc: "Calculer vos gains potentiels", href: "/espace/simulateur", color: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { icon: "🏆", label: "Challenges",   desc: "Objectifs mensuels & récompenses", href: "/espace/challenges", color: "border-orange-200 bg-orange-50 text-orange-700" },
];

export default async function AcademiePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const user = await requireUser();
  const { type, q } = await searchParams;
  const activeType = type && type !== "TOUS" ? type : null;

  const STATUS_ORDER = ["STARTER", "SILVER", "GOLD", "MASTER", "ELITE"];
  const userRank = STATUS_ORDER.indexOf(user.status);
  const accessibleStatuses = STATUS_ORDER.slice(0, userRank + 1);

  const where: Record<string, unknown> = {
    active: true,
    minStatus: { in: accessibleStatuses },
  };
  if (activeType) where.type = activeType;
  if (q) where.title = { contains: q, mode: "insensitive" };

  const [modules, progressList, allCount, productCount] = await Promise.all([
    (prisma as any).trainingModule.findMany({
      where,
      orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    }).catch(() => []),
    (prisma as any).trainingProgress.findMany({ where: { userId: user.id } }).catch(() => []),
    (prisma as any).trainingModule.count({ where: { active: true } }).catch(() => 0),
    prisma.product.count({ where: { active: true } }),
  ]);

  const progressMap = new Map<string, { startedAt: Date | null; completedAt: Date | null }>();
  for (const p of progressList) progressMap.set(p.moduleId, p);

  const completedCount = progressList.filter((p: any) => p.completedAt).length;
  const inProgressCount = progressList.filter((p: any) => p.startedAt && !p.completedAt).length;

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Académie IBIG"
        subtitle="Votre centre de formation complet — parcours, outils, modules et coach IA."
      />

      {/* ── Bannière certification ── */}
      <CertificationBanner
        completed={completedCount}
        total={allCount}
        partnerName={`${user.firstName} ${user.lastName}`}
        partnerCode={user.code}
      />

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { value: allCount, label: "Modules disponibles", color: "text-blue-600" },
          { value: completedCount, label: "Complétés", color: "text-emerald-600" },
          { value: inProgressCount, label: "En cours", color: "text-violet-600" },
          { value: allCount > 0 ? `${Math.round((completedCount / allCount) * 100)}%` : "0%", label: "Progression", color: "text-amber-600" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Coach IA ── */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 via-violet-600 to-blue-600 p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">Coach personnalisé</span>
              <span className="flex items-center gap-1 text-xs text-violet-100"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Synchronisé avec vos produits</span>
            </div>
            <h2 className="mt-3 text-xl font-bold text-white">Coach IA IBIG</h2>
            <p className="mt-2 text-sm leading-relaxed text-violet-100">
              Maîtrisez {productCount} offres actives, préparez vos argumentaires de vente, répondez aux objections et obtenez un plan de prospection adapté à votre statut <strong className="text-white">{user.status}</strong>.
            </p>
          </div>
          <Link
            href="/espace/academie/assistant"
            className="inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-md transition hover:-translate-y-0.5 hover:bg-violet-50"
          >
            Parler au Coach IA →
          </Link>
        </div>
      </div>

      {/* ── Parcours recommandé ── */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-800">🗺️ Parcours recommandé</h2>
            <p className="text-sm text-slate-500 mt-0.5">6 étapes pour démarrer et performer en tant que partenaire IBIG</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PARCOURS.map((p) => (
            <Link key={p.step} href={p.href} className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-brand-200 transition-all flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white text-sm font-extrabold shrink-0`}>
                  {p.step}
                </div>
                <span className="text-xl">{p.emoji}</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 text-sm">{p.title}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{p.desc}</p>
              </div>
              <span className="text-xs font-bold text-brand-600 group-hover:text-brand-700">{p.cta}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Ressources rapides ── */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-3">⚡ Ressources rapides</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {RESSOURCES.map((r) => (
            <Link key={r.label} href={r.href} className={`rounded-2xl border p-4 flex flex-col gap-2 hover:shadow-md transition-all ${r.color}`}>
              <span className="text-2xl">{r.icon}</span>
              <p className="font-bold text-sm">{r.label}</p>
              <p className="text-xs opacity-80">{r.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Modules de formation ── */}
      <div>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h2 className="text-base font-bold text-slate-800">📚 Modules de formation</h2>
          {allCount > 0 && (
            <span className="rounded-full bg-brand-100 text-brand-700 px-2.5 py-0.5 text-xs font-bold">{allCount} disponibles</span>
          )}
        </div>

        {/* Recherche */}
        <form className="mb-4 flex gap-2">
          {activeType && <input type="hidden" name="type" value={activeType} />}
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Rechercher un module..."
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <button type="submit" className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition">
            Rechercher
          </button>
        </form>

        {/* Filtres type */}
        <div className="mb-5 flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const isActive = (tab.key === "TOUS" && !activeType) || tab.key === activeType;
            const params = new URLSearchParams();
            if (tab.key !== "TOUS") params.set("type", tab.key);
            if (q) params.set("q", q);
            return (
              <Link
                key={tab.key}
                href={`/espace/academie?${params.toString()}`}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition ${
                  isActive
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-white border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-700"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Grille modules */}
        {modules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-14 px-6 text-center">
            <p className="text-4xl mb-3">📚</p>
            <p className="font-semibold text-slate-600">Aucun module disponible pour le moment</p>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              L&apos;équipe IBIG ajoute régulièrement de nouvelles formations. En attendant, consultez les ressources ci-dessus ou parlez au Coach IA.
            </p>
            <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
              <Link href="/espace/formation" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition">
                📖 Ma Formation
              </Link>
              <Link href="/espace/academie/assistant" className="rounded-xl border border-brand-200 bg-brand-50 px-5 py-2.5 text-sm font-bold text-brand-700 hover:bg-brand-100 transition">
                🤖 Coach IA
              </Link>
            </div>
          </div>
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
                  <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                    {mod.thumbnail ? (
                      <img src={mod.thumbnail} alt={mod.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-5xl opacity-60">{EMOJI_THUMBS[mod.type] ?? "📚"}</span>
                    )}
                    {mod.featured && (
                      <span className="absolute top-2 right-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-900">⭐ À la une</span>
                    )}
                    {isCompleted && (
                      <span className="absolute bottom-2 left-2 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">✓ Complété</span>
                    )}
                    {isStarted && (
                      <span className="absolute bottom-2 left-2 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-bold text-white">▶ En cours</span>
                    )}
                    {!progress && (
                      <span className="absolute bottom-2 left-2 rounded-full bg-slate-600 px-2 py-0.5 text-xs font-bold text-white">Nouveau</span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_COLORS[mod.type] ?? "bg-slate-100 text-slate-700"}`}>
                        {TYPE_ICONS[mod.type]} {TYPE_LABELS[mod.type] ?? mod.type}
                      </span>
                      {mod.duration && <span className="text-xs text-slate-400">⏱ {mod.duration}</span>}
                    </div>
                    <h3 className="mb-1 font-semibold text-slate-900 text-sm leading-snug group-hover:text-brand-700 transition-colors">
                      {mod.title}
                    </h3>
                    {mod.description && (
                      <p className="mb-3 flex-1 text-xs text-slate-500 leading-relaxed line-clamp-2">{mod.description}</p>
                    )}
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-xs font-semibold text-brand-600 group-hover:text-brand-700">Voir le module →</span>
                      {mod.viewCount > 0 && <span className="text-xs text-slate-400">{mod.viewCount} vues</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CTA bas de page ── */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-700 p-6 text-center text-white shadow-lg">
        <p className="text-lg font-bold mb-1">Besoin d&apos;aide pour démarrer ? 🚀</p>
        <p className="text-blue-100 text-sm mb-4">Le Coach IA IBIG répond à toutes vos questions en temps réel.</p>
        <Link href="/espace/academie/assistant" className="inline-block rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50 transition shadow">
          Parler au Coach IA →
        </Link>
      </div>
    </div>
  );
}

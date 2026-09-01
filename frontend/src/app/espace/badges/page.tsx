import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { getNetwork } from "@/lib/metrics";

export const dynamic = "force-dynamic";

const PLACEHOLDER_BADGES = [
  { slug: "first-sale",    icon: "🎯", title: "Première vente",       description: "Enregistrez votre toute première vente confirmée.",     condition: "1 vente confirmée",   category: "ventes",   salesNeeded: 1,  directNeeded: 0,  statuses: [] },
  { slug: "sales-10",      icon: "🔟", title: "10 ventes",             description: "Atteignez 10 ventes confirmées.",                       condition: "10 ventes confirmées", category: "ventes",   salesNeeded: 10, directNeeded: 0,  statuses: [] },
  { slug: "sales-50",      icon: "🚀", title: "50 ventes",             description: "Atteignez 50 ventes confirmées.",                       condition: "50 ventes confirmées", category: "ventes",   salesNeeded: 50, directNeeded: 0,  statuses: [] },
  { slug: "status-gold",   icon: "⭐", title: "Ambassadeur Gold",      description: "Atteignez le statut Gold.",                             condition: "Statut Gold",          category: "statuts",  salesNeeded: 0,  directNeeded: 0,  statuses: ["GOLD","MASTER","ELITE"] },
  { slug: "status-master", icon: "🏆", title: "Master Partner",        description: "Atteignez le statut Master.",                           condition: "Statut Master",         category: "statuts",  salesNeeded: 0,  directNeeded: 0,  statuses: ["MASTER","ELITE"] },
  { slug: "status-elite",  icon: "👑", title: "Elite Représentant",    description: "Atteignez le statut Elite.",                            condition: "Statut Elite",          category: "statuts",  salesNeeded: 0,  directNeeded: 0,  statuses: ["ELITE"] },
  { slug: "team-10",       icon: "👥", title: "Bâtisseur d'équipe",    description: "Recrutez 10 filleuls directs.",                         condition: "10 filleuls directs",   category: "reseau",   salesNeeded: 0,  directNeeded: 10, statuses: [] },
];

const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  ventes:  { label: "Ventes",  icon: "💼", color: "from-blue-600 to-blue-700" },
  statuts: { label: "Statuts", icon: "⭐", color: "from-amber-500 to-orange-500" },
  reseau:  { label: "Réseau",  icon: "👥", color: "from-violet-600 to-purple-700" },
};

const EARNED_GRADIENT: Record<string, string> = {
  ventes:  "from-blue-50 to-indigo-50 border-blue-200 ring-blue-100",
  statuts: "from-amber-50 to-orange-50 border-amber-200 ring-amber-100",
  reseau:  "from-violet-50 to-purple-50 border-violet-200 ring-violet-100",
};

function formatDate(date: Date) {
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

type DbBadge = { id: string; slug: string; title: string; description: string; icon: string; condition: string; createdAt: Date };
type UserBadge = { id: string; userId: string; badgeId: string; earnedAt: Date; badge: DbBadge };

export default async function BadgesPage() {
  const currentUser = await requireUser();

  const [allBadges, earned, salesCount, networkRaw] = await Promise.all([
    (prisma as any).badge.findMany({ orderBy: { createdAt: "asc" } }) as Promise<DbBadge[]>,
    (prisma as any).userBadge.findMany({ where: { userId: currentUser.id }, include: { badge: true } }) as Promise<UserBadge[]>,
    prisma.sale.count({ where: { sellerId: currentUser.id, status: "CONFIRMED" } }),
    getNetwork(currentUser.id),
  ]);

  const directCount = networkRaw.filter((m: any) => m.level === 1).length;

  const usePlaceholders = allBadges.length === 0;
  const badges = usePlaceholders ? PLACEHOLDER_BADGES : allBadges.map((b) => ({
    ...b,
    category: PLACEHOLDER_BADGES.find((p) => p.slug === b.slug)?.category ?? "ventes",
    salesNeeded:  PLACEHOLDER_BADGES.find((p) => p.slug === b.slug)?.salesNeeded ?? 0,
    directNeeded: PLACEHOLDER_BADGES.find((p) => p.slug === b.slug)?.directNeeded ?? 0,
    statuses:     PLACEHOLDER_BADGES.find((p) => p.slug === b.slug)?.statuses ?? [],
  }));

  const earnedIds = new Set(earned.map((e) => e.badge.id));
  const earnedBySlug = new Map(earned.map((e) => [e.badge.slug, e]));
  const earnedCount = usePlaceholders ? 0 : earned.length;
  const totalCount  = badges.length;
  const progressPct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  const isEarned = (b: typeof badges[0]) => {
    if (usePlaceholders) {
      if (b.salesNeeded > 0)  return salesCount >= b.salesNeeded;
      if (b.directNeeded > 0) return directCount >= b.directNeeded;
      if (b.statuses.length > 0) return (b.statuses as string[]).includes(currentUser.status);
    }
    return earnedIds.has((b as any).id);
  };

  const earnedReal  = badges.filter((b) => isEarned(b));
  const lockedBadges = badges.filter((b) => !isEarned(b));

  // Find the "next closest" locked badge
  const nextBadge = lockedBadges.find((b) => b.salesNeeded > 0 && salesCount < b.salesNeeded)
    ?? lockedBadges.find((b) => b.directNeeded > 0 && directCount < b.directNeeded)
    ?? lockedBadges[0] ?? null;

  const categories = ["ventes", "statuts", "reseau"] as const;

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Badges & Récompenses"
        subtitle="Collectionnez des badges en accomplissant vos objectifs IBIG PARTNERS."
      />

      {/* ── KPIs ── */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-100">Badges obtenus</p>
          <p className="mt-1 text-3xl font-extrabold">{usePlaceholders ? earnedReal.length : earnedCount}</p>
          <p className="mt-0.5 text-xs text-amber-100">sur {totalCount} disponibles</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-200">Complétion</p>
          <p className="mt-1 text-3xl font-extrabold">{usePlaceholders ? Math.round((earnedReal.length / totalCount) * 100) : progressPct}%</p>
          <p className="mt-0.5 text-xs text-blue-200">{lockedBadges.length} badge{lockedBadges.length !== 1 ? "s" : ""} restant{lockedBadges.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">Prochain badge</p>
          {nextBadge ? (
            <>
              <p className="mt-1 text-2xl">{nextBadge.icon}</p>
              <p className="mt-0.5 text-xs text-slate-300 font-semibold truncate">{nextBadge.title}</p>
            </>
          ) : (
            <p className="mt-1 text-sm font-bold text-emerald-400">Tous obtenus ! 🎉</p>
          )}
        </div>
      </div>

      {/* ── Barre de progression globale ── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-slate-700">Progression globale</p>
          <p className="text-sm font-bold text-slate-800">
            {usePlaceholders ? earnedReal.length : earnedCount} / {totalCount}
          </p>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
            style={{ width: `${usePlaceholders ? Math.round((earnedReal.length / totalCount) * 100) : progressPct}%` }}
          />
        </div>
        {nextBadge && nextBadge.salesNeeded > 0 && (
          <p className="mt-2 text-xs text-slate-400">
            Ventes : <strong className="text-slate-700">{salesCount}</strong> / {nextBadge.salesNeeded} pour débloquer <strong>{nextBadge.title}</strong>
          </p>
        )}
        {nextBadge && nextBadge.directNeeded > 0 && (
          <p className="mt-2 text-xs text-slate-400">
            Filleuls N1 : <strong className="text-slate-700">{directCount}</strong> / {nextBadge.directNeeded} pour débloquer <strong>{nextBadge.title}</strong>
          </p>
        )}
      </div>

      {/* ── Badges par catégorie ── */}
      {categories.map((cat) => {
        const catBadges  = badges.filter((b) => b.category === cat);
        const catEarned  = catBadges.filter((b) => isEarned(b));
        const meta       = CATEGORY_META[cat];
        if (catBadges.length === 0) return null;

        return (
          <div key={cat} className="space-y-3">
            {/* Header catégorie */}
            <div className="flex items-center gap-3">
              <div className={`rounded-xl bg-gradient-to-r ${meta.color} px-4 py-1.5 flex items-center gap-2`}>
                <span className="text-lg">{meta.icon}</span>
                <span className="font-bold text-white text-sm">{meta.label}</span>
              </div>
              <span className="text-xs text-slate-400 font-semibold">{catEarned.length}/{catBadges.length} obtenus</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {catBadges.map((badge, i) => {
                const earned_ = isEarned(badge);
                const userBadge = earnedBySlug.get(badge.slug);
                const pctSales  = badge.salesNeeded > 0  ? Math.min(100, Math.round((salesCount / badge.salesNeeded) * 100))  : null;
                const pctDirect = badge.directNeeded > 0 ? Math.min(100, Math.round((directCount / badge.directNeeded) * 100)) : null;
                const pct       = pctSales ?? pctDirect;

                if (earned_) {
                  return (
                    <div
                      key={badge.slug ?? (badge as any).id ?? i}
                      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 text-center shadow-sm ring-1 ${EARNED_GRADIENT[cat] ?? "from-amber-50 to-orange-50 border-amber-200 ring-amber-100"}`}
                    >
                      <div className="absolute -top-4 -right-4 h-14 w-14 rounded-full bg-white/40 blur-md" />
                      <div className="text-5xl mb-3 drop-shadow-sm">{badge.icon}</div>
                      <h3 className="font-bold text-slate-800 text-sm mb-1">{badge.title}</h3>
                      <p className="text-xs text-slate-500 mb-3 leading-relaxed">{badge.description}</p>
                      <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold">
                        ✅ {userBadge ? `Obtenu le ${formatDate(new Date(userBadge.earnedAt))}` : "Obtenu"}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={badge.slug ?? (badge as any).id ?? i}
                    className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm"
                  >
                    <div className="text-5xl mb-3 grayscale opacity-30">{badge.icon}</div>
                    <h3 className="font-semibold text-slate-600 text-sm mb-1">{badge.title}</h3>
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">{badge.description}</p>

                    {/* Progress bar si on peut mesurer */}
                    {pct !== null && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1 text-[10px] text-slate-400">
                          <span>Progression</span>
                          <span className="font-bold text-slate-600">
                            {badge.salesNeeded > 0 ? `${salesCount}/${badge.salesNeeded}` : `${directCount}/${badge.directNeeded}`}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-violet-500 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold">
                      🔒 {badge.condition}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ── Motivation ── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3">
          <h3 className="font-semibold text-white text-sm">🎯 Comment débloquer plus de badges</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {[
            { icon: "💼", title: "Réalisez des ventes", desc: "Chaque vente confirmée vous rapproche des badges Ventes. Partagez vos liens d'affiliation ou déclarez vos ventes manuelles.", link: "/espace/ventes", linkLabel: "Mes ventes →" },
            { icon: "👥", title: "Recrutez des filleuls", desc: "Partagez votre lien de parrainage pour recruter des partenaires dans votre réseau.", link: "/espace/reseau", linkLabel: "Mon réseau →" },
            { icon: "📈", title: "Progressez en statut", desc: "Les statuts Gold, Master et Elite débloquent des badges exclusifs. Consultez les critères dans Formation.", link: "/espace/formation", linkLabel: "Voir les statuts →" },
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-4 px-5 py-4">
              <span className="text-2xl shrink-0">{tip.icon}</span>
              <div>
                <p className="font-semibold text-sm text-slate-800">{tip.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{tip.desc}</p>
                <Link href={tip.link} className="mt-1 inline-block text-xs font-bold text-blue-600 hover:underline">{tip.linkLabel}</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

// Placeholder badges shown when the DB has none yet
const PLACEHOLDER_BADGES = [
  { slug: "first-sale",    icon: "🎯", title: "Première vente",      description: "Enregistrez votre toute première vente confirmée.", condition: "1 vente confirmée" },
  { slug: "sales-10",      icon: "🔟", title: "10 ventes",            description: "Atteignez 10 ventes confirmées.",                   condition: "10 ventes confirmées" },
  { slug: "sales-50",      icon: "🚀", title: "50 ventes",            description: "Atteignez 50 ventes confirmées.",                   condition: "50 ventes confirmées" },
  { slug: "status-gold",   icon: "⭐", title: "Ambassadeur Gold",     description: "Atteignez le statut Gold.",                         condition: "Statut Gold" },
  { slug: "status-master", icon: "🏆", title: "Master Partner",       description: "Atteignez le statut Master.",                       condition: "Statut Master" },
  { slug: "status-elite",  icon: "👑", title: "Elite Représentant",   description: "Atteignez le statut Elite.",                        condition: "Statut Elite" },
  { slug: "team-10",       icon: "👥", title: "Bâtisseur d'équipe",   description: "Recrutez 10 filleuls directs.",                     condition: "10 filleuls directs" },
];

type DbBadge = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  condition: string;
  createdAt: Date;
};

type UserBadge = {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
  badge: DbBadge;
};

function formatDate(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function BadgesPage() {
  const currentUser = await requireUser();

  const allBadges: DbBadge[] = await (prisma as any).badge.findMany({
    orderBy: { createdAt: "asc" },
  });

  const earned: UserBadge[] = await (prisma as any).userBadge.findMany({
    where: { userId: currentUser.id },
    include: { badge: true },
  });

  const earnedIds = new Set(earned.map((e: UserBadge) => e.badge.id));
  const earnedByBadgeId = new Map(earned.map((e: UserBadge) => [e.badge.id, e]));

  const usePlaceholders = allBadges.length === 0;
  const totalCount = usePlaceholders ? PLACEHOLDER_BADGES.length : allBadges.length;
  const earnedCount = earned.length;
  const progressPct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes Badges & Récompenses"
        subtitle="Collectionnez des badges en accomplissant des objectifs IBIG PARTNERS"
      />

      {/* Stats & progress bar */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-5">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-800">{earnedCount}</p>
              <p className="text-xs text-slate-500 font-medium">obtenus</p>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-400">{totalCount}</p>
              <p className="text-xs text-slate-500 font-medium">disponibles</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-700">
              {progressPct}% complété
            </p>
          </div>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-400">
          {totalCount - earnedCount} badge{totalCount - earnedCount !== 1 ? "s" : ""} restant
          {totalCount - earnedCount !== 1 ? "s" : ""} à débloquer
        </p>
      </Card>

      {/* Badges grid */}
      {usePlaceholders ? (
        <>
          <p className="text-sm text-slate-500 text-center">
            Les badges seront disponibles prochainement. Voici un aperçu de ce qui vous attend :
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {PLACEHOLDER_BADGES.map((badge) => (
              <div
                key={badge.slug}
                className="relative overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center opacity-60"
              >
                <div className="text-4xl mb-3 grayscale">{badge.icon}</div>
                <h3 className="font-semibold text-slate-700 text-sm mb-1">
                  {badge.title}
                </h3>
                <p className="text-xs text-slate-400 mb-3">{badge.description}</p>
                <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                  🔒 Bientôt disponible
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allBadges.map((badge: DbBadge) => {
            const isEarned = earnedIds.has(badge.id);
            const userBadge = earnedByBadgeId.get(badge.id);

            if (isEarned) {
              return (
                <div
                  key={badge.id}
                  className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 text-center shadow-sm ring-1 ring-amber-100"
                >
                  {/* Earned glow */}
                  <div className="absolute -top-3 -right-3 h-12 w-12 rounded-full bg-amber-200/40 blur-md" />
                  <div className="text-4xl mb-3">{badge.icon}</div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1">
                    {badge.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">{badge.description}</p>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">
                    ✅ Obtenu le{" "}
                    {userBadge ? formatDate(new Date(userBadge.earnedAt)) : "—"}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={badge.id}
                className="relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center opacity-40 grayscale"
              >
                <div className="text-4xl mb-3 blur-[1px]">{badge.icon}</div>
                <h3 className="font-semibold text-slate-600 text-sm mb-1">
                  {badge.title}
                </h3>
                <p className="text-xs text-slate-400 mb-3">{badge.description}</p>
                <div className="space-y-1">
                  <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                    🔒 Verrouillé
                  </span>
                  {badge.condition && (
                    <p className="text-xs text-slate-400">{badge.condition}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {earned.length === 0 && !usePlaceholders && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-400">
          Vous n&apos;avez pas encore de badges. Commencez à vendre pour en débloquer !
        </div>
      )}
    </div>
  );
}

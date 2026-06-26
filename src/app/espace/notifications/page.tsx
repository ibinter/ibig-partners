import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Button, Card, EmptyState, PageHeader } from "@/components/ui";
import { markAllRead, markOneRead } from "./actions";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await requireUser();

  const notifications = await prisma.notification.findMany({
    where: {
      OR: [{ userId: null }, { userId: user.id }],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Les notifs globales sont toujours affichées comme "informations" (pas de statut lu/non-lu)
  // Seules les notifs personnelles (userId = user.id) ont un vrai état lu/non-lu
  const unread = notifications.filter((n) => n.userId === user.id && !n.read).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <PageHeader
          title="Notifications"
          subtitle={unread > 0 ? `${unread} non lue${unread > 1 ? "s" : ""}` : "Tout est à jour"}
        />
        {unread > 0 && (
          <form action={markAllRead}>
            <Button type="submit" variant="ghost">Tout marquer comme lu</Button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState>Aucune notification pour le moment.</EmptyState>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const isGlobal = n.userId === null;
            const isUnread = !isGlobal && !n.read;
            return (
              <div
                key={n.id}
                className={`card flex items-start justify-between gap-4 ${isUnread ? "border-brand-200 bg-brand-50/30" : ""}`}
              >
                <div className="flex gap-3">
                  <span className="mt-0.5 text-xl">
                    {isGlobal ? "📢" : isUnread ? "🔴" : "🔔"}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ink">{n.title}</p>
                      {isGlobal && (
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                          Annonce
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted leading-relaxed">{n.body}</p>
                    <p className="mt-2 text-xs text-muted">{formatDate(n.createdAt)}</p>
                  </div>
                </div>
                {isUnread && (
                  <form action={markOneRead} className="shrink-0">
                    <input type="hidden" name="id" value={n.id} />
                    <Button type="submit" variant="ghost">Lu</Button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

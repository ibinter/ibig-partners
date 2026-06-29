import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Button, EmptyState, PageHeader } from "@/components/ui";
import { markAllRead, markOneRead } from "./actions";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await requireUser();

  const notifications = await prisma.notification.findMany({
    where: { OR: [{ userId: null }, { userId: user.id }] },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unread = notifications.filter((n) => n.userId === user.id && !n.read).length;

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <PageHeader
          title="Notifications"
          subtitle={unread > 0 ? `${unread} non lue${unread > 1 ? "s" : ""}` : "Tout est à jour"}
        />
        {unread > 0 && (
          <form action={markAllRead} className="shrink-0 mb-6">
            <Button type="submit" variant="secondary">✓ Tout marquer comme lu</Button>
          </form>
        )}
      </div>

      {/* Counter badges */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 p-4 text-white shadow-md">
          <p className="text-xs font-semibold text-rose-200 uppercase tracking-wide">Non lues</p>
          <p className="text-2xl font-bold mt-1">{unread}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-md">
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold mt-1">{notifications.length}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 p-4 text-white shadow-md">
          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Annonces</p>
          <p className="text-2xl font-bold mt-1">{notifications.filter(n => n.userId === null).length}</p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <EmptyState>Aucune notification pour le moment.</EmptyState>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const isGlobal = n.userId === null;
            const isUnread = !isGlobal && !n.read;
            return (
              <div
                key={n.id}
                className={`rounded-2xl border p-4 flex items-start justify-between gap-4 transition-colors ${
                  isUnread
                    ? "border-blue-200 bg-blue-50/50"
                    : isGlobal
                    ? "border-amber-100 bg-amber-50/30"
                    : "border-slate-100 bg-white"
                } shadow-sm`}
              >
                <div className="flex gap-3">
                  <span className="text-xl shrink-0 mt-0.5">
                    {isGlobal ? "📢" : isUnread ? "🔔" : "✓"}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-ink">{n.title}</p>
                      {isGlobal && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                          Annonce
                        </span>
                      )}
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
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

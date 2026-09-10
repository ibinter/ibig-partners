import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

async function markAllRead() {
  "use server";
  const user = await requireUser();
  try {
    await (prisma as any).notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
  } catch { /* ignore */ }
}

export default async function NotificationsPage() {
  const user = await requireUser();

  const notifications = await (async () => {
    try {
      return await (prisma as any).notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    } catch { return []; }
  })();

  const unread = notifications.filter((n: any) => !n.read).length;

  const typeConfig: Record<string, { icon: string; color: string; bg: string }> = {
    INFO: { icon: "ℹ️", color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-50 dark:bg-blue-900/20" },
    SUCCESS: { icon: "✅", color: "text-green-700 dark:text-green-300", bg: "bg-green-50 dark:bg-green-900/20" },
    WARNING: { icon: "⚠️", color: "text-yellow-700 dark:text-yellow-300", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
    MISSION: { icon: "🎯", color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-50 dark:bg-purple-900/20" },
    CP: { icon: "⭐", color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-900/20" },
    PAYMENT: { icon: "💰", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <PageHeader
          title="Notifications"
          subtitle={unread > 0 ? `${unread} notification${unread > 1 ? "s" : ""} non lue${unread > 1 ? "s" : ""}` : "Tout est à jour"}
        />
        {unread > 0 && (
          <form action={markAllRead}>
            <button type="submit" className="text-sm text-blue-600 hover:underline">
              Tout marquer comme lu
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="text-4xl mb-3">🔔</div>
          <p className="text-gray-500">Aucune notification pour le moment.</p>
          <p className="text-sm text-gray-400 mt-1">Vous serez notifié des nouvelles missions, CP crédités et paiements.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n: any) => {
            const cfg = typeConfig[n.category as string] || typeConfig.INFO;
            return (
              <div
                key={n.id}
                className={`rounded-xl border p-4 flex gap-4 transition-colors ${
                  n.read
                    ? "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    : `${cfg.bg} border-transparent`
                }`}
              >
                <span className="text-2xl flex-shrink-0">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold ${n.read ? "" : cfg.color}`}>{n.title}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{n.body}</p>
                  <div className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</div>
                </div>
                {!n.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

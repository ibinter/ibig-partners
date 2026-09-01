import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import NotifListClient, { type NotifRow } from "./notif-list-client";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await requireUser();

  const notifications = await prisma.notification.findMany({
    where: { OR: [{ userId: null }, { userId: user.id }] },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const unread     = notifications.filter((n) => n.userId !== null && !n.read).length;
  const globalCount = notifications.filter((n) => n.userId === null).length;
  const total      = notifications.length;

  const rows: NotifRow[] = notifications.map((n) => ({
    id:        n.id,
    title:     n.title,
    body:      n.body,
    url:       n.url ?? null,
    read:      n.read,
    isGlobal:  n.userId === null,
    createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : String(n.createdAt),
  }));

  return (
    <div className="space-y-5 pb-10">
      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} non lue${unread > 1 ? "s" : ""}` : "Tout est à jour ✓"}
      />

      {/* ── KPIs ── */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className={`rounded-2xl p-4 text-white shadow-sm ${unread > 0 ? "bg-gradient-to-br from-rose-500 to-rose-600" : "bg-gradient-to-br from-emerald-600 to-teal-600"}`}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">Non lues</p>
          <p className="mt-1 text-2xl font-extrabold">{unread}</p>
          <p className="mt-0.5 text-xs text-white/60">{unread === 0 ? "tout lu ✓" : `à consulter`}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-200">Total</p>
          <p className="mt-1 text-2xl font-extrabold">{total}</p>
          <p className="mt-0.5 text-xs text-blue-200">notifications reçues</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-100">Annonces</p>
          <p className="mt-1 text-2xl font-extrabold">{globalCount}</p>
          <p className="mt-0.5 text-xs text-amber-100">de l&apos;équipe IBIG</p>
        </div>
      </div>

      {/* ── Liste filtrée (client) ── */}
      {total === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
          <p className="text-5xl mb-4">🔔</p>
          <p className="text-sm font-semibold text-slate-500">Aucune notification pour le moment</p>
          <p className="text-xs text-slate-400 mt-1">Vous serez notifié lors de ventes confirmées, versements, messages et annonces.</p>
        </div>
      ) : (
        <NotifListClient rows={rows} unreadCount={unread} />
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import ActivitesClient from "./activites-client";

export default async function ActivitesPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; userId?: string; page?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page || 1));
  const pageSize = 50;

  const where: Record<string, unknown> = {};
  if (sp.action) where.action = sp.action;
  if (sp.userId) where.userId = sp.userId;

  const [logs, total] = await Promise.all([
    (prisma as any).activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { firstName: true, lastName: true, email: true, code: true } },
      },
    }),
    (prisma as any).activityLog.count({ where }),
  ]);

  // Stats synthèse
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [loginsToday, salesToday, totalUsers, activeToday] = await Promise.all([
    (prisma as any).activityLog.count({ where: { action: "LOGIN", createdAt: { gte: today } } }),
    (prisma as any).activityLog.count({ where: { action: "SALE_DECLARED", createdAt: { gte: today } } }),
    prisma.user.count({ where: { role: "PARTNER" } }),
    (prisma as any).activityLog.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: today }, userId: { not: null } },
      _count: true,
    }).then((r: any[]) => r.length),
  ]);

  // Actions distinctes pour le filtre
  const actionGroups = await (prisma as any).activityLog.groupBy({
    by: ["action"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  // Top partenaires actifs (7 derniers jours)
  const since7d = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const topActive = await (prisma as any).activityLog.groupBy({
    by: ["userId"],
    where: { userId: { not: null }, createdAt: { gte: since7d } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });

  const topWithNames = await Promise.all(
    topActive.map(async (r: any) => {
      const u = await prisma.user.findUnique({
        where: { id: r.userId },
        select: { firstName: true, lastName: true, email: true, code: true },
      });
      return { ...r, user: u };
    })
  );

  return (
    <ActivitesClient
      logs={logs}
      total={total}
      page={page}
      pageSize={pageSize}
      filterAction={sp.action}
      filterUserId={sp.userId}
      actionGroups={actionGroups}
      stats={{ loginsToday, salesToday, totalUsers, activeToday }}
      topActive={topWithNames}
    />
  );
}

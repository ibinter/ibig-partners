import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import StatistiquesClient from "./statistiques-client";

export const dynamic = "force-dynamic";

export default async function StatistiquesPage() {
  await requireAdmin();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const months6: { label: string; start: Date; end: Date }[] = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    months6.push({ label: start.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }), start, end });
  }

  const [totalPartners, activePartners, totalSales, monthlySales] = await Promise.all([
    prisma.user.count({ where: { role: "PARTNER" } }),
    prisma.user.count({ where: { role: "PARTNER", approved: true } }),
    prisma.sale.count(),
    prisma.sale.count({ where: { createdAt: { gte: startOfMonth } } }),
  ]);

  const [totalRevenue, monthlyRevenue] = await Promise.all([
    (async () => { try { const r = await prisma.sale.aggregate({ _sum: { amount: true } }); return Number(r._sum.amount ?? 0); } catch { return 0; } })(),
    (async () => { try { const r = await prisma.sale.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: startOfMonth } } }); return Number(r._sum.amount ?? 0); } catch { return 0; } })(),
  ]);

  const [totalMissions, openMissions, totalViews] = await Promise.all([
    (async () => { try { return await (prisma as any).mission.count(); } catch { return 0; } })(),
    (async () => { try { return await (prisma as any).mission.count({ where: { status: "OPEN", validationStatus: "VALIDATED" } }); } catch { return 0; } })(),
    (async () => { try { const r = await (prisma as any).mission.aggregate({ _sum: { viewCount: true } }); return Number(r._sum.viewCount ?? 0); } catch { return 0; } })(),
  ]);

  const cpStats = await (async () => {
    try {
      const txs = await (prisma as any).pointTransaction.findMany({ select: { points: true, type: true } });
      const credited = txs.filter((t: any) => ["CREDIT", "BONUS"].includes(t.type)).reduce((s: number, t: any) => s + t.points, 0);
      const debited = txs.filter((t: any) => t.type === "DEBIT").reduce((s: number, t: any) => s + t.points, 0);
      return { credited, debited, net: credited - debited, count: txs.length };
    } catch { return { credited: 0, debited: 0, net: 0, count: 0 }; }
  })();

  const partnerGrowth = await Promise.all(
    months6.map(async (m) => ({
      label: m.label,
      count: await prisma.user.count({ where: { role: "PARTNER", createdAt: { gte: m.start, lt: m.end } } }),
    }))
  );

  const salesGrowth = await Promise.all(
    months6.map(async (m) => {
      const [count, rev] = await Promise.all([
        prisma.sale.count({ where: { createdAt: { gte: m.start, lt: m.end } } }),
        (async () => { try { const r = await prisma.sale.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: m.start, lt: m.end } } }); return Number(r._sum.amount ?? 0); } catch { return 0; } })(),
      ]);
      return { label: m.label, count, revenue: rev };
    })
  );

  const missionsByStatus = await (async () => {
    try {
      const stats = await (prisma as any).mission.groupBy({ by: ["status"], _count: { id: true } });
      return stats.map((s: any) => ({ status: s.status, count: s._count.id }));
    } catch { return []; }
  })();

  const topMissions = await (async () => {
    try {
      return await (prisma as any).mission.findMany({
        select: { title: true, viewCount: true, status: true },
        orderBy: { viewCount: "desc" },
        take: 5,
        where: { viewCount: { gt: 0 } },
      });
    } catch { return []; }
  })();

  const topPartners = await (async () => {
    try {
      const sales = await prisma.sale.groupBy({ by: ["sellerId"], _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 5 });
      return Promise.all(sales.map(async (s: any) => {
        const user = await prisma.user.findUnique({ where: { id: s.sellerId }, select: { firstName: true, lastName: true, code: true } });
        return { name: user ? `${user.firstName} ${user.lastName}` : "—", code: user?.code ?? "", count: s._count.id };
      }));
    } catch { return []; }
  })();

  // Visites du site
  const [totalVisits, todayVisits, monthVisits] = await Promise.all([
    (async () => { try { return await (prisma as any).pageView.count(); } catch { return 0; } })(),
    (async () => { try { const t = new Date(); t.setHours(0,0,0,0); return await (prisma as any).pageView.count({ where: { createdAt: { gte: t } } }); } catch { return 0; } })(),
    (async () => { try { return await (prisma as any).pageView.count({ where: { createdAt: { gte: startOfMonth } } }); } catch { return 0; } })(),
  ]);

  // Visites par jour (7 derniers jours)
  const visitsByDay: { label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const start = new Date(); start.setDate(start.getDate() - i); start.setHours(0,0,0,0);
    const end = new Date(start); end.setDate(end.getDate() + 1);
    const count = await (async () => { try { return await (prisma as any).pageView.count({ where: { createdAt: { gte: start, lt: end } } }); } catch { return 0; } })();
    visitsByDay.push({ label: start.toLocaleDateString("fr-FR", { weekday: "short" }), count });
  }

  // Opportunités
  const [totalOpportunities, newOpportunities, approvedOpportunities] = await Promise.all([
    (async () => { try { return await (prisma as any).opportunity.count(); } catch { return 0; } })(),
    (async () => { try { return await (prisma as any).opportunity.count({ where: { status: "NEW" } }); } catch { return 0; } })(),
    (async () => { try { return await (prisma as any).opportunity.count({ where: { status: "APPROVED" } }); } catch { return 0; } })(),
  ]);

  // Partenaires par statut
  const partnersByStatus = await (async () => {
    try {
      const stats = await prisma.user.groupBy({ by: ["status"], where: { role: "PARTNER" }, _count: { id: true } });
      return stats.map((s: any) => ({ label: s.status, count: s._count.id }));
    } catch { return []; }
  })();

  // Payouts
  const [totalPaid, pendingPayout] = await Promise.all([
    (async () => { try { const r = await prisma.payout.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }); return Number(r._sum.amount ?? 0); } catch { return 0; } })(),
    (async () => { try { const r = await prisma.payout.aggregate({ _sum: { amount: true }, where: { status: { in: ["PENDING", "PROCESSING"] } } }); return Number(r._sum.amount ?? 0); } catch { return 0; } })(),
  ]);

  // Pages les plus visitées (top 5)
  const topPages = await (async () => {
    try {
      const rows = await (prisma as any).pageView.groupBy({
        by: ["path"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      });
      return rows.map((r: any) => ({ path: r.path, count: r._count.id }));
    } catch { return []; }
  })();

  const initial = {
    kpis: { totalPartners, activePartners, totalSales, monthlySales, totalRevenue, monthlyRevenue, totalMissions, openMissions, totalViews, cpStats, totalVisits, todayVisits, monthVisits, totalOpportunities, newOpportunities, approvedOpportunities, totalPaid, pendingPayout },
    partnerGrowth,
    salesGrowth,
    missionsByStatus,
    topMissions,
    topPartners,
    visitsByDay,
    partnersByStatus,
    topPages,
    updatedAt: now.toISOString(),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statistiques globales"
        subtitle="Vue en temps réel — mise à jour automatique toutes les 30 secondes"
      />
      <StatistiquesClient initial={initial} />
    </div>
  );
}

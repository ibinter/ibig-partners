import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Build last 6 months labels
  const months6: { label: string; start: Date; end: Date }[] = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const label = start.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    months6.push({ label, start, end });
  }

  const [
    totalPartners,
    activePartners,
    totalSales,
    monthlySales,
    monthlyRevenue,
    totalRevenue,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "PARTNER" } }),
    prisma.user.count({ where: { role: "PARTNER", approved: true } }),
    prisma.sale.count(),
    prisma.sale.count({ where: { createdAt: { gte: startOfMonth } } }),
    (async () => {
      try {
        const r = await prisma.sale.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: startOfMonth } } });
        return Number(r._sum.amount ?? 0);
      } catch { return 0; }
    })(),
    (async () => {
      try {
        const r = await prisma.sale.aggregate({ _sum: { amount: true } });
        return Number(r._sum.amount ?? 0);
      } catch { return 0; }
    })(),
  ]);

  // Monthly partner growth
  const partnerGrowth = await Promise.all(
    months6.map(async (m) => ({
      label: m.label,
      count: await prisma.user.count({ where: { role: "PARTNER", createdAt: { gte: m.start, lt: m.end } } }),
    }))
  );

  // Monthly sales volume + revenue
  const salesGrowth = await Promise.all(
    months6.map(async (m) => {
      const [count, rev] = await Promise.all([
        prisma.sale.count({ where: { createdAt: { gte: m.start, lt: m.end } } }),
        (async () => {
          try {
            const r = await prisma.sale.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: m.start, lt: m.end } } });
            return Number(r._sum.amount ?? 0);
          } catch { return 0; }
        })(),
      ]);
      return { label: m.label, count, revenue: rev };
    })
  );

  // Mission stats
  const [totalMissions, openMissions, totalViews, missionsByStatus] = await Promise.all([
    (async () => { try { return await (prisma as any).mission.count(); } catch { return 0; } })(),
    (async () => { try { return await (prisma as any).mission.count({ where: { status: "OPEN", validationStatus: "VALIDATED" } }); } catch { return 0; } })(),
    (async () => {
      try {
        const r = await (prisma as any).mission.aggregate({ _sum: { viewCount: true } });
        return Number(r._sum.viewCount ?? 0);
      } catch { return 0; }
    })(),
    (async () => {
      try {
        const stats = await (prisma as any).mission.groupBy({ by: ["status"], _count: { id: true } });
        return stats.map((s: any) => ({ status: s.status, count: s._count.id }));
      } catch { return []; }
    })(),
  ]);

  // CP stats
  const cpStats = await (async () => {
    try {
      const txs = await (prisma as any).pointTransaction.findMany({ select: { points: true, type: true } });
      const credited = txs.filter((t: any) => ["CREDIT", "BONUS"].includes(t.type)).reduce((s: number, t: any) => s + t.points, 0);
      const debited = txs.filter((t: any) => t.type === "DEBIT").reduce((s: number, t: any) => s + t.points, 0);
      return { credited, debited, net: credited - debited, count: txs.length };
    } catch { return { credited: 0, debited: 0, net: 0, count: 0 }; }
  })();

  // Top missions by views
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

  // Top partners by sales
  const topPartners = await (async () => {
    try {
      const sales = await prisma.sale.groupBy({ by: ["sellerId"], _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 5 });
      return Promise.all(sales.map(async (s: any) => {
        const user = await prisma.user.findUnique({ where: { id: s.sellerId }, select: { firstName: true, lastName: true, code: true } });
        return { name: user ? `${user.firstName} ${user.lastName}` : "—", code: user?.code ?? "", count: s._count.id };
      }));
    } catch { return []; }
  })();

  return NextResponse.json({
    kpis: { totalPartners, activePartners, totalSales, monthlySales, totalRevenue, monthlyRevenue, totalMissions, openMissions, totalViews, cpStats },
    partnerGrowth,
    salesGrowth,
    missionsByStatus,
    topMissions,
    topPartners,
    updatedAt: now.toISOString(),
  });
}

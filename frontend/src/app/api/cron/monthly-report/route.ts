import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sendMonthlyReportEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: Request) {
  const hdrs = await headers();
  const secret = hdrs.get("authorization")?.replace("Bearer ", "") ?? hdrs.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthEnd   = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevStart  = new Date(now.getFullYear(), now.getMonth() - 2, 1);

  const monthLabel = monthStart.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const partners = await prisma.user.findMany({
    where: { approved: true, active: true, role: "PARTNER" },
    select: { id: true, email: true, firstName: true },
  });

  const totalPartners = partners.length;

  // Rang basé sur ventes confirmées du mois
  const salesAllMonth = await prisma.sale.groupBy({
    by: ["sellerId"],
    where: { status: "CONFIRMED", createdAt: { gte: monthStart, lt: monthEnd } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  const rankMap = new Map<string, number>();
  salesAllMonth.forEach((s, i) => rankMap.set(s.sellerId, i + 1));

  let sent = 0;

  for (const partner of partners) {
    const [salesMonth, salesPrev, commissions, pendingPayout, topProductRaw] = await Promise.all([
      prisma.sale.count({
        where: { sellerId: partner.id, status: "CONFIRMED", createdAt: { gte: monthStart, lt: monthEnd } },
      }),
      prisma.sale.count({
        where: { sellerId: partner.id, status: "CONFIRMED", createdAt: { gte: prevStart, lt: monthStart } },
      }),
      prisma.commission.aggregate({
        where: { userId: partner.id, status: { in: ["VALIDATED", "PENDING"] }, createdAt: { gte: monthStart, lt: monthEnd } },
        _sum: { amount: true },
      }),
      prisma.commission.aggregate({
        where: { userId: partner.id, status: "VALIDATED", payoutId: null },
        _sum: { amount: true },
      }),
      prisma.sale.groupBy({
        by: ["productId"],
        where: { sellerId: partner.id, status: "CONFIRMED", createdAt: { gte: monthStart, lt: monthEnd } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 1,
      }),
    ]);

    let topProduct: string | null = null;
    if (topProductRaw.length > 0) {
      const prod = await prisma.product.findUnique({
        where: { id: topProductRaw[0].productId },
        select: { name: true },
      });
      topProduct = prod?.name ?? null;
    }

    const result = await sendMonthlyReportEmail({
      to: partner.email,
      firstName: partner.firstName ?? "Partenaire",
      month: monthLabel,
      commissionsTotal: commissions._sum.amount ?? 0,
      salesCount: salesMonth,
      salesCountPrev: salesPrev,
      rank: rankMap.get(partner.id) ?? totalPartners,
      totalPartners,
      topProduct,
      pendingPayout: pendingPayout._sum.amount ?? 0,
    });

    if (result.ok) sent++;
  }

  return NextResponse.json({ sent, total: partners.length, month: monthLabel });
}

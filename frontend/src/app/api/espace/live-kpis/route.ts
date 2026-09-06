import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [salesToday, salesMonth, commAgg, prospectsUrgent, unreadNotif] = await Promise.all([
    prisma.sale.count({ where: { sellerId: user.id, status: "CONFIRMED", createdAt: { gte: todayStart } } }),
    prisma.sale.count({ where: { sellerId: user.id, status: "CONFIRMED", createdAt: { gte: monthStart } } }),
    prisma.commission.aggregate({
      where: { userId: user.id, status: "PENDING" },
      _sum: { amount: true },
    }),
    prisma.prospect.count({
      where: { userId: user.id, reminderAt: { lte: new Date() }, status: { notIn: ["CONVERTED", "LOST"] } },
    }),
    prisma.notification.count({
      where: { read: false, OR: [{ userId: null }, { userId: user.id }] },
    }),
  ]);

  return NextResponse.json({
    salesToday,
    salesMonth,
    commPending: commAgg._sum.amount ?? 0,
    prospectsUrgent,
    unreadNotif,
    updatedAt: new Date().toISOString(),
  });
}

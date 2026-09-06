import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin();

  const now = new Date();
  const dayStart = new Date(now); dayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

  const [salesToday, salesMonth, commPending, pendingPartners, openTickets, pendingPayouts] = await Promise.all([
    prisma.sale.count({ where: { status: "CONFIRMED", createdAt: { gte: dayStart } } }),
    prisma.sale.aggregate({ where: { status: "CONFIRMED", createdAt: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.commission.aggregate({ where: { status: "PENDING" }, _sum: { amount: true } }),
    prisma.user.count({ where: { role: "PARTNER", approved: false, active: true } }),
    prisma.ticket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.payout.count({ where: { status: "PENDING" } }),
  ]);

  return NextResponse.json({
    salesToday,
    salesMonth: salesMonth._sum.amount ?? 0,
    commPending: commPending._sum.amount ?? 0,
    pendingPartners,
    openTickets,
    pendingPayouts,
    updatedAt: new Date().toISOString(),
  });
}

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getKpis() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [salesToday, salesMonth, commPending, pendingApprovals, openTickets, pendingPayouts] = await Promise.all([
    prisma.sale.count({ where: { createdAt: { gte: today }, status: "CONFIRMED" } }),
    prisma.sale.aggregate({ where: { createdAt: { gte: monthStart }, status: "CONFIRMED" }, _sum: { amount: true } }),
    prisma.commission.aggregate({ where: { status: "PENDING" }, _sum: { amount: true } }),
    prisma.user.count({ where: { role: "PARTNER", approved: false } }),
    prisma.ticket.count({ where: { status: "OPEN" } }),
    prisma.payout.count({ where: { status: "PENDING" } }),
  ]);

  return {
    salesToday,
    salesMonth: salesMonth._sum.amount ?? 0,
    commPending: commPending._sum.amount ?? 0,
    pendingApprovals,
    openTickets,
    pendingPayouts,
    ts: Date.now(),
  };
}

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = async () => {
        try {
          const kpis = await getKpis();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(kpis)}\n\n`));
        } catch { /* ignore */ }
      };
      await send();
      const interval = setInterval(send, 30000);
      // cleanup after 5 minutes max
      setTimeout(() => { clearInterval(interval); controller.close(); }, 300000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sendWeeklyDigestEmail } from "@/lib/email";
import { STATUS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Résumé hebdomadaire des affiliés — déclenché par un Vercel Cron Job.
 * Pour chaque affilié validé et actif, envoie un récap des 7 derniers jours
 * (ventes, commissions gagnées, statut) avec un coup de pouce s'il n'a rien fait.
 * Auth : `Authorization: Bearer <CRON_SECRET>` (ou en-tête `x-cron-secret`).
 */
export async function GET() {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET non configuré" }, { status: 503 });
  }

  const h = await headers();
  const auth = h.get("authorization");
  const x = h.get("x-cron-secret");
  if (auth !== `Bearer ${secret}` && x !== secret) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const affiliates = await prisma.user.findMany({
    where: { role: "PARTNER", approved: true, active: true },
    select: { id: true, email: true, firstName: true, status: true },
  });

  let sent = 0;
  let skipped = 0;

  for (const a of affiliates) {
    if (!a.email) {
      skipped++;
      continue;
    }
    const [salesAgg, commAgg] = await Promise.all([
      prisma.sale.aggregate({
        where: { sellerId: a.id, status: "CONFIRMED", createdAt: { gte: weekAgo } },
        _count: { _all: true },
        _sum: { amount: true },
      }),
      prisma.commission.aggregate({
        where: { userId: a.id, createdAt: { gte: weekAgo } },
        _sum: { amount: true },
      }),
    ]);

    const res = await sendWeeklyDigestEmail({
      to: a.email,
      firstName: a.firstName,
      salesCount: salesAgg._count._all,
      salesAmount: salesAgg._sum.amount ?? 0,
      commissionsAmount: commAgg._sum.amount ?? 0,
      statusLabel: STATUS_LABELS[a.status] ?? a.status,
    });
    if (res.ok) sent++;
    else skipped++;
  }

  return NextResponse.json({ ok: true, affiliates: affiliates.length, sent, skipped });
}

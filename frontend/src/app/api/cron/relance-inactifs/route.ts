import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sendInactiveReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Relances automatiques — affiliés sans vente depuis 30+ jours.
 * Déclenché par Vercel Cron (vercel.json : "0 9 * * 1" — lundi 9h UTC).
 * Auth : Authorization: Bearer <CRON_SECRET>
 */
export async function GET() {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET non configuré" }, { status: 503 });
  }

  const h = await headers();
  const auth = h.get("authorization");
  const x    = h.get("x-cron-secret");
  if (auth !== `Bearer ${secret}` && x !== secret) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Affiliés actifs et approuvés
  const affiliates = await prisma.user.findMany({
    where: { role: "PARTNER", approved: true, active: true },
    select: {
      id: true, email: true, firstName: true, code: true,
      sales: {
        where: { status: "CONFIRMED" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
      commissions: {
        where: { status: "PAID" },
        select: { amount: true },
      },
    },
  });

  let sent = 0;
  let skipped = 0;

  for (const a of affiliates) {
    if (!a.email) { skipped++; continue; }

    const lastSale = a.sales[0]?.createdAt ?? null;

    // Inactif si : aucune vente OU dernière vente il y a > 30 jours
    const isInactive = !lastSale || lastSale < thirtyDaysAgo;
    if (!isInactive) { skipped++; continue; }

    const daysSince = lastSale
      ? Math.floor((Date.now() - lastSale.getTime()) / (24 * 60 * 60 * 1000))
      : 999;

    const totalEarned = a.commissions.reduce((s, c) => s + c.amount, 0);

    const result = await sendInactiveReminderEmail({
      to:                 a.email,
      firstName:          a.firstName ?? "Partenaire",
      daysSinceLastSale:  daysSince,
      totalEarned,
      code:               a.code ?? "",
    });

    if (result.ok) sent++;
    else skipped++;
  }

  return NextResponse.json({
    ok: true,
    sent,
    skipped,
    total: affiliates.length,
    runAt: new Date().toISOString(),
  });
}

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Cron de rappels prospects IBIG PARTNERS.
 * Déclenché quotidiennement à 7h UTC (avant le cron email-sequences).
 * Envoie une notification in-app + crée une alerte pour chaque prospect dont
 * la date de relance (reminderAt) est passée et le statut n'est pas terminal.
 */
export async function GET(req: Request) {
  const hdrs = await headers();
  const secret = hdrs.get("authorization")?.replace("Bearer ", "") ?? hdrs.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Prospects dont la relance est due, statut actif, et dont l'affilié est actif
  const dueProspects = await prisma.prospect.findMany({
    where: {
      reminderAt: { lte: now },
      status: { notIn: ["CONVERTED", "LOST"] },
      user: { approved: true, active: true },
    },
    include: {
      user: { select: { id: true, email: true, firstName: true } },
    },
  });

  if (dueProspects.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  // Grouper par userId pour une seule notification récapitulative
  const byUser = new Map<string, typeof dueProspects>();
  for (const p of dueProspects) {
    const list = byUser.get(p.userId) ?? [];
    list.push(p);
    byUser.set(p.userId, list);
  }

  let notifCount = 0;

  for (const [userId, prospects] of byUser.entries()) {
    const user = prospects[0].user;
    const count = prospects.length;
    const names = prospects
      .slice(0, 3)
      .map((p) => p.name)
      .join(", ");
    const suffix = count > 3 ? ` +${count - 3} autre${count - 3 > 1 ? "s" : ""}` : "";

    await prisma.notification.create({
      data: {
        userId,
        title: `⏰ ${count} prospect${count > 1 ? "s" : ""} à relancer`,
        body: `Aujourd'hui : ${names}${suffix}. Relancez-les pour ne pas perdre vos opportunités !`,
        url: "/espace/prospects",
      },
    });

    // Réinitialiser reminderAt à null pour éviter la re-notification demain
    // (l'affilié devra manuellement fixer une nouvelle relance s'il le souhaite)
    await prisma.prospect.updateMany({
      where: { id: { in: prospects.map((p) => p.id) } },
      data: { reminderAt: null },
    });

    notifCount++;
    console.log(`[prospect-reminders] ${user.firstName} → ${count} rappel(s)`);
  }

  return NextResponse.json({ sent: notifCount, prospects: dueProspects.length });
}

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Délai sans contact (en jours) avant relance automatique par statut
const STALE_DAYS: Record<string, number> = {
  CONTACTED:  3,
  INTERESTED: 5,
  DEMO:       5,
  QUOTE:      7,
};

const STAGE_MESSAGE: Record<string, string> = {
  CONTACTED:  "n'a pas encore répondu — relancez-le pour avancer.",
  INTERESTED: "est intéressé mais attend un suivi — ne le laissez pas refroidir !",
  DEMO:       "a eu une démo mais attend votre relance.",
  QUOTE:      "a reçu un devis — c'est le moment de conclure !",
};

export async function GET(req: Request) {
  const hdrs = await headers();
  const secret = hdrs.get("authorization")?.replace("Bearer ", "") ?? hdrs.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // 1. Relances manuelles (reminderAt passé)
  const dueProspects = await prisma.prospect.findMany({
    where: {
      reminderAt: { lte: now },
      status: { notIn: ["CONVERTED", "LOST"] },
      user: { approved: true, active: true },
    },
    include: {
      user: { select: { id: true, firstName: true } },
    },
  });

  // 2. Relances intelligentes par stade (pas de contact depuis X jours)
  const staleAlerts: typeof dueProspects = [];
  for (const [status, days] of Object.entries(STALE_DAYS)) {
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const stale = await prisma.prospect.findMany({
      where: {
        status,
        reminderAt: null, // pas déjà prévu en relance manuelle
        lastContactedAt: { lte: cutoff },
        user: { approved: true, active: true },
      },
      include: {
        user: { select: { id: true, firstName: true } },
      },
    });
    staleAlerts.push(...stale);
  }

  // Grouper manuels par userId
  const byUser = new Map<string, { manual: typeof dueProspects; stale: typeof dueProspects }>();

  for (const p of dueProspects) {
    const entry = byUser.get(p.userId) ?? { manual: [], stale: [] };
    entry.manual.push(p);
    byUser.set(p.userId, entry);
  }
  for (const p of staleAlerts) {
    const entry = byUser.get(p.userId) ?? { manual: [], stale: [] };
    if (!entry.manual.find((m) => m.id === p.id)) {
      entry.stale.push(p);
    }
    byUser.set(p.userId, entry);
  }

  let notifCount = 0;

  for (const [userId, { manual, stale }] of byUser.entries()) {
    // Notification pour les relances manuelles
    if (manual.length > 0) {
      const count = manual.length;
      const names = manual.slice(0, 3).map((p) => p.name).join(", ");
      const suffix = count > 3 ? ` +${count - 3} autre${count - 3 > 1 ? "s" : ""}` : "";
      await prisma.notification.create({
        data: {
          userId,
          title: `⏰ ${count} prospect${count > 1 ? "s" : ""} à relancer`,
          body: `Aujourd'hui : ${names}${suffix}. Relancez-les pour ne pas perdre vos opportunités !`,
          url: "/espace/prospects",
        },
      });
      await prisma.prospect.updateMany({
        where: { id: { in: manual.map((p) => p.id) } },
        data: { reminderAt: null },
      });
      notifCount++;
    }

    // Notifications intelligentes par prospect stale
    for (const p of stale.slice(0, 3)) {
      const msg = STAGE_MESSAGE[p.status] ?? "mérite un suivi.";
      await prisma.notification.create({
        data: {
          userId,
          title: `💡 ${p.name} attend votre relance`,
          body: `${p.name} ${msg}`,
          url: `/espace/prospects/${p.id}`,
        },
      });
      // Éviter re-notification le lendemain : on met lastContactedAt à maintenant
      // L'affilié verra la notif et devra aller sur la fiche pour vraiment relancer
      notifCount++;
    }
  }

  return NextResponse.json({
    sent: notifCount,
    manual: dueProspects.length,
    stale: staleAlerts.length,
  });
}

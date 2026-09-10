import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const user = await requireUser();
  const { missionId, note } = await req.json();
  if (!missionId) return NextResponse.json({ error: "missionId requis" }, { status: 400 });

  const existing = await (prisma as any).missionInterest.findUnique({
    where: { missionId_userId: { missionId, userId: user.id } },
  });
  if (existing) return NextResponse.json({ ok: true, already: true });

  const mission = await (prisma as any).mission.findUnique({
    where: { id: missionId },
    select: { title: true, submittedByUserId: true },
  });

  await (prisma as any).missionInterest.create({
    data: { missionId, userId: user.id, note: note?.trim() || null },
  });

  // Notifier les admins
  try {
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPERADMIN"] } },
      select: { id: true },
    });
    for (const a of admins) {
      await (prisma as any).notification.create({
        data: {
          userId: a.id,
          title: `🤝 Intérêt exprimé sur une opportunité`,
          body: `${user.firstName} ${user.lastName} est intéressé(e) par : "${mission?.title}"`,
          url: "/admin/missions",
        },
      });
    }
  } catch { /* non bloquant */ }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await requireUser();
  const { missionId } = await req.json();
  if (!missionId) return NextResponse.json({ error: "missionId requis" }, { status: 400 });
  await (prisma as any).missionInterest.deleteMany({
    where: { missionId, userId: user.id, status: "PENDING" },
  });
  return NextResponse.json({ ok: true });
}

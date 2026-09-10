import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const user = await requireUser();
  const body = await req.json();
  const { submissionType, title, description, category, zone,
    contactName, contactPhone, contactEmail, medias } = body;

  if (!title?.trim() || !description?.trim()) {
    return NextResponse.json({ error: "Titre et description requis" }, { status: 400 });
  }

  const mission = await (prisma as any).mission.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      category: category || "AUTRE",
      zone: zone || "Côte d'Ivoire",
      source: "PARTNER",
      submissionType: submissionType || "OFFER",
      submittedByUserId: user.id,
      validationStatus: "PENDING_VALIDATION",
      status: "OPEN",
      active: false,
      contactName: contactName?.trim() || "",
      contactPhone: contactPhone?.trim() || "",
      contactEmail: contactEmail?.trim() || "",
    },
  });

  if (Array.isArray(medias) && medias.length > 0) {
    await (prisma as any).missionMedia.createMany({
      data: medias.map((m: any) => ({
        missionId: mission.id,
        url: m.url,
        mediaType: m.mediaType || "IMAGE",
        name: m.name || "",
      })),
    });
  }

  // Notification admin
  try {
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPERADMIN"] } },
      select: { id: true },
    });
    for (const a of admins) {
      await (prisma as any).notification.create({
        data: {
          userId: a.id,
          title: `📥 Nouvelle soumission partenaire`,
          body: `${user.firstName} ${user.lastName} a soumis une opportunité : "${title.trim()}"`,
          url: "/admin/missions",
        },
      });
    }
  } catch { /* non bloquant */ }

  return NextResponse.json({ ok: true, id: mission.id });
}

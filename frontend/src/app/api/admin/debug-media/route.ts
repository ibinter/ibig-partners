import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  await requireAdmin();
  const media = await (prisma as any).missionMedia.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    select: { id: true, url: true, mediaType: true, name: true, missionId: true },
  });

  // Récupère les missions uniques référencées
  const missionIds = [...new Set(media.map((r: any) => r.missionId))];
  const missions = await (prisma as any).mission.findMany({
    where: { id: { in: missionIds } },
    select: { id: true, title: true, status: true, validationStatus: true, source: true },
  });

  // Missions OPEN+VALIDATED avec au moins un média
  const openMissionsWithMedia = await (prisma as any).mission.findMany({
    where: { status: "OPEN", validationStatus: "VALIDATED" },
    include: { media: { select: { id: true, url: true, mediaType: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const withMedia = openMissionsWithMedia.filter((m: any) => m.media.length > 0);

  return NextResponse.json({
    recentMedia: media,
    missionsOfMedia: missions,
    openValidatedWithMedia: withMedia.map((m: any) => ({
      id: m.id, title: m.title, source: m.source, mediaCount: m.media.length,
      firstUrl: m.media[0]?.url,
    })),
  });
}

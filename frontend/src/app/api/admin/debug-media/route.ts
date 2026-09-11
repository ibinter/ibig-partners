import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  await requireAdmin();
  const rows = await prisma.missionMedia.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    select: { id: true, url: true, mediaType: true, name: true, missionId: true },
  });
  return NextResponse.json(rows);
}

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    await requireUser();
    const { missionId } = await req.json();
    if (!missionId) return NextResponse.json({ ok: false });
    await (prisma as any).mission.update({
      where: { id: missionId },
      data: { viewCount: { increment: 1 } },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}

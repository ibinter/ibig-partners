import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireUser();
  const opt = await (prisma as any).leaderboardOptIn.findUnique({ where: { userId: user.id } });
  return NextResponse.json({ optedIn: opt?.optedIn ?? false });
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const { optedIn } = await req.json();
  await (prisma as any).leaderboardOptIn.upsert({
    where: { userId: user.id },
    update: { optedIn },
    create: { userId: user.id, optedIn },
  });
  return NextResponse.json({ ok: true });
}

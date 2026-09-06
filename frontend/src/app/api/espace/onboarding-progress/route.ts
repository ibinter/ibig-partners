import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireUser();
  const prog = await (prisma as any).onboardingProgress.findUnique({ where: { userId: user.id } });
  return NextResponse.json(prog ?? {});
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const data = await req.json();

  const allDone = data.profileCompleted && data.firstProductActivated && data.firstLinkCopied && data.firstProspectAdded && data.firstShareDone;
  await (prisma as any).onboardingProgress.upsert({
    where: { userId: user.id },
    update: { ...data, ...(allDone ? { completedAt: new Date() } : {}) },
    create: { userId: user.id, ...data, ...(allDone ? { completedAt: new Date() } : {}) },
  });
  return NextResponse.json({ ok: true });
}

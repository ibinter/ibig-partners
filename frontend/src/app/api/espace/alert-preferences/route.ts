import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireUser();
  const prefs = await (prisma as any).alertPreference.findUnique({ where: { userId: user.id } });
  return NextResponse.json(prefs ?? { newNetworkSale: true, rankingChange: true, newProspect: false, commissionPaid: true, weeklyDigest: true });
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const data = await req.json();
  await (prisma as any).alertPreference.upsert({
    where: { userId: user.id },
    update: data,
    create: { userId: user.id, ...data },
  });
  return NextResponse.json({ ok: true });
}

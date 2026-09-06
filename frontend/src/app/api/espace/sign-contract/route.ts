import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";

  await (prisma as any).partnerContract.upsert({
    where: { userId: user.id },
    update: { signedAt: new Date(), ipAddress: ip },
    create: { userId: user.id, signedAt: new Date(), ipAddress: ip, version: "1.0" },
  });

  return NextResponse.json({ ok: true });
}

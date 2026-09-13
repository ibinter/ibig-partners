import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = String(body.path || "/").slice(0, 200);
    await (prisma as any).pageView.create({ data: { id: Math.random().toString(36).slice(2), path } });
  } catch {}
  return NextResponse.json({ ok: true });
}

export async function GET() {
  try {
    const total = await (prisma as any).pageView.count();
    const today = new Date(); today.setHours(0,0,0,0);
    const todayCount = await (prisma as any).pageView.count({ where: { createdAt: { gte: today } } });
    return NextResponse.json({ total, today: todayCount });
  } catch {
    return NextResponse.json({ total: 0, today: 0 });
  }
}

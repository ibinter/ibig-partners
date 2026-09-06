import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const { content, rating } = await req.json();
  if (!content || content.trim().length < 20) return NextResponse.json({ error: "Trop court" }, { status: 400 });

  await (prisma as any).testimonial.create({
    data: { userId: user.id, content: content.trim(), rating: Math.min(5, Math.max(1, rating ?? 5)), status: "PENDING" },
  });
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const { opportunityId, rating, comment } = await req.json();

  if (!opportunityId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  await (prisma as any).opportunityFeedback.upsert({
    where: { userId_opportunityId: { userId: user.id, opportunityId } },
    update: { rating, comment: comment || null },
    create: {
      id: `ofb_${user.id}_${opportunityId}`,
      userId: user.id,
      opportunityId,
      rating,
      comment: comment || null,
    },
  });

  return NextResponse.json({ ok: true });
}

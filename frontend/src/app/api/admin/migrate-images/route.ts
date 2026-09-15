import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();
  try {
    await (prisma as any).$executeRawUnsafe(
      `ALTER TABLE "Need" ADD COLUMN IF NOT EXISTS "imagesJson" TEXT`
    );
    await (prisma as any).$executeRawUnsafe(
      `ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT`
    );
    await (prisma as any).$executeRawUnsafe(
      `ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "imagesJson" TEXT`
    );
    return NextResponse.json({ ok: true, message: "Columns imagesJson added to Need and Opportunity, imageUrl added to Opportunity." });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();
  try {
    await (prisma as any).$executeRawUnsafe(
      `ALTER TABLE "Need" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT`
    );
    return NextResponse.json({ ok: true, message: "Column imageUrl added to Need table (or already existed)." });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}

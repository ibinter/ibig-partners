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
  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }
  // Autoriser uniquement les champs booléens connus — évite l'injection de champs arbitraires
  const allowed = ["newNetworkSale", "rankingChange", "newProspect", "commissionPaid", "weeklyDigest"];
  const data = Object.fromEntries(
    Object.entries(raw).filter(([k, v]) => allowed.includes(k) && typeof v === "boolean")
  );
  await (prisma as any).alertPreference.upsert({
    where: { userId: user.id },
    update: data,
    create: { userId: user.id, ...data },
  });
  return NextResponse.json({ ok: true });
}

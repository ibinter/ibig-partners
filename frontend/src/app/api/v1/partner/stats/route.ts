import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key") ?? req.nextUrl.searchParams.get("api_key");
  if (!apiKey) return NextResponse.json({ error: "API key required" }, { status: 401 });

  const keyRecord = await (prisma as any).partnerApiKey.findUnique({ where: { key: apiKey } });
  if (!keyRecord) return NextResponse.json({ error: "Invalid API key" }, { status: 401 });

  await (prisma as any).partnerApiKey.update({
    where: { id: keyRecord.id },
    data: { lastUsedAt: new Date() },
  });

  const userId = keyRecord.userId;
  const [salesCount, commTotal, referralsCount, leadsCount] = await Promise.all([
    prisma.sale.count({ where: { sellerId: userId } }),
    prisma.commission.aggregate({ where: { userId }, _sum: { amount: true } }),
    prisma.user.count({ where: { sponsorId: userId } }),
    (prisma as any).opportunityLead.count({ where: { userId } }),
  ]);

  return NextResponse.json({
    sales: salesCount,
    commissions_fcfa: commTotal._sum.amount ?? 0,
    referrals: referralsCount,
    leads: leadsCount,
    ts: new Date().toISOString(),
  });
}

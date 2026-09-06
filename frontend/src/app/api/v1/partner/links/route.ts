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

  const links = await prisma.affiliateLink.findMany({
    where: { userId: keyRecord.userId },
    include: { product: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    links: links.map((l) => ({
      id: l.id,
      code: l.code,
      product: l.product.name,
      clicks: l.clicks,
      url: `${process.env.NEXTAUTH_URL ?? ""}/rejoindre?ref=${l.code}&product=${l.productId}`,
      createdAt: l.createdAt,
    })),
  });
}

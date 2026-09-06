import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();

  const notifications = await prisma.notification.findMany({
    where: { read: false, OR: [{ userId: null }, { userId: user.id }] },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, title: true, body: true, url: true, createdAt: true },
  });

  return NextResponse.json({ count: notifications.length, notifications });
}

export async function POST(req: Request) {
  const user = await requireUser();
  const { ids } = await req.json() as { ids?: string[] };

  if (ids && ids.length > 0) {
    await prisma.notification.updateMany({
      where: { id: { in: ids }, OR: [{ userId: null }, { userId: user.id }] },
      data: { read: true },
    });
  } else {
    await prisma.notification.updateMany({
      where: { read: false, OR: [{ userId: null }, { userId: user.id }] },
      data: { read: true },
    });
  }

  return NextResponse.json({ ok: true });
}

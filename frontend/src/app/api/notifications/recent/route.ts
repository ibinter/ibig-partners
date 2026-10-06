import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Endpoint léger : 3 dernières notifications de l'utilisateur connecté.
 * Utilisé par le composant CelebrationToaster côté client.
 */
export async function GET() {
  try {
    const user = await requireUser();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const notifs = await prisma.notification.findMany({
      where: {
        OR: [{ userId: user.id }, { userId: null }],
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, title: true, body: true, url: true, createdAt: true },
    });
    return NextResponse.json({ notifs });
  } catch {
    return NextResponse.json({ notifs: [] }, { status: 200 });
  }
}

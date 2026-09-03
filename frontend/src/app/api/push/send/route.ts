import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:noreply@ibigpartners.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  await requireAdmin();
  const body = await req.json();
  const { title, body: msgBody, url, userId } = body as {
    title: string;
    body: string;
    url?: string;
    userId?: string;
  };

  const subs = await prisma.pushSubscription.findMany({
    where: userId ? { userId } : undefined,
  });

  const payload = JSON.stringify({ title, body: msgBody, url: url ?? "/espace" });
  let sent = 0;
  const failed: string[] = [];

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sent++;
      } catch {
        failed.push(sub.id);
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => null);
      }
    })
  );

  return NextResponse.json({ sent, total: subs.length, failed: failed.length });
}

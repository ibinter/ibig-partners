import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // This cron runs at midnight — streaks are broken if lastActiveDate < yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const streaks = await (prisma as any).dailyStreak.findMany({
    where: {
      lastActiveDate: { lt: yesterday },
      currentStreak: { gt: 0 },
    },
  });

  let broken = 0;
  for (const s of streaks) {
    await (prisma as any).dailyStreak.update({
      where: { id: s.id },
      data: { currentStreak: 0 },
    });
    broken++;
  }

  return NextResponse.json({ broken });
}

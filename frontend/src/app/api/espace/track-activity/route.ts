import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const user = await requireUser();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await (prisma as any).dailyStreak.findUnique({
    where: { userId: user.id },
  });

  if (!existing) {
    await (prisma as any).dailyStreak.create({
      data: {
        id: `str_${user.id}`,
        userId: user.id,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
        totalPoints: 10,
      },
    });
    return NextResponse.json({ streak: 1, points: 10, new: true });
  }

  const lastDate = existing.lastActiveDate ? new Date(existing.lastActiveDate) : null;
  if (lastDate) {
    lastDate.setHours(0, 0, 0, 0);
    if (lastDate.getTime() === today.getTime()) {
      return NextResponse.json({ streak: existing.currentStreak, points: existing.totalPoints, alreadyTracked: true });
    }
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const consecutive = lastDate && lastDate.getTime() === yesterday.getTime();

  const newStreak = consecutive ? existing.currentStreak + 1 : 1;
  const bonus = newStreak >= 7 ? 20 : newStreak >= 3 ? 15 : 10;
  const newTotal = existing.totalPoints + bonus;
  const newLongest = Math.max(existing.longestStreak, newStreak);

  await (prisma as any).dailyStreak.update({
    where: { id: existing.id },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: today,
      totalPoints: newTotal,
    },
  });

  // Award points
  await prisma.pointTransaction.create({
    data: {
      id: `pt_streak_${user.id}_${Date.now()}`,
      userId: user.id,
      points: bonus,
      reason: "CHALLENGE",
      ref: `streak_day_${newStreak}`,
    },
  });

  return NextResponse.json({ streak: newStreak, longest: newLongest, points: newTotal, bonus });
}

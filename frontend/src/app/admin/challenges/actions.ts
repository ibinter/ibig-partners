"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createChallenge(fd: FormData) {
  await requireAdmin();
  await prisma.challenge.create({
    data: {
      title: String(fd.get("title")),
      description: fd.get("description") ? String(fd.get("description")) : null,
      metric: String(fd.get("metric")),
      target: parseInt(String(fd.get("target")), 10),
      reward: parseFloat(String(fd.get("reward") || "0")),
      startAt: new Date(String(fd.get("startAt"))),
      endAt: new Date(String(fd.get("endAt"))),
      active: true,
    },
  });
  revalidatePath("/admin/challenges");
}

export async function toggleChallenge(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  const current = await prisma.challenge.findUnique({ where: { id }, select: { active: true } });
  await prisma.challenge.update({ where: { id }, data: { active: !current?.active } });
  revalidatePath("/admin/challenges");
}

export async function deleteChallenge(fd: FormData) {
  await requireAdmin();
  await prisma.challenge.delete({ where: { id: String(fd.get("id")) } });
  revalidatePath("/admin/challenges");
}

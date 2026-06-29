"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function markModuleStarted(formData: FormData) {
  const user = await requireUser();
  const moduleId = String(formData.get("moduleId") || "").trim();
  if (!moduleId) return;

  await (prisma as any).trainingProgress.upsert({
    where: { userId_moduleId: { userId: user.id, moduleId } },
    create: { userId: user.id, moduleId, startedAt: new Date() },
    update: {},
  });

  await (prisma as any).trainingModule.update({
    where: { id: moduleId },
    data: { viewCount: { increment: 1 } },
  });

  revalidatePath("/espace/academie");
}

export async function markModuleComplete(formData: FormData) {
  const user = await requireUser();
  const moduleId = String(formData.get("moduleId") || "").trim();
  if (!moduleId) return;

  await (prisma as any).trainingProgress.upsert({
    where: { userId_moduleId: { userId: user.id, moduleId } },
    create: { userId: user.id, moduleId, startedAt: new Date(), completedAt: new Date() },
    update: { completedAt: new Date() },
  });

  revalidatePath("/espace/academie");
}

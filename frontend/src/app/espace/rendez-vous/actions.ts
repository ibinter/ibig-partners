"use server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createAppointment(fd: FormData) {
  const user = await requireUser();

  const title         = (fd.get("title") as string)?.trim();
  const scheduledAt   = fd.get("scheduledAt") as string;
  const duration      = Number(fd.get("duration") ?? 30);
  const guestName     = (fd.get("guestName") as string)?.trim() || null;
  const guestContact  = (fd.get("guestContact") as string)?.trim() || null;
  const meetUrl       = (fd.get("meetUrl") as string)?.trim() || null;
  const notes         = (fd.get("notes") as string)?.trim() || null;

  if (!title || !scheduledAt) return;

  await (prisma as any).appointment.create({
    data: {
      userId:     user.id,
      title,
      scheduledAt: new Date(scheduledAt),
      duration,
      guestName,
      guestEmail:  guestContact?.includes("@") ? guestContact : null,
      guestPhone:  !guestContact?.includes("@") ? guestContact : null,
      meetUrl,
      notes,
      status: "PENDING",
    },
  });

  revalidatePath("/espace/rendez-vous");
}

export async function updateAppointmentStatus(fd: FormData) {
  const user   = await requireUser();
  const id     = fd.get("id") as string;
  const status = fd.get("status") as string;

  if (!id || !status) return;

  await (prisma as any).appointment.updateMany({
    where: { id, userId: user.id },
    data:  { status, updatedAt: new Date() },
  });

  revalidatePath("/espace/rendez-vous");
}

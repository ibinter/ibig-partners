"use server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createEvent(fd: FormData) {
  await requireAdmin();
  await (prisma as any).ibigEvent.create({
    data: {
      title: fd.get("title") as string,
      description: (fd.get("description") as string) || null,
      location: (fd.get("location") as string) || null,
      eventAt: new Date(fd.get("eventAt") as string),
      maxAttendees: fd.get("maxAttendees") ? parseInt(fd.get("maxAttendees") as string) : null,
    },
  });
  revalidatePath("/admin/evenements");
}

export async function toggleEvent(fd: FormData) {
  await requireAdmin();
  const ev = await (prisma as any).ibigEvent.findUnique({ where: { id: fd.get("id") as string } });
  await (prisma as any).ibigEvent.update({ where: { id: ev.id }, data: { active: !ev.active } });
  revalidatePath("/admin/evenements");
}

export async function deleteEvent(fd: FormData) {
  await requireAdmin();
  await (prisma as any).ibigEvent.delete({ where: { id: fd.get("id") as string } });
  revalidatePath("/admin/evenements");
}

"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function markAllRead() {
  const user = await requireUser();
  // Marque uniquement les notifications personnelles de cet utilisateur
  // Les notifications globales (userId: null) ne sont jamais modifiées ici
  // pour ne pas affecter la vue de tous les autres partenaires.
  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
  revalidatePath("/espace/notifications");
  revalidatePath("/espace");
}

export async function markOneRead(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  // Vérifier que la notification appartient bien à cet utilisateur
  const notif = await prisma.notification.findUnique({ where: { id } });
  if (!notif || (notif.userId !== null && notif.userId !== user.id)) return;
  // On ne marque pas les notifs globales comme lues (elles appartiennent à tous)
  if (notif.userId === null) {
    revalidatePath("/espace/notifications");
    return;
  }
  await prisma.notification.update({ where: { id }, data: { read: true } });
  revalidatePath("/espace/notifications");
  revalidatePath("/espace");
}

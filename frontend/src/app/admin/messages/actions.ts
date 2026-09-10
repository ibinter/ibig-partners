"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Ouvre (ou réutilise) une conversation directe entre l'admin et l'affilié ciblé,
 * puis redirige vers le fil DANS l'espace admin (/admin/messages) — le superadmin
 * n'est jamais renvoyé dans l'espace affilié.
 */
export async function adminContact(formData: FormData) {
  const user = await requireAdmin();
  const targetUserId = String(formData.get("targetUserId") || "").trim();
  if (!targetUserId || targetUserId === user.id) redirect("/admin/partenaires");

  const existing = await (prisma as any).chatConversation.findFirst({
    where: {
      type: "DIRECT",
      participants: { some: { userId: user.id } },
      AND: [{ participants: { some: { userId: targetUserId } } }],
    },
    include: { participants: true },
  });

  if (existing && existing.participants.length === 2) {
    redirect(`/admin/messages/${existing.id}`);
  }

  const conversation = await (prisma as any).chatConversation.create({
    data: {
      type: "DIRECT",
      participants: { create: [{ userId: user.id }, { userId: targetUserId }] },
    },
  });

  redirect(`/admin/messages/${conversation.id}`);
}

const BROADCAST_ID = "broadcast-ibig-partners";

/**
 * Retourne (ou crée) le canal broadcast unique pour toute la plateforme.
 * Ajoute automatiquement tous les partenaires actifs comme participants.
 */
async function getOrCreateBroadcast(adminId: string) {
  let conv = await (prisma as any).chatConversation.findUnique({
    where: { id: BROADCAST_ID },
    include: { participants: { select: { userId: true } } },
  });

  if (!conv) {
    conv = await (prisma as any).chatConversation.create({
      data: {
        id: BROADCAST_ID,
        type: "BROADCAST",
        name: "Annonces IBIG PARTNERS",
        description: "Canal officiel de communication — messages de l'administration",
        participants: { create: [{ userId: adminId }] },
      },
      include: { participants: { select: { userId: true } } },
    });
  }

  // Ajouter les partenaires actifs non encore participants
  const existingIds = new Set(conv.participants.map((p: any) => p.userId));
  const partners = await prisma.user.findMany({
    where: { role: "PARTNER", active: true },
    select: { id: true },
  });

  const toAdd = partners.filter((p) => !existingIds.has(p.id));
  if (toAdd.length > 0) {
    await (prisma as any).chatParticipant.createMany({
      data: toAdd.map((p) => ({ conversationId: BROADCAST_ID, userId: p.id })),
      skipDuplicates: true,
    });
  }

  return BROADCAST_ID;
}

/** Redirige l'admin vers le canal broadcast (le crée si nécessaire). */
export async function openBroadcast() {
  const admin = await requireAdmin();
  await getOrCreateBroadcast(admin.id);
  redirect(`/admin/messages/${BROADCAST_ID}`);
}

/** Ajoute un partenaire au canal broadcast (appelé à l'inscription). */
export async function addToBroadcast(userId: string) {
  try {
    await (prisma as any).chatParticipant.upsert({
      where: { conversationId_userId: { conversationId: BROADCAST_ID, userId } },
      create: { conversationId: BROADCAST_ID, userId },
      update: {},
    });
  } catch {
    // Le canal n'existe pas encore — sera créé à la prochaine ouverture admin
  }
}

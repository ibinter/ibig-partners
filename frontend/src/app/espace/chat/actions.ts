"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function hasFilleul(userId: string): Promise<boolean> {
  const count = await prisma.user.count({ where: { sponsorId: userId } });
  return count > 0;
}

export async function startConversation(
  _prev: string | null,
  formData: FormData
): Promise<string | null> {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN" || user.role === "SUPERADMIN";
  if (!isAdmin && !(await hasFilleul(user.id))) {
    redirect("/espace/chat");
  }

  const targetUserId = String(formData.get("targetUserId") || "").trim();
  if (!targetUserId || targetUserId === user.id) return "Utilisateur invalide.";

  try {
    // Look for an existing DIRECT conversation between these two users
    const existing = await (prisma as any).chatConversation.findFirst({
      where: {
        type: "DIRECT",
        participants: { some: { userId: user.id } },
        AND: [{ participants: { some: { userId: targetUserId } } }],
      },
      include: { participants: true },
    });

    if (existing && existing.participants.length === 2) {
      redirect(`/espace/chat/${existing.id}`);
    }

    // Create new DIRECT conversation
    const conversation = await (prisma as any).chatConversation.create({
      data: {
        type: "DIRECT",
        participants: {
          create: [{ userId: user.id }, { userId: targetUserId }],
        },
      },
    });

    redirect(`/espace/chat/${conversation.id}`);
  } catch (e: any) {
    if (e?.digest?.startsWith?.("NEXT_REDIRECT")) throw e;
    console.error("[startConversation]", e);
    return `Erreur : ${e?.message ?? String(e)}`;
  }
}

/**
 * Variante « form action » de startConversation (formData seul) pour un bouton
 * « Contacter » côté admin : ouvre (ou réutilise) la conversation directe avec
 * l'affilié ciblé et redirige vers le fil de discussion.
 */
export async function contactUser(formData: FormData) {
  await startConversation(null, formData);
}

export async function sendMessage(formData: FormData) {
  const user = await requireUser();
  // Toute personne PARTICIPANTE d'une conversation peut y répondre (la
  // vérification de participation ci-dessous protège l'accès), y compris un
  // affilié sans filleul répondant au message de bienvenue d'un admin.
  const conversationId = String(formData.get("conversationId") || "").trim();
  const body = String(formData.get("body") || "").trim();

  if (!conversationId || !body) return;

  // Verify user is a participant
  const participant = await (prisma as any).chatParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId: user.id },
    },
  });

  if (!participant) return;

  await (prisma as any).chatMessage.create({
    data: {
      conversationId,
      senderId: user.id,
      body,
      type: "TEXT",
    },
  });

  await (prisma as any).chatConversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  // Update lastReadAt for sender
  await (prisma as any).chatParticipant.update({
    where: { conversationId_userId: { conversationId, userId: user.id } },
    data: { lastReadAt: new Date() },
  });

  // Notifier les autres participants (cloche), sauf ceux déjà actifs dans le
  // chat (lu il y a moins de 60 s) pour éviter le spam pendant un échange en direct.
  const others = await (prisma as any).chatParticipant.findMany({
    where: { conversationId, userId: { not: user.id } },
    select: { userId: true, lastReadAt: true },
  });
  const cutoff = Date.now() - 60_000;
  const toNotify = others.filter(
    (o: any) => !o.lastReadAt || new Date(o.lastReadAt).getTime() < cutoff
  );
  if (toNotify.length > 0) {
    const senderName = `${user.firstName} ${user.lastName}`.trim() || "IBIG PARTNERS";
    const preview = body.length > 140 ? `${body.slice(0, 140)}…` : body;
    await prisma.notification.createMany({
      data: toNotify.map((o: any) => ({
        userId: o.userId,
        title: `💬 Nouveau message de ${senderName}`,
        body: preview,
      })),
    });
  }

  revalidatePath(`/espace/chat/${conversationId}`);
}

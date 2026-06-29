"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const GOLD_STATUSES = ["GOLD", "MASTER", "ELITE"];

export async function startConversation(formData: FormData) {
  const user = await requireUser();
  if (!GOLD_STATUSES.includes(user.status)) {
    redirect("/espace/chat");
  }

  const targetUserId = String(formData.get("targetUserId") || "").trim();
  if (!targetUserId || targetUserId === user.id) return;

  // Look for an existing DIRECT conversation between these two users
  const existing = await (prisma as any).chatConversation.findFirst({
    where: {
      type: "DIRECT",
      participants: {
        some: { userId: user.id },
      },
      AND: [
        {
          participants: {
            some: { userId: targetUserId },
          },
        },
      ],
    },
    include: {
      participants: true,
    },
  });

  if (existing) {
    // Verify it only has 2 participants (truly DIRECT)
    if (existing.participants.length === 2) {
      redirect(`/espace/chat/${existing.id}`);
    }
  }

  // Create new DIRECT conversation
  const conversation = await (prisma as any).chatConversation.create({
    data: {
      type: "DIRECT",
      participants: {
        create: [
          { userId: user.id },
          { userId: targetUserId },
        ],
      },
    },
  });

  redirect(`/espace/chat/${conversation.id}`);
}

export async function sendMessage(formData: FormData) {
  const user = await requireUser();
  if (!GOLD_STATUSES.includes(user.status)) return;

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

  revalidatePath(`/espace/chat/${conversationId}`);
}

"use server";

import { redirect } from "next/navigation";
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

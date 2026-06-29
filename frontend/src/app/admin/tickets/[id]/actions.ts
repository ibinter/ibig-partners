"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email-utils";
import { logAction } from "@/lib/audit";

export async function adminReplyTicket(formData: FormData) {
  const admin = await requireAdmin();
  const ticketId = String(formData.get("ticketId"));
  const body = String(formData.get("body") || "").trim();
  const partnerEmail = String(formData.get("partnerEmail"));
  const partnerFirstName = String(formData.get("partnerFirstName"));
  if (!body) return;

  await prisma.ticketMessage.create({
    data: { ticketId, authorId: admin.id, body, isAdmin: true },
  });
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: "IN_PROGRESS", updatedAt: new Date() },
  });

  await sendEmail({
    to: partnerEmail,
    subject: "[IBIG Support] Réponse à votre ticket",
    html: `<p>Bonjour ${partnerFirstName},</p>
           <p>L'équipe IBIG PARTNERS a répondu à votre ticket :</p>
           <blockquote style="border-left:3px solid #0b5fff;padding-left:12px;color:#374151">${body}</blockquote>
           <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/espace/support/${ticketId}">Voir le ticket complet</a></p>`,
  });

  await logAction({ userId: admin.id, action: "REPLY_TICKET", target: ticketId });
  revalidatePath(`/admin/tickets/${ticketId}`);
}

export async function closeTicket(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));

  await prisma.ticket.update({ where: { id }, data: { status: "CLOSED", updatedAt: new Date() } });
  await logAction({ userId: admin.id, action: "CLOSE_TICKET", target: id });
  revalidatePath(`/admin/tickets/${id}`);
  revalidatePath("/admin/tickets");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email-utils";

export async function createTicket(formData: FormData) {
  const user = await requireUser();
  const subject = String(formData.get("subject") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const priority = String(formData.get("priority") || "NORMAL");
  if (!subject || !body) return;

  const ticket = await prisma.ticket.create({
    data: {
      userId: user.id,
      subject,
      priority,
      messages: {
        create: { authorId: user.id, body, isAdmin: false },
      },
    },
  });

  // Notifier l'admin par email
  await sendEmail({
    to: process.env.SUPPORT_EMAIL ?? "admin@ibigpartners.com",
    subject: `[IBIG Support] Nouveau ticket — ${subject}`,
    html: `<p>Nouveau ticket de <strong>${user.firstName} ${user.lastName}</strong> (${user.code}).</p>
           <p><strong>Sujet :</strong> ${subject}</p>
           <p><strong>Message :</strong> ${body}</p>
           <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/tickets/${ticket.id}">Voir le ticket</a></p>`,
  });

  redirect(`/espace/support/${ticket.id}`);
}

export async function replyTicket(formData: FormData) {
  const user = await requireUser();
  const ticketId = String(formData.get("ticketId"));
  const body = String(formData.get("body") || "").trim();
  if (!body) return;

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket || ticket.userId !== user.id) return;

  await prisma.ticketMessage.create({
    data: { ticketId, authorId: user.id, body, isAdmin: false },
  });
  await prisma.ticket.update({ where: { id: ticketId }, data: { status: "OPEN", updatedAt: new Date() } });

  revalidatePath(`/espace/support/${ticketId}`);
}

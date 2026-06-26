import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { adminReplyTicket, closeTicket } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, code: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { firstName: true, lastName: true, role: true } } },
      },
    },
  });

  if (!ticket) notFound();

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <PageHeader
          title={ticket.subject}
          subtitle={`${ticket.user.firstName} ${ticket.user.lastName} (${ticket.user.code}) · ${ticket.user.email}`}
        />
        {ticket.status !== "CLOSED" && (
          <form action={closeTicket}>
            <input type="hidden" name="id" value={ticket.id} />
            <input type="hidden" name="adminId" value={admin.id} />
            <Button type="submit" variant="secondary">✓ Marquer résolu</Button>
          </form>
        )}
      </div>

      <div className="space-y-4 mb-6">
        {ticket.messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-xl p-4 ${m.isAdmin ? "bg-brand-50 border border-brand-200 mr-8" : "bg-white border border-slate-200 ml-8"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-ink">
                {m.isAdmin ? `🛡 ${m.author.firstName} ${m.author.lastName} (Admin)` : `${m.author.firstName} ${m.author.lastName}`}
              </span>
              <span className="text-xs text-muted">{formatDate(m.createdAt)}</span>
            </div>
            <p className="text-sm text-ink leading-relaxed whitespace-pre-line">{m.body}</p>
          </div>
        ))}
      </div>

      {ticket.status !== "CLOSED" && (
        <Card>
          <h2 className="mb-4 font-semibold text-ink">Répondre au partenaire</h2>
          <form action={adminReplyTicket} className="space-y-4">
            <input type="hidden" name="ticketId" value={ticket.id} />
            <input type="hidden" name="adminId" value={admin.id} />
            <input type="hidden" name="partnerEmail" value={ticket.user.email} />
            <input type="hidden" name="partnerFirstName" value={ticket.user.firstName} />
            <textarea
              name="body"
              required
              rows={4}
              placeholder="Votre réponse au partenaire..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <Button type="submit">Envoyer la réponse</Button>
          </form>
        </Card>
      )}
    </div>
  );
}

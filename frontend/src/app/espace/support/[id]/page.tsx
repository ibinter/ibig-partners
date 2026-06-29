import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { replyTicket } from "../actions";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = { OPEN: "Ouvert", IN_PROGRESS: "En cours", CLOSED: "Résolu" };

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { firstName: true, lastName: true, role: true } } },
      },
    },
  });

  if (!ticket || ticket.userId !== user.id) notFound();

  return (
    <div>
      <PageHeader
        title={ticket.subject}
        subtitle={`Ticket · ${STATUS_LABELS[ticket.status]} · Ouvert le ${formatDate(ticket.createdAt)}`}
      />

      <div className="space-y-4 mb-6">
        {ticket.messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-xl p-4 ${m.isAdmin ? "bg-brand-50 border border-brand-200 ml-8" : "bg-white border border-slate-200 mr-8"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-ink">
                {m.isAdmin ? "🛡 Équipe IBIG PARTNERS" : `${m.author.firstName} ${m.author.lastName}`}
              </span>
              <span className="text-xs text-muted">{formatDate(m.createdAt)}</span>
            </div>
            <p className="text-sm text-ink leading-relaxed whitespace-pre-line">{m.body}</p>
          </div>
        ))}
      </div>

      {ticket.status !== "CLOSED" && (
        <Card>
          <h2 className="mb-4 font-semibold text-ink">Répondre</h2>
          <form action={replyTicket} className="space-y-4">
            <input type="hidden" name="ticketId" value={ticket.id} />
            <textarea
              name="body"
              required
              rows={3}
              placeholder="Votre réponse..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <Button type="submit">Envoyer</Button>
          </form>
        </Card>
      )}

      {ticket.status === "CLOSED" && (
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ✅ Ce ticket a été résolu. Ouvrez un nouveau ticket si vous avez d'autres questions.
        </div>
      )}
    </div>
  );
}

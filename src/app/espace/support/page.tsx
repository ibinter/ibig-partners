import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Badge, Button, Card, EmptyState, Field, PageHeader } from "@/components/ui";
import { createTicket } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = { OPEN: "Ouvert", IN_PROGRESS: "En cours", CLOSED: "Résolu" };
const PRIORITY_LABELS: Record<string, string> = { LOW: "Faible", NORMAL: "Normal", HIGH: "Haute", URGENT: "Urgent" };
const STATUS_TONES: Record<string, "green" | "amber" | "gray" | "red" | "blue"> = {
  OPEN: "amber", IN_PROGRESS: "blue", CLOSED: "green",
};

export default async function SupportPage() {
  const user = await requireUser();

  const tickets = await prisma.ticket.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { messages: true } } },
  });

  return (
    <div>
      <PageHeader title="Support" subtitle="Posez vos questions à l'équipe IBIG PARTNERS." />

      <Card className="mb-6">
        <h2 className="mb-4 font-semibold text-ink">Nouveau ticket</h2>
        <form action={createTicket} className="space-y-4">
          <Field label="Sujet" name="subject" required placeholder="Ex: Commission non reçue sur vente VTE-0012" />
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Priorité</label>
            <select name="priority" className="rounded-lg border border-slate-300 px-3 py-2 text-sm w-full sm:w-auto">
              <option value="LOW">Faible</option>
              <option value="NORMAL" selected>Normal</option>
              <option value="HIGH">Haute</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Message</label>
            <textarea
              name="body"
              required
              rows={4}
              placeholder="Décrivez votre problème en détail..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <Button type="submit">Envoyer le ticket</Button>
        </form>
      </Card>

      <Card className="p-0">
        <h2 className="px-5 py-4 font-semibold text-ink">Mes tickets</h2>
        {tickets.length === 0 ? (
          <div className="px-5 pb-6">
            <EmptyState>Aucun ticket pour le moment.</EmptyState>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {tickets.map((t) => (
              <li key={t.id}>
                <Link href={`/espace/support/${t.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-ink">{t.subject}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {t._count.messages} message(s) · {PRIORITY_LABELS[t.priority]} · {formatDate(t.updatedAt)}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONES[t.status] ?? "slate"}>
                    {STATUS_LABELS[t.status] ?? t.status}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

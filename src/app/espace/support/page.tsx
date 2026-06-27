import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Badge, Button, EmptyState, Field, PageHeader } from "@/components/ui";
import { createTicket } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = { OPEN: "Ouvert", IN_PROGRESS: "En cours", CLOSED: "Résolu" };
const PRIORITY_LABELS: Record<string, string> = { LOW: "Faible", NORMAL: "Normal", HIGH: "Haute", URGENT: "Urgent" };
const STATUS_TONES: Record<string, "green" | "amber" | "gray" | "red" | "blue"> = {
  OPEN: "amber", IN_PROGRESS: "blue", CLOSED: "green",
};
const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600",
  NORMAL: "bg-blue-50 text-blue-600",
  HIGH: "bg-orange-50 text-orange-600",
  URGENT: "bg-rose-50 text-rose-600",
};

export default async function SupportPage() {
  const user = await requireUser();

  const tickets = await prisma.ticket.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { messages: true } } },
  });

  const openCount = tickets.filter(t => t.status === "OPEN").length;
  const closedCount = tickets.filter(t => t.status === "CLOSED").length;

  return (
    <div className="space-y-5">
      <PageHeader title="Support" subtitle="Posez vos questions à l'équipe IBIG PARTNERS." />

      {/* Stats rapides */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-4 text-white shadow-md">
          <p className="text-xs font-semibold text-amber-100 uppercase tracking-wide">Ouverts</p>
          <p className="text-2xl font-bold mt-1">{openCount}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-md">
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold mt-1">{tickets.length}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-md">
          <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wide">Résolus</p>
          <p className="text-2xl font-bold mt-1">{closedCount}</p>
        </div>
      </div>

      {/* Formulaire nouveau ticket */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
        <div className="mb-4">
          <h3 className="font-semibold text-ink text-sm">✉️ Nouveau ticket</h3>
          <p className="text-xs text-muted mt-0.5">Notre équipe répond sous 24-48h ouvrables.</p>
        </div>
        <form action={createTicket} className="space-y-4">
          <Field label="Sujet" name="subject" required placeholder="Ex: Commission non reçue sur vente VTE-0012" />
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Priorité</label>
            <select name="priority" className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm w-full sm:w-56 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition">
              <option value="LOW">Faible</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">Haute</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Message</label>
            <textarea
              name="body"
              required
              rows={4}
              placeholder="Décrivez votre problème en détail..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition placeholder:text-slate-400"
            />
          </div>
          <Button type="submit">Envoyer le ticket</Button>
        </form>
      </div>

      {/* Liste tickets */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50">
          <h3 className="font-semibold text-ink text-sm">Mes tickets</h3>
          <p className="text-xs text-muted mt-0.5">{tickets.length} ticket(s)</p>
        </div>
        {tickets.length === 0 ? (
          <div className="p-6"><EmptyState>Aucun ticket pour le moment.</EmptyState></div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {tickets.map((t) => (
              <li key={t.id}>
                <Link href={`/espace/support/${t.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition-colors group">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className={`mt-0.5 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shrink-0 ${PRIORITY_COLORS[t.priority]}`}>
                      {PRIORITY_LABELS[t.priority]}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-ink truncate group-hover:text-blue-600 transition-colors">{t.subject}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {t._count.messages} message(s) · {formatDate(t.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <Badge tone={STATUS_TONES[t.status] ?? "gray"}>
                    {STATUS_LABELS[t.status] ?? t.status}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Badge, Card, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

const STATUS_TONES: Record<string, "amber" | "blue" | "green"> = {
  OPEN: "amber", IN_PROGRESS: "blue", CLOSED: "green",
};
const STATUS_LABELS: Record<string, string> = { OPEN: "Ouvert", IN_PROGRESS: "En cours", CLOSED: "Résolu" };
const PRIORITY_COLORS: Record<string, string> = {
  LOW: "text-slate-500", NORMAL: "text-slate-700", HIGH: "text-amber-600", URGENT: "text-red-600",
};
const PRIORITY_LABELS: Record<string, string> = { LOW: "Faible", NORMAL: "Normal", HIGH: "Haute", URGENT: "Urgent" };

export default async function AdminTicketsPage({ searchParams }: { searchParams: Promise<{ priority?: string; status?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const priorityFilter = sp.priority;
  const statusFilter = sp.status;

  const tickets = await prisma.ticket.findMany({
    where: {
      ...(priorityFilter ? { priority: priorityFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    include: {
      user: { select: { firstName: true, lastName: true, code: true } },
      _count: { select: { messages: true } },
    },
  });

  const open = tickets.filter((t) => t.status !== "CLOSED").length;
  const urgent = tickets.filter((t) => t.priority === "URGENT" && t.status !== "CLOSED").length;

  return (
    <div>
      <PageHeader
        title="Tickets support"
        subtitle={`${open} ouvert(s)${urgent > 0 ? ` · ⚠ ${urgent} urgent(s)` : ""} · ${tickets.length} au total`}
      />

      {/* Filtres rapides */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { label: "Tous", href: "/admin/tickets" },
          { label: "🔴 Urgent", href: "/admin/tickets?priority=URGENT" },
          { label: "🟠 Haute", href: "/admin/tickets?priority=HIGH" },
          { label: "📂 Ouverts", href: "/admin/tickets?status=OPEN" },
          { label: "🔵 En cours", href: "/admin/tickets?status=IN_PROGRESS" },
          { label: "✅ Résolus", href: "/admin/tickets?status=CLOSED" },
        ].map((f) => (
          <a key={f.href} href={f.href} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            {f.label}
          </a>
        ))}
      </div>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-5 py-2">Sujet</th>
                <th className="px-3 py-2">Partenaire</th>
                <th className="px-3 py-2">Priorité</th>
                <th className="px-3 py-2">Messages</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">Mis à jour</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((t) => (
                <tr key={t.id} className={t.status === "OPEN" ? "bg-amber-50/30" : ""}>
                  <td className="px-5 py-3 font-medium text-ink max-w-[220px] truncate">{t.subject}</td>
                  <td className="px-3 py-3 text-xs">
                    <p>{t.user.firstName} {t.user.lastName}</p>
                    <p className="font-mono text-muted">{t.user.code}</p>
                  </td>
                  <td className={`px-3 py-3 text-xs font-semibold ${PRIORITY_COLORS[t.priority]}`}>
                    {PRIORITY_LABELS[t.priority]}
                  </td>
                  <td className="px-3 py-3 text-center">{t._count.messages}</td>
                  <td className="px-3 py-3">
                    <Badge tone={STATUS_TONES[t.status] ?? "slate"}>
                      {STATUS_LABELS[t.status] ?? t.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted">{formatDate(t.updatedAt)}</td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/admin/tickets/${t.id}`}
                      className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                    >
                      Répondre →
                    </Link>
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-muted">Aucun ticket.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

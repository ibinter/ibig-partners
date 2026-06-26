import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa, formatDate } from "@/lib/format";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { updateOpportunity } from "../actions";

export const dynamic = "force-dynamic";

const OPPORTUNITY_STATUS_LABELS: Record<string, string> = {
  NEW: "Nouveau",
  IN_PROGRESS: "En cours",
  WON: "Gagné",
  LOST: "Perdu",
};

const STATUS_OPTIONS = ["NEW", "IN_PROGRESS", "WON", "LOST"];

export default async function OpportunitesPage() {
  await requireAdmin();

  const opportunities = await prisma.opportunity.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      user: { select: { firstName: true, lastName: true, code: true } },
    },
  });

  const counts = {
    NEW: opportunities.filter((o) => o.status === "NEW").length,
    IN_PROGRESS: opportunities.filter((o) => o.status === "IN_PROGRESS").length,
    WON: opportunities.filter((o) => o.status === "WON").length,
    LOST: opportunities.filter((o) => o.status === "LOST").length,
  };

  return (
    <div>
      <PageHeader
        title="Opportunités B2B"
        subtitle="Pistes commerciales transmises par le réseau de partenaires."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {STATUS_OPTIONS.map((s) => (
          <Card key={s}>
            <p className="text-sm text-muted">{OPPORTUNITY_STATUS_LABELS[s]}</p>
            <p className="mt-1 text-2xl font-bold text-ink">{counts[s as keyof typeof counts]}</p>
          </Card>
        ))}
      </div>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-5 py-2">Opportunité</th>
                <th className="px-3 py-2">Valeur est.</th>
                <th className="px-3 py-2">Partenaire</th>
                <th className="px-3 py-2">Chargé</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {opportunities.map((o) => (
                <tr key={o.id} className={o.status === "NEW" ? "bg-amber-50/30" : ""}>
                  <td className="px-5 py-2">
                    <p className="font-medium text-ink">{o.title}</p>
                    <p className="mt-0.5 text-xs text-muted line-clamp-2 max-w-[240px]">{o.description}</p>
                  </td>
                  <td className="px-3 py-2 font-semibold text-ink">
                    {o.estimatedValue > 0 ? fcfa(o.estimatedValue) : <span className="text-muted">—</span>}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <p>{o.user.firstName} {o.user.lastName}</p>
                    <p className="font-mono text-muted">{o.user.code}</p>
                  </td>
                  <td className="px-3 py-2 text-xs">{o.handler ?? <span className="text-muted">—</span>}</td>
                  <td className="px-3 py-2">
                    <Badge tone={o.status === "WON" ? "green" : o.status === "LOST" ? "red" : o.status === "IN_PROGRESS" ? "blue" : "amber"}>
                      {OPPORTUNITY_STATUS_LABELS[o.status] ?? o.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted">{formatDate(o.createdAt)}</td>
                  <td className="px-3 py-2">
                    <form action={updateOpportunity} className="flex flex-col gap-1">
                      <input type="hidden" name="id" value={o.id} />
                      <select
                        name="status"
                        defaultValue={o.status}
                        className="rounded border border-slate-300 px-2 py-1 text-xs"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{OPPORTUNITY_STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                      <input
                        name="handler"
                        defaultValue={o.handler ?? ""}
                        placeholder="Chargé de compte"
                        className="rounded border border-slate-300 px-2 py-1 text-xs"
                      />
                      <Button type="submit" variant="secondary">Mettre à jour</Button>
                    </form>
                  </td>
                </tr>
              ))}
              {opportunities.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-muted">Aucune opportunité soumise.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNetwork } from "@/lib/metrics";
import { fcfa, formatDate } from "@/lib/format";
import { Badge, Button, Card, EmptyState, Field, PageHeader, statusTone } from "@/components/ui";
import { OPPORTUNITY_STATUS_LABELS, STATUS_LABELS } from "@/lib/constants";
import { submitOpportunity } from "../actions";

export const dynamic = "force-dynamic";

export default async function ReseauPage() {
  const user = await requireUser();
  const network = await getNetwork(user.id);
  const opportunities = await prisma.opportunity.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const byLevel = (lvl: number) => network.filter((m) => m.level === lvl);

  return (
    <div>
      <PageHeader
        title="Mon Réseau"
        subtitle="Vos filleuls sur 3 niveaux. Vous percevez des commissions sur leurs ventes (N2 et N3)."
      />

      <div className="space-y-6">
        {[1, 2, 3].map((lvl) => {
          const members = byLevel(lvl);
          return (
            <Card key={lvl} className="p-0">
              <div className="flex items-center justify-between px-5 py-3">
                <h2 className="font-semibold text-ink">
                  Niveau {lvl}{" "}
                  <span className="text-muted">
                    ({lvl === 1 ? "filleuls directs" : lvl === 2 ? "filleuls de vos filleuls" : "3ᵉ niveau"})
                  </span>
                </h2>
                <Badge tone="blue">{members.length}</Badge>
              </div>
              {members.length === 0 ? (
                <p className="px-5 pb-4 text-sm text-muted">Aucun filleul à ce niveau.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-y border-slate-100 bg-slate-50 text-left text-xs uppercase text-muted">
                      <tr>
                        <th className="px-5 py-2">Partenaire</th>
                        <th className="px-3 py-2">Code</th>
                        <th className="px-3 py-2">Statut</th>
                        <th className="px-3 py-2">Ventes</th>
                        <th className="px-3 py-2">État</th>
                        <th className="px-3 py-2">Inscrit le</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {members.map((m) => (
                        <tr key={m.id}>
                          <td className="px-5 py-2 font-medium text-ink">{m.firstName} {m.lastName}</td>
                          <td className="px-3 py-2 font-mono text-xs text-muted">{m.code}</td>
                          <td className="px-3 py-2">{STATUS_LABELS[m.status]}</td>
                          <td className="px-3 py-2">{m.salesCount}</td>
                          <td className="px-3 py-2">
                            {!m.approved ? (
                              <Badge tone="amber">En validation</Badge>
                            ) : m.active ? (
                              <Badge tone="green">Actif</Badge>
                            ) : (
                              <Badge tone="red">Inactif</Badge>
                            )}
                          </td>
                          <td className="px-3 py-2 text-muted">{formatDate(m.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Opportunités B2B (section 2.1) */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-ink">Apporter une opportunité d&apos;affaires</h2>
          <p className="mt-1 text-sm text-muted">
            Marché, collaboration, représentation, appel d&apos;offres… Toute
            opportunité aboutissant à une collaboration signée est commissionnée
            par accord écrit.
          </p>
          <form action={submitOpportunity} className="mt-4 space-y-3">
            <Field label="Titre de l'opportunité" name="title" required placeholder="Ex : digitalisation mairie de Cocody" />
            <Field label="Valeur estimée (FCFA)" name="estimatedValue" type="number" placeholder="0" />
            <Field label="Description" name="description">
              <textarea
                name="description"
                required
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Contexte, contact, nature de la collaboration…"
              />
            </Field>
            <Button type="submit">Soumettre l&apos;opportunité</Button>
          </form>
        </Card>

        <Card className="p-0">
          <h2 className="px-5 py-4 font-semibold text-ink">Mes opportunités soumises</h2>
          {opportunities.length === 0 ? (
            <div className="px-5 pb-6"><EmptyState>Aucune opportunité soumise.</EmptyState></div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {opportunities.map((o) => (
                <li key={o.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-ink">{o.title}</p>
                    <Badge tone={statusTone(o.status)}>{OPPORTUNITY_STATUS_LABELS[o.status]}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted">{o.description}</p>
                  {o.estimatedValue > 0 && (
                    <p className="mt-1 text-xs text-muted">Valeur estimée : {fcfa(o.estimatedValue)}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

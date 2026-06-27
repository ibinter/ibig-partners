import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNetwork } from "@/lib/metrics";
import { fcfa, formatDate } from "@/lib/format";
import { Badge, Button, EmptyState, Field, PageHeader, StatCard, statusTone } from "@/components/ui";
import { OPPORTUNITY_STATUS_LABELS, STATUS_LABELS } from "@/lib/constants";
import { submitOpportunity } from "../actions";

export const dynamic = "force-dynamic";

const LEVEL_COLORS = [
  { bg: "bg-blue-600", label: "Filleuls directs" },
  { bg: "bg-violet-600", label: "Filleuls de vos filleuls" },
  { bg: "bg-emerald-600", label: "3ᵉ niveau" },
];

export default async function ReseauPage() {
  const user = await requireUser();
  const network = await getNetwork(user.id);
  const opportunities = await prisma.opportunity.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const byLevel = (lvl: number) => network.filter((m) => m.level === lvl);
  const counts = [1, 2, 3].map((l) => byLevel(l).length);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mon Réseau"
        subtitle="Vos filleuls sur 3 niveaux — commissions sur leurs ventes N2 et N3."
      />

      {/* Stats réseau */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Filleuls N1" value={counts[0]} sub="directs" accent="brand" icon="👤" />
        <StatCard label="Filleuls N2" value={counts[1]} sub="de vos filleuls" accent="purple" icon="👥" />
        <StatCard label="Filleuls N3" value={counts[2]} sub="3ᵉ niveau" accent="green" icon="🌳" />
      </div>

      {/* Tableaux par niveau */}
      {[1, 2, 3].map((lvl) => {
        const members = byLevel(lvl);
        const col = LEVEL_COLORS[lvl - 1];
        return (
          <div key={lvl} className="card-premium overflow-hidden">
            <div className={`${col.bg} px-5 py-3 flex items-center justify-between`}>
              <div>
                <h3 className="font-semibold text-sm text-white">Niveau {lvl}</h3>
                <p className="text-xs text-white/70 mt-0.5">{col.label}</p>
              </div>
              <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white">
                {members.length} filleul(s)
              </span>
            </div>
            {members.length === 0 ? (
              <p className="px-5 py-5 text-sm text-muted">Aucun filleul à ce niveau.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs text-muted">
                    <tr>
                      <th className="px-5 py-3 font-semibold uppercase tracking-wide">Partenaire</th>
                      <th className="px-3 py-3 font-semibold uppercase tracking-wide">Code</th>
                      <th className="px-3 py-3 font-semibold uppercase tracking-wide">Statut</th>
                      <th className="px-3 py-3 font-semibold uppercase tracking-wide">Ventes</th>
                      <th className="px-3 py-3 font-semibold uppercase tracking-wide">État</th>
                      <th className="px-3 py-3 font-semibold uppercase tracking-wide">Inscrit le</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3 font-semibold text-ink">{m.firstName} {m.lastName}</td>
                        <td className="px-3 py-3 font-mono text-xs text-muted">{m.code}</td>
                        <td className="px-3 py-3 text-sm text-muted">{STATUS_LABELS[m.status]}</td>
                        <td className="px-3 py-3 font-bold text-ink">{m.salesCount}</td>
                        <td className="px-3 py-3">
                          {!m.approved ? (
                            <Badge tone="amber">En validation</Badge>
                          ) : m.active ? (
                            <Badge tone="green">Actif</Badge>
                          ) : (
                            <Badge tone="red">Inactif</Badge>
                          )}
                        </td>
                        <td className="px-3 py-3 text-xs text-muted">{formatDate(m.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {/* Opportunités B2B */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card-premium p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-ink text-sm">💼 Apporter une opportunité</h3>
            <p className="text-xs text-muted mt-1">Marché, collaboration, appel d&apos;offres… Toute opportunité signée est commissionnée par accord écrit.</p>
          </div>
          <form action={submitOpportunity} className="space-y-3">
            <Field label="Titre de l'opportunité" name="title" required placeholder="Ex : digitalisation mairie de Cocody" />
            <Field label="Valeur estimée (FCFA)" name="estimatedValue" type="number" placeholder="0" />
            <Field label="Description" name="description">
              <textarea
                name="description"
                required
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100 placeholder:text-slate-400"
                placeholder="Contexte, contact, nature de la collaboration…"
              />
            </Field>
            <Button type="submit" className="w-full">Soumettre l&apos;opportunité</Button>
          </form>
        </div>

        <div className="card-premium overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50">
            <h3 className="font-semibold text-ink text-sm">Mes opportunités soumises</h3>
            <p className="text-xs text-muted mt-0.5">{opportunities.length} soumise(s)</p>
          </div>
          {opportunities.length === 0 ? (
            <div className="p-6"><EmptyState>Aucune opportunité soumise.</EmptyState></div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {opportunities.map((o) => (
                <li key={o.id} className="px-5 py-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <p className="font-semibold text-sm text-ink">{o.title}</p>
                    <Badge tone={statusTone(o.status)}>{OPPORTUNITY_STATUS_LABELS[o.status]}</Badge>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{o.description}</p>
                  {o.estimatedValue > 0 && (
                    <p className="mt-1.5 text-xs font-semibold text-blue-600">Valeur estimée : {fcfa(o.estimatedValue)}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

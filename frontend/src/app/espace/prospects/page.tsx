import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Badge, Button, EmptyState, Field, PageHeader, StatCard, statusTone } from "@/components/ui";
import { PROSPECT_STATUS_LABELS } from "@/lib/constants";
import { addProspect, deleteProspect, updateProspectStatus } from "../actions";
import { ProspectImport } from "./ProspectImport";

export const dynamic = "force-dynamic";

const NEXT_STATUS: Record<string, string> = {
  CONTACTED: "DEMO",
  DEMO: "CONVERTED",
};

export default async function ProspectsPage() {
  const user = await requireUser();
  const prospects = await prisma.prospect.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const counts = {
    contacted: prospects.filter(p => p.status === "CONTACTED").length,
    demo: prospects.filter(p => p.status === "DEMO").length,
    converted: prospects.filter(p => p.status === "CONVERTED").length,
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mes Prospects"
        subtitle="Suivez vos leads : contacté → démo → converti."
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Contactés" value={counts.contacted} accent="gold" icon="📞" />
        <StatCard label="En démo" value={counts.demo} accent="brand" icon="🎯" />
        <StatCard label="Convertis" value={counts.converted} accent="green" icon="🎉" />
      </div>

      {/* Import en masse */}
      <ProspectImport />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Formulaire ajout */}
        <div className="card-premium p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-ink text-sm">➕ Ajouter un prospect</h3>
            <p className="text-xs text-muted mt-0.5">Suivez vos leads dans le pipeline.</p>
          </div>
          <form action={addProspect} className="space-y-3">
            <Field label="Nom / entreprise" name="name" required />
            <Field label="Contact" name="contact" placeholder="Téléphone ou email" />
            <Field label="Produit visé" name="productId">
              <select
                name="productId"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
              >
                <option value="">— Choisir un produit</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Note" name="note" placeholder="Observations..." />
            <Button type="submit" className="w-full">Ajouter le prospect</Button>
          </form>
        </div>

        {/* Tableau prospects */}
        <div className="lg:col-span-2 card-premium overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50">
            <h3 className="font-semibold text-ink text-sm">Pipeline de prospects</h3>
            <p className="text-xs text-muted mt-0.5">{prospects.length} prospect(s) au total</p>
          </div>
          {prospects.length === 0 ? (
            <div className="p-6"><EmptyState>Aucun prospect. Ajoutez votre premier lead !</EmptyState></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs text-muted">
                  <tr>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wide">Prospect</th>
                    <th className="px-3 py-3 font-semibold uppercase tracking-wide">Contact</th>
                    <th className="px-3 py-3 font-semibold uppercase tracking-wide">Statut</th>
                    <th className="px-3 py-3 font-semibold uppercase tracking-wide">Date</th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {prospects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-ink">{p.name}</p>
                        {p.note && <p className="text-xs text-muted mt-0.5">{p.note}</p>}
                      </td>
                      <td className="px-3 py-3 text-muted text-xs">{p.contact ?? "—"}</td>
                      <td className="px-3 py-3">
                        <Badge tone={statusTone(p.status)}>{PROSPECT_STATUS_LABELS[p.status]}</Badge>
                      </td>
                      <td className="px-3 py-3 text-xs text-muted">{formatDate(p.createdAt)}</td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-1">
                          {NEXT_STATUS[p.status] && (
                            <form action={updateProspectStatus}>
                              <input type="hidden" name="id" value={p.id} />
                              <input type="hidden" name="status" value={NEXT_STATUS[p.status]} />
                              <Button type="submit" variant="secondary">→ {PROSPECT_STATUS_LABELS[NEXT_STATUS[p.status]]}</Button>
                            </form>
                          )}
                          {p.status !== "LOST" && p.status !== "CONVERTED" && (
                            <form action={updateProspectStatus}>
                              <input type="hidden" name="id" value={p.id} />
                              <input type="hidden" name="status" value="LOST" />
                              <Button type="submit" variant="ghost">Perdu</Button>
                            </form>
                          )}
                          <form action={deleteProspect}>
                            <input type="hidden" name="id" value={p.id} />
                            <Button type="submit" variant="ghost">🗑</Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Badge, Button, Card, EmptyState, Field, PageHeader, statusTone } from "@/components/ui";
import { PROSPECT_STATUS_LABELS } from "@/lib/constants";
import { addProspect, deleteProspect, updateProspectStatus } from "../actions";

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

  return (
    <div>
      <PageHeader
        title="Mes Prospects"
        subtitle="Suivez vos leads : contacté → démo → converti."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <h2 className="font-semibold text-ink">Ajouter un prospect</h2>
          <form action={addProspect} className="mt-4 space-y-3">
            <Field label="Nom / entreprise" name="name" required />
            <Field label="Contact" name="contact" placeholder="Téléphone ou email" />
            <Field label="Produit visé" name="productId">
              <select
                name="productId"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="">—</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Note" name="note" />
            <Button type="submit" className="w-full">Ajouter</Button>
          </form>
        </Card>

        <Card className="p-0 lg:col-span-2">
          {prospects.length === 0 ? (
            <div className="p-6"><EmptyState>Aucun prospect. Ajoutez votre premier lead !</EmptyState></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-muted">
                  <tr>
                    <th className="px-5 py-2">Prospect</th>
                    <th className="px-3 py-2">Contact</th>
                    <th className="px-3 py-2">Statut</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prospects.map((p) => (
                    <tr key={p.id}>
                      <td className="px-5 py-2">
                        <p className="font-medium text-ink">{p.name}</p>
                        {p.note && <p className="text-xs text-muted">{p.note}</p>}
                      </td>
                      <td className="px-3 py-2 text-muted">{p.contact ?? "—"}</td>
                      <td className="px-3 py-2"><Badge tone={statusTone(p.status)}>{PROSPECT_STATUS_LABELS[p.status]}</Badge></td>
                      <td className="px-3 py-2 text-muted">{formatDate(p.createdAt)}</td>
                      <td className="px-3 py-2">
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
        </Card>
      </div>
    </div>
  );
}

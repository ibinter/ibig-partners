import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa } from "@/lib/format";
import { Badge, Button, Card, Field, PageHeader } from "@/components/ui";
import { PRICING_TYPE_LABELS } from "@/lib/constants";
import { toggleBranch, toggleProductActive, updateProductRate } from "../actions";

export const dynamic = "force-dynamic";

export default async function BranchesPage() {
  await requireAdmin();

  const branches = await prisma.branch.findMany({
    orderBy: { name: "asc" },
    include: {
      products: {
        orderBy: { name: "asc" },
        include: { _count: { select: { sales: true, links: true } } },
      },
    },
  });

  return (
    <div>
      <PageHeader
        title="Branches & Produits"
        subtitle="Activez ou désactivez les branches et produits, ajustez les taux de commission."
      />

      <div className="space-y-6">
        {branches.map((branch) => (
          <Card key={branch.id} className={!branch.active ? "opacity-60" : ""}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-ink">{branch.name}</h2>
                {branch.description && <p className="mt-0.5 text-sm text-muted">{branch.description}</p>}
                <p className="mt-1 text-xs text-muted">{branch.products.length} produits</p>
              </div>
              <form action={toggleBranch} className="flex-shrink-0">
                <input type="hidden" name="id" value={branch.id} />
                <input type="hidden" name="active" value={(!branch.active).toString()} />
                <Button type="submit" variant={branch.active ? "ghost" : "secondary"}>
                  {branch.active ? "Désactiver la branche" : "Activer la branche"}
                </Button>
              </form>
            </div>

            {branch.products.length > 0 && (
              <div className="mt-4 overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-muted">
                    <tr>
                      <th className="px-4 py-2">Produit</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Prix</th>
                      <th className="px-3 py-2">Taux (%)</th>
                      <th className="px-3 py-2">Affiliés</th>
                      <th className="px-3 py-2">Ventes</th>
                      <th className="px-3 py-2">État</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {branch.products.map((p) => (
                      <tr key={p.id} className={!p.active ? "opacity-50" : ""}>
                        <td className="px-4 py-2 font-medium text-ink">{p.name}</td>
                        <td className="px-3 py-2 text-xs text-muted">{PRICING_TYPE_LABELS[p.pricingType]}</td>
                        <td className="px-3 py-2">{fcfa(p.price)}</td>
                        <td className="px-3 py-2">
                          <form action={updateProductRate} className="flex items-center gap-2">
                            <input type="hidden" name="id" value={p.id} />
                            <input
                              name="rate"
                              type="number"
                              defaultValue={p.rate}
                              min={0}
                              max={100}
                              step={1}
                              className="w-16 rounded border border-slate-300 px-2 py-1 text-xs"
                            />
                            <Button type="submit" variant="ghost">OK</Button>
                          </form>
                        </td>
                        <td className="px-3 py-2 text-xs text-muted">{p._count.links}</td>
                        <td className="px-3 py-2 text-xs text-muted">{p._count.sales}</td>
                        <td className="px-3 py-2">
                          <Badge tone={p.active ? "green" : "slate"}>
                            {p.active ? "Actif" : "Inactif"}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          <form action={toggleProductActive}>
                            <input type="hidden" name="id" value={p.id} />
                            <input type="hidden" name="active" value={(!p.active).toString()} />
                            <Button type="submit" variant="ghost">
                              {p.active ? "Désactiver" : "Activer"}
                            </Button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

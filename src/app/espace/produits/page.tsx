import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa } from "@/lib/format";
import { Badge, Button, PageHeader } from "@/components/ui";
import { PRICING_TYPE_LABELS } from "@/lib/constants";
import { toggleProduct } from "../actions";

export const dynamic = "force-dynamic";

export default async function ProduitsPage() {
  const user = await requireUser();
  const branches = await prisma.branch.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: { products: { where: { active: true }, orderBy: { name: "asc" } } },
  });
  const links = await prisma.affiliateLink.findMany({ where: { userId: user.id } });
  const activeProductIds = new Set(links.map((l) => l.productId));

  return (
    <div>
      <PageHeader
        title="Mes Produits"
        subtitle="Activez les produits que vous souhaitez promouvoir. Un lien d'affiliation est créé automatiquement."
      />

      <div className="space-y-6">
        {branches.map((b) => (
          <div key={b.id} className="card p-0">
            <div className="border-b border-slate-100 px-5 py-3">
              <h2 className="font-semibold text-brand-700">{b.name}</h2>
              <p className="text-xs text-muted">{b.commissionModel}</p>
            </div>
            <div className="divide-y divide-slate-100">
              {b.products.length === 0 && (
                <p className="px-5 py-4 text-sm text-muted">Aucun produit affiliable pour l&apos;instant.</p>
              )}
              {b.products.map((p) => {
                const active = activeProductIds.has(p.id);
                return (
                  <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                    <div>
                      <p className="font-medium text-ink">{p.name}</p>
                      <p className="text-xs text-muted">
                        {PRICING_TYPE_LABELS[p.pricingType]} · {fcfa(p.price)}
                        {p.pricingType === "MONTHLY_SUB" ? "/mois" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {active ? (
                        <Badge tone="green">Activé</Badge>
                      ) : (
                        <Badge tone="gray">Inactif</Badge>
                      )}
                      <form action={toggleProduct}>
                        <input type="hidden" name="productId" value={p.id} />
                        <Button type="submit" variant={active ? "ghost" : "secondary"}>
                          {active ? "Désactiver" : "Activer"}
                        </Button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa } from "@/lib/format";
import { Badge, Button, PageHeader } from "@/components/ui";
import { PRICING_TYPE_LABELS } from "@/lib/constants";
import { toggleProduct } from "../actions";

export const dynamic = "force-dynamic";

const BRANCH_COLORS: Record<number, { bg: string; text: string; dot: string }> = {
  0: { bg: "bg-blue-600", text: "text-white", dot: "bg-blue-400" },
  1: { bg: "bg-emerald-600", text: "text-white", dot: "bg-emerald-400" },
  2: { bg: "bg-violet-600", text: "text-white", dot: "bg-violet-400" },
  3: { bg: "bg-amber-500", text: "text-white", dot: "bg-amber-300" },
  4: { bg: "bg-rose-500", text: "text-white", dot: "bg-rose-300" },
};

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
    <div className="space-y-5">
      <PageHeader
        title="Mes Produits"
        subtitle="Activez les produits à promouvoir — un lien d'affiliation est créé automatiquement."
      />

      {branches.map((b, idx) => {
        const colors = BRANCH_COLORS[idx % 5];
        const activeCount = b.products.filter(p => activeProductIds.has(p.id)).length;
        return (
          <div key={b.id} className="card-premium overflow-hidden">
            {/* En-tête colorée */}
            <div className={`${colors.bg} px-5 py-3 flex items-center justify-between`}>
              <div>
                <h3 className={`font-semibold text-sm ${colors.text}`}>{b.name}</h3>
                <p className={`text-xs ${colors.text} opacity-70 mt-0.5`}>{b.commissionModel}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white">
                  {activeCount} activé(s)
                </span>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white">
                  {b.products.length} produit(s)
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {b.products.length === 0 && (
                <p className="px-5 py-4 text-sm text-muted">Aucun produit affiliable pour l&apos;instant.</p>
              )}
              {b.products.map((p) => {
                const active = activeProductIds.has(p.id);
                return (
                  <div key={p.id} className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-colors ${active ? "bg-blue-50/40" : "hover:bg-slate-50/60"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${active ? "bg-emerald-500" : "bg-slate-300"}`} />
                      <div>
                        <p className="font-semibold text-sm text-ink">{p.name}</p>
                        <p className="text-xs text-muted">
                          {PRICING_TYPE_LABELS[p.pricingType]} · <span className="font-medium text-ink">{fcfa(p.price)}</span>
                          {p.pricingType === "MONTHLY_SUB" ? "/mois" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone={active ? "green" : "gray"}>{active ? "✓ Activé" : "Inactif"}</Badge>
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
        );
      })}
    </div>
  );
}

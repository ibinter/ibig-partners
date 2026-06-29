import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { effectiveRate } from "@/lib/commissions";
import { fcfa, pct } from "@/lib/format";
import { Badge, Button, PageHeader } from "@/components/ui";
import { PRICING_TYPE_LABELS, type PricingType } from "@/lib/constants";
import { toggleProduct } from "../actions";
import CopyButton from "../liens/copy-button";

export const dynamic = "force-dynamic";

const BRANCH_COLORS = [
  "from-blue-600 to-blue-700",
  "from-emerald-600 to-teal-700",
  "from-violet-600 to-purple-700",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
];

function destinationUrl(siteUrl: string | null) {
  if (!siteUrl) return null;
  return siteUrl.startsWith("http://") || siteUrl.startsWith("https://")
    ? siteUrl
    : `https://${siteUrl}`;
}

export default async function ProduitsPage() {
  const user = await requireUser();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const branches = await prisma.branch.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: { products: { where: { active: true }, orderBy: { name: "asc" } } },
  });
  const links = await prisma.affiliateLink.findMany({ where: { userId: user.id } });
  const linkByProduct = new Map(links.map((link) => [link.productId, link]));
  const products = branches.flatMap((branch) => branch.products);
  const documentedProducts = products.filter((product) => product.description && product.siteUrl).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catalogue des offres"
        subtitle="Comprenez chaque offre, consultez sa destination publique et activez les produits que vous souhaitez promouvoir."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Offres disponibles</p>
          <p className="mt-1 text-2xl font-bold">{products.length}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">Mes offres activées</p>
          <p className="mt-1 text-2xl font-bold">{links.length}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 p-4 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Fiches complètes</p>
          <p className="mt-1 text-2xl font-bold">{documentedProducts}/{products.length}</p>
        </div>
      </div>

      {branches.map((branch, index) => {
        const gradient = BRANCH_COLORS[index % BRANCH_COLORS.length];
        const activeCount = branch.products.filter((product) => linkByProduct.has(product.id)).length;

        return (
          <section key={branch.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className={`bg-gradient-to-r ${gradient} px-5 py-5 text-white`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">{branch.offerType}</p>
                  <h2 className="mt-1 text-xl font-bold text-white">{branch.name}</h2>
                  {branch.tagline && <p className="mt-1 text-sm font-medium text-white/90">{branch.tagline}</p>}
                  {branch.description && <p className="mt-2 text-sm leading-relaxed text-white/75">{branch.description}</p>}
                </div>
                <div className="rounded-xl bg-white/15 px-4 py-2 text-right backdrop-blur-sm">
                  <p className="text-xs text-white/70">Modèle de commission</p>
                  <p className="text-sm font-bold">{branch.commissionModel}</p>
                  <p className="mt-1 text-xs text-white/70">{activeCount}/{branch.products.length} activée(s)</p>
                </div>
              </div>
            </div>

            {branch.products.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted">Aucune offre affiliable pour le moment.</p>
            ) : (
              <div className="grid gap-4 p-4 lg:grid-cols-2">
                {branch.products.map((product) => {
                  const affiliateLink = linkByProduct.get(product.id);
                  const active = Boolean(affiliateLink);
                  const destination = destinationUrl(product.siteUrl);
                  const rate = effectiveRate(
                    product.pricingType as PricingType,
                    1,
                    1,
                    product.rate,
                    user.status,
                  );
                  const estimatedCommission = product.price > 0 ? Math.round(product.price * rate) : 0;
                  const publicAffiliateUrl = `${baseUrl}/aff/${user.code}?p=${product.slug}`;

                  return (
                    <article
                      key={product.id}
                      className={`flex flex-col rounded-2xl border p-5 transition-shadow hover:shadow-md ${
                        active ? "border-blue-200 bg-blue-50/30" : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                            {PRICING_TYPE_LABELS[product.pricingType] ?? product.pricingType}
                          </p>
                          <h3 className="mt-1 text-lg font-bold text-ink">{product.name}</h3>
                        </div>
                        <Badge tone={active ? "green" : "gray"}>{active ? "✓ Activée" : "À activer"}</Badge>
                      </div>

                      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                        {product.description || "La présentation détaillée de cette offre sera bientôt ajoutée par l’équipe IBIG."}
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Prix public</p>
                          <p className="mt-0.5 font-bold text-ink">
                            {product.price > 0 ? fcfa(product.price) : "Sur devis"}
                            {product.pricingType === "MONTHLY_SUB" ? "/mois" : ""}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Votre commission N1</p>
                          <p className="mt-0.5 font-bold text-emerald-700">
                            {pct(rate)}{estimatedCommission > 0 ? ` · ${fcfa(estimatedCommission)}` : ""}
                          </p>
                        </div>
                      </div>

                      {active && (
                        <div className="mt-4 rounded-xl border border-blue-100 bg-white p-3">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600">Votre lien public de vente</p>
                          <p className="mt-1 break-all font-mono text-xs leading-relaxed text-slate-500">{publicAffiliateUrl}</p>
                          <div className="mt-2"><CopyButton text={publicAffiliateUrl} /></div>
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {destination ? (
                          <a
                            href={destination}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                          >
                            Découvrir l’offre ↗
                          </a>
                        ) : (
                          <span className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                            Destination publique à compléter
                          </span>
                        )}
                        <form action={toggleProduct}>
                          <input type="hidden" name="productId" value={product.id} />
                          <Button type="submit" variant={active ? "ghost" : "primary"}>
                            {active ? "Désactiver" : "Activer cette offre"}
                          </Button>
                        </form>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

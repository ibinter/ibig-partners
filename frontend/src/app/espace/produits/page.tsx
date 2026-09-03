import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { effectiveRate } from "@/lib/commissions";
import { fcfa, pct } from "@/lib/format";
import { PageHeader } from "@/components/ui";
import { type PricingType } from "@/lib/constants";
import ProduitsClient from "./produits-client";

export const dynamic = "force-dynamic";

const BRANCH_COLORS = [
  "from-blue-600 to-blue-700",
  "from-emerald-600 to-teal-700",
  "from-violet-600 to-purple-700",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
];

export default async function ProduitsPage() {
  const user = await requireUser();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Préférences sectorielles de l'affilié
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { marketSectors: true } as any,
  });
  const marketSectors: string[] = (dbUser as any)?.marketSectors
    ? ((dbUser as any).marketSectors as string).split(",").filter(Boolean)
    : [];

  const branches = await prisma.branch.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: { products: { where: { active: true }, orderBy: { name: "asc" } } },
  });

  const links = await prisma.affiliateLink.findMany({ where: { userId: user.id } });
  const linkByProduct = new Map(links.map((link) => [link.productId, link]));

  const allProducts = branches.flatMap((b) => b.products);
  const totalDocumented = allProducts.filter((p) => p.description && p.siteUrl).length;

  const serializedBranches = branches.map((branch, index) => {
    const activeCount = branch.products.filter((p) => linkByProduct.has(p.id)).length;
    return {
      id: branch.id,
      name: branch.name,
      tagline: branch.tagline ?? null,
      description: branch.description ?? null,
      offerType: branch.offerType,
      commissionModel: branch.commissionModel,
      gradient: BRANCH_COLORS[index % BRANCH_COLORS.length],
      activeCount,
      products: branch.products.map((product) => {
        const affiliateLink = linkByProduct.get(product.id);
        const rate = effectiveRate(
          product.pricingType as PricingType,
          1,
          1,
          product.rate,
          user.status,
        );
        const estimatedCommission = product.price > 0 ? Math.round(product.price * rate) : 0;
        const isCourse = product.pricingType === "COURSE";
        // Pour les formations : commission min (e-learning 50%) et max (individuel 100%)
        const commissionMin = isCourse && product.price > 0
          ? Math.round(Math.round(product.price * 0.5 / 5000) * 5000 * rate)
          : null;
        const affiliateUrl = affiliateLink
          ? `${baseUrl}/aff/${user.code}?p=${product.slug}`
          : null;
        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description ?? null,
          siteUrl: product.siteUrl ?? null,
          price: product.price,
          pricingType: product.pricingType,
          rate,
          commissionDisplay: isCourse && commissionMin && estimatedCommission > 0
            ? `${pct(rate)} · ${fcfa(commissionMin)} → ${fcfa(estimatedCommission)}`
            : pct(rate) + (estimatedCommission > 0 ? ` · ${fcfa(estimatedCommission)}` : ""),
          commissionMin,
          commissionMax: estimatedCommission,
          priceDisplay:
            product.price > 0
              ? fcfa(product.price) +
                (product.pricingType === "MONTHLY_SUB"
                  ? "/mois"
                  : product.pricingType === "ANNUAL_SUB"
                  ? "/an"
                  : "")
              : "Sur devis",
          affiliateUrl,
          category: product.category ?? null,
        };
      }),
    };
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Catalogue des offres"
        subtitle="Filtrez, recherchez et activez les produits que vous souhaitez promouvoir."
      />
      <ProduitsClient
        branches={serializedBranches}
        totalProducts={allProducts.length}
        totalActive={links.length}
        totalDocumented={totalDocumented}
        marketSectors={marketSectors}
        affiliateCode={user.code ?? ""}
      />
    </div>
  );
}

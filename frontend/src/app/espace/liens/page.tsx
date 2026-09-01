import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa, pct } from "@/lib/format";
import { PageHeader } from "@/components/ui";
import { COOKIE_TRACKING_DAYS, type PricingType } from "@/lib/constants";
import { effectiveRate } from "@/lib/commissions";
import LiensClient from "./liens-client";

export const dynamic = "force-dynamic";

export default async function LiensPage() {
  const user    = await requireUser();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const [links, salesByProduct] = await Promise.all([
    prisma.affiliateLink.findMany({
      where: { userId: user.id },
      include: { product: { include: { branch: true } } },
      orderBy: { clicks: "desc" },
    }),
    prisma.sale.groupBy({
      by: ["productId"],
      where: { sellerId: user.id, status: "CONFIRMED" },
      _count: { id: true },
    }),
  ]);

  const salesMap = new Map(salesByProduct.map((s) => [s.productId, s._count.id]));

  const totalClicks = links.reduce((a, l) => a + l.clicks, 0);
  const totalSales  = salesByProduct.reduce((a, s) => a + s._count.id, 0);
  const branches    = [...new Set(links.map((l) => l.product.branch.name))].sort();

  const PRICING_SUFFIX: Record<string, string> = {
    MONTHLY_SUB: "/mois",
    ANNUAL_SUB: "/an",
  };

  const cards = links.map((l) => {
    const rate = effectiveRate(
      l.product.pricingType as PricingType,
      1,
      1,
      l.product.rate,
      user.status,
    );
    const est = l.product.price > 0 ? Math.round(l.product.price * rate) : 0;
    const suffix = PRICING_SUFFIX[l.product.pricingType] ?? "";
    return {
      id: l.id,
      productName: l.product.name,
      productSlug: l.product.slug,
      branchName: l.product.branch.name,
      pricingType: l.product.pricingType,
      price: l.product.price,
      priceDisplay:
        l.product.price > 0
          ? `${fcfa(l.product.price)}${suffix}`
          : "Sur devis",
      commissionDisplay:
        pct(rate) + (est > 0 ? ` · ${fcfa(est)}` : ""),
      clicks: l.clicks,
      sales: salesMap.get(l.productId) ?? 0,
      url: `${baseUrl}/aff/${user.code}?p=${l.product.slug}`,
      affiliateCode: user.code,
      partnerName: `${user.firstName} ${user.lastName}`,
      baseUrl,
    };
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mes Liens d'affiliation"
        subtitle={`Code partenaire : ${user.code} · Cookie tracking ${COOKIE_TRACKING_DAYS} jours · Commission attribuée automatiquement`}
      />

      {/* ── 4 KPIs ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-200">Liens actifs</p>
          <p className="mt-1 text-2xl font-extrabold">{links.length}</p>
          <p className="mt-0.5 text-xs text-blue-200">produits activés</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">Clics totaux</p>
          <p className="mt-1 text-2xl font-extrabold">{totalClicks.toLocaleString("fr-FR")}</p>
          <p className="mt-0.5 text-xs text-slate-400">depuis le début</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200">Ventes confirmées</p>
          <p className="mt-1 text-2xl font-extrabold">{totalSales}</p>
          <p className="mt-0.5 text-xs text-emerald-200">
            {totalClicks > 0
              ? `Conv. : ${((totalSales / totalClicks) * 100).toFixed(1)} %`
              : "aucun clic"}
          </p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-200">Votre code</p>
          <p className="mt-1 text-2xl font-extrabold font-mono tracking-wider">{user.code}</p>
          <p className="mt-0.5 text-xs text-violet-200">{branches.length} branche{branches.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* ── Conseil si aucun lien ── */}
      {links.length === 0 && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 flex items-start gap-3">
          <span className="text-2xl shrink-0">💡</span>
          <div>
            <p className="text-sm font-semibold text-blue-900">Activez vos premiers produits pour générer vos liens</p>
            <p className="text-xs text-blue-700 mt-0.5">
              Rendez-vous dans{" "}
              <Link href="/espace/produits" className="font-bold underline">Mes Produits</Link>{" "}
              et cliquez sur "Activer" pour chaque produit que vous souhaitez promouvoir.
            </p>
          </div>
        </div>
      )}

      {/* ── Grille filtrée (client) ── */}
      <LiensClient cards={cards} branches={branches} />
    </div>
  );
}

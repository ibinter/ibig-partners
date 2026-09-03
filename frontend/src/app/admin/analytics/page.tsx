import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa } from "@/lib/format";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  await requireAdmin();

  const [salesByBranch, conversionByPartner] = await Promise.all([
    // Ventes confirmées par branche, avec vendeur pour heatmap pays
    prisma.sale.findMany({
      where: { status: "CONFIRMED" },
      include: {
        product: { include: { branch: { select: { name: true } } } },
        seller: { select: { city: true, country: true } },
      },
    }),
    // Taux de conversion par affilié (clics → ventes)
    prisma.affiliateLink.findMany({
      where: { clicks: { gt: 0 } },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, code: true } },
        product: { select: { name: true } },
      },
      orderBy: { clicks: "desc" },
      take: 20,
    }),
  ]);

  // Heatmap branche × pays
  const branchCountryMap = new Map<string, Map<string, number>>();
  const branchStats = new Map<string, { count: number; total: number }>();

  for (const sale of salesByBranch) {
    const branch = sale.product?.branch?.name ?? "Inconnu";
    const country = sale.seller?.country ?? "N/A";
    if (!branchCountryMap.has(branch)) branchCountryMap.set(branch, new Map());
    const cm = branchCountryMap.get(branch)!;
    cm.set(country, (cm.get(country) ?? 0) + 1);
    const existing = branchStats.get(branch) ?? { count: 0, total: 0 };
    branchStats.set(branch, { count: existing.count + 1, total: existing.total + sale.amount });
  }

  const branches = Array.from(branchCountryMap.keys()).sort();
  const countries = [...new Set(
    salesByBranch.map((s) => s.seller?.country ?? "N/A").filter(Boolean)
  )].sort();

  // Ventes confirmées par lien (groupBy productId × sellerId)
  const salesPerLink = await prisma.sale.groupBy({
    by: ["sellerId", "productId"],
    where: { status: "CONFIRMED" },
    _count: { id: true },
  });
  const salesLinkMap = new Map<string, number>();
  for (const s of salesPerLink) {
    salesLinkMap.set(`${s.sellerId}::${s.productId}`, s._count.id);
  }

  // Enrichir convRows avec ventes
  const convRowsEnriched = conversionByPartner.map((l) => {
    const sales = salesLinkMap.get(`${l.userId}::${l.productId}`) ?? 0;
    const convRate = l.clicks > 0 ? ((sales / l.clicks) * 100).toFixed(1) : "0.0";
    return {
      partnerName: `${l.user.firstName} ${l.user.lastName}`,
      code: l.user.code,
      productName: l.product.name,
      clicks: l.clicks,
      sales,
      convRate,
    };
  }).sort((a, b) => parseFloat(b.convRate) - parseFloat(a.convRate));

  const totalConfirmed = salesByBranch.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Performance"
        subtitle="Heatmap des ventes par branche et taux de conversion par lien affilié"
      />

      {/* ── KPIs ── */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-200">Ventes confirmées</p>
          <p className="mt-1 text-2xl font-extrabold">{totalConfirmed}</p>
          <p className="mt-0.5 text-xs text-blue-200">toutes branches confondues</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200">Branches actives</p>
          <p className="mt-1 text-2xl font-extrabold">{branches.length}</p>
          <p className="mt-0.5 text-xs text-emerald-200">avec au moins 1 vente</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-200">Pays représentés</p>
          <p className="mt-1 text-2xl font-extrabold">{countries.filter((c) => c !== "N/A").length}</p>
          <p className="mt-0.5 text-xs text-violet-200">selon profil des affiliés</p>
        </div>
      </div>

      {/* ── Performance par branche ── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 text-sm mb-4">Performance par branche</h3>
        {branches.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">Aucune vente confirmée.</p>
        ) : (
          <div className="space-y-3">
            {branches.map((branch) => {
              const stats = branchStats.get(branch) ?? { count: 0, total: 0 };
              const pct = totalConfirmed > 0 ? Math.round((stats.count / totalConfirmed) * 100) : 0;
              return (
                <div key={branch}>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="font-semibold text-slate-700 truncate max-w-[200px]">{branch}</span>
                    <span className="text-slate-400 shrink-0 ml-2">
                      {stats.count} vente{stats.count !== 1 ? "s" : ""} · {fcfa(stats.total)} · {pct} %
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-700"
                      style={{ width: `${Math.max(pct, stats.count > 0 ? 2 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Heatmap branche × pays ── */}
      {branches.length > 0 && countries.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm overflow-x-auto">
          <h3 className="font-semibold text-slate-800 text-sm mb-4">Heatmap ventes — Branche × Pays affilié</h3>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="text-left py-1.5 pr-3 font-semibold text-slate-600 whitespace-nowrap">Branche</th>
                {countries.map((c) => (
                  <th key={c} className="px-3 py-1.5 font-semibold text-slate-500 text-center whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => {
                const countryMap = branchCountryMap.get(branch) ?? new Map();
                const rowTotal = Array.from(countryMap.values()).reduce((a, b) => a + b, 0);
                return (
                  <tr key={branch} className="border-t border-slate-50">
                    <td className="py-2 pr-3 font-medium text-slate-700 whitespace-nowrap">{branch}</td>
                    {countries.map((c) => {
                      const val = countryMap.get(c) ?? 0;
                      const intensity = rowTotal > 0 ? val / rowTotal : 0;
                      const bg = val === 0
                        ? "bg-slate-50 text-slate-300"
                        : intensity > 0.6
                        ? "bg-blue-600 text-white"
                        : intensity > 0.3
                        ? "bg-blue-300 text-blue-900"
                        : "bg-blue-100 text-blue-700";
                      return (
                        <td
                          key={c}
                          className={`px-3 py-2 text-center rounded font-semibold tabular-nums ${bg}`}
                        >
                          {val > 0 ? val : "—"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-3 text-[10px] text-slate-400">Intensité relative par ligne. Pays basé sur le profil de l'affilié vendeur.</p>
        </div>
      )}

      {/* ── Taux de conversion par lien ── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 text-sm mb-1">Taux de conversion par lien affilié</h3>
        <p className="text-xs text-slate-400 mb-4">Top 20 liens par nombre de clics · trié par taux de conversion</p>
        {convRowsEnriched.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">Aucun lien avec des clics.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 pr-3 font-semibold text-slate-500">Affilié</th>
                  <th className="text-left py-2 pr-3 font-semibold text-slate-500">Produit</th>
                  <th className="text-right py-2 pr-3 font-semibold text-slate-500 tabular-nums">Clics</th>
                  <th className="text-right py-2 pr-3 font-semibold text-slate-500 tabular-nums">Ventes</th>
                  <th className="text-right py-2 font-semibold text-slate-500 tabular-nums">Conv. %</th>
                </tr>
              </thead>
              <tbody>
                {convRowsEnriched.map((row, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2 pr-3 font-medium text-slate-700 whitespace-nowrap">
                      {row.partnerName}
                      <span className="ml-1 text-[10px] text-slate-400 font-mono">{row.code}</span>
                    </td>
                    <td className="py-2 pr-3 text-slate-600 max-w-[180px] truncate">{row.productName}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-slate-600">{row.clicks}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-emerald-600 font-semibold">{row.sales}</td>
                    <td className="py-2 text-right tabular-nums">
                      <span className={`font-bold ${
                        parseFloat(row.convRate) >= 5
                          ? "text-emerald-600"
                          : parseFloat(row.convRate) >= 2
                          ? "text-amber-600"
                          : "text-slate-400"
                      }`}>
                        {row.convRate} %
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

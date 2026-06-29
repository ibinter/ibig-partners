import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard, PageHeader, Badge } from "@/components/ui";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const user = await requireUser();

  const links = await prisma.affiliateLink.findMany({
    where: { userId: user.id },
    include: {
      product: { select: { name: true, slug: true } },
      _count: { select: { clickLogs: true } },
    },
    orderBy: { clicks: "desc" },
  });

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const recentClicks = await prisma.click.findMany({
    where: { link: { userId: user.id }, createdAt: { gte: since } },
    select: { createdAt: true, linkId: true },
    orderBy: { createdAt: "desc" },
  });

  const sales = await prisma.sale.findMany({
    where: { sellerId: user.id, status: "CONFIRMED" },
    select: { productId: true, amount: true },
  });

  const clicksByDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    clicksByDay[d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })] = 0;
  }
  for (const c of recentClicks) {
    const key = c.createdAt.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
    if (key in clicksByDay) clicksByDay[key]++;
  }

  const totalClicks = links.reduce((a, l) => a + l.clicks, 0);
  const totalSales = sales.length;
  const convRate = totalClicks > 0 ? ((totalSales / totalClicks) * 100).toFixed(1) : "0.0";
  const maxDay = Math.max(...Object.values(clicksByDay), 1);

  const salesByProduct: Record<string, number> = {};
  for (const s of sales) salesByProduct[s.productId] = (salesByProduct[s.productId] ?? 0) + 1;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Analytics"
        subtitle="Performance de vos liens d'affiliation sur 30 jours"
      />

      {/* Stats colorées */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Clics totaux" value={totalClicks.toLocaleString("fr-FR")} sub="tous liens confondus" accent="brand" icon="👆" />
        <StatCard label="Ventes confirmées" value={totalSales} sub="depuis l'origine" accent="green" icon="🛒" />
        <StatCard label="Taux de conversion" value={`${convRate}%`} sub="clics → ventes" accent="purple" icon="📊" />
      </div>

      {/* Graphique barres */}
      <div className="card-premium p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-ink text-sm">Clics quotidiens</h3>
            <p className="text-xs text-muted mt-0.5">7 derniers jours</p>
          </div>
          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
            {recentClicks.length} clics / 30j
          </span>
        </div>
        <div className="flex items-end gap-2 h-36">
          {Object.entries(clicksByDay).map(([day, count]) => {
            const h = Math.round((count / maxDay) * 100);
            const isToday = day === Object.keys(clicksByDay).at(-1);
            return (
              <div key={day} className="flex flex-1 flex-col items-center gap-1.5">
                {count > 0 && (
                  <span className="text-[10px] font-bold text-blue-600">{count}</span>
                )}
                <div className="w-full relative flex-1 flex items-end">
                  <div
                    className={`w-full rounded-t-lg transition-all ${isToday ? "bg-gradient-to-t from-blue-600 to-blue-400" : "bg-gradient-to-t from-blue-200 to-blue-100"}`}
                    style={{ height: `${Math.max(h, count > 0 ? 15 : 4)}%`, minHeight: "4px" }}
                  />
                </div>
                <span className="text-[9px] text-muted text-center leading-tight whitespace-nowrap">{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tableau par lien */}
      <div className="card-premium overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <div>
            <h3 className="font-semibold text-ink text-sm">Performance par lien</h3>
            <p className="text-xs text-muted mt-0.5">{links.length} lien(s) actif(s)</p>
          </div>
        </div>
        {links.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-2xl mb-2">📈</p>
            <p className="text-sm text-muted">Activez des produits dans « Mes Produits » pour voir les statistiques.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wide">Produit</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Clics total</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Clics 30j</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Ventes</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Conversion</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Activé le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {links.map((l) => {
                  const ventes = salesByProduct[l.productId] ?? 0;
                  const recent = recentClicks.filter((c) => c.linkId === l.id).length;
                  const conv = l.clicks > 0 ? ((ventes / l.clicks) * 100).toFixed(1) : null;
                  return (
                    <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3 font-semibold text-ink">{l.product.name}</td>
                      <td className="px-3 py-3 font-bold text-ink">{l.clicks}</td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                          {recent}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                          {ventes}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {conv ? (
                          <Badge tone="blue">{conv}%</Badge>
                        ) : (
                          <span className="text-muted text-xs">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-muted">{formatDate(l.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

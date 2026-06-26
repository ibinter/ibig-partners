import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader } from "@/components/ui";
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

  // Clics des 30 derniers jours par lien
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const recentClicks = await prisma.click.findMany({
    where: {
      link: { userId: user.id },
      createdAt: { gte: since },
    },
    select: { createdAt: true, linkId: true },
    orderBy: { createdAt: "desc" },
  });

  // Ventes par produit affilié
  const sales = await prisma.sale.findMany({
    where: { sellerId: user.id, status: "CONFIRMED" },
    select: { productId: true, amount: true },
  });

  // Agréger clics par jour (7 derniers jours)
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

  // Taux par lien
  const salesByProduct: Record<string, number> = {};
  for (const s of sales) salesByProduct[s.productId] = (salesByProduct[s.productId] ?? 0) + 1;

  return (
    <div>
      <PageHeader title="Analytics d'affiliation" subtitle="Performance de vos liens d'affiliation sur 30 jours." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-muted">Clics totaux</p>
          <p className="mt-1 text-3xl font-bold text-ink">{totalClicks.toLocaleString("fr-FR")}</p>
          <p className="text-xs text-muted">tous liens confondus</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Ventes confirmées</p>
          <p className="mt-1 text-3xl font-bold text-emerald-600">{totalSales}</p>
          <p className="text-xs text-muted">depuis l'origine</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Taux de conversion</p>
          <p className="mt-1 text-3xl font-bold text-brand-600">{convRate}%</p>
          <p className="text-xs text-muted">clics → ventes</p>
        </Card>
      </div>

      {/* Graphique clics 7 jours */}
      <Card className="mb-6">
        <h2 className="mb-4 font-semibold text-ink">Clics quotidiens (7 derniers jours)</h2>
        <div className="flex items-end gap-2 h-32">
          {Object.entries(clicksByDay).map(([day, count]) => {
            const max = Math.max(...Object.values(clicksByDay), 1);
            const h = Math.round((count / max) * 100);
            return (
              <div key={day} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-semibold text-ink">{count || ""}</span>
                <div
                  className="w-full rounded-t-md bg-brand-500 transition-all"
                  style={{ height: `${Math.max(h, count > 0 ? 8 : 2)}%`, minHeight: "2px" }}
                />
                <span className="text-[10px] text-muted text-center leading-tight">{day}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Tableau par lien */}
      <Card className="p-0">
        <h2 className="px-5 py-4 font-semibold text-ink">Performance par lien</h2>
        {links.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-muted">Activez des produits dans « Mes Produits » pour voir les statistiques.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-5 py-2">Produit</th>
                <th className="px-3 py-2">Clics (total)</th>
                <th className="px-3 py-2">Clics (30j)</th>
                <th className="px-3 py-2">Ventes</th>
                <th className="px-3 py-2">Conversion</th>
                <th className="px-3 py-2">Activé le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {links.map((l) => {
                const ventes = salesByProduct[l.productId] ?? 0;
                const recent = recentClicks.filter((c) => c.linkId === l.id).length;
                const conv = l.clicks > 0 ? ((ventes / l.clicks) * 100).toFixed(1) : "—";
                return (
                  <tr key={l.id}>
                    <td className="px-5 py-3 font-medium text-ink">{l.product.name}</td>
                    <td className="px-3 py-3 font-semibold">{l.clicks}</td>
                    <td className="px-3 py-3 text-brand-600 font-semibold">{recent}</td>
                    <td className="px-3 py-3 text-emerald-600 font-semibold">{ventes}</td>
                    <td className="px-3 py-3">{conv !== "—" ? `${conv}%` : "—"}</td>
                    <td className="px-3 py-3 text-xs text-muted">{formatDate(l.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

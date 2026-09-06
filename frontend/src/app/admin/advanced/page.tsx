import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminAdvancedPage() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/espace");

  const [
    totalUsers, totalSales, totalCommissions, totalProspects,
    pendingVerif, recentSales, topPartners,
  ] = await Promise.all([
    (prisma as any).user.count({ where: { role: "PARTNER" } }),
    (prisma as any).sale.count(),
    (prisma as any).commission.aggregate({ _sum: { amount: true } }),
    (prisma as any).prospect.count(),
    (prisma as any).user.count({ where: { verificationStatus: "SUBMITTED" } }),
    (prisma as any).sale.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { seller: { select: { firstName: true, lastName: true } } } }),
    (prisma as any).sale.groupBy({ by: ["sellerId"], _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 10 }),
  ]);

  const topWithNames = await Promise.all(
    topPartners.map(async (p: any) => {
      const u = await (prisma as any).user.findUnique({ where: { id: p.sellerId }, select: { firstName: true, lastName: true } });
      const name = u ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "Inconnu" : "Inconnu";
      return { ...p, name };
    })
  );

  const kpis = [
    { label: "Partenaires actifs", value: totalUsers, icon: "👥", color: "text-indigo-600" },
    { label: "Ventes totales", value: totalSales, icon: "📝", color: "text-emerald-600" },
    { label: "Commissions versées (FCFA)", value: (totalCommissions._sum.amount ?? 0).toLocaleString(), icon: "💰", color: "text-amber-600" },
    { label: "Prospects totaux", value: totalProspects, icon: "📇", color: "text-blue-600" },
    { label: "Dossiers en attente", value: pendingVerif, icon: "🔐", color: "text-rose-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black">Dashboard Admin — Vue Avancée</h1>
        <p className="text-sm text-gray-500 mt-1">KPIs globaux de la plateforme</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border bg-white dark:bg-gray-900 p-4 text-center">
            <p className="text-3xl">{k.icon}</p>
            <p className={`text-2xl font-black mt-1 ${k.color}`}>{k.value}</p>
            <p className="text-xs text-gray-500 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white dark:bg-gray-900 overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50 dark:bg-gray-800">
            <p className="font-bold text-sm">🏆 Top 10 Partenaires</p>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="px-4 py-2 text-left text-xs text-gray-500">Partenaire</th><th className="px-4 py-2 text-right text-xs text-gray-500">Ventes</th><th className="px-4 py-2 text-right text-xs text-gray-500">Comm. (FCFA)</th></tr></thead>
            <tbody>
              {topWithNames.map((p: any, i: number) => (
                <tr key={p.sellerId} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-2 font-medium">{i + 1}. {p.name}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{p._count.id}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-emerald-600">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border bg-white dark:bg-gray-900 overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50 dark:bg-gray-800">
            <p className="font-bold text-sm">📝 Dernières ventes</p>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="px-4 py-2 text-left text-xs text-gray-500">Partenaire</th><th className="px-4 py-2 text-left text-xs text-gray-500">Produit</th><th className="px-4 py-2 text-right text-xs text-gray-500">Date</th></tr></thead>
            <tbody>
              {recentSales.map((s: any) => (
                <tr key={s.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-2 font-medium">{s.seller ? `${s.seller.firstName ?? ""} ${s.seller.lastName ?? ""}`.trim() || "—" : "—"}</td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{s.productName ?? "—"}</td>
                  <td className="px-4 py-2 text-right text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

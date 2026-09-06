import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function StatistiquesPage() {
  await requireAdmin();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    totalPartners,
    activePartners,
    totalSales,
    monthlySales,
    totalMissions,
    activeMissions,
    cpStats,
    branchStats,
    topPartners,
    missionTypeStats,
    monthlyGrowth,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "PARTNER" } }),
    prisma.user.count({ where: { role: "PARTNER", approved: true } }),
    prisma.sale.count(),
    prisma.sale.count({ where: { createdAt: { gte: startOfMonth } } }),
    (async () => { try { return await (prisma as any).mission.count(); } catch { return 0; } })(),
    (async () => { try { return await (prisma as any).mission.count({ where: { status: "ACTIVE" } }); } catch { return 0; } })(),
    (async () => {
      try {
        const txs = await (prisma as any).pointTransaction.findMany({ select: { points: true, type: true } });
        const credited = txs.filter((t: any) => ["CREDIT", "BONUS"].includes(t.type)).reduce((s: number, t: any) => s + t.points, 0);
        const debited = txs.filter((t: any) => t.type === "DEBIT").reduce((s: number, t: any) => s + t.points, 0);
        return { credited, debited, net: credited - debited, count: txs.length };
      } catch { return { credited: 0, debited: 0, net: 0, count: 0 }; }
    })(),
    (async () => {
      try {
        const missions = await (prisma as any).mission.groupBy({ by: ["branch"], _count: { id: true } });
        return missions.map((m: any) => ({ branch: m.branch, count: m._count.id }));
      } catch { return []; }
    })(),
    (async () => {
      try {
        const sales = await prisma.sale.groupBy({ by: ["sellerId"], _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 5 });
        const withNames = await Promise.all(sales.map(async (s: any) => {
          const user = await prisma.user.findUnique({ where: { id: s.sellerId }, select: { firstName: true, lastName: true, code: true } });
          return { ...s, user };
        }));
        return withNames;
      } catch { return []; }
    })(),
    (async () => {
      try {
        const missions = await (prisma as any).mission.groupBy({ by: ["type"], _count: { id: true } });
        return missions.map((m: any) => ({ type: m.type, count: m._count.id }));
      } catch { return []; }
    })(),
    (async () => {
      try {
        const months: { month: string; count: number }[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
          const count = await prisma.user.count({ where: { role: "PARTNER", createdAt: { gte: d, lt: end } } });
          months.push({ month: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }), count });
        }
        return months;
      } catch { return []; }
    })(),
  ]);

  const totalRevenue = await (async () => {
    try {
      const sales = await prisma.sale.aggregate({ _sum: { amount: true } });
      return sales._sum.amount ?? 0;
    } catch { return 0; }
  })();

  const monthlyRevenue = await (async () => {
    try {
      const sales = await prisma.sale.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: startOfMonth } } });
      return sales._sum.amount ?? 0;
    } catch { return 0; }
  })();

  const kpis = [
    { label: "Partenaires totaux", value: totalPartners, sub: `${activePartners} approuvés`, color: "text-blue-600" },
    { label: "Ventes totales", value: totalSales, sub: `${monthlySales} ce mois`, color: "text-green-600" },
    { label: "Missions catalogue", value: totalMissions, sub: `${activeMissions} actives`, color: "text-purple-600" },
    { label: "CP distribués", value: cpStats.credited.toLocaleString(), sub: `${cpStats.debited.toLocaleString()} utilisés`, color: "text-amber-600" },
    { label: "CA total (FCFA)", value: Number(totalRevenue).toLocaleString(), sub: `${Number(monthlyRevenue).toLocaleString()} ce mois`, color: "text-emerald-600" },
    { label: "Transactions CP", value: cpStats.count, sub: `Solde net: ${cpStats.net.toLocaleString()} CP`, color: "text-orange-600" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Statistiques globales"
        subtitle="Vue d'ensemble de la performance IBIG PARTNERS — CP, missions, ventes, partenaires"
      />

      {/* KPIs principaux */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className={`text-3xl font-bold ${k.color}`}>{k.value}</div>
            <div className="font-medium mt-1">{k.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nouveaux partenaires par mois */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Nouveaux partenaires (6 mois)</h2>
          <div className="space-y-2">
            {monthlyGrowth.map((m: any) => {
              const max = Math.max(...monthlyGrowth.map((x: any) => x.count), 1);
              const pct = Math.round((m.count / max) * 100);
              return (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-12">{m.month}</span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-5 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full flex items-center pl-2" style={{ width: `${Math.max(pct, 4)}%` }}>
                      <span className="text-white text-xs font-medium">{m.count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 partenaires */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Top 5 partenaires (ventes)</h2>
          {topPartners.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune donnée.</p>
          ) : (
            <div className="space-y-3">
              {topPartners.map((p: any, i: number) => (
                <div key={p.sellerId} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{p.user?.firstName} {p.user?.lastName}</div>
                    <div className="text-xs text-gray-400">{p.user?.code}</div>
                  </div>
                  <span className="font-bold text-green-600">{p._count.id} ventes</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Missions par branche */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Missions par branche</h2>
          {branchStats.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune mission importée.</p>
          ) : (
            <div className="space-y-2">
              {branchStats.slice(0, 10).map((b: any) => {
                const max = Math.max(...branchStats.map((x: any) => x.count), 1);
                const pct = Math.round((b.count / max) * 100);
                return (
                  <div key={b.branch} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-36 truncate">{b.branch}</span>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.max(pct, 3)}%` }} />
                    </div>
                    <span className="text-xs font-medium w-8 text-right">{b.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Types de missions */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Types de missions</h2>
          {missionTypeStats.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune mission importée.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {missionTypeStats.map((t: any) => (
                <div key={t.type} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-xl font-bold text-purple-600">{t.count}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{t.type}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Santé système */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Santé du système</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Base de données", status: "OK", color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
            { label: "Partenaires actifs", status: activePartners > 0 ? "OK" : "Vide", color: activePartners > 0 ? "text-green-600" : "text-yellow-600", bg: "bg-green-50 dark:bg-green-900/20" },
            { label: "Catalogue missions", status: activeMissions >= 100 ? "OK" : activeMissions > 0 ? "Partiel" : "Vide", color: activeMissions >= 100 ? "text-green-600" : activeMissions > 0 ? "text-yellow-600" : "text-red-600", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
            { label: "Transactions CP", status: cpStats.count > 0 ? "Actif" : "Vide", color: cpStats.count > 0 ? "text-green-600" : "text-yellow-600", bg: "bg-green-50 dark:bg-green-900/20" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-lg p-4 text-center`}>
              <div className={`text-lg font-bold ${s.color}`}>{s.status}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

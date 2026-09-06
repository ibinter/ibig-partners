/**
 * Feature 9 — Export & Reporting admin avancé /admin/reporting
 * Filtres personnalisés + export CSV + export PDF résumé.
 */
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui";
import { ExportButton } from "@/components/export-button";
import ReportingFilters from "./reporting-filters";

export const dynamic = "force-dynamic";

export default async function ReportingPage({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string;
    to?: string;
    status?: string;
    branch?: string;
    partner?: string;
  }>;
}) {
  await requireAdmin();

  const sp = await searchParams;
  const from   = sp.from ? new Date(sp.from) : new Date(new Date().setDate(1)); // début du mois
  const to     = sp.to   ? new Date(sp.to + "T23:59:59") : new Date();
  const status = sp.status || "";
  const branch = sp.branch || "";
  const partnerCode = sp.partner || "";

  // Résoudre le partner code → id
  let partnerUserId: string | undefined;
  if (partnerCode) {
    const u = await prisma.user.findFirst({ where: { code: partnerCode }, select: { id: true } });
    partnerUserId = u?.id;
  }

  const [branches, sales, commissions, partners] = await Promise.all([
    prisma.branch.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.sale.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        ...(status ? { status } : {}),
        ...(partnerUserId ? { sellerId: partnerUserId } : {}),
        ...(branch ? { product: { branch: { name: branch } } } : {}),
      },
      include: {
        product: { include: { branch: { select: { name: true } } } },
        seller: { select: { firstName: true, lastName: true, code: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.commission.aggregate({
      where: {
        createdAt: { gte: from, lte: to },
        ...(partnerUserId ? { userId: partnerUserId } : {}),
      },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.user.findMany({
      where: { role: "PARTNER", approved: true },
      select: { code: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  const totalSales    = sales.length;
  const totalRevenue  = sales.reduce((s, v) => s + v.amount, 0);
  const totalComm     = commissions._sum.amount ?? 0;

  const byBranch = new Map<string, { count: number; total: number }>();
  for (const s of sales) {
    const key = s.product?.branch?.name ?? "Sans branche";
    const ex  = byBranch.get(key) ?? { count: 0, total: 0 };
    byBranch.set(key, { count: ex.count + 1, total: ex.total + s.amount });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reporting avancé"
        subtitle="Filtrez et exportez les données de ventes et commissions"
        action={
          <div className="flex items-center gap-2">
            <ExportButton type="ventes" label="CSV Ventes" />
            <ExportButton type="commissions" label="CSV Commissions" />
          </div>
        }
      />

      {/* Filtres */}
      <ReportingFilters
        branches={branches.map((b) => b.name)}
        partners={partners.map((p) => ({ code: p.code, name: `${p.firstName} ${p.lastName}` }))}
        current={{ from: sp.from, to: sp.to, status, branch, partner: partnerCode }}
      />

      {/* KPIs résumé */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-200">Ventes trouvées</p>
          <p className="mt-1 text-3xl font-extrabold">{totalSales}</p>
          <p className="mt-0.5 text-xs text-blue-200">{formatDate(from)} → {formatDate(to)}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200">Chiffre d'affaires</p>
          <p className="mt-1 text-2xl font-extrabold">{fcfa(totalRevenue)}</p>
          <p className="mt-0.5 text-xs text-emerald-200">FCFA</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-100">Commissions générées</p>
          <p className="mt-1 text-2xl font-extrabold">{fcfa(totalComm)}</p>
          <p className="mt-0.5 text-xs text-amber-100">{commissions._count.id} ligne{commissions._count.id !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Répartition par branche */}
      {byBranch.size > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 text-sm mb-4">Répartition par branche</h3>
          <div className="space-y-3">
            {Array.from(byBranch.entries()).sort((a, b) => b[1].count - a[1].count).map(([name, stats]) => {
              const pct = totalSales > 0 ? Math.round((stats.count / totalSales) * 100) : 0;
              return (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="font-semibold text-slate-700 truncate">{name}</span>
                    <span className="text-slate-400 shrink-0 ml-2">
                      {stats.count} vente{stats.count !== 1 ? "s" : ""} · {fcfa(stats.total)} · {pct} %
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.max(pct, stats.count > 0 ? 2 : 0)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tableau ventes */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50">
          <h3 className="font-semibold text-slate-800 text-sm">Détail des ventes ({totalSales})</h3>
        </div>
        {sales.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-400">Aucune vente pour cette période.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500">Partenaire</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500">Produit</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500">Branche</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500">Montant</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-500">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 text-slate-400">{formatDate(s.createdAt)}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-700">
                      {s.seller.firstName} {s.seller.lastName}
                      <span className="ml-1 text-[10px] text-slate-400 font-mono">{s.seller.code}</span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 max-w-[160px] truncate">{s.product.name}</td>
                    <td className="px-4 py-2.5 text-slate-400">{s.product.branch?.name ?? "—"}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-800 tabular-nums">{fcfa(s.amount)}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        s.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-700"
                        : s.status === "PENDING"    ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-500"
                      }`}>
                        {s.status}
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

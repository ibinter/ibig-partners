import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import PartnerCharts from "./partner-charts";

export const dynamic = "force-dynamic";

export default async function PartnerAnalyticsPage() {
  const user = await requireUser();
  const now = new Date();

  // 12 mois glissants
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }) };
  });

  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [sales, commissions] = await Promise.all([
    prisma.sale.findMany({
      where: { sellerId: user.id, status: "CONFIRMED", createdAt: { gte: start } },
      select: { amount: true, createdAt: true },
    }),
    prisma.commission.findMany({
      where: { userId: user.id, createdAt: { gte: start } },
      select: { amount: true, createdAt: true },
    }),
  ]);

  const data = months.map(({ year, month, label }) => {
    const salesAmt = sales
      .filter((s) => { const d = new Date(s.createdAt); return d.getFullYear() === year && d.getMonth() + 1 === month; })
      .reduce((sum, s) => sum + (s.amount ?? 0), 0);
    const commAmt = commissions
      .filter((c) => { const d = new Date(c.createdAt); return d.getFullYear() === year && d.getMonth() + 1 === month; })
      .reduce((sum, c) => sum + (c.amount ?? 0), 0);
    return { label, sales: salesAmt, commissions: commAmt };
  });

  const totalSales = data.reduce((s, d) => s + d.sales, 0);
  const totalComm = data.reduce((s, d) => s + d.commissions, 0);
  const bestMonth = data.reduce((a, b) => (b.sales > a.sales ? b : a), data[0]);

  return (
    <div className="space-y-6">
      <PageHeader title="Mes statistiques" subtitle="Évolution de vos ventes et commissions sur 12 mois." />

      <div className="grid grid-cols-3 gap-3">
        {[
          ["CA total", `${totalSales.toLocaleString("fr-FR")} FCFA`],
          ["Commissions", `${totalComm.toLocaleString("fr-FR")} FCFA`],
          ["Meilleur mois", bestMonth?.label ?? "—"],
        ].map(([label, val]) => (
          <div key={label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm text-center">
            <p className="text-lg font-extrabold text-slate-800">{val}</p>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <PartnerCharts data={data} />
    </div>
  );
}

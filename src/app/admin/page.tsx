import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa, formatDate } from "@/lib/format";
import { Badge, Card, PageHeader, StatCard, statusTone } from "@/components/ui";
import { SALE_STATUS_LABELS } from "@/lib/constants";
import { AdminChartsSection } from "./charts-section";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();

  const [
    partnersTotal,
    partnersActive,
    pendingApprovals,
    revenueAgg,
    pendingComm,
    validatedComm,
    paidComm,
    openOpportunities,
    recentSales,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "PARTNER" } }),
    prisma.user.count({ where: { role: "PARTNER", active: true, approved: true } }),
    prisma.user.count({ where: { role: "PARTNER", approved: false } }),
    prisma.sale.aggregate({ where: { status: "CONFIRMED" }, _sum: { amount: true } }),
    prisma.commission.aggregate({ where: { status: "PENDING" }, _sum: { amount: true } }),
    prisma.commission.aggregate({ where: { status: "VALIDATED" }, _sum: { amount: true } }),
    prisma.commission.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    prisma.opportunity.count({ where: { status: { in: ["NEW", "IN_PROGRESS"] } } }),
    prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { product: true, seller: true },
    }),
  ]);

  // Top partenaires par CA
  const topSellers = await prisma.sale.groupBy({
    by: ["sellerId"],
    where: { status: "CONFIRMED" },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 5,
  });
  const sellerNames = await prisma.user.findMany({
    where: { id: { in: topSellers.map((t) => t.sellerId) } },
    select: { id: true, firstName: true, lastName: true, code: true },
  });
  const nameOf = (id: string) => {
    const u = sellerNames.find((s) => s.id === id);
    return u ? `${u.firstName} ${u.lastName}` : id;
  };

  return (
    <div>
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble du programme d'affiliation IBIG PARTNERS" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Partenaires actifs" value={partnersActive} sub={`${partnersTotal} au total`} accent="brand" />
        <StatCard label="CA généré par affiliation" value={fcfa(revenueAgg._sum.amount ?? 0)} accent="green" />
        <StatCard label="Commissions à verser" value={fcfa((pendingComm._sum.amount ?? 0) + (validatedComm._sum.amount ?? 0))} sub="en attente + validées" accent="gold" />
        <StatCard label="Commissions versées" value={fcfa(paidComm._sum.amount ?? 0)} accent="slate" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Link href="/admin/partenaires" className="card flex items-center justify-between p-5 hover:border-brand-300">
          <span className="text-sm text-muted">Inscriptions à valider</span>
          <span className="text-2xl font-bold text-amber-600">{pendingApprovals}</span>
        </Link>
        <Link href="/admin/commissions" className="card flex items-center justify-between p-5 hover:border-brand-300">
          <span className="text-sm text-muted">Commissions en attente</span>
          <span className="text-2xl font-bold text-brand-600">{fcfa(pendingComm._sum.amount ?? 0)}</span>
        </Link>
        <Link href="/admin/opportunites" className="card flex items-center justify-between p-5 hover:border-brand-300">
          <span className="text-sm text-muted">Opportunités ouvertes</span>
          <span className="text-2xl font-bold text-emerald-600">{openOpportunities}</span>
        </Link>
      </div>

      {/* Graphique CA mensuel */}
      <Card className="mt-6">
        <h2 className="mb-4 font-semibold text-ink">Évolution mensuelle — CA & Commissions (6 mois)</h2>
        <AdminChartsSection />
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-0 lg:col-span-2">
          <h2 className="px-5 py-4 font-semibold text-ink">Ventes récentes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-y border-slate-100 bg-slate-50 text-left text-xs uppercase text-muted">
                <tr>
                  <th className="px-5 py-2">Réf.</th>
                  <th className="px-3 py-2">Produit</th>
                  <th className="px-3 py-2">Vendeur</th>
                  <th className="px-3 py-2">Montant</th>
                  <th className="px-3 py-2">Statut</th>
                  <th className="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSales.map((s) => (
                  <tr key={s.id}>
                    <td className="px-5 py-2 font-mono text-xs text-muted">{s.reference}</td>
                    <td className="px-3 py-2 font-medium text-ink">{s.product.name}</td>
                    <td className="px-3 py-2">{s.seller.firstName} {s.seller.lastName}</td>
                    <td className="px-3 py-2 font-semibold">{fcfa(s.amount)}</td>
                    <td className="px-3 py-2"><Badge tone={statusTone(s.status)}>{SALE_STATUS_LABELS[s.status]}</Badge></td>
                    <td className="px-3 py-2 text-muted">{formatDate(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-ink">Top partenaires (CA)</h2>
          <ol className="mt-4 space-y-3">
            {topSellers.map((t, i) => (
              <li key={t.sellerId} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">{i + 1}</span>
                  {nameOf(t.sellerId)}
                </span>
                <span className="font-semibold">{fcfa(t._sum.amount ?? 0)}</span>
              </li>
            ))}
            {topSellers.length === 0 && <p className="text-sm text-muted">Aucune vente confirmée.</p>}
          </ol>
        </Card>
      </div>
    </div>
  );
}

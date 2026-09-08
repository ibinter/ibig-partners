import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa, formatDate } from "@/lib/format";
import { Badge, Card, PageHeader, StatCard, statusTone } from "@/components/ui";
import { SALE_STATUS_LABELS } from "@/lib/constants";
import { AdminChartsSection } from "./charts-section";
import { AdminActionCenter } from "./action-center";
import { AdminAlertsSection } from "./alerts-section";
import AdminLiveKpis from "@/components/admin-live-kpis";

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
    productsTotal,
    productsActive,
    missionsTotal,
    missionsActive,
    pendingApplications,
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
    prisma.product.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.mission.count(),
    prisma.mission.count({ where: { active: true } }),
    prisma.missionApplication.count({ where: { status: "PENDING" } }),
  ]);

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
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble du programme d'affiliation IBIG PARTNERS"
      />

      {/* KPIs live temps réel */}
      <AdminLiveKpis initial={{ salesToday: 0, salesMonth: 0, commPending: pendingComm._sum?.amount ?? 0, pendingPartners: pendingApprovals, openTickets: 0, pendingPayouts: 0, updatedAt: new Date().toISOString() }} />

      {/* Alertes prioritaires */}
      <AdminAlertsSection />

      {/* Centre d'actions prioritaires + KPIs avancés + Activité temps réel */}
      <AdminActionCenter />

      {/* KPIs principaux */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Partenaires actifs"
          value={partnersActive}
          sub={`${partnersTotal} inscrits au total`}
          accent="brand"
          icon="👥"
        />
        <StatCard
          label="CA affiliation"
          value={fcfa(revenueAgg._sum.amount ?? 0)}
          sub="Ventes confirmées"
          accent="green"
          icon="📈"
        />
        <StatCard
          label="Commissions à verser"
          value={fcfa((pendingComm._sum.amount ?? 0) + (validatedComm._sum.amount ?? 0))}
          sub="En attente + validées"
          accent="gold"
          icon="⏳"
        />
        <StatCard
          label="Commissions versées"
          value={fcfa(paidComm._sum.amount ?? 0)}
          sub="Total cumulé"
          accent="slate"
          icon="✅"
        />
      </div>

      {/* Raccourcis d'action */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Link
          href="/admin/partenaires"
          className="admin-card flex items-center justify-between p-5 hover:border-blue-200 transition-colors group"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted mb-1">Inscriptions</p>
            <p className="text-sm text-ink">À valider</p>
          </div>
          <span className="text-2xl font-bold text-amber-500 group-hover:scale-110 transition-transform">
            {pendingApprovals}
          </span>
        </Link>
        <Link
          href="/admin/commissions"
          className="admin-card flex items-center justify-between p-5 hover:border-blue-200 transition-colors group"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted mb-1">Commissions</p>
            <p className="text-sm text-ink">En attente</p>
          </div>
          <span className="text-base font-bold text-blue-600 group-hover:scale-105 transition-transform">
            {fcfa(pendingComm._sum.amount ?? 0)}
          </span>
        </Link>
        <Link
          href="/admin/opportunites"
          className="admin-card flex items-center justify-between p-5 hover:border-blue-200 transition-colors group"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted mb-1">Opportunités</p>
            <p className="text-sm text-ink">Ouvertes</p>
          </div>
          <span className="text-2xl font-bold text-emerald-600 group-hover:scale-110 transition-transform">
            {openOpportunities}
          </span>
        </Link>
      </div>

      {/* ── Produits & Missions admin ── */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {/* PRODUITS */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 p-6 text-white shadow-xl">
          <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-xl" />
          <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-indigo-400/20 blur-lg" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                  🧩 Catalogue Produits
                </span>
                <p className="mt-3 text-4xl font-extrabold tracking-tight leading-none">{productsActive}</p>
                <p className="mt-1 text-sm text-brand-200 font-medium">produits actifs / {productsTotal} au total</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[11px] text-brand-200 uppercase font-semibold tracking-wide">10 branches</p>
                <p className="text-3xl font-extrabold">IBIG</p>
              </div>
            </div>
            <p className="text-xs text-brand-200 leading-relaxed mb-5">
              Gérez les produits proposés aux partenaires — activation, tarifs, taux de commission par branche.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/produits"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-extrabold text-brand-700 shadow-lg hover:bg-brand-50 transition-all hover:-translate-y-0.5"
              >
                ⚙️ Gérer les produits
              </Link>
              <Link
                href="/catalogue"
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2.5 text-sm font-semibold text-white transition"
              >
                Vue publique →
              </Link>
            </div>
          </div>
        </div>

        {/* MISSIONS */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-700 p-6 text-white shadow-xl">
          <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-xl" />
          <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-rose-300/20 blur-lg" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                  🎯 Missions partenaires
                </span>
                <p className="mt-3 text-4xl font-extrabold tracking-tight leading-none">{missionsActive}</p>
                <p className="mt-1 text-sm text-amber-100 font-medium">missions actives / {missionsTotal} créées</p>
              </div>
              {pendingApplications > 0 && (
                <div className="shrink-0 text-right">
                  <p className="text-[11px] text-amber-200 uppercase font-semibold tracking-wide">Candidatures</p>
                  <p className="text-3xl font-extrabold">{pendingApplications}</p>
                  <p className="text-[10px] text-amber-200">en attente</p>
                </div>
              )}
            </div>
            <p className="text-xs text-amber-100 leading-relaxed mb-5">
              Créez, activez et suivez les missions terrain — candidatures, preuves, récompenses et paiements.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/missions"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-extrabold text-orange-700 shadow-lg hover:bg-orange-50 transition-all hover:-translate-y-0.5"
              >
                ⚡ Gérer les missions
              </Link>
              <Link
                href="/missions"
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2.5 text-sm font-semibold text-white transition"
              >
                Vue publique →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique */}
      <Card className="mt-6">
        <p className="text-sm font-semibold text-ink mb-5">
          Évolution mensuelle — CA & Commissions (6 mois)
        </p>
        <AdminChartsSection />
      </Card>

      {/* Ventes récentes + Top partenaires */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">

        <Card className="p-0 lg:col-span-2">
          <div className="px-6 py-4 border-b border-slate-100">
            <p className="text-sm font-semibold text-ink">Ventes récentes</p>
          </div>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Réf.</th>
                  <th>Produit</th>
                  <th>Vendeur</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((s) => (
                  <tr key={s.id}>
                    <td><span className="font-mono text-xs text-muted">{s.reference}</span></td>
                    <td className="font-medium text-ink">{s.product.name}</td>
                    <td>{s.seller.firstName} {s.seller.lastName}</td>
                    <td className="font-semibold">{fcfa(s.amount)}</td>
                    <td><Badge tone={statusTone(s.status)}>{SALE_STATUS_LABELS[s.status]}</Badge></td>
                    <td className="text-muted text-xs">{formatDate(s.createdAt)}</td>
                  </tr>
                ))}
                {recentSales.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-muted text-sm">
                      Aucune vente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-ink mb-5">Top partenaires (CA)</p>
          <ol className="space-y-3">
            {topSellers.map((t, i) => (
              <li key={t.sellerId} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm text-ink truncate">{nameOf(t.sellerId)}</span>
                <span className="text-sm font-semibold text-ink">{fcfa(t._sum.amount ?? 0)}</span>
              </li>
            ))}
            {topSellers.length === 0 && (
              <p className="text-sm text-muted">Aucune vente confirmée.</p>
            )}
          </ol>
        </Card>
      </div>
    </div>
  );
}

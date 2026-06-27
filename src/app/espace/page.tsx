import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { partnerSummary, nextStatusProgress } from "@/lib/metrics";
import { fcfa, formatDate, pct } from "@/lib/format";
import { Badge, Card, EmptyState, PageHeader, StatCard, statusTone } from "@/components/ui";
import { COMMISSION_STATUS_LABELS, STATUS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ bienvenue?: string }>;
}) {
  const user = await requireUser();
  const { bienvenue } = await searchParams;
  const summary = await partnerSummary(user.id);
  const prog = nextStatusProgress(summary.confirmedSales, summary.directReferrals, summary.activeTeam);

  const recentCommissions = await prisma.commission.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { sale: { include: { product: true } } },
  });

  const counts = [1, 2, 3].map(
    (lvl) => summary.network.filter((m) => m.level === lvl).length,
  );

  return (
    <div>
      <PageHeader
        title={`Bonjour ${user.firstName} 👋`}
        subtitle="Votre activité IBIG PARTNERS en un coup d'œil"
      />

      {bienvenue && (
        <div className="mb-6 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">
          🎉 Bienvenue dans le programme IBIG PARTNERS ! Activez vos produits dans
          « Mes Produits » pour générer vos liens d&apos;affiliation.
        </div>
      )}

      {!user.approved && (
        <div className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ⏳ Votre compte est <strong>en attente de validation</strong> par
          l&apos;équipe IBIG. Vous pouvez déjà explorer votre espace ; vos
          commissions seront activées dès la validation.
        </div>
      )}

      {/* Stats colorées */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="CA généré" value={fcfa(summary.revenue)} accent="brand" icon="💼" />
        <StatCard label="Commissions à venir" value={fcfa(summary.payable)} sub="en attente + validées" accent="gold" icon="⏳" />
        <StatCard label="Commissions versées" value={fcfa(summary.paid)} accent="green" icon="✅" />
        <StatCard label="Filleuls actifs N1" value={summary.activeReferrals} accent="slate" icon="👥" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {/* Progression de statut */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink text-sm">Progression de statut</h2>
            <Badge tone="gold">🏆 {STATUS_LABELS[user.status]}</Badge>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700"
              style={{ width: `${prog.progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted">{prog.label}</p>

          {/* Mini stats réseau */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            {["N1", "N2", "N3"].map((lbl, i) => (
              <div key={lbl} className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                <p className="text-xs text-muted font-medium">{lbl}</p>
                <p className="text-lg font-bold text-ink mt-0.5">{counts[i]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Réseau */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-md p-5 text-white relative overflow-hidden">
          <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10 blur-sm" />
          <h2 className="font-semibold text-sm text-white/90 mb-1">Mon réseau</h2>
          <p className="text-3xl font-bold tracking-tight">{counts.reduce((a, b) => a + b, 0)}</p>
          <p className="text-xs text-blue-200 mb-4">filleuls au total</p>
          <div className="space-y-2">
            {[["🥇 Niveau 1", counts[0]], ["🥈 Niveau 2", counts[1]], ["🥉 Niveau 3", counts[2]]].map(([lbl, n]) => (
              <div key={String(lbl)} className="flex items-center justify-between text-sm">
                <span className="text-blue-100">{lbl}</span>
                <span className="font-bold text-white">{n}</span>
              </div>
            ))}
          </div>
          <Link href="/espace/reseau" className="mt-4 inline-flex items-center gap-1 rounded-xl bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-semibold text-white transition">
            Voir mon réseau →
          </Link>
        </div>
      </div>

      {/* Commissions récentes */}
      <div className="mt-5 rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <h2 className="font-semibold text-ink text-sm">Commissions récentes</h2>
          <Link href="/espace/commissions" className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition">
            Tout voir →
          </Link>
        </div>
        {recentCommissions.length === 0 ? (
          <div className="px-5 pb-6 pt-4">
            <EmptyState>Aucune commission pour le moment. Partagez vos liens pour commencer !</EmptyState>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wide">Produit</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Niv.</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Taux</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Montant</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Statut</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentCommissions.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 font-medium text-ink">
                      {c.sale.product.name}
                      {c.sale.pricingType === "MONTHLY_SUB" && (
                        <span className="text-muted text-xs"> · Mois {c.monthIndex}</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {c.level}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted">{pct(c.rate)}</td>
                    <td className="px-3 py-3 font-bold text-ink">{fcfa(c.amount)}</td>
                    <td className="px-3 py-3">
                      <Badge tone={statusTone(c.status)}>{COMMISSION_STATUS_LABELS[c.status]}</Badge>
                    </td>
                    <td className="px-3 py-3 text-muted text-xs">{formatDate(c.createdAt)}</td>
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

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
  const prog = nextStatusProgress(summary.confirmedSales, summary.activeReferrals);

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="CA généré (ventes confirmées)" value={fcfa(summary.revenue)} accent="brand" />
        <StatCard label="Commissions à venir" value={fcfa(summary.payable)} sub="en attente + validées" accent="gold" />
        <StatCard label="Commissions versées" value={fcfa(summary.paid)} accent="green" />
        <StatCard label="Filleuls actifs (N1)" value={summary.activeReferrals} accent="slate" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Progression de statut */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink">Progression de statut</h2>
            <Badge tone="gold">{STATUS_LABELS[user.status]}</Badge>
          </div>
          <div className="mt-4">
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${prog.progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted">{prog.label}</p>
          </div>
        </Card>

        {/* Réseau */}
        <Card>
          <h2 className="font-semibold text-ink">Mon réseau</h2>
          <div className="mt-4 space-y-2 text-sm">
            {["Niveau 1", "Niveau 2", "Niveau 3"].map((lbl, i) => (
              <div key={lbl} className="flex items-center justify-between">
                <span className="text-muted">{lbl}</span>
                <span className="font-semibold text-ink">{counts[i]} filleul(s)</span>
              </div>
            ))}
          </div>
          <Link href="/espace/reseau" className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline">
            Voir mon réseau →
          </Link>
        </Card>
      </div>

      {/* Commissions récentes */}
      <Card className="mt-6 p-0">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-semibold text-ink">Commissions récentes</h2>
          <Link href="/espace/commissions" className="text-sm font-medium text-brand-600 hover:underline">
            Tout voir →
          </Link>
        </div>
        {recentCommissions.length === 0 ? (
          <div className="px-5 pb-6">
            <EmptyState>Aucune commission pour le moment. Partagez vos liens pour commencer !</EmptyState>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-y border-slate-100 bg-slate-50 text-left text-xs uppercase text-muted">
                <tr>
                  <th className="px-5 py-2">Produit</th>
                  <th className="px-3 py-2">Niveau</th>
                  <th className="px-3 py-2">Taux</th>
                  <th className="px-3 py-2">Montant</th>
                  <th className="px-3 py-2">Statut</th>
                  <th className="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentCommissions.map((c) => (
                  <tr key={c.id}>
                    <td className="px-5 py-2 font-medium text-ink">
                      {c.sale.product.name}
                      {c.sale.pricingType === "MONTHLY_SUB" && (
                        <span className="text-muted"> · Mois {c.monthIndex}</span>
                      )}
                    </td>
                    <td className="px-3 py-2">N{c.level}</td>
                    <td className="px-3 py-2">{pct(c.rate)}</td>
                    <td className="px-3 py-2 font-semibold">{fcfa(c.amount)}</td>
                    <td className="px-3 py-2">
                      <Badge tone={statusTone(c.status)}>{COMMISSION_STATUS_LABELS[c.status]}</Badge>
                    </td>
                    <td className="px-3 py-2 text-muted">{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

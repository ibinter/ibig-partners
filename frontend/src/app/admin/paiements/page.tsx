import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa, formatDate } from "@/lib/format";
import { Badge, Button, Card, PageHeader, statusTone } from "@/components/ui";
import { MIN_PAYOUT } from "@/lib/constants";
import { createPayout, markPayoutPaid } from "../actions";

export const dynamic = "force-dynamic";

export default async function PaiementsPage() {
  await requireAdmin();

  // partenaires ayant des commissions validées non encore liées à un payout
  const validatedByPartner = await prisma.commission.groupBy({
    by: ["userId"],
    where: { status: "VALIDATED", payoutId: null },
    _sum: { amount: true },
    _count: { _all: true },
  });

  const partnerIds = validatedByPartner.map((p) => p.userId);
  const partners = await prisma.user.findMany({
    where: { id: { in: partnerIds } },
    select: { id: true, firstName: true, lastName: true, code: true, payoutMethod: true, payoutDetail: true },
  });
  const partnerOf = (id: string) => partners.find((p) => p.id === id);

  const payouts = await prisma.payout.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { firstName: true, lastName: true, code: true } },
      _count: { select: { commissions: true } },
    },
  });

  const METHOD_LABELS: Record<string, string> = {
    ORANGE_MONEY: "Orange Money",
    WAVE: "Wave",
    MTN_MOMO: "MTN MoMo",
    BANK: "Virement bancaire",
  };

  return (
    <div>
      <PageHeader
        title="Paiements & virements"
        subtitle="Création des ordres de virement et suivi des paiements aux partenaires."
      />

      {validatedByPartner.length > 0 && (
        <Card className="mb-6">
          <h2 className="font-semibold text-ink">Partenaires à payer</h2>
          <p className="mb-4 text-sm text-muted">Seuls les partenaires ayant au moins {fcfa(MIN_PAYOUT)} de commissions validées peuvent être payés.</p>
          <div className="divide-y divide-slate-100">
            {validatedByPartner.map((v) => {
              const p = partnerOf(v.userId);
              const amount = v._sum.amount ?? 0;
              const payable = amount >= MIN_PAYOUT;
              return (
                <div key={v.userId} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-ink">{p?.firstName} {p?.lastName}
                      <span className="ml-2 font-mono text-xs text-muted">{p?.code}</span>
                    </p>
                    <p className="text-sm text-muted">
                      {v._count._all} comm. validées · {METHOD_LABELS[p?.payoutMethod ?? ""] ?? p?.payoutMethod}
                      {p?.payoutDetail && ` · ${p.payoutDetail}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xl font-bold ${payable ? "text-emerald-600" : "text-slate-400"}`}>
                      {fcfa(amount)}
                    </span>
                    {payable ? (
                      <form action={createPayout}>
                        <input type="hidden" name="userId" value={v.userId} />
                        <Button type="submit">Créer ordre de virement</Button>
                      </form>
                    ) : (
                      <span className="text-xs text-muted">Minimum non atteint</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {validatedByPartner.length === 0 && (
        <Card className="mb-6">
          <p className="text-center text-sm text-muted py-4">
            Aucune commission validée en attente de paiement. Validez d'abord les commissions dans l'onglet Commissions.
          </p>
        </Card>
      )}

      <Card className="p-0">
        <h2 className="px-5 py-4 font-semibold text-ink">Historique des virements</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-5 py-2">Référence</th>
                <th className="px-3 py-2">Partenaire</th>
                <th className="px-3 py-2">Montant</th>
                <th className="px-3 py-2">Comm.</th>
                <th className="px-3 py-2">Méthode</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">Créé le</th>
                <th className="px-3 py-2">Versé le</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payouts.map((pay) => (
                <tr key={pay.id} className={pay.status === "PENDING" ? "bg-amber-50/30" : ""}>
                  <td className="px-5 py-2 font-mono text-xs text-muted">{pay.reference ?? `#${pay.id.slice(-6)}`}</td>
                  <td className="px-3 py-2">
                    <p className="font-medium text-ink">{pay.user.firstName} {pay.user.lastName}</p>
                    <p className="font-mono text-xs text-muted">{pay.user.code}</p>
                  </td>
                  <td className="px-3 py-2 font-semibold text-ink">{fcfa(pay.amount)}</td>
                  <td className="px-3 py-2 text-xs text-muted">{pay._count.commissions} lignes</td>
                  <td className="px-3 py-2 text-xs">{METHOD_LABELS[pay.method ?? ""] ?? pay.method ?? "—"}</td>
                  <td className="px-3 py-2">
                    <Badge tone={pay.status === "PAID" ? "green" : pay.status === "PENDING" ? "amber" : "slate"}>
                      {pay.status === "PAID" ? "Versé" : pay.status === "PENDING" ? "En attente" : pay.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted">{formatDate(pay.createdAt)}</td>
                  <td className="px-3 py-2 text-xs text-muted">{pay.paidAt ? formatDate(pay.paidAt) : "—"}</td>
                  <td className="px-3 py-2">
                    {pay.status === "PENDING" && (
                      <form action={markPayoutPaid}>
                        <input type="hidden" name="id" value={pay.id} />
                        <Button type="submit" variant="secondary">Marquer versé</Button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {payouts.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-muted">Aucun virement enregistré.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

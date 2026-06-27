import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa, formatDate } from "@/lib/format";
import { Badge, EmptyState, PageHeader, StatCard, statusTone } from "@/components/ui";
import { PAYOUT_METHOD_LABELS } from "@/lib/constants";
import PayoutConfigForm from "./payout-config";

export const dynamic = "force-dynamic";

export default async function PaiementsPage() {
  const user = await requireUser();

  const [payouts, pending, validated] = await Promise.all([
    prisma.payout.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { commissions: { select: { id: true, amount: true } } },
    }),
    prisma.commission.aggregate({
      where: { userId: user.id, status: "PENDING" },
      _sum: { amount: true },
    }),
    prisma.commission.aggregate({
      where: { userId: user.id, status: "VALIDATED" },
      _sum: { amount: true },
    }),
  ]);

  const pendingAmount   = pending._sum.amount ?? 0;
  const validatedAmount = validated._sum.amount ?? 0;
  const payable         = pendingAmount + validatedAmount;
  const totalPaid       = payouts.filter(p => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const minPayout       = user.minPayout ?? 5000;

  const progressPct = Math.min(100, Math.round((payable / minPayout) * 100));
  const canRequest  = payable >= minPayout && user.verificationStatus === "VERIFIED";

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="🏦 Mes Paiements"
        subtitle="Suivez vos commissions, configurez votre seuil et téléchargez vos reçus."
      />

      {user.verificationStatus !== "VERIFIED" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <p className="font-semibold">⚠️ Compte non vérifié — paiements bloqués</p>
          <p className="mt-0.5 text-amber-700">
            Vos commissions sont calculées mais ne seront pas versées avant la vérification de votre compte.{" "}
            <a href="/espace/verification" className="font-bold underline text-amber-800">Vérifier mon compte →</a>
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Payable maintenant" value={fcfa(payable)} accent="gold" icon="💰" />
        <StatCard label="En attente" value={fcfa(pendingAmount)} sub="à valider" accent="brand" icon="⏳" />
        <StatCard label="Validé" value={fcfa(validatedAmount)} sub="prêt à verser" accent="green" icon="✅" />
        <StatCard label="Total versé" value={fcfa(totalPaid)} accent="slate" icon="🏦" />
      </div>

      {/* Seuil de paiement */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-ink text-sm">Seuil de déclenchement automatique</h2>
            <p className="text-xs text-muted mt-0.5">Le paiement se déclenche quand vos commissions payables atteignent ce seuil.</p>
          </div>
          <span className="text-base font-bold text-blue-600">{fcfa(minPayout)}</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-700 ${progressPct >= 100 ? "bg-gradient-to-r from-emerald-500 to-emerald-600" : "bg-gradient-to-r from-blue-500 to-blue-600"}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted">
          <span>{fcfa(payable)} disponible</span>
          <span>{progressPct}% du seuil atteint</span>
        </div>
        {canRequest && (
          <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm text-emerald-800 font-semibold">
            ✅ Seuil atteint — un paiement sera initié prochainement.
          </div>
        )}
      </div>

      {/* Configuration */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
          <h2 className="font-semibold text-ink text-sm">⚙️ Configuration de paiement</h2>
        </div>
        <div className="p-5">
          <PayoutConfigForm
            currentMin={minPayout}
            currentMethod={user.payoutMethod}
            currentDetail={user.payoutDetail ?? ""}
            isVerified={user.verificationStatus === "VERIFIED"}
          />
        </div>
      </div>

      {/* Historique des paiements */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <h2 className="font-semibold text-ink text-sm">Historique des paiements</h2>
          <span className="text-xs text-muted">{payouts.length} versement{payouts.length !== 1 ? "s" : ""}</span>
        </div>
        {payouts.length === 0 ? (
          <div className="px-5 pb-6 pt-4">
            <EmptyState>Aucun paiement pour le moment. Vos commissions s&apos;accumulent jusqu&apos;au seuil configuré.</EmptyState>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wide">Référence</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Montant</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Frais</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Net reçu</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Méthode</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Statut</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Date prévue</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Versé le</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Reçu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payouts.map((p) => {
                  const net = p.netAmount ?? (p.amount - p.fees);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-muted">
                        {p.receiptNumber ?? p.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-3 py-3 font-bold text-ink">{fcfa(p.amount)}</td>
                      <td className="px-3 py-3 text-rose-600 text-xs">
                        {p.fees > 0 ? `− ${fcfa(p.fees)}` : "—"}
                      </td>
                      <td className="px-3 py-3 font-semibold text-emerald-700">{fcfa(net)}</td>
                      <td className="px-3 py-3 text-xs text-muted">{PAYOUT_METHOD_LABELS[p.method] ?? p.method}</td>
                      <td className="px-3 py-3">
                        <Badge tone={p.status === "PAID" ? "green" : p.status === "PROCESSING" ? "blue" : "amber"}>
                          {p.status === "PAID" ? "Versé" : p.status === "PROCESSING" ? "En cours" : "En attente"}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-xs text-muted">
                        {p.scheduledDate ? formatDate(p.scheduledDate) : "—"}
                      </td>
                      <td className="px-3 py-3 text-xs text-muted">
                        {p.paidAt ? formatDate(p.paidAt) : "—"}
                      </td>
                      <td className="px-3 py-3">
                        {p.status === "PAID" && (
                          <a
                            href={`/espace/paiements/${p.id}/recu`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            📄 Reçu
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

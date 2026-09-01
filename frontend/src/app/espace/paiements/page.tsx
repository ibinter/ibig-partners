import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa, formatDate } from "@/lib/format";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { Button } from "@/components/button";
import { PAYOUT_METHOD_LABELS } from "@/lib/constants";
import PayoutConfigForm from "./payout-config";
import { requestPayout } from "../actions";

export const dynamic = "force-dynamic";

const PAYOUT_STEPS = [
  { icon: "🔐", label: "KYC validé",          desc: "Pièce d'identité + coordonnées de paiement" },
  { icon: "💰", label: "Commissions validées", desc: "L'équipe IBIG valide vos ventes déclarées" },
  { icon: "🎯", label: "Seuil atteint",        desc: "Montant disponible ≥ votre seuil configuré" },
  { icon: "💸", label: "Virement sous 48h",    desc: "Orange Money · Wave · Banque — sans support" },
];

export default async function PaiementsPage() {
  const user = await requireUser();

  const [payouts, pendingAgg, validatedAgg] = await Promise.all([
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

  const pendingAmount   = pendingAgg._sum.amount ?? 0;
  const validatedAmount = validatedAgg._sum.amount ?? 0;
  const payable         = pendingAmount + validatedAmount;
  const totalPaid       = payouts.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const minPayout       = user.minPayout ?? 5000;

  const progressPct   = Math.min(100, Math.round((payable / minPayout) * 100));
  const isVerified    = user.verificationStatus === "VERIFIED";
  const canRequest    = payable >= minPayout && isVerified;
  const pendingPayout = payouts.find((p) => p.status === "PENDING" || p.status === "PROCESSING");

  /* Étapes complétées */
  const stepsDone = [
    isVerified,
    validatedAmount > 0,
    payable >= minPayout,
    false, // virement = toujours futur
  ];

  return (
    <div className="space-y-5 pb-10">
      <PageHeader
        title="Mes Paiements"
        subtitle="Retrait self-service disponible après validation KYC — virement sous 48h"
      />

      {/* ── Alerte KYC ── */}
      {!isVerified && (
        <Link
          href="/espace/verification"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 transition hover:bg-orange-100"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔐</span>
            <div>
              <p className="text-sm font-semibold text-orange-900">KYC requis — paiements bloqués</p>
              <p className="text-xs text-orange-700">Vérifiez votre identité et vos coordonnées pour débloquer les virements.</p>
            </div>
          </div>
          <span className="shrink-0 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white">
            Compléter mon KYC →
          </span>
        </Link>
      )}

      {/* ── 4 KPIs ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-100">Disponible (payable)</p>
          <p className="mt-1 text-2xl font-extrabold">{fcfa(payable)}</p>
          <p className="mt-0.5 text-xs text-amber-100">en attente + validées</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">En attente</p>
          <p className="mt-1 text-2xl font-extrabold">{fcfa(pendingAmount)}</p>
          <p className="mt-0.5 text-xs text-slate-400">à valider par IBIG</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-200">Validées (à verser)</p>
          <p className="mt-1 text-2xl font-extrabold">{fcfa(validatedAmount)}</p>
          <p className="mt-0.5 text-xs text-blue-200">prêtes au paiement</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200">Total versé</p>
          <p className="mt-1 text-2xl font-extrabold">{fcfa(totalPaid)}</p>
          <p className="mt-0.5 text-xs text-emerald-200">{payouts.filter((p) => p.status === "PAID").length} virement{payouts.filter((p) => p.status === "PAID").length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* ── Processus 4 étapes ── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-800 text-sm mb-4">Comment fonctionne le retrait self-service</h2>
        <div className="flex flex-col sm:flex-row items-start gap-0">
          {PAYOUT_STEPS.map((step, i) => {
            const done = stepsDone[i];
            return (
              <div key={step.label} className="flex sm:flex-col flex-row items-start sm:items-center flex-1 gap-3 sm:gap-2 sm:text-center">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg border-2 ${
                  done ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-slate-50"
                }`}>
                  {done ? "✅" : step.icon}
                </div>
                <div className="sm:px-2 flex-1">
                  <p className={`text-xs font-bold ${done ? "text-emerald-700" : "text-slate-700"}`}>{step.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{step.desc}</p>
                </div>
                {i < PAYOUT_STEPS.length - 1 && (
                  <div className="hidden sm:block h-0.5 w-full bg-slate-100 absolute" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bloc retrait ── */}
      <div className={`rounded-2xl border p-5 shadow-sm ${canRequest ? "border-emerald-200 bg-emerald-50" : "border-slate-100 bg-white"}`}>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="font-semibold text-slate-800 text-sm">
              {canRequest ? "✅ Retrait disponible" : "Progression vers le seuil"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Seuil configuré : <strong className="text-slate-700">{fcfa(minPayout)}</strong>
              {" · "}
              {fcfa(payable)} disponibles
              {!canRequest && payable < minPayout && (
                <> · manque <strong className="text-slate-700">{fcfa(minPayout - payable)}</strong></>
              )}
            </p>
          </div>
          <span className={`text-lg font-extrabold ${progressPct >= 100 ? "text-emerald-600" : "text-slate-700"}`}>
            {progressPct} %
          </span>
        </div>

        {/* Barre */}
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 mb-4">
          <div
            className={`h-full rounded-full transition-all duration-700 ${progressPct >= 100 ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-blue-500 to-blue-600"}`}
            style={{ width: `${Math.max(progressPct, progressPct > 0 ? 2 : 0)}%` }}
          />
        </div>

        {/* État du retrait */}
        {pendingPayout ? (
          <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 flex items-start gap-3">
            <span className="text-xl shrink-0">⏳</span>
            <div>
              <p className="text-sm font-semibold text-blue-800">Demande en cours de traitement</p>
              <p className="text-xs text-blue-700 mt-0.5">
                Votre retrait de <strong>{fcfa(pendingPayout.amount)}</strong> est traité par l'équipe IBIG.
                Virement sous 24–48h sur votre {PAYOUT_METHOD_LABELS[pendingPayout.method] ?? pendingPayout.method}.
              </p>
            </div>
          </div>
        ) : canRequest ? (
          <div className="space-y-3">
            <div className="rounded-xl bg-white border border-emerald-200 px-4 py-3 flex items-center gap-3">
              <span className="text-xl shrink-0">💳</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Méthode de paiement configurée</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {PAYOUT_METHOD_LABELS[user.payoutMethod] ?? user.payoutMethod}
                  {user.payoutDetail && <span className="font-normal text-slate-500"> · {user.payoutDetail}</span>}
                </p>
              </div>
              <Link href="#config" className="text-xs text-blue-600 hover:underline shrink-0">Modifier</Link>
            </div>
            <form action={requestPayout}>
              <Button type="submit" size="lg" className="w-full">
                💸 Demander mon retrait — {fcfa(payable)}
              </Button>
            </form>
            <p className="text-center text-xs text-slate-400">
              Virement traité sous 24–48h · Sans intervention du support · 100 % self-service
            </p>
          </div>
        ) : !isVerified ? (
          <Link
            href="/espace/verification"
            className="flex items-center justify-center gap-2 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-800 font-semibold text-sm py-3 transition"
          >
            🔐 Compléter mon KYC pour débloquer le retrait →
          </Link>
        ) : (
          <p className="text-center text-xs text-slate-400">
            Continuez à vendre pour atteindre le seuil de {fcfa(minPayout)}.{" "}
            <Link href="/espace/commissions" className="text-blue-600 hover:underline">Voir mes commissions →</Link>
          </p>
        )}
      </div>

      {/* ── Configuration ── */}
      <div id="config" className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 bg-slate-50 border-b border-slate-100 px-5 py-3">
          <span className="text-lg">⚙️</span>
          <h2 className="font-semibold text-slate-800 text-sm">Configuration de paiement</h2>
        </div>
        <div className="p-5">
          <PayoutConfigForm
            currentMin={minPayout}
            currentMethod={user.payoutMethod}
            currentDetail={user.payoutDetail ?? ""}
            isVerified={isVerified}
          />
        </div>
      </div>

      {/* ── Historique ── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <h2 className="font-semibold text-slate-800 text-sm">Historique des virements</h2>
          <span className="text-xs text-slate-400">{payouts.length} virement{payouts.length !== 1 ? "s" : ""}</span>
        </div>
        {payouts.length === 0 ? (
          <div className="px-5 pb-8 pt-6 text-center">
            <p className="text-3xl mb-2">🏦</p>
            <p className="text-sm text-slate-400">Aucun virement pour le moment.</p>
            <p className="text-xs text-slate-400 mt-1">Vos commissions s'accumulent jusqu'au seuil configuré.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wide">Référence</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide text-right">Montant</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide text-right">Frais</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide text-right">Net reçu</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Méthode</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Statut</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Versé le</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Reçu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payouts.map((p) => {
                  const net = p.netAmount ?? (p.amount - p.fees);
                  const isPaid = p.status === "PAID";
                  const isProcessing = p.status === "PROCESSING";
                  return (
                    <tr key={p.id} className={`hover:bg-slate-50/60 transition-colors ${isPaid ? "opacity-80" : ""}`}>
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs text-slate-400">
                          {p.receiptNumber ?? p.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-bold text-slate-800 text-right">{fcfa(p.amount)}</td>
                      <td className="px-3 py-3 text-right text-xs">
                        {p.fees > 0 ? <span className="text-rose-500">− {fcfa(p.fees)}</span> : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-3 py-3 font-semibold text-emerald-700 text-right">{fcfa(net)}</td>
                      <td className="px-3 py-3 text-xs text-slate-500">{PAYOUT_METHOD_LABELS[p.method] ?? p.method}</td>
                      <td className="px-3 py-3">
                        <Badge tone={isPaid ? "green" : isProcessing ? "blue" : "gold"}>
                          {isPaid ? "✅ Versé" : isProcessing ? "⏳ En cours" : "🕐 En attente"}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-400">
                        {p.paidAt ? formatDate(p.paidAt) : p.scheduledDate ? formatDate(p.scheduledDate) : "—"}
                      </td>
                      <td className="px-3 py-3">
                        {isPaid && (
                          <a
                            href={`/espace/paiements/${p.id}/recu`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
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

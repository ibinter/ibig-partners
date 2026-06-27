import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa, formatDate } from "@/lib/format";
import { PAYOUT_METHOD_LABELS } from "@/lib/constants";
import PrintButton from "./print-button";

export const dynamic = "force-dynamic";

export default async function RecuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const payout = await prisma.payout.findFirst({
    where: { id, userId: user.id },
    include: {
      commissions: {
        include: { sale: { include: { product: true } } },
      },
    },
  });

  if (!payout || payout.status !== "PAID") notFound();

  const net = payout.netAmount ?? (payout.amount - payout.fees);
  const receiptNum = payout.receiptNumber ?? `IBIG-PAY-${payout.id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <a href="/espace/paiements" className="text-sm text-blue-600 hover:underline">← Retour aux paiements</a>
        <PrintButton />
      </div>

      {/* Reçu */}
      <div id="receipt" className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-violet-700 px-6 py-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-200">IBIG PARTNERS</p>
              <h1 className="text-xl font-bold mt-1">Reçu de Paiement</h1>
              <p className="text-sm text-blue-100 mt-0.5">#{receiptNum}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{fcfa(net)}</p>
              <p className="text-xs text-blue-200 mt-0.5">Montant reçu</p>
            </div>
          </div>
        </div>

        {/* Infos */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide font-semibold mb-1">Bénéficiaire</p>
              <p className="font-semibold text-ink">{user.firstName} {user.lastName}</p>
              <p className="text-muted text-xs">{user.email}</p>
              <p className="text-muted text-xs font-mono">{user.code}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted uppercase tracking-wide font-semibold mb-1">Paiement</p>
              <p className="font-semibold text-ink">{PAYOUT_METHOD_LABELS[payout.method] ?? payout.method}</p>
              <p className="text-muted text-xs">{payout.paidAt ? formatDate(payout.paidAt) : "—"}</p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 grid grid-cols-3 gap-4 text-sm text-center">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide">Brut</p>
              <p className="font-bold text-ink mt-1">{fcfa(payout.amount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide">Frais</p>
              <p className="font-bold text-rose-600 mt-1">− {fcfa(payout.fees)}</p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide">Net reçu</p>
              <p className="font-bold text-emerald-700 mt-1">{fcfa(net)}</p>
            </div>
          </div>

          {/* Détail des commissions */}
          {payout.commissions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Commissions incluses</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-muted">
                    <th className="pb-1">Produit</th>
                    <th className="pb-1">Niv.</th>
                    <th className="pb-1 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payout.commissions.map((c) => (
                    <tr key={c.id}>
                      <td className="py-1 text-ink">{c.sale.product.name}</td>
                      <td className="py-1 text-muted">N{c.level}</td>
                      <td className="py-1 text-right font-semibold text-ink">{fcfa(c.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-slate-100 pt-4 text-center">
            <p className="text-xs text-muted">Ce reçu est généré automatiquement par la plateforme IBIG PARTNERS.</p>
            <p className="text-xs text-muted">Conservez-le pour vos déclarations fiscales.</p>
            <p className="mt-2 text-xs font-mono text-slate-400">{receiptNum} · {payout.paidAt ? formatDate(payout.paidAt) : ""}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

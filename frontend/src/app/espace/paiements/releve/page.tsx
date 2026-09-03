import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa, formatDate } from "@/lib/format";
import { PAYOUT_METHOD_LABELS } from "@/lib/constants";
import Link from "next/link";
import PrintButton from "../[id]/recu/print-button";
import { MonthSelector } from "./month-selector";

export const dynamic = "force-dynamic";

export default async function RelevePage({
  searchParams,
}: {
  searchParams: Promise<{ mois?: string }>;
}) {
  const user = await requireUser();
  const { mois } = await searchParams;

  // Mois sélectionné (défaut = mois précédent)
  const now = new Date();
  const defaultMois = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, "0")}`;
  const selectedMois = mois ?? defaultMois;
  const [yearStr, monthStr] = selectedMois.split("-");
  const year = parseInt(yearStr);
  const month = parseInt(monthStr); // 1-12

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd   = new Date(year, month, 1);
  const monthLabel = monthStart.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const [commissions, payouts] = await Promise.all([
    prisma.commission.findMany({
      where: { userId: user.id, createdAt: { gte: monthStart, lt: monthEnd } },
      include: {
        sale: { include: { product: { select: { name: true } } } },
        payout: { select: { reference: true, receiptNumber: true, paidAt: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.payout.findMany({
      where: { userId: user.id, createdAt: { gte: monthStart, lt: monthEnd } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const totalCommissions = commissions.reduce((s, c) => s + c.amount, 0);
  const totalPaid = payouts.filter((p) => p.status === "PAID").reduce((s, p) => s + (p.netAmount ?? p.amount), 0);
  const totalPending = commissions.filter((c) => c.status === "PENDING").reduce((s, c) => s + c.amount, 0);
  const totalValidated = commissions.filter((c) => c.status === "VALIDATED").reduce((s, c) => s + c.amount, 0);

  const STATUS_LABEL: Record<string, string> = {
    PENDING: "En attente",
    VALIDATED: "Validée",
    PAID: "Versée",
    REJECTED: "Rejetée",
  };
  const STATUS_COLOR: Record<string, string> = {
    PENDING: "text-amber-600",
    VALIDATED: "text-blue-600",
    PAID: "text-emerald-600",
    REJECTED: "text-rose-600",
  };

  // Générer les options des 12 derniers mois
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i - 1, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return { val, label };
  });

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-10">
      {/* Navigation */}
      <div className="flex items-center justify-between print:hidden">
        <Link href="/espace/paiements" className="text-sm text-blue-600 hover:underline">
          ← Retour aux paiements
        </Link>
        <PrintButton />
      </div>

      {/* Sélecteur de mois */}
      <div className="print:hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <MonthSelector options={monthOptions} selected={selectedMois} />
      </div>

      {/* En-tête relevé */}
      <div id="releve" className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-violet-700 px-6 py-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-200">IBIG PARTNERS</p>
              <h1 className="text-xl font-bold mt-1">Relevé de commissions</h1>
              <p className="text-sm text-blue-100 mt-0.5 capitalize">{monthLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold">{fcfa(totalCommissions)}</p>
              <p className="text-xs text-blue-200 mt-0.5">Total du mois</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Infos partenaire */}
          <div className="grid grid-cols-2 gap-4 text-sm border-b border-slate-100 pb-5">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Partenaire</p>
              <p className="font-semibold text-slate-800">{user.firstName} {user.lastName}</p>
              <p className="text-slate-500 text-xs">{user.email}</p>
              <p className="font-mono text-xs text-slate-400 mt-0.5">{user.code}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Période</p>
              <p className="font-semibold text-slate-800 capitalize">{monthLabel}</p>
              <p className="text-slate-500 text-xs">Généré le {formatDate(new Date())}</p>
            </div>
          </div>

          {/* Synthèse 4 KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total mois", val: fcfa(totalCommissions), color: "text-slate-800" },
              { label: "En attente", val: fcfa(totalPending), color: "text-amber-600" },
              { label: "Validées", val: fcfa(totalValidated), color: "text-blue-600" },
              { label: "Versé", val: fcfa(totalPaid), color: "text-emerald-600" },
            ].map((k) => (
              <div key={k.label} className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{k.label}</p>
                <p className={`text-lg font-extrabold mt-1 ${k.color}`}>{k.val}</p>
              </div>
            ))}
          </div>

          {/* Tableau des commissions */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Détail des commissions ({commissions.length})
            </h3>
            {commissions.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Aucune commission ce mois.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 pr-3 font-semibold text-slate-400 uppercase tracking-wide">Date</th>
                      <th className="text-left py-2 pr-3 font-semibold text-slate-400 uppercase tracking-wide">Produit</th>
                      <th className="text-center py-2 pr-3 font-semibold text-slate-400">Niv.</th>
                      <th className="text-right py-2 pr-3 font-semibold text-slate-400 uppercase tracking-wide">Montant</th>
                      <th className="text-right py-2 font-semibold text-slate-400 uppercase tracking-wide">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {commissions.map((c) => (
                      <tr key={c.id}>
                        <td className="py-2 pr-3 text-slate-400">{formatDate(c.createdAt)}</td>
                        <td className="py-2 pr-3 text-slate-700 font-medium max-w-[160px] truncate">
                          {c.sale?.product?.name ?? "—"}
                        </td>
                        <td className="py-2 pr-3 text-center text-slate-500">N{c.level}</td>
                        <td className="py-2 pr-3 text-right font-semibold tabular-nums text-slate-800">{fcfa(c.amount)}</td>
                        <td className={`py-2 text-right font-semibold ${STATUS_COLOR[c.status] ?? "text-slate-400"}`}>
                          {STATUS_LABEL[c.status] ?? c.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200">
                      <td colSpan={3} className="pt-3 pr-3 font-bold text-slate-700 uppercase tracking-wide text-xs">Total</td>
                      <td className="pt-3 pr-3 text-right font-extrabold text-slate-900 tabular-nums">{fcfa(totalCommissions)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Virements du mois */}
          {payouts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Virements du mois</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 pr-3 font-semibold text-slate-400 uppercase tracking-wide">Référence</th>
                    <th className="text-left py-2 pr-3 font-semibold text-slate-400 uppercase tracking-wide">Méthode</th>
                    <th className="text-right py-2 pr-3 font-semibold text-slate-400 uppercase tracking-wide">Brut</th>
                    <th className="text-right py-2 pr-3 font-semibold text-slate-400 uppercase tracking-wide">Frais</th>
                    <th className="text-right py-2 font-semibold text-slate-400 uppercase tracking-wide">Net reçu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payouts.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2 pr-3 font-mono text-slate-400">{p.receiptNumber ?? p.reference ?? p.id.slice(0, 8).toUpperCase()}</td>
                      <td className="py-2 pr-3 text-slate-600">{PAYOUT_METHOD_LABELS[p.method] ?? p.method}</td>
                      <td className="py-2 pr-3 text-right tabular-nums text-slate-700">{fcfa(p.amount)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums text-rose-500">{p.fees > 0 ? `− ${fcfa(p.fees)}` : "—"}</td>
                      <td className="py-2 text-right font-bold tabular-nums text-emerald-700">{fcfa(p.netAmount ?? (p.amount - p.fees))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-slate-100 pt-4 text-center">
            <p className="text-[10px] text-slate-400">
              Document généré automatiquement par IBIG PARTNERS · Conservez-le pour vos déclarations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

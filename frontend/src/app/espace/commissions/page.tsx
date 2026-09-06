import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

const LEVEL_LABEL: Record<number, string> = { 1: "Vente directe", 2: "Filleul N2", 3: "Filleul N3" };
const LEVEL_COLOR: Record<number, string> = {
  1: "bg-blue-50 text-blue-700",
  2: "bg-violet-50 text-violet-700",
  3: "bg-amber-50 text-amber-700",
};
const STATUS_COLOR: Record<string, string> = {
  PENDING:   "bg-amber-100 text-amber-700",
  VALIDATED: "bg-blue-100 text-blue-700",
  PAID:      "bg-emerald-100 text-emerald-700",
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente", VALIDATED: "Validée", PAID: "Payée",
};

export default async function CommissionsPage() {
  const user = await requireUser();

  const commissions = await prisma.commission.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      sale: {
        include: { product: true, seller: { select: { firstName: true, lastName: true, code: true } } },
      },
    },
  });

  // Agrégats par niveau
  const byLevel = [1, 2, 3].map((lvl) => {
    const rows = commissions.filter((c) => c.level === lvl);
    const total   = rows.reduce((s, c) => s + c.amount, 0);
    const paid    = rows.filter((c) => c.status === "PAID").reduce((s, c) => s + c.amount, 0);
    const pending = rows.filter((c) => c.status === "PENDING").reduce((s, c) => s + c.amount, 0);
    return { lvl, count: rows.length, total, paid, pending };
  });

  const grandTotal   = commissions.reduce((s, c) => s + c.amount, 0);
  const grandPaid    = commissions.filter((c) => c.status === "PAID").reduce((s, c) => s + c.amount, 0);
  const grandPending = commissions.filter((c) => c.status === "PENDING").reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes Commissions"
        subtitle={`${commissions.length} commission(s) · ${fcfa(grandTotal)} au total`}
      />

      {/* ── KPIs globaux ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total cumulé", value: fcfa(grandTotal), color: "text-slate-700", bg: "bg-white" },
          { label: "Commissions payées", value: fcfa(grandPaid), color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "En attente", value: fcfa(grandPending), color: "text-amber-600", bg: "bg-amber-50" },
        ].map((k) => (
          <div key={k.label} className={`rounded-2xl border border-slate-100 ${k.bg} p-5 shadow-sm`}>
            <p className={`text-2xl font-extrabold tabular-nums ${k.color}`}>{k.value}</p>
            <p className="text-xs text-slate-500 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {/* ── Répartition par niveau ── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 text-sm mb-4">Répartition multi-niveaux</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {byLevel.filter((b) => b.count > 0).map((b) => (
            <div key={b.lvl} className={`rounded-xl p-4 ${LEVEL_COLOR[b.lvl]?.split(" ")[0] ?? "bg-slate-50"}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${LEVEL_COLOR[b.lvl]}`}>
                  N{b.lvl}
                </span>
                <span className="text-xs font-semibold text-slate-700">{LEVEL_LABEL[b.lvl]}</span>
              </div>
              <p className="text-xl font-extrabold text-slate-800 tabular-nums">{fcfa(b.total)}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{b.count} commission(s) · {fcfa(b.paid)} payé(es)</p>
            </div>
          ))}
          {byLevel.every((b) => b.count === 0) && (
            <p className="col-span-3 text-sm text-slate-400 text-center py-4">Aucune commission pour l'instant</p>
          )}
        </div>
      </div>

      {/* ── Détail ── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50">
          <h3 className="font-semibold text-slate-800 text-sm">Détail des commissions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Niveau</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Produit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Vendeur</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Montant</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {commissions.slice(0, 100).map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${LEVEL_COLOR[c.level] ?? "bg-slate-100 text-slate-600"}`}>
                      N{c.level} — {LEVEL_LABEL[c.level] ?? `Niveau ${c.level}`}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{c.sale.product.name}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {c.sale.seller.firstName} {c.sale.seller.lastName}
                    <span className="ml-1 text-slate-400">({c.sale.seller.code})</span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums text-slate-800">{fcfa(c.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[c.status] ?? "bg-slate-100"}`}>
                      {STATUS_LABEL[c.status] ?? c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {commissions.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400">Aucune commission</div>
          )}
        </div>
      </div>
    </div>
  );
}

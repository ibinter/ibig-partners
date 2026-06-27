import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa, formatDate, pct } from "@/lib/format";
import { Badge, EmptyState, PageHeader, StatCard, statusTone } from "@/components/ui";
import { COMMISSION_STATUS_LABELS, MIN_PAYOUT } from "@/lib/constants";
import { ExportExcelButton, ExportPDFButton } from "@/components/export-buttons";

export const dynamic = "force-dynamic";

export default async function CommissionsPage() {
  const user = await requireUser();

  const commissions = await prisma.commission.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { sale: { include: { product: true } } },
  });

  const sum = (status: string) =>
    commissions.filter((c) => c.status === status).reduce((a, c) => a + c.amount, 0);
  const pending = sum("PENDING");
  const validated = sum("VALIDATED");
  const paid = sum("PAID");

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mes Commissions"
        subtitle={`Seuil minimum de versement : ${fcfa(MIN_PAYOUT)} · Paiement sous 7 jours ouvrables`}
        action={
          <div className="flex flex-wrap gap-2">
            <ExportExcelButton
              data={commissions.map((c) => ({
                Produit: c.sale.product.name,
                "Réf. vente": c.sale.reference,
                Niveau: `N${c.level}`,
                Mois: c.monthIndex ?? 1,
                "Taux (%)": c.rate,
                "Montant (FCFA)": c.amount,
                Statut: COMMISSION_STATUS_LABELS[c.status] ?? c.status,
                Date: formatDate(c.createdAt),
              }))}
              filename={`commissions-${user.code}`}
              label="Excel"
            />
            <ExportPDFButton
              title={`Commissions — ${user.firstName} ${user.lastName} (${user.code})`}
              columns={["Produit", "Réf.", "Niv.", "Mois", "Taux", "Montant", "Statut", "Date"]}
              rows={commissions.map((c) => [
                c.sale.product.name,
                c.sale.reference,
                `N${c.level}`,
                c.monthIndex ?? 1,
                `${c.rate}%`,
                `${c.amount.toLocaleString("fr-FR")} FCFA`,
                COMMISSION_STATUS_LABELS[c.status] ?? c.status,
                formatDate(c.createdAt),
              ])}
              filename={`commissions-${user.code}`}
              label="PDF"
            />
            <a
              href="/espace/commissions/releve"
              target="_blank"
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              🖨 Relevé imprimable
            </a>
          </div>
        }
      />

      {/* Stats colorées */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="En attente" value={fcfa(pending)} accent="gold" icon="⏳" />
        <StatCard label="Validées (à verser)" value={fcfa(validated)} accent="brand" icon="✔️" />
        <StatCard label="Versées" value={fcfa(paid)} accent="green" icon="💸" />
      </div>

      {/* Tableau */}
      <div className="card-premium overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-ink text-sm">Historique des commissions</h3>
            <p className="text-xs text-muted mt-0.5">{commissions.length} entrée(s)</p>
          </div>
        </div>
        {commissions.length === 0 ? (
          <div className="p-6"><EmptyState>Aucune commission enregistrée.</EmptyState></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wide">Vente</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Produit</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Niv.</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Mois</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Taux</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Montant</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Statut</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {commissions.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-muted">{c.sale.reference}</td>
                    <td className="px-3 py-3 font-semibold text-ink">{c.sale.product.name}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {c.level}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted">{c.sale.pricingType === "MONTHLY_SUB" ? `M${c.monthIndex}` : "—"}</td>
                    <td className="px-3 py-3 text-muted">{pct(c.rate)}</td>
                    <td className="px-3 py-3 font-bold text-ink">{fcfa(c.amount)}</td>
                    <td className="px-3 py-3"><Badge tone={statusTone(c.status)}>{COMMISSION_STATUS_LABELS[c.status]}</Badge></td>
                    <td className="px-3 py-3 text-xs text-muted">{formatDate(c.createdAt)}</td>
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

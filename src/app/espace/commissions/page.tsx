import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa, formatDate, pct } from "@/lib/format";
import { Badge, Card, EmptyState, PageHeader, StatCard, statusTone } from "@/components/ui";
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
    <div>
      <PageHeader
        title="Mes Commissions"
        subtitle={`Paiement sous 7 jours ouvrables après encaissement client · Seuil minimum de versement : ${fcfa(MIN_PAYOUT)}`}
        action={
          <div className="flex flex-wrap gap-2">
            <ExportExcelButton
              data={commissions.map((c) => ({
                Produit: c.sale.product.name,
                "Réf. vente": c.sale.reference,
                Niveau: `N${c.level}`,
                "Mois": c.monthIndex ?? 1,
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
              className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              🖨 Relevé imprimable
            </a>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="En attente" value={fcfa(pending)} accent="gold" />
        <StatCard label="Validées (à verser)" value={fcfa(validated)} accent="brand" />
        <StatCard label="Versées" value={fcfa(paid)} accent="green" />
      </div>

      <Card className="mt-6 p-0">
        {commissions.length === 0 ? (
          <div className="p-6"><EmptyState>Aucune commission enregistrée.</EmptyState></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-muted">
                <tr>
                  <th className="px-5 py-2">Vente</th>
                  <th className="px-3 py-2">Produit</th>
                  <th className="px-3 py-2">Niv.</th>
                  <th className="px-3 py-2">Mois</th>
                  <th className="px-3 py-2">Taux</th>
                  <th className="px-3 py-2">Montant</th>
                  <th className="px-3 py-2">Statut</th>
                  <th className="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commissions.map((c) => (
                  <tr key={c.id}>
                    <td className="px-5 py-2 font-mono text-xs text-muted">{c.sale.reference}</td>
                    <td className="px-3 py-2 font-medium text-ink">{c.sale.product.name}</td>
                    <td className="px-3 py-2">N{c.level}</td>
                    <td className="px-3 py-2">{c.sale.pricingType === "MONTHLY_SUB" ? `M${c.monthIndex}` : "—"}</td>
                    <td className="px-3 py-2">{pct(c.rate)}</td>
                    <td className="px-3 py-2 font-semibold">{fcfa(c.amount)}</td>
                    <td className="px-3 py-2"><Badge tone={statusTone(c.status)}>{COMMISSION_STATUS_LABELS[c.status]}</Badge></td>
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

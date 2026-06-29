import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa, formatDate } from "@/lib/format";
import { Badge, Button, Card, PageHeader, statusTone } from "@/components/ui";
import { COMMISSION_STATUS_LABELS, PRICING_TYPE_LABELS } from "@/lib/constants";
import { validateAllPending, validateCommission } from "../actions";
import { ExportExcelButton, ExportPDFButton } from "@/components/export-buttons";

export const dynamic = "force-dynamic";

export default async function CommissionsPage() {
  await requireAdmin();

  const commissions = await prisma.commission.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      user: { select: { firstName: true, lastName: true, code: true } },
      sale: { include: { product: { select: { name: true } } } },
      payout: { select: { reference: true } },
    },
  });

  // regrouper les montants PENDING par partenaire
  const pendingByPartner = await prisma.commission.groupBy({
    by: ["userId"],
    where: { status: "PENDING" },
    _sum: { amount: true },
    _count: { _all: true },
  });
  const partnerIds = pendingByPartner.map((p) => p.userId);
  const partnerNames = await prisma.user.findMany({
    where: { id: { in: partnerIds } },
    select: { id: true, firstName: true, lastName: true },
  });
  const nameOf = (id: string) => {
    const u = partnerNames.find((p) => p.id === id);
    return u ? `${u.firstName} ${u.lastName}` : id;
  };

  const totalPending = commissions.filter((c) => c.status === "PENDING").reduce((a, c) => a + c.amount, 0);
  const totalValidated = commissions.filter((c) => c.status === "VALIDATED").reduce((a, c) => a + c.amount, 0);

  const excelData = commissions.map((c) => ({
    Partenaire: `${c.user.firstName} ${c.user.lastName}`,
    Code: c.user.code,
    Vente: c.sale.reference,
    Produit: c.sale.product.name,
    Type: PRICING_TYPE_LABELS[c.sale.pricingType] ?? c.sale.pricingType,
    Niveau: `N${c.level}`,
    Mois: c.monthIndex ?? 1,
    "Taux (%)": c.rate,
    "Montant (FCFA)": c.amount,
    Statut: COMMISSION_STATUS_LABELS[c.status] ?? c.status,
    Date: formatDate(c.createdAt),
    Virement: c.payout?.reference ?? "",
  }));

  const pdfCols = ["Partenaire", "Vente", "Niv.", "Mois", "Taux", "Montant", "Statut", "Date"];
  const pdfRows = commissions.map((c) => [
    `${c.user.firstName} ${c.user.lastName}`,
    c.sale.reference,
    `N${c.level}`,
    c.monthIndex ?? 1,
    `${c.rate}%`,
    `${c.amount.toLocaleString("fr-FR")} FCFA`,
    COMMISSION_STATUS_LABELS[c.status] ?? c.status,
    formatDate(c.createdAt),
  ]);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Commissions"
          subtitle="Validation et suivi des commissions générées par le réseau."
        />
        <div className="flex shrink-0 gap-2 pt-1">
          <ExportExcelButton data={excelData} filename="commissions-ibig" label="Excel" />
          <ExportPDFButton
            title="Liste des commissions"
            columns={pdfCols}
            rows={pdfRows}
            filename="commissions-ibig"
            label="PDF"
          />
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-muted">En attente de validation</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{fcfa(totalPending)}</p>
          <p className="text-xs text-muted">{commissions.filter((c) => c.status === "PENDING").length} lignes</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Validées (à payer)</p>
          <p className="mt-1 text-2xl font-bold text-brand-600">{fcfa(totalValidated)}</p>
          <p className="text-xs text-muted">{commissions.filter((c) => c.status === "VALIDATED").length} lignes</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Déjà versées</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {fcfa(commissions.filter((c) => c.status === "PAID").reduce((a, c) => a + c.amount, 0))}
          </p>
          <p className="text-xs text-muted">{commissions.filter((c) => c.status === "PAID").length} lignes</p>
        </Card>
      </div>

      {pendingByPartner.length > 0 && (
        <Card className="mb-6">
          <h2 className="font-semibold text-ink">Valider en masse par partenaire</h2>
          <div className="mt-3 divide-y divide-slate-100">
            {pendingByPartner.map((p) => (
              <div key={p.userId} className="flex items-center justify-between py-2.5">
                <div>
                  <span className="font-medium text-ink">{nameOf(p.userId)}</span>
                  <span className="ml-2 text-sm text-muted">
                    {p._count._all} comm. · {fcfa(p._sum.amount ?? 0)}
                  </span>
                </div>
                <form action={validateAllPending} className="flex gap-2">
                  <input type="hidden" name="userId" value={p.userId} />
                  <Button type="submit" variant="secondary">Valider tout</Button>
                </form>
              </div>
            ))}
            <div className="flex justify-end pt-3">
              <form action={validateAllPending}>
                <input type="hidden" name="userId" value="" />
                <Button type="submit">Valider TOUTES les commissions en attente</Button>
              </form>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-5 py-2">Partenaire</th>
                <th className="px-3 py-2">Vente</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Niv.</th>
                <th className="px-3 py-2">Mois</th>
                <th className="px-3 py-2">Taux</th>
                <th className="px-3 py-2">Montant</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {commissions.map((c) => (
                <tr key={c.id} className={c.status === "PENDING" ? "bg-amber-50/30" : ""}>
                  <td className="px-5 py-2">
                    <p className="font-medium text-ink">{c.user.firstName} {c.user.lastName}</p>
                    <p className="font-mono text-xs text-muted">{c.user.code}</p>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <p className="font-medium text-ink">{c.sale.product.name}</p>
                    <p className="font-mono text-muted">{c.sale.reference}</p>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted">{PRICING_TYPE_LABELS[c.sale.pricingType]}</td>
                  <td className="px-3 py-2 text-center font-semibold text-brand-700">N{c.level}</td>
                  <td className="px-3 py-2 text-center text-xs text-muted">
                    {c.monthIndex != null ? `M${c.monthIndex}` : "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted">{c.rate}%</td>
                  <td className="px-3 py-2 font-semibold text-ink">{fcfa(c.amount)}</td>
                  <td className="px-3 py-2">
                    <Badge tone={statusTone(c.status)}>{COMMISSION_STATUS_LABELS[c.status]}</Badge>
                    {c.payout?.reference && (
                      <p className="mt-0.5 font-mono text-xs text-muted">{c.payout.reference}</p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted">{formatDate(c.createdAt)}</td>
                  <td className="px-3 py-2">
                    {c.status === "PENDING" && (
                      <form action={validateCommission}>
                        <input type="hidden" name="id" value={c.id} />
                        <Button type="submit" variant="secondary">Valider</Button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {commissions.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-5 py-8 text-center text-muted">Aucune commission.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

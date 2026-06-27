import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa, formatDate } from "@/lib/format";
import { Badge, Button, Card, Field, PageHeader, statusTone } from "@/components/ui";
import { MONTHLY_DURATION, PRICING_TYPE_LABELS, SALE_STATUS_LABELS } from "@/lib/constants";
import { addPaidMonth, cancelSale, confirmSale, createSale } from "../actions";

export const dynamic = "force-dynamic";

export default async function VentesPage() {
  await requireAdmin();
  const [sales, partners, products] = await Promise.all([
    prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
      include: { product: true, seller: true, _count: { select: { commissions: true } } },
    }),
    prisma.user.findMany({
      where: { role: "PARTNER", approved: true },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true, code: true },
    }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, price: true, pricingType: true },
    }),
  ]);

  return (
    <div>
      <PageHeader title="Suivi des ventes & conversions" subtitle="Ventes générées par affiliation et génération des commissions." />

      <Card className="mb-6">
        <h2 className="font-semibold text-ink">Enregistrer une vente</h2>
        <form action={createSale} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Partenaire vendeur" name="sellerId">
            <select name="sellerId" required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">—</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.code})</option>
              ))}
            </select>
          </Field>
          <Field label="Produit" name="productId">
            <select name="productId" required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">—</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {fcfa(p.price)}</option>
              ))}
            </select>
          </Field>
          <Field label="Client" name="customerName" required />
          <Field label="Montant (vide = prix produit)" name="amount" type="number" placeholder="FCFA" />
          <div className="flex items-end">
            <Button type="submit" className="w-full">Enregistrer (confirmée)</Button>
          </div>
        </form>
      </Card>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-5 py-2">Réf.</th>
                <th className="px-3 py-2">Produit</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Vendeur</th>
                <th className="px-3 py-2">Client</th>
                <th className="px-3 py-2">Montant</th>
                <th className="px-3 py-2">Mois payés</th>
                <th className="px-3 py-2">Comm.</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.map((s) => (
                <tr key={s.id}>
                  <td className="px-5 py-2 font-mono text-xs text-muted">{s.reference}</td>
                  <td className="px-3 py-2 font-medium text-ink">{s.product.name}</td>
                  <td className="px-3 py-2 text-xs text-muted">{PRICING_TYPE_LABELS[s.pricingType]}</td>
                  <td className="px-3 py-2">{s.seller.firstName} {s.seller.lastName}</td>
                  <td className="px-3 py-2">{s.customerName}</td>
                  <td className="px-3 py-2 font-semibold">{fcfa(s.amount)}</td>
                  <td className="px-3 py-2">{s.pricingType === "MONTHLY_SUB" ? `${s.monthsPaid}/${MONTHLY_DURATION}` : "—"}</td>
                  <td className="px-3 py-2">{s._count.commissions}</td>
                  <td className="px-3 py-2"><Badge tone={statusTone(s.status)}>{SALE_STATUS_LABELS[s.status]}</Badge></td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {s.status === "PENDING" && (
                        <form action={confirmSale}>
                          <input type="hidden" name="id" value={s.id} />
                          <button type="submit" className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm">
                            Confirmer
                          </button>
                        </form>
                      )}
                      {s.status === "CONFIRMED" && s.pricingType === "MONTHLY_SUB" && s.monthsPaid < MONTHLY_DURATION && (
                        <form action={addPaidMonth}>
                          <input type="hidden" name="id" value={s.id} />
                          <button type="submit" className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors whitespace-nowrap">
                            + 1 mois
                          </button>
                        </form>
                      )}
                      {s.status !== "CANCELLED" && (
                        <form action={cancelSale}>
                          <input type="hidden" name="id" value={s.id} />
                          <button type="submit" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors">
                            Annuler
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

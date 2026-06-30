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

  const pendingFromAffiliates = sales.filter((s) => s.status === "PENDING");

  return (
    <div>
      <PageHeader
        title="Suivi des ventes & conversions"
        subtitle="Ventes générées par affiliation et génération des commissions."
      />

      {pendingFromAffiliates.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4">
          <p className="font-bold text-amber-800">
            ⏳ {pendingFromAffiliates.length} vente{pendingFromAffiliates.length > 1 ? "s" : ""} en attente de validation
          </p>
          <p className="text-sm text-amber-700 mt-1">
            Des affiliés ont déclaré des ventes manuelles (WhatsApp, abonnement SaaS direct, etc.). Vérifiez et confirmez pour générer leurs commissions.
          </p>
        </div>
      )}

      {/* Formulaire d'enregistrement */}
      <Card className="mb-6">
        <p className="text-sm font-semibold text-ink mb-4">Enregistrer une vente</p>
        <form action={createSale} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Partenaire vendeur" name="sellerId">
            <select name="sellerId" required className="admin-input">
              <option value="">— Choisir —</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} ({p.code})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Produit" name="productId">
            <select name="productId" required className="admin-input">
              <option value="">— Choisir —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {fcfa(p.price)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Client" name="customerName" required />
          <Field label="Montant (vide = prix produit)" name="amount" type="number" placeholder="FCFA" />
          <div className="flex items-end">
            <Button type="submit" size="md" className="w-full">
              Enregistrer
            </Button>
          </div>
        </form>
      </Card>

      {/* Tableau des ventes */}
      <Card className="p-0">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Réf.</th>
                <th>Produit</th>
                <th>Type</th>
                <th>Vendeur</th>
                <th>Client</th>
                <th>Montant</th>
                <th>Mois payés</th>
                <th>Comm.</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span className="font-mono text-xs text-muted">{s.reference}</span>
                  </td>
                  <td className="font-medium text-ink">{s.product.name}</td>
                  <td>
                    <span className="text-xs text-muted">{PRICING_TYPE_LABELS[s.pricingType]}</span>
                  </td>
                  <td>{s.seller.firstName} {s.seller.lastName}</td>
                  <td>{s.customerName}</td>
                  <td className="font-semibold text-ink">{fcfa(s.amount)}</td>
                  <td className="text-center">
                    {s.pricingType === "MONTHLY_SUB" ? `${s.monthsPaid}/${MONTHLY_DURATION}` : "—"}
                  </td>
                  <td className="text-center">{s._count.commissions}</td>
                  <td>
                    <Badge tone={statusTone(s.status)}>{SALE_STATUS_LABELS[s.status]}</Badge>
                  </td>
                  <td className="text-muted text-xs">{formatDate(s.createdAt)}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      {s.status === "PENDING" && (
                        <form action={confirmSale}>
                          <input type="hidden" name="id" value={s.id} />
                          <Button type="submit" variant="success" size="sm">Confirmer</Button>
                        </form>
                      )}
                      {s.status === "CONFIRMED" && s.pricingType === "MONTHLY_SUB" && s.monthsPaid < MONTHLY_DURATION && (
                        <form action={addPaidMonth}>
                          <input type="hidden" name="id" value={s.id} />
                          <Button type="submit" variant="secondary" size="sm">+1 mois</Button>
                        </form>
                      )}
                      {s.status !== "CANCELLED" && (
                        <form action={cancelSale}>
                          <input type="hidden" name="id" value={s.id} />
                          <Button type="submit" variant="ghost" size="sm">Annuler</Button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-muted text-sm">
                    Aucune vente enregistrée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

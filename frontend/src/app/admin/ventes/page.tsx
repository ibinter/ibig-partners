import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa, formatDate } from "@/lib/format";
import { Badge, Button, Card, Field, PageHeader, statusTone } from "@/components/ui";
import { MONTHLY_DURATION, PRICING_TYPE_LABELS, SALE_STATUS_LABELS } from "@/lib/constants";
import { addPaidMonth, cancelSale, confirmSale, createSale, rejectAndSuspend } from "../actions";
import { ExportButton } from "@/components/export-button";

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
  const highRisk = sales.filter((s) => s.status === "PENDING" && (s as any).riskScore >= 50);
  const medRisk  = sales.filter((s) => s.status === "PENDING" && (s as any).riskScore >= 20 && (s as any).riskScore < 50);

  function RiskBadge({ score, flags }: { score: number; flags: string | null }) {
    if (score === 0) return <span className="text-[10px] font-bold text-emerald-600">✓ OK</span>;
    const color = score >= 50 ? "text-red-700 bg-red-50 border-red-200" : "text-amber-700 bg-amber-50 border-amber-200";
    const label = score >= 70 ? "ÉLEVÉ" : score >= 50 ? "SUSPECT" : "MODÉRÉ";
    const flagList = flags?.split("|") ?? [];
    const flagLabels: Record<string, string> = {
      MONTANT_ELEVE: "montant > catalogue",
      PREUVE_FAIBLE: "preuve insuffisante",
      CONTACT_CLIENT_MANQUANT: "pas de contact client",
      HISTORIQUE_REJETS: "rejets antérieurs",
    };
    const tip = flagList.map(f => flagLabels[f.split(":")[0]] ?? f).join(", ");
    return (
      <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${color}`} title={tip}>
        {score >= 50 ? "⚠️" : "⚡"} {label} {score}
      </span>
    );
  }

  return (
    <div>
      <PageHeader
        title="Suivi des ventes & conversions"
        subtitle="Ventes générées par affiliation et génération des commissions."
        action={<ExportButton type="ventes" label="Exporter CSV" />}
      />

      {/* ── Alertes risque ─────────────────────────────────────────── */}
      {highRisk.length > 0 && (
        <div className="mb-4 rounded-2xl border-2 border-red-300 bg-red-50 px-5 py-4 flex items-start gap-3">
          <span className="text-2xl shrink-0">🚨</span>
          <div>
            <p className="font-extrabold text-red-800">
              {highRisk.length} vente{highRisk.length > 1 ? "s" : ""} à risque ÉLEVÉ — vérification urgente requise
            </p>
            <p className="text-sm text-red-700 mt-1">
              Ces déclarations présentent plusieurs signaux suspects (montant anormal, doublon client, preuve absente ou faible). Ne pas confirmer sans vérification.
            </p>
          </div>
        </div>
      )}
      {medRisk.length > 0 && highRisk.length === 0 && (
        <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4">
          <p className="font-bold text-amber-800">⚡ {medRisk.length} vente{medRisk.length > 1 ? "s" : ""} avec signaux de risque modéré — à examiner</p>
        </div>
      )}
      {pendingFromAffiliates.length > 0 && highRisk.length === 0 && medRisk.length === 0 && (
        <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4">
          <p className="font-bold text-amber-800">⏳ {pendingFromAffiliates.length} vente{pendingFromAffiliates.length > 1 ? "s" : ""} en attente de validation</p>
          <p className="text-sm text-amber-700 mt-1">Vérifiez les preuves et confirmez pour générer les commissions.</p>
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
                <th>Client + Preuve</th>
                <th>Montant</th>
                <th>Mois payés</th>
                <th>Comm.</th>
                <th>Risque</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => {
                const risk: number = (s as any).riskScore ?? 0;
                const flags: string | null = (s as any).riskFlags ?? null;
                const rowBg = risk >= 50 && s.status === "PENDING" ? "bg-red-50/60" : risk >= 20 && s.status === "PENDING" ? "bg-amber-50/40" : "";
                return (
                <tr key={s.id} className={rowBg}>
                  <td>
                    <span className="font-mono text-xs text-muted">{s.reference}</span>
                  </td>
                  <td className="font-medium text-ink">{s.product.name}</td>
                  <td>
                    <span className="text-xs text-muted">{PRICING_TYPE_LABELS[s.pricingType]}</span>
                  </td>
                  <td>{s.seller.firstName} {s.seller.lastName}</td>
                  <td>
                    <p className="text-ink">{s.customerName}</p>
                    {(s.customerPhone || s.customerEmail) && (
                      <p className="text-xs text-muted">{[s.customerPhone, s.customerEmail].filter(Boolean).join(" · ")}</p>
                    )}
                    {s.proofNote && (
                      <p className="text-xs text-slate-500 mt-0.5">🧾 {s.proofNote}</p>
                    )}
                    {s.proofUrl && (
                      <>
                        {/\.(jpe?g|png|webp|gif)(\?.*)?$/i.test(s.proofUrl) ? (
                          <a href={`/api/cloudinary/signed-url?url=${encodeURIComponent(s.proofUrl)}`} target="_blank" rel="noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`/api/cloudinary/signed-url?url=${encodeURIComponent(s.proofUrl)}`} alt="preuve" className="mt-1 h-14 w-20 rounded object-cover border border-slate-200 hover:opacity-80 transition" />
                          </a>
                        ) : (
                          <a href={`/api/cloudinary/signed-url?url=${encodeURIComponent(s.proofUrl)}`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-brand-600 hover:underline">
                            Voir la preuve ↗
                          </a>
                        )}
                      </>
                    )}
                  </td>
                  <td className="font-semibold text-ink">{fcfa(s.amount)}</td>
                  <td className="text-center">
                    {s.pricingType === "MONTHLY_SUB" ? `${s.monthsPaid}/${MONTHLY_DURATION}` : "—"}
                  </td>
                  <td className="text-center">{s._count.commissions}</td>
                  <td><RiskBadge score={risk} flags={flags} /></td>
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
                      {s.status === "PENDING" && (
                        <details className="relative">
                          <summary className="cursor-pointer list-none">
                            <span className="inline-flex items-center rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition">
                              Rejeter
                            </span>
                          </summary>
                          <div className="absolute right-0 z-10 mt-1 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl space-y-2">
                            <p className="text-xs font-bold text-slate-700">Motif de rejet (envoyé au partenaire)</p>
                            {/* Rejet simple */}
                            <form action={cancelSale} className="space-y-1.5">
                              <input type="hidden" name="id" value={s.id} />
                              <textarea
                                name="reason"
                                rows={2}
                                placeholder="Ex : Image ne correspond pas à un reçu valide."
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-300 resize-none"
                              />
                              <Button type="submit" variant="ghost" size="sm" className="w-full bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-200">
                                Rejeter uniquement
                              </Button>
                            </form>
                            {/* Rejet + Suspension */}
                            <form action={rejectAndSuspend} className="space-y-1.5">
                              <input type="hidden" name="id" value={s.id} />
                              <textarea
                                name="reason"
                                rows={2}
                                placeholder="Ex : Preuve manifestement falsifiée. Fraude confirmée."
                                className="w-full rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-300 resize-none"
                              />
                              <Button type="submit" variant="ghost" size="sm" className="w-full bg-red-600 text-white hover:bg-red-700 font-bold">
                                🚫 Rejeter + Suspendre le compte
                              </Button>
                            </form>
                          </div>
                        </details>
                      )}
                      {s.status !== "CANCELLED" && s.status !== "PENDING" && s.status !== "REJECTED" && (
                        <form action={cancelSale}>
                          <input type="hidden" name="id" value={s.id} />
                          <Button type="submit" variant="ghost" size="sm">Annuler</Button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              );})}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-muted text-sm">
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

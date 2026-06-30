import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa, formatDate } from "@/lib/format";
import { Badge, Card, Field, PageHeader, statusTone } from "@/components/ui";
import { SALE_STATUS_LABELS, PRICING_TYPE_LABELS } from "@/lib/constants";
import { declareSale } from "../actions";

export const dynamic = "force-dynamic";

export default async function EspaceVentesPage() {
  const user = await requireUser();

  const [sales, products] = await Promise.all([
    prisma.sale.findMany({
      where: { sellerId: user.id },
      orderBy: { createdAt: "desc" },
      include: { product: true },
      take: 50,
    }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, price: true, pricingType: true },
    }),
  ]);

  const pending = sales.filter((s) => s.status === "PENDING").length;
  const confirmed = sales.filter((s) => s.status === "CONFIRMED").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Déclarer une vente"
        subtitle="Signalez une vente effectuée hors plateforme (WhatsApp, abonnement direct, etc.). L'équipe IBIG validera et générera vos commissions."
      />

      {/* Explication des canaux */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: "🔗",
            title: "Via votre lien",
            desc: "Le client clique sur votre lien → paie via Moneroo → commission AUTOMATIQUE. Aucune déclaration nécessaire.",
            color: "border-emerald-200 bg-emerald-50",
            badge: "Automatique",
            badgeColor: "bg-emerald-100 text-emerald-800",
          },
          {
            icon: "💬",
            title: "Vente WhatsApp",
            desc: "Le client vous contacte via WhatsApp, paye manuellement → déclarez la vente ici. L'admin confirme.",
            color: "border-blue-200 bg-blue-50",
            badge: "Déclaration manuelle",
            badgeColor: "bg-blue-100 text-blue-800",
          },
          {
            icon: "🖥️",
            title: "Abonnement SaaS direct",
            desc: "Client s'abonne depuis l'interface d'un logiciel IBIG → déclarez la vente ici avec son nom et téléphone.",
            color: "border-violet-200 bg-violet-50",
            badge: "Déclaration manuelle",
            badgeColor: "bg-violet-100 text-violet-800",
          },
        ].map((c) => (
          <div key={c.title} className={`rounded-2xl border p-4 ${c.color}`}>
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{c.icon}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.badgeColor}`}>{c.badge}</span>
            </div>
            <p className="font-semibold text-sm text-slate-800">{c.title}</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>

      {/* Conseil lien partagé */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
        <strong>💡 Conseil :</strong> La meilleure façon de ne jamais perdre une commission est de toujours
        partager votre lien personnel <code className="bg-amber-100 px-1 rounded font-mono text-xs">ibigpartners.com/p/{user.code}</code>.
        Le client paie directement en ligne et votre commission est créée automatiquement.
      </div>

      {/* Formulaire de déclaration */}
      <Card>
        <p className="text-sm font-semibold text-slate-800 mb-4">Déclarer une vente manuelle</p>
        <form action={declareSale} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Produit vendu" name="productId">
            <select name="productId" required className="admin-input">
              <option value="">— Choisir le produit —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {fcfa(p.price)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nom du client" name="customerName" required placeholder="Ex : Kofi Asante" />
          <Field label="Téléphone client" name="customerPhone" placeholder="Ex : +225 07 01 02 03" />
          <Field label="Canal de vente" name="channel">
            <select name="channel" className="admin-input">
              <option value="WhatsApp">WhatsApp</option>
              <option value="Téléphone">Téléphone</option>
              <option value="Abonnement SaaS direct">Abonnement SaaS direct</option>
              <option value="Présentiel">Présentiel</option>
              <option value="Autre">Autre</option>
            </select>
          </Field>
          <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-brand-600 px-8 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition shadow"
            >
              Soumettre la déclaration →
            </button>
          </div>
        </form>
        <p className="mt-3 text-xs text-slate-500">
          Après soumission, l&apos;équipe IBIG vérifie et confirme la vente sous 24-48h. Vos commissions sont générées à la confirmation.
        </p>
      </Card>

      {/* Stats rapides */}
      {sales.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-extrabold text-slate-800">{sales.length}</p>
            <p className="text-xs text-slate-500 mt-1">Total déclarations</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
            <p className="text-2xl font-extrabold text-amber-700">{pending}</p>
            <p className="text-xs text-amber-600 mt-1">En attente de validation</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
            <p className="text-2xl font-extrabold text-emerald-700">{confirmed}</p>
            <p className="text-xs text-emerald-600 mt-1">Confirmées ✓</p>
          </div>
        </div>
      )}

      {/* Historique des ventes */}
      <Card className="p-0">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="font-semibold text-slate-800">Mes déclarations de ventes</p>
        </div>
        {sales.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <p className="text-3xl mb-3">📋</p>
            <p>Aucune déclaration pour l&apos;instant.</p>
            <p className="mt-1 text-xs">Partagez votre lien pour des commissions automatiques !</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Réf.</th>
                  <th>Produit</th>
                  <th>Client</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id}>
                    <td><span className="font-mono text-xs text-slate-400">{s.reference}</span></td>
                    <td className="font-medium text-slate-800">{s.product.name}</td>
                    <td className="text-sm text-slate-600">{s.customerName}</td>
                    <td className="font-semibold text-slate-800">{fcfa(s.amount)}</td>
                    <td>
                      <Badge tone={statusTone(s.status)}>
                        {SALE_STATUS_LABELS[s.status] ?? s.status}
                      </Badge>
                    </td>
                    <td className="text-xs text-slate-400">{formatDate(s.createdAt)}</td>
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

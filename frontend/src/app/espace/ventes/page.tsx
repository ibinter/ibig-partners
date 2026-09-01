import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa, formatDate } from "@/lib/format";
import { Field, PageHeader } from "@/components/ui";
import { SALE_STATUS_LABELS } from "@/lib/constants";
import { FileUpload } from "@/components/file-upload";
import { declareSale } from "../actions";
import VentesTable from "./ventes-client";

export const dynamic = "force-dynamic";

const CHANNEL_STYLE: Record<string, string> = {
  WhatsApp:             "bg-emerald-100 text-emerald-800",
  Téléphone:            "bg-blue-100 text-blue-800",
  "Abonnement SaaS direct": "bg-violet-100 text-violet-800",
  Présentiel:           "bg-amber-100 text-amber-800",
  Autre:                "bg-slate-100 text-slate-600",
};

export default async function EspaceVentesPage() {
  const user = await requireUser();

  const [sales, products, commTotal] = await Promise.all([
    prisma.sale.findMany({
      where: { sellerId: user.id },
      orderBy: { createdAt: "desc" },
      include: { product: true },
      take: 100,
    }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, price: true, pricingType: true, branch: { select: { name: true } } },
    }),
    prisma.commission.aggregate({
      where: { userId: user.id, level: 1 },
      _sum: { amount: true },
    }),
  ]);

  const total     = sales.length;
  const pending   = sales.filter((s) => s.status === "PENDING").length;
  const confirmed = sales.filter((s) => s.status === "CONFIRMED").length;
  const rejected  = sales.filter((s) => s.status === "REJECTED").length;
  const totalAmount = sales.filter((s) => s.status === "CONFIRMED").reduce((a, s) => a + s.amount, 0);
  const commN1  = commTotal._sum.amount ?? 0;

  const rows = sales.map((s) => {
    const rawName = s.customerName ?? "";
    const channelMatch = rawName.match(/\[(.+)\]$/);
    const channel = channelMatch ? channelMatch[1] : null;
    const name    = rawName.replace(/\s*\[.+\]$/, "");
    return {
      id: s.id,
      reference: s.reference,
      productName: s.product.name,
      customerName: name,
      amount: s.amount,
      amountDisplay: fcfa(s.amount),
      status: s.status,
      statusLabel: SALE_STATUS_LABELS[s.status] ?? s.status,
      channel,
      proofUrl: s.proofUrl ?? null,
      date: formatDate(s.createdAt),
    };
  });

  const selectCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes Ventes"
        subtitle="Déclarez les ventes hors plateforme ou suivez l'historique de vos commissions."
      />

      {/* ── 4 KPIs ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">Total déclarations</p>
          <p className="mt-1 text-2xl font-extrabold">{total}</p>
          <p className="mt-0.5 text-xs text-slate-400">toutes déclarations</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-100">En attente</p>
          <p className="mt-1 text-2xl font-extrabold">{pending}</p>
          <p className="mt-0.5 text-xs text-amber-100">validation sous 24-48h</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200">Confirmées</p>
          <p className="mt-1 text-2xl font-extrabold">{confirmed}</p>
          <p className="mt-0.5 text-xs text-emerald-200">{fcfa(totalAmount)} encaissés</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-200">Commissions N1</p>
          <p className="mt-1 text-2xl font-extrabold">{fcfa(commN1)}</p>
          <p className="mt-0.5 text-xs text-blue-200">sur ventes directes</p>
        </div>
      </div>

      {/* ── Canaux ── */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            icon: "🔗",
            title: "Via votre lien",
            desc: "Le client clique votre lien → paie via Moneroo → commission automatique. Aucune déclaration nécessaire.",
            badge: "Automatique",
            badgeColor: "bg-emerald-100 text-emerald-800",
            borderColor: "border-emerald-200 bg-emerald-50",
          },
          {
            icon: "💬",
            title: "Vente WhatsApp / Téléphone",
            desc: "Le client vous contacte et paie manuellement → déclarez ici avec la preuve de paiement.",
            badge: "Déclaration manuelle",
            badgeColor: "bg-blue-100 text-blue-800",
            borderColor: "border-blue-200 bg-blue-50",
          },
          {
            icon: "🖥️",
            title: "Abonnement SaaS direct",
            desc: "Client s'abonne depuis l'interface d'un logiciel IBIG → déclarez avec nom, téléphone et référence.",
            badge: "Déclaration manuelle",
            badgeColor: "bg-violet-100 text-violet-800",
            borderColor: "border-violet-200 bg-violet-50",
          },
        ].map((c) => (
          <div key={c.title} className={`rounded-2xl border p-4 ${c.borderColor}`}>
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{c.icon}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${c.badgeColor}`}>{c.badge}</span>
            </div>
            <p className="font-semibold text-sm text-slate-800">{c.title}</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Conseil lien ── */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-3">
        <span className="text-xl shrink-0">💡</span>
        <div className="text-sm text-amber-900">
          <strong>Conseil :</strong> La meilleure façon de ne jamais perdre une commission est de toujours
          partager votre lien personnel. Le client paie directement en ligne et la commission est créée automatiquement.
          <Link href="/espace/liens" className="ml-1 font-bold underline">
            Voir mes liens →
          </Link>
        </div>
      </div>

      {/* ── Formulaire déclaration ── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-violet-700 px-5 py-4">
          <h3 className="font-bold text-white">📝 Déclarer une vente manuelle</h3>
          <p className="text-xs text-blue-100 mt-0.5">
            Indiquez les informations du client et une preuve de paiement pour accélérer la validation (24–48h).
          </p>
        </div>

        <form action={declareSale} className="p-5 space-y-5">
          {/* Produit + Montant */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Produit vendu *" name="productId">
              <select name="productId" required className={selectCls}>
                <option value="">— Choisir le produit —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.branch.name} · {p.name} — {fcfa(p.price)}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Montant encaissé (FCFA)"
              name="amount"
              type="number"
              placeholder="Laisser vide = prix du produit"
            />
          </div>

          {/* Infos client */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Informations client</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Nom complet du client *" name="customerName" required placeholder="Ex : Kofi Asante" />
              <Field label="Téléphone client" name="customerPhone" placeholder="+225 07 01 02 03" />
              <Field label="E-mail client" name="customerEmail" type="email" placeholder="Pour son reçu (optionnel)" />
            </div>
          </div>

          {/* Canal + Preuve texte */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Canal de vente" name="channel">
              <select name="channel" className={selectCls}>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Téléphone">Téléphone</option>
                <option value="Abonnement SaaS direct">Abonnement SaaS direct</option>
                <option value="Présentiel">Présentiel</option>
                <option value="Autre">Autre</option>
              </select>
            </Field>
            <Field
              label="Référence / preuve de paiement"
              name="proofNote"
              placeholder="Ex : Orange Money réf. OM123456 — 12/08"
            />
          </div>

          {/* Preuve de paiement — upload ou lien */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Preuve de paiement</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FileUpload
                name="proofUrl"
                folder="ibig-ventes-preuves"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                label="Uploader une capture / reçu"
                hint="JPEG, PNG ou PDF · max 10 Mo"
                preview="image"
              />
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Ou coller un lien (Google Drive, WhatsApp…)
                </label>
                <input
                  type="url"
                  name="proofUrlAlt"
                  placeholder="https://drive.google.com/..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="text-[11px] text-slate-400 mt-1">Si vous uploadez une capture, ce champ est ignoré.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            <p className="text-xs text-slate-400">
              Une preuve de paiement accélère la validation. Sans preuve, le délai peut dépasser 48h.
            </p>
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:from-blue-700 hover:to-violet-700 transition"
            >
              Soumettre →
            </button>
          </div>
        </form>
      </div>

      {/* ── Alerte si ventes rejetées ── */}
      {rejected > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 flex items-start gap-3">
          <span className="text-xl shrink-0">❌</span>
          <div>
            <p className="font-semibold text-rose-800 text-sm">{rejected} déclaration{rejected > 1 ? "s" : ""} rejetée{rejected > 1 ? "s" : ""}</p>
            <p className="text-xs text-rose-700 mt-0.5">
              Vérifiez les détails dans le tableau ci-dessous et soumettez à nouveau si nécessaire.
              Contactez le support si vous pensez que le rejet est une erreur.
            </p>
          </div>
        </div>
      )}

      {/* ── Table filtrée (client) ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800 text-sm">Mes déclarations de ventes</h3>
          <span className="text-xs text-slate-400">{total} au total</span>
        </div>
        {total === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-sm text-slate-500 font-semibold">Aucune déclaration pour l&apos;instant</p>
            <p className="text-xs text-slate-400 mt-1">
              Partagez vos{" "}
              <Link href="/espace/liens" className="text-blue-600 font-semibold hover:underline">
                liens d&apos;affiliation
              </Link>{" "}
              pour des commissions automatiques !
            </p>
          </div>
        ) : (
          <VentesTable rows={rows} />
        )}
      </div>
    </div>
  );
}

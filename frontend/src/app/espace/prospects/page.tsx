import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Badge, Button, Field, PageHeader, statusTone } from "@/components/ui";
import { PROSPECT_STATUS_LABELS } from "@/lib/constants";
import { addProspect } from "../actions";
import { ProspectImport } from "./ProspectImport";
import ProspectsTable from "./prospects-client";

export const dynamic = "force-dynamic";

export default async function ProspectsPage() {
  const user = await requireUser();

  const [prospects, products] = await Promise.all([
    prisma.prospect.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  const productMap = new Map(products.map((p) => [p.id, p.name]));

  const total     = prospects.length;
  const contacted = prospects.filter((p) => p.status === "CONTACTED").length;
  const demo      = prospects.filter((p) => p.status === "DEMO").length;
  const converted = prospects.filter((p) => p.status === "CONVERTED").length;
  const lost      = prospects.filter((p) => p.status === "LOST").length;

  const convRate = total > 0 ? Math.round((converted / total) * 100) : 0;

  /* Funnel pourcentages relatifs au total */
  const funnelSteps = [
    { label: "Contactés",   count: contacted, color: "bg-amber-400",   pct: total > 0 ? Math.round((contacted / total) * 100) : 0 },
    { label: "En démo",     count: demo,       color: "bg-blue-500",    pct: total > 0 ? Math.round((demo / total) * 100) : 0 },
    { label: "Convertis",   count: converted,  color: "bg-emerald-500", pct: total > 0 ? Math.round((converted / total) * 100) : 0 },
    { label: "Perdus",      count: lost,       color: "bg-red-400",     pct: total > 0 ? Math.round((lost / total) * 100) : 0 },
  ];

  /* Sérialisation pour le composant client */
  const rows = prospects.map((p) => ({
    id: p.id,
    name: p.name,
    contact: p.contact ?? null,
    note: p.note ?? null,
    status: p.status,
    statusLabel: PROSPECT_STATUS_LABELS[p.status] ?? p.status,
    statusTone: statusTone(p.status),
    productName: p.productId ? (productMap.get(p.productId) ?? null) : null,
    date: formatDate(p.createdAt),
  }));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mes Prospects"
        subtitle="Pipeline de vente : suivez chaque lead de la prise de contact à la conversion."
      />

      {/* ── 4 KPIs gradient ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">Total prospects</p>
          <p className="mt-1 text-2xl font-extrabold">{total}</p>
          <p className="mt-0.5 text-xs text-slate-400">dans le pipeline</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-100">Contactés</p>
          <p className="mt-1 text-2xl font-extrabold">{contacted}</p>
          <p className="mt-0.5 text-xs text-amber-100">en cours de suivi</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-200">En démo</p>
          <p className="mt-1 text-2xl font-extrabold">{demo}</p>
          <p className="mt-0.5 text-xs text-blue-200">présentation en cours</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200">Convertis</p>
          <p className="mt-1 text-2xl font-extrabold">{converted}</p>
          <p className="mt-0.5 text-xs text-emerald-200">taux : {convRate} %</p>
        </div>
      </div>

      {/* ── Funnel visuel ── */}
      {total > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 text-sm mb-4">Funnel de conversion</h3>
          <div className="space-y-2.5">
            {funnelSteps.map((step) => (
              <div key={step.label}>
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="font-semibold text-slate-700">{step.label}</span>
                  <span className="text-slate-400">{step.count} · {step.pct} %</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${step.color} transition-all duration-700`}
                    style={{ width: `${Math.max(step.pct, step.count > 0 ? 2 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400 text-right">
            Taux de conversion global : <strong className="text-slate-600">{convRate} %</strong>
          </p>
        </div>
      )}

      {/* ── Import + Formulaire ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Formulaire ajout */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-800 text-sm">➕ Ajouter un prospect</h3>
            <p className="text-xs text-slate-400 mt-0.5">Ajoutez un lead pour le suivre dans votre pipeline.</p>
          </div>
          <form action={addProspect} className="space-y-3">
            <Field label="Nom / entreprise" name="name" required />
            <Field label="Contact (téléphone ou email)" name="contact" placeholder="Ex : 07 XX XX XX XX" />
            <Field label="Produit visé" name="productId">
              <select
                name="productId"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">— Choisir un produit (optionnel)</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Note (observations)" name="note" placeholder="Contexte, timing, intérêt…" />
            <Button type="submit" className="w-full">Ajouter le prospect</Button>
          </form>
        </div>

        {/* Import CSV */}
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 flex flex-col">
          <div className="mb-3">
            <h3 className="font-semibold text-slate-800 text-sm">📥 Import en masse</h3>
            <p className="text-xs text-slate-400 mt-0.5">Importez un fichier CSV pour ajouter plusieurs prospects d'un coup.</p>
          </div>
          <ProspectImport />
        </div>
      </div>

      {/* ── Table filtrée (client) ── */}
      <ProspectsTable rows={rows} />
    </div>
  );
}

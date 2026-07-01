import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa } from "@/lib/format";
import { Badge, Button, Card, Field, PageHeader } from "@/components/ui";
import { PRICING_TYPE_LABELS, PRICING_TYPES } from "@/lib/constants";
import {
  toggleBranch, toggleProductActive, updateProductRate,
  createBranch, updateBranch, deleteBranch,
  createProduct, updateProduct, deleteProduct,
} from "../actions";

export const dynamic = "force-dynamic";

const PRICING_OPTIONS = [
  { value: "MONTHLY_SUB", label: "Abonnement mensuel" },
  { value: "ANNUAL_SUB", label: "Abonnement annuel" },
  { value: "COURSE", label: "Formation" },
  { value: "SERVICE", label: "Prestation / service" },
  { value: "PRODUCT", label: "Produit physique" },
];

function normalizeUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
}

export default async function BranchesPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; branchId?: string; productId?: string }>;
}) {
  await requireAdmin();
  const { action, branchId, productId } = await searchParams;

  const branches = await prisma.branch.findMany({
    orderBy: { order: "asc" },
    include: {
      products: {
        orderBy: { name: "asc" },
        include: { _count: { select: { sales: true, links: true } } },
      },
      _count: { select: { products: true } },
    },
  });

  const editBranch = branchId ? branches.find((b) => b.id === branchId) : null;
  const editProduct = productId
    ? branches.flatMap((b) => b.products).find((p) => p.id === productId)
    : null;
  const addProductBranch = action === "add-product" && branchId
    ? branches.find((b) => b.id === branchId)
    : null;
  const allProducts = branches.flatMap((branch) => branch.products);
  const completeProducts = allProducts.filter((product) => product.description && product.siteUrl);
  const productsWithoutDestination = allProducts.filter((product) => !product.siteUrl);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <PageHeader
          title="Branches & Produits"
          subtitle={`${branches.length} branches · ${branches.reduce((a, b) => a + b.products.length, 0)} produits`}
        />
        <div className="flex gap-2">
          <form action="/api/admin/sync-branches" method="POST">
            <button
              type="submit"
              onClick={async (e) => {
                e.preventDefault();
                const r = await fetch("/api/admin/sync-branches", { method: "POST" });
                const d = await r.json();
                alert(d.message ?? (r.ok ? "Synchronisation OK" : "Erreur"));
                location.reload();
              }}
              className="rounded-lg border border-brand-300 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100"
            >
              Synchroniser les branches
            </button>
          </form>
          <a
            href="/admin/branches?action=new-branch"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            + Nouvelle branche
          </a>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Catalogue</p>
          <p className="mt-1 text-2xl font-bold text-ink">{allProducts.length}</p>
          <p className="text-xs text-muted">produits enregistrés</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Fiches complètes</p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">{completeProducts.length}</p>
          <p className="text-xs text-emerald-700">description + destination publique</p>
        </div>
        <div className={`rounded-2xl border p-4 shadow-sm ${productsWithoutDestination.length ? "border-amber-200 bg-amber-50" : "border-blue-200 bg-blue-50"}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${productsWithoutDestination.length ? "text-amber-700" : "text-blue-700"}`}>À compléter</p>
          <p className={`mt-1 text-2xl font-bold ${productsWithoutDestination.length ? "text-amber-800" : "text-blue-800"}`}>{productsWithoutDestination.length}</p>
          <p className={`text-xs ${productsWithoutDestination.length ? "text-amber-700" : "text-blue-700"}`}>sans lien public de destination</p>
        </div>
      </div>

      {/* Formulaire nouvelle branche */}
      {action === "new-branch" && (
        <Card className="mb-6 border-brand-200 bg-brand-50/30">
          <h2 className="mb-4 font-semibold text-ink">Créer une nouvelle branche</h2>
          <form action={createBranch} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom de la branche *" name="name" required placeholder="Ex: IBIG SOFT" />
              <Field label="Tagline *" name="tagline" required placeholder="Ex: Logiciels SaaS de gestion" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Description</label>
              <textarea name="description" rows={2} placeholder="Description courte de la branche..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Type d'offre" name="offerType" placeholder="Ex: Abonnement mensuel/annuel" />
              <Field label="Modèle de commission" name="commissionModel" placeholder="Ex: 20% mois 1, 15% mois 2..." />
              <Field label="Ordre d'affichage" name="order" type="number" defaultValue="0" />
            </div>
            <div className="flex gap-3">
              <Button type="submit">Créer la branche</Button>
              <a href="/admin/branches" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Annuler</a>
            </div>
          </form>
        </Card>
      )}

      {/* Formulaire modifier branche */}
      {editBranch && !editProduct && !addProductBranch && (
        <Card className="mb-6 border-amber-200 bg-amber-50/30">
          <h2 className="mb-4 font-semibold text-ink">Modifier — {editBranch.name}</h2>
          <form action={updateBranch} className="space-y-4">
            <input type="hidden" name="id" value={editBranch.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom *" name="name" required defaultValue={editBranch.name} />
              <Field label="Tagline" name="tagline" defaultValue={editBranch.tagline} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Description</label>
              <textarea name="description" rows={2} defaultValue={editBranch.description}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Type d'offre" name="offerType" defaultValue={editBranch.offerType} />
              <Field label="Modèle de commission" name="commissionModel" defaultValue={editBranch.commissionModel} />
              <Field label="Ordre" name="order" type="number" defaultValue={String(editBranch.order)} />
            </div>
            <div className="flex gap-3">
              <Button type="submit">Enregistrer</Button>
              <a href="/admin/branches" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Annuler</a>
            </div>
          </form>
        </Card>
      )}

      {/* Formulaire modifier produit */}
      {editProduct && (
        <Card className="mb-6 border-amber-200 bg-amber-50/30">
          <h2 className="mb-4 font-semibold text-ink">Modifier le produit — {editProduct.name}</h2>
          <form action={updateProduct} className="space-y-4">
            <input type="hidden" name="id" value={editProduct.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom *" name="name" required defaultValue={editProduct.name} />
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Type de tarification</label>
                <select name="pricingType" defaultValue={editProduct.pricingType}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  {PRICING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Prix (FCFA)" name="price" type="number" defaultValue={String(editProduct.price)} />
              <Field label="Taux commission N1 (%)" name="rate" type="number" defaultValue={String(editProduct.rate)} />
              <Field label="Lien public de destination" name="siteUrl" defaultValue={editProduct.siteUrl ?? ""} placeholder="https://site-produit.com/offre" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Présentation commerciale détaillée</label>
              <textarea name="description" rows={5} defaultValue={editProduct.description ?? ""} placeholder="Expliquez le besoin résolu, le public cible, les bénéfices et ce qui est inclus dans l'offre."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />
              <p className="mt-1 text-xs text-muted">Cette présentation sera visible par les affiliés et sur leur vitrine publique.</p>
            </div>
            <div className="flex gap-3">
              <Button type="submit">Enregistrer</Button>
              <a href="/admin/branches" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Annuler</a>
            </div>
          </form>
        </Card>
      )}

      {/* Formulaire ajouter produit */}
      {addProductBranch && (
        <Card className="mb-6 border-emerald-200 bg-emerald-50/30">
          <h2 className="mb-4 font-semibold text-ink">Ajouter un produit à {addProductBranch.name}</h2>
          <form action={createProduct} className="space-y-4">
            <input type="hidden" name="branchId" value={addProductBranch.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom du produit *" name="name" required placeholder="Ex: Scolaby" />
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Type de tarification</label>
                <select name="pricingType" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  {PRICING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Prix (FCFA)" name="price" type="number" defaultValue="0" />
              <Field label="Taux commission N1 (%)" name="rate" type="number" defaultValue="8" />
              <Field label="Lien public de destination" name="siteUrl" placeholder="https://site-produit.com/offre" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Présentation commerciale détaillée</label>
              <textarea name="description" rows={5} placeholder="Expliquez le besoin résolu, le public cible, les bénéfices et ce qui est inclus dans l'offre."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />
              <p className="mt-1 text-xs text-muted">Une fiche complète aide les affiliés à mieux vendre l'offre.</p>
            </div>
            <div className="flex gap-3">
              <Button type="submit">Ajouter le produit</Button>
              <a href="/admin/branches" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Annuler</a>
            </div>
          </form>
        </Card>
      )}

      {/* Liste des branches */}
      <div className="space-y-6">
        {branches.length === 0 && (
          <Card>
            <p className="text-center text-sm text-muted py-8">
              Aucune branche. Cliquez sur <strong>+ Nouvelle branche</strong> pour commencer.
            </p>
          </Card>
        )}

        {branches.map((branch) => (
          <Card key={branch.id} className={!branch.active ? "opacity-60" : ""}>
            {/* En-tête branche */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-ink">{branch.name}</h2>
                  <Badge tone={branch.active ? "green" : "gray"}>{branch.active ? "Active" : "Inactive"}</Badge>
                  <span className="text-xs text-muted">Ordre #{branch.order}</span>
                </div>
                {branch.tagline && <p className="mt-0.5 text-sm font-medium text-brand-600">{branch.tagline}</p>}
                {branch.description && <p className="mt-1 text-sm text-muted">{branch.description}</p>}
                {branch.offerType && (
                  <p className="mt-1 text-xs text-muted">
                    <span className="font-medium">Offre :</span> {branch.offerType}
                    {branch.commissionModel && <> · <span className="font-medium">Commission :</span> {branch.commissionModel}</>}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a href={`/admin/branches?branchId=${branch.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-brand-600 transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                  Modifier
                </a>
                <a href={`/admin/branches?action=add-product&branchId=${branch.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors shadow-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5"><path d="M12 5v14M5 12h14" /></svg>
                  Produit
                </a>
                <form action={toggleBranch}>
                  <input type="hidden" name="id" value={branch.id} />
                  <input type="hidden" name="active" value={(!branch.active).toString()} />
                  <button type="submit" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                    {branch.active ? "Désactiver" : "Activer"}
                  </button>
                </form>
                {branch._count.products === 0 && (
                  <form action={deleteBranch} onSubmit={(e) => { if (!confirm("Supprimer cette branche ?")) e.preventDefault(); }}>
                    <input type="hidden" name="id" value={branch.id} />
                    <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
                      Supprimer
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Table des produits */}
            {branch.products.length === 0 ? (
              <p className="mt-4 text-sm text-muted italic">
                Aucun produit —{" "}
                <a href={`/admin/branches?action=add-product&branchId=${branch.id}`} className="text-brand-600 hover:underline">
                  ajouter le premier
                </a>
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-muted">
                    <tr>
                      <th className="px-4 py-2">Produit</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Prix</th>
                      <th className="px-3 py-2">Taux N1</th>
                      <th className="px-3 py-2">Liens</th>
                      <th className="px-3 py-2">Ventes</th>
                      <th className="px-3 py-2">État</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {branch.products.map((p) => (
                      <tr key={p.id} className={!p.active ? "opacity-50 bg-slate-50" : "hover:bg-slate-50/50"}>
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-ink">{p.name}</p>
                            <Badge tone={p.description && p.siteUrl ? "green" : "amber"}>
                              {p.description && p.siteUrl ? "Fiche complète" : "À compléter"}
                            </Badge>
                          </div>
                          {p.description && <p className="text-xs text-muted truncate max-w-[200px]">{p.description}</p>}
                          {p.siteUrl && (
                            <a href={normalizeUrl(p.siteUrl)} target="_blank" rel="noreferrer" className="text-xs font-medium text-brand-600 hover:underline">
                              Ouvrir la destination publique ↗
                            </a>
                          )}
                          {!p.siteUrl && <p className="text-xs font-medium text-amber-700">Lien public manquant</p>}
                        </td>
                        <td className="px-3 py-2 text-xs text-muted whitespace-nowrap">
                          {PRICING_TYPE_LABELS[p.pricingType] ?? p.pricingType}
                        </td>
                        <td className="px-3 py-2 text-xs font-medium">{fcfa(p.price)}</td>
                        <td className="px-3 py-2">
                          <form action={updateProductRate} className="flex items-center gap-1.5">
                            <input type="hidden" name="id" value={p.id} />
                            <input name="rate" type="number" defaultValue={p.rate} min={0} max={100}
                              className="w-14 px-2 py-1 text-xs text-center" />
                            <span className="text-xs text-muted">%</span>
                            <button type="submit"
                              className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors">
                              OK
                            </button>
                          </form>
                        </td>
                        <td className="px-3 py-2 text-xs text-center text-muted">{p._count.links}</td>
                        <td className="px-3 py-2 text-xs text-center">
                          <span className={p._count.sales > 0 ? "font-semibold text-emerald-700" : "text-muted"}>
                            {p._count.sales}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <Badge tone={p.active ? "green" : "gray"}>{p.active ? "Actif" : "Inactif"}</Badge>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <a href={`/admin/branches?productId=${p.id}`} title="Modifier"
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-brand-600 transition-colors">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                            </a>
                            <form action={toggleProductActive}>
                              <input type="hidden" name="id" value={p.id} />
                              <input type="hidden" name="active" value={(!p.active).toString()} />
                              <button type="submit" title={p.active ? "Désactiver" : "Activer"}
                                className={`inline-flex h-7 items-center rounded-lg border px-2 text-[11px] font-semibold transition-colors ${
                                  p.active
                                    ? "border-slate-200 text-slate-500 hover:bg-slate-50"
                                    : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                }`}>
                                {p.active ? "Désactiver" : "Activer"}
                              </button>
                            </form>
                            {p._count.sales === 0 && (
                              <form action={deleteProduct}>
                                <input type="hidden" name="id" value={p.id} />
                                <button type="submit" title="Supprimer"
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
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
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

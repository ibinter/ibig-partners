import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa } from "@/lib/format";
import { Badge, Button, Card, Field, PageHeader } from "@/components/ui";
import { PRICING_TYPES } from "@/lib/constants";
import {
  toggleBranch, updateProductRate,
  createBranch, updateBranch, deleteBranch,
  createProduct, updateProduct, deleteProduct,
} from "../actions";
import {
  SyncBranchesButton, SyncSoftButton, SyncEduformButton,
  SyncDigitalKitsButton, SyncDigitalButton, SyncConseilButton,
  SyncPartnersButton, SyncMultiservicesButton, SyncImmoButton,
  SyncKitsButton, SyncAcademieButton, MigrateButton,
} from "./sync-button";
import CatalogClient from "./catalog-client";

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
  searchParams: Promise<{ action?: string; branchId?: string; productId?: string; section?: string }>;
}) {
  await requireAdmin();
  const { action, branchId, productId, section } = await searchParams;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let branches: any[] = [];
  let dbError: string | null = null;

  try {
    branches = await prisma.branch.findMany({
      orderBy: { order: "asc" },
      include: {
        products: {
          orderBy: { name: "asc" },
          include: { _count: { select: { sales: true, links: true } } },
        },
        _count: { select: { products: true } },
      },
    });
  } catch (err) {
    dbError = err instanceof Error ? err.message : String(err);
  }

  const editBranch = branchId ? branches.find((b) => b.id === branchId) : null;
  const editProduct = productId
    ? branches.flatMap((b) => b.products).find((p: any) => p.id === productId)
    : null;
  const addProductBranch = action === "add-product" && branchId
    ? branches.find((b) => b.id === branchId)
    : null;

  const allProducts = branches.flatMap((branch: any) =>
    branch.products.map((p: any) => ({
      ...p,
      branchId: branch.id,
      branchName: branch.name,
      branchSlug: branch.slug,
    }))
  );
  const activeCount = allProducts.filter((p: any) => p.active).length;
  const completeCount = allProducts.filter((p: any) => p.description && p.siteUrl).length;
  const missingLinkCount = allProducts.filter((p: any) => !p.siteUrl).length;

  if (dbError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 max-w-xl">
          <p className="text-xl font-bold text-red-700 mb-2">Erreur base de données</p>
          <p className="text-sm text-red-600 mb-4">Des colonnes manquent dans la base de données (schéma non synchronisé).</p>
          <pre className="text-xs text-left bg-red-100 rounded p-3 mb-6 overflow-auto max-h-32">{dbError}</pre>
          <MigrateButton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">

      {/* En-tête */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <PageHeader
          title="Catalogue Produits"
          subtitle={`${branches.length} branches · ${allProducts.length} produits · ${activeCount} actifs`}
        />
        {/* Outils de synchronisation (menu collapsible) */}
        <details className="relative">
          <summary className="cursor-pointer list-none">
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors select-none">
              ⚙️ Outils de sync
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4 text-muted">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </summary>
          <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl space-y-1.5">
            <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted">Synchroniser les catalogues</p>
            <SyncSoftButton />
            <SyncImmoButton />
            <SyncMultiservicesButton />
            <SyncPartnersButton />
            <SyncConseilButton />
            <SyncDigitalButton />
            <SyncDigitalKitsButton />
            <SyncEduformButton />
            <SyncKitsButton />
            <SyncAcademieButton />
            <div className="border-t border-slate-100 pt-1.5">
              <SyncBranchesButton />
            </div>
          </div>
        </details>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Total produits</p>
          <p className="mt-1 text-2xl font-bold text-ink">{allProducts.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Actifs</p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">{activeCount}</p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Fiches complètes</p>
          <p className="mt-1 text-2xl font-bold text-blue-800">{completeCount}</p>
        </div>
        <div className={`rounded-2xl border p-4 shadow-sm ${missingLinkCount > 0 ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${missingLinkCount > 0 ? "text-amber-700" : "text-muted"}`}>Lien manquant</p>
          <p className={`mt-1 text-2xl font-bold ${missingLinkCount > 0 ? "text-amber-800" : "text-ink"}`}>{missingLinkCount}</p>
        </div>
      </div>

      {/* Formulaires inline (déclenchés par URL params) */}
      {action === "new-branch" && (
        <Card className="border-brand-200 bg-brand-50/30">
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
              <Field label="Type d'offre" name="offerType" placeholder="Ex: Abonnement mensuel" />
              <Field label="Modèle de commission" name="commissionModel" placeholder="Ex: 20% mois 1…" />
              <Field label="Ordre d'affichage" name="order" type="number" defaultValue="0" />
            </div>
            <div className="flex gap-3">
              <Button type="submit">Créer la branche</Button>
              <a href="/admin/branches" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Annuler</a>
            </div>
          </form>
        </Card>
      )}

      {editBranch && !editProduct && !addProductBranch && (
        <Card className="border-amber-200 bg-amber-50/30">
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

      {editProduct && (
        <Card className="border-amber-200 bg-amber-50/30">
          <h2 className="mb-4 font-semibold text-ink">Modifier — {editProduct.name}</h2>
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
              <Field label="Lien public de destination" name="siteUrl" defaultValue={editProduct.siteUrl ?? ""} placeholder="https://site.com/offre" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Présentation commerciale</label>
              <textarea name="description" rows={4} defaultValue={editProduct.description ?? ""}
                placeholder="Besoin résolu, public cible, bénéfices, ce qui est inclus..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />
            </div>
            <div className="flex gap-3">
              <Button type="submit">Enregistrer</Button>
              <a href="/admin/branches" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Annuler</a>
            </div>
          </form>
        </Card>
      )}

      {addProductBranch && (
        <Card className="border-emerald-200 bg-emerald-50/30">
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
              <label className="mb-1 block text-sm font-medium text-ink">Présentation commerciale</label>
              <textarea name="description" rows={4} placeholder="Expliquez le besoin résolu, le public cible, les bénéfices..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />
            </div>
            <div className="flex gap-3">
              <Button type="submit">Ajouter le produit</Button>
              <a href="/admin/branches" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Annuler</a>
            </div>
          </form>
        </Card>
      )}

      {/* ── Catalogue interactif (client) ─────────────────────────────────── */}
      <CatalogClient
        products={allProducts}
        branches={branches.map((b: any) => ({ id: b.id, name: b.name, slug: b.slug }))}
      />

      {/* ── Gestion des branches (accordéon) ──────────────────────────────── */}
      <details className="rounded-2xl border border-slate-200 bg-white shadow-sm" open={!!branchId && !editProduct && !addProductBranch}>
        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 select-none hover:bg-slate-50 rounded-2xl transition-colors">
          <div>
            <span className="font-semibold text-ink text-sm">🗂 Gestion des branches</span>
            <span className="ml-2 text-xs text-muted">({branches.length} branches — éditer, activer, ajouter des produits)</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/admin/branches?action=new-branch"
              onClick={(e) => e.stopPropagation()}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors">
              + Nouvelle branche
            </a>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4 text-muted details-chevron">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </summary>

        <div className="border-t border-slate-100 divide-y divide-slate-50">
          {branches.map((branch: any) => (
            <div key={branch.id} className={`px-5 py-4 ${!branch.active ? "opacity-60" : ""}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-ink text-sm">{branch.name}</span>
                    <Badge tone={branch.active ? "green" : "gray"}>{branch.active ? "Active" : "Inactive"}</Badge>
                    <span className="text-xs text-muted">{branch._count.products} produit{branch._count.products !== 1 ? "s" : ""}</span>
                  </div>
                  {branch.tagline && <p className="text-xs text-muted mt-0.5">{branch.tagline}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a href={`/admin/branches?branchId=${branch.id}`}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                    ✏️ Modifier
                  </a>
                  <a href={`/admin/branches?action=add-product&branchId=${branch.id}`}
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors">
                    + Produit
                  </a>
                  <form action={toggleBranch}>
                    <input type="hidden" name="id" value={branch.id} />
                    <input type="hidden" name="active" value={(!branch.active).toString()} />
                    <button type="submit" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                      {branch.active ? "Désactiver" : "Activer"}
                    </button>
                  </form>
                  {branch._count.products === 0 && (
                    <form action={deleteBranch}>
                      <input type="hidden" name="id" value={branch.id} />
                      <button type="submit" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors">
                        🗑 Supprimer
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </details>

    </div>
  );
}

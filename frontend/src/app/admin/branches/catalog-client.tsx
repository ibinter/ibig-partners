"use client";

import { useState, useMemo } from "react";
import { fcfa } from "@/lib/format";
import { Badge } from "@/components/ui";
import { PRICING_TYPE_LABELS } from "@/lib/constants";
import {
  toggleProductActive,
  updateProductRate,
  deleteProduct,
} from "../actions";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  siteUrl: string | null;
  price: number;
  pricingType: string;
  rate: number;
  active: boolean;
  category?: string | null;
  _count: { sales: number; links: number };
  branchId: string;
  branchName: string;
  branchSlug: string;
};

type Branch = {
  id: string;
  name: string;
  slug: string;
};

function normalizeUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
}

export default function CatalogClient({
  products,
  branches,
}: {
  products: Product[];
  branches: Branch[];
}) {
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  const availableCategories = useMemo(() => {
    const pool = branchFilter === "ALL" ? products : products.filter(p => p.branchId === branchFilter);
    const cats = new Set<string>();
    pool.forEach(p => { if (p.category) cats.add(p.category); });
    return Array.from(cats).sort();
  }, [products, branchFilter]);

  const handleBranchFilterChange = (id: string) => {
    setBranchFilter(id);
    setCategoryFilter("ALL");
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter((p) => {
      if (branchFilter !== "ALL" && p.branchId !== branchFilter) return false;
      if (categoryFilter !== "ALL" && p.category !== categoryFilter) return false;
      if (statusFilter === "ACTIVE" && !p.active) return false;
      if (statusFilter === "INACTIVE" && p.active) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.branchName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, search, branchFilter, categoryFilter, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-lg leading-none">×</button>
          )}
        </div>

        {/* Filtre statut */}
        <div className="flex rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden text-sm font-medium">
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 transition-colors ${statusFilter === s ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
              {s === "ALL" ? "Tous" : s === "ACTIVE" ? "✅ Actifs" : "⏸ Inactifs"}
            </button>
          ))}
        </div>
      </div>

      {/* Onglets branches */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setBranchFilter("ALL")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${branchFilter === "ALL" ? "bg-ink text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
          Toutes ({products.length})
        </button>
        {branches.map((b) => {
          const count = products.filter((p) => p.branchId === b.id).length;
          return (
            <button key={b.id} onClick={() => handleBranchFilterChange(branchFilter === b.id ? "ALL" : b.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${branchFilter === b.id ? "bg-brand-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
              {b.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Filtre catégories */}
      {availableCategories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCategoryFilter("ALL")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${categoryFilter === "ALL" ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}>
            Toutes catégories
          </button>
          {availableCategories.map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(categoryFilter === cat ? "ALL" : cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${categoryFilter === cat ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Résultat */}
      <p className="text-xs text-muted">
        {filtered.length} produit{filtered.length !== 1 ? "s" : ""}
        {search && <> correspondant à « <strong>{search}</strong> »</>}
        {branchFilter !== "ALL" && <> dans <strong>{branches.find(b => b.id === branchFilter)?.name}</strong></>}
        {categoryFilter !== "ALL" && <> · <strong>{categoryFilter}</strong></>}
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white py-12 text-center text-sm text-muted">
          Aucun produit ne correspond à votre recherche.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold tracking-wide">Produit</th>
                <th className="px-3 py-3 font-semibold tracking-wide">Branche</th>
                <th className="px-3 py-3 font-semibold tracking-wide">Type</th>
                <th className="px-3 py-3 font-semibold tracking-wide">Prix</th>
                <th className="px-3 py-3 font-semibold tracking-wide">Taux N1</th>
                <th className="px-3 py-3 font-semibold tracking-wide text-center">Liens</th>
                <th className="px-3 py-3 font-semibold tracking-wide text-center">Ventes</th>
                <th className="px-3 py-3 font-semibold tracking-wide">État</th>
                <th className="px-3 py-3 font-semibold tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => (
                <tr key={p.id} className={!p.active ? "opacity-50 bg-slate-50/60" : "hover:bg-slate-50/50 transition-colors"}>
                  <td className="px-4 py-3 max-w-[220px]">
                    <p className="font-semibold text-ink truncate">{p.name}</p>
                    {p.siteUrl ? (
                      <a href={normalizeUrl(p.siteUrl)} target="_blank" rel="noreferrer"
                        className="text-xs text-brand-600 hover:underline">
                        Site officiel ↗
                      </a>
                    ) : (
                      <span className="text-xs text-amber-600 font-medium">⚠ Lien manquant</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      {p.branchName}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted whitespace-nowrap">
                    {PRICING_TYPE_LABELS[p.pricingType] ?? p.pricingType}
                  </td>
                  <td className="px-3 py-3 text-xs font-semibold text-ink whitespace-nowrap">
                    {fcfa(p.price)}
                  </td>
                  <td className="px-3 py-3">
                    <form action={updateProductRate} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={p.id} />
                      <input name="rate" type="number" defaultValue={p.rate} min={0} max={100}
                        className="w-12 rounded-md border border-slate-200 px-1.5 py-1 text-xs text-center focus:border-brand-400 focus:outline-none" />
                      <span className="text-xs text-muted">%</span>
                      <button type="submit"
                        className="rounded-md bg-brand-50 px-2 py-1 text-[11px] font-semibold text-brand-700 hover:bg-brand-100 transition-colors">
                        OK
                      </button>
                    </form>
                  </td>
                  <td className="px-3 py-3 text-center text-xs text-muted">{p._count.links}</td>
                  <td className="px-3 py-3 text-center">
                    <span className={p._count.sales > 0 ? "font-bold text-emerald-700 text-xs" : "text-muted text-xs"}>
                      {p._count.sales}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={p.active ? "green" : "gray"}>{p.active ? "Actif" : "Inactif"}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <a href={`/admin/branches?productId=${p.id}`} title="Modifier"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-brand-600 transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                          <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
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
                          {p.active ? "Off" : "On"}
                        </button>
                      </form>
                      {p._count.sales === 0 && (
                        <form action={deleteProduct}>
                          <input type="hidden" name="id" value={p.id} />
                          <button type="submit" title="Supprimer"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                            </svg>
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
    </div>
  );
}

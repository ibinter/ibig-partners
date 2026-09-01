"use client";

import { useState, useMemo } from "react";
import { toggleProduct } from "../actions";
import CopyButton from "../liens/copy-button";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  siteUrl: string | null;
  price: number;
  pricingType: string;
  rate: number;
  commissionDisplay: string;
  priceDisplay: string;
  affiliateUrl: string | null;
}

interface Branch {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  offerType: string;
  commissionModel: string;
  gradient: string;
  products: Product[];
  activeCount: number;
}

interface Props {
  branches: Branch[];
  totalProducts: number;
  totalActive: number;
  totalDocumented: number;
}

const PRICING_LABELS: Record<string, string> = {
  ONE_TIME: "Achat unique",
  MONTHLY_SUB: "Abonnement mensuel",
  ANNUAL_SUB: "Abonnement annuel",
  QUOTE: "Sur devis",
  COMMISSION: "À la commission",
};

export default function ProduitsClient({ branches, totalProducts, totalActive, totalDocumented }: Props) {
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [openBranches, setOpenBranches] = useState<Set<string>>(
    () => new Set(branches.slice(0, 1).map((b) => b.id))
  );
  const [search, setSearch] = useState("");

  function toggleBranch(id: string) {
    setOpenBranches((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function expandAll() {
    setOpenBranches(new Set(branches.map((b) => b.id)));
  }

  function collapseAll() {
    setOpenBranches(new Set());
  }

  const filteredBranches = useMemo(() => {
    return branches
      .map((branch) => ({
        ...branch,
        products: branch.products.filter((p) => {
          const matchFilter =
            filter === "all" ||
            (filter === "active" && p.affiliateUrl !== null) ||
            (filter === "inactive" && p.affiliateUrl === null);
          const matchSearch =
            !search ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.description ?? "").toLowerCase().includes(search.toLowerCase());
          return matchFilter && matchSearch;
        }),
      }))
      .filter((b) => b.products.length > 0 || (filter === "all" && !search));
  }, [branches, filter, search]);

  const visibleCount = filteredBranches.reduce((s, b) => s + b.products.length, 0);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Offres disponibles</p>
          <p className="mt-1 text-2xl font-bold">{totalProducts}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">Mes offres activées</p>
          <p className="mt-1 text-2xl font-bold">{totalActive}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 p-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Fiches complètes</p>
          <p className="mt-1 text-2xl font-bold">{totalDocumented}/{totalProducts}</p>
        </div>
      </div>

      {/* Barre de contrôle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center rounded-2xl border border-slate-200 bg-white px-4 py-3">
        {/* Recherche */}
        <input
          type="search"
          placeholder="Rechercher un produit…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
        />
        {/* Filtres */}
        <div className="flex gap-1.5 shrink-0">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                filter === f
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f === "all" ? "Tout" : f === "active" ? "✓ Activées" : "À activer"}
            </button>
          ))}
        </div>
        {/* Tout ouvrir / fermer */}
        <div className="flex gap-1.5 shrink-0">
          <button onClick={expandAll} className="text-xs text-slate-400 hover:text-slate-700 transition px-1">
            Tout ouvrir
          </button>
          <span className="text-slate-200">|</span>
          <button onClick={collapseAll} className="text-xs text-slate-400 hover:text-slate-700 transition px-1">
            Tout fermer
          </button>
        </div>
      </div>

      {/* Résultat de recherche */}
      {(search || filter !== "all") && (
        <p className="text-xs text-slate-400 px-1">
          {visibleCount} offre{visibleCount !== 1 ? "s" : ""} affichée{visibleCount !== 1 ? "s" : ""}
          {search && <> pour « <span className="font-semibold text-slate-600">{search}</span> »</>}
        </p>
      )}

      {/* Branches en accordéon */}
      {filteredBranches.map((branch) => {
        const isOpen = openBranches.has(branch.id);
        return (
          <section key={branch.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* En-tête cliquable */}
            <button
              onClick={() => toggleBranch(branch.id)}
              className={`w-full bg-gradient-to-r ${branch.gradient} px-5 py-4 text-white text-left`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">{branch.offerType}</p>
                  <h2 className="mt-0.5 text-base font-bold text-white leading-tight">{branch.name}</h2>
                  {branch.tagline && (
                    <p className="mt-0.5 text-xs text-white/80 truncate">{branch.tagline}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-white/70">{branch.commissionModel}</p>
                    <p className="text-xs font-bold text-white/90">
                      {branch.activeCount}/{branch.products.length} activée{branch.products.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className={`text-white/70 text-lg transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}>
                    ›
                  </span>
                </div>
              </div>
            </button>

            {/* Liste produits */}
            {isOpen && (
              <div className="divide-y divide-slate-100">
                {branch.products.length === 0 ? (
                  <p className="px-5 py-6 text-center text-sm text-slate-400">Aucune offre pour ces critères.</p>
                ) : (
                  branch.products.map((product) => {
                    const active = product.affiliateUrl !== null;
                    const destination =
                      product.siteUrl
                        ? product.siteUrl.startsWith("http")
                          ? product.siteUrl
                          : `https://${product.siteUrl}`
                        : null;

                    return (
                      <div
                        key={product.id}
                        className={`px-4 py-3 transition-colors ${active ? "bg-blue-50/40" : "bg-white hover:bg-slate-50/60"}`}
                      >
                        {/* Ligne principale */}
                        <div className="flex items-start gap-3">
                          {/* Statut dot */}
                          <span
                            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${active ? "bg-emerald-500" : "bg-slate-300"}`}
                          />
                          {/* Infos */}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                              <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                                {PRICING_LABELS[product.pricingType] ?? product.pricingType}
                              </span>
                            </div>
                            {product.description && (
                              <p className="mt-0.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                {product.description}
                              </p>
                            )}
                            {/* Prix + commission */}
                            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                              <span className="text-slate-600">
                                Prix : <strong className="text-slate-800">{product.priceDisplay}</strong>
                              </span>
                              <span className="text-emerald-700">
                                Commission N1 : <strong>{product.commissionDisplay}</strong>
                              </span>
                            </div>
                            {/* Lien affilié si actif */}
                            {active && product.affiliateUrl && (
                              <div className="mt-2 flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 px-2.5 py-1.5">
                                <span className="font-mono text-[11px] text-slate-500 truncate flex-1">
                                  {product.affiliateUrl}
                                </span>
                                <CopyButton text={product.affiliateUrl} />
                              </div>
                            )}
                          </div>
                          {/* Actions */}
                          <div className="flex shrink-0 items-center gap-2 mt-0.5">
                            {destination && (
                              <a
                                href={destination}
                                target="_blank"
                                rel="noreferrer"
                                title="Voir l'offre"
                                className="text-slate-400 hover:text-blue-600 transition text-sm"
                              >
                                ↗
                              </a>
                            )}
                            <form action={toggleProduct}>
                              <input type="hidden" name="productId" value={product.id} />
                              <button
                                type="submit"
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                  active
                                    ? "bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600"
                                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                                }`}
                              >
                                {active ? "Désactiver" : "Activer"}
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </section>
        );
      })}

      {filteredBranches.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-400">
          Aucun résultat pour ces critères.
        </div>
      )}
    </div>
  );
}

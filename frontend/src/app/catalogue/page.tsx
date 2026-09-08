import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { fcfa } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catalogue des produits | IBIG PARTNERS",
  description:
    "Découvrez tous les produits IBIG SARL : logiciels SaaS, formations certifiantes, services immobiliers, marketing et plus. Gagnez des commissions en les promouvant.",
  openGraph: {
    title: "Catalogue des produits IBIG PARTNERS",
    description:
      "Logiciels SaaS, formations, immobilier, services — tous les produits disponibles sur IBIG PARTNERS pour gagner des commissions.",
    type: "website",
  },
};

const PRICING_LABEL: Record<string, string> = {
  MONTHLY_SUB: "Abonnement mensuel",
  ANNUAL_SUB:  "Abonnement annuel",
  COURSE:      "Formation",
  SERVICE:     "Service / Devis",
  PRODUCT:     "Produit",
  ONE_TIME:    "Achat unique",
};

const PRICING_SUFFIX: Record<string, string> = {
  MONTHLY_SUB: "/mois",
  ANNUAL_SUB:  "/an",
};

const PRICING_COLOR: Record<string, { bg: string; text: string }> = {
  MONTHLY_SUB: { bg: "#eff6ff", text: "#1d4ed8" },
  ANNUAL_SUB:  { bg: "#f0fdf4", text: "#15803d" },
  COURSE:      { bg: "#fdf4ff", text: "#7e22ce" },
  SERVICE:     { bg: "#fff7ed", text: "#c2410c" },
  PRODUCT:     { bg: "#f8fafc", text: "#475569" },
  ONE_TIME:    { bg: "#fefce8", text: "#854d0e" },
};

const BRANCH_STYLE: Record<string, { gradient: string; accent: string; emoji: string; light: string }> = {
  "ibig-eduform":        { gradient: "from-blue-500 to-indigo-700",    accent: "#3b82f6", emoji: "🎓", light: "#eff6ff" },
  "ibig-soft":           { gradient: "from-violet-500 to-purple-700",  accent: "#7c3aed", emoji: "⚙️", light: "#f5f3ff" },
  "ibig-immo-trust":     { gradient: "from-amber-400 to-orange-600",   accent: "#f59e0b", emoji: "🏠", light: "#fffbeb" },
  "ibig-digital":        { gradient: "from-cyan-500 to-sky-700",       accent: "#0891b2", emoji: "💻", light: "#ecfeff" },
  "ibig-digital-kits":   { gradient: "from-teal-500 to-emerald-700",   accent: "#0d9488", emoji: "🔧", light: "#f0fdfa" },
  "ibig-conseil-plus":   { gradient: "from-slate-500 to-slate-700",    accent: "#475569", emoji: "📋", light: "#f8fafc" },
  "ibig-market":         { gradient: "from-rose-500 to-pink-700",      accent: "#f43f5e", emoji: "🛒", light: "#fff1f2" },
  "ibig-multiservices":  { gradient: "from-orange-400 to-amber-600",   accent: "#f97316", emoji: "🛠️", light: "#fff7ed" },
  "ibig-financement":    { gradient: "from-emerald-500 to-green-700",  accent: "#059669", emoji: "💰", light: "#ecfdf5" },
  "ibig-emploi-talents": { gradient: "from-fuchsia-500 to-purple-700", accent: "#a21caf", emoji: "👥", light: "#fdf4ff" },
};
const DEFAULT_STYLE = { gradient: "from-slate-500 to-slate-700", accent: "#475569", emoji: "📦", light: "#f8fafc" };

function getBranchStyle(branchId: string) {
  if (BRANCH_STYLE[branchId]) return BRANCH_STYLE[branchId];
  for (const [key, val] of Object.entries(BRANCH_STYLE)) {
    if (branchId.includes(key.replace("ibig-", ""))) return val;
  }
  return DEFAULT_STYLE;
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const typeFilter = sp.type ?? null;
  const search     = sp.q?.trim() ?? null;

  // Récupérer branches + produits actifs
  const branches = await (prisma as any).branch.findMany({
    where: { active: true },
    include: {
      products: {
        where: {
          active: true,
          ...(typeFilter ? { pricingType: typeFilter } : {}),
          ...(search ? {
            OR: [
              { name:        { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { category:    { contains: search, mode: "insensitive" } },
            ],
          } : {}),
        },
        orderBy: { name: "asc" },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          price: true,
          pricingType: true,
          category: true,
          marketingData: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const allBranches = branches.filter((b: any) => b.products.length > 0);
  const totalProducts = allBranches.reduce((sum: number, b: any) => sum + b.products.length, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#041B4D] to-[#0c2d6b] text-white py-12 px-4">
        <div className="mx-auto max-w-5xl text-center space-y-4">
          <span className="inline-block rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-orange-300">
            🛍️ Catalogue officiel
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Tous les produits IBIG SARL
          </h1>
          <p className="text-base sm:text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
            Parcourez le catalogue complet : logiciels, formations, immobilier, services. Inscrivez-vous pour gagner des commissions en les promouvant.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/rejoindre"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#FF6A00] hover:bg-orange-600 transition px-6 py-3 text-sm font-extrabold text-white shadow-lg"
            >
              🚀 Devenir partenaire — gratuit →
            </Link>
            <Link
              href="/missions"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 transition px-6 py-3 text-sm font-semibold text-white"
            >
              🎯 Voir aussi les missions
            </Link>
          </div>
        </div>
      </section>

      {/* Stats + filtres */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-3 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 shrink-0">
            <span className="font-bold text-slate-800">{totalProducts}</span> produits · <span className="font-bold text-slate-800">{allBranches.length}</span> branches
          </span>

          {/* Filtres type */}
          <div className="flex items-center gap-1.5 flex-wrap ml-auto">
            {[
              { value: "", label: "Tous" },
              { value: "COURSE",      label: "🎓 Formations" },
              { value: "MONTHLY_SUB", label: "⚙️ Logiciels SaaS" },
              { value: "SERVICE",     label: "🤝 Services" },
              { value: "PRODUCT",     label: "📦 Produits" },
            ].map((opt) => (
              <Link
                key={opt.value}
                href={`/catalogue?${opt.value ? `type=${opt.value}` : ""}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  (typeFilter ?? "") === opt.value
                    ? "bg-[#041B4D] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>

          {/* Recherche */}
          <form method="GET" action="/catalogue" className="flex items-center gap-1">
            {typeFilter && <input type="hidden" name="type" value={typeFilter} />}
            <input
              type="text"
              name="q"
              defaultValue={search ?? ""}
              placeholder="Rechercher…"
              className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-3 pr-8 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#041B4D]/20 w-32 sm:w-48"
            />
            <button type="submit" className="-ml-6 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
          </form>

          {(typeFilter || search) && (
            <Link href="/catalogue" className="text-xs font-semibold text-slate-400 hover:text-[#FF6A00] transition">✕</Link>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-5xl w-full px-4 py-8 flex-1 space-y-12">
        {allBranches.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <span className="text-5xl mb-4 block">🔍</span>
            <p className="text-lg font-semibold">Aucun produit trouvé</p>
            <p className="text-sm mt-1">Essayez d&apos;autres filtres ou termes de recherche.</p>
            <Link href="/catalogue" className="mt-4 inline-block text-sm font-semibold text-[#FF6A00]">Réinitialiser →</Link>
          </div>
        ) : (
          allBranches.map((branch: any) => {
            const style = getBranchStyle(branch.id);
            return (
              <section key={branch.id} id={branch.id}>
                {/* En-tête branche */}
                <div className={`rounded-2xl bg-gradient-to-r ${style.gradient} px-6 py-4 mb-4 flex items-center gap-3`}>
                  <span className="text-3xl">{style.emoji}</span>
                  <div>
                    <h2 className="text-lg font-extrabold text-white">{branch.name}</h2>
                    <p className="text-xs text-white/60">{branch.products.length} produit{branch.products.length > 1 ? "s" : ""}</p>
                  </div>
                </div>

                {/* Grille produits */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {branch.products.map((product: any) => {
                    const suffix       = PRICING_SUFFIX[product.pricingType] ?? "";
                    const priceDisplay = product.price > 0 ? `${fcfa(product.price)}${suffix}` : "Sur devis";
                    const pc           = PRICING_COLOR[product.pricingType] ?? { bg: "#f8fafc", text: "#475569" };

                    let tagline = "";
                    try {
                      if (product.marketingData) {
                        const md = JSON.parse(product.marketingData);
                        tagline = md.tagline ?? "";
                      }
                    } catch { /**/ }

                    return (
                      <Link
                        key={product.id}
                        href={`/offres/${product.slug}`}
                        className="group flex flex-col rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden"
                      >
                        {/* Bande accent */}
                        <div className="h-1 w-full" style={{ background: style.accent }} />
                        <div className="p-4 flex flex-col flex-1 gap-3">
                          {/* Badges */}
                          <div className="flex items-start gap-2 flex-wrap">
                            <span
                              className="inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-bold"
                              style={{ background: pc.bg, color: pc.text }}
                            >
                              {PRICING_LABEL[product.pricingType] ?? product.pricingType}
                            </span>
                            {product.category && (
                              <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 truncate max-w-[130px]">
                                {product.category}
                              </span>
                            )}
                          </div>

                          {/* Nom */}
                          <h3 className="text-sm font-extrabold text-slate-800 leading-snug group-hover:text-[#041B4D] transition line-clamp-2">
                            {product.name}
                          </h3>

                          {/* Description / tagline */}
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1">
                            {tagline || product.description || ""}
                          </p>

                          {/* Prix + CTA */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-auto">
                            <span className="text-sm font-extrabold" style={{ color: style.accent }}>
                              {priceDisplay}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400 group-hover:text-[#FF6A00] transition">
                              Voir l&apos;offre →
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}

        {/* CTA inscription */}
        {allBranches.length > 0 && (
          <div className="rounded-3xl bg-gradient-to-br from-[#041B4D] to-[#0c2d6b] text-white p-8 text-center space-y-4">
            <p className="text-xl font-extrabold">Gagnez des commissions sur ces produits</p>
            <p className="text-sm text-white/70">
              Recommandez les produits IBIG autour de vous et touchez des commissions sur chaque vente. Inscription 100% gratuite.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/rejoindre"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#FF6A00] hover:bg-orange-600 transition px-8 py-3 text-sm font-extrabold text-white shadow-lg"
              >
                🚀 Rejoindre gratuitement →
              </Link>
              <Link
                href="/missions"
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 transition px-6 py-3 text-sm font-semibold text-white"
              >
                🎯 Voir les missions
              </Link>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { fcfa } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catalogue des produits | IBIG PARTNERS",
  description:
    "Découvrez tous les produits IBIG SARL : logiciels SaaS, formations certifiantes, services immobiliers, marketing et plus. Gagnez des commissions en les promouvant.",
  alternates: {
    canonical: "/catalogue",
    languages: { "en": "/en/catalogue" },
  },
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

const BRANCH_STYLE: Record<string, { gradient: string; accent: string; emoji: string; light: string; dark: string }> = {
  "ibig-eduform":        { gradient: "from-blue-600 via-indigo-600 to-indigo-700",    accent: "#2563eb", emoji: "🎓", light: "#eff6ff", dark: "#1e3a8a" },
  "ibig-soft":           { gradient: "from-violet-600 via-purple-600 to-purple-700",  accent: "#7c3aed", emoji: "⚙️", light: "#f5f3ff", dark: "#4c1d95" },
  "ibig-immo-trust":     { gradient: "from-amber-500 via-orange-500 to-orange-600",   accent: "#d97706", emoji: "🏠", light: "#fffbeb", dark: "#78350f" },
  "ibig-digital":        { gradient: "from-cyan-500 via-sky-600 to-sky-700",          accent: "#0284c7", emoji: "💻", light: "#f0f9ff", dark: "#0c4a6e" },
  "ibig-digital-kits":   { gradient: "from-teal-500 via-emerald-600 to-emerald-700",  accent: "#0d9488", emoji: "🔧", light: "#f0fdfa", dark: "#134e4a" },
  "ibig-conseil-plus":   { gradient: "from-slate-500 via-slate-600 to-slate-700",     accent: "#475569", emoji: "📋", light: "#f8fafc", dark: "#1e293b" },
  "ibig-market":         { gradient: "from-rose-500 via-pink-600 to-pink-700",        accent: "#e11d48", emoji: "🛒", light: "#fff1f2", dark: "#881337" },
  "ibig-multiservices":  { gradient: "from-orange-500 via-amber-500 to-amber-600",    accent: "#f97316", emoji: "🛠️", light: "#fff7ed", dark: "#7c2d12" },
  "ibig-emploi-talents": { gradient: "from-fuchsia-500 via-purple-600 to-purple-700", accent: "#a21caf", emoji: "👥", light: "#fdf4ff", dark: "#581c87" },
  "ibig-financement":    { gradient: "from-emerald-500 via-green-600 to-green-700",   accent: "#059669", emoji: "💰", light: "#ecfdf5", dark: "#064e3b" },
};
const DEFAULT_STYLE = { gradient: "from-slate-500 to-slate-700", accent: "#475569", emoji: "📦", light: "#f8fafc", dark: "#1e293b" };

function getBranchStyle(branchId: string) {
  if (BRANCH_STYLE[branchId]) return BRANCH_STYLE[branchId];
  for (const [key, val] of Object.entries(BRANCH_STYLE)) {
    if (branchId.includes(key.replace("ibig-", ""))) return val;
  }
  return DEFAULT_STYLE;
}

const FILTER_TYPES = [
  { value: "",            label: "Tous les types",   icon: "✦" },
  { value: "COURSE",      label: "Formations",       icon: "🎓" },
  { value: "MONTHLY_SUB", label: "Logiciels SaaS",   icon: "⚙️" },
  { value: "SERVICE",     label: "Services",         icon: "🤝" },
  { value: "PRODUCT",     label: "Produits",         icon: "📦" },
];

// Noms lisibles pour les sous-catégories EDUFORM
const EDUFORM_SUBCAT_LABELS: Record<string, { label: string; emoji: string }> = {
  "eduform-finance":        { label: "Finance & Comptabilité",      emoji: "💰" },
  "eduform-rh":             { label: "Ressources Humaines",         emoji: "👥" },
  "eduform-management":     { label: "Management & Leadership",     emoji: "🎯" },
  "eduform-marketing":      { label: "Marketing & Communication",   emoji: "📢" },
  "eduform-informatique":   { label: "Informatique & Tech",         emoji: "💻" },
  "eduform-droit":          { label: "Droit & Juridique",           emoji: "⚖️" },
  "eduform-qhse":           { label: "QHSE & Sécurité",            emoji: "🛡️" },
  "eduform-immobilier":     { label: "Immobilier",                  emoji: "🏠" },
  "eduform-logistique":     { label: "Logistique & Transport",      emoji: "🚛" },
  "eduform-banque":         { label: "Banque & Assurance",          emoji: "🏦" },
  "eduform-devperso":       { label: "Développement Personnel",     emoji: "🌱" },
  "eduform-projets":        { label: "Gestion de Projets",          emoji: "📊" },
  "eduform-entrepreneuriat":{ label: "Entrepreneuriat & Agri.",     emoji: "🌾" },
  "eduform-metiers":        { label: "Métiers & Compétences",       emoji: "🔨" },
  "eduform-mines":          { label: "Mines & Géologie",            emoji: "⛏️" },
  "eduform-sante":          { label: "Santé & Médical",             emoji: "🏥" },
  "eduform-tourisme":       { label: "Tourisme & Hôtellerie",       emoji: "✈️" },
  "eduform-services":       { label: "Services aux Entreprises",    emoji: "🤝" },
};

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string; branch?: string; cat?: string }>;
}) {
  const sp = await searchParams;
  const typeFilter   = sp.type   ?? null;
  const search       = sp.q?.trim() ?? null;
  const branchFilter = sp.branch ?? null;
  const catFilter    = sp.cat    ?? null;  // filtre par champ category des produits
  const user = await getCurrentUser();

  // ── 1. Toutes les branches (pour la sidebar) ──
  const allBranchesForSidebar = await (prisma as any).branch.findMany({
    where: {
      active: true,
      NOT: {
        AND: [
          { slug: { startsWith: "eduform-" } },
          { slug: { not: "ibig-eduform" } },
        ],
      },
    },
    select: {
      id: true, name: true, slug: true,
      _count: { select: { products: { where: { active: true } } } },
    },
    orderBy: { order: "asc" },
  });

  // ── 2. Identifier si IBIG EDUFORM est sélectionné ──
  const eduformBranch = allBranchesForSidebar.find((b: any) => b.slug === "ibig-eduform");
  const isEduformSelected = branchFilter === eduformBranch?.id || catFilter !== null;

  // ── 3. Sous-catégories EDUFORM via le champ `category` des produits ──
  // Fonctionne que les produits soient dans ibig-eduform ou dans les sous-branches
  let eduformCategories: { category: string; count: number }[] = [];
  if (isEduformSelected) {
    const catRows = await (prisma as any).product.groupBy({
      by: ["category"],
      where: {
        active: true,
        category: { not: null },
        branch: {
          OR: [
            { slug: "ibig-eduform" },
            { slug: { startsWith: "eduform-" } },
          ],
        },
      },
      _count: { id: true },
      orderBy: { category: "asc" },
    });
    eduformCategories = catRows
      .filter((r: any) => r.category)
      .map((r: any) => ({ category: r.category as string, count: r._count.id as number }));
  }

  // ── 4. Produits à afficher ──
  let productWhere: any = {
    active: true,
    ...(typeFilter ? { pricingType: typeFilter } : {}),
    ...(catFilter ? { category: catFilter } : {}),
    ...(search ? {
      OR: [
        { name:        { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category:    { contains: search, mode: "insensitive" } },
      ],
    } : {}),
  };

  let branchWhere: any = { active: true };

  if (catFilter) {
    // Filtre catégorie → inclure ibig-eduform + toutes ses sous-branches
    branchWhere = {
      active: true,
      OR: [
        { slug: "ibig-eduform" },
        { slug: { startsWith: "eduform-" } },
      ],
    };
  } else if (branchFilter) {
    const selectedBranch = allBranchesForSidebar.find((b: any) => b.id === branchFilter);
    if (selectedBranch?.slug === "ibig-eduform") {
      // Inclure ibig-eduform ET toutes ses sous-branches
      branchWhere = {
        active: true,
        OR: [
          { id: branchFilter },
          { slug: { startsWith: "eduform-", not: "ibig-eduform" } },
        ],
      };
    } else {
      branchWhere = { active: true, id: branchFilter };
    }
  } else {
    // Vue d'ensemble : exclure les sous-branches EDUFORM
    branchWhere = {
      active: true,
      NOT: {
        AND: [
          { slug: { startsWith: "eduform-" } },
          { slug: { not: "ibig-eduform" } },
        ],
      },
    };
  }

  const branches = await (prisma as any).branch.findMany({
    where: branchWhere,
    include: {
      products: {
        where: productWhere,
        orderBy: [{ rate: "desc" }, { name: "asc" }],
        select: {
          id: true, slug: true, name: true, description: true,
          price: true, pricingType: true, category: true,
          marketingData: true, rate: true,
          commissionRates: {
            where: { level: 1, monthIndex: 1 },
            select: { rate: true },
            take: 1,
          },
        },
      },
      _count: {
        select: {
          products: { where: { active: true, ...(typeFilter ? { pricingType: typeFilter } : {}) } },
        },
      },
    },
    orderBy: { order: "asc" },
  });

  const displayBranches = branches.filter((b: any) => b.products.length > 0);
  const totalProducts = displayBranches.reduce((s: number, b: any) => s + b.products.length, 0);
  const totalAllProducts = allBranchesForSidebar.reduce((s: number, b: any) => s + b._count.products, 0);

  // Nom du filtre actif pour le fil d'Ariane
  const activeBranchName = branchFilter
    ? allBranchesForSidebar.find((b: any) => b.id === branchFilter)?.name
    : (catFilter ? "IBIG EDUFORM" : null);
  const activeCatName = catFilter ?? null;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <SiteHeader />

      {/* ── HERO compact ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#030f2e] via-[#041B4D] to-[#0d2d72] text-white">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 25% 50%, #fff 0%, transparent 50%), radial-gradient(circle at 75% 20%, #FF6A00 0%, transparent 40%)" }} />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-300">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              Catalogue officiel IBIG SARL
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              <span className="text-orange-400">{totalAllProducts}</span> produits à promouvoir
            </h1>
            <p className="text-sm text-white/60 max-w-lg">
              Logiciels SaaS · Formations certifiantes · Immobilier · Services digitaux
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <Link href="/rejoindre" className="inline-flex items-center gap-2 rounded-2xl bg-[#FF6A00] hover:bg-orange-500 transition px-6 py-3 text-sm font-extrabold text-white shadow-lg">
              🚀 Devenir partenaire
            </Link>
            <Link href="/missions" className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/8 hover:bg-white/15 transition px-5 py-3 text-sm font-semibold text-white">
              🎯 Missions
            </Link>
          </div>
        </div>
      </section>

      {/* ── BARRE RECHERCHE + FILTRES TYPES ── */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-2 py-2.5 overflow-x-auto scrollbar-hide">
            {FILTER_TYPES.map((opt) => (
              <Link
                key={opt.value}
                href={buildUrl({ type: opt.value || null, q: search, branch: branchFilter, cat: catFilter })}
                className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  (typeFilter ?? "") === opt.value
                    ? "bg-[#041B4D] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{opt.icon}</span>
                {opt.label}
              </Link>
            ))}

            <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

            <form method="GET" action="/catalogue" className="flex items-center gap-1 shrink-0">
              {typeFilter   && <input type="hidden" name="type"   value={typeFilter} />}
              {branchFilter && <input type="hidden" name="branch" value={branchFilter} />}
              {catFilter    && <input type="hidden" name="cat"    value={catFilter} />}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                  type="text" name="q" defaultValue={search ?? ""}
                  placeholder="Rechercher un produit…"
                  className="rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-4 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#041B4D]/20 w-40 sm:w-52"
                />
              </div>
            </form>

            {(typeFilter || search || branchFilter || catFilter) && (
              <Link href="/catalogue" className="shrink-0 inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 px-3 py-1.5 text-xs font-semibold transition">
                ✕ Réinitialiser
              </Link>
            )}

            <div className="ml-auto shrink-0 text-xs text-slate-400 hidden sm:block">
              <span className="font-bold text-slate-700">{totalProducts}</span> produits affichés
            </div>
          </div>
        </div>
      </div>

      {/* ── LAYOUT PRINCIPAL : sidebar gauche + contenu ── */}
      <div className="mx-auto max-w-6xl w-full px-4 py-8 flex gap-6 items-start flex-1">

        {/* ── SIDEBAR GAUCHE ── */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-20">
          <div className="space-y-4">

            {/* Branches */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#041B4D] to-[#0d2d72] px-4 py-3">
                <p className="text-xs font-bold text-white uppercase tracking-wider">🏢 Branches IBIG</p>
              </div>
              <div className="p-2 space-y-0.5">
                <Link
                  href={buildUrl({ type: typeFilter, q: search, branch: null, subcat: null })}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs transition ${
                    !branchFilter && !subcatFilter
                      ? "bg-[#041B4D] text-white font-bold"
                      : "text-slate-600 hover:bg-slate-50 font-medium"
                  }`}
                >
                  <span>✦ Toutes les branches</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${!branchFilter && !subcatFilter ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {totalAllProducts}
                  </span>
                </Link>
                {allBranchesForSidebar.filter((b: any) => b._count.products > 0).map((branch: any) => {
                  const style = getBranchStyle(branch.id);
                  const isActive = branchFilter === branch.id || (branch.slug === "ibig-eduform" && subcatFilter !== null);
                  return (
                    <Link
                      key={branch.id}
                      href={buildUrl({ type: null, q: search, branch: branch.id, subcat: null })}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs transition ${
                        isActive
                          ? "font-bold text-white"
                          : "text-slate-600 hover:bg-slate-50 font-medium"
                      }`}
                      style={isActive ? { background: style.accent } : {}}
                    >
                      <span>{style.emoji} {branch.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isActive ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"}`}>
                        {branch._count.products}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Sous-catégories EDUFORM (basées sur le champ category des produits) */}
            {isEduformSelected && eduformCategories.length > 0 && (
              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3">
                  <p className="text-xs font-bold text-white uppercase tracking-wider">🎓 Domaines EDUFORM</p>
                </div>
                <div className="p-2 space-y-0.5 max-h-96 overflow-y-auto">
                  <Link
                    href={buildUrl({ type: null, q: search, branch: eduformBranch?.id ?? null, cat: null })}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs transition ${
                      !catFilter
                        ? "bg-blue-600 text-white font-bold"
                        : "text-slate-600 hover:bg-blue-50 font-medium"
                    }`}
                  >
                    <span>📚 Tous les domaines</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${!catFilter ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {eduformCategories.reduce((s, c) => s + c.count, 0)}
                    </span>
                  </Link>
                  {eduformCategories.map(({ category, count }) => {
                    const isActive = catFilter === category;
                    return (
                      <Link
                        key={category}
                        href={buildUrl({ type: null, q: search, branch: null, cat: category })}
                        className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs transition ${
                          isActive
                            ? "bg-blue-600 text-white font-bold"
                            : "text-slate-600 hover:bg-blue-50 font-medium"
                        }`}
                      >
                        <span>📘 {category}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isActive ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"}`}>
                          {count}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTA rejoindre */}
            {!user && (
              <div className="bg-gradient-to-br from-[#FF6A00] to-orange-600 rounded-2xl p-4 text-center space-y-2">
                <p className="text-sm font-extrabold text-white">Devenez partenaire</p>
                <p className="text-[11px] text-white/80">Inscription gratuite · Commissions immédiates</p>
                <Link href="/rejoindre" className="block mt-2 rounded-xl bg-white text-orange-600 py-2 text-xs font-extrabold hover:bg-orange-50 transition">
                  🚀 Rejoindre →
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* ── CONTENU PRINCIPAL ── */}
        <main className="flex-1 min-w-0">
          {/* Fil d'Ariane */}
          {(activeBranchName || activeCatName) && (
            <div className="flex items-center gap-2 mb-5 text-sm text-slate-500">
              <Link href="/catalogue" className="hover:text-[#041B4D] transition">Catalogue</Link>
              {activeBranchName && (
                <>
                  <span className="text-slate-300">›</span>
                  <span className="font-semibold text-slate-700">{activeBranchName}</span>
                </>
              )}
              {activeCatName && (
                <>
                  <span className="text-slate-300">›</span>
                  <span className="font-semibold text-slate-700">{activeCatName}</span>
                </>
              )}
            </div>
          )}

          {displayBranches.length === 0 ? (
            <div className="text-center py-32 space-y-3">
              <p className="text-5xl">🔍</p>
              <p className="text-lg font-bold text-slate-700">Aucun produit trouvé</p>
              <p className="text-sm text-slate-400">Essayez d&apos;autres filtres ou termes de recherche.</p>
              <Link href="/catalogue" className="inline-block mt-2 text-sm font-semibold text-[#FF6A00] hover:underline">Réinitialiser →</Link>
            </div>
          ) : (
            <div className="space-y-12">
              {displayBranches.map((branch: any) => {
                const style = getBranchStyle(branch.id);
                const displaySlug = branch.slug as string;
                const subcatInfo = EDUFORM_SUBCAT_LABELS[displaySlug];
                const headerEmoji = subcatInfo?.emoji ?? style.emoji;
                const headerName  = subcatInfo?.label ?? branch.name;

                return (
                  <section key={branch.id} id={branch.id}>
                    {/* En-tête branche */}
                    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${style.gradient} p-5 mb-5 flex items-center justify-between`}>
                      <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #fff 0%, transparent 60%)" }} />
                      <div className="relative flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center text-2xl shrink-0">
                          {headerEmoji}
                        </div>
                        <div>
                          <h2 className="text-lg font-extrabold text-white leading-tight">{headerName}</h2>
                          {branch.tagline && <p className="text-xs text-white/60 mt-0.5 line-clamp-1">{branch.tagline}</p>}
                        </div>
                      </div>
                      <div className="relative text-right shrink-0">
                        <p className="text-2xl font-extrabold text-white">{branch.products.length}</p>
                        <p className="text-[11px] text-white/60 font-medium">produit{branch.products.length > 1 ? "s" : ""}</p>
                      </div>
                    </div>

                    {/* Grille produits */}
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {branch.products.map((product: any) => {
                        const suffix       = PRICING_SUFFIX[product.pricingType] ?? "";
                        const priceDisplay = product.price > 0 ? `${fcfa(product.price)}${suffix}` : "Sur devis";
                        const commRate: number = product.commissionRates?.[0]?.rate ?? product.rate ?? 0;
                        const commEst = commRate > 0 && product.price > 0
                          ? fcfa(Math.round(product.price * commRate / 100))
                          : null;

                        let tagline = "";
                        let bullets: string[] = [];
                        try {
                          if (product.marketingData) {
                            const md = JSON.parse(product.marketingData);
                            tagline = md.tagline ?? "";
                            bullets = (md.bullets ?? []).slice(0, 2);
                          }
                        } catch { /**/ }

                        return (
                          <article key={product.id} className="group flex flex-col rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden">
                            <div className={`relative h-24 bg-gradient-to-br ${style.gradient} flex items-center justify-center overflow-hidden`}>
                              <div className="absolute inset-0 opacity-20"
                                style={{ backgroundImage: "radial-gradient(circle at 30% 70%, #fff 0%, transparent 50%)" }} />
                              <span className="relative text-4xl opacity-80 group-hover:scale-110 transition-transform duration-300">{headerEmoji}</span>
                              <span className="absolute top-2 left-2 rounded-lg bg-white/20 backdrop-blur px-2 py-0.5 text-[10px] font-bold text-white">
                                {PRICING_LABEL[product.pricingType] ?? product.pricingType}
                              </span>
                              {commRate > 0 && (
                                <span className="absolute top-2 right-2 rounded-lg bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                                  {commRate}% comm.
                                </span>
                              )}
                            </div>

                            <div className="flex flex-col flex-1 p-4 gap-2.5">
                              <div>
                                {product.category && (
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{product.category}</p>
                                )}
                                <h3 className="text-sm font-extrabold text-slate-800 leading-snug group-hover:text-[#041B4D] transition line-clamp-2">
                                  {product.name}
                                </h3>
                              </div>

                              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1 min-h-[2rem]">
                                {tagline || product.description || ""}
                              </p>

                              {bullets.length > 0 && (
                                <ul className="space-y-0.5">
                                  {bullets.map((b: string, i: number) => (
                                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-500">
                                      <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                                      <span className="line-clamp-1">{b}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}

                              <div className="border-t border-slate-100 pt-2.5 space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[10px] text-slate-400 font-medium">Prix</p>
                                    <p className="text-sm font-extrabold" style={{ color: style.accent }}>{priceDisplay}</p>
                                  </div>
                                  {commEst && commRate > 0 && (
                                    <div className="text-right rounded-xl bg-emerald-50 px-2.5 py-1">
                                      <p className="text-[10px] text-emerald-600 font-bold">Votre gain</p>
                                      <p className="text-xs font-extrabold text-emerald-700">{commEst}{suffix}</p>
                                    </div>
                                  )}
                                </div>

                                <div className="flex gap-2">
                                  <Link href={`/offres/${product.slug}`}
                                    className="flex-1 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 py-2 text-xs font-semibold text-slate-600 transition">
                                    Détails
                                  </Link>
                                  {user ? (
                                    <Link href="/espace/liens"
                                      className="flex-[2] flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-extrabold text-white transition"
                                      style={{ background: style.accent }}>
                                      🔗 Promouvoir
                                    </Link>
                                  ) : (
                                    <Link href="/rejoindre"
                                      className="flex-[2] flex items-center justify-center gap-1 rounded-xl bg-[#FF6A00] hover:bg-orange-500 py-2 text-xs font-extrabold text-white transition">
                                      🚀 Promouvoir
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {/* CTA final */}
          {displayBranches.length > 0 && (
            <div className="mt-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#030f2e] via-[#041B4D] to-[#0d2d72] text-white p-8 text-center space-y-4">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #FF6A00 0%, transparent 50%), radial-gradient(circle at 80% 50%, #3b82f6 0%, transparent 50%)" }} />
              <div className="relative">
                <p className="text-xl sm:text-2xl font-extrabold">{user ? "Accédez à vos liens d'affiliation" : "Rejoignez les partenaires IBIG"}</p>
                <p className="text-sm text-white/60 mt-2 max-w-lg mx-auto">
                  {user ? "Retrouvez vos liens d'affiliation depuis votre tableau de bord." : "Inscription gratuite · Commissions immédiates · 11 pays · Paiement Mobile Money"}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-5">
                  {user ? (
                    <Link href="/espace/liens" className="inline-flex items-center gap-2 rounded-2xl bg-[#FF6A00] hover:bg-orange-500 transition px-7 py-3 text-sm font-extrabold text-white shadow-lg">
                      🔗 Mes liens →
                    </Link>
                  ) : (
                    <>
                      <Link href="/rejoindre" className="inline-flex items-center gap-2 rounded-2xl bg-[#FF6A00] hover:bg-orange-500 transition px-7 py-3 text-sm font-extrabold text-white shadow-lg">
                        🚀 Rejoindre gratuitement →
                      </Link>
                      <Link href="/connexion" className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/8 hover:bg-white/15 transition px-5 py-3 text-sm font-semibold text-white">
                        Déjà partenaire ?
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}

function buildUrl(params: { type: string | null; q: string | null; branch: string | null; cat: string | null }) {
  const p = new URLSearchParams();
  if (params.type)   p.set("type",   params.type);
  if (params.q)      p.set("q",      params.q);
  if (params.branch) p.set("branch", params.branch);
  if (params.cat)    p.set("cat",    params.cat);
  const qs = p.toString();
  return `/catalogue${qs ? `?${qs}` : ""}`;
}

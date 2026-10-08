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
  { value: "",            label: "Tous",          icon: "✦" },
  { value: "COURSE",      label: "Formations",    icon: "🎓" },
  { value: "MONTHLY_SUB", label: "Logiciels SaaS",icon: "⚙️" },
  { value: "SERVICE",     label: "Services",      icon: "🤝" },
  { value: "PRODUCT",     label: "Produits",      icon: "📦" },
];

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string; branch?: string }>;
}) {
  const sp = await searchParams;
  const typeFilter   = sp.type   ?? null;
  const search       = sp.q?.trim() ?? null;
  const branchFilter = sp.branch ?? null;
  const user = await getCurrentUser();

  const branches = await (prisma as any).branch.findMany({
    where: {
      active: true,
      ...(branchFilter ? { id: branchFilter } : {}),
    },
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
    },
    orderBy: { name: "asc" },
  });

  const allBranches = branches.filter((b: any) => b.products.length > 0);
  const totalProducts = allBranches.reduce((s: number, b: any) => s + b.products.length, 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <SiteHeader />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#030f2e] via-[#041B4D] to-[#0d2d72] text-white">
        {/* Motif de fond */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 25% 50%, #fff 0%, transparent 50%), radial-gradient(circle at 75% 20%, #FF6A00 0%, transparent 40%)" }} />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20 text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-300">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Catalogue officiel IBIG SARL
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            {totalProducts} <span className="text-orange-400">produits</span><br />
            <span className="text-white/80 text-3xl sm:text-4xl font-bold">à promouvoir & monétiser</span>
          </h1>
          <p className="text-base sm:text-lg text-white/65 max-w-2xl mx-auto leading-relaxed">
            Logiciels SaaS, formations certifiantes, immobilier, services digitaux.
            Promouvez et touchez des commissions sur chaque vente — inscription gratuite.
          </p>
          {/* Stats rapides */}
          <div className="flex flex-wrap justify-center gap-6 pt-2">
            {[
              { label: "Produits disponibles", value: String(totalProducts) },
              { label: "Branches IBIG", value: String(allBranches.length) },
              { label: "Commission max N1", value: "15%" },
              { label: "Pays couverts", value: "11" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-extrabold text-orange-400">{s.value}</p>
                <p className="text-[11px] font-medium text-white/50 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/rejoindre" className="inline-flex items-center gap-2 rounded-2xl bg-[#FF6A00] hover:bg-orange-500 active:scale-95 transition-all px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-orange-900/30">
              🚀 Devenir partenaire — gratuit
            </Link>
            <Link href="/missions" className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/8 hover:bg-white/15 transition px-6 py-3.5 text-sm font-semibold text-white">
              🎯 Voir aussi les missions
            </Link>
          </div>
        </div>
      </section>

      {/* ── BARRE FILTRES sticky ── */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-2 py-2.5 overflow-x-auto scrollbar-hide">
            {/* Types */}
            <div className="flex items-center gap-1.5 shrink-0">
              {FILTER_TYPES.map((opt) => (
                <Link
                  key={opt.value}
                  href={`/catalogue?${opt.value ? `type=${opt.value}` : ""}${search ? `&q=${encodeURIComponent(search)}` : ""}${branchFilter ? `&branch=${encodeURIComponent(branchFilter)}` : ""}`}
                  className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                    (typeFilter ?? "") === opt.value
                      ? "bg-[#041B4D] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>{opt.icon}</span>
                  {opt.label}
                </Link>
              ))}
            </div>

            <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

            {/* Recherche */}
            <form method="GET" action="/catalogue" className="flex items-center gap-1 shrink-0">
              {typeFilter   && <input type="hidden" name="type"   value={typeFilter} />}
              {branchFilter && <input type="hidden" name="branch" value={branchFilter} />}
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

            {(typeFilter || search || branchFilter) && (
              <Link href="/catalogue" className="shrink-0 inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 px-3 py-1.5 text-xs font-semibold transition">
                ✕ Réinitialiser
              </Link>
            )}

            <div className="ml-auto shrink-0 text-xs text-slate-400 hidden sm:block">
              <span className="font-bold text-slate-700">{totalProducts}</span> produits · <span className="font-bold text-slate-700">{allBranches.length}</span> branches
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENU PRINCIPAL ── */}
      <main className="mx-auto max-w-6xl w-full px-4 py-10 flex-1">
        {allBranches.length === 0 ? (
          <div className="text-center py-32 space-y-3">
            <p className="text-5xl">🔍</p>
            <p className="text-lg font-bold text-slate-700">Aucun produit trouvé</p>
            <p className="text-sm text-slate-400">Essayez d&apos;autres filtres ou termes de recherche.</p>
            <Link href="/catalogue" className="inline-block mt-2 text-sm font-semibold text-[#FF6A00] hover:underline">Réinitialiser →</Link>
          </div>
        ) : (
          <div className="space-y-14">
            {allBranches.map((branch: any) => {
              const style = getBranchStyle(branch.id);
              return (
                <section key={branch.id} id={branch.id}>

                  {/* ── En-tête branche ── */}
                  <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${style.gradient} p-6 mb-6 flex items-center justify-between`}>
                    <div className="absolute inset-0 opacity-10"
                      style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #fff 0%, transparent 60%)" }} />
                    <div className="relative flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-3xl shrink-0">
                        {style.emoji}
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold text-white leading-tight">{branch.name}</h2>
                        {branch.tagline && <p className="text-sm text-white/60 mt-0.5 line-clamp-1">{branch.tagline}</p>}
                      </div>
                    </div>
                    <div className="relative text-right shrink-0">
                      <p className="text-3xl font-extrabold text-white">{branch.products.length}</p>
                      <p className="text-xs text-white/60 font-medium">produit{branch.products.length > 1 ? "s" : ""}</p>
                    </div>
                  </div>

                  {/* ── Grille produits ── */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                          bullets = (md.bullets ?? []).slice(0, 3);
                        }
                      } catch { /**/ }

                      return (
                        <article
                          key={product.id}
                          className="group flex flex-col rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden"
                        >
                          {/* Visual header */}
                          <div
                            className={`relative h-28 bg-gradient-to-br ${style.gradient} flex items-center justify-center overflow-hidden`}
                          >
                            <div className="absolute inset-0 opacity-20"
                              style={{ backgroundImage: "radial-gradient(circle at 30% 70%, #fff 0%, transparent 50%)" }} />
                            <span className="relative text-5xl opacity-80 group-hover:scale-110 transition-transform duration-300">{style.emoji}</span>
                            {/* Badge type */}
                            <span className="absolute top-3 left-3 rounded-lg bg-white/20 backdrop-blur px-2 py-0.5 text-[10px] font-bold text-white">
                              {PRICING_LABEL[product.pricingType] ?? product.pricingType}
                            </span>
                            {/* Badge commission */}
                            {commRate > 0 && (
                              <span className="absolute top-3 right-3 rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-extrabold text-white shadow-sm">
                                {commRate}% comm.
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col flex-1 p-5 gap-3">
                            {/* Nom + catégorie */}
                            <div>
                              {product.category && (
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{product.category}</p>
                              )}
                              <h3 className="text-sm font-extrabold text-slate-800 leading-snug group-hover:text-[#041B4D] transition line-clamp-2">
                                {product.name}
                              </h3>
                            </div>

                            {/* Tagline */}
                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1 min-h-[2.5rem]">
                              {tagline || product.description || ""}
                            </p>

                            {/* Bullets si disponibles */}
                            {bullets.length > 0 && (
                              <ul className="space-y-0.5">
                                {bullets.map((b, i) => (
                                  <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-500">
                                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                                    <span className="line-clamp-1">{b}</span>
                                  </li>
                                ))}
                              </ul>
                            )}

                            {/* Séparateur */}
                            <div className="border-t border-slate-100 pt-3 space-y-3">
                              {/* Prix + commission */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-[10px] text-slate-400 font-medium">Prix produit</p>
                                  <p className="text-base font-extrabold" style={{ color: style.accent }}>{priceDisplay}</p>
                                </div>
                                {commEst && commRate > 0 && (
                                  <div className="text-right rounded-xl bg-emerald-50 px-3 py-1.5">
                                    <p className="text-[10px] text-emerald-600 font-bold">Votre gain</p>
                                    <p className="text-sm font-extrabold text-emerald-700">{commEst}{suffix}</p>
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2">
                                <Link
                                  href={`/offres/${product.slug}`}
                                  className="flex-1 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 py-2 text-xs font-semibold text-slate-600 transition"
                                >
                                  Détails
                                </Link>
                                {user ? (
                                  <Link
                                    href="/espace/liens"
                                    className="flex-[2] flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-extrabold text-white transition"
                                    style={{ background: style.accent }}
                                  >
                                    🔗 Promouvoir
                                  </Link>
                                ) : (
                                  <Link
                                    href={`/rejoindre`}
                                    className="flex-[2] flex items-center justify-center gap-1 rounded-xl bg-[#FF6A00] hover:bg-orange-500 py-2 text-xs font-extrabold text-white transition"
                                  >
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

        {/* ── CTA FINAL ── */}
        {allBranches.length > 0 && (
          <div className="mt-16 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#030f2e] via-[#041B4D] to-[#0d2d72] text-white p-10 text-center space-y-5">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #FF6A00 0%, transparent 50%), radial-gradient(circle at 80% 50%, #3b82f6 0%, transparent 50%)" }} />
            <div className="relative">
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {user ? "Accédez à vos liens d'affiliation" : "Rejoignez les partenaires IBIG"}
              </p>
              <p className="text-sm text-white/60 mt-2 max-w-xl mx-auto">
                {user
                  ? "Retrouvez vos liens d'affiliation et suivez vos ventes en temps réel depuis votre tableau de bord."
                  : "Inscription gratuite · Commissions immédiates · 11 pays couverts · Paiement Mobile Money"}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                {user ? (
                  <Link href="/espace/liens" className="inline-flex items-center gap-2 rounded-2xl bg-[#FF6A00] hover:bg-orange-500 transition px-8 py-3.5 text-sm font-extrabold text-white shadow-lg">
                    🔗 Mes liens d&apos;affiliation →
                  </Link>
                ) : (
                  <>
                    <Link href="/rejoindre" className="inline-flex items-center gap-2 rounded-2xl bg-[#FF6A00] hover:bg-orange-500 transition px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-orange-900/30">
                      🚀 Rejoindre gratuitement →
                    </Link>
                    <Link href="/connexion" className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/8 hover:bg-white/15 transition px-6 py-3.5 text-sm font-semibold text-white">
                      Déjà partenaire ? Connexion
                    </Link>
                  </>
                )}
                <Link href="/missions" className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/8 hover:bg-white/15 transition px-6 py-3.5 text-sm font-semibold text-white">
                  🎯 Voir les missions
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

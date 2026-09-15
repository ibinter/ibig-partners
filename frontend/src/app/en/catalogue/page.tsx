import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ibigpartners.com";

export const metadata: Metadata = {
  title: "Product Catalogue — IBIG PARTNERS | Software, Training & Services",
  description: "Browse the full IBIG SARL catalogue: 14 SaaS ERP solutions, 800+ certified training courses, real estate, digital services, and multiservices. Join free and earn commissions.",
  alternates: {
    canonical: `${SITE_URL}/en/catalogue`,
    languages: { fr: `${SITE_URL}/catalogue`, en: `${SITE_URL}/en/catalogue` },
  },
};

const PRICING_LABEL: Record<string, string> = {
  MONTHLY_SUB: "Monthly subscription",
  ANNUAL_SUB:  "Annual subscription",
  COURSE:      "Training",
  SERVICE:     "Service",
  PRODUCT:     "Product",
  ONE_TIME:    "One-time purchase",
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

export default async function CatalogueEnPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const typeFilter = sp.type ?? null;
  const search     = sp.q?.trim() ?? null;
  const user = await getCurrentUser();

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
            ],
          } : {}),
        },
        orderBy: { name: "asc" },
        select: {
          id: true, slug: true, name: true, description: true,
          price: true, pricingType: true, rate: true,
          commissionRates: { where: { level: 1, monthIndex: 1 }, select: { rate: true }, take: 1 },
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
            🛍️ Official catalogue
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            All IBIG SARL products
          </h1>
          <p className="text-base sm:text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
            Browse the full catalogue: software, training courses, real estate, and services. Sign up free to earn commissions promoting them.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/en/rejoindre"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#FF6A00] hover:bg-orange-600 transition px-6 py-3 text-sm font-extrabold text-white shadow-lg"
            >
              🚀 Become a partner — free →
            </Link>
          </div>
        </div>
      </section>

      {/* Filters bar */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-3 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 shrink-0">
            <span className="font-bold text-slate-800">{totalProducts}</span> products · <span className="font-bold text-slate-800">{allBranches.length}</span> branches
          </span>
          <div className="flex items-center gap-1.5 flex-wrap ml-auto">
            {[
              { value: "", label: "All" },
              { value: "COURSE",      label: "🎓 Training" },
              { value: "MONTHLY_SUB", label: "⚙️ SaaS software" },
              { value: "SERVICE",     label: "🤝 Services" },
              { value: "PRODUCT",     label: "📦 Products" },
            ].map((opt) => (
              <Link
                key={opt.value}
                href={`/en/catalogue?${opt.value ? `type=${opt.value}` : ""}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
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
          <form method="GET" action="/en/catalogue" className="flex items-center gap-1">
            {typeFilter && <input type="hidden" name="type" value={typeFilter} />}
            <input
              type="text" name="q" defaultValue={search ?? ""}
              placeholder="Search…"
              className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-3 pr-8 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#041B4D]/20 w-32 sm:w-48"
            />
            <button type="submit" className="-ml-6 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
          </form>
          {(typeFilter || search) && (
            <Link href="/en/catalogue" className="text-xs font-semibold text-slate-400 hover:text-[#FF6A00] transition">✕ Clear</Link>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-5xl w-full px-4 py-8 flex-1 space-y-12">
        {allBranches.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <span className="text-5xl mb-4 block">🔍</span>
            <p className="text-lg font-semibold">No products found</p>
            <p className="text-sm mt-1">Try different filters or search terms.</p>
            <Link href="/en/catalogue" className="mt-4 inline-block text-sm font-semibold text-[#FF6A00]">Reset →</Link>
          </div>
        ) : (
          allBranches.map((branch: any) => {
            const style = getBranchStyle(branch.id);
            return (
              <section key={branch.id} id={branch.id}>
                <div className={`rounded-2xl bg-gradient-to-r ${style.gradient} p-5 mb-5 flex items-center gap-4`}>
                  <span className="text-3xl">{style.emoji}</span>
                  <div>
                    <h2 className="text-xl font-extrabold text-white">{branch.name}</h2>
                    {branch.description && (
                      <p className="text-sm text-white/75 mt-0.5 max-w-xl">{branch.description}</p>
                    )}
                  </div>
                  <span className="ml-auto rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
                    {branch.products.length} product{branch.products.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {branch.products.map((p: any) => {
                    const label   = PRICING_LABEL[p.pricingType] ?? p.pricingType;
                    const chip    = PRICING_COLOR[p.pricingType] ?? { bg: "#f8fafc", text: "#475569" };
                    const suffix  = p.pricingType === "MONTHLY_SUB" ? "/mo" : p.pricingType === "ANNUAL_SUB" ? "/yr" : "";
                    const commRate = p.commissionRates?.[0]?.rate ?? p.rate ?? 0;
                    const isAuth  = !!user;
                    return (
                      <div key={p.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition flex flex-col overflow-hidden">
                        <div className="p-4 flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-bold text-slate-900 leading-snug">{p.name}</h3>
                            <span
                              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                              style={{ background: chip.bg, color: chip.text }}
                            >
                              {label}
                            </span>
                          </div>
                          {p.description && (
                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{p.description}</p>
                          )}
                        </div>
                        <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between gap-2">
                          <div>
                            {p.price > 0 ? (
                              <p className="text-sm font-black text-slate-900">
                                {p.price.toLocaleString("fr-FR")} FCFA{suffix}
                              </p>
                            ) : (
                              <p className="text-sm font-semibold text-slate-500">On quote</p>
                            )}
                            {commRate > 0 && (
                              <p className="text-[10px] text-emerald-600 font-semibold">
                                Commission {(commRate * 100).toFixed(0)} %
                              </p>
                            )}
                          </div>
                          <Link
                            href={isAuth ? `/espace/produits` : `/offres/${p.slug}`}
                            className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold text-white transition"
                            style={{ background: style.accent }}
                          >
                            {isAuth ? "Activate" : "Learn more"}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
        <p>
          <Link href="/en" className="hover:text-[#041B4D]">Home</Link>
          {" · "}
          <Link href="/catalogue" className="hover:text-[#041B4D]">French version</Link>
          {" · "}
          <Link href="/en/rejoindre" className="hover:text-[#041B4D]">Become a partner</Link>
        </p>
        <p className="mt-2">© {new Date().getFullYear()} IBIG PARTNERS · IBIG SARL</p>
      </footer>
    </div>
  );
}

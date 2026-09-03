import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fcfa } from "@/lib/format";
import type { Metadata } from "next";
import { SetRefCookie } from "./set-ref-cookie";
import { ShareButtons } from "./share-buttons";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { ref }  = await searchParams;

  const product = await (prisma as any).product.findUnique({
    where: { slug, active: true },
    include: { branch: true },
  });
  if (!product) return { title: "Offre introuvable" };

  let md: any = {};
  try { if (product.marketingData) md = JSON.parse(product.marketingData); } catch { /**/ }

  const baseUrl   = process.env.NEXT_PUBLIC_SITE_URL || "https://ibigpartners.com";
  const title     = product.name;
  const tagline   = md.tagline || product.description?.slice(0, 160) || product.name;
  const imageUrl  = md.imageUrl || undefined;
  const canonical = ref ? `${baseUrl}/offres/${slug}?ref=${ref}` : `${baseUrl}/offres/${slug}`;

  return {
    title: `${title} — IBIG PARTNERS`,
    description: tagline,
    openGraph: {
      title, description: tagline, url: canonical,
      siteName: "IBIG PARTNERS",
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description: tagline, images: imageUrl ? [imageUrl] : [] },
  };
}

const PRICING_LABEL: Record<string, string> = {
  MONTHLY_SUB: "Abonnement mensuel",
  ANNUAL_SUB:  "Abonnement annuel",
  COURSE:      "Formation",
  SERVICE:     "Service / Sur devis",
  PRODUCT:     "Produit",
  ONE_TIME:    "Achat unique",
};

const PRICING_SUFFIX: Record<string, string> = {
  MONTHLY_SUB: "/mois",
  ANNUAL_SUB:  "/an",
};

const BRANCH_THEME: Record<string, { gradient: string; gradientDark: string; accent: string; accentDark: string; light: string; emoji: string }> = {
  "ibig-eduform":        { gradient: "from-blue-500 to-indigo-700",   gradientDark: "from-blue-700 to-indigo-900",   accent: "#3b82f6", accentDark: "#1d4ed8", light: "#eff6ff", emoji: "🎓" },
  "ibig-soft":           { gradient: "from-violet-500 to-purple-700", gradientDark: "from-violet-700 to-purple-900", accent: "#7c3aed", accentDark: "#5b21b6", light: "#f5f3ff", emoji: "⚙️" },
  "ibig-immo-trust":     { gradient: "from-amber-400 to-orange-600",  gradientDark: "from-amber-600 to-orange-800",  accent: "#f59e0b", accentDark: "#d97706", light: "#fffbeb", emoji: "🏠" },
  "ibig-digital":        { gradient: "from-cyan-500 to-sky-700",      gradientDark: "from-cyan-700 to-sky-900",      accent: "#0891b2", accentDark: "#0e7490", light: "#ecfeff", emoji: "💻" },
  "ibig-digital-kits":   { gradient: "from-teal-500 to-emerald-700",  gradientDark: "from-teal-700 to-emerald-900",  accent: "#0d9488", accentDark: "#0f766e", light: "#f0fdfa", emoji: "🔧" },
  "ibig-conseil-plus":   { gradient: "from-slate-600 to-slate-800",   gradientDark: "from-slate-700 to-slate-900",   accent: "#475569", accentDark: "#334155", light: "#f8fafc", emoji: "📋" },
  "ibig-market":         { gradient: "from-rose-500 to-pink-700",     gradientDark: "from-rose-700 to-pink-900",     accent: "#f43f5e", accentDark: "#e11d48", light: "#fff1f2", emoji: "🛒" },
  "ibig-multiservices":  { gradient: "from-orange-400 to-amber-600",  gradientDark: "from-orange-600 to-amber-800",  accent: "#f97316", accentDark: "#ea580c", light: "#fff7ed", emoji: "🛠️" },
  "ibig-financement":    { gradient: "from-emerald-500 to-green-700", gradientDark: "from-emerald-700 to-green-900", accent: "#059669", accentDark: "#047857", light: "#ecfdf5", emoji: "💰" },
  "ibig-emploi-talents": { gradient: "from-fuchsia-500 to-purple-700",gradientDark: "from-fuchsia-700 to-purple-900",accent: "#a21caf", accentDark: "#86198f", light: "#fdf4ff", emoji: "👥" },
};

const DEFAULT_THEME = { gradient: "from-slate-600 to-slate-800", gradientDark: "from-slate-700 to-slate-900", accent: "#475569", accentDark: "#334155", light: "#f8fafc", emoji: "📦" };

function getTheme(branchId: string) {
  if (BRANCH_THEME[branchId]) return BRANCH_THEME[branchId];
  for (const [key, val] of Object.entries(BRANCH_THEME)) {
    if (branchId.includes(key.replace("ibig-", "")) || key.includes(branchId.replace("ibig-", ""))) return val;
  }
  return DEFAULT_THEME;
}

type MarketingData = {
  tagline?: string;
  bullets?: string[];
  audience?: string;
  includes?: string[];
  imageUrl?: string;
};

function parseMD(raw: string | null | undefined): MarketingData {
  try { if (raw) return JSON.parse(raw) as MarketingData; } catch { /**/ }
  return {};
}

function extractBullets(description: string): string[] {
  return description
    .split(/[.\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 15)
    .slice(0, 5);
}

export default async function OffrePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { slug } = await params;
  const { ref }  = await searchParams;

  const product = await (prisma as any).product.findUnique({
    where: { slug, active: true },
    include: { branch: true },
  });

  if (!product) notFound();

  let partnerName: string | null = null;
  const affCodeRaw = ref?.toUpperCase() ?? null;
  if (affCodeRaw) {
    const partner = await prisma.user.findFirst({
      where: { code: affCodeRaw, active: true, approved: true },
    });
    if (partner) partnerName = `${partner.firstName} ${partner.lastName}`;
  }

  const md      = parseMD(product.marketingData);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ibigpartners.com";
  const affCode = affCodeRaw;
  const ctaHref = affCode
    ? `${baseUrl}/aff/${affCode}?p=${product.slug}`
    : product.siteUrl ?? `${baseUrl}/rejoindre`;

  const suffix       = PRICING_SUFFIX[product.pricingType] ?? "";
  const priceDisplay = product.price > 0 ? `${fcfa(product.price)}${suffix}` : "Sur devis";
  const isService    = product.pricingType === "SERVICE" || product.price === 0;
  const isCourse     = product.pricingType === "COURSE";
  const isSoftware   = ["MONTHLY_SUB", "ANNUAL_SUB"].includes(product.pricingType);

  const theme = getTheme(product.branch.id ?? product.branch.slug ?? "");

  const ctaLabel = isService ? "Demander un devis gratuit"
    : isSoftware  ? "S'abonner maintenant"
    : isCourse    ? "Je m'inscris maintenant"
    : "Commander maintenant";

  const ctaBottomTitle = isService ? "Prêt à démarrer votre projet ?"
    : isSoftware  ? "Digitalisez votre activité dès aujourd'hui"
    : isCourse    ? "Lancez-vous — votre certificat vous attend"
    : "Passez à l'action maintenant";

  const urgencyText = isService ? "⚡ Réponse sous 24h garantie"
    : isCourse    ? "🔥 Inscriptions ouvertes"
    : isSoftware  ? "✅ Essai gratuit disponible"
    : "🚀 Disponible maintenant";

  const hasMarketing = (md.bullets?.filter(Boolean).length ?? 0) > 0;
  const bullets      = hasMarketing
    ? md.bullets!.filter(Boolean)
    : product.description ? extractBullets(product.description) : [];
  const audience  = md.audience || "";
  const includes  = md.includes?.filter(Boolean) ?? [];
  const imageUrl  = md.imageUrl || "";
  const tagline   = md.tagline || "";

  const trustBadges = [
    { icon: "🏆", label: isCourse ? "Certificat délivré" : "Qualité garantie" },
    { icon: "💬", label: "Support inclus" },
    { icon: "🔒", label: "Paiement sécurisé" },
    { icon: isCourse ? "♾️" : isSoftware ? "🔄" : "📋", label: isCourse ? "Replay inclus" : isSoftware ? "Mises à jour" : "Devis gratuit" },
    { icon: "📱", label: "Multi-device" },
    { icon: "⭐", label: "Top vendeur" },
  ];

  const shareUrl = affCode ? `${baseUrl}/offres/${product.slug}?ref=${affCode}` : `${baseUrl}/offres/${product.slug}`;

  return (
    <div className="min-h-screen bg-slate-50">
      {affCode && <SetRefCookie code={affCode} />}

      {/* ── BARRE STICKY MOBILE ─────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t border-slate-200 bg-white px-4 py-3 shadow-2xl">
        <a
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-2xl py-4 text-center text-sm font-extrabold text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})` }}
        >
          {ctaLabel} →
        </a>
      </div>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <header className={`relative bg-gradient-to-br ${theme.gradient} overflow-hidden`}>
        {/* Déco géométrique */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/5" />
          <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
          {/* Grille subtile */}
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }} />
        </div>

        <div className="relative mx-auto max-w-4xl px-5 pt-8 pb-12">

          {/* Branche + type */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/20 text-white border border-white/20">
              {theme.emoji} {product.branch.name}
            </span>
            <span className="text-white/30">·</span>
            <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 text-white/70 border border-white/10">
              {PRICING_LABEL[product.pricingType] ?? product.pricingType}
            </span>
            <span className="ml-auto text-[11px] font-extrabold px-3 py-1.5 rounded-full text-white border border-white/30 animate-pulse" style={{ background: "rgba(255,255,255,0.15)" }}>
              {urgencyText}
            </span>
          </div>

          {/* Badge parrain */}
          {partnerName && (
            <div className="mb-5 inline-flex items-center gap-2.5 rounded-2xl bg-white/15 border border-white/25 px-4 py-2.5 backdrop-blur-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-sm">👤</span>
              <div>
                <p className="text-[10px] text-white/60 uppercase tracking-wide font-bold">Partagé par</p>
                <p className="text-sm font-extrabold text-white">{partnerName} <span className="text-[10px] font-semibold text-white/60">· Partenaire IBIG</span></p>
              </div>
            </div>
          )}

          {/* Titre */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.2)" }}>
            {product.name}
          </h1>

          {/* Tagline */}
          {(tagline || product.description) && (
            <p className="text-base sm:text-lg text-white/85 font-medium leading-relaxed max-w-2xl mb-8">
              {tagline || product.description?.slice(0, 180)}
            </p>
          )}

          {/* Prix + CTA hero */}
          <div className="flex flex-col sm:flex-row items-start sm:items-stretch gap-4">
            {/* Card prix */}
            <div className="rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm px-6 py-5 min-w-[180px]">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-white/50 mb-1">Prix de référence</p>
              <p className="text-4xl font-extrabold text-white leading-none">{priceDisplay}</p>
              {isService && <p className="text-xs text-white/55 mt-2 font-medium">Devis gratuit · Sous 24h</p>}
              {isCourse && <p className="text-xs text-white/55 mt-2 font-medium">Certificat inclus · Replay inclus</p>}
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 flex-1">
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center justify-center gap-2.5 rounded-2xl bg-white px-8 py-4 text-base font-extrabold shadow-2xl hover:shadow-xl transition-all hover:-translate-y-0.5 hover:scale-[1.02]"
                style={{ color: theme.accentDark }}
              >
                <span className="text-lg">{isService ? "💬" : isCourse ? "🎓" : isSoftware ? "🚀" : "🛒"}</span>
                {ctaLabel}
                <span className="ml-1">→</span>
              </a>
              {product.siteUrl && (
                <a
                  href={product.siteUrl.startsWith("http") ? product.siteUrl : `https://${product.siteUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/15 border border-white/30 px-8 py-3.5 text-sm font-bold text-white hover:bg-white/25 transition backdrop-blur-sm"
                >
                  🔗 Voir l&apos;offre complète
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── BANDEAU TRUST ───────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-3 overflow-x-auto">
          <div className="flex items-center gap-6 min-w-max">
            {trustBadges.map(b => (
              <div key={b.label} className="flex items-center gap-1.5 shrink-0">
                <span className="text-base">{b.icon}</span>
                <span className="text-xs font-bold text-slate-600 whitespace-nowrap">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CORPS ─────────────────────────────────────────────── */}
      <main className="mx-auto max-w-4xl px-4 py-10 pb-24 sm:pb-10 space-y-6">

        {/* Image produit */}
        {imageUrl && (
          <div className="rounded-3xl overflow-hidden shadow-xl border border-white max-h-80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Layout 2 colonnes sur desktop */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">

            {/* Description */}
            {product.description && (
              <div className="rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3" style={{ background: theme.light }}>
                  <span className="text-xl">{isCourse ? "🎓" : isSoftware ? "⚙️" : isService ? "🤝" : "📦"}</span>
                  <h2 className="text-sm font-extrabold text-slate-800">
                    {isCourse ? "À propos de cette formation" : isSoftware ? "À propos de ce logiciel" : isService ? "À propos de cette prestation" : "À propos de cette offre"}
                  </h2>
                </div>
                <div className="px-6 py-5">
                  <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
                </div>
              </div>
            )}

            {/* Points clés */}
            {bullets.length > 0 && (
              <div className="rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3" style={{ background: theme.light }}>
                  <span className="text-xl">✨</span>
                  <h2 className="text-sm font-extrabold text-slate-800">Ce que vous allez obtenir</h2>
                </div>
                <ul className="divide-y divide-slate-50">
                  {bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/60 transition">
                      <span
                        className="shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-extrabold shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})` }}
                      >
                        ✓
                      </span>
                      <span className="text-sm text-slate-700 leading-relaxed">{b.trim().replace(/\.$/, "")}.</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tableau des tarifs formations */}
            {isCourse && (
              <div className="rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3" style={{ background: theme.light }}>
                  <span className="text-xl">💰</span>
                  <h2 className="text-sm font-extrabold text-slate-800">Tarifs & Modalités</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: theme.light }}>
                        <th className="text-left px-6 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">Modalité</th>
                        <th className="text-right px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">💻 En ligne</th>
                        <th className="text-right px-6 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">🏛️ Présentiel</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {(() => {
                        const r5 = (x: number) => Math.round(x / 5000) * 5000;
                        const pres = r5(product.price * 16000 / 11250);
                        const fmt = (n: number) => n.toLocaleString("fr-FR") + " FCFA";
                        return [
                          { icon: "🖥️", label: "E-learning (à votre rythme)", ligne: fmt(r5(product.price * 0.50)), presentiel: "—", highlight: false },
                          { icon: "👤", label: "Individuel (en direct)", ligne: fmt(product.price), presentiel: fmt(pres), highlight: true },
                          { icon: "👥", label: "Groupe 3–5 pers / pers", ligne: fmt(r5(product.price * 0.70)), presentiel: fmt(r5(pres * 0.70)), highlight: false },
                          { icon: "👥", label: "Groupe 6–10 pers / pers", ligne: fmt(r5(product.price * 0.55)), presentiel: fmt(r5(pres * 0.55)), highlight: false },
                          { icon: "🏢", label: "Groupe 10+ pers / pers", ligne: fmt(r5(product.price * 0.45)), presentiel: fmt(r5(pres * 0.45)), highlight: false },
                        ];
                      })().map((row) => (
                        <tr key={row.label} className={`hover:bg-slate-50/80 transition ${row.highlight ? "font-semibold" : ""}`} style={row.highlight ? { background: theme.light } : {}}>
                          <td className="px-6 py-3.5 text-slate-700"><span className="mr-2">{row.icon}</span>{row.label}</td>
                          <td className="px-4 py-3.5 text-right font-bold text-slate-900">{row.ligne}</td>
                          <td className="px-6 py-3.5 text-right font-bold text-slate-900">{row.presentiel}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-slate-100" style={{ background: theme.light }}>
                        <td className="px-6 py-3 text-slate-700 font-medium"><span className="mr-2">🌍</span>Intra-entreprise / International</td>
                        <td className="px-4 py-3 text-right text-slate-500 italic font-medium" colSpan={2}>Sur devis</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="px-6 py-3 text-[11px] text-slate-400 italic border-t border-slate-50">* Tarifs indicatifs. Contactez-nous pour un devis personnalisé.</p>
              </div>
            )}

            {/* Public cible */}
            {audience && (
              <div className="rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3" style={{ background: theme.light }}>
                  <span className="text-xl">🎯</span>
                  <h2 className="text-sm font-extrabold text-slate-800">Pour qui ?</h2>
                </div>
                <div className="px-6 py-5">
                  <p className="text-sm text-slate-600 leading-relaxed">{audience}</p>
                </div>
              </div>
            )}

            {/* Ce qui est inclus */}
            {includes.length > 0 && (
              <div className="rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3" style={{ background: theme.light }}>
                  <span className="text-xl">📦</span>
                  <h2 className="text-sm font-extrabold text-slate-800">Ce qui est inclus</h2>
                </div>
                <ul className="grid sm:grid-cols-2 gap-3 p-6">
                  {includes.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-2xl p-3.5 border border-slate-100 bg-slate-50/50">
                      <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold mt-0.5"
                        style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})` }}>✓</span>
                      <span className="text-sm text-slate-700 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Partage */}
            <ShareButtons url={shareUrl} title={product.name} description={product.description} />
          </div>

          {/* Colonne sticky sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-6 space-y-4">

              {/* Card CTA sidebar */}
              <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-100 bg-white">
                <div className={`bg-gradient-to-br ${theme.gradient} px-5 py-6 text-white text-center`}>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/60 mb-1">Prix de référence</p>
                  <p className="text-4xl font-extrabold">{priceDisplay}</p>
                  {isService && <p className="text-xs text-white/60 mt-1">Devis gratuit · Sous 24h</p>}
                </div>
                <div className="p-5 space-y-3">
                  <a
                    href={ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-2xl py-3.5 text-center text-sm font-extrabold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                    style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})` }}
                  >
                    {ctaLabel} →
                  </a>
                  {product.siteUrl && (
                    <a
                      href={product.siteUrl.startsWith("http") ? product.siteUrl : `https://${product.siteUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full rounded-2xl py-3 text-center text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition"
                    >
                      🔗 Voir l&apos;offre complète
                    </a>
                  )}
                  <div className="pt-2 space-y-2">
                    {[
                      { icon: "✅", text: "Sans engagement" },
                      { icon: "💬", text: "Support réactif" },
                      { icon: "🔒", text: "Paiement sécurisé" },
                    ].map(g => (
                      <div key={g.text} className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <span>{g.icon}</span><span>{g.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card branche */}
              <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Proposé par</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{theme.emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{product.branch.name}</p>
                    <p className="text-[11px] text-slate-400">Réseau IBIG PARTNERS</p>
                  </div>
                </div>
              </div>

              {/* Card partage rapide */}
              <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">Partager rapidement</p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${product.name}\n\n${shareUrl}`)}`, bg: "#25d366" },
                    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, bg: "#1877f2" },
                    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, bg: "#0a66c2" },
                  ].map(s => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                      className="rounded-xl px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
                      style={{ background: s.bg }}>
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA BAS DE PAGE ─────────────────────────────────── */}
        <div className={`relative rounded-3xl bg-gradient-to-br ${theme.gradient} overflow-hidden`}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white/5" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white/5" />
          </div>
          <div className="relative px-6 py-10 text-center text-white space-y-5">
            <div className="inline-block rounded-full bg-white/15 border border-white/20 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest mb-2">
              {urgencyText}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">{ctaBottomTitle}</h2>
            <p className="text-sm text-white/75 max-w-lg mx-auto leading-relaxed">
              {isService
                ? "Notre équipe vous contacte sous 24h pour cadrer votre besoin et établir un devis gratuit. Aucun engagement."
                : isSoftware
                ? "Rejoignez les entreprises qui font confiance à IBIG pour leurs outils de gestion. Installation rapide."
                : isCourse
                ? "Rejoignez des milliers de professionnels déjà certifiés avec IBIG. Formation à votre rythme, certificat reconnu."
                : "Contactez-nous dès maintenant pour bénéficier de cette offre. Notre équipe est disponible pour vous accompagner."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-extrabold shadow-2xl hover:shadow-xl transition-all hover:-translate-y-0.5 hover:scale-105"
                style={{ color: theme.accentDark }}
              >
                <span className="text-base">{isService ? "💬" : isCourse ? "🎓" : "🚀"}</span>
                {ctaLabel}
                <span>→</span>
              </a>
              {product.siteUrl && (
                <a
                  href={product.siteUrl.startsWith("http") ? product.siteUrl : `https://${product.siteUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/15 border border-white/30 px-8 py-4 text-sm font-bold text-white hover:bg-white/25 transition"
                >
                  🔗 Voir l&apos;offre
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── REJOINDRE IBIG ──────────────────────────────────── */}
        <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 overflow-hidden">
          <div className="px-2 py-2 bg-amber-400 text-center">
            <p className="text-xs font-extrabold uppercase tracking-widest text-amber-900">💼 Opportunité partenaire</p>
          </div>
          <div className="p-7">
            <div className="flex items-start gap-4">
              <div className="text-5xl shrink-0">🤝</div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-extrabold text-amber-900">Vous aussi, devenez Partenaire IBIG !</h3>
                  <p className="text-sm text-amber-800 leading-relaxed mt-1">
                    Recommandez ce produit autour de vous et touchez des commissions sur chaque vente. Inscription gratuite, aucun stock, aucun risque.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {[
                    { icon: "💰", text: "Commissions jusqu'à 15 % / vente" },
                    { icon: "🌐", text: "Réseau multi-niveaux N1, N2, N3" },
                    { icon: "📊", text: "Dashboard & liens personnalisés" },
                    { icon: "🎓", text: "Accès à tout le catalogue IBIG" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 rounded-xl bg-white border border-amber-100 px-3 py-2.5 shadow-sm">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-xs font-bold text-amber-900">{item.text}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
                  <a
                    href={`/rejoindre${affCode ? `?ref=${affCode}&` : "?"}product=${encodeURIComponent(product.name)}`}
                    className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 transition-all hover:-translate-y-0.5 shadow-lg px-6 py-3 text-sm font-extrabold text-white"
                  >
                    🚀 Rejoindre gratuitement →
                  </a>
                  {partnerName && (
                    <p className="text-xs text-amber-700 font-medium">Votre parrain : <strong>{partnerName}</strong></p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-slate-200 text-xs text-slate-400">
          <Link href="/" className="font-semibold text-slate-500 hover:underline">IBIG PARTNERS — Réseau d&apos;affiliation professionnel</Link>
          {affCode && <span className="rounded-full bg-slate-100 px-3 py-1 font-mono">ref : {affCode}</span>}
        </div>

      </main>
    </div>
  );
}

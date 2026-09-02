import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fcfa } from "@/lib/format";
import type { Metadata } from "next";
import { SetRefCookie } from "./set-ref-cookie";
import { ShareButtons } from "./share-buttons";

export const dynamic = "force-dynamic";

// ── OG metadata ──────────────────────────────────────────────────────────────
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

// ── Constantes ───────────────────────────────────────────────────────────────
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

// Couleurs par slug de branche (couvre toutes les branches actuelles)
const BRANCH_THEME: Record<string, { gradient: string; accent: string; light: string; emoji: string }> = {
  "ibig-eduform":        { gradient: "from-blue-600 via-indigo-600 to-blue-800",   accent: "#3b82f6", light: "#eff6ff", emoji: "🎓" },
  "ibig-soft":           { gradient: "from-violet-600 via-purple-600 to-violet-800", accent: "#7c3aed", light: "#f5f3ff", emoji: "⚙️" },
  "ibig-immo-trust":     { gradient: "from-amber-500 via-orange-500 to-amber-700",  accent: "#f59e0b", light: "#fffbeb", emoji: "🏠" },
  "ibig-digital":        { gradient: "from-cyan-600 via-sky-600 to-cyan-800",       accent: "#0891b2", light: "#ecfeff", emoji: "💻" },
  "ibig-digital-kits":   { gradient: "from-teal-600 via-emerald-600 to-teal-800",   accent: "#0d9488", light: "#f0fdfa", emoji: "🔧" },
  "ibig-conseil-plus":   { gradient: "from-slate-700 via-slate-600 to-slate-900",   accent: "#475569", light: "#f8fafc", emoji: "📋" },
  "ibig-market":         { gradient: "from-rose-500 via-pink-500 to-rose-700",      accent: "#f43f5e", light: "#fff1f2", emoji: "🛒" },
  "ibig-multiservices":  { gradient: "from-orange-500 via-amber-500 to-orange-700", accent: "#f97316", light: "#fff7ed", emoji: "🛠️" },
  "ibig-financement":    { gradient: "from-emerald-600 via-green-600 to-emerald-800", accent: "#059669", light: "#ecfdf5", emoji: "💰" },
  "ibig-emploi-talents": { gradient: "from-fuchsia-600 via-purple-600 to-fuchsia-800", accent: "#a21caf", light: "#fdf4ff", emoji: "👥" },
};

const DEFAULT_THEME = { gradient: "from-slate-700 via-slate-600 to-slate-900", accent: "#475569", light: "#f8fafc", emoji: "📦" };

function getTheme(branchId: string) {
  // Recherche exacte puis partielle
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

// Extrait des points clés depuis la description quand pas de marketing enrichi
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

  // Tracking affilié
  let partnerName: string | null = null;
  const affCodeRaw = ref?.toUpperCase() ?? null;
  if (affCodeRaw) {
    const partner = await prisma.user.findFirst({
      where: { code: affCodeRaw, active: true, approved: true },
    });
    if (partner) {
      partnerName = `${partner.firstName} ${partner.lastName}`;
      // Cookie posé côté client via SetRefCookie (cookies() interdit en Server Component)
    }
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

  // Textes contextuels
  const aboutLabel = isCourse ? "À propos de cette formation"
    : isSoftware ? "À propos de ce logiciel"
    : isService  ? "À propos de cette prestation"
    : "À propos de cette offre";

  const ctaLabel = isService ? "Demander un devis gratuit"
    : isSoftware  ? "S'abonner maintenant"
    : isCourse    ? "Je m'inscris maintenant"
    : "Commander maintenant";

  const ctaBottomTitle = isService ? "Intéressé ? Parlons de votre projet"
    : isSoftware  ? "Prêt à digitaliser votre activité ?"
    : isCourse    ? "Prêt à vous former ?"
    : "Intéressé par cette offre ?";

  const ctaBottomDesc = isService
    ? "Notre équipe vous contacte sous 24h pour cadrer votre besoin et établir un devis gratuit."
    : isSoftware
    ? "Rejoignez les entreprises qui font confiance à IBIG pour leurs outils de gestion."
    : isCourse
    ? "Rejoignez des milliers de professionnels déjà certifiés avec IBIG."
    : "Contactez-nous pour en savoir plus sur cette offre.";

  const hasMarketing = (md.bullets?.filter(Boolean).length ?? 0) > 0;
  const bullets      = hasMarketing
    ? md.bullets!.filter(Boolean)
    : product.description ? extractBullets(product.description) : [];
  const audience  = md.audience || "";
  const includes  = md.includes?.filter(Boolean) ?? [];
  const imageUrl  = md.imageUrl || "";
  const tagline   = md.tagline || "";

  const badges = [
    { icon: "💬", label: isSoftware ? "Support technique" : "Support client",   always: true },
    { icon: "📱", label: "Accès multi-device",    always: true },
    { icon: "🔄", label: "Mises à jour incluses", show: isSoftware },
    { icon: "🏆", label: "Certificat délivré",    show: isCourse },
    { icon: "♾️", label: "Replay inclus",          show: isCourse },
    { icon: "📋", label: "Devis gratuit",          show: isService && !isCourse && !isSoftware },
    { icon: "🎯", label: "Sur mesure",             show: isService && !isCourse && !isSoftware },
  ].filter(g => g.always || g.show);

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      {affCode && <SetRefCookie code={affCode} />}

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <header className={`relative bg-gradient-to-br ${theme.gradient} overflow-hidden`}>
        {/* Déco fond */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10" style={{ background: "white" }} />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full opacity-10" style={{ background: "white" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5" style={{ background: "white" }} />
        </div>

        <div className="relative mx-auto max-w-3xl px-5 pt-12 pb-14">
          {/* Fil d'ariane */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/15 text-white/90">
              {theme.emoji} {product.branch.name}
            </span>
            <span className="text-white/40">›</span>
            <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 text-white/70">
              {PRICING_LABEL[product.pricingType] ?? product.pricingType}
            </span>
          </div>

          {/* Titre */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
            {product.name}
          </h1>

          {/* Tagline */}
          {tagline && (
            <p className="mt-4 text-lg text-white/85 font-medium leading-relaxed max-w-xl">{tagline}</p>
          )}
          {!tagline && product.description && (
            <p className="mt-4 text-base text-white/75 leading-relaxed max-w-xl line-clamp-2">{product.description}</p>
          )}

          {/* Badge parrain */}
          {partnerName && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white/15 border border-white/20 px-4 py-2">
              <span className="text-white/70 text-xs">Partagé par</span>
              <span className="text-white font-bold text-sm">{partnerName}</span>
              <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full">Partenaire IBIG</span>
            </div>
          )}

          {/* Prix + CTA dans le hero */}
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="rounded-2xl bg-white/15 border border-white/20 px-6 py-4 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Prix</p>
              <p className="text-3xl font-extrabold text-white">{priceDisplay}</p>
              {isService && <p className="text-xs text-white/60 mt-0.5">Devis gratuit · Réponse sous 24h</p>}
            </div>
            <div className="flex flex-col gap-2.5">
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-extrabold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                style={{ color: theme.accent }}
              >
                {ctaLabel} →
              </a>
              {product.siteUrl && (
                <a
                  href={product.siteUrl.startsWith("http") ? product.siteUrl : `https://${product.siteUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/15 border border-white/30 px-7 py-3 text-sm font-bold text-white hover:bg-white/25 transition"
                >
                  🔗 Détails de l&apos;offre
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── CORPS ─────────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-3xl px-4 py-10 space-y-6">

        {/* Image produit */}
        {imageUrl && (
          <div className="rounded-3xl overflow-hidden shadow-md border border-white max-h-72">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="rounded-3xl bg-white shadow-sm border border-slate-100 p-7">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{isCourse ? "🎓" : isSoftware ? "⚙️" : isService ? "🤝" : "📦"}</span>
              <h2 className="text-base font-extrabold text-slate-900">{aboutLabel}</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Points clés */}
        {bullets.length > 0 && (
          <div className="rounded-3xl bg-white shadow-sm border border-slate-100 p-7">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">✨</span>
              <h2 className="text-base font-extrabold text-slate-900">Points clés</h2>
            </div>
            <ul className="space-y-3">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold"
                    style={{ background: theme.accent }}
                  >
                    ✓
                  </span>
                  <span className="text-sm text-slate-700 leading-relaxed">{b.trim().replace(/\.$/, "")}.</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tableau des tarifs — formations uniquement */}
        {isCourse && (
          <div className="rounded-3xl bg-white shadow-sm border border-slate-100 p-7">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">💰</span>
              <h2 className="text-base font-extrabold text-slate-900">Tarifs & Modalités</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 pr-4 text-xs font-bold uppercase tracking-wide text-slate-400">Modalité</th>
                    <th className="text-right py-2 px-3 text-xs font-bold uppercase tracking-wide text-slate-400">Par personne</th>
                    <th className="text-right py-2 pl-3 text-xs font-bold uppercase tracking-wide text-slate-400">Économie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(() => {
                    const r5 = (x: number) => Math.round(x / 5000) * 5000;
                    return [
                      { icon: "🖥️", label: "E-learning (accès à vie, sans formateur)", perPerson: r5(product.price * 0.50), tag: "Meilleur prix" },
                      { icon: "💻", label: "En ligne — individuel (avec formateur)", perPerson: product.price, tag: null },
                      { icon: "🏛️", label: "En présentiel — individuel", perPerson: r5(product.price * 16000 / 11250), tag: null },
                      { icon: "👥", label: "Groupe 3–5 pers (en ligne, / pers)", perPerson: r5(product.price * 0.85), tag: "-15% / pers" },
                      { icon: "👥", label: "Groupe 6–9 pers (en ligne, / pers)", perPerson: r5(product.price * 0.75), tag: "-25% / pers" },
                    ];
                  })().map((row) => (
                    <tr key={row.label} className="hover:bg-slate-50 transition">
                      <td className="py-3 pr-4 text-slate-700">
                        <span className="mr-2">{row.icon}</span>
                        {row.label}
                        {row.tag && row.tag === "Meilleur prix" && (
                          <span className="ml-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: theme.accent }}>{row.tag}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {row.perPerson.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="py-3 pl-3 text-right text-xs text-slate-400">
                        {row.perPerson < product.price
                          ? <span className="text-emerald-600 font-semibold">−{((1 - row.perPerson / product.price) * 100).toFixed(0)}%</span>
                          : row.perPerson > product.price
                          ? <span className="text-slate-400">+{(((row.perPerson / product.price) - 1) * 100).toFixed(0)}%</span>
                          : <span className="text-slate-400">—</span>}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t border-slate-200">
                    <td className="py-3 pr-4 text-slate-700">
                      <span className="mr-2">🏢</span>Groupe 10+ pers (intra-entreprise)
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-500 italic">Sur devis</td>
                    <td className="py-3 pl-3 text-right text-xs text-emerald-600 font-semibold">Meilleur tarif</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-slate-400 italic">* Tarifs indicatifs. Contactez-nous pour un devis personnalisé selon vos besoins.</p>
          </div>
        )}

        {/* Badges garanties */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {badges.map(g => (
            <div
              key={g.label}
              className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 text-center flex flex-col items-center gap-2"
            >
              <span className="text-2xl">{g.icon}</span>
              <span className="text-[11px] font-bold text-slate-600 leading-tight">{g.label}</span>
            </div>
          ))}
        </div>

        {/* Public cible */}
        {audience && (
          <div className="rounded-3xl bg-white shadow-sm border border-slate-100 p-7">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🎯</span>
              <h2 className="text-base font-extrabold text-slate-900">Pour qui ?</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{audience}</p>
          </div>
        )}

        {/* Ce qui est inclus */}
        {includes.length > 0 && (
          <div className="rounded-3xl bg-white shadow-sm border border-slate-100 p-7">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">📦</span>
              <h2 className="text-base font-extrabold text-slate-900">Ce qui est inclus</h2>
            </div>
            <ul className="grid sm:grid-cols-2 gap-3">
              {includes.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 rounded-xl p-3" style={{ background: theme.light }}>
                  <span className="font-bold text-sm shrink-0" style={{ color: theme.accent }}>✓</span>
                  <span className="text-sm text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Partage */}
        <ShareButtons
          url={affCode ? `${baseUrl}/offres/${product.slug}?ref=${affCode}` : `${baseUrl}/offres/${product.slug}`}
          title={product.name}
          description={product.description}
        />

        {/* CTA bas de page */}
        <div className={`rounded-3xl bg-gradient-to-br ${theme.gradient} p-8 text-white relative overflow-hidden`}>
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10" style={{ background: "white" }} />
          <div className="relative text-center space-y-4">
            <p className="text-xl font-extrabold">{ctaBottomTitle}</p>
            <p className="text-sm text-white/80 max-w-md mx-auto leading-relaxed">{ctaBottomDesc}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-extrabold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                style={{ color: theme.accent }}
              >
                {ctaLabel} →
              </a>
              {product.siteUrl && (
                <a
                  href={product.siteUrl.startsWith("http") ? product.siteUrl : `https://${product.siteUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/15 border border-white/30 px-7 py-3.5 text-sm font-bold text-white hover:bg-white/25 transition"
                >
                  🔗 Détails de l&apos;offre
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Rejoindre IBIG Partners ── */}
        <div className="rounded-3xl border-2 border-dashed border-amber-300 bg-amber-50 p-7">
          <div className="flex items-start gap-4">
            <div className="text-4xl shrink-0">🤝</div>
            <div className="flex-1 space-y-3">
              <h3 className="text-base font-extrabold text-amber-900">Vous aussi, devenez Partenaire IBIG !</h3>
              <p className="text-sm text-amber-800 leading-relaxed">
                En rejoignant le réseau IBIG PARTNERS, vous touchez des commissions sur chaque produit ou service vendu grâce à votre réseau. Inscription gratuite, aucun stock, aucun risque.
              </p>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm text-amber-800">
                {[
                  "Commissions allant jusqu'à 15 % par vente",
                  "Réseau multi-niveaux (N1, N2, N3)",
                  "Accès à tout le catalogue IBIG",
                  "Tableau de bord, liens personnalisés, QR codes",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold shrink-0">✓</span> {item}
                  </li>
                ))}
              </ul>
              <div className="pt-1">
                <a
                  href={`/rejoindre${affCode ? `?ref=${affCode}&` : "?"}product=${encodeURIComponent(product.name)}`}
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 transition-colors px-6 py-3 text-sm font-extrabold text-white shadow"
                >
                  Rejoindre IBIG Partners gratuitement →
                </a>
                {partnerName && (
                  <p className="mt-2 text-xs text-amber-700">Votre parrain sera : <strong>{partnerName}</strong></p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <Link href="/" className="font-semibold text-slate-500 hover:underline">IBIG PARTNERS — Réseau d&apos;affiliation professionnel</Link>
          {affCode && <span className="rounded-full bg-slate-100 px-3 py-1 font-mono">ref : {affCode}</span>}
        </div>
      </main>
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fcfa } from "@/lib/format";

export const dynamic = "force-dynamic";

const PRICING_LABEL: Record<string, string> = {
  MONTHLY_SUB: "Abonnement mensuel",
  ANNUAL_SUB:  "Abonnement annuel",
  COURSE:      "Formation",
  SERVICE:     "Service / Sur devis",
  PRODUCT:     "Produit",
};

const PRICING_SUFFIX: Record<string, string> = {
  MONTHLY_SUB: "/mois",
  ANNUAL_SUB:  "/an",
};

const BRANCH_EMOJI: Record<string, string> = {
  "IBIG EDUFORM":   "🎓",
  "IBIG DIGITAL":   "💻",
  "IBIG IMMO":      "🏢",
  "IBIG SANTE":     "⚕️",
  "IBIG FINANCE":   "💰",
  "IBIG AGRI":      "🌿",
};

function getBranchColor(branchName: string) {
  const map: Record<string, string> = {
    "IBIG EDUFORM":  "from-blue-600 to-indigo-700",
    "IBIG DIGITAL":  "from-violet-600 to-purple-700",
    "IBIG IMMO":     "from-amber-600 to-orange-700",
    "IBIG SANTE":    "from-emerald-600 to-teal-700",
    "IBIG FINANCE":  "from-green-600 to-emerald-700",
    "IBIG AGRI":     "from-lime-600 to-green-700",
  };
  for (const [k, v] of Object.entries(map)) {
    if (branchName.includes(k.replace("IBIG ", ""))) return v;
  }
  return "from-slate-700 to-slate-900";
}

function parseDescriptionBullets(description: string): string[] {
  return description.split(/\.\s+/).filter(s => s.trim().length > 10).slice(0, 6);
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

  const product = await prisma.product.findUnique({
    where: { slug, active: true },
    include: { branch: true },
  });

  if (!product) notFound();

  // Vérifie que le code affilié existe si fourni
  let partnerName: string | null = null;
  if (ref) {
    const partner = await prisma.user.findFirst({
      where: { code: ref.toUpperCase(), active: true, approved: true },
    });
    if (partner) {
      partnerName = `${partner.firstName} ${partner.lastName}`;
    }
  }

  const baseUrl    = process.env.NEXT_PUBLIC_SITE_URL || "https://ibigpartners.com";
  const affCode    = ref?.toUpperCase() ?? null;
  const ctaHref    = affCode
    ? `${baseUrl}/aff/${affCode}?p=${product.slug}`
    : product.siteUrl ?? `${baseUrl}/rejoindre`;

  const suffix     = PRICING_SUFFIX[product.pricingType] ?? "";
  const priceDisplay = product.price > 0
    ? `${fcfa(product.price)}${suffix}`
    : "Sur devis";
  const isService  = product.pricingType === "SERVICE" || product.price === 0;
  const emoji      = BRANCH_EMOJI[product.branch.name] ?? "📦";
  const gradient   = getBranchColor(product.branch.name);
  const bullets    = parseDescriptionBullets(product.description ?? "");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header bandeau ── */}
      <header className={`bg-gradient-to-br ${gradient} text-white`}>
        <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/60">
              {product.branch.name}
            </span>
            <span className="text-white/40">·</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-white/60">
              {PRICING_LABEL[product.pricingType]}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
            {emoji} {product.name}
          </h1>
          {partnerName && (
            <p className="mt-3 text-sm text-white/70">
              Offre partagée par <strong className="text-white">{partnerName}</strong> — Partenaire IBIG
            </p>
          )}
        </div>
      </header>

      {/* ── Corps ── */}
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">

        {/* Prix + CTA principal */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Prix</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">
                {priceDisplay}
              </p>
              {isService && (
                <p className="text-xs text-slate-500 mt-1">
                  Devis gratuit · Réponse sous 24h
                </p>
              )}
            </div>
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white bg-gradient-to-r ${gradient} shadow-md hover:opacity-90 transition-opacity`}
            >
              {isService ? "Demander un devis gratuit" : "Je m'inscris maintenant"}
              <span>→</span>
            </a>
          </div>
        </div>

        {/* Description complète */}
        {product.description && (
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">À propos de cette formation</h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              {product.description}
            </p>
          </div>
        )}

        {/* Points clés extraits */}
        {bullets.length > 0 && (
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-3">
            <h2 className="text-base font-bold text-slate-900">Points clés</h2>
            <ul className="space-y-2">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-0.5 text-emerald-500 font-bold shrink-0">✓</span>
                  <span>{b.trim().replace(/\.$/, "")}.</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Garanties / Avantages */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: "🏆", label: "Certificat inclus" },
            { icon: "💬", label: "Support formateur" },
            { icon: "📱", label: "Accès mobile" },
            { icon: "♾️", label: "Replay inclus" },
          ].map((g) => (
            <div key={g.label} className="rounded-xl bg-white border border-slate-200 p-3 text-center shadow-sm">
              <div className="text-2xl">{g.icon}</div>
              <div className="text-xs font-semibold text-slate-600 mt-1">{g.label}</div>
            </div>
          ))}
        </div>

        {/* CTA bas de page */}
        <div className={`rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white text-center space-y-3`}>
          <p className="text-lg font-bold">
            {isService ? "Intéressé ? Parlons de votre projet" : "Prêt à vous former ?"}
          </p>
          <p className="text-sm text-white/80">
            {isService
              ? "Notre équipe vous contacte sous 24h pour cadrer votre besoin et établir un devis gratuit."
              : "Rejoignez des milliers de professionnels déjà certifiés avec IBIG."}
          </p>
          <a
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow hover:bg-slate-100 transition-colors"
          >
            {isService ? "Demander un devis gratuit" : "S'inscrire maintenant"}
            <span>→</span>
          </a>
        </div>

        {/* Lien vers le site officiel */}
        {product.siteUrl && (
          <p className="text-center text-xs text-slate-500">
            Plus d'informations sur{" "}
            <a
              href={product.siteUrl.startsWith("http") ? product.siteUrl : `https://${product.siteUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:underline"
            >
              {product.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            </a>
          </p>
        )}

        {/* Footer IBIG */}
        <div className="border-t border-slate-200 pt-4 text-center text-xs text-slate-400 space-y-1">
          <p>
            <Link href="/" className="font-semibold text-slate-600 hover:underline">IBIG PARTNERS</Link>
            {" "}— Réseau d'affiliation professionnel
          </p>
          {affCode && (
            <p>Partenaire affilié : {affCode}</p>
          )}
        </div>
      </main>
    </div>
  );
}

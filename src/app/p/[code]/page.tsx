import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fcfa } from "@/lib/format";
import { SiteFooter } from "@/components/site-chrome";
import { STATUS_LABELS, PRICING_TYPE_LABELS } from "@/lib/constants";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const partner = await prisma.user.findFirst({ where: { code: code.toUpperCase() } });
  if (!partner) return { title: "Partenaire introuvable" };
  return {
    title: `${partner.firstName} ${partner.lastName} — Partenaire officiel IBIG PARTNERS`,
    description: `Découvrez les produits IBIG PARTNERS présentés par ${partner.firstName} ${partner.lastName}, partenaire officiel. Commissions attractives sur 3 niveaux. Rejoignez le réseau gratuitement.`,
  };
}

const STATUS_BADGE_COLORS: Record<string, string> = {
  STARTER: "bg-slate-100 text-slate-700",
  SILVER:  "bg-slate-200 text-slate-800",
  GOLD:    "bg-amber-100 text-amber-800",
  MASTER:  "bg-brand-100 text-brand-800",
  ELITE:   "bg-yellow-100 text-yellow-800",
};

const PRICING_BADGE_COLORS: Record<string, string> = {
  MONTHLY_SUB: "bg-brand-50 text-brand-700",
  ANNUAL_SUB:  "bg-emerald-50 text-emerald-700",
  COURSE:      "bg-amber-50 text-amber-700",
  SERVICE:     "bg-violet-50 text-violet-700",
  PRODUCT:     "bg-slate-100 text-slate-700",
};

const BRANCH_GRADIENTS = [
  "from-brand-500 to-brand-700",
  "from-violet-500 to-purple-700",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-indigo-500 to-blue-700",
  "from-teal-500 to-cyan-600",
];

export default async function PartnerLandingPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const partner = await prisma.user.findFirst({
    where: { code: code.toUpperCase(), approved: true, active: true },
    include: {
      links: {
        include: { product: { include: { branch: true } } },
        where: { product: { active: true } },
      },
      _count: { select: { referrals: true, sales: true } },
    },
  });

  if (!partner) notFound();

  // Regrouper par branche
  const byBranch: Record<string, { branchName: string; links: typeof partner.links; idx: number }> = {};
  let branchIdx = 0;
  for (const l of partner.links) {
    const bid = l.product.branchId;
    if (!byBranch[bid]) {
      byBranch[bid] = { branchName: l.product.branch.name, links: [], idx: branchIdx++ };
    }
    byBranch[bid].links.push(l);
  }

  const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const initials = `${partner.firstName[0]}${partner.lastName[0]}`.toUpperCase();
  const statusBadge = STATUS_BADGE_COLORS[partner.status] ?? STATUS_BADGE_COLORS.STARTER;
  const totalProducts = partner.links.length;

  return (
    <>
      {/* Mini-header léger */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-extrabold text-xs shadow-sm">
              iB
            </span>
            <span className="font-extrabold tracking-tight text-ink">
              IBIG <span className="text-brand-500">PARTNERS</span>
            </span>
          </Link>
          <span className="hidden text-xs font-medium text-slate-500 sm:block">
            Partenaire officiel
          </span>
          <Link
            href={`/rejoindre?ref=${partner.code}`}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors shadow-sm"
          >
            Rejoindre →
          </Link>
        </div>
      </header>

      <main className="min-h-screen bg-slate-50">

        {/* ═══════════ HERO ═══════════ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 py-16 text-white">
          {/* Décor de fond */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5" />
            <div className="absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-white/5" />
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          </div>

          <div className="relative mx-auto max-w-4xl px-4 text-center">
            {/* Avatar initiales */}
            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-white/15 text-4xl font-extrabold tracking-tight shadow-xl ring-4 ring-white/20">
              {initials}
            </div>

            <h1 className="text-3xl font-extrabold sm:text-4xl">
              {partner.firstName} {partner.lastName}
            </h1>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadge}`}>
                {STATUS_LABELS[partner.status] ?? partner.status}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-mono text-brand-200">
                Code : {partner.code}
              </span>
            </div>

            {/* Stats */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-extrabold text-gold-400">{partner._count.sales}</span>
                <span className="mt-1 text-xs text-brand-200">Ventes réalisées</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="flex flex-col items-center">
                <span className="text-3xl font-extrabold text-gold-400">{partner._count.referrals}</span>
                <span className="mt-1 text-xs text-brand-200">Partenaires filleuls</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="flex flex-col items-center">
                <span className="text-3xl font-extrabold text-gold-400">{totalProducts}</span>
                <span className="mt-1 text-xs text-brand-200">Produits disponibles</span>
              </div>
            </div>

            {/* CTA principal */}
            <div className="mt-8">
              <Link
                href={`/rejoindre?ref=${partner.code}`}
                className="inline-block rounded-xl bg-white px-8 py-4 text-lg font-bold text-brand-700 shadow-xl transition-all duration-200 hover:-translate-y-1 hover:bg-brand-50 hover:shadow-2xl"
              >
                Devenir partenaire via {partner.firstName} →
              </Link>
              <p className="mt-3 text-xs text-brand-300">Inscription 100% gratuite — sans engagement</p>
            </div>
          </div>
        </section>

        {/* ═══════════ PRODUITS ═══════════ */}
        <section className="mx-auto max-w-5xl px-4 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
              Produits disponibles via ce partenaire
            </h2>
            <p className="mt-2 text-muted">
              Commandez directement — {partner.firstName} vous accompagne dans votre démarche.
            </p>
          </div>

          {Object.keys(byBranch).length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-muted">
              <p className="text-lg font-semibold">Ce partenaire n&apos;a pas encore activé de produits.</p>
              <p className="mt-2 text-sm">Revenez bientôt ou contactez directement {partner.firstName}.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(byBranch).map(([bid, { branchName, links, idx }]) => {
                const grad = BRANCH_GRADIENTS[idx % BRANCH_GRADIENTS.length];
                return (
                  <div key={bid}>
                    {/* En-tête branche */}
                    <div className={`mb-4 flex items-center gap-3 rounded-xl bg-gradient-to-r ${grad} px-5 py-3 text-white`}>
                      <span className="h-2 w-2 rounded-full bg-white/60" />
                      <h3 className="font-bold tracking-wide">{branchName}</h3>
                    </div>

                    {/* Grille de produits */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {links.map((l) => (
                        <div key={l.id} className="card-premium flex flex-col gap-0 overflow-hidden p-0">
                          <div className="flex flex-1 flex-col p-5">
                            {/* Badge type */}
                            <span className={`self-start rounded-full px-2.5 py-0.5 text-xs font-semibold ${PRICING_BADGE_COLORS[l.product.pricingType] ?? "bg-slate-100 text-slate-700"}`}>
                              {PRICING_TYPE_LABELS[l.product.pricingType] ?? l.product.pricingType}
                            </span>

                            {/* Nom produit */}
                            <h4 className="mt-3 font-extrabold text-ink leading-tight">{l.product.name}</h4>

                            {/* Description */}
                            {l.product.description && (
                              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted line-clamp-3">
                                {l.product.description}
                              </p>
                            )}

                            {/* Prix */}
                            <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-3">
                              <div>
                                <p className="text-xs text-muted">Prix</p>
                                <p className="text-xl font-extrabold text-ink">{fcfa(l.product.price)}</p>
                              </div>
                              <a
                                href={`${SITE}/paiement/${l.product.slug}?ref=${partner.code}`}
                                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-700 shadow-sm"
                              >
                                Commander →
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ═══════════ POURQUOI REJOINDRE ═══════════ */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-5xl px-4">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
                Pourquoi rejoindre IBIG PARTNERS ?
              </h2>
              <p className="mt-2 text-muted">Trois bonnes raisons de franchir le pas dès aujourd&apos;hui.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  icon: "💰",
                  title: "Commission jusqu'à 50%",
                  desc: "Touchez jusqu'à 50% de commission sur vos ventes directes (Mois 1), avec des bonus de statut qui augmentent vos taux.",
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
                {
                  icon: "🌐",
                  title: "Réseau sur 3 niveaux",
                  desc: "Gagnez aussi sur les ventes de vos filleuls N1, N2 et N3. Plus votre équipe grossit, plus vos revenus passifs augmentent.",
                  color: "text-brand-600",
                  bg: "bg-brand-50",
                },
                {
                  icon: "⚡",
                  title: "Paiement sous 7 jours",
                  desc: "Vos commissions sont validées sous 7 jours ouvrables et versées via Orange Money, Wave, MTN MoMo ou virement bancaire.",
                  color: "text-amber-600",
                  bg: "bg-amber-50",
                },
              ].map((arg) => (
                <div key={arg.title} className="card-premium p-6 text-center">
                  <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${arg.bg} text-3xl`}>
                    {arg.icon}
                  </div>
                  <h3 className={`font-extrabold ${arg.color}`}>{arg.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{arg.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ CTA REJOINDRE ═══════════ */}
        <section className="bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 py-16 text-white">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">
              Parrainage par {partner.firstName} {partner.lastName}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              Prêt à rejoindre le réseau ?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-brand-100">
              Inscription 100% gratuite. Aucun investissement. Commencez à générer
              des revenus en promouvant les produits IBIG dès aujourd&apos;hui.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href={`/rejoindre?ref=${partner.code}`}
                className="rounded-xl bg-white px-8 py-4 text-lg font-bold text-brand-700 shadow-xl transition-all duration-200 hover:-translate-y-1 hover:bg-brand-50"
              >
                Créer mon compte — Gratuit
              </Link>
              <Link
                href="/"
                className="rounded-xl border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-white/10"
              >
                En savoir plus
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-brand-200">
              {["Sans engagement", "Aucune carte bancaire requise", "Activez vos produits en 2 minutes"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <span className="text-gold-400">✓</span> {t}
                </span>
              ))}
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}

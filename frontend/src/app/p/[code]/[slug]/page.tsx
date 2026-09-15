import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fcfa } from "@/lib/format";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params }: { params: Promise<{ code: string; slug: string }> }
): Promise<Metadata> {
  const { code, slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ibigpartners.com";

  const partner = await prisma.user.findFirst({
    where: { code, active: true, approved: true },
    select: { firstName: true, lastName: true },
  });
  const product = await (prisma as any).product.findFirst({
    where: { slug, active: true },
    select: { name: true, description: true },
  });
  if (!partner || !product) return { title: "Offre IBIG PARTNERS" };

  const title = `${product.name} — présenté par ${partner.firstName} ${partner.lastName}`;
  return {
    title,
    description: product.description?.slice(0, 160),
    openGraph: {
      title,
      images: [{ url: `${baseUrl}/offres/${slug}/opengraph-image`, width: 1200, height: 630 }],
    },
  };
}

export default async function PersonalLandingPage(
  { params }: { params: Promise<{ code: string; slug: string }> }
) {
  const { code, slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ibigpartners.com";

  const [partner, product] = await Promise.all([
    prisma.user.findFirst({
      where: { code, active: true, approved: true },
      select: {
        id: true, firstName: true, lastName: true, code: true,
        bio: true, photoUrl: true, city: true, status: true, createdAt: true,
      },
    }),
    (prisma as any).product.findFirst({
      where: { slug, active: true },
      include: { branch: true },
    }),
  ]);

  if (!partner || !product) notFound();

  const salesCount = await prisma.sale.count({
    where: { sellerId: partner.id, status: "CONFIRMED" },
  });

  const affiliateLink = `${baseUrl}/aff/${code}?p=${slug}`;
  const offreUrl      = `${baseUrl}/offres/${slug}?ref=${code}`;

  const price: number = product.price ?? 0;
  const pricingType: string = product.pricingType ?? "";
  const priceSuffix = pricingType === "MONTHLY_SUB" ? "/mois" : pricingType === "ANNUAL_SUB" ? "/an" : "";
  const priceDisplay = price > 0 ? `${fcfa(price)}${priceSuffix}` : "Sur devis";

  let tagline = "";
  try {
    if (product.marketingData) {
      const md = JSON.parse(product.marketingData);
      tagline = md.tagline ?? "";
    }
  } catch { /* */ }

  const STATUS_BADGE: Record<string, string> = {
    STARTER: "🌱 Starter",
    SILVER:  "🥈 Silver",
    GOLD:    "🥇 Gold",
    MASTER:  "💎 Master",
    ELITE:   "🚀 Elite",
  };

  const joinYear = new Date(partner.createdAt).getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header IBIG */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-sm font-bold text-blue-700">IBIG PARTNERS</Link>
          <Link
            href={offreUrl}
            className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
          >
            Voir l'offre complète
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* Carte partenaire */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 flex items-start gap-5">
          {partner.photoUrl ? (
            <img
              src={partner.photoUrl}
              alt={`${partner.firstName} ${partner.lastName}`}
              className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-100"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0">
              <span className="text-3xl font-black text-white">{partner.firstName[0]}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-slate-900">
                {partner.firstName} {partner.lastName}
              </h1>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                {STATUS_BADGE[partner.status] ?? partner.status}
              </span>
            </div>
            {partner.city && (
              <p className="text-xs text-slate-500 mt-0.5">📍 {partner.city}</p>
            )}
            {partner.bio && (
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{partner.bio}</p>
            )}
            <div className="flex gap-4 mt-3">
              <div className="text-center">
                <p className="text-lg font-black text-slate-900">{salesCount}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Ventes</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-slate-900">{joinYear}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Depuis</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-slate-900 truncate max-w-[80px]">{partner.code}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Code</p>
              </div>
            </div>
          </div>
        </div>

        {/* Produit */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200 mb-1">
              {product.branch?.name ?? "IBIG PARTNERS"}
            </p>
            <h2 className="text-2xl font-black text-white leading-tight">{product.name}</h2>
            {tagline && <p className="text-sm text-blue-100 mt-1">{tagline}</p>}
          </div>
          <div className="p-6 space-y-4">
            {product.description && (
              <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
            )}
            <div className="flex items-center justify-between py-3 border-y border-slate-100">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Prix</span>
              <span className="text-xl font-black text-slate-900">{priceDisplay}</span>
            </div>

            {/* CTA principal */}
            <a
              href={offreUrl}
              className="block w-full rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-4 text-center text-base font-black text-white shadow-lg hover:shadow-xl transition"
            >
              🚀 Je veux ce produit
            </a>
            <p className="text-center text-[10px] text-slate-400">
              En cliquant, vous serez redirigé vers la page officielle IBIG PARTNERS.<br/>
              Votre achat sera attribué à {partner.firstName} {partner.lastName}.
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "🔒", label: "Paiement sécurisé" },
            { icon: "✅", label: "Produit certifié IBIG" },
            { icon: "🤝", label: "Suivi personnalisé" },
          ].map((b) => (
            <div key={b.label} className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
              <p className="text-2xl">{b.icon}</p>
              <p className="text-[10px] font-semibold text-slate-600 mt-1">{b.label}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-400 pb-6">
          Page générée par le partenaire affilié IBIG PARTNERS · {" "}
          <Link href="/offres" className="underline">Voir tous les produits</Link>
          {" · "}
          <Link href="/rejoindre" className="underline">Devenir partenaire</Link>
        </p>
      </main>
    </div>
  );
}

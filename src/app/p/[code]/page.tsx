import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fcfa } from "@/lib/format";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
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
    title: `${partner.firstName} ${partner.lastName} — IBIG PARTNERS`,
    description: `Rejoignez IBIG PARTNERS via le lien de parrainage de ${partner.firstName}. Commissions attractives sur 8 branches de produits.`,
  };
}

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
  const byBranch: Record<string, { branchName: string; links: typeof partner.links }> = {};
  for (const l of partner.links) {
    const bid = l.product.branchId;
    if (!byBranch[bid]) byBranch[bid] = { branchName: l.product.branch.name, links: [] };
    byBranch[bid].links.push(l);
  }

  const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-50">
        {/* Hero partenaire */}
        <section className="bg-white border-b border-slate-100 py-12">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-3xl font-bold text-brand-700">
              {partner.firstName[0]}{partner.lastName[0]}
            </div>
            <h1 className="text-2xl font-bold text-ink">
              {partner.firstName} {partner.lastName}
            </h1>
            <p className="mt-1 text-muted">Partenaire IBIG PARTNERS · {STATUS_LABELS[partner.status]}</p>
            <div className="mt-4 flex justify-center gap-6 text-sm text-muted">
              <span><strong className="text-ink">{partner._count.sales}</strong> ventes</span>
              <span><strong className="text-ink">{partner._count.referrals}</strong> filleuls</span>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-50 px-4 py-2 text-sm text-brand-800">
              🔗 Code partenaire : <strong className="font-mono">{partner.code}</strong>
            </div>
          </div>
        </section>

        {/* Produits affiliés */}
        <section className="mx-auto max-w-3xl px-4 py-12">
          <h2 className="mb-6 text-xl font-bold text-ink">Produits disponibles via ce partenaire</h2>

          {Object.keys(byBranch).length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-muted">
              Ce partenaire n'a pas encore activé de produits.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(byBranch).map(([bid, { branchName, links }]) => (
                <div key={bid}>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{branchName}</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {links.map((l) => (
                      <div key={l.id} className="card flex flex-col gap-3">
                        <div>
                          <p className="font-semibold text-ink">{l.product.name}</p>
                          <p className="text-xs text-muted">{PRICING_TYPE_LABELS[l.product.pricingType]}</p>
                          {l.product.description && (
                            <p className="mt-1 text-sm text-muted line-clamp-2">{l.product.description}</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-ink">{fcfa(l.product.price)}</span>
                          <a
                            href={`${SITE}/aff/${l.code}?p=${l.product.slug}`}
                            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                          >
                            En savoir plus →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA rejoindre */}
          <div className="mt-10 rounded-2xl bg-brand-600 p-8 text-center text-white">
            <h3 className="text-xl font-bold">Devenez partenaire IBIG</h3>
            <p className="mt-2 text-brand-100">
              Rejoignez le réseau et commencez à gagner des commissions sur 8 branches de produits.
            </p>
            <Link
              href={`/rejoindre?ref=${partner.code}`}
              className="mt-5 inline-block rounded-xl bg-white px-8 py-3 font-bold text-brand-700 hover:bg-brand-50"
            >
              Rejoindre via {partner.firstName}
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

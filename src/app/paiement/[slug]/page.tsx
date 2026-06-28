import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fcfa } from "@/lib/format";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import CheckoutForm from "./CheckoutForm";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { branch: true },
  });
  if (!product) return { title: "Produit introuvable" };
  return {
    title: `Payer — ${product.name} | IBIG PARTNERS`,
    description: `Commandez ${product.name} via IBIG PARTNERS. Paiement sécurisé par Moneroo.`,
  };
}

export default async function PaiementPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { slug } = await params;
  const { ref } = await searchParams;

  const product = await prisma.product.findUnique({
    where: { slug, active: true },
    include: { branch: true },
  });

  if (!product) notFound();

  // Charger le partenaire si ref fourni
  const partner = ref
    ? await prisma.user.findFirst({
        where: { code: ref.toUpperCase(), approved: true, active: true },
        select: { code: true, firstName: true, lastName: true },
      })
    : null;

  const partnerCode = partner?.code ?? ref?.toUpperCase() ?? "DIRECT";
  const priceLabel = fcfa(product.price);

  return (
    <>
      <SiteHeader />

      <main className="min-h-[80vh] bg-slate-50 py-12">
        <div className="mx-auto max-w-2xl px-4">

          {/* En-tête page */}
          <div className="mb-8 text-center">
            <span className="inline-block rounded-full bg-brand-100 px-4 py-1 text-xs font-semibold text-brand-700">
              {product.branch.name}
            </span>
            <h1 className="mt-3 text-2xl font-extrabold text-ink sm:text-3xl">
              {product.name}
            </h1>
            {product.description && (
              <p className="mt-2 text-muted leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          {/* Carte principale */}
          <div className="card-premium overflow-hidden">
            {/* Résumé commande */}
            <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                Résumé de la commande
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-ink">{product.name}</p>
                  <p className="text-xs text-muted">
                    {product.branch.name}
                    {partner && (
                      <> · via <span className="font-medium text-brand-600">{partner.firstName} {partner.lastName}</span></>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-brand-600">
                    {priceLabel}
                  </p>
                  <p className="text-xs text-muted">TTC</p>
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <div className="p-6">
              <h2 className="mb-5 font-semibold text-ink">
                Vos coordonnées
              </h2>
              <CheckoutForm
                productSlug={product.slug}
                partnerCode={partnerCode}
                price={product.price}
                priceLabel={priceLabel}
              />
            </div>
          </div>

          {/* Logos modes de paiement */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-muted">
            <span className="rounded-full bg-orange-100 px-3 py-1 font-semibold text-orange-700">Orange Money</span>
            <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700">Wave</span>
            <span className="rounded-full bg-yellow-100 px-3 py-1 font-semibold text-yellow-800">MTN MoMo</span>
            <span className="rounded-full bg-sky-100 px-3 py-1 font-semibold text-sky-700">Moov Money</span>
          </div>

        </div>
      </main>

      <SiteFooter />
    </>
  );
}

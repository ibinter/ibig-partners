import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fcfa } from "@/lib/format";
import CheckoutForm from "./CheckoutForm";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product
    .findUnique({ where: { slug }, include: { branch: true } })
    .catch(() => null);
  if (!product) return { title: "Inscription — IBIG PARTNERS" };
  return {
    title: `S'inscrire — ${product.name} | IBIG PARTNERS`,
    description: `Inscrivez-vous à ${product.name}. Paiement sécurisé, accès immédiat.`,
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

  const product = await prisma.product
    .findUnique({ where: { slug, active: true }, include: { branch: true } })
    .catch((err) => {
      console.error("paiement: base indisponible", err);
      return "DB_ERROR" as const;
    });

  if (product === "DB_ERROR") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">⚠️</div>
          <h1 className="text-xl font-extrabold text-slate-900">Service momentanément indisponible</h1>
          <p className="mt-2 text-sm text-slate-500">Veuillez réessayer dans quelques instants.</p>
          <a
            href={`/paiement/${slug}${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`}
            className="mt-6 inline-block rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700"
          >
            Réessayer
          </a>
        </div>
      </div>
    );
  }

  if (!product) notFound();

  const partner = ref
    ? await prisma.user
        .findFirst({
          where: { code: ref.toUpperCase(), approved: true, active: true },
          select: { code: true, firstName: true, lastName: true },
        })
        .catch(() => null)
    : null;

  const partnerCode = partner?.code ?? ref?.toUpperCase() ?? "DIRECT";
  const priceLabel = fcfa(product.price);

  // URL page formation — utilise siteUrl de la DB directement
  // Ne jamais générer d'URL dynamique : si siteUrl = homepage, pas de lien
  let formationUrl: string | null = null;
  const rawSiteUrl = (product as any).siteUrl as string | null;
  if (rawSiteUrl && rawSiteUrl !== "https://ibig-eduform.com" && rawSiteUrl !== "https://ibig-eduform.com/") {
    const full = rawSiteUrl.startsWith("http") ? rawSiteUrl : `https://${rawSiteUrl}`;
    try {
      const u = new URL(full);
      if (ref) u.searchParams.set("ibig_ref", ref.toUpperCase());
      formationUrl = u.toString();
    } catch {
      formationUrl = full;
    }
  }

  // URL de retour (page offre ou accueil)
  const backUrl = `/offres/${slug}${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

      {/* Barre de navigation minimale */}
      <nav className="flex items-center justify-between px-4 py-4 sm:px-8">
        <a
          href={backUrl}
          className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
        >
          ← Retour
        </a>
        <a href="/" className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-white">IBIG PARTNERS</span>
        </a>
        {partner && (
          <span className="hidden rounded-full bg-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-300 sm:block">
            via {partner.firstName} {partner.lastName}
          </span>
        )}
      </nav>

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">

          {/* ── Colonne gauche : info formation ── */}
          <div className="flex flex-col gap-6">

            {/* Badge branche */}
            <div>
              <span className="inline-block rounded-full bg-brand-500/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-300">
                {product.branch.name}
              </span>
            </div>

            {/* Titre + description */}
            <div>
              <h1 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
                {product.name}
              </h1>
              {product.description && (
                <p className="mt-3 text-sm leading-relaxed text-slate-400 line-clamp-5">
                  {product.description}
                </p>
              )}
              {formationUrl && (
                <a
                  href={formationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-400 hover:text-brand-300 hover:underline"
                >
                  Voir le détail de la formation ↗
                </a>
              )}
            </div>

            {/* Tarif */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Tarif de la formation</p>
              <p className="mt-2 text-4xl font-extrabold text-white">{priceLabel}</p>
              <p className="mt-1 text-xs text-slate-400">TTC · Paiement sécurisé via Moneroo</p>
              <p className="mt-3 text-xs text-slate-400">
                Vous pouvez payer en <span className="font-semibold text-white">1/3, 2/3 ou montant libre</span> (minimum 1/3).
              </p>
            </div>

            {/* Ce que ça inclut */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Ce que vous obtenez</p>
              <ul className="space-y-2 text-sm text-slate-300">
                {[
                  "✅ Inscription confirmée par email immédiatement",
                  "✅ Accès aux supports de cours",
                  "✅ Certificat IBIG EDUFORM à l'issue",
                  "✅ Replay des sessions inclus",
                  "✅ Suivi et accompagnement post-formation",
                  "✅ Paiement Mobile Money ou carte bancaire",
                ].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Modes de paiement */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Orange Money", color: "bg-orange-500/20 text-orange-300" },
                { label: "Wave", color: "bg-blue-500/20 text-blue-300" },
                { label: "MTN MoMo", color: "bg-yellow-500/20 text-yellow-300" },
                { label: "Moov Money", color: "bg-sky-500/20 text-sky-300" },
              ].map((m) => (
                <span key={m.label} className={`rounded-full px-3 py-1 text-xs font-semibold ${m.color}`}>
                  {m.label}
                </span>
              ))}
            </div>
          </div>

          {/* ── Colonne droite : formulaire ── */}
          <div>
            <div className="rounded-2xl bg-white shadow-2xl">
              {/* En-tête formulaire */}
              <div className="border-b border-slate-100 px-6 py-5">
                <h2 className="text-lg font-extrabold text-slate-900">Inscription & Paiement</h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Remplissez vos coordonnées. Vous serez inscrit(e) à la formation et redirigé(e) vers le paiement sécurisé.
                </p>
              </div>

              {/* Récapitulatif commande compact */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-3">
                <div>
                  <p className="text-sm font-bold text-slate-800">{product.name}</p>
                  {partner && (
                    <p className="text-xs text-slate-400">
                      Partagé par <span className="font-medium text-brand-600">{partner.firstName} {partner.lastName}</span>
                    </p>
                  )}
                </div>
                <p className="text-lg font-extrabold text-brand-600">{priceLabel}</p>
              </div>

              {/* Form */}
              <div className="px-6 py-6">
                <CheckoutForm
                  productSlug={product.slug}
                  partnerCode={partnerCode}
                  price={product.price}
                  priceLabel={priceLabel}
                />
              </div>

              {/* Footer sécurité */}
              <div className="border-t border-slate-100 px-6 py-4 text-center">
                <p className="text-xs text-slate-400">
                  🔒 Paiement sécurisé via Moneroo · Vos données sont protégées
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  En vous inscrivant, vous recevrez une confirmation par email avec les détails de votre formation.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

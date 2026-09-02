import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa } from "@/lib/format";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminProduitsPage() {
  await requireAdmin();

  const products = await (prisma as any).product.findMany({
    where: { active: true },
    include: { branch: true },
    orderBy: [{ branch: { name: "asc" } }, { name: "asc" }],
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ibigpartners.com";

  const enriched  = products.filter((p: any) => p.marketingData).length;
  const total     = products.length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pages de présentation produits"
        subtitle={`${enriched}/${total} produits enrichis avec du contenu marketing`}
      />

      {/* Barre de progression */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-500">
          <span>Enrichissement global</span>
          <span>{Math.round((enriched / Math.max(total, 1)) * 100)} %</span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
            style={{ width: `${Math.round((enriched / Math.max(total, 1)) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-slate-400">
          Enrichissez chaque produit pour que vos affiliés disposent d&apos;une page de vente percutante à partager.
        </p>
      </div>

      {/* Grille produits */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p: any) => {
          const hasMarketing = Boolean(p.marketingData);
          let md: any = {};
          try { if (p.marketingData) md = JSON.parse(p.marketingData); } catch { /* */ }
          const offreUrl = `${baseUrl}/offres/${p.slug}`;

          return (
            <div
              key={p.id}
              className={`rounded-2xl border bg-white shadow-sm overflow-hidden ${
                hasMarketing ? "border-emerald-200" : "border-slate-200"
              }`}
            >
              <div className="px-4 py-3 border-b border-slate-100 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {p.branch.name}
                  </p>
                  <h3 className="text-sm font-semibold text-slate-800 leading-tight mt-0.5 line-clamp-2">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {p.price > 0 ? fcfa(p.price) : "Sur devis"}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  hasMarketing
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {hasMarketing ? "✓ Enrichi" : "⚠ À compléter"}
                </span>
              </div>

              {hasMarketing && md.tagline && (
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                  <p className="text-xs text-slate-600 italic line-clamp-2">&ldquo;{md.tagline}&rdquo;</p>
                </div>
              )}

              <div className="px-4 py-3 flex items-center gap-3">
                <Link
                  href={`/admin/produits/${p.slug}`}
                  className="flex-1 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-center text-xs font-bold text-blue-700 py-2 transition-colors"
                >
                  {hasMarketing ? "✏️ Modifier" : "➕ Enrichir"}
                </Link>
                <a
                  href={offreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-center text-xs font-bold text-slate-600 py-2 px-3 transition-colors"
                >
                  👁 Voir
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

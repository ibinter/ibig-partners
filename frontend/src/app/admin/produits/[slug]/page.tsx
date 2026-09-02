import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import FetchButton from "./fetch-button";

export const dynamic = "force-dynamic";

type MarketingData = {
  tagline: string;
  bullets: string[];
  audience: string;
  includes: string[];
  imageUrl: string;
  fetchedAt?: string;
  sourceUrl?: string;
};

function parseMD(raw: string | null | undefined): MarketingData {
  try {
    if (raw) return JSON.parse(raw) as MarketingData;
  } catch { /* */ }
  return { tagline: "", bullets: ["", "", ""], audience: "", includes: [""], imageUrl: "", fetchedAt: undefined, sourceUrl: undefined };
}

async function saveMarketing(formData: FormData) {
  "use server";
  await requireAdmin();
  const slug      = String(formData.get("slug"));
  const tagline   = String(formData.get("tagline") ?? "").trim();
  const audience  = String(formData.get("audience") ?? "").trim();
  const imageUrl  = String(formData.get("imageUrl") ?? "").trim();
  const bullets   = (formData.getAll("bullets") as string[]).map(s => s.trim()).filter(Boolean);
  const includes  = (formData.getAll("includes") as string[]).map(s => s.trim()).filter(Boolean);

  const md: MarketingData = { tagline, bullets, audience, includes, imageUrl };
  const existing = await (prisma as any).product.findUnique({ where: { slug } });
  if (!existing) return;
  const prev = parseMD(existing.marketingData);
  md.fetchedAt = prev.fetchedAt;
  md.sourceUrl = prev.sourceUrl;

  await (prisma as any).product.update({
    where: { slug },
    data: { marketingData: JSON.stringify(md) },
  });
  revalidatePath(`/offres/${slug}`);
  revalidatePath(`/admin/produits/${slug}`);
  redirect(`/admin/produits/${slug}?saved=1`);
}

export default async function ProductEnrichPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdmin();
  const { slug }  = await params;
  const { saved } = await searchParams;

  const product = await (prisma as any).product.findUnique({
    where: { slug },
    include: { branch: true },
  });
  if (!product) notFound();

  const md = parseMD(product.marketingData);
  const bullets  = md.bullets.length  > 0 ? md.bullets  : ["", "", "", "", ""];
  const includes = md.includes.length > 0 ? md.includes : ["", ""];

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ibigpartners.com";
  const offreUrl = `${baseUrl}/offres/${slug}`;

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div>
        <a href="/admin/branches" className="text-sm text-blue-600 hover:underline">← Branches & Produits</a>
        <h1 className="text-xl font-bold text-slate-900 mt-2">
          ✏️ Enrichissement marketing — {product.name}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Branche : <strong>{product.branch.name}</strong>
          {product.siteUrl && (
            <> · Site source : <a href={product.siteUrl.startsWith("http") ? product.siteUrl : `https://${product.siteUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{product.siteUrl}</a></>
          )}
        </p>
      </div>

      {saved && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700">
          ✓ Contenu marketing sauvegardé.{" "}
          <a href={offreUrl} target="_blank" rel="noopener noreferrer" className="underline">Voir la page →</a>
        </div>
      )}

      {/* Bouton Fetch automatique */}
      {product.siteUrl && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-4 space-y-2">
          <p className="text-sm font-semibold text-blue-800">
            🤖 Import automatique depuis le site produit
          </p>
          <p className="text-xs text-blue-600">
            Cliquez pour analyser <strong>{product.siteUrl}</strong> et extraire automatiquement la tagline, les arguments et les visuels. Vous pourrez ensuite modifier le résultat.
          </p>
          <FetchButton slug={slug} />
        </div>
      )}

      {md.fetchedAt != null && (
        <p className="text-xs text-slate-400">
          Dernier import automatique : {new Date(md.fetchedAt).toLocaleString("fr-FR")}
          {md.sourceUrl && <> depuis <a href={md.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{md.sourceUrl}</a></>}
        </p>
      )}

      {/* Formulaire d'enrichissement */}
      <form action={saveMarketing} className="space-y-5">
        <input type="hidden" name="slug" value={slug} />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Accroche commerciale</h2>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Tagline (1 phrase percutante)</label>
            <input
              name="tagline"
              defaultValue={md.tagline}
              placeholder="Ex : Devenez Directeur Administratif & Financier opérationnel en 100h"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">URL image / visuel (optionnel)</label>
            <input
              name="imageUrl"
              defaultValue={md.imageUrl}
              placeholder="https://..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Arguments de vente (bullets)</h2>
          <p className="text-xs text-slate-400">Listez les 4 à 6 arguments les plus convaincants. Chaque ligne = 1 argument.</p>
          {[...Array(6)].map((_, i) => (
            <input
              key={i}
              name="bullets"
              defaultValue={bullets[i] ?? ""}
              placeholder={`Argument ${i + 1}…`}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
            />
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Public cible</h2>
          <input
            name="audience"
            defaultValue={md.audience}
            placeholder="Ex : Comptables, responsables financiers, entrepreneurs, chefs d'entreprise"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Ce qui est inclus</h2>
          <p className="text-xs text-slate-400">Liste des éléments inclus dans la formation/offre.</p>
          {[...Array(6)].map((_, i) => (
            <input
              key={i}
              name="includes"
              defaultValue={includes[i] ?? ""}
              placeholder={`Inclus ${i + 1}…`}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 text-sm transition-colors"
          >
            Enregistrer le contenu marketing
          </button>
          <a
            href={offreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Prévisualiser la page →
          </a>
        </div>
      </form>
    </div>
  );
}


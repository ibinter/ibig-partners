import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, Field, PageHeader } from "@/components/ui";
import { createModule } from "../actions";

export const dynamic = "force-dynamic";

const CONTENT_PLACEHOLDERS: Record<string, string> = {
  VIDEO:   "https://www.youtube.com/watch?v=... ou lien vidéo direct",
  PDF:     "https://... lien vers le fichier PDF hébergé",
  ARTICLE: "Rédigez votre article en Markdown ou HTML...",
  AI:      "Prompt système ou configuration de l'assistant IA...",
  QUIZ:    "Questions et réponses au format JSON ou texte structuré...",
};

export default async function NouveauModulePage() {
  await requireAdmin();

  const [branches, products] = await Promise.all([
    (prisma as any).branch.findMany({ orderBy: { name: "asc" } }).catch(() => []),
    (prisma as any).product.findMany({ orderBy: { name: "asc" } }).catch(() => []),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Nouveau module de formation"
        subtitle="Créez un module pour l'Académie IBIG"
      />

      <form action={createModule} className="space-y-6">
        {/* Informations générales */}
        <Card className="space-y-5 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Informations générales
          </h2>

          <Field label="Titre du module" htmlFor="title" required>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="Ex : Comment recruter son premier filleul ?"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </Field>

          <Field label="Type de contenu" htmlFor="type" required>
            <select
              id="type"
              name="type"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="VIDEO">🎬 Vidéo</option>
              <option value="PDF">📄 PDF</option>
              <option value="ARTICLE">📝 Article</option>
              <option value="AI">🤖 Module IA</option>
              <option value="QUIZ">🧠 Quiz</option>
            </select>
          </Field>

          <Field label="Description courte" htmlFor="description">
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Résumé en 1-2 phrases affiché dans la liste des modules..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </Field>

          <Field label="Contenu" htmlFor="content">
            <textarea
              id="content"
              name="content"
              rows={6}
              placeholder={CONTENT_PLACEHOLDERS["ARTICLE"]}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-y font-mono text-xs"
            />
            <p className="mt-1 text-xs text-slate-400">
              Lien vidéo, URL PDF, texte Markdown, prompt IA ou questions de quiz selon le type choisi.
            </p>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="URL miniature (thumbnail)" htmlFor="thumbnail">
              <input
                id="thumbnail"
                name="thumbnail"
                type="url"
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </Field>

            <Field label="Durée (minutes)" htmlFor="duration">
              <input
                id="duration"
                name="duration"
                type="number"
                min={0}
                placeholder="15"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </Field>
          </div>

          <Field label="Tags (séparés par des virgules)" htmlFor="tags">
            <input
              id="tags"
              name="tags"
              type="text"
              placeholder="recrutement, réseau, formation, leadership..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </Field>
        </Card>

        {/* Accès et ciblage */}
        <Card className="space-y-5 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Accès et ciblage
          </h2>

          <Field label="Statut minimum requis" htmlFor="minStatus" required>
            <select
              id="minStatus"
              name="minStatus"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="STARTER">Starter (tous)</option>
              <option value="SILVER">Silver</option>
              <option value="GOLD">Gold</option>
              <option value="MASTER">Master</option>
              <option value="ELITE">Elite</option>
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Branche (optionnel)" htmlFor="branchId">
              <select
                id="branchId"
                name="branchId"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Général (toutes branches)</option>
                {branches.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Produit lié (optionnel)" htmlFor="productId">
              <select
                id="productId"
                name="productId"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Aucun produit spécifique</option>
                {products.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Card>

        {/* Publication */}
        <Card className="space-y-5 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Publication
          </h2>

          <Field label="Ordre d'affichage" htmlFor="order">
            <input
              id="order"
              name="order"
              type="number"
              min={0}
              defaultValue={0}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <p className="mt-1 text-xs text-slate-400">Plus petit = affiché en premier.</p>
          </Field>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="active"
                value="on"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">
                Publier immédiatement
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                value="on"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">
                Mettre en avant (featured)
              </span>
            </label>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <a
            href="/admin/academie"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            ← Annuler
          </a>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            Créer le module
          </button>
        </div>
      </form>
    </div>
  );
}

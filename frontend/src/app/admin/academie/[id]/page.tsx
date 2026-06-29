import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, Field, PageHeader } from "@/components/ui";
import { updateModule, deleteModule } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [module, branches, products] = await Promise.all([
    (prisma as any).trainingModule.findUnique({ where: { id } }),
    (prisma as any).branch.findMany({ orderBy: { name: "asc" } }).catch(() => []),
    (prisma as any).product.findMany({ orderBy: { name: "asc" } }).catch(() => []),
  ]);

  if (!module) notFound();

  const TYPE_LABEL: Record<string, string> = {
    VIDEO:   "🎬 Vidéo",
    PDF:     "📄 PDF",
    ARTICLE: "📝 Article",
    AI:      "🤖 Module IA",
    QUIZ:    "🧠 Quiz",
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title={`Modifier : ${module.title}`}
        subtitle={`Slug : ${module.slug} · ${module.viewCount ?? 0} vue${(module.viewCount ?? 0) !== 1 ? "s" : ""}`}
      />

      <form action={updateModule} className="space-y-6">
        <input type="hidden" name="id" value={module.id} />

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
              defaultValue={module.title}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </Field>

          <Field label="Type de contenu" htmlFor="type" required>
            <select
              id="type"
              name="type"
              required
              defaultValue={module.type}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {Object.entries(TYPE_LABEL).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Description courte" htmlFor="description">
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={module.description ?? ""}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </Field>

          <Field label="Contenu" htmlFor="content">
            <textarea
              id="content"
              name="content"
              rows={8}
              defaultValue={module.content ?? ""}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-y font-mono text-xs"
            />
            <p className="mt-1 text-xs text-slate-400">
              Lien vidéo, URL PDF, texte Markdown, prompt IA ou questions de quiz selon le type.
            </p>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="URL miniature (thumbnail)" htmlFor="thumbnail">
              <input
                id="thumbnail"
                name="thumbnail"
                type="url"
                defaultValue={module.thumbnail ?? ""}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </Field>

            <Field label="Durée (minutes)" htmlFor="duration">
              <input
                id="duration"
                name="duration"
                type="number"
                min={0}
                defaultValue={module.duration ?? ""}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </Field>
          </div>

          <Field label="Tags (séparés par des virgules)" htmlFor="tags">
            <input
              id="tags"
              name="tags"
              type="text"
              defaultValue={Array.isArray(module.tags) ? module.tags.join(", ") : ""}
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
              defaultValue={module.minStatus}
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
                defaultValue={module.branchId ?? ""}
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
                defaultValue={module.productId ?? ""}
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
              defaultValue={module.order ?? 0}
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
                defaultChecked={module.active}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">
                Publié (visible par les partenaires)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                value="on"
                defaultChecked={module.featured}
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
            ← Retour
          </a>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>

      {/* Danger zone */}
      <Card className="border-red-100 p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-red-500 mb-1">
          Zone de danger
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          La suppression de ce module est définitive et ne peut pas être annulée.
        </p>
        <form action={deleteModule}>
          <input type="hidden" name="id" value={module.id} />
          <button
            type="submit"
            className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
            onClick={(e) => {
              if (!confirm(`Supprimer définitivement "${module.title}" ?`)) {
                e.preventDefault();
              }
            }}
          >
            Supprimer ce module
          </button>
        </form>
      </Card>
    </div>
  );
}

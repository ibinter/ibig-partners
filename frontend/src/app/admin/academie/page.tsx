import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, PageHeader, StatCard } from "@/components/ui";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  VIDEO:   "Vidéo",
  PDF:     "PDF",
  ARTICLE: "Article",
  AUDIO:   "Audio",
  IMAGE:   "Image",
  AI:      "IA",
  QUIZ:    "Quiz",
};

const TYPE_TONE: Record<string, "blue" | "amber" | "green" | "violet" | "orange" | "gray"> = {
  VIDEO:   "blue",
  PDF:     "amber",
  ARTICLE: "green",
  AUDIO:   "orange",
  IMAGE:   "violet",
  AI:      "violet",
  QUIZ:    "orange",
};

const TYPE_EMOJI: Record<string, string> = {
  VIDEO:   "🎬",
  PDF:     "📄",
  ARTICLE: "📝",
  AUDIO:   "🎧",
  IMAGE:   "🖼️",
  AI:      "🤖",
  QUIZ:    "🧠",
};

const STATUS_LABEL: Record<string, string> = {
  STARTER: "Starter",
  SILVER:  "Silver",
  GOLD:    "Gold",
  MASTER:  "Master",
  ELITE:   "Elite",
};

const STATUS_TONE: Record<string, "gray" | "blue" | "amber" | "green" | "violet"> = {
  STARTER: "gray",
  SILVER:  "blue",
  GOLD:    "amber",
  MASTER:  "green",
  ELITE:   "violet",
};

export default async function AcademieAdminPage() {
  await requireAdmin();

  const [modules, products, branches] = await Promise.all([
    (prisma as any).trainingModule.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { branch: { select: { name: true } }, product: { select: { name: true } } },
    }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    (prisma as any).branch.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }).catch(() => []),
  ]);

  const total     = modules.length as number;
  const published = modules.filter((m: any) => m.active).length as number;
  const featured  = modules.filter((m: any) => m.featured).length as number;

  const byType: Record<string, number> = {};
  for (const m of modules as any[]) {
    byType[m.type] = (byType[m.type] ?? 0) + 1;
  }

  const coveredProductIds = new Set(
    modules.filter((m: any) => m.active && m.productId).map((m: any) => m.productId)
  );
  const productsWithoutTraining = products.filter((p) => !coveredProductIds.has(p.id));

  const totalViews = (modules as any[]).reduce((acc: number, m: any) => acc + (m.viewCount ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title="Académie IBIG"
          subtitle={`${total} module${total !== 1 ? "s" : ""} · ${published} publiés · ${totalViews.toLocaleString("fr-FR")} vues totales`}
        />
        <Link
          href="/admin/academie/nouveau"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          + Ajouter un module
        </Link>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total"         value={total}     accent="brand"  icon="🎓" />
        <StatCard label="Publiés"       value={published} accent="green"  icon="✅" />
        <StatCard label="En avant"      value={featured}  accent="gold"   icon="⭐" />
        <StatCard label="Vues totales"  value={totalViews.toLocaleString("fr-FR")} accent="purple" icon="👁️" />
      </div>

      {/* Stats par type */}
      <Card className="p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Répartition par type</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {(["VIDEO","PDF","ARTICLE","AUDIO","IMAGE","AI","QUIZ"] as const).map((type) => (
            <div key={type} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
              <span className="text-xl">{TYPE_EMOJI[type]}</span>
              <div>
                <p className="text-base font-bold text-slate-800">{byType[type] ?? 0}</p>
                <p className="text-[10px] text-slate-500 leading-none">{TYPE_LABEL[type]}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Couverture produits */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">📦</div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Couverture produits : {products.length - productsWithoutTraining.length} / {products.length}
              </p>
              <p className="text-xs text-slate-500">
                {productsWithoutTraining.length === 0
                  ? "Tous les produits ont au moins un module de formation ✅"
                  : `${productsWithoutTraining.length} produit(s) sans formation dédiée`}
              </p>
            </div>
          </div>
          <Link
            href="/admin/academie/nouveau"
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
          >
            + Créer une formation
          </Link>
        </div>
        {productsWithoutTraining.length > 0 && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2">
            <p className="text-xs text-amber-800 leading-relaxed">
              {productsWithoutTraining.slice(0, 15).map((p) => p.name).join(" · ")}
              {productsWithoutTraining.length > 15 ? ` … +${productsWithoutTraining.length - 15}` : ""}
            </p>
          </div>
        )}
      </Card>

      {/* Tableau */}
      {modules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <p className="text-3xl mb-3">🎓</p>
          <p className="font-semibold text-slate-900 mb-1">Aucun module de formation</p>
          <p className="text-sm text-slate-500 mb-4">
            Créez des vidéos, PDF, articles, audios, images, modules IA ou quiz pour les partenaires.
          </p>
          <Link
            href="/admin/academie/nouveau"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
          >
            + Créer le premier module
          </Link>
        </div>
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Module</th>
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3">Branche / Produit</th>
                  <th className="px-3 py-3">Accès min.</th>
                  <th className="px-3 py-3 text-center">Vues</th>
                  <th className="px-3 py-3 text-center">Statut</th>
                  <th className="px-3 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(modules as any[]).map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl shrink-0">{TYPE_EMOJI[m.type] ?? "📦"}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-900 leading-snug">{m.title}</p>
                            {m.featured && (
                              <span className="text-amber-400 text-xs" title="Mis en avant">⭐</span>
                            )}
                          </div>
                          {m.description && (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{m.description}</p>
                          )}
                          {m.duration && (
                            <p className="text-[10px] text-slate-400 mt-0.5">⏱ {m.duration}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={TYPE_TONE[m.type] ?? "gray"}>
                        {TYPE_EMOJI[m.type]} {TYPE_LABEL[m.type] ?? m.type}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500">
                      {m.branch ? (
                        <span className="font-medium text-slate-700">{m.branch.name}</span>
                      ) : m.product ? (
                        <span className="text-blue-600">{m.product.name}</span>
                      ) : (
                        <span className="text-slate-400 italic">Général</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={STATUS_TONE[m.minStatus] ?? "gray"}>
                        {STATUS_LABEL[m.minStatus] ?? m.minStatus}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-center text-xs font-mono text-slate-600">
                      {(m.viewCount ?? 0).toLocaleString("fr-FR")}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Badge tone={m.active ? "green" : "gray"}>
                        {m.active ? "Publié" : "Brouillon"}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Link
                        href={`/admin/academie/${m.id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
                      >
                        Modifier →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

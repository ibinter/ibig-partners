import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, PageHeader, StatCard } from "@/components/ui";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  VIDEO:   "Vidéo",
  PDF:     "PDF",
  ARTICLE: "Article",
  AI:      "IA",
  QUIZ:    "Quiz",
};

const TYPE_TONE: Record<string, "blue" | "amber" | "green" | "violet" | "orange"> = {
  VIDEO:   "blue",
  PDF:     "amber",
  ARTICLE: "green",
  AI:      "violet",
  QUIZ:    "orange",
};

const TYPE_EMOJI: Record<string, string> = {
  VIDEO:   "🎬",
  PDF:     "📄",
  ARTICLE: "📝",
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

  const modules = await (prisma as any).trainingModule.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  const total     = modules.length as number;
  const published = modules.filter((m: any) => m.active).length as number;
  const videos    = modules.filter((m: any) => m.type === "VIDEO").length as number;
  const guides    = modules.filter((m: any) => m.type === "PDF" || m.type === "ARTICLE").length as number;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Académie IBIG"
          subtitle={`${total} module${total !== 1 ? "s" : ""} de formation`}
        />
        <Link
          href="/admin/academie/nouveau"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          + Ajouter un module
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total"     value={total}     accent="brand" icon="🎓" />
        <StatCard label="Publiés"   value={published} accent="green" icon="✅" />
        <StatCard label="Vidéos"    value={videos}    accent="gold"  icon="🎬" />
        <StatCard label="Guides"    value={guides}    accent="slate" icon="📄" />
      </div>

      {modules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <p className="text-3xl mb-3">🎓</p>
          <p className="font-semibold text-slate-900 mb-1">Aucun module de formation</p>
          <p className="text-sm text-slate-500 mb-4">
            Créez des vidéos, PDF, articles, modules IA ou quiz pour les partenaires.
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
                  <th className="px-3 py-3">Accès min.</th>
                  <th className="px-3 py-3 text-center">Vues</th>
                  <th className="px-3 py-3 text-center">Statut</th>
                  <th className="px-3 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {modules.map((m: any) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl shrink-0">{TYPE_EMOJI[m.type] ?? "📦"}</span>
                        <div>
                          <p className="font-semibold text-slate-900 leading-snug">{m.title}</p>
                          {m.description && (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{m.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={TYPE_TONE[m.type] ?? "gray"}>
                        {TYPE_LABEL[m.type] ?? m.type}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={STATUS_TONE[m.minStatus] ?? "gray"}>
                        {STATUS_LABEL[m.minStatus] ?? m.minStatus}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-center text-xs font-mono text-slate-600">
                      {m.viewCount ?? 0}
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

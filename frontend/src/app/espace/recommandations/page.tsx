import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function RecommandationsPage() {
  const user = await requireAuth();

  // Compute CP balance to infer level
  const cpBalance = await (async () => {
    try {
      const txs = await (prisma as any).pointTransaction.findMany({
        where: { userId: user.id },
        select: { points: true, type: true },
      });
      return txs.reduce((acc: number, t: any) => {
        if (["CREDIT", "BONUS"].includes(t.type)) return acc + t.points;
        return acc - Math.abs(t.points);
      }, 0);
    } catch { return 0; }
  })();

  // Infer minimum level from CP
  const userLevel = cpBalance >= 3000 ? 5 : cpBalance >= 1500 ? 4 : cpBalance >= 500 ? 3 : cpBalance >= 100 ? 2 : 1;

  // Already-applied mission IDs
  const appliedIds = await (async () => {
    try {
      const apps = await (prisma as any).missionApplication.findMany({
        where: { userId: user.id },
        select: { missionId: true },
      });
      return apps.map((a: any) => a.missionId);
    } catch { return []; }
  })();

  // Recommended missions: active, matching level, not yet applied, ordered by cpAmount desc
  const recommended = await (async () => {
    try {
      return await (prisma as any).mission.findMany({
        where: {
          status: "ACTIVE",
          ...(appliedIds.length > 0 ? { id: { notIn: appliedIds } } : {}),
          OR: [
            { minLevel: { lte: userLevel } },
            { minLevel: null },
          ],
        },
        orderBy: [{ cpAmount: "desc" }, { createdAt: "desc" }],
        take: 20,
      });
    } catch { return []; }
  })();

  // Group by branch
  const byBranch: Record<string, any[]> = {};
  for (const m of recommended) {
    if (!byBranch[m.branch]) byBranch[m.branch] = [];
    byBranch[m.branch].push(m);
  }

  const levelName = ["", "CONNECTEUR", "PARTNER", "BUSINESS PARTNER", "PREMIUM PARTNER", "ELITE PARTNER"][userLevel] || "CONNECTEUR";
  const rewardColor = (type: string) => type === "CASH" ? "bg-green-100 text-green-700" : type === "CREDIT" ? "bg-amber-100 text-amber-700" : "bg-purple-100 text-purple-700";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Missions recommandées"
        subtitle={`Sélectionnées pour votre niveau ${levelName} — ${cpBalance} CP — ${recommended.length} missions disponibles`}
      />

      {recommended.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-gray-500">Aucune mission disponible pour votre profil pour le moment.</p>
          <p className="text-sm text-gray-400 mt-1">Revenez bientôt — de nouvelles missions sont ajoutées régulièrement.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byBranch).map(([branch, missions]) => (
            <div key={branch}>
              <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                {branch} <span className="text-gray-400 font-normal text-sm">({missions.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {missions.slice(0, 6).map((m: any) => (
                  <div key={m.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-medium text-sm leading-tight">{m.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 ${rewardColor(m.rewardType)}`}>
                        {m.rewardType === "CASH" ? "💵 CASH" : m.rewardType === "CREDIT" ? `⭐ ${m.cpAmount} CP` : `💎 MIXTE`}
                      </span>
                    </div>
                    {m.description && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{m.description}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{m.type}</span>
                      {m.difficulty && <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{m.difficulty}</span>}
                      {m.slots && m.slots > 0 && (
                        <span className="text-xs text-gray-400">{m.slots} places</span>
                      )}
                    </div>
                    <div className="mt-3">
                      <a href={`/espace/missions`} className="inline-block text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                        Voir les missions →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mon profil missions */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Mon profil missions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{levelName}</div>
            <div className="text-xs text-gray-500 mt-1">Niveau actuel</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{cpBalance}</div>
            <div className="text-xs text-gray-500 mt-1">CP disponibles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{appliedIds.length}</div>
            <div className="text-xs text-gray-500 mt-1">Candidatures</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{recommended.length}</div>
            <div className="text-xs text-gray-500 mt-1">Missions dispo</div>
          </div>
        </div>
      </div>
    </div>
  );
}

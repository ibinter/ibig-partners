import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const METRIC_LABEL: Record<string, string> = {
  SALES_COUNT: "ventes",
  COMMISSION_AMOUNT: "FCFA de commissions",
  PROSPECTS_CONVERTED: "prospects convertis",
  REFERRALS: "filleuls recrutés",
};

async function getProgress(challengeId: string, userId: string, metric: string) {
  const now = new Date();
  const monthStart = new Date(now); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

  if (metric === "SALES_COUNT") {
    return prisma.sale.count({ where: { sellerId: userId, status: "CONFIRMED", createdAt: { gte: monthStart } } });
  }
  if (metric === "COMMISSION_AMOUNT") {
    const agg = await prisma.commission.aggregate({ where: { userId, createdAt: { gte: monthStart } }, _sum: { amount: true } });
    return Math.floor(agg._sum.amount ?? 0);
  }
  if (metric === "PROSPECTS_CONVERTED") {
    return prisma.prospect.count({ where: { userId, status: "CONVERTED" } });
  }
  if (metric === "REFERRALS") {
    return prisma.user.count({ where: { sponsorId: userId } });
  }
  const saved = await prisma.challengeProgress.findUnique({ where: { challengeId_userId: { challengeId, userId } } });
  return saved?.current ?? 0;
}

export default async function ChallengesPage() {
  const user = await requireUser();
  const now = new Date();

  const challenges = await prisma.challenge.findMany({
    where: { active: true, endAt: { gte: now } },
    orderBy: { endAt: "asc" },
  });

  const rows = await Promise.all(
    challenges.map(async (c) => {
      const current = await getProgress(c.id, user.id, c.metric);
      const pct = Math.min(100, Math.round((current / c.target) * 100));
      const completed = current >= c.target;
      const daysLeft = Math.max(0, Math.ceil((c.endAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      return { ...c, current, pct, completed, daysLeft };
    })
  );

  const done = rows.filter((r) => r.completed).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes Challenges"
        subtitle={`${done} challenge${done !== 1 ? "s" : ""} complété${done !== 1 ? "s" : ""} · ${rows.length} en cours`}
      />

      {rows.length === 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
          <p className="text-3xl mb-2">🏁</p>
          <p className="text-sm text-slate-500">Aucun challenge actif pour le moment.</p>
          <p className="text-xs text-slate-400 mt-1">Revenez bientôt — de nouveaux défis arrivent régulièrement.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {rows.map((c) => (
          <div key={c.id} className={`rounded-2xl border p-5 shadow-sm transition-all ${c.completed ? "border-emerald-200 bg-emerald-50" : "border-slate-100 bg-white"}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-800 text-sm">{c.title}</h3>
                  {c.completed && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">✓ Complété</span>}
                </div>
                {c.description && <p className="text-xs text-slate-500 mt-0.5">{c.description}</p>}
              </div>
              {c.reward > 0 && (
                <span className="shrink-0 rounded-xl bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                  🎁 +{c.reward.toLocaleString("fr-FR")} FCFA
                </span>
              )}
            </div>

            {/* Barre de progression */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>{c.current} / {c.target} {METRIC_LABEL[c.metric] ?? ""}</span>
                <span>{c.pct}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${c.completed ? "bg-emerald-500" : "bg-blue-500"}`}
                  style={{ width: `${c.pct}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>📅 Jusqu'au {formatDate(c.endAt)}</span>
              <span>{c.daysLeft > 0 ? `⏳ ${c.daysLeft} jour${c.daysLeft > 1 ? "s" : ""} restant${c.daysLeft > 1 ? "s" : ""}` : "Dernier jour !"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

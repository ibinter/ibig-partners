import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { revalidatePath } from "next/cache";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

async function claimReward(fd: FormData) {
  "use server";
  const { requireUser } = await import("@/lib/auth");
  const user = await requireUser();
  const rewardId = fd.get("rewardId") as string;
  const reward = await (prisma as any).reward.findUnique({ where: { id: rewardId } });
  if (!reward || !reward.active) return;

  const totalPts = await (prisma as any).pointTransaction.aggregate({
    where: { userId: user.id },
    _sum: { points: true },
  });
  const balance = totalPts._sum.points ?? 0;
  if (balance < reward.points) return;

  await (prisma as any).rewardClaim.create({ data: { id: `rcl_${Date.now()}`, userId: user.id, rewardId } });
  revalidatePath("/espace/points");
}

export default async function PointsPage() {
  const user = await requireUser();

  const [transactions, rewards, claims, sales, commissions, referrals] = await Promise.all([
    (prisma as any).pointTransaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
    (prisma as any).reward.findMany({ where: { active: true }, orderBy: { points: "asc" } }),
    (prisma as any).rewardClaim.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { reward: true } }),
    prisma.sale.count({ where: { sellerId: user.id, status: "CONFIRMED" } }),
    prisma.commission.aggregate({ where: { userId: user.id, status: "PAID" }, _sum: { amount: true } }),
    prisma.user.count({ where: { sponsorId: user.id } }),
  ]);

  const totalPts = transactions.reduce((s: number, t: any) => s + t.points, 0);
  const usedPts = claims.filter((c: any) => c.status !== "REJECTED").reduce((s: number, c: any) => s + c.reward.points, 0);
  const balance = totalPts - usedPts;

  const REASON_LABELS: Record<string, string> = {
    SALE: "🧾 Vente confirmée",
    REFERRAL: "👥 Parrainage",
    TRAINING: "🎓 Formation complétée",
    CHALLENGE: "🏁 Challenge",
    BONUS: "⭐ Bonus admin",
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Points & Récompenses" subtitle="Cumulez des points et échangez-les contre des récompenses." />

      {/* Balance */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white shadow-md">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-100">Solde de points</p>
        <p className="text-5xl font-extrabold mt-1">{balance.toLocaleString("fr-FR")}</p>
        <p className="text-sm text-amber-200 mt-1">pts disponibles sur {totalPts.toLocaleString()} gagnés</p>
        <div className="mt-3 flex gap-4 text-xs text-amber-100">
          <span>🧾 {sales} vente{sales > 1 ? "s" : ""}</span>
          <span>👥 {referrals} filleul{referrals > 1 ? "s" : ""}</span>
          <span>💰 {(commissions._sum.amount ?? 0).toLocaleString("fr-FR")} FCFA perçus</span>
        </div>
      </div>

      {/* Comment gagner */}
      <Card>
        <h2 className="mb-3 font-semibold text-slate-800">Comment gagner des points</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[["🧾 Vente", "+50 pts"], ["👥 Parrainage", "+20 pts"], ["🎓 Formation", "+10 pts"], ["🏁 Challenge", "+variable"]].map(([label, val]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-3 text-center">
              <p className="text-sm font-bold text-slate-800">{val}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Boutique */}
      {rewards.length > 0 && (
        <div>
          <h2 className="mb-3 font-semibold text-slate-700">Boutique de récompenses</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {rewards.map((r: any) => {
              const canClaim = balance >= r.points;
              return (
                <div key={r.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="font-bold text-slate-800">🎁 {r.name}</p>
                  {r.description && <p className="text-xs text-slate-500 mt-1">{r.description}</p>}
                  <p className="mt-2 text-xl font-extrabold text-amber-600">{r.points} pts</p>
                  <form action={claimReward} className="mt-3">
                    <input type="hidden" name="rewardId" value={r.id} />
                    <button type="submit" disabled={!canClaim}
                      className="w-full rounded-xl py-2 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed bg-amber-500 text-white hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400">
                      {canClaim ? "Échanger" : `Il manque ${r.points - balance} pts`}
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mes demandes */}
      {claims.length > 0 && (
        <Card>
          <h2 className="mb-4 font-semibold text-slate-800">Mes demandes</h2>
          <div className="space-y-2">
            {claims.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">🎁 {c.reward.name} — {c.reward.points} pts</span>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : c.status === "REJECTED" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-700"}`}>
                    {c.status}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Historique */}
      {transactions.length > 0 && (
        <Card>
          <h2 className="mb-4 font-semibold text-slate-800">Historique des points</h2>
          <div className="space-y-2">
            {transactions.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between text-sm border-b border-slate-50 pb-2 last:border-0">
                <span className="text-slate-600">{REASON_LABELS[t.reason] ?? t.reason}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${t.points > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {t.points > 0 ? "+" : ""}{t.points} pts
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(t.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

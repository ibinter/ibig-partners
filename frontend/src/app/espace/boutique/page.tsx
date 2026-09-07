import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { claimReward } from "../actions";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  FORMATION: "Formation",
  LOGICIEL: "Logiciel",
  AUDIT: "Audit",
  MARKETING: "Marketing",
  MISSION: "Mission premium",
  AUTRE: "Autre",
};
const CATEGORY_ICONS: Record<string, string> = {
  FORMATION: "🎓", LOGICIEL: "💻", AUDIT: "🔍",
  MARKETING: "📢", MISSION: "🎯", AUTRE: "🎁",
};
const CLAIM_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente", APPROVED: "Approuvée ✓", REJECTED: "Refusée",
};
const CLAIM_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-600",
};

export default async function BoutiquePage() {
  const user = await requireUser();

  const [rewards, myClaims, cpTransactions] = await Promise.all([
    (async () => { try { return await (prisma as any).reward.findMany({ where: { active: true }, orderBy: { points: "asc" } }); } catch { return []; } })(),
    (async () => { try { return await (prisma as any).rewardClaim.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { reward: { select: { name: true, points: true } } } }); } catch { return []; } })(),
    (async () => { try { return await (prisma as any).pointTransaction.findMany({ where: { userId: user.id }, select: { points: true, type: true } }); } catch { return []; } })(),
  ]);

  const cpBalance = cpTransactions.reduce((sum: number, tx: any) => {
    if (["CREDIT", "BONUS"].includes(tx.type)) return sum + tx.points;
    if (["DEBIT", "CANCELLATION", "EXPIRATION"].includes(tx.type)) return sum - tx.points;
    return sum;
  }, 0);

  const pendingClaimIds = new Set(
    myClaims.filter((c: any) => c.status === "PENDING").map((c: any) => c.rewardId)
  );

  const categories = [...new Set(rewards.map((r: any) => r.category))] as string[];

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Boutique PARTNERS"
        subtitle="Utilisez vos Crédits PARTNERS pour débloquer des avantages exclusifs."
      />

      {/* Solde CP */}
      <div className="rounded-2xl border border-violet-100 bg-violet-50 px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-violet-700">Votre solde disponible</p>
          <p className="text-xs text-slate-500 mt-0.5">Gagnez des CP en accomplissant des missions</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-extrabold text-violet-700" style={{ fontVariantNumeric: "tabular-nums" }}>{cpBalance}</p>
          <p className="text-xs text-slate-500">CP disponibles</p>
        </div>
      </div>

      {/* Catalogue par catégorie */}
      {rewards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
          <p className="text-4xl mb-3">🎁</p>
          <p className="text-slate-500 font-semibold">La boutique sera bientôt disponible</p>
          <p className="text-slate-400 text-xs mt-1">L'équipe IBIG prépare des avantages exclusifs pour les partenaires.</p>
        </div>
      ) : (
        categories.map((cat) => {
          const catRewards = rewards.filter((r: any) => r.category === cat);
          if (!catRewards.length) return null;
          return (
            <section key={cat}>
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
                {CATEGORY_ICONS[cat] ?? "🎁"} {CATEGORY_LABELS[cat] ?? cat}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {catRewards.map((r: any) => {
                  const affordable = cpBalance >= r.points;
                  const alreadyClaiming = pendingClaimIds.has(r.id);
                  const stockLeft = r.stock === -1 ? null : r.stock;
                  return (
                    <div key={r.id} className={`rounded-2xl border p-5 flex flex-col gap-3 shadow-sm ${affordable ? "border-violet-100 bg-white" : "border-slate-100 bg-slate-50 opacity-75"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 leading-snug">{r.name}</p>
                          {r.description && <p className="text-xs text-slate-500 mt-1">{r.description}</p>}
                          {r.conditions && <p className="text-xs text-amber-600 mt-1">⚠ {r.conditions}</p>}
                        </div>
                        <span className="text-2xl">{CATEGORY_ICONS[r.category] ?? "🎁"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xl font-extrabold text-violet-700">{r.points} CP</p>
                          {stockLeft !== null && <p className="text-[10px] text-slate-400">{stockLeft} dispo</p>}
                          {r.validityDays && <p className="text-[10px] text-slate-400">Valide {r.validityDays} jours</p>}
                        </div>
                        {alreadyClaiming ? (
                          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-100 text-amber-700">En attente</span>
                        ) : affordable ? (
                          <form action={claimReward}>
                            <input type="hidden" name="rewardId" value={r.id} />
                            <button type="submit" className="rounded-xl bg-violet-600 hover:bg-violet-700 px-4 py-1.5 text-sm font-semibold text-white transition-colors">
                              Utiliser
                            </button>
                          </form>
                        ) : (
                          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400">
                            {r.points - cpBalance} CP manquants
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })
      )}

      {/* Mes demandes */}
      {myClaims.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Mes demandes</h2>
          <div className="space-y-2">
            {myClaims.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{c.reward?.name}</p>
                  <p className="text-xs text-slate-400">{c.reward?.points} CP · {formatDate(c.createdAt)}</p>
                  {c.adminNote && <p className="text-xs text-slate-500 mt-0.5 italic">{c.adminNote}</p>}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CLAIM_STATUS_COLORS[c.status] ?? "bg-slate-100 text-slate-500"}`}>
                  {CLAIM_STATUS_LABELS[c.status] ?? c.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

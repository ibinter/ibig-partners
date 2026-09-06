import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Classement des partenaires — IBIG PARTNERS" };

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const LEVEL_BADGE: Record<number, { label: string; color: string }> = {
  0: { label: "🌱 Starter",  color: "bg-slate-100 text-slate-600" },
  1: { label: "🥉 Bronze",   color: "bg-amber-100 text-amber-700" },
  2: { label: "🥈 Silver",   color: "bg-slate-200 text-slate-700" },
  3: { label: "⭐ Gold",     color: "bg-yellow-100 text-yellow-700" },
  4: { label: "🏆 Elite",    color: "bg-emerald-100 text-emerald-700" },
};

function scoreLevel(score: number) {
  if (score >= 80) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  if (score >= 20) return 1;
  return 0;
}

export default async function ClassementPage() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  // Top partenaires ce mois par ventes confirmées
  const salesRows = await prisma.sale.groupBy({
    by: ["sellerId"],
    where: { status: "CONFIRMED", createdAt: { gte: monthStart } },
    _count: { id: true },
    _sum:   { amount: true },
    orderBy: { _count: { id: "desc" } },
    take: 20,
  });

  const ids = salesRows.map((r) => r.sellerId);
  const users = await prisma.user.findMany({
    where: { id: { in: ids }, active: true, approved: true },
    select: { id: true, firstName: true, lastName: true, code: true, status: true, photoUrl: true, city: true },
  });
  const uMap = new Map(users.map((u) => [u.id, u]));

  // Référentiels commission N2
  const allTimeSales = await prisma.sale.groupBy({
    by: ["sellerId"],
    where: { status: "CONFIRMED" },
    _count: { id: true },
  });
  const allMap = new Map(allTimeSales.map((r) => [r.sellerId, r._count.id]));

  type RankedPartner = { id: string; firstName: string; lastName: string; code: string; status: string; photoUrl: string | null; city: string | null; salesMonth: number; amountMonth: number; score: number; lvl: number };

  const ranking: RankedPartner[] = salesRows
    .map((r) => {
      const u = uMap.get(r.sellerId);
      if (!u) return null;
      const salesCount = r._count.id;
      const allTime    = allMap.get(r.sellerId) ?? 0;
      const score      = Math.min(100, salesCount * 5 + Math.floor(allTime / 2));
      return { ...u, salesMonth: salesCount, amountMonth: r._sum.amount ?? 0, score, lvl: scoreLevel(score) };
    })
    .filter((x): x is RankedPartner => x !== null);

  const now = new Date();
  const monthName = now.toLocaleString("fr-FR", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12 px-4">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6 rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/20 transition-colors">
            ← ibigpartners.com
          </Link>
          <h1 className="text-4xl font-extrabold text-white mb-2">🏆 Classement</h1>
          <p className="text-slate-400 text-sm capitalize">{monthName} · Top partenaires IBIG PARTNERS</p>
        </div>

        {/* Podium top 3 */}
        {ranking.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-10">
            {[ranking[1], ranking[0], ranking[2]].map((p, i) => {
              const realRank = i === 0 ? 2 : i === 1 ? 1 : 3;
              const heights  = ["h-28", "h-36", "h-24"];
              return (
                <div key={p.id} className={`flex flex-col items-center gap-2 ${heights[i]}`}>
                  <div className="text-3xl">{MEDAL[realRank]}</div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-lg font-bold text-white">
                    {p.firstName[0]}{p.lastName[0]}
                  </div>
                  <p className="text-xs font-bold text-white text-center leading-tight">{p.firstName}<br />{p.lastName}</p>
                  <p className="text-xs text-amber-300 font-semibold">{p.salesMonth} vente{p.salesMonth > 1 ? "s" : ""}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Tableau complet */}
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          {ranking.length === 0 ? (
            <div className="py-16 text-center text-slate-400">Aucune vente ce mois — revenez bientôt 🌟</div>
          ) : (
            ranking.map((p, i) => {
              const badge = LEVEL_BADGE[p.lvl];
              return (
                <div key={p.id} className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? "border-t border-white/5" : ""} ${i < 3 ? "bg-white/5" : ""}`}>
                  <div className="text-xl w-8 text-center font-extrabold text-white/50">
                    {MEDAL[i + 1] ?? `#${i + 1}`}
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-bold text-white">
                    {p.firstName[0]}{p.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-slate-400">{p.city ?? "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{p.salesMonth} vente{p.salesMonth > 1 ? "s" : ""}</p>
                    <span className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Classement mis à jour en temps réel · <Link href="/auth/signup" className="text-blue-400 hover:underline">Rejoindre IBIG PARTNERS →</Link>
        </p>
      </div>
    </div>
  );
}

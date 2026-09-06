import { prisma } from "@/lib/prisma";

export default async function ClassementPublicPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const optIns = await (prisma as any).leaderboardOptIn.findMany({ where: { optedIn: true }, select: { userId: true } });
  const optedIds = optIns.map((o: any) => o.userId);

  const monthlySales = await (prisma as any).sale.groupBy({
    by: ["userId"],
    where: { createdAt: { gte: startOfMonth }, userId: { in: optedIds } },
    _count: { id: true },
    _sum: { commission: true },
    orderBy: { _count: { id: "desc" } },
    take: 20,
  });

  const withNames = await Promise.all(
    monthlySales.map(async (s: any) => {
      const u = await (prisma as any).user.findUnique({ where: { id: s.userId }, select: { name: true } });
      return { ...s, name: u?.name ?? "Partenaire IBIG" };
    })
  );

  const medals = ["🥇", "🥈", "🥉"];
  const month = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 to-indigo-700 py-16 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center text-white">
          <p className="text-indigo-300 font-bold uppercase tracking-widest text-sm mb-2">Classement mensuel</p>
          <h1 className="text-4xl font-black">Top Partenaires</h1>
          <p className="text-indigo-200 mt-2 capitalize">{month}</p>
        </div>

        {withNames.length === 0 ? (
          <div className="rounded-2xl bg-white/10 p-8 text-center text-white">
            <p className="text-4xl mb-3">🏆</p>
            <p className="font-bold">Le classement se remplit en cours de mois.</p>
            <p className="text-sm text-indigo-200 mt-1">Activez votre participation dans votre espace partenaire.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {withNames.map((p: any, i: number) => (
              <div key={p.userId} className={`rounded-2xl p-5 flex items-center gap-4 ${i === 0 ? "bg-yellow-400 text-yellow-900" : i === 1 ? "bg-gray-200 text-gray-800" : i === 2 ? "bg-amber-700 text-amber-100" : "bg-white/10 text-white"}`}>
                <span className="text-3xl w-10 text-center">{medals[i] ?? `#${i + 1}`}</span>
                <div className="flex-1">
                  <p className="font-black text-lg">{p.name}</p>
                  <p className="text-sm opacity-70">{p._count.id} vente{p._count.id !== 1 ? "s" : ""} ce mois</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-xl tabular-nums">{(p._sum.commission ?? 0).toLocaleString()}</p>
                  <p className="text-xs opacity-70">FCFA</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
          <a href="/espace/leaderboard-optin" className="inline-block rounded-2xl bg-white text-indigo-700 font-bold px-6 py-3 hover:bg-indigo-50 transition-colors">
            Participer au classement →
          </a>
        </div>
      </div>
    </main>
  );
}

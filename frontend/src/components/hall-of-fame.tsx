import { prisma } from "@/lib/prisma";

/**
 * Hall of Fame — TOP 10 partenaires du mois.
 * Affichage sur landing + page dédiée /classement.
 * Effet aspirationnel énorme + transparence.
 */
export async function HallOfFame() {
  // Top 10 partenaires par commissions ce mois-ci
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const topPerformers = await prisma.commission.groupBy({
    by: ["userId"],
    where: {
      createdAt: { gte: startOfMonth },
      status: { in: ["VALIDATED", "PAID"] },
    },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 10,
  });

  const userIds = topPerformers.map((p) => p.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      city: true,
      country: true,
      status: true,
      photoUrl: true,
    },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  const podium = topPerformers
    .map((p, i) => {
      const u = userMap.get(p.userId);
      return {
        rank: i + 1,
        name: u ? `${u.firstName} ${u.lastName.charAt(0)}.` : "Partenaire",
        city: u?.city ?? "—",
        earnings: p._sum.amount ?? 0,
        status: u?.status ?? "STARTER",
      };
    })
    .filter((p) => p.earnings > 0);

  // Moins de 3 vrais performers : pas de podium crédible, on n'invente rien.
  if (podium.length < 3) return null;

  const final = podium.slice(0, 8);

  const monthName = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <section
      data-testid="hall-of-fame"
      className="bg-gradient-to-b from-slate-50 via-white to-slate-50 py-24"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <span className="label-caps inline-block rounded-full bg-amber-100 px-4 py-1.5 text-amber-700">
            🏆 Hall of Fame · {monthName}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
            Les top performers du mois
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            La transparence est notre force. Voici les partenaires qui gagnent le
            plus en ce moment. Rejoignez le classement !
          </p>
        </div>

        {/* Podium top 3 */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {final.slice(0, 3).map((p) => (
            <PodiumCard key={p.rank} p={p} />
          ))}
        </div>

        {/* Top 4-8 */}
        {final.length > 3 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {final.slice(3).map((p) => (
              <div
                key={p.rank}
                className="card-premium flex items-center gap-3 p-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                  {p.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-bold text-sm text-ink">{p.name}</p>
                  <p className="text-xs text-muted truncate">{p.city}</p>
                </div>
                <p className="text-numeral text-sm text-emerald-600">
                  {Math.round(p.earnings / 1000)}k
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <a
            href="/rejoindre"
            data-testid="hof-cta"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-gold-500 px-8 py-4 font-extrabold text-brand-900 shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl"
          >
            <span className="text-xl">🚀</span>
            Devenir le prochain n°1
          </a>
        </div>
      </div>
    </section>
  );
}

function PodiumCard({ p }: { p: { rank: number; name: string; city: string; earnings: number; status: string } }) {
  const medals = ["🥇", "🥈", "🥉"];
  const heights = ["h-64", "h-56", "h-52"];
  const gradients = [
    "from-yellow-300 via-amber-400 to-orange-500", // gold
    "from-slate-200 via-slate-300 to-slate-400", // silver
    "from-orange-300 via-amber-500 to-amber-700", // bronze
  ];
  const i = p.rank - 1;

  return (
    <div
      data-testid={`podium-${p.rank}`}
      className={`card-premium relative overflow-hidden p-6 ${heights[i]} flex flex-col justify-end`}
    >
      <div
        className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${gradients[i]}`}
      />
      <div className="absolute top-4 right-4 text-4xl">{medals[i]}</div>

      <div className="absolute top-6 left-6">
        <span className="text-numeral text-4xl text-slate-200">#{p.rank}</span>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          {p.status}
        </p>
        <p className="mt-1 text-xl font-extrabold text-ink">{p.name}</p>
        <p className="text-xs text-muted">{p.city}</p>
        <div className="mt-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2.5 ring-1 ring-emerald-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Gains du mois
          </p>
          <p className="text-numeral text-2xl text-emerald-700">
            {p.earnings.toLocaleString("fr-FR")} FCFA
          </p>
        </div>
      </div>
    </div>
  );
}

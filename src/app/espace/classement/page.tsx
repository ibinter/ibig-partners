import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa } from "@/lib/format";
import { Badge, PageHeader } from "@/components/ui";
import { STATUS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const MEDALS = ["🥇", "🥈", "🥉"];
const PODIUM_BG = ["bg-amber-50 border-amber-200", "bg-slate-50 border-slate-200", "bg-orange-50 border-orange-200"];

export default async function ClassementPage() {
  const currentUser = await requireUser();

  const topCA = await prisma.sale.groupBy({
    by: ["sellerId"],
    where: { status: "CONFIRMED" },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 20,
  });

  const sellerIds = topCA.map((t) => t.sellerId);
  const users = await prisma.user.findMany({
    where: { id: { in: sellerIds } },
    select: { id: true, firstName: true, lastName: true, code: true, status: true },
  });

  const topCAWithUser = topCA.map((t) => ({
    ...t,
    user: users.find((u) => u.id === t.sellerId),
  }));

  const topComm = await prisma.commission.groupBy({
    by: ["userId"],
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 20,
  });

  const commUserIds = topComm.map((t) => t.userId);
  const commUsers = await prisma.user.findMany({
    where: { id: { in: commUserIds } },
    select: { id: true, firstName: true, lastName: true, code: true, status: true },
  });

  const topCommWithUser = topComm.map((t) => ({
    ...t,
    user: commUsers.find((u) => u.id === t.userId),
  }));

  const topNetwork = await prisma.user.findMany({
    where: { approved: true, active: true, role: "PARTNER" },
    select: {
      id: true, firstName: true, lastName: true, code: true, status: true,
      _count: { select: { referrals: true } },
    },
    orderBy: { referrals: { _count: "desc" } },
    take: 10,
  });

  const myRankCA = topCAWithUser.findIndex((t) => t.sellerId === currentUser.id);

  const RankingCard = ({
    title,
    items,
    getValue,
    getUserId,
    getUser,
    getExtra,
  }: {
    title: string;
    items: unknown[];
    getValue: (item: unknown) => string;
    getUserId: (item: unknown) => string;
    getUser: (item: unknown) => { firstName?: string; lastName?: string; code?: string; status?: string } | undefined;
    getExtra?: (item: unknown) => React.ReactNode;
  }) => (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-50 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="font-semibold text-sm text-ink">{title}</h3>
      </div>
      <ol className="divide-y divide-slate-50">
        {(items as unknown[]).map((t, i) => {
          const uid = getUserId(t);
          const u = getUser(t);
          const isMe = uid === currentUser.id;
          return (
            <li key={uid} className={`flex items-center gap-3 px-5 py-3 transition-colors ${isMe ? "bg-blue-50/60" : i < 3 ? PODIUM_BG[i] : "hover:bg-slate-50/60"}`}>
              <span className="w-8 shrink-0 text-center">
                {i < 3 ? (
                  <span className="text-lg">{MEDALS[i]}</span>
                ) : (
                  <span className="text-xs font-bold text-muted">#{i + 1}</span>
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-ink truncate">
                  {u?.firstName} {u?.lastName}
                  {isMe && <span className="ml-1.5 text-xs font-medium text-blue-600">(vous)</span>}
                </p>
                {getExtra ? getExtra(t) : (
                  <p className="text-xs font-mono text-muted">{u?.code}</p>
                )}
              </div>
              <span className="font-bold text-sm text-ink shrink-0">{getValue(t)}</span>
            </li>
          );
        })}
        {items.length === 0 && (
          <li className="px-5 py-5 text-sm text-center text-muted">Aucune donnée.</li>
        )}
      </ol>
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Classement"
        subtitle="Les meilleurs performers du réseau IBIG PARTNERS"
      />

      {myRankCA >= 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-4 text-white shadow-md">
          <p className="text-sm font-semibold">
            🏆 Vous êtes classé(e) <strong>#{myRankCA + 1}</strong> au classement CA avec{" "}
            <strong>{fcfa(topCAWithUser[myRankCA]._sum.amount ?? 0)}</strong> générés.
          </p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <RankingCard
          title="🏆 Top CA généré"
          items={topCAWithUser}
          getValue={(t) => fcfa((t as typeof topCAWithUser[0])._sum.amount ?? 0)}
          getUserId={(t) => (t as typeof topCAWithUser[0]).sellerId}
          getUser={(t) => (t as typeof topCAWithUser[0]).user}
        />
        <RankingCard
          title="💰 Top commissions perçues"
          items={topCommWithUser}
          getValue={(t) => fcfa((t as typeof topCommWithUser[0])._sum.amount ?? 0)}
          getUserId={(t) => (t as typeof topCommWithUser[0]).userId}
          getUser={(t) => (t as typeof topCommWithUser[0]).user}
          getExtra={(t) => (
            <Badge tone="gold">{STATUS_LABELS[(t as typeof topCommWithUser[0]).user?.status ?? "STARTER"]}</Badge>
          )}
        />
        <RankingCard
          title="🌳 Top réseau (filleuls N1)"
          items={topNetwork}
          getValue={(t) => `${(t as typeof topNetwork[0])._count.referrals} filleul(s)`}
          getUserId={(t) => (t as typeof topNetwork[0]).id}
          getUser={(t) => t as typeof topNetwork[0]}
          getExtra={(t) => (
            <Badge tone="blue">{STATUS_LABELS[(t as typeof topNetwork[0]).status]}</Badge>
          )}
        />
      </div>
    </div>
  );
}

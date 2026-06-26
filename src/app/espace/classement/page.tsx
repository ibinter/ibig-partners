import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa } from "@/lib/format";
import { Badge, Card, PageHeader } from "@/components/ui";
import { STATUS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function ClassementPage() {
  const currentUser = await requireUser();

  // Top 20 par CA généré
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

  // Top 20 par commissions perçues
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

  // Top 10 par taille de réseau (N1 actifs)
  const topNetwork = await prisma.user.findMany({
    where: { approved: true, active: true, role: "PARTNER" },
    select: {
      id: true, firstName: true, lastName: true, code: true, status: true,
      _count: { select: { referrals: true } },
    },
    orderBy: { referrals: { _count: "desc" } },
    take: 10,
  });

  // Position de l'utilisateur courant dans le classement CA
  const myRankCA = topCAWithUser.findIndex((t) => t.sellerId === currentUser.id);

  return (
    <div>
      <PageHeader
        title="Classement des partenaires"
        subtitle="Les meilleurs performers du réseau IBIG PARTNERS."
      />

      {myRankCA >= 0 && (
        <div className="mb-6 rounded-lg bg-brand-50 border border-brand-200 px-4 py-3 text-sm text-brand-800">
          🏆 Vous êtes classé(e) <strong>#{myRankCA + 1}</strong> au classement CA avec{" "}
          <strong>{fcfa(topCAWithUser[myRankCA]._sum.amount ?? 0)}</strong> générés.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Classement CA */}
        <Card className="p-0 lg:col-span-1">
          <h2 className="px-5 py-4 font-semibold text-ink">🏆 Top CA généré</h2>
          <ol className="divide-y divide-slate-100">
            {topCAWithUser.map((t, i) => (
              <li
                key={t.sellerId}
                className={`flex items-center gap-3 px-5 py-3 ${t.sellerId === currentUser.id ? "bg-brand-50" : ""}`}
              >
                <span className="w-8 text-center text-lg">
                  {i < 3 ? MEDALS[i] : <span className="text-sm font-bold text-muted">#{i + 1}</span>}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink truncate">
                    {t.user?.firstName} {t.user?.lastName}
                    {t.sellerId === currentUser.id && (
                      <span className="ml-1 text-xs text-brand-600">(vous)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted font-mono">{t.user?.code}</p>
                </div>
                <span className="font-bold text-ink text-sm">{fcfa(t._sum.amount ?? 0)}</span>
              </li>
            ))}
            {topCAWithUser.length === 0 && (
              <li className="px-5 py-4 text-sm text-muted">Aucune vente confirmée.</li>
            )}
          </ol>
        </Card>

        {/* Classement commissions */}
        <Card className="p-0 lg:col-span-1">
          <h2 className="px-5 py-4 font-semibold text-ink">💰 Top commissions perçues</h2>
          <ol className="divide-y divide-slate-100">
            {topCommWithUser.map((t, i) => (
              <li
                key={t.userId}
                className={`flex items-center gap-3 px-5 py-3 ${t.userId === currentUser.id ? "bg-brand-50" : ""}`}
              >
                <span className="w-8 text-center text-lg">
                  {i < 3 ? MEDALS[i] : <span className="text-sm font-bold text-muted">#{i + 1}</span>}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink truncate">
                    {t.user?.firstName} {t.user?.lastName}
                    {t.userId === currentUser.id && (
                      <span className="ml-1 text-xs text-brand-600">(vous)</span>
                    )}
                  </p>
                  <Badge tone="gold">{STATUS_LABELS[t.user?.status ?? "STARTER"]}</Badge>
                </div>
                <span className="font-bold text-ink text-sm">{fcfa(t._sum.amount ?? 0)}</span>
              </li>
            ))}
            {topCommWithUser.length === 0 && (
              <li className="px-5 py-4 text-sm text-muted">Aucune commission.</li>
            )}
          </ol>
        </Card>

        {/* Classement réseau */}
        <Card className="p-0 lg:col-span-1">
          <h2 className="px-5 py-4 font-semibold text-ink">🌳 Top réseau (filleuls N1)</h2>
          <ol className="divide-y divide-slate-100">
            {topNetwork.map((u, i) => (
              <li
                key={u.id}
                className={`flex items-center gap-3 px-5 py-3 ${u.id === currentUser.id ? "bg-brand-50" : ""}`}
              >
                <span className="w-8 text-center text-lg">
                  {i < 3 ? MEDALS[i] : <span className="text-sm font-bold text-muted">#{i + 1}</span>}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink truncate">
                    {u.firstName} {u.lastName}
                    {u.id === currentUser.id && (
                      <span className="ml-1 text-xs text-brand-600">(vous)</span>
                    )}
                  </p>
                  <Badge tone="blue">{STATUS_LABELS[u.status]}</Badge>
                </div>
                <span className="font-bold text-ink text-sm">
                  {u._count.referrals} filleul{u._count.referrals > 1 ? "s" : ""}
                </span>
              </li>
            ))}
            {topNetwork.length === 0 && (
              <li className="px-5 py-4 text-sm text-muted">Aucun partenaire actif.</li>
            )}
          </ol>
        </Card>
      </div>
    </div>
  );
}

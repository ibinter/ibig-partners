import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, PageHeader } from "@/components/ui";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const MEDALS = ["🥇", "🥈", "🥉"];

const PODIUM_GRADIENTS = [
  "from-yellow-400 to-amber-500",   // 1st — gold
  "from-slate-400 to-slate-600",    // 2nd — silver
  "from-orange-400 to-orange-600",  // 3rd — bronze
];

const PODIUM_RING = [
  "ring-yellow-300",
  "ring-slate-300",
  "ring-orange-300",
];

const RANK_COLORS = [
  "bg-yellow-100 text-yellow-700 ring-yellow-300",   // 1st
  "bg-slate-100 text-slate-600 ring-slate-300",      // 2nd
  "bg-orange-100 text-orange-700 ring-orange-300",   // 3rd
  "bg-slate-50 text-slate-500 ring-slate-200",       // 4+
];

function getRankStyle(index: number) {
  return RANK_COLORS[Math.min(index, 3)];
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

function monthName() {
  return new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

type Partner = {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  photoUrl: string | null;
  city: string | null;
  country: string | null;
  partnerType: string;
  _count: { sales: number };
};

export default async function ClassementPage() {
  const currentUser = (await requireUser()) as any;

  const topBySales: Partner[] = await (prisma as any).user.findMany({
    where: { active: true, approved: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      status: true,
      photoUrl: true,
      city: true,
      country: true,
      partnerType: true,
      _count: { select: { sales: true } },
    },
    orderBy: { sales: { _count: "desc" } },
    take: 20,
  });

  const currentUserRank = topBySales.findIndex((p) => p.id === currentUser.id);
  const podium = topBySales.slice(0, 3);
  const rest = topBySales.slice(3);

  // Find the rank just above current user for motivational message
  const currentUserSalesCount =
    currentUserRank >= 0 ? topBySales[currentUserRank]._count.sales : 0;
  const rankAbove =
    currentUserRank > 0 ? topBySales[currentUserRank - 1] : null;
  const salesGap = rankAbove
    ? rankAbove._count.sales - currentUserSalesCount
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="🏆 Classement des partenaires"
        subtitle={`Classement général — ${monthName()}`}
      />

      {/* Motivational banner for current user */}
      {currentUserRank >= 0 && rankAbove && salesGap > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 px-5 py-4 text-white shadow-md">
          <p className="text-sm font-semibold">
            💪 Continuez ! Encore{" "}
            <strong>
              {salesGap} vente{salesGap > 1 ? "s" : ""}
            </strong>{" "}
            vous séparent du rang{" "}
            <strong>#{currentUserRank}</strong> (
            {rankAbove.firstName} {rankAbove.lastName})
          </p>
        </div>
      )}

      {currentUserRank === 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-4 text-white shadow-md">
          <p className="text-sm font-bold">
            🥇 Félicitations ! Vous êtes en tête du classement !
          </p>
        </div>
      )}

      {/* ── Tabs placeholder (same data, both tabs) ── */}
      <div className="flex gap-2">
        <span className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">
          Ce mois
        </span>
        <span className="rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm cursor-default">
          Tout temps
        </span>
      </div>

      {/* ── Podium top 3 ── */}
      {podium.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {podium.map((partner, i) => {
            const isMe = partner.id === currentUser.id;
            const colors = STATUS_COLORS[partner.status] ?? STATUS_COLORS.STARTER;
            return (
              <div
                key={partner.id}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${PODIUM_GRADIENTS[i]} p-5 text-white shadow-lg ring-2 ${PODIUM_RING[i]} ${isMe ? "ring-offset-2" : ""}`}
              >
                <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-white/15 blur-sm" />
                <div className="flex flex-col items-center text-center gap-3">
                  <span className="text-3xl">{MEDALS[i]}</span>
                  {partner.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={partner.photoUrl}
                      alt={`${partner.firstName} ${partner.lastName}`}
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-white/60"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/25 ring-2 ring-white/60 text-lg font-bold">
                      {getInitials(partner.firstName, partner.lastName)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-base leading-tight">
                      {partner.firstName} {partner.lastName}
                      {isMe && (
                        <span className="ml-1 text-xs font-semibold opacity-80">
                          (vous)
                        </span>
                      )}
                    </p>
                    <span
                      className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${colors.badge}`}
                    >
                      {STATUS_LABELS[partner.status]}
                    </span>
                    {partner.city && (
                      <p className="mt-0.5 text-xs opacity-70">
                        📍 {partner.city}
                        {partner.country ? `, ${partner.country}` : ""}
                      </p>
                    )}
                  </div>
                  <div className="rounded-xl bg-white/20 px-4 py-2 text-center">
                    <p className="text-2xl font-bold">{partner._count.sales}</p>
                    <p className="text-xs opacity-80">ventes</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Ranks 4-20 table ── */}
      {rest.length > 0 && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wide w-14">
                    Rang
                  </th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">
                    Partenaire
                  </th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide hidden sm:table-cell">
                    Statut
                  </th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide hidden md:table-cell">
                    Localisation
                  </th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide text-right">
                    Ventes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rest.map((partner, i) => {
                  const rank = i + 4; // starts at 4
                  const isMe = partner.id === currentUser.id;
                  return (
                    <tr
                      key={partner.id}
                      className={`transition-colors ${
                        isMe
                          ? "bg-blue-50 font-semibold"
                          : "hover:bg-slate-50/60"
                      }`}
                    >
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ring-1 ring-inset ${getRankStyle(rank - 1)}`}
                        >
                          {rank}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          {partner.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={partner.photoUrl}
                              alt=""
                              className="h-8 w-8 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 shrink-0">
                              {getInitials(partner.firstName, partner.lastName)}
                            </div>
                          )}
                          <span className="font-medium text-slate-800 truncate">
                            {partner.firstName} {partner.lastName}
                          </span>
                          {isMe && (
                            <Badge tone="blue">← Vous</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <Badge tone="gray">
                          {STATUS_LABELS[partner.status] ?? partner.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-slate-500 text-xs hidden md:table-cell">
                        {partner.city
                          ? `📍 ${partner.city}${partner.country ? `, ${partner.country}` : ""}`
                          : "—"}
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-slate-800">
                        {partner._count.sales}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Current user rank card (if not in top 20) ── */}
      {currentUserRank === -1 && (
        <Card className="p-5">
          <p className="text-sm font-semibold text-slate-700 mb-1">
            Votre position actuelle
          </p>
          <p className="text-slate-500 text-sm">
            Vous n&apos;apparaissez pas encore dans le top 20. Continuez à
            enregistrer des ventes pour y figurer !
          </p>
          <div className="mt-3 flex items-center gap-3">
            {currentUser.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentUser.photoUrl}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                {getInitials(currentUser.firstName, currentUser.lastName)}
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-800">
                {currentUser.firstName} {currentUser.lastName}
              </p>
              <Badge tone="gray">
                {STATUS_LABELS[currentUser.status]}
              </Badge>
            </div>
          </div>
        </Card>
      )}

      <p className="text-xs text-slate-400 text-center pb-2">
        Classement basé sur le nombre total de ventes confirmées
      </p>
    </div>
  );
}

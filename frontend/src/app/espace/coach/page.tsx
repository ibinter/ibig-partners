import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { getNetwork } from "@/lib/metrics";
import { fcfa } from "@/lib/format";
import { STATUS_DETAILS } from "@/lib/constants";
import { CoachChat } from "./CoachChat";

export const dynamic = "force-dynamic";

export default async function CoachPage() {
  const user = await requireUser();

  const [salesCount, commissionsAgg, networkRaw, linksCount] = await Promise.all([
    prisma.sale.count({ where: { sellerId: user.id, status: "CONFIRMED" } }),
    prisma.commission.aggregate({
      where: { userId: user.id },
      _sum: { amount: true },
    }),
    getNetwork(user.id),
    prisma.affiliateLink.count({ where: { userId: user.id } }),
  ]);

  const directCount  = networkRaw.filter((m: any) => m.level === 1).length;
  const activeCount  = networkRaw.filter((m: any) => m.active).length;
  const totalComm    = commissionsAgg._sum.amount ?? 0;

  const currentIdx   = STATUS_DETAILS.findIndex((s) => s.status === user.status);
  const nextStatus   = STATUS_DETAILS[currentIdx + 1] ?? null;

  return (
    <div className="space-y-5">
      <PageHeader
        title="✨ Coach IA"
        subtitle="Votre assistant personnel pour vendre, recruter et performer"
      />

      <CoachChat
        partnerName={`${user.firstName} ${user.lastName}`}
        partnerStatus={user.status}
        partnerCity={user.city ?? ""}
        partnerCode={user.code}
        salesCount={salesCount}
        totalComm={totalComm}
        totalCommDisplay={fcfa(totalComm)}
        directCount={directCount}
        activeCount={activeCount}
        linksCount={linksCount}
        networkTotal={networkRaw.length}
        nextStatusLabel={nextStatus?.label ?? null}
        nextSalesMissing={nextStatus ? Math.max(0, nextStatus.sales - salesCount) : 0}
        nextDirectMissing={nextStatus ? Math.max(0, nextStatus.direct - directCount) : 0}
      />
    </div>
  );
}

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ComparaisonClient from "./comparaison-client";

export const dynamic = "force-dynamic";

export default async function ComparaisonPage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const selectedIds = sp.ids ? sp.ids.split(",").filter(Boolean).slice(0, 5) : [];

  const allPartners = await prisma.user.findMany({
    where: { role: "PARTNER", active: true, approved: true },
    select: { id: true, firstName: true, lastName: true, code: true, status: true },
    orderBy: { lastName: "asc" },
  });

  let compareData: any[] = [];
  if (selectedIds.length > 1) {
    compareData = await Promise.all(selectedIds.map(async (id) => {
      const u = allPartners.find((p) => p.id === id);
      if (!u) return null;
      const [sales, commAgg, referrals, leads, score] = await Promise.all([
        prisma.sale.count({ where: { sellerId: id, status: "CONFIRMED" } }),
        prisma.commission.aggregate({ where: { userId: id, status: "PAID" }, _sum: { amount: true } }),
        prisma.user.count({ where: { sponsorId: id } }),
        prisma.opportunityLead.count({ where: { userId: id, status: "WON" } }),
        Promise.resolve(0),
      ]);
      const s = Math.min(100, sales * 5 + referrals * 3 + leads * 10);
      return {
        id, name: `${u.firstName} ${u.lastName}`, code: u.code, status: u.status,
        sales, commissions: (commAgg._sum.amount ?? 0) / 1000, referrals, leads, score: s,
      };
    }));
    compareData = compareData.filter(Boolean);
  }

  return <ComparaisonClient allPartners={allPartners} selectedIds={selectedIds} compareData={compareData} />;
}

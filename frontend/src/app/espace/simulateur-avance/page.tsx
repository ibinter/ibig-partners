import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import SimulateurAvanceClient from "./simulateur-avance-client";

export const dynamic = "force-dynamic";

export default async function SimulateurAvancePage() {
  const user = await requireUser();

  const [totalSales, commRate, referrals] = await Promise.all([
    prisma.sale.count({ where: { sellerId: user.id, status: "CONFIRMED" } }),
    prisma.commission.aggregate({ where: { userId: user.id }, _sum: { amount: true }, _count: { id: true } }),
    prisma.user.count({ where: { sponsorId: user.id } }),
  ]);

  const avgCommission = commRate._count.id > 0 ? Math.round((commRate._sum.amount ?? 0) / commRate._count.id) : 25000;

  return (
    <div className="space-y-6">
      <PageHeader title="Simulateur Revenus Avancé" subtitle="Projections 3 / 6 / 12 mois basées sur votre activité réelle." />
      <SimulateurAvanceClient
        baseSalesPerMonth={Math.max(1, Math.round(totalSales / 6))}
        avgCommission={avgCommission}
        referrals={referrals}
      />
    </div>
  );
}

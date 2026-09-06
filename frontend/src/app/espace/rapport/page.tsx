import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import Link from "next/link";
import RapportClient from "./rapport-client";

export const dynamic = "force-dynamic";

export default async function RapportPage() {
  const user = await requireUser();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const monthLabel = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const [
    // Mois en cours
    salesThisMonth,
    commThisMonth,
    referralsThisMonth,
    // Mois précédent
    salesPrevMonth,
    commPrevMonth,
    // Classement
    allPartnerSales,
    // Leads
    myLeadsThisMonth,
    // Appels
    myCallInvites,
    // Opportunités soumises ce mois
    myOppsThisMonth,
  ] = await Promise.all([
    prisma.sale.findMany({
      where: { sellerId: user.id, createdAt: { gte: startOfMonth } },
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.commission.aggregate({
      where: { userId: user.id, createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.user.count({
      where: { sponsorId: user.id, createdAt: { gte: startOfMonth } },
    }),
    prisma.sale.count({
      where: { sellerId: user.id, createdAt: { gte: startOfPrevMonth, lte: endOfPrevMonth } },
    }),
    prisma.commission.aggregate({
      where: { userId: user.id, createdAt: { gte: startOfPrevMonth, lte: endOfPrevMonth } },
      _sum: { amount: true },
    }),
    prisma.sale.groupBy({
      by: ["sellerId"],
      where: { status: "CONFIRMED", createdAt: { gte: startOfMonth } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    (prisma as any).opportunityLead.findMany({
      where: { userId: user.id, createdAt: { gte: startOfMonth } },
      include: { opportunity: { select: { title: true, code: true } } },
      orderBy: { createdAt: "desc" },
    }),
    (prisma as any).partnerCallInvitation.findMany({
      where: { userId: user.id, createdAt: { gte: startOfMonth } },
      include: { call: { select: { title: true, status: true } } },
      orderBy: { sentAt: "desc" },
    }),
    (prisma as any).opportunity.findMany({
      where: { userId: user.id, createdAt: { gte: startOfMonth } },
      select: { id: true, title: true, code: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Classement
  const rank = allPartnerSales.findIndex((r: any) => r.sellerId === user.id) + 1;
  const totalRanked = allPartnerSales.length;

  // Totaux mois en cours
  const salesCountThisMonth = salesThisMonth.length;
  const commAmountThisMonth = commThisMonth._sum.amount ?? 0;
  const commAmountPrevMonth = commPrevMonth._sum.amount ?? 0;

  // Score perf (même algo que admin)
  const [totalSales, totalReferrals, totalWonLeads, kybStatusRow, totalCallsAccepted, totalOpps] = await Promise.all([
    prisma.sale.count({ where: { sellerId: user.id } }),
    prisma.user.count({ where: { sponsorId: user.id } }),
    (prisma as any).opportunityLead.count({ where: { userId: user.id, status: "WON" } }),
    prisma.user.findUnique({ where: { id: user.id }, select: { kybStatus: true } as any }),
    (prisma as any).partnerCallInvitation.count({ where: { userId: user.id, status: "ACCEPTED" } }),
    (prisma as any).opportunity.count({ where: { userId: user.id } }),
  ]);

  function computeScore() {
    let s = 0;
    s += Math.min(totalSales * 5, 30);
    s += Math.min(totalReferrals * 3, 20);
    s += Math.min(totalWonLeads * 10, 20);
    if ((kybStatusRow as any)?.kybStatus === "VERIFIED") s += 10;
    s += Math.min(totalCallsAccepted * 5, 10);
    s += Math.min(totalOpps * 2, 10);
    return Math.min(s, 100);
  }

  const score = computeScore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <PageHeader
          title={`Rapport — ${monthLabel}`}
          subtitle="Résumé de votre activité du mois en cours."
        />
        <Link href="/api/espace/rapport-pdf" target="_blank"
          className="shrink-0 rounded-xl bg-slate-800 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-700 transition-colors">
          📄 Télécharger PDF
        </Link>
      </div>
      <RapportClient
        monthLabel={monthLabel}
        kpis={{
          salesCount: salesCountThisMonth,
          salesCountPrev: salesPrevMonth,
          commAmount: commAmountThisMonth,
          commAmountPrev: commAmountPrevMonth,
          referralsCount: referralsThisMonth,
          rank: rank || null,
          totalRanked,
          score,
          leadsCount: myLeadsThisMonth.length,
          callsCount: myCallInvites.length,
          oppsCount: myOppsThisMonth.length,
        }}
        sales={salesThisMonth.map((s: any) => ({
          id: s.id,
          reference: s.reference,
          productName: s.product.name,
          amount: s.amount,
          status: s.status,
          date: s.createdAt instanceof Date ? s.createdAt.toISOString() : String(s.createdAt),
        }))}
        leads={myLeadsThisMonth.map((l: any) => ({
          id: l.id,
          oppTitle: l.opportunity.title,
          oppCode: l.opportunity.code ?? "",
          status: l.status,
          date: l.createdAt instanceof Date ? l.createdAt.toISOString() : String(l.createdAt),
        }))}
        calls={myCallInvites.map((i: any) => ({
          id: i.id,
          callTitle: i.call.title,
          callStatus: i.call.status,
          status: i.status,
          date: i.sentAt instanceof Date ? i.sentAt.toISOString() : String(i.sentAt),
        }))}
        opps={myOppsThisMonth.map((o: any) => ({
          id: o.id,
          title: o.title,
          code: o.code ?? "",
          status: o.status,
          date: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
        }))}
      />
    </div>
  );
}

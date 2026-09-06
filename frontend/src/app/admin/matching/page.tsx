import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import MatchingDashboardClient from "./matching-dashboard-client";

export const dynamic = "force-dynamic";

export default async function MatchingDashboardPage() {
  await requireAdmin();

  const [allMatches, allLeads, allCalls, allCallInvitations] = await Promise.all([
    (prisma as any).opportunityMatch.findMany({
      include: {
        opportunity: { select: { id: true, title: true, code: true, category: true } },
        user: { select: { id: true, firstName: true, lastName: true, code: true, status: true } },
      },
    }),
    (prisma as any).opportunityLead.findMany({
      select: { id: true, opportunityId: true, userId: true, status: true, createdAt: true },
    }),
    (async () => { try { return await (prisma as any).partnerCall.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, title: true, status: true, category: true, createdAt: true } }); } catch { return []; } })(),
    (async () => { try { return await (prisma as any).partnerCallInvitation.findMany({ select: { id: true, callId: true, userId: true, status: true, sentAt: true } }); } catch { return []; } })(),
  ]);

  // --- Opportunité stats ---
  const oppMap = new Map<string, { title: string; code: string; category: string; matches: number; invited: number; accepted: number; declined: number; leads: number }>();
  for (const m of allMatches) {
    const key = m.opportunityId;
    if (!oppMap.has(key)) {
      oppMap.set(key, { title: m.opportunity.title, code: m.opportunity.code ?? "", category: m.opportunity.category ?? "AUTRE", matches: 0, invited: 0, accepted: 0, declined: 0, leads: 0 });
    }
    const row = oppMap.get(key)!;
    row.matches++;
    if (m.status === "INVITED") row.invited++;
    if (m.status === "ACCEPTED") { row.invited++; row.accepted++; }
    if (m.status === "DECLINED") row.declined++;
  }
  for (const l of allLeads) {
    const row = oppMap.get(l.opportunityId);
    if (row) row.leads++;
  }

  // --- Partenaire stats ---
  const partnerMap = new Map<string, { name: string; code: string; status: string; invitations: number; accepted: number; totalScore: number; scoreCount: number }>();
  for (const m of allMatches) {
    const key = m.userId;
    if (!partnerMap.has(key)) {
      partnerMap.set(key, { name: `${m.user.firstName} ${m.user.lastName}`, code: m.user.code, status: m.user.status, invitations: 0, accepted: 0, totalScore: 0, scoreCount: 0 });
    }
    const row = partnerMap.get(key)!;
    row.totalScore += m.score;
    row.scoreCount++;
    if (m.status === "INVITED" || m.status === "ACCEPTED") row.invitations++;
    if (m.status === "ACCEPTED") row.accepted++;
  }

  // --- KPIs globaux ---
  const totalMatches = allMatches.length;
  const totalInvited = allMatches.filter((m: any) => m.status === "INVITED" || m.status === "ACCEPTED").length;
  const totalAccepted = allMatches.filter((m: any) => m.status === "ACCEPTED").length;
  const totalLeads = allLeads.length;
  const wonLeads = allLeads.filter((l: any) => l.status === "WON").length;

  const callInvitedCount = allCallInvitations.length;
  const callAcceptedCount = allCallInvitations.filter((i: any) => i.status === "ACCEPTED").length;
  const openCalls = allCalls.filter((c: any) => c.status === "OPEN").length;

  // --- Appels stats ---
  const callStatsMap = new Map<string, { title: string; status: string; total: number; accepted: number; declined: number }>();
  for (const c of allCalls) {
    callStatsMap.set(c.id, { title: c.title, status: c.status, total: 0, accepted: 0, declined: 0 });
  }
  for (const i of allCallInvitations) {
    const row = callStatsMap.get(i.callId);
    if (row) {
      row.total++;
      if (i.status === "ACCEPTED") row.accepted++;
      if (i.status === "DECLINED") row.declined++;
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Matching"
        subtitle="Vue globale du matching automatisé : scores, invitations, conversions."
      />
      <MatchingDashboardClient
        kpis={{ totalMatches, totalInvited, totalAccepted, totalLeads, wonLeads, callInvitedCount, callAcceptedCount, openCalls }}
        oppRows={Array.from(oppMap.entries()).map(([id, v]) => ({ id, ...v }))}
        partnerRows={Array.from(partnerMap.entries()).map(([id, v]) => ({ id, avgScore: v.scoreCount > 0 ? Math.round(v.totalScore / v.scoreCount) : 0, ...v }))}
        callRows={Array.from(callStatsMap.entries()).map(([id, v]) => ({ id, ...v }))}
      />
    </div>
  );
}

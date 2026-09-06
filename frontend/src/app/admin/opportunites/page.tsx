import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import {
  updateOpportunity, sendOpportunityMessage,
  approveOpportunity, rejectOpportunity,
  addOpportunityShare, removeOpportunityShare,
  confirmOpportunityShares, markSharePaid,
  updateLeadStatus, addLeadNote,
} from "../actions";
import OpportunitesClient from "./opportunites-client";
import { ExportButton } from "@/components/export-button";
import { computeOpportunityMatches, inviteMatchedPartner, declineMatch } from "./matching-actions";

export const dynamic = "force-dynamic";

export default async function OpportunitesPage() {
  await requireAdmin();

  const [opportunities, allMatches, allLeads, allActivities] = await Promise.all([
    (prisma as any).opportunity.findMany({
      orderBy: [{ createdAt: "desc" }],
      include: {
        user: { select: { firstName: true, lastName: true, code: true, phone: true } },
        messages: { orderBy: { createdAt: "asc" } },
        _count: { select: { leads: true } },
        shares: {
          include: { user: { select: { firstName: true, lastName: true, code: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    (prisma as any).opportunityMatch.findMany({
      orderBy: { score: "desc" },
      include: { user: { select: { firstName: true, lastName: true, code: true, status: true } } },
    }),
    (prisma as any).opportunityLead.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { firstName: true, lastName: true, code: true, status: true, phone: true } } },
    }),
    (prisma as any).opportunityActivity.findMany({
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const matchesByOpp = new Map<string, any[]>();
  for (const m of allMatches) {
    if (!matchesByOpp.has(m.opportunityId)) matchesByOpp.set(m.opportunityId, []);
    matchesByOpp.get(m.opportunityId)!.push(m);
  }

  const leadsByOpp = new Map<string, any[]>();
  for (const l of allLeads) {
    if (!leadsByOpp.has(l.opportunityId)) leadsByOpp.set(l.opportunityId, []);
    leadsByOpp.get(l.opportunityId)!.push(l);
  }

  const activitiesByOpp = new Map<string, any[]>();
  for (const a of allActivities) {
    if (!activitiesByOpp.has(a.opportunityId)) activitiesByOpp.set(a.opportunityId, []);
    activitiesByOpp.get(a.opportunityId)!.push(a);
  }

  const rows = opportunities.map((o: any) => ({
    id: o.id,
    code: o.code ?? "",
    title: o.title,
    category: o.category ?? "AUTRE",
    description: o.description,
    estimatedValue: o.estimatedValue,
    status: o.status,
    handler: o.handler ?? "",
    visibility: o.visibility ?? "PRIVATE",
    commission: o.commission ?? 0,
    commissionType: o.commissionType ?? "FIXED",
    adminNote: o.adminNote ?? "",
    leadCount: o._count?.leads ?? 0,
    createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
    partnerName: `${o.user.firstName} ${o.user.lastName}`,
    partnerCode: o.user.code,
    partnerPhone: o.user.phone ?? "",
    messages: (o.messages ?? []).map((m: any) => ({
      id: m.id,
      fromAdmin: m.fromAdmin,
      senderName: m.senderName,
      body: m.body,
      createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
    })),
    shares: (o.shares ?? []).map((s: any) => ({
      id: s.id,
      userId: s.userId,
      partnerName: `${s.user.firstName} ${s.user.lastName}`,
      partnerCode: s.user.code,
      role: s.role,
      shareAmount: s.shareAmount,
      shareType: s.shareType,
      note: s.note ?? "",
      status: s.status,
      createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : String(s.createdAt),
    })),
    matches: (matchesByOpp.get(o.id) ?? []).map((m: any) => ({
      id: m.id,
      userId: m.userId,
      partnerName: `${m.user.firstName} ${m.user.lastName}`,
      partnerCode: m.user.code,
      partnerStatus: m.user.status,
      score: m.score,
      status: m.status,
    })),
    leads: (leadsByOpp.get(o.id) ?? []).map((l: any) => ({
      id: l.id,
      userId: l.userId,
      partnerName: `${l.user.firstName} ${l.user.lastName}`,
      partnerCode: l.user.code,
      partnerStatus: l.user.status,
      partnerPhone: l.user.phone ?? "",
      status: l.status,
      note: l.note ?? "",
      result: l.result ?? "",
      createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : String(l.createdAt),
    })),
    activities: (activitiesByOpp.get(o.id) ?? []).map((a: any) => ({
      id: a.id,
      leadId: a.leadId ?? null,
      type: a.type,
      content: a.content,
      createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt),
    })),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opportunités B2B"
        subtitle="Pistes commerciales soumises par les partenaires — approuvez pour les rendre visibles à tout le réseau."
        action={<ExportButton type="opportunites" label="Exporter CSV" />}
      />
      <OpportunitesClient
        rows={rows}
        updateAction={updateOpportunity}
        messageAction={sendOpportunityMessage}
        approveAction={approveOpportunity}
        rejectAction={rejectOpportunity}
        addShareAction={addOpportunityShare}
        removeShareAction={removeOpportunityShare}
        confirmSharesAction={confirmOpportunityShares}
        markSharePaidAction={markSharePaid}
        computeMatchesAction={computeOpportunityMatches}
        inviteMatchAction={inviteMatchedPartner}
        declineMatchAction={declineMatch}
        updateLeadStatusAction={updateLeadStatus}
        addLeadNoteAction={addLeadNote}
      />
    </div>
  );
}

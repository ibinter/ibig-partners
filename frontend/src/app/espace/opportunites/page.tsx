import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { replyToOpportunity, submitOpportunity, expressInterest } from "../actions";
import OpportunitesAffilieClient from "./opportunites-affilie-client";

export const dynamic = "force-dynamic";

export default async function EspaceOpportunitesPage() {
  const user = await requireUser();

  const [myOpportunities, publicOpportunities, myLeads] = await Promise.all([
    // Mes soumissions
    (prisma as any).opportunity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    }),
    // Opportunités publiques approuvées (toutes)
    (prisma as any).opportunity.findMany({
      where: { visibility: "PUBLIC", status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { leads: true } },
      },
    }),
    // Mes candidatures
    (prisma as any).opportunityLead.findMany({
      where: { userId: user.id },
      select: { opportunityId: true, status: true, createdAt: true },
    }),
  ]);

  const myLeadMap = new Map(myLeads.map((l: any) => [l.opportunityId, l]));

  const myRows = myOpportunities.map((o: any) => ({
    id: o.id,
    title: o.title,
    category: o.category ?? "AUTRE",
    description: o.description,
    estimatedValue: o.estimatedValue,
    status: o.status,
    handler: o.handler ?? "",
    adminNote: o.adminNote ?? "",
    commission: o.commission ?? 0,
    commissionType: o.commissionType ?? "FIXED",
    createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
    messages: o.messages.map((m: any) => ({
      id: m.id,
      fromAdmin: m.fromAdmin,
      senderName: m.senderName,
      body: m.body,
      createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
    })),
    unreadCount: o.messages.filter((m: any) => m.fromAdmin).length,
  }));

  const publicRows = publicOpportunities.map((o: any) => ({
    id: o.id,
    title: o.title,
    category: o.category ?? "AUTRE",
    description: o.description,
    estimatedValue: o.estimatedValue,
    commission: o.commission ?? 0,
    commissionType: o.commissionType ?? "FIXED",
    adminNote: o.adminNote ?? "",
    deadline: o.deadline ? (o.deadline instanceof Date ? o.deadline.toISOString() : String(o.deadline)) : null,
    leadCount: o._count?.leads ?? 0,
    createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
    myLead: myLeadMap.get(o.id) ? {
      status: myLeadMap.get(o.id).status,
      createdAt: myLeadMap.get(o.id).createdAt instanceof Date
        ? myLeadMap.get(o.id).createdAt.toISOString()
        : String(myLeadMap.get(o.id).createdAt),
    } : null,
  }));

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Opportunités B2B"
        subtitle="Soumettez vos pistes commerciales et exploitez les opportunités IBIG."
      />
      <OpportunitesAffilieClient
        myRows={myRows}
        publicRows={publicRows}
        replyAction={replyToOpportunity}
        submitAction={submitOpportunity}
        interestAction={expressInterest}
      />
    </div>
  );
}

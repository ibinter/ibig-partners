import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa, formatDate } from "@/lib/format";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { updateOpportunity, sendOpportunityMessage } from "../actions";
import OpportunitesClient from "./opportunites-client";

export const dynamic = "force-dynamic";

export default async function OpportunitesPage() {
  await requireAdmin();

  const opportunities = await (prisma as any).opportunity.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      user: { select: { firstName: true, lastName: true, code: true, phone: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  const rows = opportunities.map((o: any) => ({
    id: o.id,
    title: o.title,
    description: o.description,
    estimatedValue: o.estimatedValue,
    status: o.status,
    handler: o.handler ?? "",
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
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opportunités B2B"
        subtitle="Pistes commerciales transmises par le réseau de partenaires."
      />
      <OpportunitesClient rows={rows} updateAction={updateOpportunity} messageAction={sendOpportunityMessage} />
    </div>
  );
}

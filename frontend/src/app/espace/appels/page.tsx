import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import AppelsPartnerClient from "./appels-partner-client";
import { respondToCall } from "./appels-partner-actions";

export const dynamic = "force-dynamic";

export default async function EspaceAppelsPage() {
  const user = await requireUser();

  const invitations = await (prisma as any).partnerCallInvitation.findMany({
    where: { userId: user.id },
    orderBy: { sentAt: "desc" },
    include: {
      call: {
        select: { id: true, title: true, description: true, category: true, deadline: true, status: true },
      },
    },
  });

  const rows = invitations.map((inv: any) => ({
    id: inv.id,
    callId: inv.callId,
    callTitle: inv.call.title,
    callDescription: inv.call.description,
    callCategory: inv.call.category,
    callDeadline: inv.call.deadline
      ? (inv.call.deadline instanceof Date ? inv.call.deadline.toISOString() : String(inv.call.deadline))
      : null,
    callStatus: inv.call.status,
    status: inv.status,
    sentAt: inv.sentAt instanceof Date ? inv.sentAt.toISOString() : String(inv.sentAt),
  }));

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Appels à partenaires"
        subtitle="IBIG vous invite à rejoindre des missions et opportunités ciblées."
      />
      <AppelsPartnerClient invitations={rows} respondAction={respondToCall} />
    </div>
  );
}

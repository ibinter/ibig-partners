import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import AppelsAdminClient from "./appels-admin-client";
import { createPartnerCall, sendCallInvitations, closePartnerCall } from "./appels-actions";

export const dynamic = "force-dynamic";

export default async function AdminAppelsPage() {
  await requireAdmin();

  const calls = await (prisma as any).partnerCall.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { invitations: true } },
      invitations: { where: { status: "ACCEPTED" }, select: { id: true } },
    },
  });

  const rows = calls.map((c: any) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    targetZone: c.targetZone ?? null,
    targetStatus: c.targetStatus ?? null,
    deadline: c.deadline ? (c.deadline instanceof Date ? c.deadline.toISOString() : String(c.deadline)) : null,
    status: c.status,
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
    invCount: c._count.invitations,
    acceptedCount: c.invitations.length,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appels à partenaires"
        subtitle="Créez des appels ciblés et invitez automatiquement les partenaires matchés."
      />
      <AppelsAdminClient
        rows={rows}
        createAction={createPartnerCall}
        sendInvitationsAction={sendCallInvitations}
        closeAction={closePartnerCall}
      />
    </div>
  );
}

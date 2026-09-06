import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import KybAdminClient from "./kyb-client";
import { approveKybUser, rejectKybUser, approveKybDoc, rejectKybDoc } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminKybPage() {
  await requireAdmin();

  // Tous les documents KYB
  const allDocs = await (prisma as any).kybDocument.findMany({
    orderBy: { createdAt: "asc" },
  });

  // Ids des partenaires ayant au moins un doc
  const userIds: string[] = Array.from(new Set<string>(allDocs.map((d: any) => String(d.userId))));

  // Infos partenaires
  const users = userIds.length > 0
    ? await (prisma as any).user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, firstName: true, lastName: true, code: true, phone: true, kybStatus: true, createdAt: true },
      })
    : [];

  const docsByUser = new Map<string, any[]>();
  for (const d of allDocs) {
    if (!docsByUser.has(d.userId)) docsByUser.set(d.userId, []);
    docsByUser.get(d.userId)!.push(d);
  }

  const rows = users.map((u: any) => ({
    userId:      u.id,
    partnerName: `${u.firstName} ${u.lastName}`,
    partnerCode: u.code ?? "",
    partnerPhone: u.phone ?? "",
    kybStatus:   (u.kybStatus as string) ?? "NONE",
    docs: (docsByUser.get(u.id) ?? []).map((d: any) => ({
      id:        d.id,
      docType:   d.docType,
      docName:   d.docName,
      fileUrl:   d.fileUrl,
      note:      d.note ?? "",
      status:    d.status,
      adminNote: d.adminNote ?? "",
      createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : String(d.createdAt),
    })),
  })).sort((a: any, b: any) => {
    // SUBMITTED first
    const order: Record<string, number> = { SUBMITTED: 0, REJECTED: 1, NONE: 2, VERIFIED: 3 };
    return (order[a.kybStatus] ?? 4) - (order[b.kybStatus] ?? 4);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="KYB Entreprise"
        subtitle="Vérification des dossiers entreprise — validez pour activer le badge Entreprise vérifiée."
      />
      <KybAdminClient
        rows={rows}
        approveUserAction={approveKybUser}
        rejectUserAction={rejectKybUser}
        approveDocAction={approveKybDoc}
        rejectDocAction={rejectKybDoc}
      />
    </div>
  );
}

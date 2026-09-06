import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { approveNeed, rejectNeed, updateNeedStatus } from "../actions";
import BesoinsAdminClient from "./besoins-client";

export const dynamic = "force-dynamic";

export default async function AdminBesoinsPage() {
  await requireAdmin();

  const needs = await (prisma as any).need.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      user: { select: { firstName: true, lastName: true, code: true, phone: true } },
      _count: { select: { responses: true } },
    },
  });

  const rows = needs.map((n: any) => ({
    id: n.id,
    code: n.code ?? "",
    title: n.title,
    category: n.category ?? "AUTRE",
    description: n.description,
    budget: n.budget ?? 0,
    location: n.location ?? "",
    status: n.status,
    visibility: n.visibility ?? "PRIVATE",
    adminNote: n.adminNote ?? "",
    commission: n.commission ?? 0,
    commissionType: n.commissionType ?? "FIXED",
    responseCount: n._count?.responses ?? 0,
    createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : String(n.createdAt),
    partnerName: `${n.user.firstName} ${n.user.lastName}`,
    partnerCode: n.user.code,
    partnerPhone: n.user.phone ?? "",
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Besoins B2B"
        subtitle="Besoins soumis par les partenaires — approuvez pour diffuser au réseau."
      />
      <BesoinsAdminClient
        rows={rows}
        approveAction={approveNeed}
        rejectAction={rejectNeed}
        updateAction={updateNeedStatus}
      />
    </div>
  );
}

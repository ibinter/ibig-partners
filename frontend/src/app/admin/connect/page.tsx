import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { updateConnectStatus } from "../actions";
import ConnectAdminClient from "./connect-admin-client";

export const dynamic = "force-dynamic";

export default async function AdminConnectPage() {
  await requireAdmin();

  const requests = await (prisma as any).connectRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { firstName: true, lastName: true, code: true, phone: true, email: true } } },
  });

  const rows = requests.map((r: any) => ({
    id: r.id,
    title: r.title,
    connectionType: r.connectionType,
    needSide: r.needSide,
    provideSide: r.provideSide,
    zone: r.zone,
    estimatedValue: r.estimatedValue,
    commissionEstimate: r.commissionEstimate,
    status: r.status,
    adminNote: r.adminNote ?? "",
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    partnerName: `${r.user.firstName} ${r.user.lastName}`,
    partnerCode: r.user.code,
    partnerPhone: r.user.phone ?? "",
    partnerEmail: r.user.email,
  }));

  const stats = {
    total: rows.length,
    new: rows.filter((r: any) => r.status === "NEW").length,
    analyzing: rows.filter((r: any) => r.status === "ANALYZING").length,
    matched: rows.filter((r: any) => r.status === "MATCHED").length,
    completed: rows.filter((r: any) => r.status === "COMPLETED").length,
    totalValue: rows.reduce((s: number, r: any) => s + r.estimatedValue, 0),
    totalCommissions: rows.filter((r: any) => r.status === "COMPLETED").reduce((s: number, r: any) => s + r.commissionEstimate, 0),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="IBIG CONNECT"
        subtitle="Mises en relation soumises par les partenaires."
      />
      <ConnectAdminClient rows={rows} stats={stats} updateAction={updateConnectStatus} />
    </div>
  );
}

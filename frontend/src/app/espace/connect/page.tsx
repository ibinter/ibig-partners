import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { submitConnectRequest } from "../actions";
import ConnectClient from "./connect-client";

export const dynamic = "force-dynamic";

export default async function ConnectPage() {
  const user = await requireUser();

  const requests = await (prisma as any).connectRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
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
  }));

  const stats = {
    total: rows.length,
    matched: rows.filter((r: any) => r.status === "MATCHED" || r.status === "COMPLETED").length,
    pending: rows.filter((r: any) => r.status === "NEW" || r.status === "ANALYZING").length,
    earned: rows.filter((r: any) => r.status === "COMPLETED").reduce((s: number, r: any) => s + r.commissionEstimate, 0),
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="IBIG CONNECT"
        subtitle="Mettez en relation deux parties et gagnez une commission d'intermédiation."
      />
      <ConnectClient rows={rows} stats={stats} submitAction={submitConnectRequest} />
    </div>
  );
}

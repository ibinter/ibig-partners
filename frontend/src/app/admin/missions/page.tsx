import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { createMission, updateMissionStatus, updateApplicationStatus } from "../actions";
import MissionsAdminClient from "./missions-admin-client";

export const dynamic = "force-dynamic";

export default async function AdminMissionsPage() {
  await requireAdmin();

  const missions = await (prisma as any).mission.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      applications: {
        include: { user: { select: { firstName: true, lastName: true, code: true, phone: true, email: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const rows = missions.map((m: any) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    category: m.category,
    missionType: m.missionType,
    compensationType: m.compensationType,
    compensationAmount: m.compensationAmount,
    zone: m.zone,
    difficulty: m.difficulty,
    slots: m.slots,
    deadline: m.deadline ? (m.deadline instanceof Date ? m.deadline.toISOString() : String(m.deadline)) : null,
    status: m.status,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
    applications: m.applications.map((a: any) => ({
      id: a.id,
      status: a.status,
      note: a.note ?? "",
      result: a.result ?? "",
      createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt),
      partnerName: `${a.user.firstName} ${a.user.lastName}`,
      partnerCode: a.user.code,
      partnerPhone: a.user.phone ?? "",
      partnerEmail: a.user.email,
    })),
  }));

  const stats = {
    total: rows.length,
    open: rows.filter((r: any) => r.status === "OPEN").length,
    applications: rows.reduce((s: number, r: any) => s + r.applications.length, 0),
    pending: rows.reduce((s: number, r: any) => s + r.applications.filter((a: any) => a.status === "PENDING").length, 0),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Missions Partners"
        subtitle="Créez et gérez les missions proposées aux partenaires."
      />
      <MissionsAdminClient
        rows={rows}
        stats={stats}
        createAction={createMission}
        updateStatusAction={updateMissionStatus}
        updateAppAction={updateApplicationStatus}
      />
    </div>
  );
}

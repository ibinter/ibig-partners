import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { applyToMission, withdrawMissionApplication } from "../actions";
import MissionsAffilieClient from "./missions-affilie-client";

export const dynamic = "force-dynamic";

export default async function EspaceMissionsPage() {
  const user = await requireUser();

  const missions = await (prisma as any).mission.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    include: {
      applications: {
        where: { userId: user.id },
        select: { id: true, status: true, note: true, result: true, createdAt: true },
      },
      _count: { select: { applications: true } },
    },
  });

  const myApplications = await (prisma as any).missionApplication.findMany({
    where: { userId: user.id },
    include: { mission: { select: { id: true, title: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows = missions.map((m: any) => {
    const myApp = m.applications[0] ?? null;
    return {
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
      totalApplications: m._count.applications,
      myApplication: myApp ? {
        id: myApp.id,
        status: myApp.status,
        note: myApp.note ?? "",
        result: myApp.result ?? "",
        createdAt: myApp.createdAt instanceof Date ? myApp.createdAt.toISOString() : String(myApp.createdAt),
      } : null,
    };
  });

  const myApps = myApplications.map((a: any) => ({
    id: a.id,
    status: a.status,
    note: a.note ?? "",
    result: a.result ?? "",
    createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt),
    missionId: a.mission.id,
    missionTitle: a.mission.title,
    missionStatus: a.mission.status,
  }));

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Missions Partners"
        subtitle="Sélectionnez des missions concrètes à accomplir et gagnez des primes."
      />
      <MissionsAffilieClient rows={rows} myApps={myApps} applyAction={applyToMission} withdrawAction={withdrawMissionApplication} />
    </div>
  );
}

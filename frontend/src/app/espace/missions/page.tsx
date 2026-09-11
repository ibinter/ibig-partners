import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { applyToMission, withdrawMissionApplication, submitMissionProof } from "../actions";
import MissionsAffilieClient from "./missions-affilie-client";

export const dynamic = "force-dynamic";

export default async function EspaceMissionsPage() {
  const user = await requireUser();

  const [missions, myApplications, mySubmissions, myInterests] = await Promise.all([
    (prisma as any).mission.findMany({
      where: { status: "OPEN", validationStatus: "VALIDATED" },
      orderBy: { createdAt: "desc" },
      include: {
        applications: {
          where: { userId: user.id },
          select: { id: true, status: true, note: true, result: true, createdAt: true, proofUrl: true, proofNote: true, submittedAt: true, cpEarned: true, commissionEarned: true },
        },
        media: { select: { url: true, mediaType: true, name: true } },
        interests: {
          where: { userId: user.id },
          select: { id: true, status: true },
        },
        _count: { select: { applications: true } },
      },
    }),
    (prisma as any).missionApplication.findMany({
      where: { userId: user.id },
      include: { mission: { select: { id: true, title: true, status: true } } },
      orderBy: { createdAt: "desc" },
    }),
    (prisma as any).mission.findMany({
      where: { submittedByUserId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, submissionType: true, validationStatus: true, createdAt: true, rejectionNote: true },
    }),
    (prisma as any).missionInterest.findMany({
      where: { userId: user.id },
      select: { missionId: true, id: true, status: true },
    }),
  ]);

  const rows = missions.map((m: any) => {
    const myApp  = m.applications[0] ?? null;
    const myInt  = myInterests.find((i: any) => i.missionId === m.id) ?? null;
    return {
      id: m.id,
      code: m.code ?? "",
      title: m.title,
      description: m.description,
      category: m.category,
      missionType: m.missionType,
      branch: m.branch ?? "",
      rewardType: m.rewardType ?? "CASH",
      compensationType: m.compensationType,
      compensationAmount: m.compensationAmount,
      cpAmount: m.cpAmount ?? 0,
      minLevel: m.minLevel ?? "",
      proofInstructions: m.proofInstructions ?? "",
      zone: m.zone,
      difficulty: m.difficulty,
      slots: m.slots,
      deadline: m.deadline ? (m.deadline instanceof Date ? m.deadline.toISOString() : String(m.deadline)) : null,
      status: m.status,
      createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
      source: m.source ?? "IBIG",
      submissionType: m.submissionType ?? "MISSION",
      media: (m.media ?? []).map((med: any) => {
        const SUPA_BASE = "https://zuqjuqpldnnfaoycwkcr.supabase.co";
        const BUCKET    = "mission-media";
        let url: string = med.url ?? "";
        if (!url.startsWith("http")) {
          // URL relative genre /storage/v1/... ou nom de fichier brut
          if (url.startsWith("/storage/")) url = `${SUPA_BASE}${url}`;
          else if (url.startsWith("/")) url = `${SUPA_BASE}${url}`;
          else if (url) url = `${SUPA_BASE}/storage/v1/object/public/${BUCKET}/${url}`;
        }
        return { url, mediaType: med.mediaType, name: med.name };
      }),
      myInterest: myInt ? { id: myInt.id, status: myInt.status } : null,
      totalApplications: m._count.applications,
      myApplication: myApp ? {
        id: myApp.id,
        status: myApp.status,
        note: myApp.note ?? "",
        result: myApp.result ?? "",
        proofUrl: myApp.proofUrl ?? "",
        proofNote: myApp.proofNote ?? "",
        submittedAt: myApp.submittedAt ? (myApp.submittedAt instanceof Date ? myApp.submittedAt.toISOString() : String(myApp.submittedAt)) : null,
        cpEarned: myApp.cpEarned ?? 0,
        commissionEarned: myApp.commissionEarned ?? 0,
        createdAt: myApp.createdAt instanceof Date ? myApp.createdAt.toISOString() : String(myApp.createdAt),
      } : null,
    };
  });

  const myApps = myApplications.map((a: any) => ({
    id: a.id,
    status: a.status,
    note: a.note ?? "",
    result: a.result ?? "",
    proofUrl: a.proofUrl ?? "",
    proofNote: a.proofNote ?? "",
    submittedAt: a.submittedAt ? (a.submittedAt instanceof Date ? a.submittedAt.toISOString() : String(a.submittedAt)) : null,
    cpEarned: a.cpEarned ?? 0,
    commissionEarned: a.commissionEarned ?? 0,
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
      <MissionsAffilieClient
        rows={rows}
        myApps={myApps}
        mySubmissions={mySubmissions.map((s: any) => ({
          id: s.id, title: s.title,
          submissionType: s.submissionType ?? "OFFER",
          validationStatus: s.validationStatus ?? "PENDING_VALIDATION",
          createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : String(s.createdAt),
          rejectionNote: s.rejectionNote ?? "",
        }))}
        applyAction={applyToMission}
        withdrawAction={withdrawMissionApplication}
        submitProofAction={submitMissionProof}
      />
    </div>
  );
}

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { createMission, updateMission, updateMissionStatus, updateApplicationStatus, validateMissionApplication, validateMissionSubmission, rejectMissionSubmission, connectMissionInterest } from "../actions";
import MissionsAdminClient from "./missions-admin-client";

export const revalidate = 30;

export default async function AdminMissionsPage() {
  await requireAdmin();

  const missions = await (prisma as any).mission.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      applications: {
        include: { user: { select: { firstName: true, lastName: true, code: true, phone: true, email: true } } },
        orderBy: { createdAt: "asc" },
      },
      media: true,
      interests: {
        include: { user: { select: { firstName: true, lastName: true, code: true, phone: true, email: true } } },
        orderBy: { createdAt: "asc" },
      },
      submittedBy: { select: { firstName: true, lastName: true, code: true, email: true, phone: true } },
    },
  });

  const rows = missions.map((m: any) => ({
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
    rewardTrigger: m.rewardTrigger ?? "VALIDATION",
    zone: m.zone,
    difficulty: m.difficulty,
    minLevel: m.minLevel ?? "",
    slots: m.slots,
    proofInstructions: m.proofInstructions ?? "",
    adminNote: m.adminNote ?? "",
    deadline: m.deadline ? (m.deadline instanceof Date ? m.deadline.toISOString() : String(m.deadline)) : null,
    status: m.status,
    active: m.active ?? true,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
    source: m.source ?? "IBIG",
    submissionType: m.submissionType ?? "MISSION",
    validationStatus: m.validationStatus ?? "VALIDATED",
    rejectionNote: m.rejectionNote ?? "",
    contactName: m.contactName ?? "",
    contactPhone: m.contactPhone ?? "",
    contactEmail: m.contactEmail ?? "",
    submittedBy: m.submittedBy ? {
      name: `${m.submittedBy.firstName} ${m.submittedBy.lastName}`,
      code: m.submittedBy.code,
      email: m.submittedBy.email,
      phone: m.submittedBy.phone ?? "",
    } : null,
    media: (m.media ?? []).map((med: any) => ({ id: med.id, url: med.url, mediaType: med.mediaType, name: med.name })),
    interests: (m.interests ?? []).map((i: any) => ({
      id: i.id,
      status: i.status,
      note: i.note ?? "",
      createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : String(i.createdAt),
      partnerName: `${i.user.firstName} ${i.user.lastName}`,
      partnerCode: i.user.code,
      partnerPhone: i.user.phone ?? "",
      partnerEmail: i.user.email,
    })),
    applications: m.applications.map((a: any) => ({
      id: a.id,
      status: a.status,
      note: a.note ?? "",
      result: a.result ?? "",
      proofUrl: a.proofUrl ?? "",
      proofNote: a.proofNote ?? "",
      submittedAt: a.submittedAt ? (a.submittedAt instanceof Date ? a.submittedAt.toISOString() : String(a.submittedAt)) : null,
      validatedAt: a.validatedAt ? (a.validatedAt instanceof Date ? a.validatedAt.toISOString() : String(a.validatedAt)) : null,
      cpEarned: a.cpEarned ?? 0,
      commissionEarned: a.commissionEarned ?? 0,
      createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt),
      partnerName: `${a.user.firstName} ${a.user.lastName}`,
      partnerCode: a.user.code,
      partnerPhone: a.user.phone ?? "",
      partnerEmail: a.user.email,
    })),
  }));

  const stats = {
    total: rows.length,
    open: rows.filter((r: any) => r.status === "OPEN" && r.validationStatus === "VALIDATED").length,
    applications: rows.reduce((s: number, r: any) => s + r.applications.length, 0),
    pending: rows.reduce((s: number, r: any) => s + r.applications.filter((a: any) => a.status === "PENDING").length, 0),
    submitted: rows.reduce((s: number, r: any) => s + r.applications.filter((a: any) => a.status === "SUBMITTED").length, 0),
    pendingSubmissions: rows.filter((r: any) => r.source === "PARTNER" && r.validationStatus === "PENDING_VALIDATION").length,
    interests: rows.reduce((s: number, r: any) => s + r.interests.filter((i: any) => i.status === "PENDING").length, 0),
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
        updateAction={updateMission}
        updateStatusAction={updateMissionStatus}
        updateAppAction={updateApplicationStatus}
        validateAppAction={validateMissionApplication}
        validateSubmissionAction={validateMissionSubmission}
        rejectSubmissionAction={rejectMissionSubmission}
        connectInterestAction={connectMissionInterest}
      />
    </div>
  );
}

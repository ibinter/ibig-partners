"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { sendCallInvitationEmail } from "@/lib/email";

export async function createPartnerCall(formData: FormData) {
  const admin = await requireAdmin();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = (formData.get("category") as string) || "AUTRE";
  const targetZone = (formData.get("targetZone") as string) || null;
  const targetStatus = (formData.get("targetStatus") as string) || null;
  const deadlineRaw = formData.get("deadline") as string;
  const deadline = deadlineRaw ? new Date(deadlineRaw) : null;

  await (prisma as any).partnerCall.create({
    data: {
      title,
      description,
      category,
      targetZone: targetZone || null,
      targetStatus: targetStatus || null,
      deadline,
      status: "OPEN",
      createdBy: admin.id,
    },
  });

  revalidatePath("/admin/appels");
}

export async function sendCallInvitations(formData: FormData) {
  await requireAdmin();
  const callId = formData.get("callId") as string;

  const call = await (prisma as any).partnerCall.findUnique({ where: { id: callId } });
  if (!call) throw new Error("Appel introuvable");

  const where: Record<string, any> = { role: "PARTNER", active: true, approved: true };
  if (call.targetStatus) {
    const statuses = call.targetStatus.split(",").map((s: string) => s.trim());
    where.status = { in: statuses };
  }

  const partners = await (prisma as any).user.findMany({
    where,
    select: { id: true, marketSectors: true, marketZone: true },
  });

  // Filtre secteur
  const eligible = call.category === "AUTRE"
    ? partners
    : partners.filter((p: any) => {
        if (!p.marketSectors) return false;
        return p.marketSectors.split(",").map((s: string) => s.trim().toUpperCase())
          .includes(call.category.toUpperCase());
      });

  // Filtre zone si précisée
  const zoneFiltered = call.targetZone
    ? eligible.filter((p: any) =>
        p.marketZone?.toLowerCase().includes(call.targetZone.toLowerCase()))
    : eligible;

  const existing = await (prisma as any).partnerCallInvitation.findMany({
    where: { callId },
    select: { userId: true },
  });
  const existingIds = new Set(existing.map((e: any) => e.userId));

  const newPartnerIds: string[] = [];
  let count = 0;
  for (const p of zoneFiltered) {
    if (existingIds.has(p.id)) continue;
    await (prisma as any).partnerCallInvitation.create({
      data: { callId, userId: p.id, status: "PENDING" },
    });
    await prisma.notification.create({
      data: {
        userId: p.id,
        title: "📣 Appel à partenaires",
        body: `IBIG vous invite à répondre : « ${call.title} ». Consultez vos Appels.`,
        url: "/espace/appels",
      },
    });
    newPartnerIds.push(p.id);
    count++;
  }

  // Envoyer emails aux nouveaux invités
  if (newPartnerIds.length > 0) {
    after(async () => {
      const recipients = await (prisma as any).user.findMany({
        where: { id: { in: newPartnerIds } },
        select: { email: true, firstName: true },
      });
      for (const r of recipients) {
        await sendCallInvitationEmail({
          to: r.email,
          firstName: r.firstName,
          callTitle: call.title,
          callDescription: call.description || undefined,
        }).catch(() => {});
      }
    });
  }

  revalidatePath("/admin/appels");
}

export async function closePartnerCall(formData: FormData) {
  await requireAdmin();
  const callId = formData.get("callId") as string;
  await (prisma as any).partnerCall.update({
    where: { id: callId },
    data: { status: "CLOSED" },
  });
  revalidatePath("/admin/appels");
}

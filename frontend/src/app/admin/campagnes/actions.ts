"use server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendSms } from "@/lib/sms";
import { sendEmail } from "@/lib/email-utils";

export async function createCampaign(fd: FormData) {
  await requireAdmin();
  await (prisma as any).campaign.create({
    data: {
      title: fd.get("title") as string,
      body: fd.get("body") as string,
      channel: (fd.get("channel") as string) || "EMAIL",
      targetLevel: (fd.get("targetLevel") as string) || null,
      targetSector: (fd.get("targetSector") as string) || null,
    },
  });
  revalidatePath("/admin/campagnes");
}

export async function sendCampaign(fd: FormData) {
  await requireAdmin();
  const id = fd.get("id") as string;
  const campaign = await (prisma as any).campaign.findUnique({ where: { id } });
  if (!campaign) return;

  const where: Record<string, unknown> = { active: true, approved: true };
  if (campaign.targetLevel) where.status = campaign.targetLevel;

  const users = await prisma.user.findMany({
    where,
    select: { id: true, firstName: true, email: true, phone: true, marketSectors: true },
  });

  const targets = campaign.targetSector
    ? users.filter((u) => u.marketSectors?.includes(campaign.targetSector))
    : users;

  let sent = 0;
  for (const u of targets) {
    const body = campaign.body.replace(/{{firstName}}/g, u.firstName ?? "");
    if (campaign.channel === "EMAIL" || campaign.channel === "BOTH") {
      try {
        await sendEmail({ to: u.email, subject: campaign.title, html: `<p>${body.replace(/\n/g, "<br>")}</p>` });
        sent++;
      } catch { /* continue */ }
    }
    if (campaign.channel === "SMS" || campaign.channel === "BOTH") {
      if (u.phone) {
        try { await sendSms(u.phone, body); } catch { /* continue */ }
      }
    }
    await new Promise((r) => setTimeout(r, 120));
  }

  await (prisma as any).campaign.update({
    where: { id },
    data: { sentAt: new Date(), sentCount: sent },
  });
  revalidatePath("/admin/campagnes");
}

export async function deleteCampaign(fd: FormData) {
  await requireAdmin();
  await (prisma as any).campaign.delete({ where: { id: fd.get("id") as string } });
  revalidatePath("/admin/campagnes");
}

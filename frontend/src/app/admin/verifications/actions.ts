"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function approveVerification(formData: FormData) {
  const admin  = await requireAdmin();
  const id     = String(formData.get("id"));
  const userId = String(formData.get("userId"));

  await prisma.$transaction([
    prisma.verificationRequest.update({
      where: { id },
      data: { status: "APPROVED", reviewedAt: new Date(), reviewedBy: admin.id, reviewNote: null },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { verificationStatus: "VERIFIED", approved: true, active: true },
    }),
  ]);

  revalidatePath("/admin/verifications");
  redirect("/admin/verifications");
}

export async function rejectVerification(formData: FormData) {
  const admin      = await requireAdmin();
  const id         = String(formData.get("id"));
  const userId     = String(formData.get("userId"));
  const reviewNote = formData.get("reviewNote") ? String(formData.get("reviewNote")) : "Dossier incomplet ou non conforme.";

  await prisma.$transaction([
    prisma.verificationRequest.update({
      where: { id },
      data: { status: "REJECTED", reviewedAt: new Date(), reviewedBy: admin.id, reviewNote },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { verificationStatus: "REJECTED" },
    }),
  ]);

  revalidatePath("/admin/verifications");
  redirect("/admin/verifications");
}

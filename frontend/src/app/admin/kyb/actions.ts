"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function approveKybUser(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") || "");
  if (!userId) return;

  // Approuver tous les docs PENDING de ce partenaire
  await (prisma as any).kybDocument.updateMany({
    where: { userId, status: "PENDING" },
    data:  { status: "APPROVED", reviewedAt: new Date() },
  });
  await (prisma as any).user.update({
    where: { id: userId },
    data:  { kybStatus: "VERIFIED" },
  });
  revalidatePath("/admin/kyb");
}

export async function rejectKybUser(formData: FormData) {
  await requireAdmin();
  const userId    = String(formData.get("userId") || "");
  const adminNote = String(formData.get("adminNote") || "").trim();
  if (!userId) return;

  await (prisma as any).user.update({
    where: { id: userId },
    data:  { kybStatus: "REJECTED" },
  });
  revalidatePath("/admin/kyb");
}

export async function approveKybDoc(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;

  await (prisma as any).kybDocument.update({
    where: { id },
    data:  { status: "APPROVED", reviewedAt: new Date(), adminNote: null },
  });
  revalidatePath("/admin/kyb");
}

export async function rejectKybDoc(formData: FormData) {
  await requireAdmin();
  const id        = String(formData.get("id") || "");
  const adminNote = String(formData.get("adminNote") || "").trim();
  if (!id) return;

  await (prisma as any).kybDocument.update({
    where: { id },
    data:  { status: "REJECTED", reviewedAt: new Date(), adminNote: adminNote || "Document refusé" },
  });
  revalidatePath("/admin/kyb");
}

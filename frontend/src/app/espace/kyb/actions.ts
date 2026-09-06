"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function submitKybDocument(formData: FormData) {
  const user = await requireUser();
  const docType = String(formData.get("docType") || "").trim();
  const docName = String(formData.get("docName") || "").trim();
  const fileUrl = String(formData.get("fileUrl") || "").trim();
  const note    = String(formData.get("note") || "").trim();

  if (!docType || !docName || !fileUrl) return;

  await (prisma as any).kybDocument.create({
    data: { userId: user.id, docType, docName, fileUrl, note: note || null, status: "PENDING" },
  });

  // Passer kybStatus à SUBMITTED si c'était NONE ou REJECTED
  const currentStatus = (user as any).kybStatus ?? "NONE";
  if (currentStatus === "NONE" || currentStatus === "REJECTED") {
    await (prisma as any).user.update({
      where: { id: user.id },
      data: { kybStatus: "SUBMITTED" },
    });
  }

  revalidatePath("/espace/kyb");
}

export async function deleteKybDocument(formData: FormData) {
  const user = await requireUser();
  const id   = String(formData.get("id") || "");
  if (!id) return;

  const doc = await (prisma as any).kybDocument.findUnique({ where: { id } });
  if (!doc || doc.userId !== user.id) return;

  await (prisma as any).kybDocument.delete({ where: { id } });
  revalidatePath("/espace/kyb");
}

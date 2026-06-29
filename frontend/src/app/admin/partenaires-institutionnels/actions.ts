"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parsePartner(formData: FormData) {
  return {
    name:        String(formData.get("name") || "").trim(),
    category:    String(formData.get("category") || "OTHER"),
    logoUrl:     String(formData.get("logoUrl") || "").trim() || null,
    description: String(formData.get("description") || "").trim() || null,
    website:     String(formData.get("website") || "").trim() || null,
    email:       String(formData.get("email") || "").trim() || null,
    phone:       String(formData.get("phone") || "").trim() || null,
    phone2:      String(formData.get("phone2") || "").trim() || null,
    address:     String(formData.get("address") || "").trim() || null,
    city:        String(formData.get("city") || "").trim() || null,
    country:     String(formData.get("country") || "").trim() || null,
    active:      formData.get("active") === "on",
    order:       Number(formData.get("order") || 0),
  };
}

export async function createInstitutionalPartner(formData: FormData) {
  await requireAdmin();
  const data = parsePartner(formData);
  if (!data.name) return;
  await (prisma as any).institutionalPartner.create({ data });
  revalidatePath("/admin/partenaires-institutionnels");
  revalidatePath("/partenaires");
  redirect("/admin/partenaires-institutionnels");
}

export async function updateInstitutionalPartner(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const data = parsePartner(formData);
  await (prisma as any).institutionalPartner.update({ where: { id }, data });
  revalidatePath("/admin/partenaires-institutionnels");
  revalidatePath("/partenaires");
  redirect("/admin/partenaires-institutionnels");
}

export async function deleteInstitutionalPartner(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await (prisma as any).institutionalPartner.delete({ where: { id } });
  revalidatePath("/admin/partenaires-institutionnels");
  revalidatePath("/partenaires");
  redirect("/admin/partenaires-institutionnels");
}

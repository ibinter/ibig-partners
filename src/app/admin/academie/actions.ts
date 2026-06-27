"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseModule(formData: FormData) {
  // tags : normalisés en chaîne "tag1,tag2,tag3"
  const tagsRaw = String(formData.get("tags") || "").trim();
  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean).join(",")
    : null;

  // duration : libellé libre ("15 min", "1h30"). Si un nombre est saisi, on suffixe " min".
  const durationRaw = String(formData.get("duration") || "").trim();
  const duration = durationRaw
    ? (/^\d+$/.test(durationRaw) ? `${durationRaw} min` : durationRaw)
    : null;

  return {
    title:       String(formData.get("title") || "").trim(),
    type:        String(formData.get("type") || "ARTICLE"),
    description: String(formData.get("description") || "").trim() || null,
    content:     String(formData.get("content") || "").trim() || "",
    thumbnail:   String(formData.get("thumbnail") || "").trim() || null,
    duration,
    branchId:    String(formData.get("branchId") || "").trim() || null,
    productId:   String(formData.get("productId") || "").trim() || null,
    tags,
    minStatus:   String(formData.get("minStatus") || "STARTER"),
    order:       Number(formData.get("order") || 0),
    active:      formData.get("active") === "on",
    featured:    formData.get("featured") === "on",
  };
}

export async function createModule(formData: FormData) {
  await requireAdmin();
  const data = parseModule(formData);
  if (!data.title) return;

  const slug = slugify(data.title);

  await (prisma as any).trainingModule.create({
    data: { ...data, slug },
  });

  revalidatePath("/admin/academie");
  revalidatePath("/espace/academie");
  redirect("/admin/academie");
}

export async function updateModule(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;

  const data = parseModule(formData);
  const slug = slugify(data.title);

  await (prisma as any).trainingModule.update({
    where: { id },
    data: { ...data, slug },
  });

  revalidatePath("/admin/academie");
  revalidatePath("/espace/academie");
  redirect("/admin/academie");
}

export async function deleteModule(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;

  await (prisma as any).trainingModule.delete({ where: { id } });

  revalidatePath("/admin/academie");
  revalidatePath("/espace/academie");
  redirect("/admin/academie");
}

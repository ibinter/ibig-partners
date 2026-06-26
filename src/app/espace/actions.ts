"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Active (cree le lien) ou desactive (supprime le lien) un produit pour le partenaire. */
export async function toggleProduct(formData: FormData) {
  const user = await requireUser();
  const productId = String(formData.get("productId") || "");
  if (!productId) return;

  const existing = await prisma.affiliateLink.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });

  if (existing) {
    // ne pas supprimer si des clics/ventes y sont rattaches : on garde l'historique
    if (existing.clicks > 0) return;
    await prisma.affiliateLink.delete({ where: { id: existing.id } });
  } else {
    await prisma.affiliateLink.create({
      data: { userId: user.id, productId, code: user.code },
    });
  }
  revalidatePath("/espace/produits");
  revalidatePath("/espace/liens");
}

export async function addProspect(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  await prisma.prospect.create({
    data: {
      userId: user.id,
      name,
      contact: String(formData.get("contact") || "").trim() || null,
      productId: String(formData.get("productId") || "") || null,
      note: String(formData.get("note") || "").trim() || null,
      status: "CONTACTED",
    },
  });
  revalidatePath("/espace/prospects");
}

export async function updateProspectStatus(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const prospect = await prisma.prospect.findUnique({ where: { id } });
  if (!prospect || prospect.userId !== user.id) return;
  await prisma.prospect.update({ where: { id }, data: { status } });
  revalidatePath("/espace/prospects");
}

export async function deleteProspect(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  const prospect = await prisma.prospect.findUnique({ where: { id } });
  if (!prospect || prospect.userId !== user.id) return;
  await prisma.prospect.delete({ where: { id } });
  revalidatePath("/espace/prospects");
}

export async function submitOpportunity(formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (!title || !description) return;
  await prisma.opportunity.create({
    data: {
      userId: user.id,
      title,
      description,
      estimatedValue: Number(formData.get("estimatedValue") || 0) || 0,
      status: "NEW",
    },
  });
  revalidatePath("/espace/reseau");
}

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      phone: String(formData.get("phone") || user.phone).trim(),
      city: String(formData.get("city") || "").trim() || null,
      payoutMethod: String(formData.get("payoutMethod") || user.payoutMethod),
      payoutDetail: String(formData.get("payoutDetail") || "").trim() || null,
    },
  });
  revalidatePath("/espace/profil");
}

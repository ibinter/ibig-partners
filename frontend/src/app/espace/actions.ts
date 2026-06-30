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

/**
 * Import en masse de prospects/contacts depuis un texte CSV.
 * Chaque ligne : Nom[, Contact[, Note]]. Séparateurs acceptés : virgule,
 * point-virgule ou tabulation. Une éventuelle ligne d'en-tête est ignorée.
 */
export async function importProspects(formData: FormData) {
  const user = await requireUser();
  const raw = String(formData.get("data") || "");
  if (!raw.trim()) return;

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const rows: { name: string; contact: string | null; note: string | null }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const cols = lines[i].split(/[,;\t]/).map((c) => c.trim());
    const name = cols[0] ?? "";
    if (!name) continue;
    // Ignore une ligne d'en-tête évidente
    if (i === 0 && /^(nom|name|prenom|prénom|contact)$/i.test(name)) continue;
    rows.push({
      name,
      contact: cols[1] ? cols[1] : null,
      note: cols.slice(2).join(" ").trim() || null,
    });
  }

  if (rows.length === 0) return;

  await prisma.prospect.createMany({
    data: rows.map((r) => ({
      userId: user.id,
      name: r.name,
      contact: r.contact,
      note: r.note,
      status: "CONTACTED",
    })),
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

/**
 * Un affilié déclare une vente manuelle (paiement WhatsApp, abonnement SaaS direct, etc.).
 * La vente est créée en statut PENDING — l'admin doit la confirmer pour générer les commissions.
 */
export async function declareSale(formData: FormData) {
  const user = await requireUser();
  const productId = String(formData.get("productId") || "").trim();
  const customerName = String(formData.get("customerName") || "").trim();
  const customerPhone = String(formData.get("customerPhone") || "").trim();
  const channel = String(formData.get("channel") || "WhatsApp").trim();

  if (!productId || !customerName) return;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return;

  const count = await prisma.sale.count();
  await prisma.sale.create({
    data: {
      reference: `VTE-${String(count + 1).padStart(4, "0")}`,
      productId,
      sellerId: user.id,
      customerName: `${customerName} [${channel}]`,
      customerPhone: customerPhone || null,
      amount: product.price,
      pricingType: product.pricingType,
      status: "PENDING",
      monthsPaid: 0,
    },
  });

  revalidatePath("/espace/ventes");
  revalidatePath("/admin/ventes");
}

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  await (prisma as any).user.update({
    where: { id: user.id },
    data: {
      phone: String(formData.get("phone") || user.phone).trim(),
      city: String(formData.get("city") || "").trim() || null,
      country: String(formData.get("country") || "").trim() || null,
      payoutMethod: String(formData.get("payoutMethod") || user.payoutMethod),
      payoutDetail: String(formData.get("payoutDetail") || "").trim() || null,
      bio: String(formData.get("bio") || "").trim() || null,
      photoUrl: String(formData.get("photoUrl") || "").trim() || null,
      website: String(formData.get("website") || "").trim() || null,
      publicListing: formData.get("publicListing") === "on",
    },
  });
  revalidatePath("/espace/profil");
}

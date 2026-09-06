"use server";

import { prisma } from "@/lib/prisma";

export async function submitLead(fd: FormData): Promise<{ error?: string } | void> {
  const partnerId  = fd.get("partnerId") as string;
  const firstName  = (fd.get("firstName") as string)?.trim();
  const lastName   = (fd.get("lastName") as string)?.trim();
  const phone      = (fd.get("phone") as string)?.trim();
  const email      = (fd.get("email") as string)?.trim();
  const productId  = (fd.get("productId") as string) || undefined;
  const message    = (fd.get("message") as string)?.trim();

  if (!partnerId || !firstName || !lastName || !phone) {
    return { error: "Veuillez remplir tous les champs obligatoires." };
  }

  const name    = `${firstName} ${lastName}`;
  const contact = [phone, email].filter(Boolean).join(" · ");
  const note    = message || undefined;

  // Retrouver le nom du produit si sélectionné
  let productName: string | undefined;
  if (productId) {
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { name: true } });
    productName = product?.name;
  }

  await prisma.prospect.create({
    data: {
      userId:    partnerId,
      name,
      contact,
      productId: productId || null,
      status:    "CONTACTED",
      priority:  "HIGH",
      note:      [note, productName ? `Intérêt : ${productName}` : undefined].filter(Boolean).join("\n") || null,
    },
  });
}

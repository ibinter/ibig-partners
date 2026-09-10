"use server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function createService(formData: FormData) {
  const user = await requireUser();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const price = parseFloat((formData.get("price") as string) || "0");

  await (prisma as any).marketplaceService.create({
    data: {
      id: `mkt_${randomUUID()}`,
      userId: user.id,
      title,
      description,
      category,
      price,
      currency: "FCFA",
    },
  });
  revalidatePath("/espace/marketplace");
}

export async function deleteService(id: string) {
  const user = await requireUser();
  await (prisma as any).marketplaceService.updateMany({
    where: { id, userId: user.id },
    data: { status: "DELETED" },
  });
  revalidatePath("/espace/marketplace");
}

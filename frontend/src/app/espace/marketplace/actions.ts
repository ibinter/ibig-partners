"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createService(formData: FormData) {
  const userId = formData.get("userId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const price = parseFloat((formData.get("price") as string) || "0");

  await (prisma as any).marketplaceService.create({
    data: {
      id: `mkt_${Date.now()}`,
      userId,
      title,
      description,
      category,
      price,
      currency: "FCFA",
    },
  });
  revalidatePath("/espace/marketplace");
}

export async function deleteService(id: string, userId: string) {
  await (prisma as any).marketplaceService.updateMany({
    where: { id, userId },
    data: { status: "DELETED" },
  });
  revalidatePath("/espace/marketplace");
}

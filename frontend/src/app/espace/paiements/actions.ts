"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function savePayoutConfig(formData: FormData) {
  const user        = await requireUser();
  const minPayout   = Math.max(5000, parseInt(String(formData.get("minPayout") ?? "5000"), 10));
  const payoutMethod = String(formData.get("payoutMethod") ?? "ORANGE_MONEY");
  const payoutDetail = String(formData.get("payoutDetail") ?? "");

  await prisma.user.update({
    where: { id: user.id },
    data: { minPayout, payoutMethod, payoutDetail: payoutDetail || null },
  });

  revalidatePath("/espace/paiements");
}

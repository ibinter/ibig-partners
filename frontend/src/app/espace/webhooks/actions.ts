"use server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function saveWebhookSettings(formData: FormData) {
  const user = await requireUser();
  const url    = (formData.get("webhookUrl") as string | null)?.trim() || null;
  const action = formData.get("action") as string;

  if (action === "regenerate" || action === "save") {
    const secret = action === "regenerate"
      ? crypto.randomBytes(24).toString("hex")
      : ((formData.get("webhookSecret") as string | null)?.trim() || null);

    await (prisma as any).user.update({
      where: { id: user.id },
      data: { webhookUrl: url, webhookSecret: secret },
    });
  }

  if (action === "delete") {
    await (prisma as any).user.update({
      where: { id: user.id },
      data: { webhookUrl: null, webhookSecret: null },
    });
  }

  revalidatePath("/espace/webhooks");
}

"use server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function respondToCall(formData: FormData) {
  const user = await requireUser();
  const callId = formData.get("callId") as string;
  const status = formData.get("status") as string; // ACCEPTED | DECLINED

  await (prisma as any).partnerCallInvitation.updateMany({
    where: { callId, userId: user.id },
    data: { status },
  });

  revalidatePath("/espace/appels");
}

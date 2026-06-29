"use server";

import { prisma } from "@/lib/prisma";

export async function logAction(opts: {
  userId: string;
  action: string;
  target?: string;
  detail?: string;
}) {
  try {
    await prisma.auditLog.create({ data: opts });
  } catch {
    // Ne jamais bloquer une action métier à cause du log
  }
}

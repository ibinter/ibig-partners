"use server";

import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function forgotPasswordAction(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!email) return { error: "L'adresse e-mail est requise." };

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, firstName: true, active: true },
  });

  // Always return success to avoid email enumeration
  if (!user || !user.active) return { success: true };

  // Invalidate previous tokens
  await prisma.$executeRaw`
    UPDATE "PasswordResetToken" SET used = true
    WHERE "userId" = ${user.id} AND used = false
  `;

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.$executeRaw`
    INSERT INTO "PasswordResetToken" (id, "userId", token, "expiresAt", used, "createdAt")
    VALUES (gen_random_uuid()::text, ${user.id}, ${token}, ${expiresAt}, false, NOW())
  `;

  const resetUrl = `${SITE}/connexion/reinitialiser-mot-de-passe?token=${token}`;

  await sendPasswordResetEmail({
    to: email,
    firstName: user.firstName,
    resetUrl,
  });

  return { success: true };
}

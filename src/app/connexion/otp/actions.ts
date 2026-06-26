"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyOtp } from "@/lib/otp";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function verifyOtpAction(_prev: unknown, formData: FormData) {
  const code = String(formData.get("code") || "").trim();
  const store = await cookies();

  // L'userId en attente est stocké dans un cookie temporaire pendant le flow 2FA
  const pendingUserId = store.get("ibig_otp_pending")?.value;
  if (!pendingUserId) {
    return { error: "Session expirée. Reconnectez-vous." };
  }

  if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
    return { error: "Code invalide. Saisissez les 6 chiffres." };
  }

  const valid = await verifyOtp(pendingUserId, code);
  if (!valid) {
    return { error: "Code incorrect ou expiré. Réessayez." };
  }

  const user = await prisma.user.findUnique({ where: { id: pendingUserId } });
  if (!user) return { error: "Utilisateur introuvable." };

  // Supprimer le cookie temporaire
  store.delete("ibig_otp_pending");

  // Créer la vraie session
  await createSession({ userId: user.id, role: user.role });

  const dest = user.role === "ADMIN" || user.role === "SUPERADMIN" ? "/admin" : "/espace";
  redirect(dest);
}

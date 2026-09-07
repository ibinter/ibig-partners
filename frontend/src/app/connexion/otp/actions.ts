"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";
import { createSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function verifyOtpAction(_prev: unknown, formData: FormData) {
  const code = String(formData.get("code") || "").trim().replace(/\s/g, "");
  const next = String(formData.get("next") || "");

  if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
    return { error: "Entrez le code à 6 chiffres reçu par email." };
  }

  const store = await cookies();
  const pendingId = store.get("ibig_otp_pending")?.value;

  if (!pendingId) {
    return { error: "Session expirée. Veuillez vous reconnecter." };
  }

  const user = await prisma.user.findUnique({
    where: { id: pendingId },
    select: { id: true, role: true, active: true },
  });

  if (!user || !user.active) {
    return { error: "Compte introuvable ou désactivé." };
  }

  const valid = await verifyOtp(pendingId, code);
  if (!valid) {
    return { error: "Code incorrect ou expiré. Vérifiez votre email ou redemandez un code." };
  }

  // Code correct — créer la session complète
  store.delete("ibig_otp_pending");
  await createSession({ userId: user.id, role: user.role });
  await logActivity({ userId: user.id, action: "LOGIN", detail: `Rôle: ${user.role}` });

  const dest = next && next.startsWith("/") ? next : "/espace";
  redirect(dest);
}

export async function resendOtpAction(_prev: unknown, _formData: FormData) {
  const store = await cookies();
  const pendingId = store.get("ibig_otp_pending")?.value;

  if (!pendingId) {
    return { error: "Session expirée. Veuillez vous reconnecter." };
  }

  const user = await prisma.user.findUnique({
    where: { id: pendingId },
    select: { id: true, email: true, firstName: true },
  });

  if (!user) return { error: "Compte introuvable." };

  const { createAndSendOtp } = await import("@/lib/otp");
  await createAndSendOtp(user.id, user.email, user.firstName);

  return { success: true };
}

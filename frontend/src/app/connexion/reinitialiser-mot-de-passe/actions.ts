"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function resetPasswordAction(_prev: unknown, formData: FormData) {
  const token = String(formData.get("token") || "").trim();
  const password = String(formData.get("password") || "");
  const passwordConfirm = String(formData.get("passwordConfirm") || "");

  if (!token) return { error: "Lien invalide." };
  if (password.length < 8) return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  if (password !== passwordConfirm) return { error: "Les mots de passe ne correspondent pas." };

  const rows = await prisma.$queryRaw<Array<{ id: string; userId: string; expiresAt: Date; used: boolean }>>`
    SELECT id, "userId", "expiresAt", used FROM "PasswordResetToken" WHERE token = ${token} LIMIT 1
  `;

  if (!rows.length) return { error: "Lien invalide ou expiré. Demandez un nouveau lien." };

  const row = rows[0];
  if (row.used) return { error: "Ce lien a déjà été utilisé. Demandez un nouveau lien." };
  if (new Date() > row.expiresAt) return { error: "Ce lien a expiré. Demandez un nouveau lien." };

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash },
    }),
    prisma.$executeRaw`UPDATE "PasswordResetToken" SET used = true WHERE id = ${row.id}`,
  ]);

  return { success: true };
}

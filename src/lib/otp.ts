import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email-utils";

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function createAndSendOtp(userId: string, email: string, firstName: string) {
  const code = generateOtp();
  const hash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.otpCode.upsert({
    where: { userId },
    update: { code: hash, expiresAt },
    create: { userId, code: hash, expiresAt },
  });

  await sendEmail({
    to: email,
    subject: `${code} — Votre code de connexion IBIG PARTNERS`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0b5fff">Vérification en deux étapes</h2>
        <p>Bonjour ${firstName},</p>
        <p>Votre code de connexion IBIG PARTNERS est :</p>
        <div style="background:#f0f4ff;border-radius:10px;padding:20px;text-align:center;margin:20px 0">
          <span style="font-size:36px;font-weight:800;color:#0b5fff;letter-spacing:8px">${code}</span>
        </div>
        <p style="color:#5b6577;font-size:14px">Ce code expire dans <strong>10 minutes</strong>. Ne le communiquez à personne.</p>
      </div>
    `,
  });
}

export async function verifyOtp(userId: string, inputCode: string): Promise<boolean> {
  const record = await prisma.otpCode.findUnique({ where: { userId } });
  if (!record) return false;
  if (record.expiresAt < new Date()) {
    await prisma.otpCode.delete({ where: { userId } });
    return false;
  }
  const valid = await bcrypt.compare(inputCode, record.code);
  if (valid) await prisma.otpCode.delete({ where: { userId } });
  return valid;
}

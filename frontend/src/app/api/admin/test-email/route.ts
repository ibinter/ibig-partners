import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmailVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function GET(req: Request) {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) return NextResponse.json({ error: "Paramètre email requis" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, firstName: true, email: true, emailVerified: true } as any,
  });

  if (!user) return NextResponse.json({ error: `Utilisateur non trouvé : ${email}` }, { status: 404 });

  // Invalider les anciens tokens
  await (prisma as any).emailVerificationToken.updateMany({
    where: { userId: (user as any).id, used: false },
    data: { used: true },
  });

  // Créer un nouveau token
  const token = crypto.randomBytes(32).toString("hex");
  await (prisma as any).emailVerificationToken.create({
    data: {
      userId: (user as any).id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ibigpartners.com";
  const verifyUrl = `${siteUrl}/api/auth/verify-email?token=${token}`;

  const result = await sendEmailVerificationEmail({
    to: (user as any).email,
    firstName: (user as any).firstName,
    verifyUrl,
  });

  return NextResponse.json({
    ok: result.ok,
    emailVerifiedInDb: !!(user as any).emailVerified,
    emailId: result.id ?? null,
    verifyUrl,
    error: result.error ?? null,
  });
}

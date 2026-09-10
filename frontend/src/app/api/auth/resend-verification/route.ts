import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmailVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  if ((user as any).emailVerified) {
    return NextResponse.redirect(new URL("/espace", req.url));
  }

  // Invalider les anciens tokens
  await (prisma as any).emailVerificationToken.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  const token = crypto.randomBytes(32).toString("hex");
  await (prisma as any).emailVerificationToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await sendEmailVerificationEmail({
    to: user.email,
    firstName: user.firstName,
    verifyUrl: `${siteUrl}/api/auth/verify-email?token=${token}`,
  });

  return NextResponse.redirect(new URL("/espace?email-renvoi=1", req.url));
}

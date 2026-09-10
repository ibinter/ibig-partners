import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

const COOKIE_NAME = "ibig_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-secret-change-me-not-for-prod"
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/connexion?email-error=token-manquant", req.url));
  }

  const record = await (prisma as any).emailVerificationToken.findUnique({
    where: { token },
  });

  if (!record) {
    return NextResponse.redirect(new URL("/connexion?email-error=token-invalide", req.url));
  }
  if (record.used) {
    return NextResponse.redirect(new URL("/connexion?email-error=deja-utilise", req.url));
  }
  if (new Date(record.expiresAt) < new Date()) {
    return NextResponse.redirect(new URL("/connexion?email-error=expire", req.url));
  }

  const user = await prisma.user.findUnique({
    where: { id: record.userId },
    select: { id: true, role: true },
  });

  await prisma.$transaction([
    (prisma as any).emailVerificationToken.update({
      where: { id: record.id },
      data: { used: true },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true } as any,
    }),
  ]);

  // Construire la réponse de redirection avec le cookie de session intégré
  const response = NextResponse.redirect(new URL("/espace?email-verifie=1", req.url));

  if (user) {
    const sessionToken = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret);

    response.cookies.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  return response;
}

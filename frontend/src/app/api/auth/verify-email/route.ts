import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/espace?email-error=token-manquant", req.url));
  }

  const record = await (prisma as any).emailVerificationToken.findUnique({
    where: { token },
  });

  if (!record) {
    return NextResponse.redirect(new URL("/espace?email-error=token-invalide", req.url));
  }
  if (record.used) {
    return NextResponse.redirect(new URL("/espace?email-error=deja-utilise", req.url));
  }
  if (new Date(record.expiresAt) < new Date()) {
    return NextResponse.redirect(new URL("/espace?email-error=expire", req.url));
  }

  await prisma.$transaction([
    (prisma as any).emailVerificationToken.update({
      where: { id: record.id },
      data: { used: true },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    }),
  ]);

  return NextResponse.redirect(new URL("/espace?email-verifie=1", req.url));
}

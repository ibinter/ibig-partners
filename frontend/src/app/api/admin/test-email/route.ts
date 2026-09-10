import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sendEmailVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function GET(req: Request) {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const to = searchParams.get("to") ?? admin.email;
  const firstName = searchParams.get("name") ?? admin.firstName;

  const token = crypto.randomBytes(32).toString("hex");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ibigpartners.com";
  const verifyUrl = `${siteUrl}/api/auth/verify-email?token=${token}`;

  const result = await sendEmailVerificationEmail({ to, firstName, verifyUrl });

  return NextResponse.json({ ok: result.ok, to, emailId: result.id, error: result.error ?? null });
}

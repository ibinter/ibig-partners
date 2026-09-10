import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const testTo = process.env.TEST_EMAIL ?? process.env.SUPPORT_EMAIL ?? "admin@ibigpartners.com";
  try {
    await sendWelcomeEmail({
      to: testTo,
      firstName: "Admin",
      code: "AFF-TEST-001",
      sponsorName: undefined,
    });
    return NextResponse.json({ ok: true, message: `Email de test envoyé à ${testTo}` });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

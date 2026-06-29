import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    await sendWelcomeEmail({
      to: "patriceky1er@gmail.com",
      firstName: "Patrice",
      code: "AFF-TEST-001",
      sponsorName: undefined,
    });
    return NextResponse.json({ ok: true, message: "Email de test envoyé à patriceky1er@gmail.com" });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

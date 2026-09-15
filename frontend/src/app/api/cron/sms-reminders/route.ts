import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";

// Envoie des SMS de relance aux partenaires bloqués :
// - J+3 sans contrat signé
// - J+7 sans KYC soumis
// Complément SMS des relances email déjà en place.

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now   = new Date();
  const d3ago = new Date(now.getTime() - 3 * 86400000);
  const d7ago = new Date(now.getTime() - 7 * 86400000);

  const [noContract, noKyc] = await Promise.all([
    // Inscrits il y a 3 jours, toujours sans contrat
    prisma.user.findMany({
      where: {
        role: "PARTNER",
        active: true,
        createdAt: { lte: d3ago, gte: new Date(d3ago.getTime() - 86400000) },
        contract: null,
      },
      select: { phone: true, firstName: true },
    }),
    // Inscrits il y a 7 jours, toujours sans KYC
    prisma.user.findMany({
      where: {
        role: "PARTNER",
        active: true,
        createdAt: { lte: d7ago, gte: new Date(d7ago.getTime() - 86400000) },
        verificationStatus: "NONE",
      },
      select: { phone: true, firstName: true },
    }),
  ]);

  let sent = 0;

  for (const u of noContract) {
    if (!u.phone) continue;
    const ok = await sendSms(
      u.phone,
      `Bonjour ${u.firstName} ! 👋 Votre espace IBIG PARTNERS vous attend. Signez votre contrat pour commencer à gagner des commissions : ibigpartners.com/espace/contrat-digital`,
    );
    if (ok) sent++;
  }

  for (const u of noKyc) {
    if (!u.phone) continue;
    const ok = await sendSms(
      u.phone,
      `Bonjour ${u.firstName} ! 📋 Finalisez votre inscription IBIG PARTNERS en soumettant votre dossier KYC. Sans ça, vos commissions ne peuvent pas être versées : ibigpartners.com/espace/kyc`,
    );
    if (ok) sent++;
  }

  return NextResponse.json({
    ok: true,
    noContract: noContract.length,
    noKyc: noKyc.length,
    smsSent: sent,
  });
}

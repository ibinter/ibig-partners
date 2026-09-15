import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email-utils";
import { after } from "next/server";

// Chaque lundi matin : score d'activité hebdomadaire pour chaque partenaire actif.
// Score = clics nouveaux + (ventes confirmées × 10) + (prospects ajoutés × 3)
// Compare avec la semaine précédente et envoie un email motivant.

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now        = new Date();
  const weekAgo    = new Date(now.getTime() - 7 * 86400000);
  const twoWeekAgo = new Date(now.getTime() - 14 * 86400000);

  const partners = await prisma.user.findMany({
    where: { role: "PARTNER", active: true, approved: true },
    select: { id: true, firstName: true, email: true },
  });

  let sent = 0;

  for (const p of partners) {
    // Score semaine courante (7 derniers jours)
    const [clicksNow, salesNow, prospectsNow] = await Promise.all([
      prisma.affiliateLink.aggregate({
        where: { userId: p.id },
        _sum: { clicks: true },
      }).then(async () => {
        // Les clics n'ont pas de timestamp — on ne peut pas les filtrer par semaine
        // On utilise les ventes et prospects uniquement
        return 0;
      }),
      prisma.sale.count({
        where: { sellerId: p.id, status: "CONFIRMED", createdAt: { gte: weekAgo } },
      }),
      prisma.prospect.count({
        where: { userId: p.id, createdAt: { gte: weekAgo } },
      }),
    ]);

    // Score semaine précédente
    const [salesPrev, prospectsPrev] = await Promise.all([
      prisma.sale.count({
        where: { sellerId: p.id, status: "CONFIRMED", createdAt: { gte: twoWeekAgo, lt: weekAgo } },
      }),
      prisma.prospect.count({
        where: { userId: p.id, createdAt: { gte: twoWeekAgo, lt: weekAgo } },
      }),
    ]);

    const scoreNow  = salesNow * 10 + prospectsNow * 3;
    const scorePrev = salesPrev * 10 + prospectsPrev * 3;

    // Ne pas spammer les partenaires totalement inactifs les deux semaines
    if (scoreNow === 0 && scorePrev === 0) continue;

    const diff  = scoreNow - scorePrev;
    const trend = diff > 0 ? "📈 En hausse" : diff < 0 ? "📉 En baisse" : "➡️ Stable";
    const color = diff > 0 ? "#10b981" : diff < 0 ? "#ef4444" : "#6b7280";

    const html = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:16px;">
  <div style="background:linear-gradient(135deg,#0b5fff,#7c3aed);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
    <p style="color:rgba(255,255,255,0.7);font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Score d'activité</p>
    <p style="color:#fff;font-size:48px;font-weight:900;margin:0;line-height:1;">${scoreNow}</p>
    <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:8px 0 0;">Cette semaine</p>
  </div>

  <div style="display:flex;gap:12px;margin-bottom:20px;">
    <div style="flex:1;background:#fff;border-radius:12px;padding:16px;text-align:center;border:1px solid #e2e8f0;">
      <p style="font-size:22px;font-weight:900;color:#1e293b;margin:0;">${salesNow}</p>
      <p style="font-size:11px;color:#64748b;margin:4px 0 0;">Ventes</p>
    </div>
    <div style="flex:1;background:#fff;border-radius:12px;padding:16px;text-align:center;border:1px solid #e2e8f0;">
      <p style="font-size:22px;font-weight:900;color:#1e293b;margin:0;">${prospectsNow}</p>
      <p style="font-size:11px;color:#64748b;margin:4px 0 0;">Prospects</p>
    </div>
    <div style="flex:1;background:#fff;border-radius:12px;padding:16px;text-align:center;border:1px solid #e2e8f0;">
      <p style="font-size:22px;font-weight:900;color:${color};margin:0;">${diff > 0 ? "+" : ""}${diff}</p>
      <p style="font-size:11px;color:#64748b;margin:4px 0 0;">vs sem. passée</p>
    </div>
  </div>

  <div style="background:#fff;border-radius:12px;padding:16px;border:1px solid #e2e8f0;margin-bottom:20px;">
    <p style="font-size:13px;font-weight:700;color:#1e293b;margin:0 0 4px;">${trend}</p>
    <p style="font-size:12px;color:#64748b;margin:0;">
      ${diff > 0
        ? `Excellent ! Vous avez progressé de ${diff} points cette semaine. Continuez sur cette lancée 💪`
        : diff < 0
          ? `Votre score a baissé de ${Math.abs(diff)} points. Cette semaine, on repart à fond ! 🔥`
          : `Score stable par rapport à la semaine dernière. Ajoutez des prospects pour faire décoller votre score !`
      }
    </p>
  </div>

  <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://ibigpartners.com"}/espace"
     style="display:block;background:#0b5fff;color:#fff;text-decoration:none;text-align:center;padding:14px;border-radius:12px;font-weight:700;font-size:14px;margin-bottom:16px;">
    🚀 Voir mon espace partenaire
  </a>

  <p style="font-size:10px;color:#94a3b8;text-align:center;">
    IBIG PARTNERS · Cet email est envoyé chaque lundi matin.
    <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://ibigpartners.com"}/espace/notifications" style="color:#94a3b8;">Gérer mes notifications</a>
  </p>
</div>`;

    const emailData = { to: p.email, subject: `📊 Votre score IBIG cette semaine : ${scoreNow} pts`, html };
    after(() => sendEmail(emailData).catch(() => {}));
    sent++;
  }

  return NextResponse.json({ ok: true, partners: partners.length, sent });
}

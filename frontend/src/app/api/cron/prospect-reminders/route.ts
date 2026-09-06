import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM   = process.env.EMAIL_FROM ?? "IBIG PARTNERS <noreply@mail.ibigpartners.com>";
const SITE   = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ibigpartners.com";
const DELAY_MS = 120;

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Prospects non relancés depuis 7+ jours, pas encore CONVERTED/LOST
  const staleProspects = await prisma.prospect.findMany({
    where: {
      status: { notIn: ["CONVERTED", "LOST"] },
      OR: [
        { lastContactedAt: { lte: sevenDaysAgo } },
        { lastContactedAt: null, createdAt: { lte: sevenDaysAgo } },
      ],
    },
    include: { user: { select: { email: true, firstName: true, lastName: true } } },
    take: 200,
  });

  // Regrouper par partenaire
  const byUser = new Map<string, { user: { email: string; firstName: string; lastName: string }; prospects: typeof staleProspects }>();
  for (const p of staleProspects) {
    const uid = p.userId;
    if (!byUser.has(uid)) byUser.set(uid, { user: p.user, prospects: [] });
    byUser.get(uid)!.prospects.push(p);
  }

  let sent = 0;
  for (const { user, prospects } of byUser.values()) {
    if (!resend) break;
    const rows = prospects
      .slice(0, 10)
      .map((p) => `<tr><td style="padding:6px 8px;border-bottom:1px solid #f1f5f9;font-size:13px">${p.name}</td><td style="padding:6px 8px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b">${p.contact ?? "—"}</td><td style="padding:6px 8px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#f59e0b">${p.status}</td></tr>`)
      .join("");

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head><body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:32px 0;">
<table width="600" align="center" style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e2e8f0">
<tr><td>
  <p style="font-size:20px;font-weight:bold;color:#0f172a;margin-bottom:8px">Rappel relances prospects</p>
  <p style="font-size:14px;color:#64748b;margin-bottom:24px">Bonjour ${user.firstName},<br>Vous avez <strong>${prospects.length} prospect(s)</strong> qui n'ont pas été relancés depuis plus de 7 jours :</p>
  <table width="100%" style="border-collapse:collapse;background:#f8fafc;border-radius:8px">
    <thead><tr style="background:#f1f5f9"><th style="padding:8px;text-align:left;font-size:12px;color:#64748b">Nom</th><th style="padding:8px;text-align:left;font-size:12px;color:#64748b">Contact</th><th style="padding:8px;text-align:left;font-size:12px;color:#64748b">Statut</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <a href="${SITE}/espace/prospects" style="display:inline-block;margin-top:20px;background:#2563eb;color:#fff;padding:10px 24px;border-radius:10px;font-size:14px;font-weight:bold;text-decoration:none">Voir mes prospects →</a>
</td></tr>
</table></body></html>`;

    await resend.emails.send({ from: FROM, to: user.email, subject: `⚠️ ${prospects.length} prospect(s) à relancer — IBIG PARTNERS`, html });
    sent++;
    await sleep(DELAY_MS);
  }

  return NextResponse.json({ ok: true, usersNotified: sent, totalProspects: staleProspects.length });
}

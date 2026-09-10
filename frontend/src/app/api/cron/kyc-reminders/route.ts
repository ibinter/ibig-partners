import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email-utils";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ibigpartners.com";

const REMINDERS = [
  {
    day: 2,
    subject: "🔐 Complétez votre inscription IBIG PARTNERS",
    bodyFn: (n: string) => `
      <p style="font-size:15px;color:#374151;">Bonjour <strong>${n}</strong>,</p>
      <p style="font-size:15px;color:#374151;line-height:1.7;">
        Votre compte IBIG PARTNERS a bien été créé, mais il manque encore une étape
        importante : la <strong>vérification de votre identité</strong>.
      </p>
      <p style="font-size:15px;color:#374151;line-height:1.7;">
        Sans cette vérification, vous ne pouvez pas percevoir vos commissions.
        C'est rapide — préparez votre pièce d'identité et envoyez-la en quelques clics.
      </p>
      <p style="text-align:center;margin:28px 0;">
        <a href="${SITE}/espace/verification"
           style="background:#0b5fff;color:#fff;font-weight:700;font-size:15px;
                  padding:14px 32px;border-radius:10px;text-decoration:none;display:inline-block;">
          Vérifier mon compte →
        </a>
      </p>
      <p style="font-size:13px;color:#6b7280;">
        Une question ? WhatsApp :
        <a href="https://wa.me/2250778882592" style="color:#0b5fff;">+225 07 78 88 25 92</a>
      </p>
    `,
  },
  {
    day: 5,
    subject: "⚠️ Votre compte IBIG PARTNERS est incomplet",
    bodyFn: (n: string) => `
      <p style="font-size:15px;color:#374151;">Bonjour <strong>${n}</strong>,</p>
      <p style="font-size:15px;color:#374151;line-height:1.7;">
        Cela fait 5 jours que vous vous êtes inscrit(e) chez IBIG PARTNERS —
        mais votre compte n'est <strong>pas encore vérifié</strong>.
      </p>
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;margin:20px 0;">
        <p style="margin:0;font-size:14px;color:#92400e;line-height:1.8;">
          ❌ Commissions bloquées jusqu'à la vérification<br/>
          ❌ Liens d'affiliation inactifs<br/>
          ✅ Débloquez tout en 2 minutes chrono
        </p>
      </div>
      <p style="text-align:center;margin:28px 0;">
        <a href="${SITE}/espace/verification"
           style="background:#f59e0b;color:#fff;font-weight:700;font-size:15px;
                  padding:14px 32px;border-radius:10px;text-decoration:none;display:inline-block;">
          Activer mon compte maintenant →
        </a>
      </p>
      <p style="font-size:13px;color:#6b7280;">
        Besoin d'aide ? Contactez-nous :
        <a href="mailto:support@ibigpartners.com" style="color:#0b5fff;">support@ibigpartners.com</a>
      </p>
    `,
  },
  {
    day: 10,
    subject: "🚨 Dernière chance — Activez votre compte IBIG PARTNERS",
    bodyFn: (n: string) => `
      <p style="font-size:15px;color:#374151;">Bonjour <strong>${n}</strong>,</p>
      <p style="font-size:15px;color:#374151;line-height:1.7;">
        Votre compte IBIG PARTNERS est toujours <strong>en attente de vérification</strong>
        depuis 10 jours. Sans action de votre part, vous ne pourrez pas percevoir vos commissions.
      </p>
      <p style="font-size:15px;color:#374151;line-height:1.7;">
        La procédure prend moins de 2 minutes : une photo de votre pièce d'identité
        et c'est tout. Notre équipe valide généralement en moins de 24h.
      </p>
      <p style="text-align:center;margin:28px 0;">
        <a href="${SITE}/espace/verification"
           style="background:#ef4444;color:#fff;font-weight:700;font-size:15px;
                  padding:14px 32px;border-radius:10px;text-decoration:none;display:inline-block;">
          Soumettre mes documents →
        </a>
      </p>
      <p style="font-size:13px;color:#6b7280;">
        Si vous rencontrez un problème, contactez-nous immédiatement :<br/>
        WhatsApp <a href="https://wa.me/2250778882592" style="color:#0b5fff;">+225 07 78 88 25 92</a>
        · <a href="mailto:support@ibigpartners.com" style="color:#0b5fff;">support@ibigpartners.com</a>
      </p>
    `,
  },
];

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Affiliés actifs dont le KYC n'a pas encore été soumis
  const pending = await prisma.user.findMany({
    where: {
      role: "PARTNER",
      active: true,
      verificationStatus: "NONE",
    },
    select: { id: true, firstName: true, email: true, createdAt: true },
  });

  let sent = 0;
  for (const p of pending) {
    const daysSince = Math.floor((now.getTime() - new Date(p.createdAt).getTime()) / 86400000);

    for (const r of REMINDERS) {
      if (daysSince >= r.day && daysSince < r.day + 2) {
        const already = await (prisma as any).emailSequenceLog.findUnique({
          where: {
            userId_sequence_step: {
              userId: p.id,
              sequence: "KYC_REMINDER",
              step: `D${r.day}`,
            },
          },
        });
        if (!already) {
          try {
            const { emailId } = await sendEmail({
              to: p.email,
              subject: r.subject,
              html: `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="background:#0b5fff;border-radius:14px 14px 0 0;padding:28px 40px;text-align:center;">
  <span style="font-size:22px;font-weight:800;color:#fff;">IBIG PARTNERS</span>
  <p style="margin:4px 0 0;color:#c3d4ff;font-size:13px;">Programme d'affiliation IBIG SARL</p>
</td></tr>
<tr><td style="background:#fff;padding:36px 40px;">${r.bodyFn(p.firstName)}</td></tr>
<tr><td style="background:#f8fafc;border-radius:0 0 14px 14px;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
  <p style="margin:0;font-size:12px;color:#94a3b8;">
    IBIG SARL · Abidjan, Côte d'Ivoire<br/>
    <a href="${SITE}" style="color:#0b5fff;">${SITE}</a>
  </p>
</td></tr>
</table></td></tr></table>
</body></html>`,
            });
            await (prisma as any).emailSequenceLog.create({
              data: {
                userId: p.id,
                sequence: "KYC_REMINDER",
                step: `D${r.day}`,
                emailId: emailId ?? null,
              },
            });
            sent++;
          } catch { /* continue */ }
          await new Promise((res) => setTimeout(res, 120));
        }
      }
    }
  }

  return NextResponse.json({ checked: pending.length, sent });
}

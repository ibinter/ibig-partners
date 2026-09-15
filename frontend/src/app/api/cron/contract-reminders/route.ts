import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email-utils";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ibigpartners.com";

const REMINDERS = [
  {
    day: 3,
    subject: "✍️ Signez votre contrat IBIG PARTNERS pour commencer",
    bodyFn: (n: string) => `
      <p style="font-size:15px;color:#374151;">Bonjour <strong>${n}</strong>,</p>
      <p style="font-size:15px;color:#374151;line-height:1.7;">
        Votre compte IBIG PARTNERS est créé — il ne reste plus qu'une étape avant de pouvoir
        accéder à votre espace complet : <strong>signer votre contrat de partenariat</strong>.
      </p>
      <p style="font-size:15px;color:#374151;line-height:1.7;">
        C'est rapide (moins de 2 minutes), 100% électronique et sans aucun engagement financier.
        Le contrat définit vos droits, vos commissions et les règles du programme.
      </p>
      <div style="background:#f0f4ff;border:1px solid #c3d4ff;border-radius:10px;padding:16px 20px;margin:20px 0;">
        <p style="margin:0;font-size:14px;color:#1e40af;line-height:1.8;font-weight:600;">
          Ce que vous débloquez en signant :
        </p>
        <p style="margin:8px 0 0;font-size:14px;color:#374151;line-height:1.8;">
          ✅ Accès à votre kit marketing complet<br/>
          ✅ Liens d'affiliation sur 14 logiciels<br/>
          ✅ Commissions jusqu'à 20% sur vos ventes<br/>
          ✅ Réseau 3 niveaux actif
        </p>
      </div>
      <p style="text-align:center;margin:28px 0;">
        <a href="${SITE}/espace/contrat"
           style="background:#7c3aed;color:#fff;font-weight:700;font-size:15px;
                  padding:14px 32px;border-radius:10px;text-decoration:none;display:inline-block;">
          Signer mon contrat maintenant →
        </a>
      </p>
      <p style="font-size:13px;color:#6b7280;">
        Une question ? WhatsApp :
        <a href="https://wa.me/2250778882592" style="color:#0b5fff;">+225 07 78 88 25 92</a>
      </p>
    `,
  },
  {
    day: 7,
    subject: "⚠️ Votre espace IBIG PARTNERS vous attend — contrat non signé",
    bodyFn: (n: string) => `
      <p style="font-size:15px;color:#374151;">Bonjour <strong>${n}</strong>,</p>
      <p style="font-size:15px;color:#374151;line-height:1.7;">
        Cela fait maintenant <strong>7 jours</strong> que vous êtes inscrit(e) chez IBIG PARTNERS,
        mais votre contrat de partenariat n'a pas encore été signé.
      </p>
      <div style="background:#fff7ed;border:1px solid #fdba74;border-radius:10px;padding:16px 20px;margin:20px 0;">
        <p style="margin:0;font-size:14px;color:#9a3412;line-height:1.8;">
          ❌ Liens d'affiliation inaccessibles<br/>
          ❌ Kit marketing verrouillé<br/>
          ❌ Commissions non activées<br/>
          ✅ Tout s'ouvre dès que vous signez (2 min)
        </p>
      </div>
      <p style="font-size:15px;color:#374151;line-height:1.7;">
        Ne laissez pas passer cette opportunité. Des centaines de partenaires génèrent
        déjà des commissions chaque semaine — rejoignez-les dès aujourd'hui.
      </p>
      <p style="text-align:center;margin:28px 0;">
        <a href="${SITE}/espace/contrat"
           style="background:#ea580c;color:#fff;font-weight:700;font-size:15px;
                  padding:14px 32px;border-radius:10px;text-decoration:none;display:inline-block;">
          Signer mon contrat maintenant →
        </a>
      </p>
      <p style="font-size:13px;color:#6b7280;">
        Besoin d'aide ? Contactez-nous :<br/>
        WhatsApp <a href="https://wa.me/2250778882592" style="color:#0b5fff;">+225 07 78 88 25 92</a>
        · <a href="mailto:support@ibigpartners.com" style="color:#0b5fff;">support@ibigpartners.com</a>
      </p>
    `,
  },
];

function wrapEmail(body: string) {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="background:#7c3aed;border-radius:14px 14px 0 0;padding:28px 40px;text-align:center;">
  <span style="font-size:22px;font-weight:800;color:#fff;">IBIG PARTNERS</span>
  <p style="margin:4px 0 0;color:#ddd6fe;font-size:13px;">Programme d'affiliation IBIG SARL</p>
</td></tr>
<tr><td style="background:#fff;padding:36px 40px;">${body}</td></tr>
<tr><td style="background:#f8fafc;border-radius:0 0 14px 14px;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
  <p style="margin:0;font-size:12px;color:#94a3b8;">
    IBIG SARL · Abidjan, Côte d'Ivoire<br/>
    <a href="${SITE}" style="color:#7c3aed;">${SITE}</a>
  </p>
</td></tr>
</table></td></tr></table>
</body></html>`;
}

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Partenaires sans contrat signé
  const pending = await prisma.user.findMany({
    where: {
      role: "PARTNER",
      active: true,
      contract: null,
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
              sequence: "CONTRACT_REMINDER",
              step: `D${r.day}`,
            },
          },
        });
        if (!already) {
          try {
            const { emailId } = await sendEmail({
              to: p.email,
              subject: r.subject,
              html: wrapEmail(r.bodyFn(p.firstName)),
            });
            await (prisma as any).emailSequenceLog.create({
              data: {
                userId: p.id,
                sequence: "CONTRACT_REMINDER",
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

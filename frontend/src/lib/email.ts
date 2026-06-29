/**
 * Module email — IBIG PARTNERS
 * Utilise Resend (https://resend.com) pour les e-mails transactionnels.
 * Si RESEND_API_KEY n'est pas définie, les envois sont loggués en console (mode dev).
 */

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM ?? "IBIG PARTNERS <noreply@mail.ibigpartners.com>";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// ─── Utilitaire d'envoi ────────────────────────────────────────────────────

async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    // En dev, log au lieu d'envoyer
    console.log(`[EMAIL DEV] To: ${opts.to} | Subject: ${opts.subject}`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, ...opts });
  } catch (err) {
    // Ne pas faire planter le flux métier si l'email échoue
    console.error("[EMAIL ERROR]", err);
  }
}

// ─── Layout commun ────────────────────────────────────────────────────────

function layout(content: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>IBIG PARTNERS</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:#0b5fff;border-radius:14px 14px 0 0;padding:28px 40px;text-align:center;">
              <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">
                IBIG PARTNERS
              </span>
              <p style="margin:4px 0 0;color:#c3d4ff;font-size:13px;">
                Programme d'affiliation IBIG SARL
              </p>
            </td>
          </tr>
          <!-- Corps -->
          <tr>
            <td style="background:#fff;padding:36px 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-radius:0 0 14px 14px;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                IBIG SARL · Abidjan, Côte d'Ivoire<br/>
                <a href="${SITE}" style="color:#0b5fff;text-decoration:none;">${SITE}</a>
                &nbsp;·&nbsp;
                <a href="${SITE}/espace" style="color:#0b5fff;text-decoration:none;">Mon espace partenaire</a>
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#cbd5e1;">
                Vous recevez cet e-mail car vous êtes partenaire IBIG PARTNERS.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function btn(label: string, href: string) {
  return `<a href="${href}"
    style="display:inline-block;background:#0b5fff;color:#fff;font-weight:700;font-size:15px;
    padding:14px 32px;border-radius:10px;text-decoration:none;margin-top:24px;">
    ${label}
  </a>`;
}

function fcfaFmt(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

// ─── E-mail 1 : Bienvenue à l'inscription ────────────────────────────────

export async function sendWelcomeEmail(opts: {
  to: string;
  firstName: string;
  code: string;
  sponsorName?: string;
}) {
  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#0f1729;">
      Bienvenue, ${opts.firstName} ! 🎉
    </h2>
    <p style="margin:0 0 20px;color:#5b6577;font-size:15px;line-height:1.6;">
      Votre compte IBIG PARTNERS a bien été créé. Un administrateur va valider
      votre inscription dans les plus brefs délais — vous recevrez un e-mail dès
      que votre compte sera activé.
    </p>

    <div style="background:#f0f4ff;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:13px;color:#5b6577;text-transform:uppercase;letter-spacing:0.5px;">
        Votre code d'affiliation
      </p>
      <p style="margin:0;font-size:28px;font-weight:800;color:#0b5fff;letter-spacing:2px;">
        ${opts.code}
      </p>
      <p style="margin:6px 0 0;font-size:13px;color:#5b6577;">
        Partagez ce code pour parrainer de nouveaux partenaires.
      </p>
    </div>

    ${opts.sponsorName ? `
    <p style="color:#5b6577;font-size:14px;">
      Vous avez été parrainé(e) par <strong>${opts.sponsorName}</strong>.
    </p>
    ` : ""}

    <p style="color:#5b6577;font-size:14px;line-height:1.6;">
      En attendant la validation, explorez votre espace partenaire et
      découvrez les produits IBIG disponibles à promouvoir.
    </p>

    ${btn("Accéder à mon espace", `${SITE}/espace`)}

    <hr style="margin:32px 0;border:none;border-top:1px solid #e2e8f0;" />
    <p style="margin:0;font-size:13px;color:#94a3b8;">
      Une question ? Contactez-nous à
      <a href="mailto:support@ibigpartners.com" style="color:#0b5fff;">support@ibigpartners.com</a>
    </p>
  `);

  await sendEmail({
    to: opts.to,
    subject: `Bienvenue chez IBIG PARTNERS — Votre code : ${opts.code}`,
    html,
  });
}

// ─── E-mail 2 : Compte validé par l'admin ─────────────────────────────────

export async function sendAccountApprovedEmail(opts: {
  to: string;
  firstName: string;
  code: string;
}) {
  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#0f1729;">
      Votre compte est activé ✅
    </h2>
    <p style="margin:0 0 20px;color:#5b6577;font-size:15px;line-height:1.6;">
      Bonne nouvelle, <strong>${opts.firstName}</strong> ! Votre compte IBIG PARTNERS
      a été validé par notre équipe. Vous pouvez maintenant accéder à toutes les
      fonctionnalités de votre espace partenaire.
    </p>

    <div style="background:#f0fdf4;border-radius:10px;padding:20px 24px;margin-bottom:24px;border:1px solid #bbf7d0;">
      <p style="margin:0;font-size:14px;color:#166534;">
        ✓ Activez vos liens d'affiliation<br/>
        ✓ Générez vos QR codes<br/>
        ✓ Suivez vos commissions en temps réel<br/>
        ✓ Gérez votre réseau de filleuls
      </p>
    </div>

    <p style="color:#5b6577;font-size:14px;">
      Votre code d'affiliation : <strong style="color:#0b5fff;">${opts.code}</strong>
    </p>

    ${btn("Accéder à mon espace", `${SITE}/espace`)}
  `);

  await sendEmail({
    to: opts.to,
    subject: "Votre compte IBIG PARTNERS est activé !",
    html,
  });
}

// ─── E-mail 3 : Commissions validées (prêtes à payer) ────────────────────

export async function sendCommissionsValidatedEmail(opts: {
  to: string;
  firstName: string;
  totalAmount: number;
  count: number;
}) {
  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#0f1729;">
      Vos commissions sont validées 💰
    </h2>
    <p style="margin:0 0 20px;color:#5b6577;font-size:15px;line-height:1.6;">
      Bonjour <strong>${opts.firstName}</strong>, de nouvelles commissions viennent
      d'être validées par l'équipe IBIG et sont désormais en attente de virement.
    </p>

    <div style="background:#fffbeb;border-radius:10px;padding:24px;margin-bottom:24px;border:1px solid #fde68a;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">
        Montant validé
      </p>
      <p style="margin:0;font-size:36px;font-weight:800;color:#b45309;">
        ${fcfaFmt(opts.totalAmount)}
      </p>
      <p style="margin:6px 0 0;font-size:13px;color:#92400e;">
        ${opts.count} commission${opts.count > 1 ? "s" : ""}
      </p>
    </div>

    <p style="color:#5b6577;font-size:14px;line-height:1.6;">
      Le virement sera effectué sur votre méthode de paiement enregistrée
      dès traitement par notre équipe. Vous recevrez une confirmation par e-mail.
    </p>

    ${btn("Voir mes commissions", `${SITE}/espace/commissions`)}
  `);

  await sendEmail({
    to: opts.to,
    subject: `${fcfaFmt(opts.totalAmount)} de commissions validées — IBIG PARTNERS`,
    html,
  });
}

// ─── E-mail 4 : Virement effectué ─────────────────────────────────────────

export async function sendPayoutPaidEmail(opts: {
  to: string;
  firstName: string;
  amount: number;
  method: string;
  reference: string;
}) {
  const methodLabels: Record<string, string> = {
    ORANGE_MONEY: "Orange Money",
    WAVE: "Wave",
    MTN_MOMO: "MTN MoMo",
    BANK: "Virement bancaire",
  };

  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#0f1729;">
      Virement effectué 🏦
    </h2>
    <p style="margin:0 0 20px;color:#5b6577;font-size:15px;line-height:1.6;">
      Bonjour <strong>${opts.firstName}</strong>, votre virement a été traité avec succès.
    </p>

    <div style="background:#f0fdf4;border-radius:10px;padding:24px;margin-bottom:24px;border:1px solid #bbf7d0;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;color:#166534;text-transform:uppercase;letter-spacing:0.5px;">
        Montant versé
      </p>
      <p style="margin:0;font-size:36px;font-weight:800;color:#15803d;">
        ${fcfaFmt(opts.amount)}
      </p>
      <p style="margin:8px 0 0;font-size:14px;color:#166534;">
        via ${methodLabels[opts.method] ?? opts.method}
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#5b6577;">
          Référence
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f1729;
          font-weight:600;text-align:right;font-family:monospace;">
          ${opts.reference}
        </td>
      </tr>
    </table>

    <p style="color:#5b6577;font-size:14px;line-height:1.6;">
      Conservez cette référence comme preuve de paiement.
      Si vous ne recevez pas le montant dans les 24h, contactez notre support.
    </p>

    ${btn("Voir mon relevé de commissions", `${SITE}/espace/commissions`)}

    <hr style="margin:32px 0;border:none;border-top:1px solid #e2e8f0;" />
    <p style="margin:0;font-size:13px;color:#94a3b8;">
      Support :
      <a href="mailto:support@ibigpartners.com" style="color:#0b5fff;">support@ibigpartners.com</a>
    </p>
  `);

  await sendEmail({
    to: opts.to,
    subject: `Virement de ${fcfaFmt(opts.amount)} effectué — IBIG PARTNERS`,
    html,
  });
}

// ─── E-mail 5 : Annonce de l'équipe ───────────────────────────────────────

export async function sendAnnouncementEmail(opts: {
  to: string;
  firstName: string;
  title: string;
  body: string;
}) {
  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#0f1729;">
      ${opts.title}
    </h2>
    <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;">
      Message de l'équipe IBIG PARTNERS
    </p>
    <hr style="margin:16px 0;border:none;border-top:1px solid #e2e8f0;" />
    <div style="font-size:15px;color:#374151;line-height:1.7;white-space:pre-line;">
      ${opts.body}
    </div>
    ${btn("Accéder à mon espace", `${SITE}/espace`)}
  `);

  await sendEmail({
    to: opts.to,
    subject: `[IBIG PARTNERS] ${opts.title}`,
    html,
  });
}

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

export type EmailResult = { ok: boolean; id?: string; error?: string };

async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<EmailResult> {
  if (!resend) {
    // En dev, log au lieu d'envoyer
    console.log(`[EMAIL DEV] To: ${opts.to} | Subject: ${opts.subject}`);
    return { ok: false, error: "RESEND_API_KEY absente (mode log / non envoyé)" };
  }
  try {
    // Le SDK Resend NE throw PAS sur erreur API : il renvoie { data, error }.
    const { data, error } = await resend.emails.send({ from: FROM, ...opts });
    if (error) {
      const msg = `${(error as { name?: string }).name ?? "error"}: ${(error as { message?: string }).message ?? JSON.stringify(error)}`;
      console.error("[EMAIL API ERROR]", msg);
      return { ok: false, error: msg };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[EMAIL EXCEPTION]", msg);
    return { ok: false, error: msg };
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

// ─── E-mail : Inscription reçue — en attente de validation admin ─────────

export async function sendRegistrationReceivedEmail(opts: {
  to: string;
  firstName: string;
  code: string;
  sponsorName?: string;
}): Promise<EmailResult> {
  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#0f1729;">
      ${opts.firstName}, votre inscription est bien reçue ✅
    </h2>
    <p style="margin:0 0 20px;color:#5b6577;font-size:15px;line-height:1.6;">
      Merci de rejoindre <strong>IBIG PARTNERS</strong> ! Votre dossier est en cours
      d'examen par notre équipe. Vous recevrez un e-mail de confirmation dès que
      votre compte sera activé — généralement sous <strong>24 à 48 heures</strong>.
    </p>

    <div style="background:#f0f4ff;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:13px;color:#5b6577;text-transform:uppercase;letter-spacing:0.5px;">
        Votre code d'affiliation (réservé)
      </p>
      <p style="margin:0;font-size:28px;font-weight:800;color:#0b5fff;letter-spacing:2px;">
        ${opts.code}
      </p>
      <p style="margin:6px 0 0;font-size:13px;color:#5b6577;">
        Conservez ce code — il sera actif dès la validation de votre compte.
      </p>
    </div>

    ${opts.sponsorName ? `
    <p style="color:#5b6577;font-size:14px;margin:0 0 16px;">
      Vous avez été parrainé(e) par <strong>${opts.sponsorName}</strong>.
    </p>
    ` : ""}

    <div style="background:#fffbeb;border-radius:10px;padding:16px 20px;margin-bottom:24px;border:1px solid #fde68a;">
      <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#92400e;">
        ⏳ En attendant la validation, préparez-vous :
      </p>
      <p style="margin:0;font-size:14px;color:#92400e;line-height:1.8;">
        1. Préparez votre pièce d'identité (CNI ou passeport)<br/>
        2. Notez vos coordonnées de paiement (Orange Money, Wave, banque…)<br/>
        3. Réfléchissez à votre premier réseau de prospects
      </p>
    </div>

    <p style="color:#5b6577;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Dès activation, vous aurez accès à votre espace partenaire, vos liens
      d'affiliation, le kit marketing et l'académie IBIG.
    </p>

    ${btn("Accéder à mon espace (lecture)", `${SITE}/espace`)}

    <hr style="margin:28px 0;border:none;border-top:1px solid #e2e8f0;" />
    <p style="margin:0;font-size:13px;color:#94a3b8;">
      Une question ? WhatsApp :
      <a href="https://wa.me/2250778882592" style="color:#0b5fff;font-weight:600;">+225 07 78 88 25 92</a>
      &nbsp;·&nbsp;
      <a href="mailto:support@ibigpartners.com" style="color:#0b5fff;">support@ibigpartners.com</a>
    </p>
  `);

  return sendEmail({
    to: opts.to,
    subject: `✅ Inscription IBIG PARTNERS reçue — validation sous 24-48h`,
    html,
  });
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

// ─── E-mail : Demande de retrait (affilié → IBIG) ────────────────────────
export async function sendPayoutRequestedEmail(opts: {
  to: string;
  firstName: string;
  amount: number;
  method: string;
}) {
  const methodLabels: Record<string, string> = {
    ORANGE_MONEY: "Orange Money",
    WAVE: "Wave",
    MTN_MOMO: "MTN MoMo",
    BANK: "Virement bancaire",
    PAYPAL: "PayPal",
    WESTERN_UNION: "Western Union",
  };

  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#0f1729;">
      Demande de retrait reçue ✅
    </h2>
    <p style="margin:0 0 20px;color:#5b6577;font-size:15px;line-height:1.6;">
      Bonjour <strong>${opts.firstName}</strong>, votre demande de retrait a bien été enregistrée.
      L'équipe IBIG PARTNERS la traitera dans les <strong>24 à 48 heures</strong>.
    </p>

    <div style="background:#eff6ff;border-radius:10px;padding:24px;margin-bottom:24px;border:1px solid #bfdbfe;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;color:#1d4ed8;text-transform:uppercase;letter-spacing:0.5px;">
        Montant demandé
      </p>
      <p style="margin:0;font-size:36px;font-weight:800;color:#1e40af;">
        ${fcfaFmt(opts.amount)}
      </p>
      <p style="margin:8px 0 0;font-size:14px;color:#1d4ed8;">
        via ${methodLabels[opts.method] ?? opts.method}
      </p>
    </div>

    <p style="color:#5b6577;font-size:14px;line-height:1.6;">
      Vous recevrez un e-mail de confirmation dès que le virement aura été effectué.
      Si vous avez des questions, contactez notre support.
    </p>

    ${btn("Voir mes paiements", `${SITE}/espace/paiements`)}

    <hr style="margin:32px 0;border:none;border-top:1px solid #e2e8f0;" />
    <p style="margin:0;font-size:13px;color:#94a3b8;">
      Support :
      <a href="mailto:support@ibigpartners.com" style="color:#0b5fff;">support@ibigpartners.com</a>
    </p>
  `);

  return sendEmail({
    to: opts.to,
    subject: `Demande de retrait de ${fcfaFmt(opts.amount)} — IBIG PARTNERS`,
    html,
  });
}

// ─── E-mail : Rappel de vérification du compte (KYC) ─────────────────────

export async function sendVerificationReminderEmail(opts: {
  to: string;
  firstName: string;
}): Promise<EmailResult> {
  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#0f1729;">
      Vérifiez votre compte pour l'activer 🔐
    </h2>
    <p style="margin:0 0 20px;color:#5b6577;font-size:15px;line-height:1.6;">
      Bonjour <strong>${opts.firstName}</strong>, votre compte IBIG PARTNERS n'est
      pas encore vérifié. Sans vérification, vos commissions sont calculées mais
      <strong>non versées</strong>.
    </p>

    <div style="background:#fffbeb;border-radius:10px;padding:20px 24px;margin-bottom:24px;border:1px solid #fde68a;">
      <p style="margin:0;font-size:14px;color:#92400e;line-height:1.7;">
        En envoyant vos documents, vous débloquez :<br/>
        ✓ la déclaration de vos ventes<br/>
        ✓ toutes les fonctionnalités de votre espace<br/>
        ✓ le versement de vos commissions
      </p>
    </div>

    <p style="color:#5b6577;font-size:14px;line-height:1.6;">
      C'est rapide et sécurisé : remplissez le formulaire, notre équipe l'examine
      sous 48h et vous êtes notifié dès validation.
    </p>

    ${btn("Vérifier mon compte", `${SITE}/espace/verification`)}

    <hr style="margin:32px 0;border:none;border-top:1px solid #e2e8f0;" />
    <p style="margin:0;font-size:13px;color:#94a3b8;">
      Une question ? Contactez-nous à
      <a href="mailto:support@ibigpartners.com" style="color:#0b5fff;">support@ibigpartners.com</a>
    </p>
  `);

  return sendEmail({
    to: opts.to,
    subject: "Action requise : vérifiez votre compte IBIG PARTNERS",
    html,
  });
}

// ─── E-mail : Reçu de paiement au CLIENT ─────────────────────────────────

export async function sendPaymentReceiptEmail(opts: {
  to: string;
  customerName: string;
  productName: string;
  amount: number;
  reference: string;
}): Promise<EmailResult> {
  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#0f1729;">
      Paiement confirmé ✅
    </h2>
    <p style="margin:0 0 20px;color:#5b6577;font-size:15px;line-height:1.6;">
      Bonjour <strong>${opts.customerName}</strong>, nous confirmons la bonne réception
      de votre paiement. Merci de votre confiance !
    </p>

    <div style="background:#f0fdf4;border-radius:10px;padding:24px;margin-bottom:24px;border:1px solid #bbf7d0;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;color:#166534;text-transform:uppercase;letter-spacing:0.5px;">
        Montant payé
      </p>
      <p style="margin:0;font-size:34px;font-weight:800;color:#15803d;">
        ${fcfaFmt(opts.amount)}
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#5b6577;">Prestation</td>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f1729;font-weight:600;text-align:right;">${opts.productName}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#5b6577;">Référence</td>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f1729;font-weight:600;text-align:right;font-family:monospace;">${opts.reference}</td>
      </tr>
    </table>

    <p style="color:#5b6577;font-size:14px;line-height:1.6;">
      Conservez cette référence comme preuve de paiement. Notre équipe vous
      contactera pour la suite de votre commande. Pour toute question :
      <a href="mailto:support@ibigpartners.com" style="color:#0b5fff;">support@ibigpartners.com</a>.
    </p>
  `);

  return sendEmail({
    to: opts.to,
    subject: `Reçu de paiement — ${opts.reference} · IBIG PARTNERS`,
    html,
  });
}

// ─── E-mail : Nouvelle vente à l'AFFILIÉ ─────────────────────────────────

export async function sendNewSaleEmail(opts: {
  to: string;
  firstName: string;
  productName: string;
  amount: number;
  customerName: string;
  reference: string;
}): Promise<EmailResult> {
  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#0f1729;">
      🎉 Nouvelle vente confirmée !
    </h2>
    <p style="margin:0 0 20px;color:#5b6577;font-size:15px;line-height:1.6;">
      Félicitations <strong>${opts.firstName}</strong> ! Un client vient de régler
      une commande via votre lien d'affiliation. Votre commission est en cours de
      calcul et apparaîtra dans votre espace.
    </p>

    <div style="background:#f0f4ff;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;font-size:14px;color:#5b6577;">Prestation</td><td style="padding:6px 0;font-size:14px;color:#0f1729;font-weight:600;text-align:right;">${opts.productName}</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#5b6577;">Montant</td><td style="padding:6px 0;font-size:14px;color:#0b5fff;font-weight:700;text-align:right;">${fcfaFmt(opts.amount)}</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#5b6577;">Client</td><td style="padding:6px 0;font-size:14px;color:#0f1729;font-weight:600;text-align:right;">${opts.customerName}</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#5b6577;">Référence</td><td style="padding:6px 0;font-size:14px;color:#0f1729;font-weight:600;text-align:right;font-family:monospace;">${opts.reference}</td></tr>
      </table>
    </div>

    ${btn("Voir mes commissions", `${SITE}/espace/commissions`)}
  `);

  return sendEmail({
    to: opts.to,
    subject: `🎉 Nouvelle vente ${opts.reference} — ${fcfaFmt(opts.amount)}`,
    html,
  });
}

// ─── E-mail : Résumé hebdomadaire de l'affilié ───────────────────────────

export async function sendWeeklyDigestEmail(opts: {
  to: string;
  firstName: string;
  salesCount: number;
  salesAmount: number;
  commissionsAmount: number;
  statusLabel: string;
}): Promise<EmailResult> {
  const active = opts.salesCount > 0 || opts.commissionsAmount > 0;
  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#0f1729;">
      Votre semaine chez IBIG PARTNERS 📊
    </h2>
    <p style="margin:0 0 20px;color:#5b6577;font-size:15px;line-height:1.6;">
      Bonjour <strong>${opts.firstName}</strong>, voici votre récapitulatif des 7 derniers jours.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px;">
      <tr>
        <td style="width:33%;background:#f0f4ff;border-radius:10px;padding:16px;text-align:center;">
          <p style="margin:0;font-size:24px;font-weight:800;color:#0b5fff;">${opts.salesCount}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#5b6577;">Vente${opts.salesCount > 1 ? "s" : ""}</p>
        </td>
        <td style="width:8px;"></td>
        <td style="width:33%;background:#fffbeb;border-radius:10px;padding:16px;text-align:center;">
          <p style="margin:0;font-size:20px;font-weight:800;color:#b45309;">${fcfaFmt(opts.commissionsAmount)}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#92400e;">Commissions gagnées</p>
        </td>
        <td style="width:8px;"></td>
        <td style="width:33%;background:#f0fdf4;border-radius:10px;padding:16px;text-align:center;">
          <p style="margin:0;font-size:16px;font-weight:800;color:#15803d;">${opts.statusLabel}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#166534;">Votre statut</p>
        </td>
      </tr>
    </table>

    ${active ? `
    <p style="color:#5b6577;font-size:14px;line-height:1.6;">
      Beau travail ! Continuez à partager vos liens pour transformer l'élan en revenus réguliers.
    </p>` : `
    <div style="background:#f8fafc;border:1px dashed #cbd5e1;border-radius:10px;padding:16px 18px;margin-bottom:20px;">
      <p style="margin:0;font-size:14px;color:#475569;">
        Aucune vente cette semaine — pas de souci, il suffit d'un partage pour démarrer.
        Envoyez votre lien à 5 contacts sur WhatsApp aujourd'hui : c'est souvent tout ce qu'il faut. 💪
      </p>
    </div>`}

    ${btn("Voir mon tableau de bord", `${SITE}/espace`)}
  `);

  return sendEmail({
    to: opts.to,
    subject: `📊 Votre semaine IBIG PARTNERS — ${opts.salesCount} vente${opts.salesCount > 1 ? "s" : ""}, ${fcfaFmt(opts.commissionsAmount)}`,
    html,
  });
}

// ─── E-mail : Relance affilié inactif ────────────────────────────────────

export async function sendInactiveReminderEmail(opts: {
  to: string;
  firstName: string;
  daysSinceLastSale: number;
  totalEarned: number;
  code: string;
}): Promise<EmailResult> {
  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#0f1729;">
      ${opts.firstName}, vos commissions vous attendent 💰
    </h2>
    <p style="margin:0 0 20px;color:#5b6577;font-size:15px;line-height:1.6;">
      Cela fait <strong>${opts.daysSinceLastSale} jour${opts.daysSinceLastSale > 1 ? "s" : ""}</strong> que vous n'avez pas déclaré de vente.
      Votre réseau est toujours actif — il ne manque qu'un partage pour relancer l'élan.
    </p>

    <div style="background:#f0f4ff;border-radius:10px;padding:20px 24px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;color:#3b5bdb;text-transform:uppercase;letter-spacing:0.5px;">
        Déjà gagné
      </p>
      <p style="margin:0;font-size:28px;font-weight:800;color:#0b5fff;">
        ${fcfaFmt(opts.totalEarned)}
      </p>
      <p style="margin:6px 0 0;font-size:13px;color:#5b6577;">depuis votre inscription</p>
    </div>

    <div style="background:#f8fafc;border:1px dashed #cbd5e1;border-radius:10px;padding:16px 18px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0f1729;">3 actions rapides pour repartir :</p>
      <p style="margin:0;font-size:14px;color:#475569;line-height:1.8;">
        1. Envoyez votre lien à 5 contacts WhatsApp aujourd'hui<br/>
        2. Publiez une story sur votre réseau social avec votre témoignage<br/>
        3. Demandez à votre Coach IA un script de relance personnalisé
      </p>
    </div>

    ${btn("Retourner dans mon espace", `${SITE}/espace`)}

    <p style="margin-top:20px;font-size:13px;color:#94a3b8;">
      Votre code d'affiliation : <strong style="color:#0b5fff;">${opts.code}</strong>
    </p>

    <hr style="margin:32px 0;border:none;border-top:1px solid #e2e8f0;" />
    <p style="margin:0;font-size:12px;color:#94a3b8;">
      Vous recevez cet e-mail car vous n'avez pas été actif récemment.
      Pour modifier vos préférences de notification, rendez-vous dans
      <a href="${SITE}/espace/profil" style="color:#0b5fff;">votre profil</a>.
    </p>
  `);

  return sendEmail({
    to: opts.to,
    subject: `${opts.firstName}, reprenez l'élan — vos commissions vous attendent 🚀`,
    html,
  });
}

// ─── SÉQUENCES MARKETING AUTOMATIQUES ────────────────────────────────────

// Onboarding J0 — Compte approuvé + Guide PDF
export async function sendOnboardingJ0Email(opts: {
  to: string;
  firstName: string;
  code: string;
  lang?: "fr" | "en";
}): Promise<EmailResult> {
  const isFr = opts.lang !== "en";
  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#0f1729;">
      ${isFr ? `🎉 Bienvenue dans IBIG PARTNERS, ${opts.firstName} !` : `🎉 Welcome to IBIG PARTNERS, ${opts.firstName}!`}
    </h2>
    <p style="margin:0 0 20px;color:#5b6577;font-size:15px;line-height:1.6;">
      ${isFr
        ? `Votre compte vient d'être activé. Vous faites maintenant partie du réseau d'affiliation <strong>INTERMARK BUSINESS INTERNATIONAL GROUP</strong> — 11 branches, 330+ produits & services.`
        : `Your account has just been activated. You are now part of the <strong>INTERMARK BUSINESS INTERNATIONAL GROUP</strong> affiliate network — 11 branches, 330+ products & services.`}
    </p>

    <div style="background:linear-gradient(135deg,#0b5fff,#1a3fbf);border-radius:12px;padding:24px 28px;margin-bottom:24px;color:#fff;">
      <p style="margin:0 0 6px;font-size:13px;opacity:0.8;text-transform:uppercase;letter-spacing:0.5px;">
        ${isFr ? "Votre code d'affiliation" : "Your affiliate code"}
      </p>
      <p style="margin:0;font-size:32px;font-weight:900;letter-spacing:3px;">${opts.code}</p>
      <p style="margin:8px 0 0;font-size:13px;opacity:0.8;">
        ${isFr ? "Partagez-le pour parrainer de nouveaux partenaires" : "Share it to sponsor new partners"}
      </p>
    </div>

    <div style="background:#f0fdf4;border-radius:10px;padding:20px 24px;margin-bottom:24px;border:1px solid #bbf7d0;">
      <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#166534;">
        ${isFr ? "📋 Vos 3 premières actions :" : "📋 Your first 3 actions:"}
      </p>
      <p style="margin:0;font-size:14px;color:#166534;line-height:1.9;">
        ${isFr
          ? `1. Téléchargez votre <a href="${SITE}/espace/guide" style="color:#0b5fff;font-weight:700;">Guide Affilié PDF</a> — tout savoir sur les 11 branches<br/>2. Activez vos liens d'affiliation dans <a href="${SITE}/espace/liens" style="color:#0b5fff;font-weight:700;">Mes Liens</a><br/>3. Complétez votre KYC pour recevoir vos premières commissions`
          : `1. Download your <a href="${SITE}/espace/guide" style="color:#0b5fff;font-weight:700;">Affiliate Guide PDF</a> — all about the 11 branches<br/>2. Activate your affiliate links in <a href="${SITE}/espace/liens" style="color:#0b5fff;font-weight:700;">My Links</a><br/>3. Complete your KYC to receive your first commissions`}
      </p>
    </div>

    <div style="text-align:center;margin-bottom:8px;">
      <a href="${SITE}/espace/guide"
        style="display:inline-block;background:#0b5fff;color:#fff;font-weight:700;font-size:15px;
        padding:14px 32px;border-radius:10px;text-decoration:none;margin-right:12px;">
        📄 ${isFr ? "Télécharger le Guide" : "Download the Guide"}
      </a>
      <a href="${SITE}/espace"
        style="display:inline-block;background:#f1f5f9;color:#0b5fff;font-weight:700;font-size:15px;
        padding:14px 32px;border-radius:10px;text-decoration:none;">
        ${isFr ? "Mon espace →" : "My space →"}
      </a>
    </div>

    <hr style="margin:28px 0;border:none;border-top:1px solid #e2e8f0;" />
    <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">
      ${isFr ? "Support WhatsApp : " : "WhatsApp support: "}
      <a href="https://wa.me/2250778882592" style="color:#0b5fff;font-weight:700;">+225 07 78 88 25 92</a>
    </p>
  `);

  return sendEmail({
    to: opts.to,
    subject: isFr
      ? `🎉 Bienvenue chez IBIG PARTNERS — Votre guide & espace sont prêts`
      : `🎉 Welcome to IBIG PARTNERS — Your guide & space are ready`,
    html,
  });
}

// Onboarding J1 — Découvrir les 11 branches
export async function sendOnboardingJ1Email(opts: {
  to: string;
  firstName: string;
  lang?: "fr" | "en";
}): Promise<EmailResult> {
  const isFr = opts.lang !== "en";
  const branches = [
    { icon: "💻", name: "IBIG SOFT", taux: "20%", desc: isFr ? "14 logiciels SaaS pour PME" : "14 SaaS for SMEs" },
    { icon: "🎓", name: "IBIG EDUFORM", taux: "10%", desc: isFr ? "25+ formations certifiantes" : "25+ certified trainings" },
    { icon: "🏡", name: "IBIG IMMO TRUST", taux: "10%", desc: isFr ? "Immobilier sécurisé" : "Secure real estate" },
    { icon: "🛒", name: "IBIG MARKET", taux: "8%", desc: isFr ? "E-commerce & matériel" : "E-commerce & equipment" },
    { icon: "🎨", name: "IBIG DIGITAL", taux: "10%", desc: isFr ? "Sites web & communication" : "Websites & communication" },
    { icon: "🤖", name: "IBIG DIGITAL KITS", taux: "15%", desc: isFr ? "IA, ERP, kits numériques" : "AI, ERP, digital kits" },
    { icon: "📊", name: "IBIG CONSEIL+", taux: "10%", desc: isFr ? "Comptabilité & conseil" : "Accounting & consulting" },
    { icon: "🏦", name: "IBIG FINANCEMENT", taux: "5%", desc: isFr ? "Crédit PME, assurances" : "SME credit, insurance" },
    { icon: "👔", name: "IBIG EMPLOI & TALENTS", taux: "10%", desc: isFr ? "Recrutement & RH" : "Recruitment & HR" },
    { icon: "🌍", name: "IBIG PARTNERS", taux: "Variable", desc: isFr ? "Programme d'affiliation" : "Affiliate program" },
    { icon: "🔧", name: "IBIG MULTISERVICES", taux: "10%", desc: isFr ? "55 services événements/logistique" : "55 services events/logistics" },
  ];

  const rows = branches.map(b => `
    <tr>
      <td style="padding:10px 8px;font-size:20px;text-align:center;">${b.icon}</td>
      <td style="padding:10px 8px;font-size:14px;font-weight:700;color:#0f1729;">${b.name}</td>
      <td style="padding:10px 8px;font-size:13px;color:#5b6577;">${b.desc}</td>
      <td style="padding:10px 8px;font-size:14px;font-weight:800;color:#0b5fff;text-align:right;">${b.taux} N1</td>
    </tr>
  `).join("");

  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#0f1729;">
      ${isFr ? `${opts.firstName}, voici vos 11 sources de revenus 💰` : `${opts.firstName}, here are your 11 revenue streams 💰`}
    </h2>
    <p style="margin:0 0 20px;color:#5b6577;font-size:15px;line-height:1.6;">
      ${isFr
        ? "Chaque branche est une opportunité de commission. Voici un aperçu rapide des 11 branches du groupe IBIG."
        : "Each branch is a commission opportunity. Here is a quick overview of IBIG's 11 branches."}
    </p>

    <div style="background:#f8fafc;border-radius:12px;overflow:hidden;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <thead>
          <tr style="background:#0b5fff;">
            <th style="padding:10px 8px;color:#fff;font-size:12px;"></th>
            <th style="padding:10px 8px;color:#fff;font-size:12px;text-align:left;">${isFr ? "Branche" : "Branch"}</th>
            <th style="padding:10px 8px;color:#fff;font-size:12px;text-align:left;">${isFr ? "Spécialité" : "Specialty"}</th>
            <th style="padding:10px 8px;color:#fff;font-size:12px;text-align:right;">${isFr ? "Taux N1" : "Rate N1"}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <div style="background:#fffbeb;border-radius:10px;padding:16px 18px;margin-bottom:24px;border:1px solid #fde68a;">
      <p style="margin:0;font-size:14px;color:#92400e;line-height:1.7;">
        💡 ${isFr
          ? "<strong>Conseil :</strong> Commencez par IBIG SOFT ou IBIG EDUFORM — ce sont les produits les plus faciles à vendre et qui génèrent les commissions les plus élevées."
          : "<strong>Tip:</strong> Start with IBIG SOFT or IBIG EDUFORM — these are the easiest products to sell and generate the highest commissions."}
      </p>
    </div>

    ${btn(isFr ? "Activer mes liens d'affiliation →" : "Activate my affiliate links →", `${SITE}/espace/liens`)}
  `);

  return sendEmail({
    to: opts.to,
    subject: isFr
      ? `Jour 1 — Vos 11 branches IBIG et comment en tirer profit`
      : `Day 1 — Your 11 IBIG branches and how to profit`,
    html,
  });
}

// Onboarding J3 — Guide pratique de prospection
export async function sendOnboardingJ3Email(opts: {
  to: string;
  firstName: string;
  code: string;
  lang?: "fr" | "en";
}): Promise<EmailResult> {
  const isFr = opts.lang !== "en";
  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#0f1729;">
      ${isFr ? `${opts.firstName}, votre script de prospection WhatsApp 📱` : `${opts.firstName}, your WhatsApp prospecting script 📱`}
    </h2>
    <p style="margin:0 0 20px;color:#5b6577;font-size:15px;line-height:1.6;">
      ${isFr
        ? "WhatsApp est votre outil numéro 1. Voici un script qui fonctionne. Copiez-le et adaptez-le."
        : "WhatsApp is your #1 tool. Here's a script that works. Copy it and adapt it."}
    </p>

    <div style="background:#f0f4ff;border-radius:12px;padding:20px 24px;margin-bottom:24px;border-left:4px solid #0b5fff;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#0b5fff;text-transform:uppercase;letter-spacing:0.5px;">
        ${isFr ? "Script WhatsApp — Logiciels (IBIG SOFT)" : "WhatsApp Script — Software (IBIG SOFT)"}
      </p>
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.8;font-style:italic;">
        ${isFr
          ? `"Bonjour [Prénom], je travaille avec une entreprise ivoirienne qui propose des logiciels pour les PME. Ils ont un logiciel de gestion pour les [votre secteur] qui marche vraiment bien. Ça t'intéresse que je te montre une démo ?" 🚀`
          : `"Hello [Name], I work with an Ivorian company that offers software for SMEs. They have management software for [your sector] that works really well. Would you like me to show you a demo?" 🚀`}
      </p>
    </div>

    <div style="background:#f0fdf4;border-radius:12px;padding:20px 24px;margin-bottom:24px;border-left:4px solid #16a34a;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:0.5px;">
        ${isFr ? "Script WhatsApp — Formations (IBIG EDUFORM)" : "WhatsApp Script — Training (IBIG EDUFORM)"}
      </p>
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.8;font-style:italic;">
        ${isFr
          ? `"Salut [Prénom], est-ce que tu connais IBIG EDUFORM ? Ce sont des formations certifiantes pour les professionnels en Côte d'Ivoire — Sage, SAP, comptabilité, RH... Avec mon code j'ai une remise pour toi si tu t'inscris cette semaine." 🎓`
          : `"Hi [Name], do you know IBIG EDUFORM? They offer certified training for professionals in Côte d'Ivoire — Sage, SAP, accounting, HR... With my code I have a discount for you if you register this week." 🎓`}
      </p>
    </div>

    <div style="background:#f8fafc;border-radius:10px;padding:16px 18px;margin-bottom:24px;border:1px solid #e2e8f0;">
      <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#0f1729;">
        ${isFr ? "💡 3 règles d'or :" : "💡 3 golden rules:"}
      </p>
      <p style="margin:0;font-size:14px;color:#475569;line-height:1.9;">
        ${isFr
          ? "1. <strong>Personnalisez</strong> — citez toujours le prénom et le secteur de la personne<br/>2. <strong>Posez des questions</strong> — ne vendez pas, qualifiez d'abord<br/>3. <strong>Suivez</strong> — 80% des ventes se font après le 3e contact"
          : "1. <strong>Personalize</strong> — always mention the person's name and sector<br/>2. <strong>Ask questions</strong> — don't sell, qualify first<br/>3. <strong>Follow up</strong> — 80% of sales happen after the 3rd contact"}
      </p>
    </div>

    <p style="margin:0 0 16px;font-size:14px;color:#5b6577;">
      ${isFr
        ? `Votre lien d'affiliation contient votre code <strong style="color:#0b5fff;">${opts.code}</strong>. Copiez-le depuis votre espace.`
        : `Your affiliate link contains your code <strong style="color:#0b5fff;">${opts.code}</strong>. Copy it from your space.`}
    </p>

    ${btn(isFr ? "Copier mes liens d'affiliation →" : "Copy my affiliate links →", `${SITE}/espace/liens`)}

    <hr style="margin:28px 0;border:none;border-top:1px solid #e2e8f0;" />
    <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">
      ${isFr ? "Support WhatsApp : " : "WhatsApp support: "}
      <a href="https://wa.me/2250778882592" style="color:#0b5fff;font-weight:700;">+225 07 78 88 25 92</a>
    </p>
  `);

  return sendEmail({
    to: opts.to,
    subject: isFr
      ? `Jour 3 — Votre script WhatsApp pour vendre IBIG 📱`
      : `Day 3 — Your WhatsApp script to sell IBIG 📱`,
    html,
  });
}

// Onboarding J7 — Récap + encouragement si pas encore de vente
export async function sendOnboardingJ7Email(opts: {
  to: string;
  firstName: string;
  hasSale: boolean;
  lang?: "fr" | "en";
}): Promise<EmailResult> {
  const isFr = opts.lang !== "en";
  const html = layout(opts.hasSale ? `
    <h2 style="margin:0 0 8px;font-size:24px;color:#0f1729;">
      ${isFr ? `🏆 ${opts.firstName}, vous êtes dans le top 20% !` : `🏆 ${opts.firstName}, you're in the top 20%!`}
    </h2>
    <p style="margin:0 0 20px;color:#5b6577;font-size:15px;line-height:1.6;">
      ${isFr
        ? "Vous avez réalisé votre première vente en moins d'une semaine. C'est exceptionnel — seulement 1 affilié sur 5 y parvient. Passez à la vitesse supérieure : recrutez votre premier filleul pour multiplier vos revenus."
        : "You made your first sale in less than a week. That's exceptional — only 1 in 5 affiliates achieve this. Step it up: recruit your first referral to multiply your income."}
    </p>
    <div style="background:#f0fdf4;border-radius:10px;padding:20px 24px;margin-bottom:24px;border:1px solid #bbf7d0;">
      <p style="margin:0;font-size:14px;color:#166534;line-height:1.8;">
        ${isFr
          ? "✓ Découvrez la section <strong>Réseau</strong> pour parrainer vos contacts<br/>✓ Accédez au <strong>Kit Marketing</strong> pour de nouveaux argumentaires<br/>✓ Consultez votre <strong>Coach IA</strong> pour booster votre stratégie"
          : "✓ Explore the <strong>Network</strong> section to sponsor your contacts<br/>✓ Access the <strong>Marketing Kit</strong> for new arguments<br/>✓ Consult your <strong>AI Coach</strong> to boost your strategy"}
      </p>
    </div>
    ${btn(isFr ? "Recruter mon premier filleul →" : "Recruit my first referral →", `${SITE}/espace/reseau`)}
  ` : `
    <h2 style="margin:0 0 8px;font-size:24px;color:#0f1729;">
      ${isFr ? `${opts.firstName}, votre première vente est à portée 🎯` : `${opts.firstName}, your first sale is within reach 🎯`}
    </h2>
    <p style="margin:0 0 20px;color:#5b6577;font-size:15px;line-height:1.6;">
      ${isFr
        ? "Vous avez maintenant tout ce qu'il faut. Il ne manque qu'un passage à l'action. Voici le plan le plus simple pour décrocher votre première commission aujourd'hui."
        : "You now have everything you need. All that's missing is action. Here's the simplest plan to get your first commission today."}
    </p>
    <div style="background:#f0f4ff;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#1e40af;line-height:1.9;">
        ${isFr
          ? "<strong>Plan 10 minutes :</strong><br/>1. Allez dans <a href=\"${SITE}/espace/liens\" style=\"color:#0b5fff;\">Mes Liens</a> → activez Scolaby ou GESCOMXEL<br/>2. Copiez votre lien<br/>3. Envoyez-le à 3 contacts qui ont un business, une école ou un commerce<br/>4. Message : <em>« J'ai un logiciel qui peut t'aider à gérer [son activité]. Tu veux que je t'envoie le lien ? »</em>"
          : "<strong>10-minute plan:</strong><br/>1. Go to <a href=\"${SITE}/espace/liens\" style=\"color:#0b5fff;\">My Links</a> → activate Scolaby or GESCOMXEL<br/>2. Copy your link<br/>3. Send it to 3 contacts who have a business, school or shop<br/>4. Message: <em>\"I have software that can help you manage [their activity]. Want me to send you the link?\"</em>"}
      </p>
    </div>
    <div style="background:#fffbeb;border-radius:10px;padding:16px 18px;margin-bottom:24px;border:1px solid #fde68a;">
      <p style="margin:0;font-size:14px;color:#92400e;">
        💡 ${isFr
          ? "Besoin d'aide ? Votre <strong>Coach IA</strong> peut générer un script personnalisé pour n'importe quel produit IBIG en 30 secondes."
          : "Need help? Your <strong>AI Coach</strong> can generate a personalized script for any IBIG product in 30 seconds."}
      </p>
    </div>
    ${btn(isFr ? "Activer mes liens maintenant →" : "Activate my links now →", `${SITE}/espace/liens`)}

    <hr style="margin:28px 0;border:none;border-top:1px solid #e2e8f0;" />
    <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">
      ${isFr ? "Support WhatsApp : " : "WhatsApp support: "}
      <a href="https://wa.me/2250778882592" style="color:#0b5fff;font-weight:700;">+225 07 78 88 25 92</a>
    </p>
  `);

  return sendEmail({
    to: opts.to,
    subject: opts.hasSale
      ? (isFr ? `🏆 ${opts.firstName}, vous êtes dans le top 20% — passez à la vitesse sup` : `🏆 ${opts.firstName}, you're top 20% — level up`)
      : (isFr ? `Semaine 1 — Votre plan 10 min pour décrocher votre 1ère vente` : `Week 1 — Your 10-min plan for your 1st sale`),
    html,
  });
}

// Activation J14 — Affilié sans vente depuis 14 jours
export async function sendActivationJ14Email(opts: {
  to: string;
  firstName: string;
  code: string;
  lang?: "fr" | "en";
}): Promise<EmailResult> {
  const isFr = opts.lang !== "en";
  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#0f1729;">
      ${isFr ? `${opts.firstName}, voici ce que font les affiliés qui réussissent 🚀` : `${opts.firstName}, here's what successful affiliates do 🚀`}
    </h2>
    <p style="margin:0 0 20px;color:#5b6577;font-size:15px;line-height:1.6;">
      ${isFr
        ? "Deux semaines sans vente, c'est souvent un problème de méthode, pas de motivation. Voici ce qui distingue les affiliés actifs des autres."
        : "Two weeks without a sale is often a method problem, not a motivation one. Here's what separates active affiliates from others."}
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${[
        { icon: "🎯", title: isFr ? "Ils ciblent un type de client précis" : "They target a specific customer type", desc: isFr ? "Pas tout le monde — les commerçants, ou les écoles, ou les PME. Un seul segment par semaine." : "Not everyone — merchants, or schools, or SMEs. One segment per week." },
        { icon: "📱", title: isFr ? "Ils utilisent leur Kit Marketing" : "They use their Marketing Kit", desc: isFr ? "Les argumentaires prêts à l'emploi dans votre espace sont rédigés pour convaincre." : "The ready-to-use arguments in your space are written to convince." },
        { icon: "🤖", title: isFr ? "Ils demandent au Coach IA" : "They ask the AI Coach", desc: isFr ? "Le Coach IA génère des scripts personnalisés pour chaque produit et chaque type de client." : "The AI Coach generates personalized scripts for each product and customer type." },
      ].map(item => `
        <tr>
          <td style="padding:12px 0;vertical-align:top;width:40px;font-size:24px;">${item.icon}</td>
          <td style="padding:12px 0 12px 12px;border-bottom:1px solid #f1f5f9;">
            <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#0f1729;">${item.title}</p>
            <p style="margin:0;font-size:13px;color:#5b6577;">${item.desc}</p>
          </td>
        </tr>
      `).join("")}
    </table>

    <div style="text-align:center;">
      <a href="${SITE}/espace/kit"
        style="display:inline-block;background:#0b5fff;color:#fff;font-weight:700;font-size:15px;
        padding:14px 28px;border-radius:10px;text-decoration:none;margin-right:10px;margin-bottom:10px;">
        🎨 ${isFr ? "Kit Marketing" : "Marketing Kit"}
      </a>
      <a href="${SITE}/espace/coach"
        style="display:inline-block;background:#f0f4ff;color:#0b5fff;font-weight:700;font-size:15px;
        padding:14px 28px;border-radius:10px;text-decoration:none;margin-bottom:10px;">
        🤖 ${isFr ? "Coach IA" : "AI Coach"}
      </a>
    </div>

    <hr style="margin:28px 0;border:none;border-top:1px solid #e2e8f0;" />
    <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">
      ${isFr ? "Support WhatsApp : " : "WhatsApp support: "}
      <a href="https://wa.me/2250778882592" style="color:#0b5fff;font-weight:700;">+225 07 78 88 25 92</a>
    </p>
  `);

  return sendEmail({
    to: opts.to,
    subject: isFr
      ? `J14 — Ce que font les affiliés qui décrochent leur 1ère vente`
      : `Day 14 — What affiliates do to get their 1st sale`,
    html,
  });
}

// Activation J21 — Dernière chance avant inactivité
export async function sendActivationJ21Email(opts: {
  to: string;
  firstName: string;
  lang?: "fr" | "en";
}): Promise<EmailResult> {
  const isFr = opts.lang !== "en";
  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#0f1729;">
      ${isFr ? `${opts.firstName}, un affilié vous a choisi comme filleul 👥` : `${opts.firstName}, an affiliate has chosen you as a referral 👥`}
    </h2>
    <p style="margin:0 0 20px;color:#5b6577;font-size:15px;line-height:1.6;">
      ${isFr
        ? "Quelqu'un vous a parrainé dans IBIG PARTNERS parce qu'il/elle croit en vous. Il/elle gagnera une commission sur chacune de vos ventes — et vous aussi. C'est une relation gagnant-gagnant."
        : "Someone sponsored you into IBIG PARTNERS because they believe in you. They will earn a commission on each of your sales — and so will you. It's a win-win relationship."}
    </p>

    <div style="background:#f0f4ff;border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 8px;font-size:14px;color:#3b5bdb;">
        ${isFr ? "Si vous réalisez une vente de <strong>50 000 FCFA</strong> :" : "If you make a sale of <strong>50,000 FCFA</strong>:"}
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
        <tr>
          <td style="text-align:center;padding:8px;">
            <p style="margin:0;font-size:22px;font-weight:900;color:#0b5fff;">5 000 FCFA</p>
            <p style="margin:4px 0 0;font-size:12px;color:#5b6577;">${isFr ? "Votre commission N1 (10%)" : "Your N1 commission (10%)"}</p>
          </td>
          <td style="text-align:center;padding:8px;color:#94a3b8;font-size:20px;">+</td>
          <td style="text-align:center;padding:8px;">
            <p style="margin:0;font-size:22px;font-weight:900;color:#7c3aed;">2 500 FCFA</p>
            <p style="margin:4px 0 0;font-size:12px;color:#5b6577;">${isFr ? "Commission de votre parrain N2" : "Your sponsor's N2 commission"}</p>
          </td>
        </tr>
      </table>
    </div>

    <p style="margin:0 0 20px;color:#5b6577;font-size:15px;line-height:1.6;">
      ${isFr
        ? "Faites votre première vente cette semaine. 10 minutes suffisent — votre Kit Marketing et votre Coach IA sont là pour vous."
        : "Make your first sale this week. 10 minutes is enough — your Marketing Kit and AI Coach are there for you."}
    </p>

    ${btn(isFr ? "Je passe à l'action maintenant →" : "I take action now →", `${SITE}/espace`)}

    <hr style="margin:28px 0;border:none;border-top:1px solid #e2e8f0;" />
    <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">
      ${isFr ? "Support WhatsApp : " : "WhatsApp support: "}
      <a href="https://wa.me/2250778882592" style="color:#0b5fff;font-weight:700;">+225 07 78 88 25 92</a>
    </p>
  `);

  return sendEmail({
    to: opts.to,
    subject: isFr
      ? `J21 — Votre parrain vous attend. Faites votre 1ère vente cette semaine.`
      : `Day 21 — Your sponsor is waiting. Make your 1st sale this week.`,
    html,
  });
}

// Réengagement J45 — Inactif depuis 45 jours
export async function sendReengageJ45Email(opts: {
  to: string;
  firstName: string;
  totalEarned: number;
  lang?: "fr" | "en";
}): Promise<EmailResult> {
  const isFr = opts.lang !== "en";
  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#0f1729;">
      ${isFr ? `${opts.firstName}, IBIG a lancé 2 nouvelles branches 🚀` : `${opts.firstName}, IBIG launched 2 new branches 🚀`}
    </h2>
    <p style="margin:0 0 20px;color:#5b6577;font-size:15px;line-height:1.6;">
      ${isFr
        ? "Depuis votre dernière connexion, le groupe IBIG a lancé IBIG FINANCEMENT et IBIG EMPLOI & TALENTS. Ce sont des marchés porteurs avec de vraies opportunités."
        : "Since your last login, the IBIG group has launched IBIG FINANCEMENT and IBIG EMPLOI & TALENTS. These are promising markets with real opportunities."}
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:0 8px 0 0;width:50%;vertical-align:top;">
          <div style="background:#eff6ff;border-radius:12px;padding:20px;border:1px solid #bfdbfe;height:100%;">
            <p style="margin:0 0 4px;font-size:20px;">🏦</p>
            <p style="margin:0 0 6px;font-size:14px;font-weight:800;color:#1e40af;">IBIG FINANCEMENT</p>
            <p style="margin:0 0 8px;font-size:13px;color:#3b82f6;">5% N1 · 2,5% N2 · 1% N3</p>
            <p style="margin:0;font-size:13px;color:#5b6577;">
              ${isFr ? "Crédit PME, leasing, assurances, épargne retraite, levée de fonds." : "SME credit, leasing, insurance, retirement savings, fundraising."}
            </p>
          </div>
        </td>
        <td style="padding:0 0 0 8px;width:50%;vertical-align:top;">
          <div style="background:#f0fdf4;border-radius:12px;padding:20px;border:1px solid #bbf7d0;height:100%;">
            <p style="margin:0 0 4px;font-size:20px;">👔</p>
            <p style="margin:0 0 6px;font-size:14px;font-weight:800;color:#166534;">IBIG EMPLOI & TALENTS</p>
            <p style="margin:0 0 8px;font-size:13px;color:#16a34a;">10% N1 · 5% N2 · 2% N3</p>
            <p style="margin:0;font-size:13px;color:#5b6577;">
              ${isFr ? "Recrutement CDI/CDD, externalisation RH, coaching dirigeants, GPEC." : "CDI/CDD recruitment, HR outsourcing, executive coaching, GPEC."}
            </p>
          </div>
        </td>
      </tr>
    </table>

    ${opts.totalEarned > 0 ? `
    <div style="background:#f0f4ff;border-radius:10px;padding:16px 18px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;color:#3b5bdb;">${isFr ? "Vous avez déjà gagné" : "You've already earned"}</p>
      <p style="margin:0;font-size:28px;font-weight:900;color:#0b5fff;">${fcfaFmt(opts.totalEarned)}</p>
      <p style="margin:4px 0 0;font-size:13px;color:#5b6577;">${isFr ? "depuis votre inscription — il y en a plus à venir." : "since joining — there's more to come."}</p>
    </div>
    ` : ""}

    ${btn(isFr ? "Reprendre mes activités →" : "Resume my activities →", `${SITE}/espace`)}

    <hr style="margin:28px 0;border:none;border-top:1px solid #e2e8f0;" />
    <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">
      ${isFr ? "Support WhatsApp : " : "WhatsApp support: "}
      <a href="https://wa.me/2250778882592" style="color:#0b5fff;font-weight:700;">+225 07 78 88 25 92</a>
    </p>
  `);

  return sendEmail({
    to: opts.to,
    subject: isFr
      ? `${opts.firstName}, 2 nouvelles branches IBIG — nouvelles commissions pour vous`
      : `${opts.firstName}, 2 new IBIG branches — new commissions for you`,
    html,
  });
}

// Réengagement J60 — Dernier email avant abandon
export async function sendReengageJ60Email(opts: {
  to: string;
  firstName: string;
  lang?: "fr" | "en";
}): Promise<EmailResult> {
  const isFr = opts.lang !== "en";
  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#0f1729;">
      ${isFr ? `${opts.firstName}, on vous garde une place 🤝` : `${opts.firstName}, we're keeping your spot 🤝`}
    </h2>
    <p style="margin:0 0 20px;color:#5b6577;font-size:15px;line-height:1.6;">
      ${isFr
        ? "Votre compte est toujours actif. Quand vous serez prêt(e), votre espace partenaire sera là, avec tous vos outils, votre réseau et vos commissions en attente."
        : "Your account is still active. When you're ready, your partner space will be there, with all your tools, your network and your pending commissions."}
    </p>

    <div style="background:#f8fafc;border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid #e2e8f0;text-align:center;">
      <p style="margin:0 0 16px;font-size:14px;color:#5b6577;">
        ${isFr ? "Une seule chose à faire pour reprendre :" : "Just one thing to do to resume:"}
      </p>
      <a href="${SITE}/espace/coach"
        style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#0b5fff);color:#fff;font-weight:700;
        font-size:15px;padding:16px 36px;border-radius:12px;text-decoration:none;">
        🤖 ${isFr ? "Demander au Coach IA comment reprendre" : "Ask the AI Coach how to resume"}
      </a>
      <p style="margin:12px 0 0;font-size:13px;color:#94a3b8;">
        ${isFr ? "Il vous donnera un plan personnalisé en 30 secondes." : "It will give you a personalized plan in 30 seconds."}
      </p>
    </div>

    <p style="margin:0;font-size:14px;color:#5b6577;line-height:1.6;text-align:center;">
      ${isFr
        ? "Des questions ? Notre équipe est disponible sur WhatsApp."
        : "Questions? Our team is available on WhatsApp."}
      <br/>
      <a href="https://wa.me/2250778882592" style="color:#0b5fff;font-weight:700;">+225 07 78 88 25 92</a>
    </p>
  `);

  return sendEmail({
    to: opts.to,
    subject: isFr
      ? `${opts.firstName}, votre espace IBIG vous attend — reprenez quand vous voulez`
      : `${opts.firstName}, your IBIG space awaits — resume whenever you want`,
    html,
  });
}

// Montée de statut — Félicitations
export async function sendStatusUpEmail(opts: {
  to: string;
  firstName: string;
  newStatus: string;
  commissionsAmount: number;
  lang?: "fr" | "en";
}): Promise<EmailResult> {
  const isFr = opts.lang !== "en";
  const STATUS_ICONS: Record<string, string> = {
    SILVER: "🥈", GOLD: "🥇", MASTER: "💎", ELITE: "👑",
  };
  const STATUS_LABELS_FR: Record<string, string> = {
    SILVER: "Silver", GOLD: "Gold", MASTER: "Master", ELITE: "Elite",
  };
  const STATUS_PERKS_FR: Record<string, string> = {
    SILVER: "Accès aux modules Académie avancés + bonus commissions",
    GOLD: "Chat IBIG Gold + missions partenaires exclusives + bonus 5%",
    MASTER: "Accès prioritaire aux nouvelles offres + bonus 10% + support dédié",
    ELITE: "Partenariat stratégique IBIG + revenus résiduels prioritaires + accès VIP",
  };
  const STATUS_PERKS_EN: Record<string, string> = {
    SILVER: "Access to advanced Academy modules + commission bonuses",
    GOLD: "IBIG Gold Chat + exclusive partner missions + 5% bonus",
    MASTER: "Priority access to new offers + 10% bonus + dedicated support",
    ELITE: "IBIG strategic partnership + priority residual income + VIP access",
  };

  const icon = STATUS_ICONS[opts.newStatus] ?? "⭐";
  const label = STATUS_LABELS_FR[opts.newStatus] ?? opts.newStatus;
  const perks = isFr ? (STATUS_PERKS_FR[opts.newStatus] ?? "") : (STATUS_PERKS_EN[opts.newStatus] ?? "");

  const html = layout(`
    <div style="text-align:center;margin-bottom:24px;">
      <p style="font-size:64px;margin:0;">${icon}</p>
      <h2 style="margin:8px 0;font-size:26px;color:#0f1729;">
        ${isFr ? `Félicitations ${opts.firstName} !` : `Congratulations ${opts.firstName}!`}
      </h2>
      <p style="margin:0;font-size:17px;color:#5b6577;">
        ${isFr ? `Vous avez atteint le statut` : `You have reached`}
        <strong style="color:#0b5fff;font-size:20px;"> ${label}</strong>
      </p>
    </div>

    ${opts.commissionsAmount > 0 ? `
    <div style="background:#fffbeb;border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid #fde68a;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">
        ${isFr ? "Commissions gagnées" : "Commissions earned"}
      </p>
      <p style="margin:0;font-size:32px;font-weight:900;color:#b45309;">${fcfaFmt(opts.commissionsAmount)}</p>
    </div>
    ` : ""}

    <div style="background:#f0f4ff;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#3b5bdb;text-transform:uppercase;letter-spacing:0.5px;">
        ${isFr ? `Avantages ${label}` : `${label} benefits`}
      </p>
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">${perks}</p>
    </div>

    ${btn(isFr ? "Découvrir mes nouveaux avantages →" : "Discover my new benefits →", `${SITE}/espace`)}

    <hr style="margin:28px 0;border:none;border-top:1px solid #e2e8f0;" />
    <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">
      ${isFr ? "Support WhatsApp : " : "WhatsApp support: "}
      <a href="https://wa.me/2250778882592" style="color:#0b5fff;font-weight:700;">+225 07 78 88 25 92</a>
    </p>
  `);

  return sendEmail({
    to: opts.to,
    subject: isFr
      ? `${icon} ${opts.firstName}, vous êtes maintenant ${label} chez IBIG PARTNERS !`
      : `${icon} ${opts.firstName}, you are now ${label} at IBIG PARTNERS!`,
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

// ─── E-mail : Message sur une opportunité ────────────────────────────────────
export async function sendOpportunityMessageEmail(opts: {
  to: string;
  firstName: string;
  opportunityTitle: string;
  senderName: string;
  body: string;
  fromAdmin: boolean;
}): Promise<EmailResult> {
  const direction = opts.fromAdmin
    ? `L'équipe IBIG Partners vous a envoyé un message concernant votre opportunité.`
    : `Un de vos partenaires vous a répondu concernant une opportunité.`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:32px 0">
      <div style="background:#0b5fff;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;font-size:18px;margin:0">💬 Nouveau message — Opportunité</h1>
      </div>
      <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
        <p style="color:#374151;margin:0 0 8px">Bonjour <strong>${opts.firstName}</strong>,</p>
        <p style="color:#6b7280;margin:0 0 24px;font-size:14px">${direction}</p>

        <div style="background:#f1f5f9;border-left:4px solid #0b5fff;border-radius:8px;padding:16px 20px;margin-bottom:24px">
          <p style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px">Opportunité</p>
          <p style="color:#1e293b;font-weight:700;font-size:15px;margin:0">${opts.opportunityTitle}</p>
        </div>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;margin-bottom:24px">
          <p style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px">Message de ${opts.senderName}</p>
          <p style="color:#334155;font-size:15px;line-height:1.6;margin:0;white-space:pre-line">${opts.body}</p>
        </div>

        <a href="${SITE}/espace/opportunites" style="display:inline-block;background:#0b5fff;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px">
          Voir et répondre dans mon espace →
        </a>

        <p style="color:#9ca3af;font-size:12px;margin-top:32px;border-top:1px solid #f1f5f9;padding-top:16px">
          IBIG PARTNERS · Ce message concerne une opportunité B2B soumise via votre espace partenaire.
        </p>
      </div>
    </div>`;

  return sendEmail({
    to: opts.to,
    subject: `💬 Message IBIG : ${opts.opportunityTitle}`,
    html,
  });
}

// ─── E-mail : Changement de statut d'une opportunité ────────────────────────
export async function sendOpportunityStatusEmail(opts: {
  to: string;
  firstName: string;
  opportunityTitle: string;
  newStatus: string;
}): Promise<EmailResult> {
  const STATUS_LABELS: Record<string, string> = {
    NEW: "Nouveau",
    IN_PROGRESS: "En cours de traitement ⚙️",
    WON: "Gagné — Félicitations ! 🎉",
    LOST: "Non retenu",
  };
  const label = STATUS_LABELS[opts.newStatus] ?? opts.newStatus;
  const isWon = opts.newStatus === "WON";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:32px 0">
      <div style="background:${isWon ? "#059669" : "#0b5fff"};padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;font-size:18px;margin:0">${isWon ? "🏆" : "📋"} Mise à jour de votre opportunité</h1>
      </div>
      <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
        <p style="color:#374151;margin:0 0 8px">Bonjour <strong>${opts.firstName}</strong>,</p>
        <p style="color:#6b7280;font-size:14px;margin:0 0 24px">
          Le statut de votre opportunité <strong>${opts.opportunityTitle}</strong> vient d'être mis à jour.
        </p>
        <div style="background:${isWon ? "#f0fdf4" : "#f1f5f9"};border:1px solid ${isWon ? "#bbf7d0" : "#e2e8f0"};border-radius:8px;padding:16px 20px;margin-bottom:24px;text-align:center">
          <p style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;margin:0 0 4px">Nouveau statut</p>
          <p style="color:${isWon ? "#059669" : "#0b5fff"};font-size:20px;font-weight:800;margin:0">${label}</p>
        </div>
        ${isWon ? `<p style="color:#065f46;background:#d1fae5;border-radius:8px;padding:12px 16px;font-size:14px">🎉 Félicitations ! Votre commission sera calculée et créditée une fois la vente officiellement enregistrée.</p>` : ""}
        <a href="${SITE}/espace/opportunites" style="display:inline-block;background:#0b5fff;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px">
          Voir mon opportunité →
        </a>
      </div>
    </div>`;

  return sendEmail({
    to: opts.to,
    subject: `📋 Opportunité mise à jour : ${opts.opportunityTitle}`,
    html,
  });
}

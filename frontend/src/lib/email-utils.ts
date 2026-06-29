/**
 * Utilitaire d'envoi d'email bas niveau — utilisé par les actions
 * qui ont besoin d'envoyer des emails libres (tickets, etc.)
 */
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "IBIG PARTNERS <noreply@ibigpartners.com>";

export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  if (!resend) {
    console.log(`[EMAIL DEV] To: ${opts.to} | Subject: ${opts.subject}`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, ...opts });
  } catch (err) {
    console.error("[EMAIL ERROR]", err);
  }
}

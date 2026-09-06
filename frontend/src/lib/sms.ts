const SID  = process.env.TWILIO_ACCOUNT_SID;
const AUTH = process.env.TWILIO_AUTH_TOKEN;
const FROM = process.env.TWILIO_FROM; // ex: +225XXXXXXXXXX ou un SenderID alphanumérique

export async function sendSms(to: string, body: string): Promise<void> {
  if (!SID || !AUTH || !FROM) return; // SMS désactivé si vars absentes

  const phone = to.startsWith("+") ? to : `+225${to.replace(/\D/g, "")}`;

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${SID}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${SID}:${AUTH}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: phone, From: FROM, Body: body }).toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[SMS ERROR]", err);
  }
}

export async function notifySaleConfirmed(phone: string, partnerName: string, productName: string, commission: number) {
  await sendSms(phone, `🎉 IBIG PARTNERS\nBravo ${partnerName} ! Votre vente de "${productName}" est confirmée.\nCommission : ${commission.toLocaleString("fr-FR")} FCFA ajoutée à votre compte.`);
}

export async function notifyPayoutSent(phone: string, partnerName: string, amount: number) {
  await sendSms(phone, `💸 IBIG PARTNERS\nBonjour ${partnerName} ! Votre paiement de ${amount.toLocaleString("fr-FR")} FCFA vient d'être effectué. Vérifiez votre compte mobile money.`);
}

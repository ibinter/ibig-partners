// SMS via Africa's Talking — couvre CI, SN, CM, BF, ML, GN, TG, BJ, etc.
// Env: AFRICASTALKING_USERNAME, AFRICASTALKING_API_KEY, AFRICASTALKING_SENDER_ID (optionnel)

const AT_BASE = "https://api.africastalking.com/version1/messaging";

export async function sendSms(to: string, message: string): Promise<boolean> {
  const username = process.env.AFRICASTALKING_USERNAME;
  const apiKey   = process.env.AFRICASTALKING_API_KEY;

  if (!username || !apiKey) {
    console.warn("[SMS] AFRICASTALKING_USERNAME ou AFRICASTALKING_API_KEY manquant");
    return false;
  }

  // Normalise le numéro : ajoute le préfixe pays si absent
  const phone = normalizePhone(to);

  try {
    const body = new URLSearchParams({
      username,
      to: phone,
      message,
      ...(process.env.AFRICASTALKING_SENDER_ID ? { from: process.env.AFRICASTALKING_SENDER_ID } : {}),
    });

    const res = await fetch(AT_BASE, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "apiKey": apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const data = await res.json();
    const status = data?.SMSMessageData?.Recipients?.[0]?.status;
    return status === "Success";
  } catch (err) {
    console.error("[SMS] Erreur envoi:", err);
    return false;
  }
}

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, "").replace(/[^+\d]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  // Côte d'Ivoire par défaut si pas de préfixe international
  if (cleaned.startsWith("0")) return "+225" + cleaned.slice(1);
  if (cleaned.length === 8) return "+225" + cleaned; // ancien format CI
  if (cleaned.length === 10 && cleaned.startsWith("07")) return "+225" + cleaned; // nouveau format CI
  return "+" + cleaned;
}

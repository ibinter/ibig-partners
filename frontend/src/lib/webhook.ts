import crypto from "crypto";

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

// Envoie un webhook signé vers l'URL configurée par le partenaire.
// Signature : HMAC-SHA256 du corps JSON avec le secret du partenaire.
export async function sendWebhook(
  url: string,
  secret: string | null,
  payload: WebhookPayload,
  timeoutMs = 8000,
): Promise<boolean> {
  try {
    const body = JSON.stringify(payload);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "IBIG-Partners-Webhook/1.0",
      "X-IBIG-Event": payload.event,
      "X-IBIG-Timestamp": payload.timestamp,
    };

    if (secret) {
      const sig = crypto.createHmac("sha256", secret).update(body).digest("hex");
      headers["X-IBIG-Signature"] = `sha256=${sig}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
    });
    clearTimeout(timer);

    return res.ok;
  } catch {
    return false;
  }
}

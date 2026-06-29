/**
 * Initiation d'un paiement Moneroo.
 * Moneroo agrège Orange Money CI, Wave, MTN MoMo, Moov Money, etc.
 * Appelée par le bouton "Payer" sur une page produit publique.
 * Retourne l'URL de paiement Moneroo à laquelle rediriger le client.
 */

import { NextRequest, NextResponse } from "next/server";

const MONEROO_API = "https://api.moneroo.io/v1/payments/initialize";

export async function POST(req: NextRequest) {
  const { productSlug, partnerCode, amount, customerFirstName, customerLastName, customerEmail, customerPhone } =
    await req.json();

  const secretKey = process.env.MONEROO_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (!secretKey) {
    return NextResponse.json(
      { error: "Moneroo non configuré (MONEROO_SECRET_KEY manquant)" },
      { status: 503 }
    );
  }

  const res = await fetch(MONEROO_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${secretKey}`,
    },
    body: JSON.stringify({
      amount: Math.round(amount),
      currency: "XOF",
      description: `Achat via IBIG PARTNERS — Partenaire ${partnerCode}`,
      customer: {
        email: customerEmail ?? "client@ibigpartners.com",
        first_name: customerFirstName ?? "Client",
        last_name: customerLastName ?? "IBIG",
        phone: customerPhone ?? "",
      },
      return_url: `${siteUrl}/paiement/merci?ref=${productSlug}|${partnerCode}`,
      notify_url: `${siteUrl}/api/moneroo/webhook`,
      metadata: {
        product_slug: productSlug,
        partner_code: partnerCode,
      },
    }),
  });

  const data = await res.json();

  if (!res.ok || !data?.data?.checkout_url) {
    console.error("[Moneroo] Erreur initiation :", data);
    return NextResponse.json(
      { error: data?.message ?? "Erreur Moneroo lors de l'initiation du paiement" },
      { status: 502 }
    );
  }

  return NextResponse.json({ paymentUrl: data.data.checkout_url, paymentId: data.data.id });
}

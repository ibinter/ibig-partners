/**
 * Initiation d'un paiement Moneroo.
 * Moneroo agrège Orange Money CI, Wave, MTN MoMo, Moov Money, etc.
 * Appelée par le bouton "Payer" sur une page produit publique.
 * Retourne l'URL de paiement Moneroo à laquelle rediriger le client.
 */

import { NextRequest, NextResponse } from "next/server";

const MONEROO_API = "https://api.moneroo.io/v1/payments/initialize";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }
  const {
    productSlug, partnerCode, amount,
    customerFirstName, customerLastName, customerEmail, customerPhone,
    modeFormation, statutProfessionnel, objectif,
    disponibilite, ville, pays, domaineActivite, niveauEtude, fonction, anneesExperience, message,
  } = body as Record<string, string | number | undefined>;

  const secretKey = process.env.MONEROO_SECRET_KEY;
  // Dériver l'URL de base depuis la requête elle-même — toujours correct en prod
  const origin = new URL(req.url).origin;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? origin;

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
      return_url: `${siteUrl}/paiement/merci?slug=${encodeURIComponent(productSlug)}&ref=${encodeURIComponent(partnerCode)}`,
      notify_url: `${siteUrl}/api/moneroo/webhook`,
      metadata: Object.fromEntries(
        Object.entries({
          product_slug:         String(productSlug         ?? ""),
          partner_code:         String(partnerCode         ?? ""),
          mode_formation:       String(modeFormation       ?? ""),
          statut_professionnel: String(statutProfessionnel ?? ""),
          objectif:             String(objectif            ?? ""),
          ville:                String(ville               ?? ""),
          pays:                 String(pays                ?? ""),
          niveau_etude:         String(niveauEtude         ?? ""),
          fonction:             String(fonction            ?? ""),
          message:              String(message             ?? ""),
        }).filter(([, v]) => v !== "" && v !== "undefined" && v !== "null").slice(0, 10)
      ),
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

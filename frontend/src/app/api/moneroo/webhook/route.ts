/**
 * Webhook Moneroo — appelé après un paiement (succès ou échec).
 * Docs : https://docs.moneroo.io/webhooks
 *
 * Variables d'env nécessaires :
 *   MONEROO_SECRET_KEY  — clé secrète Moneroo (Bearer token)
 *   MONEROO_WEBHOOK_SECRET — secret de signature des webhooks (dashboard Moneroo)
 */

import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { generateCommissionsForSale, recomputeStatus } from "@/lib/sales";
import { sendPaymentReceiptEmail, sendNewSaleEmail } from "@/lib/email";

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  return expected === signature;
}

// Statuts Moneroo considérés comme "paiement réussi"
const SUCCESS_STATUSES = new Set(["success", "paid", "completed", "SUCCESS", "PAID", "COMPLETED"]);

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "body invalide" }, { status: 400 });
  }

  // Vérification de signature si MONEROO_WEBHOOK_SECRET est configuré
  const webhookSecret = process.env.MONEROO_WEBHOOK_SECRET;
  if (webhookSecret) {
    const signature = req.headers.get("x-moneroo-signature") ?? "";
    if (!verifySignature(rawBody, signature, webhookSecret)) {
      console.warn("[Moneroo Webhook] Signature invalide — requête rejetée");
      return NextResponse.json({ error: "signature invalide" }, { status: 401 });
    }
  }

  // Log complet pour déboguer
  console.log("[Moneroo Webhook] Payload brut :", JSON.stringify(body));

  // Moneroo peut envoyer le payload à la racine OU sous body.data
  const data = (body.data ?? body) as Record<string, unknown>;
  const status = String(data.status ?? body.status ?? "");
  const amount = Number(data.amount ?? body.amount ?? 0);

  // Les metadata peuvent être à la racine ou sous data
  const metadata = (data.metadata ?? body.metadata ?? {}) as {
    product_slug?: string;
    partner_code?: string;
    mode_formation?: string;
    statut_professionnel?: string;
    objectif?: string;
    disponibilite?: string;
    ville?: string;
    pays?: string;
    domaine_activite?: string;
    niveau_etude?: string;
    fonction?: string;
    annees_experience?: string;
    message?: string;
  };

  console.log("[Moneroo Webhook] status =", status, "| amount =", amount, "| metadata =", JSON.stringify(metadata));

  // Ne traiter que les paiements réussis
  if (!SUCCESS_STATUSES.has(status)) {
    console.log("[Moneroo Webhook] Statut ignoré :", status);
    return NextResponse.json({ message: `statut "${status}" ignoré` });
  }

  const productSlug = metadata?.product_slug;
  const partnerCode = metadata?.partner_code;

  if (!productSlug || !partnerCode) {
    console.error("[Moneroo Webhook] Metadata manquants — product_slug:", productSlug, "partner_code:", partnerCode);
    return NextResponse.json({ error: "metadata product_slug / partner_code manquants" }, { status: 400 });
  }

  const [product, seller] = await Promise.all([
    prisma.product.findUnique({ where: { slug: productSlug } }),
    prisma.user.findFirst({ where: { code: partnerCode, approved: true, active: true } }),
  ]);

  if (!product) {
    console.error("[Moneroo Webhook] Produit introuvable :", productSlug);
    return NextResponse.json({ error: "produit introuvable" }, { status: 404 });
  }
  if (!seller) {
    console.error("[Moneroo Webhook] Partenaire introuvable :", partnerCode);
    return NextResponse.json({ error: "partenaire introuvable" }, { status: 404 });
  }

  // Récupérer le client depuis le payload Moneroo si disponible
  const customer = (data.customer ?? body.customer ?? {}) as {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
  const customerName = [customer.first_name, customer.last_name].filter(Boolean).join(" ") || "Client Moneroo";
  const customerEmail = customer.email ?? null;
  const customerPhone = customer.phone ?? null;

  // Identifiant de transaction du processeur — pour éviter les doublons si Moneroo
  // réémet le webhook (idempotence).
  const providerRef = String(data.id ?? body.id ?? (data as { transaction_id?: string }).transaction_id ?? "") || null;
  if (providerRef) {
    const already = await prisma.sale.findUnique({ where: { providerRef } });
    if (already) {
      console.log(`[Moneroo Webhook] Transaction ${providerRef} déjà traitée (vente ${already.reference}) — ignorée.`);
      return NextResponse.json({ message: "déjà traité", saleId: already.id });
    }
  }

  const saleAmount = Math.round(amount) || product.price;
  const count = await prisma.sale.count();

  const sale = await prisma.sale.create({
    data: {
      reference: `VTE-${String(count + 1).padStart(4, "0")}`,
      productId: product.id,
      sellerId: seller.id,
      customerName,
      customerEmail,
      customerPhone,
      providerRef,
      amount: saleAmount,
      pricingType: product.pricingType,
      status: "CONFIRMED",
      monthsPaid: 1,
    },
  });

  await generateCommissionsForSale(sale.id);
  await recomputeStatus(seller.id);

  // Notifier l'affilié (cloche) — il est prévenu en temps réel de la vente.
  await prisma.notification.create({
    data: {
      userId: seller.id,
      title: "🎉 Nouvelle vente confirmée !",
      body: `Un client (${customerName}) a payé « ${product.name} » — ${saleAmount.toLocaleString("fr-FR")} FCFA. Votre commission est en cours de calcul.`,
      url: "/espace/commissions",
    },
  });

  // Tâches asynchrones après la réponse :
  //  - reçu au CLIENT, alerte AFFILIÉ
  //  - inscription EDUFORM si produit EDUFORM
  after(async () => {
    if (customerEmail) {
      await sendPaymentReceiptEmail({
        to: customerEmail,
        customerName,
        productName: product.name,
        amount: saleAmount,
        reference: sale.reference,
      });
    }
    if (seller.email) {
      await sendNewSaleEmail({
        to: seller.email,
        firstName: seller.firstName,
        productName: product.name,
        amount: saleAmount,
        customerName,
        reference: sale.reference,
      });
    }

    // Inscription automatique EDUFORM pour les formations de cette branche
    if (product.slug.startsWith("eduform-")) {
      const eduformUrl = process.env.EDUFORM_REGISTER_URL;
      const eduformSecret = process.env.EDUFORM_REGISTER_SECRET;
      if (eduformUrl && eduformSecret) {
        try {
          const resp = await fetch(eduformUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-partners-api-key": eduformSecret,
            },
            body: JSON.stringify({
              formation_slug:       product.slug,
              customer_name:        customerName,
              customer_email:       customerEmail ?? "",
              customer_phone:       customerPhone ?? "",
              amount:               saleAmount,
              reference:            sale.reference,
              partner_code:         seller.code,
              mode_formation:       metadata.mode_formation       ?? "",
              statut_professionnel: metadata.statut_professionnel ?? "",
              objectif:             metadata.objectif             ?? "",
              disponibilite:        metadata.disponibilite        ?? "",
              ville:                metadata.ville                ?? "",
              pays:                 metadata.pays                 ?? "",
              domaine_activite:     metadata.domaine_activite     ?? "",
              niveau_etude:         metadata.niveau_etude         ?? "",
              fonction:             metadata.fonction             ?? "",
              annees_experience:    metadata.annees_experience    ?? "",
              message:              metadata.message              ?? "",
            }),
          });
          const json = await resp.json().catch(() => ({}));
          if (resp.ok) {
            console.log(`[EDUFORM] Inscription OK — ref ${json.reference ?? "?"} formation "${json.formation ?? product.slug}"`);
          } else {
            console.error(`[EDUFORM] Inscription échouée (${resp.status}) :`, JSON.stringify(json));
          }
        } catch (err) {
          console.error("[EDUFORM] Erreur réseau lors de l'inscription :", err);
        }
      } else {
        console.warn("[EDUFORM] EDUFORM_REGISTER_URL ou EDUFORM_REGISTER_SECRET non configurés — inscription ignorée");
      }
    }
  });

  console.log(`[Moneroo] Vente ${sale.reference} créée — ${saleAmount} FCFA — Client: ${customerName} — Vendeur: ${seller.code}`);
  return NextResponse.json({ success: true, saleId: sale.id });
}

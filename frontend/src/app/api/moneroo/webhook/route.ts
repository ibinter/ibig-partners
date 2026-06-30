/**
 * Webhook Moneroo — appelé après un paiement (succès ou échec).
 * Docs : https://docs.moneroo.io/webhooks
 *
 * Variables d'env nécessaires :
 *   MONEROO_SECRET_KEY  — clé secrète Moneroo (Bearer token)
 *   MONEROO_WEBHOOK_SECRET — secret de signature des webhooks (dashboard Moneroo)
 */

import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { generateCommissionsForSale, recomputeStatus } from "@/lib/sales";

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  return expected === signature;
}

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

  // Log complet pour déboguer le format Moneroo
  console.log("[Moneroo Webhook] Payload reçu :", JSON.stringify(body));

  const { status, amount, metadata } = body as {
    status: string;
    amount: number;
    metadata?: { product_slug?: string; partner_code?: string };
  };

  console.log("[Moneroo Webhook] status =", status, "| amount =", amount, "| metadata =", JSON.stringify(metadata));

  // Ne traiter que les paiements réussis
  if (status !== "success") {
    console.log("[Moneroo Webhook] Statut non traité :", status);
    return NextResponse.json({ message: `statut "${status}" ignoré` });
  }

  const productSlug = metadata?.product_slug;
  const partnerCode = metadata?.partner_code;

  if (!productSlug || !partnerCode) {
    return NextResponse.json({ error: "metadata product_slug / partner_code manquants" }, { status: 400 });
  }

  const [product, seller] = await Promise.all([
    prisma.product.findUnique({ where: { slug: productSlug } }),
    prisma.user.findFirst({ where: { code: partnerCode, approved: true, active: true } }),
  ]);

  if (!product || !seller) {
    return NextResponse.json({ error: "produit ou partenaire introuvable" }, { status: 404 });
  }

  const saleAmount = Math.round(Number(amount));
  const count = await prisma.sale.count();

  const sale = await prisma.sale.create({
    data: {
      reference: `VTE-${String(count + 1).padStart(4, "0")}`,
      productId: product.id,
      sellerId: seller.id,
      customerName: `Moneroo-Client`,
      amount: saleAmount,
      pricingType: product.pricingType,
      status: "CONFIRMED",
      monthsPaid: 1,
    },
  });

  await generateCommissionsForSale(sale.id);
  await recomputeStatus(seller.id);

  console.log(`[Moneroo] Vente ${sale.reference} créée automatiquement — ${saleAmount} FCFA`);
  return NextResponse.json({ success: true, saleId: sale.id });
}

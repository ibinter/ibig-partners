import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCommissionsForSale, recomputeStatus } from "@/lib/sales";
import { sendNewSaleEmail, sendPaymentReceiptEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Réconciliation des ventes réalisées sur les SITES PRODUITS (Scolaby, IBIG Soft…).
 *
 * Quand un client paie/s'abonne sur la plateforme d'un produit via un lien
 * d'affiliation (paramètre `ref`), ce site appelle cet endpoint pour créer la
 * vente CONFIRMÉE + les commissions dans IBIG PARTNERS — sans déclaration manuelle.
 *
 * Sécurité : en-tête `x-partner-api-key` == process.env.PARTNER_SALE_API_KEY.
 * Idempotence : `externalRef` (id de commande unique côté site produit) stocké
 *   dans Sale.providerRef — un même paiement rapporté deux fois ne crée qu'une vente.
 *
 * Body JSON :
 *   {
 *     "partnerCode":   "AFF-XXXX-001",         (obligatoire, le `ref` du lien)
 *     "productSlug":   "scolaby",              (obligatoire, slug du catalogue IBIG)
 *     "externalRef":   "SCOLABY-INV-123",      (obligatoire, id unique de la commande)
 *     "amount":         30000,                 (optionnel, défaut = prix du produit)
 *     "monthsPaid":     1,                      (optionnel, mensuel : nb de mois payés)
 *     "customerName":  "Kofi Asante",          (optionnel)
 *     "customerEmail": "kofi@exemple.com",     (optionnel, pour le reçu)
 *     "customerPhone": "+22507..."             (optionnel)
 *   }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.PARTNER_SALE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "PARTNER_SALE_API_KEY non configuré côté IBIG PARTNERS" },
      { status: 503 },
    );
  }
  const provided = req.headers.get("x-partner-api-key") ?? "";
  if (provided !== apiKey) {
    return NextResponse.json({ error: "Clé API invalide" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const partnerCode = String((body as Record<string, unknown>).partnerCode ?? "").trim().toUpperCase();
  const productSlug = String((body as Record<string, unknown>).productSlug ?? "").trim();
  const externalRef = String((body as Record<string, unknown>).externalRef ?? "").trim();
  const amountRaw = Number((body as Record<string, unknown>).amount);
  const monthsRaw = Number((body as Record<string, unknown>).monthsPaid);
  const customerName = String((body as Record<string, unknown>).customerName ?? "").trim() || "Client";
  const customerEmail = String((body as Record<string, unknown>).customerEmail ?? "").trim() || null;
  const customerPhone = String((body as Record<string, unknown>).customerPhone ?? "").trim() || null;

  if (!partnerCode || !productSlug || !externalRef) {
    return NextResponse.json(
      { error: "Champs requis manquants : partnerCode, productSlug, externalRef" },
      { status: 400 },
    );
  }

  // Idempotence : si cette transaction externe est déjà enregistrée, ne rien refaire.
  const already = await prisma.sale.findUnique({ where: { providerRef: externalRef } });
  if (already) {
    return NextResponse.json({ ok: true, message: "déjà traité", saleId: already.id, reference: already.reference });
  }

  const [product, seller] = await Promise.all([
    prisma.product.findUnique({ where: { slug: productSlug } }),
    prisma.user.findFirst({ where: { code: partnerCode, approved: true, active: true } }),
  ]);
  if (!product) {
    return NextResponse.json({ error: `Produit introuvable : ${productSlug}` }, { status: 404 });
  }
  if (!seller) {
    return NextResponse.json({ error: `Partenaire introuvable ou inactif : ${partnerCode}` }, { status: 404 });
  }

  const amount = amountRaw > 0 ? Math.round(amountRaw) : product.price;
  const monthsPaid = monthsRaw > 0 ? Math.min(Math.round(monthsRaw), 4) : 1;
  const count = await prisma.sale.count();

  const sale = await prisma.sale.create({
    data: {
      reference: `VTE-${String(count + 1).padStart(4, "0")}`,
      productId: product.id,
      sellerId: seller.id,
      customerName,
      customerEmail,
      customerPhone,
      providerRef: externalRef,
      amount,
      pricingType: product.pricingType,
      status: "CONFIRMED",
      monthsPaid,
      proofNote: `Vente réconciliée depuis le site produit (réf. ${externalRef})`,
    },
  });

  await generateCommissionsForSale(sale.id);
  await recomputeStatus(seller.id);

  await prisma.notification.create({
    data: {
      userId: seller.id,
      title: "🎉 Nouvelle vente confirmée !",
      body: `Un client (${customerName}) a acheté « ${product.name} » — ${amount.toLocaleString("fr-FR")} FCFA. Votre commission est en cours de calcul.`,
      url: "/espace/commissions",
    },
  });

  after(async () => {
    if (customerEmail) {
      await sendPaymentReceiptEmail({
        to: customerEmail,
        customerName,
        productName: product.name,
        amount,
        reference: sale.reference,
      });
    }
    if (seller.email) {
      await sendNewSaleEmail({
        to: seller.email,
        firstName: seller.firstName,
        productName: product.name,
        amount,
        customerName,
        reference: sale.reference,
      });
    }
  });

  return NextResponse.json({ ok: true, saleId: sale.id, reference: sale.reference }, { status: 201 });
}

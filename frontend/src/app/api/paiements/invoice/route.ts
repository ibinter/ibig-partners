import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await requireUser();
  const { searchParams } = new URL(req.url);
  const payoutId = searchParams.get("id");
  if (!payoutId) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const payout = await prisma.payout.findFirst({
    where: { id: payoutId, userId: user.id },
    include: { user: { select: { firstName: true, lastName: true, code: true, email: true, city: true, payoutMethod: true, payoutDetail: true } } },
  });
  if (!payout) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });

  const commissions = await prisma.commission.findMany({
    where: { userId: user.id, status: "PAID", updatedAt: { lte: payout.createdAt } },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { sale: { include: { product: true } } },
  });

  const num = `IBIG-${payout.id.slice(-6).toUpperCase()}`;
  const dateStr = new Date(payout.createdAt).toLocaleDateString("fr-FR");

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
  <style>
    body { font-family: sans-serif; color: #1e293b; padding: 40px; font-size: 13px; }
    h1 { font-size: 22px; color: #0f172a; }
    .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #f1f5f9; text-align: left; padding: 8px; font-size: 11px; color: #64748b; }
    td { padding: 8px; border-bottom: 1px solid #f1f5f9; }
    .total { font-weight: bold; font-size: 16px; color: #0f172a; }
    .badge { background: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: bold; }
  </style></head><body>
  <div class="row"><div><h1>Relevé de paiement</h1><p style="color:#64748b">N° ${num} · ${dateStr}</p></div>
  <div style="text-align:right"><strong>IBIG PARTNERS</strong><br>Côte d'Ivoire</div></div>
  <hr style="margin:20px 0;border-color:#e2e8f0">
  <div class="row"><div><strong>Bénéficiaire</strong><br>${payout.user.firstName} ${payout.user.lastName}<br>${payout.user.email}<br>${payout.user.city ?? ""}</div>
  <div style="text-align:right"><strong>Code partenaire</strong><br>${payout.user.code}<br><br><strong>Méthode</strong><br>${payout.user.payoutMethod}<br>${payout.user.payoutDetail ?? ""}</div></div>
  <table><thead><tr><th>Produit</th><th>Date</th><th style="text-align:right">Montant</th></tr></thead>
  <tbody>${commissions.map((c) => `<tr><td>${c.sale.product.name}</td><td>${new Date(c.createdAt).toLocaleDateString("fr-FR")}</td><td style="text-align:right">${c.amount.toLocaleString("fr-FR")} FCFA</td></tr>`).join("")}
  </tbody></table>
  <div class="row" style="margin-top:20px"><div></div><div class="total">${payout.amount.toLocaleString("fr-FR")} FCFA <span class="badge">PAYÉ</span></div></div>
  <p style="margin-top:40px;color:#94a3b8;font-size:11px">Document généré automatiquement par IBIG PARTNERS · ${new Date().toLocaleDateString("fr-FR")}</p>
  </body></html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="facture-${num}.html"`,
    },
  });
}

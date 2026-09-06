import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthLabel = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const [sales, commAgg, referrals] = await Promise.all([
    prisma.sale.count({ where: { sellerId: user.id, status: "CONFIRMED", createdAt: { gte: monthStart } } }),
    prisma.commission.aggregate({ where: { userId: user.id, status: "PAID", createdAt: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.user.count({ where: { sponsorId: user.id } }),
  ]);

  const recentSales = await prisma.sale.findMany({
    where: { sellerId: user.id, createdAt: { gte: monthStart } },
    include: { product: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const commTotal = commAgg._sum.amount ?? 0;
  const fmt = (n: number) => n.toLocaleString("fr-FR") + " FCFA";

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Rapport mensuel — ${monthLabel}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; padding: 32px; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #e2e8f0; }
  .logo { font-size: 20px; font-weight: 800; color: #1e293b; }
  .title { font-size: 16px; font-weight: 700; color: #475569; }
  .kpis { display: flex; gap: 16px; margin-bottom: 24px; }
  .kpi { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center; }
  .kpi-value { font-size: 22px; font-weight: 800; color: #1e293b; }
  .kpi-label { font-size: 11px; color: #94a3b8; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { background: #f1f5f9; text-align: left; padding: 8px 12px; font-size: 11px; color: #64748b; font-weight: 600; }
  td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
  h2 { font-size: 14px; font-weight: 700; margin-bottom: 12px; color: #1e293b; }
  .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #94a3b8; }
  @media print { body { padding: 16px; } }
</style>
</head>
<body>
<div class="header">
  <div class="logo">IBIG Partners</div>
  <div>
    <div class="title">Rapport mensuel — ${monthLabel}</div>
    <div style="font-size:11px;color:#94a3b8;margin-top:4px">${user.firstName} ${user.lastName} — Code : ${user.code}</div>
  </div>
</div>

<div class="kpis">
  <div class="kpi"><div class="kpi-value">${sales}</div><div class="kpi-label">Ventes ce mois</div></div>
  <div class="kpi"><div class="kpi-value">${fmt(commTotal)}</div><div class="kpi-label">Commissions payées</div></div>
  <div class="kpi"><div class="kpi-value">${referrals}</div><div class="kpi-label">Filleuls actifs</div></div>
</div>

<h2>Détail des ventes du mois</h2>
<table>
  <thead><tr><th>#</th><th>Produit</th><th>Référence</th><th>Montant</th><th>Statut</th><th>Date</th></tr></thead>
  <tbody>
    ${recentSales.length === 0
      ? `<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:16px">Aucune vente ce mois</td></tr>`
      : recentSales.map((s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${s.product?.name ?? "—"}</td>
        <td>${s.reference ?? "—"}</td>
        <td>${fmt(s.amount)}</td>
        <td>${s.status}</td>
        <td>${new Date(s.createdAt).toLocaleDateString("fr-FR")}</td>
      </tr>`).join("")}
  </tbody>
</table>

<div class="footer">
  Généré le ${now.toLocaleDateString("fr-FR")} · IBIG Partners · ibigpartners.com
</div>
<script>window.onload = () => window.print();</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

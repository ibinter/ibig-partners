// Route API pour les données de graphiques (mensuelles)
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();

  const sales = await prisma.sale.findMany({
    where: { status: "CONFIRMED" },
    select: { amount: true, createdAt: true },
  });

  const commissions = await prisma.commission.findMany({
    select: { amount: true, createdAt: true },
  });

  // Agréger par mois (6 derniers mois)
  const months: Record<string, { ca: number; commissions: number }> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    months[key] = { ca: 0, commissions: 0 };
  }

  for (const s of sales) {
    const key = s.createdAt.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    if (months[key]) months[key].ca += s.amount;
  }
  for (const c of commissions) {
    const key = c.createdAt.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    if (months[key]) months[key].commissions += c.amount;
  }

  const data = Object.entries(months).map(([mois, v]) => ({ mois, ...v }));
  return NextResponse.json(data);
}

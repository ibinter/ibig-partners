import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireUser();

  const [
    salesCount,
    prospectsContacted,
    prospectsConverted,
    pendingLeads,
    lastSale,
    commPending,
    streakRecord,
  ] = await Promise.all([
    prisma.sale.count({ where: { sellerId: user.id } }),
    prisma.prospect.count({ where: { userId: user.id, status: "CONTACTED" } }),
    prisma.prospect.count({ where: { userId: user.id, status: "CONVERTED" } }),
    (prisma as any).opportunityLead.count({ where: { userId: user.id, status: "INTERESTED" } }),
    prisma.sale.findFirst({ where: { sellerId: user.id }, orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
    prisma.commission.aggregate({ where: { userId: user.id, status: "PENDING" }, _sum: { amount: true } }),
    (prisma as any).dailyStreak.findUnique({ where: { userId: user.id } }),
  ]);

  const recs: { priority: "high" | "medium" | "low"; icon: string; title: string; action: string; href: string }[] = [];

  const daysSinceLastSale = lastSale
    ? Math.floor((Date.now() - new Date(lastSale.createdAt).getTime()) / 86400000)
    : 999;

  if (daysSinceLastSale > 14) {
    recs.push({ priority: "high", icon: "🚨", title: "Aucune vente depuis plus de 2 semaines", action: "Déclarez une vente maintenant", href: "/espace/ventes" });
  }
  if (prospectsContacted > 3) {
    recs.push({ priority: "high", icon: "📇", title: `${prospectsContacted} prospects en attente de suivi`, action: "Relancez vos prospects", href: "/espace/prospects" });
  }
  if (pendingLeads > 0) {
    recs.push({ priority: "medium", icon: "💼", title: `${pendingLeads} lead(s) B2B à traiter`, action: "Voir vos opportunités", href: "/espace/opportunites" });
  }
  const commAmount = commPending._sum.amount ?? 0;
  if (commAmount > 10000) {
    recs.push({ priority: "medium", icon: "💰", title: `${commAmount.toLocaleString()} FCFA de commissions en attente`, action: "Voir vos commissions", href: "/espace/commissions" });
  }
  if (salesCount < 3) {
    recs.push({ priority: "medium", icon: "🎯", title: "Complétez votre profil pour booster votre vitrine", action: "Personnaliser ma vitrine", href: "/espace/ma-vitrine" });
  }
  if (!streakRecord || (streakRecord.currentStreak ?? 0) < 3) {
    recs.push({ priority: "low", icon: "🔥", title: "Maintenez votre streak de connexion", action: "Voir mes streaks", href: "/espace/streaks" });
  }
  if (prospectsConverted === 0 && salesCount === 0) {
    recs.push({ priority: "low", icon: "🚀", title: "Suivez le guide de démarrage rapide", action: "Démarrer", href: "/espace/setup" });
  }

  if (recs.length === 0) {
    recs.push({ priority: "low", icon: "✅", title: "Tout est en ordre — continuez comme ça !", action: "Voir mes statistiques", href: "/espace/analytics" });
  }

  return NextResponse.json({ recommendations: recs.slice(0, 5) });
}

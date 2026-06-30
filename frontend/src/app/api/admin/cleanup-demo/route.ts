import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Supprime TOUTES les données demo (faux partenaires + leurs données liées).
// Conserve : branches, produits, badges, modules de formation, paramètres, compte SUPERADMIN.
// À appeler UNE SEULE FOIS avant le lancement commercial.
export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  // Trouver tous les utilisateurs SAUF les SUPERADMIN et ADMIN
  const demoUsers = await prisma.user.findMany({
    where: { role: "PARTNER" },
    select: { id: true, email: true, code: true },
  });

  const demoIds = demoUsers.map((u) => u.id);

  if (demoIds.length === 0) {
    return NextResponse.json({ ok: true, message: "Aucune donnée demo à supprimer.", deleted: 0 });
  }

  // Suppression dans l'ordre des contraintes FK
  await prisma.userBadge.deleteMany({ where: { userId: { in: demoIds } } });
  await prisma.trainingProgress.deleteMany({ where: { userId: { in: demoIds } } });
  await prisma.chatMessage.deleteMany({ where: { senderId: { in: demoIds } } });
  await prisma.chatParticipant.deleteMany({ where: { userId: { in: demoIds } } });
  await prisma.otpCode.deleteMany({ where: { userId: { in: demoIds } } });
  await prisma.notification.deleteMany({ where: { userId: { in: demoIds } } });
  await prisma.auditLog.deleteMany({ where: { userId: { in: demoIds } } });
  await prisma.ticketMessage.deleteMany({ where: { authorId: { in: demoIds } } });
  await prisma.ticket.deleteMany({ where: { userId: { in: demoIds } } });
  await prisma.prospect.deleteMany({ where: { userId: { in: demoIds } } });
  await prisma.opportunity.deleteMany({ where: { userId: { in: demoIds } } });
  await prisma.verificationRequest.deleteMany({ where: { userId: { in: demoIds } } });

  // Commissions liées aux ventes des demo users
  const demoSales = await prisma.sale.findMany({
    where: { sellerId: { in: demoIds } },
    select: { id: true },
  });
  const demoSaleIds = demoSales.map((s) => s.id);
  await prisma.commission.deleteMany({ where: { saleId: { in: demoSaleIds } } });
  await prisma.commission.deleteMany({ where: { userId: { in: demoIds } } });

  // Payouts
  await prisma.payout.deleteMany({ where: { userId: { in: demoIds } } });

  // Ventes
  await prisma.sale.deleteMany({ where: { sellerId: { in: demoIds } } });

  // Clics sur les liens
  const demoLinks = await prisma.affiliateLink.findMany({
    where: { userId: { in: demoIds } },
    select: { id: true },
  });
  const demoLinkIds = demoLinks.map((l) => l.id);
  await prisma.click.deleteMany({ where: { linkId: { in: demoLinkIds } } });
  await prisma.affiliateLink.deleteMany({ where: { userId: { in: demoIds } } });

  // Retirer le parrain des users non-demo qui auraient un parrain demo
  await prisma.user.updateMany({
    where: { sponsorId: { in: demoIds } },
    data: { sponsorId: null },
  });

  // Supprimer les comptes demo
  await prisma.user.deleteMany({ where: { id: { in: demoIds } } });

  // Supprimer aussi les notifications globales demo (userId null) sauf les settings
  await prisma.notification.deleteMany({ where: { userId: null } });

  // Supprimer les ventes orphelines (sans vendeur valide)
  await prisma.sale.deleteMany({
    where: { sellerId: { notIn: await prisma.user.findMany({ select: { id: true } }).then((u) => u.map((x) => x.id)) } },
  });

  return NextResponse.json({
    ok: true,
    message: `Nettoyage terminé. ${demoIds.length} compte(s) demo supprimé(s) avec toutes leurs données.`,
    deleted: demoIds.length,
    users: demoUsers.map((u) => `${u.email} (${u.code})`),
  });
}

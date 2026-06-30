import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Supprime TOUTES les données transactionnelles (ventes, commissions, clics)
// et tous les comptes PARTNER. Conserve SUPERADMIN, ADMIN, branches, produits,
// badges, modules de formation, paramètres.
export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  // 1. Supprimer TOUTES les données transactionnelles (peu importe le propriétaire)
  await prisma.userBadge.deleteMany({});
  await prisma.trainingProgress.deleteMany({});
  await prisma.chatMessage.deleteMany({});
  await prisma.chatParticipant.deleteMany({});
  await prisma.chatConversation.deleteMany({});
  await prisma.otpCode.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.ticketMessage.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.prospect.deleteMany({});
  await prisma.opportunity.deleteMany({});
  await prisma.verificationRequest.deleteMany({});
  await prisma.commission.deleteMany({});
  await prisma.payout.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.click.deleteMany({});
  await prisma.affiliateLink.deleteMany({});

  // 2. Supprimer tous les comptes PARTNER
  const partners = await prisma.user.findMany({
    where: { role: "PARTNER" },
    select: { id: true, email: true, code: true },
  });
  const partnerIds = partners.map((u) => u.id);

  if (partnerIds.length > 0) {
    // Retirer les références parrain
    await prisma.user.updateMany({
      where: { sponsorId: { in: partnerIds } },
      data: { sponsorId: null },
    });
    await prisma.user.deleteMany({ where: { id: { in: partnerIds } } });
  }

  return NextResponse.json({
    ok: true,
    message: `Nettoyage complet. ${partnerIds.length} compte(s) PARTNER supprimé(s). Toutes les ventes, commissions et données transactionnelles ont été effacées.`,
    deleted: partnerIds.length,
    users: partners.map((u) => `${u.email} (${u.code})`),
  });
}

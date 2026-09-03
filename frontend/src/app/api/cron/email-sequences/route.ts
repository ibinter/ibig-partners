import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  sendOnboardingJ1Email,
  sendOnboardingJ3Email,
  sendOnboardingJ7Email,
  sendActivationJ14Email,
  sendActivationJ21Email,
  sendReengageJ45Email,
  sendReengageJ60Email,
} from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Moteur de séquences email marketing IBIG PARTNERS.
 * Déclenché par Vercel Cron tous les jours à 8h UTC.
 * Auth : Authorization: Bearer <CRON_SECRET> ou x-cron-secret.
 *
 * Séquences gérées :
 *  ONBOARDING : J1 / J3 / J7 après approbation du compte
 *  ACTIVATION  : J14 / J21 si aucune vente depuis l'approbation
 *  REENGAGE    : J45 / J60 si aucune vente depuis 45 / 60 jours
 */
export async function GET() {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET non configuré" }, { status: 503 });
  }
  const h = await headers();
  const auth = h.get("authorization");
  const x = h.get("x-cron-secret");
  if (auth !== `Bearer ${secret}` && x !== secret) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  const stats = {
    onboarding_j1: 0, onboarding_j3: 0, onboarding_j7: 0,
    activation_j14: 0, activation_j21: 0,
    reengage_j45: 0, reengage_j60: 0,
    skipped: 0, errors: 0,
  };

  // Récupérer tous les affiliés approuvés et actifs
  const affiliates = await prisma.user.findMany({
    where: { role: "PARTNER", approved: true, active: true },
    select: {
      id: true,
      email: true,
      firstName: true,
      status: true,
      createdAt: true,
      sales: {
        where: { status: "CONFIRMED" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
      commissions: {
        where: { status: { in: ["VALIDATED", "PAID"] } },
        select: { amount: true },
      },
    },
  });

  // Récupérer les logs d'envoi existants pour ces affiliés
  const userIds = affiliates.map(a => a.id);
  const existingLogs = await prisma.emailSequenceLog.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, sequence: true, step: true },
  });

  // Index des logs pour lookup O(1)
  const sentSet = new Set(existingLogs.map(l => `${l.userId}:${l.sequence}:${l.step}`));
  const hasSent = (userId: string, sequence: string, step: string) =>
    sentSet.has(`${userId}:${sequence}:${step}`);

  for (const a of affiliates) {
    if (!a.email) { stats.skipped++; continue; }

    const approvedAt = a.createdAt.getTime(); // createdAt ≈ date d'inscription/approbation
    const daysSinceApproval = Math.floor((now - approvedAt) / DAY);
    const lastSale = a.sales[0]?.createdAt ?? null;
    const daysSinceLastSale = lastSale
      ? Math.floor((now - lastSale.getTime()) / DAY)
      : daysSinceApproval;
    const hasSale = a.sales.length > 0;
    const totalEarned = a.commissions.reduce((s, c) => s + c.amount, 0);
    const lang = "fr"; // TODO: stocker la langue dans le profil utilisateur

    try {
      // ── ONBOARDING : J1 ────────────────────────────────────────────────
      if (daysSinceApproval >= 1 && !hasSent(a.id, "ONBOARDING", "J1")) {
        const res = await sendOnboardingJ1Email({ to: a.email, firstName: a.firstName, lang });
        await logEmail(a.id, "ONBOARDING", "J1", res.id);
        stats.onboarding_j1++;
      }

      // ── ONBOARDING : J3 ───────────────────────────────────────────���────
      else if (daysSinceApproval >= 3 && !hasSent(a.id, "ONBOARDING", "J3")) {
        const user = await prisma.user.findUnique({ where: { id: a.id }, select: { code: true } });
        const res = await sendOnboardingJ3Email({ to: a.email, firstName: a.firstName, code: user?.code ?? "", lang });
        await logEmail(a.id, "ONBOARDING", "J3", res.id);
        stats.onboarding_j3++;
      }

      // ── ONBOARDING : J7 ────────────────────────────────────────────────
      else if (daysSinceApproval >= 7 && !hasSent(a.id, "ONBOARDING", "J7")) {
        const res = await sendOnboardingJ7Email({ to: a.email, firstName: a.firstName, hasSale, lang });
        await logEmail(a.id, "ONBOARDING", "J7", res.id);
        stats.onboarding_j7++;
      }

      // ── ACTIVATION : J14 (sans vente) ──────────────────────────────────
      if (!hasSale && daysSinceApproval >= 14 && !hasSent(a.id, "ACTIVATION", "J14")) {
        const user = await prisma.user.findUnique({ where: { id: a.id }, select: { code: true } });
        const res = await sendActivationJ14Email({ to: a.email, firstName: a.firstName, code: user?.code ?? "", lang });
        await logEmail(a.id, "ACTIVATION", "J14", res.id);
        stats.activation_j14++;
      }

      // ── ACTIVATION : J21 (sans vente) ──────────────────────────────────
      if (!hasSale && daysSinceApproval >= 21 && !hasSent(a.id, "ACTIVATION", "J21")) {
        const res = await sendActivationJ21Email({ to: a.email, firstName: a.firstName, lang });
        await logEmail(a.id, "ACTIVATION", "J21", res.id);
        stats.activation_j21++;
      }

      // ── RÉENGAGEMENT : J45 ─────────────────────────────────────────────
      if (daysSinceLastSale >= 45 && !hasSent(a.id, "REENGAGE", "J45")) {
        const res = await sendReengageJ45Email({ to: a.email, firstName: a.firstName, totalEarned, lang });
        await logEmail(a.id, "REENGAGE", "J45", res.id);
        stats.reengage_j45++;
      }

      // ── RÉENGAGEMENT : J60 ─────────────────────────────────────────────
      if (daysSinceLastSale >= 60 && !hasSent(a.id, "REENGAGE", "J60")) {
        const res = await sendReengageJ60Email({ to: a.email, firstName: a.firstName, lang });
        await logEmail(a.id, "REENGAGE", "J60", res.id);
        stats.reengage_j60++;
      }

    } catch (err) {
      console.error(`[email-sequences] Erreur pour ${a.email}:`, err);
      stats.errors++;
    }
  }

  return NextResponse.json({
    ok: true,
    total: affiliates.length,
    ...stats,
    runAt: new Date().toISOString(),
  });
}

async function logEmail(userId: string, sequence: string, step: string, emailId?: string) {
  await prisma.emailSequenceLog.upsert({
    where: { userId_sequence_step: { userId, sequence, step } },
    update: { sentAt: new Date(), emailId },
    create: { userId, sequence, step, emailId },
  });
}

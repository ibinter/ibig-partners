import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/confirm-mission-sale
 *
 * Libère le cash d'une mission MIXED uniquement APRÈS qu'une vente
 * réelle a été encaissée par IBIG SARL.
 *
 * Corps JSON attendu :
 * {
 *   applicationId: string,   // ID de la MissionApplication
 *   saleRef: string,         // Référence de la vente (numéro facture, reçu...)
 *   amountCollected: number, // Montant réellement encaissé par IBIG (FCFA)
 *   adminNote?: string
 * }
 *
 * Règle : le cash versé au partenaire = compensationAmount de la mission
 *         (calculé sur la commission IBIG, pas sur le montant total du deal)
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  let body: {
    applicationId: string;
    saleRef: string;
    amountCollected: number;
    adminNote?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const { applicationId, saleRef, amountCollected, adminNote } = body;

  if (!applicationId || !saleRef || typeof amountCollected !== "number") {
    return NextResponse.json(
      { error: "applicationId, saleRef et amountCollected sont obligatoires" },
      { status: 400 }
    );
  }

  const app = await (prisma as any).missionApplication.findUnique({
    where: { id: applicationId },
    include: {
      mission: true,
      user: { select: { id: true, email: true, firstName: true } },
    },
  });

  if (!app) {
    return NextResponse.json({ error: "Candidature introuvable" }, { status: 404 });
  }

  // Vérifications de sécurité
  if (app.mission.rewardType !== "MIXED") {
    return NextResponse.json(
      { error: `Cette route ne s'applique qu'aux missions MIXED. Type actuel : ${app.mission.rewardType}` },
      { status: 400 }
    );
  }

  if (app.status !== "VALIDATED") {
    return NextResponse.json(
      { error: `La candidature doit être à l'état VALIDATED avant libération du cash. État actuel : ${app.status}` },
      { status: 400 }
    );
  }

  if (app.commissionEarned > 0) {
    return NextResponse.json(
      { error: "Le cash a déjà été libéré pour cette candidature." },
      { status: 409 }
    );
  }

  if (amountCollected <= 0) {
    return NextResponse.json(
      { error: "Le montant encaissé doit être supérieur à 0." },
      { status: 400 }
    );
  }

  // Calcul de la commission partenaire
  const mission = app.mission;
  let commissionDue = 0;

  if (mission.compensationType === "PERCENT") {
    // % appliqué sur le montant encaissé par IBIG (pas sur le deal total)
    commissionDue = Math.round((amountCollected * (mission.compensationAmount / 10000)));
  } else if (mission.compensationType === "FIXED") {
    commissionDue = mission.compensationAmount ?? 0;
  } else {
    // PER_RESULT ou COMMISSION : montant fixe défini par la mission
    commissionDue = mission.compensationAmount ?? 0;
  }

  // Vérification : la commission ne peut pas dépasser 50% de ce qu'IBIG a encaissé
  const maxAllowed = Math.round(amountCollected * 0.5);
  if (commissionDue > maxAllowed) {
    return NextResponse.json(
      {
        error: `Commission calculée (${commissionDue} FCFA) dépasse 50% du montant encaissé par IBIG (${amountCollected} FCFA). Maximum autorisé : ${maxAllowed} FCFA. Vérifiez le taux de la mission.`,
        commissionCalculated: commissionDue,
        maxAllowed,
      },
      { status: 422 }
    );
  }

  // Libération du cash
  await (prisma as any).missionApplication.update({
    where: { id: applicationId },
    data: {
      status: "COMPLETED",
      commissionEarned: commissionDue,
      result: [
        app.result,
        `✅ Vente confirmée le ${new Date().toLocaleDateString("fr-FR")} — Réf: ${saleRef} — Encaissé par IBIG: ${amountCollected.toLocaleString("fr-FR")} FCFA — Commission partenaire libérée: ${commissionDue.toLocaleString("fr-FR")} FCFA`,
        adminNote ? `Note admin: ${adminNote}` : "",
      ].filter(Boolean).join("\n"),
      updatedAt: new Date(),
    },
  });

  // Créer la commission dans le système de paiement
  await (prisma as any).commission.create({
    data: {
      userId: app.userId,
      amount: commissionDue,
      level: 1,
      status: "PENDING",
      source: "MISSION",
      ref: `MISSION-SALE-${applicationId}-${saleRef}`,
      note: `Mission "${mission.title}" — Vente réf ${saleRef} — IBIG a encaissé ${amountCollected.toLocaleString("fr-FR")} FCFA`,
    },
  });

  return NextResponse.json({
    ok: true,
    applicationId,
    saleRef,
    amountCollectedByIbig: amountCollected,
    commissionDueToPartner: commissionDue,
    message: `✅ Cash libéré : ${commissionDue.toLocaleString("fr-FR")} FCFA pour le partenaire ${app.user.firstName} (${app.user.email})`,
  });
}

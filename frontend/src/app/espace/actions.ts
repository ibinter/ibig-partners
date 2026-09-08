"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPayoutRequestedEmail, sendOpportunityMessageEmail, sendOpportunityInterestEmail, sendOpportunityInterestAdminEmail } from "@/lib/email";

/** Active (cree le lien) ou desactive (supprime le lien) un produit pour le partenaire. */
export async function toggleProduct(formData: FormData) {
  const user = await requireUser();
  const productId = String(formData.get("productId") || "");
  if (!productId) return;

  const existing = await prisma.affiliateLink.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });

  if (existing) {
    // ne pas supprimer si des clics/ventes y sont rattaches : on garde l'historique
    if (existing.clicks > 0) return;
    await prisma.affiliateLink.delete({ where: { id: existing.id } });
  } else {
    await prisma.affiliateLink.create({
      data: { userId: user.id, productId, code: user.code },
    });
  }
  revalidatePath("/espace/produits");
  revalidatePath("/espace/liens");
}

export async function addProspect(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const reminderDays = Number(formData.get("reminderDays") || 0);
  const reminderAt = reminderDays > 0
    ? new Date(Date.now() + reminderDays * 24 * 60 * 60 * 1000)
    : null;
  await prisma.prospect.create({
    data: {
      userId: user.id,
      name,
      contact: String(formData.get("contact") || "").trim() || null,
      productId: String(formData.get("productId") || "") || null,
      note: String(formData.get("note") || "").trim() || null,
      priority: String(formData.get("priority") || "NORMAL"),
      status: "CONTACTED",
      reminderAt,
      lastContactedAt: new Date(),
    },
  });
  revalidatePath("/espace/prospects");
}

export async function setProspectReminder(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  const days = Number(formData.get("days") || 3);
  const prospect = await prisma.prospect.findUnique({ where: { id } });
  if (!prospect || prospect.userId !== user.id) return;
  await prisma.prospect.update({
    where: { id },
    data: {
      reminderAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      lastContactedAt: new Date(),
    },
  });
  revalidatePath("/espace/prospects");
}

/**
 * Import en masse de prospects/contacts depuis un texte CSV.
 * Chaque ligne : Nom[, Contact[, Note]]. Séparateurs acceptés : virgule,
 * point-virgule ou tabulation. Une éventuelle ligne d'en-tête est ignorée.
 */
export async function importProspects(formData: FormData) {
  const user = await requireUser();
  const raw = String(formData.get("data") || "");
  if (!raw.trim()) return;

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const rows: { name: string; contact: string | null; note: string | null }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const cols = lines[i].split(/[,;\t]/).map((c) => c.trim());
    const name = cols[0] ?? "";
    if (!name) continue;
    // Ignore une ligne d'en-tête évidente
    if (i === 0 && /^(nom|name|prenom|prénom|contact)$/i.test(name)) continue;
    rows.push({
      name,
      contact: cols[1] ? cols[1] : null,
      note: cols.slice(2).join(" ").trim() || null,
    });
  }

  if (rows.length === 0) return;

  await prisma.prospect.createMany({
    data: rows.map((r) => ({
      userId: user.id,
      name: r.name,
      contact: r.contact,
      note: r.note,
      status: "CONTACTED",
    })),
  });

  revalidatePath("/espace/prospects");
}

export async function updateProspectStatus(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const prospect = await prisma.prospect.findUnique({ where: { id } });
  if (!prospect || prospect.userId !== user.id) return;
  await prisma.prospect.update({ where: { id }, data: { status } });
  revalidatePath("/espace/prospects");
}

export async function deleteProspect(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  const prospect = await prisma.prospect.findUnique({ where: { id } });
  if (!prospect || prospect.userId !== user.id) return;
  await prisma.prospect.delete({ where: { id } });
  revalidatePath("/espace/prospects");
}

export async function addProspectNote(formData: FormData) {
  const user = await requireUser();
  const prospectId = String(formData.get("prospectId") || "");
  const content = String(formData.get("content") || "").trim();
  const type = String(formData.get("type") || "NOTE");
  if (!content || !prospectId) return;
  const prospect = await prisma.prospect.findUnique({ where: { id: prospectId } });
  if (!prospect || prospect.userId !== user.id) return;
  await (prisma as any).prospectNote.create({
    data: { prospectId, content, type, id: crypto.randomUUID() },
  });
  await prisma.prospect.update({
    where: { id: prospectId },
    data: { lastContactedAt: new Date() },
  });
  revalidatePath(`/espace/prospects/${prospectId}`);
  revalidatePath("/espace/prospects");
}

export async function expressInterest(formData: FormData) {
  const user = await requireUser();
  const opportunityId = String(formData.get("opportunityId") || "").trim();
  const note = String(formData.get("note") || "").trim();
  if (!opportunityId) return;

  const existing = await (prisma as any).opportunityLead.findUnique({
    where: { opportunityId_userId: { opportunityId, userId: user.id } },
  });

  await (prisma as any).opportunityLead.upsert({
    where: { opportunityId_userId: { opportunityId, userId: user.id } },
    create: { opportunityId, userId: user.id, status: "INTERESTED", note: note || null },
    update: { note: note || null, updatedAt: new Date() },
  });

  // Notifier le soumetteur uniquement au premier intérêt (pas à chaque update)
  if (!existing) {
    const opp = await (prisma as any).opportunity.findUnique({
      where: { id: opportunityId },
      include: { user: { select: { email: true, firstName: true } } },
    });
    if (opp && opp.user.email !== user.email) {
      const adminEmail = process.env.ADMIN_EMAIL ?? "admin@ibigpartners.com";
      const partnerName = `${(user as any).firstName} ${(user as any).lastName}`;
      const partnerCode = (user as any).code ?? "";
      after(async () => {
        // Email au soumetteur : juste "quelqu'un est intéressé", sans révéler l'identité
        await sendOpportunityInterestEmail({
          to: opp.user.email,
          firstName: opp.user.firstName,
          opportunityTitle: opp.title,
        }).catch(() => {});
        // Email à l'admin : tous les détails pour coordonner la mise en relation
        await sendOpportunityInterestAdminEmail({
          to: adminEmail,
          opportunityTitle: opp.title,
          opportunityId,
          submitterName: opp.user.firstName,
          submitterCode: opp.user.code ?? "",
          interestedPartnerName: partnerName,
          interestedPartnerCode: partnerCode,
          interestedPartnerNote: note || undefined,
        }).catch(() => {});
      });
    }
  }

  revalidatePath("/espace/opportunites");
}

export async function submitOpportunity(formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (!title || !description) return;
  await (prisma as any).opportunity.create({
    data: {
      userId: user.id,
      title,
      category: String(formData.get("category") || "AUTRE"),
      description,
      estimatedValue: Number(formData.get("estimatedValue") || 0) || 0,
      status: "NEW",
    },
  });
  const { logActivity: _logOpp } = await import("@/lib/activity");
  await _logOpp({ userId: user.id, action: "OPPORTUNITY_CREATED", detail: title });
  revalidatePath("/espace/reseau");
}

/**
 * Un affilié déclare une vente manuelle (paiement WhatsApp, abonnement SaaS direct, etc.).
 * La vente est créée en statut PENDING — l'admin doit la confirmer pour générer les commissions.
 */
export async function declareSale(formData: FormData) {
  const user = await requireUser();
  const productId = String(formData.get("productId") || "").trim();
  const customerName = String(formData.get("customerName") || "").trim();
  const customerPhone = String(formData.get("customerPhone") || "").trim();
  const customerEmail = String(formData.get("customerEmail") || "").trim();
  const channel = String(formData.get("channel") || "WhatsApp").trim();
  const proofNote   = String(formData.get("proofNote") || "").trim();
  const proofUrlUp  = String(formData.get("proofUrl") || "").trim();
  const proofUrlAlt = String(formData.get("proofUrlAlt") || "").trim();
  const proofUrl    = proofUrlUp || proofUrlAlt;
  const amountRaw = Number(formData.get("amount"));

  if (!productId || !customerName) return;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return;

  // Montant réellement encaissé (l'affilié peut l'ajuster ; défaut = prix produit).
  const amount = amountRaw > 0 ? Math.round(amountRaw) : product.price;

  const count = await prisma.sale.count();
  await prisma.sale.create({
    data: {
      reference: `VTE-${String(count + 1).padStart(4, "0")}`,
      productId,
      sellerId: user.id,
      customerName: `${customerName} [${channel}]`,
      customerPhone: customerPhone || null,
      customerEmail: customerEmail || null,
      amount,
      pricingType: product.pricingType,
      status: "PENDING",
      // Une vente déclarée = le client a payé au moins la 1re période. Indispensable
      // pour que la confirmation génère bien les commissions (y compris mensuel).
      monthsPaid: 1,
      proofNote: proofNote || null,
      proofUrl: proofUrl || null,
    },
  });

  const { logActivity } = await import("@/lib/activity");
  await logActivity({ userId: user.id, action: "SALE_DECLARED", detail: `Produit: ${product.name} — ${amount.toLocaleString("fr-FR")} FCFA` });

  // Prévenir les admins qu'une vente attend leur validation (cloche → /admin/ventes).
  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPERADMIN"] } },
    select: { id: true },
  });
  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        title: "🧾 Nouvelle vente à valider",
        body: `${user.firstName} ${user.lastName} a déclaré une vente « ${product.name} » (${amount.toLocaleString("fr-FR")} FCFA). À vérifier et confirmer.`,
        url: "/admin/ventes",
      })),
    });
  }

  revalidatePath("/espace/ventes");
  revalidatePath("/admin/ventes");
}

export async function requestPayout() {
  const user = await requireUser();

  if (user.verificationStatus !== "VERIFIED") {
    throw new Error("Compte non vérifié — retrait impossible.");
  }

  const [validated, existingPending] = await Promise.all([
    prisma.commission.findMany({
      where: { userId: user.id, status: "VALIDATED", payoutId: null },
    }),
    prisma.payout.findFirst({
      where: { userId: user.id, status: { in: ["PENDING", "PROCESSING"] } },
    }),
  ]);

  if (existingPending) {
    throw new Error("Une demande de retrait est déjà en cours.");
  }

  const totalValidated = validated.reduce((s, c) => s + c.amount, 0);
  if (totalValidated < (user.minPayout ?? 5000)) {
    throw new Error(`Montant insuffisant (${totalValidated.toLocaleString("fr-FR")} FCFA < seuil ${(user.minPayout ?? 5000).toLocaleString("fr-FR")} FCFA).`);
  }

  const payout = await prisma.payout.create({
    data: {
      userId: user.id,
      amount: totalValidated,
      method: user.payoutMethod,
      status: "PENDING",
    },
  });
  await prisma.commission.updateMany({
    where: { id: { in: validated.map((c) => c.id) } },
    data: { payoutId: payout.id },
  });

  // Notifier l'affilié + les admins
  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPERADMIN"] } },
    select: { id: true, email: true },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      title: "✅ Demande de retrait envoyée",
      body: `Votre demande de retrait de ${totalValidated.toLocaleString("fr-FR")} FCFA a bien été reçue. L'équipe IBIG la traitera dans les 24-48h.`,
      url: "/espace/paiements",
    },
  });

  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        title: "💸 Demande de retrait",
        body: `${user.firstName} ${user.lastName} (${user.code}) demande un retrait de ${totalValidated.toLocaleString("fr-FR")} FCFA via ${user.payoutMethod}.`,
        url: "/admin/paiements",
      })),
    });
  }

  after(async () => {
    await sendPayoutRequestedEmail({
      to: user.email,
      firstName: user.firstName,
      amount: totalValidated,
      method: user.payoutMethod,
    });
  });

  const { logActivity: _logPay } = await import("@/lib/activity");
  await _logPay({ userId: user.id, action: "PAYOUT_REQUESTED", detail: `${totalValidated.toLocaleString("fr-FR")} FCFA via ${user.payoutMethod}` });

  revalidatePath("/espace/paiements");
  revalidatePath("/admin/paiements");
}

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  await (prisma as any).user.update({
    where: { id: user.id },
    data: {
      phone: String(formData.get("phone") || user.phone).trim(),
      city: String(formData.get("city") || "").trim() || null,
      country: String(formData.get("country") || "").trim() || null,
      payoutMethod: String(formData.get("payoutMethod") || user.payoutMethod),
      payoutDetail: String(formData.get("payoutDetail") || "").trim() || null,
      bio: String(formData.get("bio") || "").trim() || null,
      photoUrl: String(formData.get("photoUrl") || "").trim() || null,
      website: String(formData.get("website") || "").trim() || null,
      publicListing: formData.get("publicListing") === "on",
    },
  });
  const { logActivity: _logProf } = await import("@/lib/activity");
  await _logProf({ userId: user.id, action: "PROFILE_UPDATE" });
  revalidatePath("/espace/profil");
}

export async function replyToOpportunity(formData: FormData) {
  const user = await requireUser();
  const opportunityId = String(formData.get("opportunityId"));
  const body = String(formData.get("body") || "").trim();
  if (!body) return;

  // Vérifier que l'opportunité appartient bien à cet utilisateur
  const opp = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    select: { id: true, title: true, userId: true },
  });
  if (!opp || opp.userId !== user.id) return;

  await (prisma as any).opportunityMessage.create({
    data: {
      opportunityId,
      fromAdmin: false,
      senderName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email,
      body,
    },
  });

  // Notifier les admins par email
  after(async () => {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { email: true, firstName: true },
    });
    for (const admin of admins) {
      await sendOpportunityMessageEmail({
        to: admin.email,
        firstName: admin.firstName ?? "Admin",
        opportunityTitle: opp.title,
        senderName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
        body,
        fromAdmin: false,
      });
    }
  });

  revalidatePath("/espace/opportunites");
}

// ─── Missions Partners ────────────────────────────────────────────────────────
export async function applyToMission(formData: FormData) {
  const user = await requireUser();
  const missionId = String(formData.get("missionId"));
  const note = String(formData.get("note") || "").trim();

  await (prisma as any).missionApplication.upsert({
    where: { missionId_userId: { missionId, userId: user.id } },
    update: { note, status: "PENDING", updatedAt: new Date() },
    create: { missionId, userId: user.id, note },
  });

  const { logActivity } = await import("@/lib/activity");
  await logActivity({ userId: user.id, action: "MISSION_APPLIED", detail: `Mission ID: ${missionId}` });

  revalidatePath("/espace/missions");
}

export async function withdrawMissionApplication(formData: FormData) {
  const user = await requireUser();
  const missionId = String(formData.get("missionId"));

  await (prisma as any).missionApplication.deleteMany({
    where: { missionId, userId: user.id, status: "PENDING" },
  });

  revalidatePath("/espace/missions");
}

export async function submitMissionProof(formData: FormData) {
  const user = await requireUser();
  const applicationId = String(formData.get("applicationId"));
  const proofUrl = String(formData.get("proofUrl") || "").trim();
  const proofNote = String(formData.get("proofNote") || "").trim();

  if (!proofNote && !proofUrl) return;

  const app = await (prisma as any).missionApplication.findFirst({
    where: { id: applicationId, userId: user.id, status: "ACCEPTED" },
  });
  if (!app) return;

  await (prisma as any).missionApplication.update({
    where: { id: applicationId },
    data: {
      status: "SUBMITTED",
      proofUrl: proofUrl || null,
      proofNote: proofNote || null,
      submittedAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const { logActivity: _logProof } = await import("@/lib/activity");
  await _logProof({ userId: user.id, action: "MISSION_PROOF_SUBMITTED", detail: `Candidature ID: ${applicationId}` });

  revalidatePath("/espace/missions");
}

// ─── Boutique CP ─────────────────────────────────────────────────────────────
export async function claimReward(formData: FormData) {
  const user = await requireUser();
  const rewardId = String(formData.get("rewardId"));

  const reward = await (prisma as any).reward.findFirst({
    where: { id: rewardId, active: true },
  });
  if (!reward) return;

  // Compute current CP balance
  const txs = await (prisma as any).pointTransaction.findMany({
    where: { userId: user.id },
    select: { points: true, type: true },
  });
  const balance = txs.reduce((sum: number, tx: any) => {
    if (["CREDIT", "BONUS"].includes(tx.type)) return sum + tx.points;
    if (["DEBIT", "CANCELLATION", "EXPIRATION"].includes(tx.type)) return sum - tx.points;
    return sum;
  }, 0);

  if (balance < reward.points) return; // insufficient CP

  // Check stock
  if (reward.stock !== -1) {
    const usedCount = await (prisma as any).rewardClaim.count({
      where: { rewardId, status: { in: ["PENDING", "APPROVED"] } },
    });
    if (usedCount >= reward.stock) return;
  }

  // Check no duplicate pending claim
  const existing = await (prisma as any).rewardClaim.findFirst({
    where: { userId: user.id, rewardId, status: "PENDING" },
  });
  if (existing) return;

  // Debit CP immediately on claim
  await (prisma as any).pointTransaction.create({
    data: {
      userId: user.id,
      points: reward.points,
      type: "DEBIT",
      reason: "REWARD_CLAIM",
      ref: rewardId,
      adminNote: `Demande boutique : ${reward.name}`,
    },
  });

  await (prisma as any).rewardClaim.create({
    data: { userId: user.id, rewardId, status: "PENDING" },
  });

  revalidatePath("/espace/boutique");
  revalidatePath("/espace/portefeuille");
}

// ─── Mon Marché ───────────────────────────────────────────────────────────────
export async function updateMarket(formData: FormData) {
  const user = await requireUser();

  const sectors = formData.getAll("sectors").map(String).filter(Boolean);
  const zone = String(formData.get("zone") || "").trim();
  const networkType = String(formData.get("networkType") || "MIXTE");
  const networkDescription = String(formData.get("networkDescription") || "").trim();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      marketSectors: sectors.join(",") || null,
      marketZone: zone || null,
      networkType,
      networkDescription: networkDescription || null,
    } as any,
  });

  revalidatePath("/espace/mon-marche");
  revalidatePath("/espace/produits");
  revalidatePath("/espace/missions");
}

// ─── IBIG CONNECT ─────────────────────────────────────────────────────────────
export async function submitConnectRequest(formData: FormData) {
  const user = await requireUser();

  const estimatedValue = Number(formData.get("estimatedValue") || 0);
  const connectionType = String(formData.get("connectionType") || "AUTRE");

  // Commission estimée : 2% de la valeur (indicatif)
  const COMMISSION_RATES: Record<string, number> = {
    FINANCEMENT: 0.015, PARTENARIAT: 0.02, RECRUTEMENT: 0.05,
    CLIENT: 0.03, FOURNISSEUR: 0.02, INVESTISSEMENT: 0.01,
    TRANSACTION_IMMOBILIERE: 0.05, AUTRE: 0.02,
  };
  const commissionEstimate = Math.round(estimatedValue * (COMMISSION_RATES[connectionType] ?? 0.02));

  await (prisma as any).connectRequest.create({
    data: {
      userId: user.id,
      title: String(formData.get("title")),
      connectionType,
      needSide: String(formData.get("needSide")),
      provideSide: String(formData.get("provideSide")),
      zone: String(formData.get("zone") || "Côte d'Ivoire"),
      estimatedValue,
      commissionEstimate,
      status: "NEW",
    },
  });

  const { logActivity: _logConn } = await import("@/lib/activity");
  await _logConn({ userId: user.id, action: "CONNECT_REQUEST", detail: `${connectionType} — ${estimatedValue.toLocaleString("fr-FR")} FCFA` });

  revalidatePath("/espace/connect");
}

// ─── BESOINS ──────────────────────────────────────────────────────────────────
export async function submitNeed(formData: FormData) {
  const user = await requireUser();
  const title       = String(formData.get("title") || "").trim();
  const category    = String(formData.get("category") || "AUTRE");
  const description = String(formData.get("description") || "").trim();
  const budget      = Number(formData.get("budget") || 0);
  const location    = String(formData.get("location") || "").trim();

  if (!title || !description) return;

  await (prisma as any).need.create({
    data: {
      userId: user.id,
      title,
      category,
      description,
      budget,
      location,
      status: "NEW",
      visibility: "PRIVATE",
    },
  });

  revalidatePath("/espace/besoins");
}

export async function respondToNeed(formData: FormData) {
  const user = await requireUser();
  const needId  = String(formData.get("needId") || "").trim();
  const message = String(formData.get("message") || "").trim();
  if (!needId) return;

  await (prisma as any).needResponse.upsert({
    where: { needId_userId: { needId, userId: user.id } },
    create: { needId, userId: user.id, message, status: "PENDING" },
    update: { message, updatedAt: new Date() },
  });

  revalidatePath("/espace/besoins");
}

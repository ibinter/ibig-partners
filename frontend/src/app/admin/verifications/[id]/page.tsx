import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
      <span className="col-span-2 text-sm text-slate-800 break-words">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
        <h3 className="font-semibold text-sm text-slate-800">{title}</h3>
      </div>
      <div className="px-5 py-3">{children}</div>
    </Card>
  );
}

async function approveKyc(formData: FormData) {
  "use server";
  await requireAdmin();
  const session = await getCurrentUser();
  const id = String(formData.get("id"));
  const userId = String(formData.get("userId"));

  await prisma.$transaction([
    prisma.verificationRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedBy: session?.id ?? null,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { approved: true, verificationStatus: "VERIFIED" },
    }),
    prisma.notification.create({
      data: {
        userId,
        title: "✅ Dossier KYC validé",
        body: "Votre dossier de vérification a été approuvé. Vous pouvez désormais percevoir vos commissions.",
      },
    }),
  ]);

  redirect("/admin/verifications");
}

async function rejectKyc(formData: FormData) {
  "use server";
  await requireAdmin();
  const session = await getCurrentUser();
  const id = String(formData.get("id"));
  const userId = String(formData.get("userId"));
  const reason = String(formData.get("reason") || "Dossier incomplet.");

  await prisma.$transaction([
    prisma.verificationRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewedBy: session?.id ?? null,
        reviewNote: reason,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { approved: false, verificationStatus: "REJECTED" },
    }),
    prisma.notification.create({
      data: {
        userId,
        title: "❌ Dossier KYC rejeté",
        body: `Votre dossier a été rejeté. Motif : ${reason}. Veuillez corriger et resoumettre depuis votre espace.`,
      },
    }),
  ]);

  redirect("/admin/verifications");
}

export default async function VerificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const req = await prisma.verificationRequest.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true, firstName: true, lastName: true, email: true,
          phone: true, code: true, partnerType: true, orgName: true,
          city: true, createdAt: true, status: true, approved: true,
        },
      },
    },
  });

  if (!req) notFound();

  const u = req.user;
  const isIndividual = req.type === "INDIVIDUAL";

  const STATUS_TONE: Record<string, "amber" | "green" | "red"> = {
    PENDING: "amber", APPROVED: "green", REJECTED: "red",
  };
  const STATUS_LABEL: Record<string, string> = {
    PENDING: "En attente", APPROVED: "Approuvé", REJECTED: "Rejeté",
  };

  return (
    <div className="space-y-5 pb-10">
      <Link href="/admin/verifications" className="text-xs text-slate-500 hover:text-blue-600">
        ← Retour aux vérifications
      </Link>

      <PageHeader
        title={`Dossier KYC — ${u.firstName} ${u.lastName}`}
        subtitle={`${u.code} · Soumis le ${formatDate(req.submittedAt)}`}
      />

      {/* Statut + actions */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Statut :</span>
            <Badge tone={STATUS_TONE[req.status] ?? "gray"}>
              {STATUS_LABEL[req.status] ?? req.status}
            </Badge>
          </div>

          {req.status === "PENDING" && (
            <div className="flex flex-wrap gap-3">
              <form action={approveKyc}>
                <input type="hidden" name="id" value={req.id} />
                <input type="hidden" name="userId" value={u.id} />
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  ✅ Valider le dossier
                </button>
              </form>

              <form action={rejectKyc} className="flex gap-2">
                <input type="hidden" name="id" value={req.id} />
                <input type="hidden" name="userId" value={u.id} />
                <input
                  type="text"
                  name="reason"
                  placeholder="Motif du rejet (obligatoire)"
                  required
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-56 focus:outline-none focus:border-rose-400"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition-colors shadow-sm"
                >
                  ❌ Rejeter
                </button>
              </form>
            </div>
          )}

          {req.status === "APPROVED" && (
            <span className="text-sm text-emerald-700 font-medium">
              ✅ Validé le {req.reviewedAt ? formatDate(req.reviewedAt) : "—"}
            </span>
          )}

          {req.status === "REJECTED" && (
            <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700">
              <span className="font-medium">❌ Rejeté</span>
              {req.reviewNote && <span className="ml-2">— Motif : {req.reviewNote}</span>}
            </div>
          )}
        </div>
      </Card>

      {/* Infos du compte */}
      <Section title="👤 Informations du compte">
        <Row label="Nom complet" value={`${u.firstName} ${u.lastName}`} />
        <Row label="Email" value={u.email} />
        <Row label="Téléphone" value={u.phone} />
        <Row label="Code affilié" value={u.code} />
        <Row label="Type" value={u.partnerType === "INDIVIDUAL" ? "Particulier" : "Organisation"} />
        {u.orgName && <Row label="Organisation" value={u.orgName} />}
        <Row label="Ville" value={u.city ?? undefined} />
        <Row label="Inscrit le" value={formatDate(u.createdAt)} />
      </Section>

      {/* KYC Particulier */}
      {isIndividual && (
        <>
          <Section title="📋 Identité">
            <Row label="Nom état civil" value={req.fullName ?? undefined} />
            <Row label="Type pièce ID" value={req.idType ?? undefined} />
            <Row label="N° pièce ID" value={req.idNumber ?? undefined} />
            <Row label="Profession" value={req.profession ?? undefined} />
            <Row label="Pays" value={req.country ?? undefined} />
            <Row label="Ville" value={req.city ?? undefined} />
            {!req.fullName && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-2">
                ⚠️ L&apos;affilié n&apos;a pas encore complété les détails de son dossier KYC dans son espace.
              </p>
            )}
          </Section>

          {req.cvText && (
            <Section title="📄 Curriculum Vitae / Parcours">
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{req.cvText}</p>
            </Section>
          )}

          <Section title="📞 Contacts">
            <Row label="WhatsApp" value={req.whatsapp ?? undefined} />
            <Row label="Second tél." value={req.secondPhone ?? undefined} />
            <Row label="Contact 1" value={req.contact1Name ? `${req.contact1Name} — ${req.contact1Phone ?? ""}` : undefined} />
            <Row label="Contact 2" value={req.contact2Name ? `${req.contact2Name} — ${req.contact2Phone ?? ""}` : undefined} />
          </Section>
        </>
      )}

      {/* KYC Entreprise / Organisation */}
      {!isIndividual && (
        <Section title="🏢 Entreprise / Organisation">
          <Row label="Dénomination" value={req.companyName ?? u.orgName ?? undefined} />
          <Row label="RCCM" value={req.rccm ?? undefined} />
          <Row label="NIF" value={req.nif ?? undefined} />
          <Row label="Compte contribuable" value={req.compteContrib ?? undefined} />
          <Row label="Représentant légal" value={req.legalRep ?? undefined} />
          <Row label="Titre" value={req.legalRepTitle ?? undefined} />
          <Row label="Pays siège" value={req.companyCountry ?? undefined} />
          <Row label="Ville siège" value={req.companyCity ?? undefined} />
          <Row label="Adresse" value={req.companyAddress ?? undefined} />
          <Row label="Email" value={req.companyEmail ?? undefined} />
          <Row label="WhatsApp" value={req.companyWhatsapp ?? undefined} />
          {!req.rccm && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-2">
              ⚠️ L&apos;affilié n&apos;a pas encore complété les détails de son dossier KYC dans son espace.
            </p>
          )}
        </Section>
      )}

      {/* Paiement */}
      {req.payoutMethod && (
        <Section title="💰 Coordonnées de paiement">
          <Row label="Méthode" value={req.payoutMethod ?? undefined} />
          <Row label="Mobile Money" value={req.mobileMoneyNum ?? undefined} />
          <Row label="PayPal" value={req.paypalEmail ?? undefined} />
          <Row label="Western Union" value={req.westernUnionName ?? undefined} />
          <Row label="Banque" value={req.bankName ?? undefined} />
          <Row label="IBAN" value={req.iban ?? undefined} />
          <Row label="SWIFT" value={req.swift ?? undefined} />
        </Section>
      )}
    </div>
  );
}

import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { approveVerification, rejectVerification } from "../actions";

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-2 border-b border-slate-50 last:border-0">
      <dt className="w-44 shrink-0 text-xs font-semibold text-slate-500 uppercase tracking-wide pt-0.5">
        {label}
      </dt>
      <dd className="text-sm text-slate-900">{value}</dd>
    </div>
  );
}

const PAYOUT_METHOD_LABELS: Record<string, string> = {
  ORANGE_MONEY: "Orange Money",
  WAVE: "Wave",
  MTN_MOMO: "MTN MoMo",
  BANK: "Virement bancaire",
  PAYPAL: "PayPal",
  WESTERN_UNION: "Western Union",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente",
  APPROVED: "Approuvé",
  REJECTED: "Rejeté",
};

const STATUS_TONE: Record<string, "amber" | "green" | "red"> = {
  PENDING: "amber",
  APPROVED: "green",
  REJECTED: "red",
};

export default async function VerificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const req = await (prisma as any).verificationRequest.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          code: true,
          phone: true,
        },
      },
    },
  });

  if (!req) notFound();

  const isIndividual = req.type === "INDIVIDUAL";

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Dossier KYC — ${req.user.firstName} ${req.user.lastName}`}
        subtitle={`Soumis le ${formatDate(req.submittedAt)} · ${req.user.email}`}
      />

      {/* Status badge */}
      <div className="flex items-center gap-3">
        <Badge tone={STATUS_TONE[req.status] ?? "gray"}>
          {STATUS_LABEL[req.status] ?? req.status}
        </Badge>
        <Badge tone={isIndividual ? "blue" : "gold"}>
          {isIndividual ? "Particulier" : "Entreprise"}
        </Badge>
        {req.reviewNote && (
          <span className="text-sm text-rose-600 font-medium">
            Note : {req.reviewNote}
          </span>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Identity / Company Info */}
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
            {isIndividual ? "Informations personnelles" : "Informations société"}
          </h2>
          <dl>
            {isIndividual ? (
              <>
                <Row label="Nom complet"   value={req.fullName} />
                <Row label="Type de pièce" value={req.idType} />
                <Row label="N° de pièce"   value={req.idNumber} />
                <Row label="Pays"          value={req.country} />
                <Row label="Ville"         value={req.city} />
                <Row label="Profession"    value={req.profession} />
                <Row label="WhatsApp"      value={req.whatsapp} />
                <Row label="Tél. 2"        value={req.secondPhone} />
              </>
            ) : (
              <>
                <Row label="Raison sociale"  value={req.companyName} />
                <Row label="RCCM"            value={req.rccm} />
                <Row label="NIF"             value={req.nif} />
                <Row label="Compte contrib." value={req.compteContrib} />
                <Row label="Représentant"    value={req.legalRep} />
                <Row label="Titre"           value={req.legalRepTitle} />
                <Row label="Pays"            value={req.companyCountry} />
                <Row label="Ville"           value={req.companyCity} />
                <Row label="Adresse"         value={req.companyAddress} />
                <Row label="Email société"   value={req.companyEmail} />
                <Row label="WhatsApp"        value={req.companyWhatsapp} />
                <Row label="Tél. 2"          value={req.companyPhone2} />
              </>
            )}
          </dl>
        </Card>

        {/* Additional info */}
        <div className="space-y-5">
          {isIndividual && req.cvText && (
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                CV / Présentation
              </h2>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {req.cvText}
              </p>
            </Card>
          )}

          {isIndividual && (req.contact1Name || req.contact2Name) && (
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                Contacts de référence
              </h2>
              <dl>
                <Row label="Contact 1"       value={req.contact1Name} />
                <Row label="Tél. contact 1"  value={req.contact1Phone} />
                <Row label="Contact 2"       value={req.contact2Name} />
                <Row label="Tél. contact 2"  value={req.contact2Phone} />
              </dl>
            </Card>
          )}

          {/* Payment info */}
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
              Paiement
            </h2>
            <dl>
              <Row
                label="Mode"
                value={PAYOUT_METHOD_LABELS[req.payoutMethod] ?? req.payoutMethod}
              />
              <Row label="N° Mobile Money"   value={req.mobileMoneyNum} />
              <Row label="Email PayPal"      value={req.paypalEmail} />
              <Row label="Nom Western Union" value={req.westernUnionName} />
              <Row label="RIB"               value={req.rib} />
              <Row label="Banque"            value={req.bankName} />
              <Row label="Pays banque"       value={req.bankCountry} />
              <Row label="SWIFT / BIC"       value={req.swift} />
              <Row label="IBAN"              value={req.iban} />
            </dl>
          </Card>
        </div>
      </div>

      {/* Actions */}
      {req.status === "PENDING" && (
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
            Décision
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Approve */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="mb-3 text-sm font-semibold text-emerald-800">
                ✅ Approuver le dossier
              </p>
              <p className="mb-3 text-xs text-emerald-700">
                Le partenaire sera marqué comme vérifié et son compte sera activé pour les paiements.
              </p>
              <form action={approveVerification}>
                <input type="hidden" name="id" value={req.id} />
                <input type="hidden" name="userId" value={req.userId} />
                <Button type="submit" className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0">
                  Approuver
                </Button>
              </form>
            </div>

            {/* Reject */}
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
              <p className="mb-3 text-sm font-semibold text-rose-800">
                ❌ Rejeter le dossier
              </p>
              <form action={rejectVerification} className="space-y-3">
                <input type="hidden" name="id" value={req.id} />
                <input type="hidden" name="userId" value={req.userId} />
                <label className="block">
                  <span className="block text-xs font-semibold text-rose-700 mb-1">
                    Motif du rejet (optionnel)
                  </span>
                  <textarea
                    name="reviewNote"
                    rows={3}
                    placeholder="Expliquez pourquoi le dossier est rejeté…"
                    className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm outline-none resize-none focus:border-rose-400 focus:ring-3 focus:ring-rose-100"
                  />
                </label>
                <Button type="submit" variant="danger">
                  Rejeter
                </Button>
              </form>
            </div>
          </div>
        </Card>
      )}

      {req.status !== "PENDING" && (
        <Card className="p-5">
          <p className="text-sm text-slate-500">
            Ce dossier a déjà été traité le{" "}
            {req.reviewedAt ? formatDate(req.reviewedAt) : "—"}.
            {req.reviewNote && (
              <span className="ml-1 font-medium text-slate-700">
                Note : {req.reviewNote}
              </span>
            )}
          </p>
        </Card>
      )}
    </div>
  );
}

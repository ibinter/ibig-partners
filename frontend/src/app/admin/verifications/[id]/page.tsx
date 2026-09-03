import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { requireAdmin, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type VerifReq = Awaited<ReturnType<typeof import("@/lib/prisma").prisma.verificationRequest.findUnique>>;

function computeKycScore(req: NonNullable<VerifReq>) {
  const items: { label: string; pts: number; earned: boolean }[] = [];
  const add = (label: string, pts: number, earned: boolean) => items.push({ label, pts, earned });

  if (req.type === "INDIVIDUAL") {
    add("Nom état civil", 8, !!req.fullName);
    add("Type + N° pièce ID", 10, !!(req.idType && req.idNumber));
    add("Pièce ID recto", 15, !!req.idDocUrl);
    add("Pièce ID verso", 7, !!req.idDocBack);
    add("WhatsApp", 10, !!req.whatsapp);
    add("Contact 1 (nom + tél)", 5, !!(req.contact1Name && req.contact1Phone));
    add("Contact 2 (nom + tél)", 5, !!(req.contact2Name && req.contact2Phone));
    add("CV / Parcours", 10, !!req.cvText || !!req.cvFileUrl);
    add("Profession", 5, !!req.profession);
    add("Pays + ville", 5, !!(req.country && req.city));
    add("Coordonnées de paiement", 20, !!req.payoutMethod);
  } else {
    add("Nom entreprise", 10, !!(req.companyName));
    add("RCCM", 15, !!req.rccm);
    add("NIF", 10, !!req.nif);
    add("Représentant légal", 5, !!req.legalRep);
    add("Email entreprise", 5, !!req.companyEmail);
    add("WhatsApp entreprise", 5, !!req.companyWhatsapp);
    add("Pays + ville siège", 10, !!(req.companyCountry && req.companyCity));
    add("Adresse siège", 5, !!req.companyAddress);
    add("Coordonnées de paiement", 20, !!req.payoutMethod);
    add("Docs justificatifs", 15, !!(req.idDocUrl));
  }

  const total = items.reduce((s, i) => s + i.pts, 0);
  const earned = items.reduce((s, i) => s + (i.earned ? i.pts : 0), 0);
  const score = Math.round((earned / total) * 100);
  return { score, items };
}

function KycScoreGauge({ req }: { req: NonNullable<VerifReq> }) {
  const { score, items } = computeKycScore(req);
  const color = score >= 80 ? "emerald" : score >= 50 ? "amber" : "rose";
  const colorMap = {
    emerald: { bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
    amber:   { bar: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50 border-amber-100" },
    rose:    { bar: "bg-rose-500",     text: "text-rose-700",     bg: "bg-rose-50 border-rose-100" },
  };
  const c = colorMap[color];
  return (
    <div className={`rounded-2xl border p-5 ${c.bg}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Score de confiance KYC</p>
          <p className={`text-3xl font-extrabold ${c.text} mt-0.5`}>{score} <span className="text-lg font-semibold">/ 100</span></p>
        </div>
        <span className="text-4xl">{score >= 80 ? "🟢" : score >= 50 ? "🟡" : "🔴"}</span>
      </div>
      <div className="h-3 w-full rounded-full bg-white/60 border border-white mb-4">
        <div className={`h-full rounded-full ${c.bar} transition-all`} style={{ width: `${score}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-[11px]">
            <span>{item.earned ? "✅" : "⬜"}</span>
            <span className={item.earned ? "text-slate-700" : "text-slate-400"}>{item.label}</span>
            <span className="ml-auto font-mono text-slate-400">{item.pts}pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
      <span className="col-span-2 text-sm text-slate-800 break-words">{value}</span>
    </div>
  );
}

function DocCard({ label, url }: { label: string; url: string }) {
  const isPdf = url.toLowerCase().includes(".pdf") || url.toLowerCase().includes("/pdf");
  const isImage = !isPdf;
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
      <div className="bg-slate-50 border-b border-slate-100 px-3 py-2">
        <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">{label}</p>
      </div>
      {isImage ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition-opacity">
          <div className="relative w-full h-48 bg-slate-100">
            <Image
              src={url}
              alt={label}
              fill
              className="object-contain p-2"
              unoptimized
            />
          </div>
          <div className="px-3 py-2 text-center">
            <span className="text-[11px] text-blue-600 font-medium">🔍 Voir en plein écran →</span>
          </div>
        </a>
      ) : (
        <div className="px-3 py-4 text-center space-y-2">
          <p className="text-2xl">📄</p>
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors">
            Ouvrir le document →
          </a>
        </div>
      )}
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
        body: `Votre dossier a été rejeté. Motif : ${reason}. Veuillez corriger et soumettre à nouveau depuis votre espace.`,
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

      {/* Score de confiance KYC */}
      <KycScoreGauge req={req} />

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

      {/* Pièces justificatives */}
      {(req.idDocUrl || req.idDocBack || req.cvFileUrl) && (
        <Section title="📎 Pièces justificatives">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-1">
            {req.idDocUrl && (
              <DocCard label="Pièce d'identité — Recto" url={req.idDocUrl} />
            )}
            {req.idDocBack && (
              <DocCard label="Pièce d'identité — Verso" url={req.idDocBack} />
            )}
            {req.cvFileUrl && (
              <DocCard label="CV / Document" url={req.cvFileUrl} />
            )}
          </div>
        </Section>
      )}
      {!(req.idDocUrl || req.idDocBack || req.cvFileUrl) && (
        <Section title="📎 Pièces justificatives">
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
            ⚠️ Aucun document n&apos;a encore été soumis par ce partenaire.
          </p>
        </Section>
      )}

      {/* Paiement */}
      {req.payoutMethod && (
        <Section title="💰 Coordonnées de paiement">
          <Row label="Méthode" value={req.payoutMethod ?? undefined} />
          {/* Mobile Money */}
          <Row label="Numéro Mobile Money" value={(req as any).mobileMoneyNum ?? undefined} />
          <Row label="Titulaire Mobile Money" value={(req as any).mobileMoneyOperator ?? undefined} />
          <Row label="Numéro CinetPay" value={(req as any).cinetpayPhone ?? undefined} />
          <Row label="Numéro KKiaPay" value={(req as any).kkiapayPhone ?? undefined} />
          <Row label="Numéro T-Money" value={(req as any).tmoneyPhone ?? undefined} />
          <Row label="Numéro Flooz" value={(req as any).floozPhone ?? undefined} />
          {/* Banque */}
          <Row label="Banque" value={req.bankName ?? undefined} />
          <Row label="Pays banque" value={req.bankCountry ?? undefined} />
          <Row label="N° de compte" value={(req as any).bankAccountNum ?? undefined} />
          <Row label="Agence / Branche" value={(req as any).bankBranch ?? undefined} />
          <Row label="RIB" value={req.rib ?? undefined} />
          <Row label="IBAN" value={req.iban ?? undefined} />
          <Row label="SWIFT/BIC" value={req.swift ?? undefined} />
          {/* Transfert international */}
          <Row label="Western Union" value={req.westernUnionName ?? undefined} />
          <Row label="MoneyGram" value={(req as any).moneyGramName ?? undefined} />
          <Row label="RIA" value={(req as any).riaName ?? undefined} />
          <Row label="Express Union" value={(req as any).expressUnionNum ?? undefined} />
          {/* Portefeuilles */}
          <Row label="PayPal" value={req.paypalEmail ?? undefined} />
          <Row label="Wise" value={(req as any).wiseEmail ?? undefined} />
          <Row label="Skrill" value={(req as any).skrillEmail ?? undefined} />
          {/* Crypto */}
          {(req as any).cryptoAddress && <>
            <Row label="Crypto" value={(req as any).cryptoCurrency ?? undefined} />
            <Row label="Réseau" value={(req as any).cryptoNetwork ?? undefined} />
            <Row label="Adresse wallet" value={(req as any).cryptoAddress ?? undefined} />
          </>}
          {/* Chèque */}
          <Row label="Chèque à l'ordre de" value={(req as any).chequePayable ?? undefined} />
          <Row label="Banque chèque" value={(req as any).chequeBank ?? undefined} />
        </Section>
      )}

      {/* Méthodes secondaires */}
      {((req as any).payoutMethod2 || (req as any).payoutMethod3) && (
        <Section title="💳 Méthodes de paiement secondaires">
          {(req as any).payoutMethod2 && (
            <div className="mb-3">
              <p className="text-xs font-bold text-slate-500 mb-1">🥈 Méthode secondaire 1 — {(req as any).payoutMethod2}</p>
              {(() => {
                try {
                  const d = JSON.parse((req as any).payoutDetails2 ?? "{}");
                  return Object.entries(d).map(([k, v]) => (
                    <Row key={k} label={k} value={String(v)} />
                  ));
                } catch { return null; }
              })()}
            </div>
          )}
          {(req as any).payoutMethod3 && (
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">🥉 Méthode secondaire 2 — {(req as any).payoutMethod3}</p>
              {(() => {
                try {
                  const d = JSON.parse((req as any).payoutDetails3 ?? "{}");
                  return Object.entries(d).map(([k, v]) => (
                    <Row key={k} label={k} value={String(v)} />
                  ));
                } catch { return null; }
              })()}
            </div>
          )}
        </Section>
      )}
    </div>
  );
}

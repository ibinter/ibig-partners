import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { VerificationForm } from "./VerificationForm";

export const dynamic = "force-dynamic";

export default async function VerificationPage() {
  const user = await requireUser();
  const status = user.verificationStatus ?? "NONE";

  const verif = status !== "NONE"
    ? await prisma.verificationRequest.findUnique({ where: { userId: user.id } })
    : null;

  return (
    <div className="space-y-5 pb-10">
      <PageHeader
        title="🔐 Vérification du compte"
        subtitle="Soumettez vos informations pour activer les paiements de commissions."
      />

      {status === "NONE" && (
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-violet-700 p-5 text-white shadow-md relative overflow-hidden">
          <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white/10" />
          <div className="relative">
            <p className="font-bold text-base mb-1">Pourquoi vérifier votre compte ?</p>
            <p className="text-sm text-blue-100 leading-relaxed">
              Sans vérification, vos commissions seront calculées mais <strong className="text-white">non versées</strong>.
              Une fois votre dossier validé par notre équipe, vous recevrez un email de confirmation
              et pourrez percevoir l&apos;intégralité de vos revenus.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                ["📋", "Remplir le formulaire"],
                ["🔍", "Examen en 48h"],
                ["✅", "Paiements activés"],
              ].map(([icon, label]) => (
                <div key={String(label)} className="rounded-xl bg-white/15 px-2 py-2">
                  <p className="text-lg">{icon}</p>
                  <p className="text-xs font-semibold mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {status === "SUBMITTED" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="font-semibold text-amber-800">⏳ Dossier en cours d&apos;examen</p>
          <p className="mt-0.5 text-sm text-amber-700">
            Votre dossier a été soumis le {verif?.submittedAt
              ? new Date(verif.submittedAt).toLocaleDateString("fr-FR")
              : "—"} et est en cours d&apos;examen. Vous serez notifié par email sous 48h.
          </p>
        </div>
      )}

      {status === "VERIFIED" && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <p className="font-semibold text-emerald-800">✅ Compte vérifié — Paiements activés</p>
          <p className="mt-0.5 text-sm text-emerald-700">
            Votre identité a été vérifiée avec succès. Vous recevrez vos commissions automatiquement
            selon votre configuration de paiement.
          </p>
        </div>
      )}

      {status === "REJECTED" && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4">
          <p className="font-semibold text-rose-800">❌ Dossier rejeté — Action requise</p>
          {verif?.reviewNote && (
            <p className="mt-2 rounded-xl bg-rose-100 px-3 py-2 text-sm text-rose-700">
              <span className="font-semibold">Motif :</span> {verif.reviewNote}
            </p>
          )}
          <p className="mt-2 text-sm text-rose-700">
            Veuillez corriger les informations ci-dessous et soumettre à nouveau votre dossier.
          </p>
        </div>
      )}

      {(status === "NONE" || status === "REJECTED") && (
        <VerificationForm initialType={verif?.type ?? "INDIVIDUAL"} existing={verif} />
      )}

      {status === "SUBMITTED" && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
          Votre dossier est en cours de traitement. Vous pouvez continuer à utiliser votre espace.
        </div>
      )}
    </div>
  );
}

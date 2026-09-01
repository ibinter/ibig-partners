import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { VerificationForm } from "./VerificationForm";

export const dynamic = "force-dynamic";

const STEPS = [
  { key: "submit",  icon: "📋", label: "Dossier soumis" },
  { key: "review",  icon: "🔍", label: "En examen" },
  { key: "done",    icon: "✅", label: "Paiements activés" },
];

function getStepIndex(status: string) {
  if (status === "NONE" || status === "REJECTED") return -1;
  if (status === "SUBMITTED") return 1;
  if (status === "VERIFIED")  return 2;
  return -1;
}

export default async function VerificationPage() {
  const user   = await requireUser();
  const status = user.verificationStatus ?? "NONE";

  const verif = status !== "NONE"
    ? await prisma.verificationRequest.findUnique({ where: { userId: user.id } })
    : null;

  const stepIndex = getStepIndex(status);

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Vérification du compte (KYC)"
        subtitle="Identifiez-vous pour activer le versement de vos commissions."
      />

      {/* ── Progression visuelle 3 étapes ── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-0">
          {STEPS.map((step, i) => {
            const done    = stepIndex >= i + 1;
            const current = !done && stepIndex === i;
            const pending = !done && !current;
            return (
              <div key={step.key} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center shrink-0">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold transition-all ${
                    done    ? "bg-emerald-500 text-white shadow" :
                    current ? "bg-blue-600 text-white shadow-md ring-4 ring-blue-100" :
                              "bg-slate-100 text-slate-400"
                  }`}>
                    {done ? "✓" : step.icon}
                  </div>
                  <p className={`mt-1.5 text-center text-[11px] font-semibold leading-tight max-w-[70px] ${
                    done    ? "text-emerald-700" :
                    current ? "text-blue-700" :
                              "text-slate-400"
                  }`}>{step.label}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded-full ${stepIndex >= i + 1 ? "bg-emerald-400" : "bg-slate-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Statut NONE : explication ── */}
      {status === "NONE" && (
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-violet-700 p-5 text-white shadow-md relative overflow-hidden">
          <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white/10" />
          <div className="relative">
            <p className="font-bold text-base mb-1">🔐 Pourquoi vérifier votre compte ?</p>
            <p className="text-sm text-blue-100 leading-relaxed">
              Sans vérification, vos commissions sont calculées mais{" "}
              <strong className="text-white">non versées</strong>. Une fois validé, vous pouvez demander
              un virement dès 5 000 FCFA de commissions accumulées.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[["📋", "Remplir le formulaire"], ["🔍", "Examen sous 48h"], ["💸", "Paiements débloqués"]].map(
                ([icon, label]) => (
                  <div key={String(label)} className="rounded-xl bg-white/15 px-2 py-2.5">
                    <p className="text-xl">{icon}</p>
                    <p className="text-xs font-semibold mt-0.5">{label}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Statut SUBMITTED ── */}
      {status === "SUBMITTED" && (
        <>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-3">
            <span className="text-2xl shrink-0">⏳</span>
            <div>
              <p className="font-semibold text-amber-800">Dossier en cours d&apos;examen</p>
              <p className="mt-0.5 text-sm text-amber-700">
                Soumis le{" "}
                {verif?.submittedAt
                  ? new Date(verif.submittedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
                  : "—"}
                . Vous serez notifié par email sous 48h ouvrables.
              </p>
            </div>
          </div>

          {/* Récapitulatif du dossier */}
          {verif && (
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
                <h3 className="font-semibold text-sm text-slate-800">Récapitulatif de votre dossier</h3>
              </div>
              <div className="p-5 grid gap-3 sm:grid-cols-2 text-sm">
                {[
                  { label: "Type de compte",    val: verif.type === "COMPANY" ? "Entreprise" : "Particulier" },
                  { label: "Nom / Raison sociale", val: verif.fullName ?? verif.companyName ?? "—" },
                  { label: "Pays",              val: verif.country ?? verif.companyCountry ?? "—" },
                  { label: "Ville",             val: verif.city ?? verif.companyCity ?? "—" },
                  { label: "WhatsApp",          val: verif.whatsapp ?? verif.companyWhatsapp ?? "—" },
                  { label: "Mode de paiement",  val: verif.payoutMethod?.replace("_", " ") ?? "—" },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                    <p className="text-slate-700 font-medium mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Vous pouvez continuer à utiliser votre espace et accumuler des commissions pendant le traitement.
            <br />
            <Link href="/espace/commissions" className="mt-2 inline-block text-blue-600 font-semibold hover:underline text-xs">
              Voir mes commissions →
            </Link>
          </div>
        </>
      )}

      {/* ── Statut VERIFIED ── */}
      {status === "VERIFIED" && (
        <>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 flex items-start gap-3">
            <span className="text-2xl shrink-0">✅</span>
            <div>
              <p className="font-semibold text-emerald-800">Compte vérifié — Paiements activés</p>
              <p className="mt-0.5 text-sm text-emerald-700">
                Votre identité a été vérifiée avec succès. Vous pouvez demander un virement dès que vos
                commissions dépassent 5 000 FCFA.
              </p>
            </div>
          </div>

          {/* Récapitulatif */}
          {verif && (
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="bg-emerald-50 border-b border-emerald-100 px-5 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-sm text-emerald-800">Dossier validé</h3>
                {verif.reviewedAt && (
                  <span className="text-xs text-emerald-600">
                    Validé le {new Date(verif.reviewedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                  </span>
                )}
              </div>
              <div className="p-5 grid gap-3 sm:grid-cols-2 text-sm">
                {[
                  { label: "Type de compte",    val: verif.type === "COMPANY" ? "Entreprise" : "Particulier" },
                  { label: "Nom / Raison sociale", val: verif.fullName ?? verif.companyName ?? "—" },
                  { label: "Pays",              val: verif.country ?? verif.companyCountry ?? "—" },
                  { label: "Ville",             val: verif.city ?? verif.companyCity ?? "—" },
                  { label: "Mode de paiement",  val: verif.payoutMethod?.replace("_", " ") ?? "—" },
                  { label: "Contact WhatsApp",  val: verif.whatsapp ?? verif.companyWhatsapp ?? "—" },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                    <p className="text-slate-700 font-medium mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/espace/paiements"
              className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 hover:bg-emerald-100 transition"
            >
              <span className="text-2xl">💸</span>
              <div>
                <p className="font-semibold text-emerald-800 text-sm">Demander un virement</p>
                <p className="text-xs text-emerald-600 mt-0.5">Seuil minimum : 5 000 FCFA</p>
              </div>
            </Link>
            <Link
              href="/espace/commissions"
              className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 hover:bg-blue-100 transition"
            >
              <span className="text-2xl">📊</span>
              <div>
                <p className="font-semibold text-blue-800 text-sm">Voir mes commissions</p>
                <p className="text-xs text-blue-600 mt-0.5">Toutes vos commissions en détail</p>
              </div>
            </Link>
          </div>
        </>
      )}

      {/* ── Statut REJECTED ── */}
      {status === "REJECTED" && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 flex items-start gap-3">
          <span className="text-2xl shrink-0">❌</span>
          <div className="flex-1">
            <p className="font-semibold text-rose-800">Dossier rejeté — Action requise</p>
            {verif?.reviewNote && (
              <div className="mt-2 rounded-xl bg-rose-100 border border-rose-200 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-rose-600 mb-1">Motif du rejet</p>
                <p className="text-sm text-rose-700">{verif.reviewNote}</p>
              </div>
            )}
            <p className="mt-2 text-sm text-rose-700">
              Corrigez les informations ci-dessous et soumettez à nouveau votre dossier.
            </p>
          </div>
        </div>
      )}

      {/* ── Formulaire (NONE ou REJECTED) ── */}
      {(status === "NONE" || status === "REJECTED") && (
        <VerificationForm initialType={verif?.type ?? "INDIVIDUAL"} existing={verif} />
      )}

      {/* ── FAQ rapide ── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-sm text-slate-800 mb-3">Questions fréquentes</h3>
        <div className="space-y-3">
          {[
            {
              q: "Quels documents dois-je préparer ?",
              a: "Votre CNI/Passeport, votre numéro Mobile Money (Orange Money, Wave ou MTN MoMo) ou vos coordonnées bancaires. Pour les entreprises : RCCM et NIF.",
            },
            {
              q: "Combien de temps dure la vérification ?",
              a: "Notre équipe examine les dossiers sous 48h ouvrables. Vous recevrez un email de confirmation ou de demande de correction.",
            },
            {
              q: "Mes commissions continuent d'être calculées pendant l'examen ?",
              a: "Oui. Toutes les commissions sont calculées en temps réel. Elles sont versées dès que votre compte est vérifié et que le seuil de 5 000 FCFA est atteint.",
            },
            {
              q: "Puis-je modifier mon dossier après soumission ?",
              a: "Pas directement. Si vous avez fait une erreur, contactez le support via /espace/support et notre équipe corrigera ou relancera le dossier.",
            },
          ].map((faq, i) => (
            <div key={i} className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-700">{faq.q}</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

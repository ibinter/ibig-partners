import { requireUser } from "@/lib/auth";
import { Button, Field, PageHeader } from "@/components/ui";
import { PAYOUT_METHODS, PAYOUT_METHOD_LABELS, STATUS_LABELS } from "@/lib/constants";
import { updateProfile } from "../actions";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const user = await requireUser();
  const initials = (user.firstName[0] ?? "") + (user.lastName[0] ?? "");

  return (
    <div className="space-y-5">
      <PageHeader title="Mon Profil" subtitle="Coordonnées et mode de paiement des commissions." />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Carte identité */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-5 text-white shadow-md relative overflow-hidden">
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10 blur-sm" />
          <div className="absolute -bottom-6 right-8 h-16 w-16 rounded-full bg-white/10" />

          <div className="relative">
            <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold text-white mb-4">
              {initials}
            </div>
            <p className="text-lg font-bold tracking-tight">{user.firstName} {user.lastName}</p>
            <p className="text-blue-200 text-sm mt-0.5">{user.email}</p>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
                <span className="text-xs text-blue-200">Code partenaire</span>
                <span className="text-xs font-bold font-mono text-white">{user.code}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
                <span className="text-xs text-blue-200">Statut</span>
                <span className="text-xs font-bold text-white">{STATUS_LABELS[user.status]}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
                <span className="text-xs text-blue-200">Validation</span>
                <span className={`text-xs font-bold ${user.approved ? "text-emerald-300" : "text-amber-300"}`}>
                  {user.approved ? "✅ Validé" : "⏳ En attente"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-ink text-sm">Modifier mes informations</h3>
            <p className="text-xs text-muted mt-0.5">Ces informations servent au versement de vos commissions.</p>
          </div>
          <form action={updateProfile} className="grid gap-4 sm:grid-cols-2">
            <Field label="Téléphone" name="phone" defaultValue={user.phone} />
            <Field label="Ville" name="city" defaultValue={user.city ?? ""} />
            <Field label="Mode de paiement" name="payoutMethod">
              <select
                name="payoutMethod"
                defaultValue={user.payoutMethod}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
              >
                {PAYOUT_METHODS.map((m) => (
                  <option key={m} value={m}>{PAYOUT_METHOD_LABELS[m]}</option>
                ))}
              </select>
            </Field>
            <Field label="N° Mobile Money / IBAN" name="payoutDetail" defaultValue={user.payoutDetail ?? ""} />
            <div className="sm:col-span-2 pt-1">
              <Button type="submit" className="w-full sm:w-auto">Enregistrer les modifications</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

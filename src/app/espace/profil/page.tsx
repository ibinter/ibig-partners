import { requireUser } from "@/lib/auth";
import { Button, Card, Field, PageHeader } from "@/components/ui";
import { PAYOUT_METHODS, PAYOUT_METHOD_LABELS, STATUS_LABELS } from "@/lib/constants";
import { updateProfile } from "../actions";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const user = await requireUser();

  return (
    <div>
      <PageHeader title="Mon Profil" subtitle="Coordonnées et mode de paiement des commissions." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <h2 className="font-semibold text-ink">Mon compte</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Nom</dt><dd className="font-medium">{user.firstName} {user.lastName}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Code partenaire</dt><dd className="font-mono">{user.code}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Email</dt><dd>{user.email}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Statut</dt><dd>{STATUS_LABELS[user.status]}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Validation</dt><dd>{user.approved ? "✅ Validé" : "⏳ En attente"}</dd></div>
          </dl>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="font-semibold text-ink">Modifier mes informations</h2>
          <form action={updateProfile} className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Téléphone" name="phone" defaultValue={user.phone} />
            <Field label="Ville" name="city" defaultValue={user.city ?? ""} />
            <Field label="Mode de paiement" name="payoutMethod">
              <select
                name="payoutMethod"
                defaultValue={user.payoutMethod}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                {PAYOUT_METHODS.map((m) => (
                  <option key={m} value={m}>{PAYOUT_METHOD_LABELS[m]}</option>
                ))}
              </select>
            </Field>
            <Field label="N° Mobile Money / IBAN" name="payoutDetail" defaultValue={user.payoutDetail ?? ""} />
            <div className="sm:col-span-2">
              <Button type="submit">Enregistrer</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

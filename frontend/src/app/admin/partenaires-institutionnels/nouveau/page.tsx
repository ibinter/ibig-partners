import { requireAdmin } from "@/lib/auth";
import { PageHeader, Button, Field } from "@/components/ui";
import { createInstitutionalPartner } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewInstitutionalPartnerPage() {
  await requireAdmin();
  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader title="Nouveau partenaire institutionnel" subtitle="Ce partenaire sera affiché sur la page publique /partenaires." />
      <PartnerForm />
    </div>
  );
}

function PartnerForm({ partner }: { partner?: any }) {
  const isEdit = !!partner;
  const action = isEdit ? undefined : createInstitutionalPartner;
  return (
    <div className="card-premium p-6">
      <form action={action} className="space-y-4">
        {isEdit && <input type="hidden" name="id" value={partner.id} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nom de l'institution *" name="name" defaultValue={partner?.name ?? ""} required />
          </div>

          <Field label="Catégorie">
            <select
              name="category"
              defaultValue={partner?.category ?? "OTHER"}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
            >
              <option value="BANK">Banque & Finance</option>
              <option value="NGO">ONG / Organisation</option>
              <option value="GOVERNMENT">Institution publique</option>
              <option value="COMPANY">Entreprise</option>
              <option value="UNIVERSITY">Université / École</option>
              <option value="OTHER">Autre</option>
            </select>
          </Field>

          <Field label="Ordre d'affichage" name="order" defaultValue={String(partner?.order ?? 0)} type="number" />

          <div className="sm:col-span-2">
            <Field label="URL du logo" name="logoUrl" defaultValue={partner?.logoUrl ?? ""} placeholder="https://..." />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description / Activités</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={partner?.description ?? ""}
              placeholder="Décrivez les activités ou la mission de cette institution…"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none resize-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
            />
          </div>

          <Field label="Site web" name="website" defaultValue={partner?.website ?? ""} placeholder="https://..." />
          <Field label="Email" name="email" defaultValue={partner?.email ?? ""} type="email" />
          <Field label="Téléphone 1" name="phone" defaultValue={partner?.phone ?? ""} />
          <Field label="Téléphone 2" name="phone2" defaultValue={partner?.phone2 ?? ""} />
          <Field label="Adresse" name="address" defaultValue={partner?.address ?? ""} />
          <Field label="Ville" name="city" defaultValue={partner?.city ?? ""} />
          <Field label="Pays" name="country" defaultValue={partner?.country ?? ""} />

          <div className="sm:col-span-2 flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="active"
              name="active"
              defaultChecked={partner?.active ?? true}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="active" className="text-sm font-medium text-ink cursor-pointer">
              Afficher sur la page publique (actif)
            </label>
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          <Button type="submit">{isEdit ? "Enregistrer" : "Créer le partenaire"}</Button>
          <a href="/admin/partenaires-institutionnels" className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Annuler
          </a>
        </div>
      </form>
    </div>
  );
}

export { PartnerForm };

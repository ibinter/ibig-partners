import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Button, Field } from "@/components/ui";
import { updateInstitutionalPartner, deleteInstitutionalPartner } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditInstitutionalPartnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const partner = await (prisma as any).institutionalPartner.findUnique({ where: { id } });
  if (!partner) notFound();

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader
        title={`Modifier — ${partner.name}`}
        subtitle="Modifications visibles immédiatement sur la page publique."
      />

      <div className="card-premium p-6">
        <form action={updateInstitutionalPartner} className="space-y-4">
          <input type="hidden" name="id" value={partner.id} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Nom de l'institution *" name="name" defaultValue={partner.name} required />
            </div>

            <Field label="Catégorie">
              <select
                name="category"
                defaultValue={partner.category}
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

            <Field label="Ordre d'affichage" name="order" defaultValue={String(partner.order)} type="number" />

            <div className="sm:col-span-2">
              <Field label="URL du logo" name="logoUrl" defaultValue={partner.logoUrl ?? ""} placeholder="https://..." />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description / Activités</label>
              <textarea
                name="description"
                rows={3}
                defaultValue={partner.description ?? ""}
                placeholder="Décrivez les activités ou la mission…"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none resize-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
              />
            </div>

            <Field label="Site web" name="website" defaultValue={partner.website ?? ""} placeholder="https://..." />
            <Field label="Email" name="email" defaultValue={partner.email ?? ""} type="email" />
            <Field label="Téléphone 1" name="phone" defaultValue={partner.phone ?? ""} />
            <Field label="Téléphone 2" name="phone2" defaultValue={partner.phone2 ?? ""} />
            <Field label="Adresse" name="address" defaultValue={partner.address ?? ""} />
            <Field label="Ville" name="city" defaultValue={partner.city ?? ""} />
            <Field label="Pays" name="country" defaultValue={partner.country ?? ""} />

            <div className="sm:col-span-2 flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                id="active"
                name="active"
                defaultChecked={partner.active}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="active" className="text-sm font-medium text-ink cursor-pointer">
                Afficher sur la page publique (actif)
              </label>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <Button type="submit">Enregistrer</Button>
            <a href="/admin/partenaires-institutionnels" className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Annuler
            </a>
          </div>
        </form>
      </div>

      {/* Zone de suppression */}
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
        <h3 className="font-semibold text-rose-800 text-sm mb-1">Zone dangereuse</h3>
        <p className="text-xs text-rose-700 mb-3">Cette action supprime définitivement ce partenaire de la base de données.</p>
        <form action={deleteInstitutionalPartner}>
          <input type="hidden" name="id" value={partner.id} />
          <Button type="submit" variant="danger">Supprimer définitivement</Button>
        </form>
      </div>
    </div>
  );
}

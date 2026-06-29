import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button, Card, PageHeader } from "@/components/ui";
import { updateSetting } from "../actions";

export const dynamic = "force-dynamic";

const SETTINGS_META: { key: string; label: string; description: string; type?: string }[] = [
  { key: "min_payout", label: "Montant minimum de virement (FCFA)", description: "En dessous de ce seuil, le paiement ne peut pas être déclenché.", type: "number" },
  { key: "cookie_tracking_days", label: "Durée du cookie d'affiliation (jours)", description: "Nombre de jours pendant lesquels un clic d'affiliation est attribué au partenaire.", type: "number" },
  { key: "platform_name", label: "Nom de la plateforme", description: "Nom affiché dans les e-mails et les communications." },
  { key: "support_email", label: "E-mail du support", description: "Adresse affichée aux partenaires pour les questions." },
  { key: "support_phone", label: "Téléphone du support", description: "Numéro WhatsApp ou téléphone affiché aux partenaires." },
  { key: "registration_open", label: "Inscription ouverte", description: "Mettre 'true' pour permettre les nouvelles inscriptions, 'false' pour fermer.", },
];

export default async function ParametresPage() {
  const admin = await requireAdmin();
  if (admin.role !== "SUPERADMIN") {
    return (
      <div>
        <PageHeader title="Paramètres" subtitle="Accès réservé au SuperAdmin." />
        <Card>
          <p className="text-muted">Vous n'avez pas les droits pour accéder à cette section.</p>
        </Card>
      </div>
    );
  }

  const settings = await prisma.setting.findMany();
  const valueOf = (key: string) => settings.find((s) => s.key === key)?.value ?? "";

  return (
    <div>
      <PageHeader
        title="Paramètres de la plateforme"
        subtitle="Configuration générale d'IBIG PARTNERS. SuperAdmin uniquement."
      />

      <div className="space-y-4">
        {SETTINGS_META.map((meta) => (
          <Card key={meta.key}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <p className="font-medium text-ink">{meta.label}</p>
                <p className="mt-0.5 text-sm text-muted">{meta.description}</p>
                <p className="mt-1 font-mono text-xs text-muted">Clé : {meta.key}</p>
              </div>
              <form action={updateSetting} className="flex items-center gap-2">
                <input type="hidden" name="key" value={meta.key} />
                <input
                  name="value"
                  type={meta.type ?? "text"}
                  defaultValue={valueOf(meta.key)}
                  placeholder="Valeur..."
                  className="w-48 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <Button type="submit" variant="secondary">Enregistrer</Button>
              </form>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-0">
        <h2 className="px-5 py-4 font-semibold text-ink">Tous les paramètres enregistrés</h2>
        {settings.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-muted">Aucun paramètre enregistré. Les valeurs par défaut du code sont utilisées.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-5 py-2">Clé</th>
                <th className="px-3 py-2">Valeur</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {settings.map((s) => (
                <tr key={s.key}>
                  <td className="px-5 py-2 font-mono text-xs text-muted">{s.key}</td>
                  <td className="px-3 py-2 font-medium text-ink">{s.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

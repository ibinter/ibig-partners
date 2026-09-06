import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { createCampaign, sendCampaign, deleteCampaign } from "./actions";

export const dynamic = "force-dynamic";

export default async function CampagnesPage() {
  await requireAdmin();
  const campaigns = await (prisma as any).campaign.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <PageHeader title="Campagnes marketing" subtitle="Envoyez des messages ciblés par email et/ou SMS à vos partenaires." />

      <Card>
        <h2 className="mb-4 font-semibold text-slate-800">Nouvelle campagne</h2>
        <form action={createCampaign} className="space-y-3">
          <input name="title" required placeholder="Objet / Titre" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <textarea name="body" required rows={4} placeholder="Corps du message. Utilisez {{firstName}} pour personnaliser."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <select name="channel" className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="EMAIL">Email uniquement</option>
              <option value="SMS">SMS uniquement</option>
              <option value="BOTH">Email + SMS</option>
            </select>
            <select name="targetLevel" className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="">Tous les niveaux</option>
              {["STARTER","SILVER","GOLD","MASTER","ELITE"].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <input name="targetSector" placeholder="Secteur cible (optionnel)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition">
            Créer la campagne
          </button>
        </form>
      </Card>

      <Card className="p-0">
        {campaigns.length === 0 ? (
          <p className="p-6 text-sm text-slate-400">Aucune campagne pour le moment.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500">
              <tr>
                {["Titre","Canal","Cible","Envoyé","Date","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {campaigns.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-xs truncate">{c.title}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.channel === "EMAIL" ? "bg-blue-100 text-blue-700" : c.channel === "SMS" ? "bg-green-100 text-green-700" : "bg-violet-100 text-violet-700"}`}>
                      {c.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{c.targetLevel || "Tous"}{c.targetSector ? ` · ${c.targetSector}` : ""}</td>
                  <td className="px-4 py-3">{c.sentAt ? `✅ ${c.sentCount} envois` : "—"}</td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {!c.sentAt && (
                        <form action={sendCampaign}>
                          <input type="hidden" name="id" value={c.id} />
                          <button type="submit" className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700">
                            📤 Envoyer
                          </button>
                        </form>
                      )}
                      <form action={deleteCampaign}>
                        <input type="hidden" name="id" value={c.id} />
                        <button type="submit" className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100">
                          Suppr.
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

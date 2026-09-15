import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { saveWebhookSettings } from "./actions";

export const dynamic = "force-dynamic";

export default async function WebhooksPage() {
  const user    = await requireUser();
  const partner = await (prisma as any).user.findUnique({
    where: { id: user.id },
    select: { webhookUrl: true, webhookSecret: true },
  });

  const webhookUrl    = partner?.webhookUrl    ?? "";
  const webhookSecret = partner?.webhookSecret ?? "";

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Webhook sortant"
        subtitle="Recevez une notification HTTP à chaque vente confirmée — intégrez avec Zapier, Make, votre CRM ou votre propre backend."
      />

      {/* Explications */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 space-y-2">
        <p className="text-sm font-semibold text-blue-900">Comment ça marche ?</p>
        <ol className="list-decimal list-inside text-xs text-blue-800 space-y-1">
          <li>Entrez l'URL de votre endpoint (Zapier, Make, votre serveur…)</li>
          <li>Générez un secret pour vérifier que les appels viennent bien d'IBIG</li>
          <li>À chaque vente confirmée, nous envoyons un <code className="bg-blue-100 px-1 rounded">POST</code> avec le détail de la commission</li>
        </ol>
        <p className="text-xs text-blue-700 mt-1">
          La requête inclut le header <code className="bg-blue-100 px-1 rounded">X-IBIG-Signature: sha256=...</code> — vérifiez-le avec votre secret.
        </p>
      </div>

      {/* Exemple de payload */}
      <details className="rounded-2xl border border-slate-200 bg-slate-50">
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-700">
          📦 Exemple de payload JSON
        </summary>
        <pre className="px-4 pb-4 text-[11px] text-slate-600 overflow-x-auto whitespace-pre">{JSON.stringify({
          event: "sale.confirmed",
          timestamp: new Date().toISOString(),
          data: {
            saleId: "cluxxxx",
            productName: "Scolaby",
            amount: 150000,
            commissionAmount: 30000,
            commissionRate: 0.20,
            customerName: "Koffi Mensah",
            confirmedAt: new Date().toISOString(),
          },
        }, null, 2)}</pre>
      </details>

      {/* Formulaire */}
      <form action={saveWebhookSettings} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">URL du webhook</label>
          <input
            name="webhookUrl"
            type="url"
            defaultValue={webhookUrl}
            placeholder="https://hooks.zapier.com/hooks/catch/..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {webhookSecret && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Secret actuel</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-600 truncate">
                {webhookSecret}
              </code>
              <button
                type="submit"
                name="action"
                value="regenerate"
                className="shrink-0 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
              >
                🔄 Régénérer
              </button>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">Copiez ce secret maintenant — il ne sera plus affiché en clair.</p>
          </div>
        )}

        <input type="hidden" name="webhookSecret" value={webhookSecret} />

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            name="action"
            value="save"
            className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
          >
            💾 Enregistrer
          </button>
          {!webhookSecret && (
            <button
              type="submit"
              name="action"
              value="regenerate"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              🔑 Générer un secret
            </button>
          )}
          {(webhookUrl || webhookSecret) && (
            <button
              type="submit"
              name="action"
              value="delete"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              🗑 Supprimer
            </button>
          )}
        </div>
      </form>

      {/* Statut */}
      {webhookUrl ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center gap-3">
          <span className="text-emerald-500 text-lg">✅</span>
          <div>
            <p className="text-xs font-semibold text-emerald-800">Webhook actif</p>
            <p className="text-[11px] text-emerald-700 truncate">{webhookUrl}</p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-3">
          <span className="text-slate-400 text-lg">⏸</span>
          <p className="text-xs text-slate-500">Aucun webhook configuré — les ventes confirmées ne seront pas transmises.</p>
        </div>
      )}
    </div>
  );
}

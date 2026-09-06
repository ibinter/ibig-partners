import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { createChallenge, toggleChallenge, deleteChallenge } from "./actions";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const METRIC_LABEL: Record<string, string> = {
  SALES_COUNT: "Nombre de ventes",
  COMMISSION_AMOUNT: "Montant commissions (FCFA)",
  PROSPECTS_CONVERTED: "Prospects convertis",
  REFERRALS: "Filleuls recrutés",
};

export default async function AdminChallengesPage() {
  await requireAdmin();

  const challenges = await prisma.challenge.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { progresses: true } } },
  });

  const completed = await prisma.challengeProgress.groupBy({
    by: ["challengeId"],
    where: { completed: true },
    _count: { id: true },
  });
  const compMap = new Map(completed.map((c) => [c.challengeId, c._count.id]));

  return (
    <div className="space-y-6">
      <PageHeader title="Challenges dynamiques" subtitle="Créez des défis motivants pour vos partenaires avec récompenses." />

      {/* Formulaire création */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 text-sm mb-4">Créer un challenge</h3>
        <form action={createChallenge} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Titre *</label>
            <input name="title" required placeholder="Ex: 5 ventes ce mois" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea name="description" rows={2} placeholder="Détails du challenge..." className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Métrique *</label>
            <select name="metric" required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
              {Object.entries(METRIC_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Objectif *</label>
            <input name="target" type="number" min="1" required placeholder="5" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Récompense (FCFA)</label>
            <input name="reward" type="number" min="0" defaultValue="0" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Début *</label>
              <input name="startAt" type="date" required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fin *</label>
              <input name="endAt" type="date" required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              Créer le challenge
            </button>
          </div>
        </form>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {challenges.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-8">Aucun challenge créé</p>
        )}
        {challenges.map((c) => {
          const done = compMap.get(c.id) ?? 0;
          const total = c._count.progresses;
          const now = new Date();
          const expired = now > c.endAt;
          return (
            <div key={c.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-800 text-sm">{c.title}</h4>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.active && !expired ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {expired ? "Expiré" : c.active ? "Actif" : "Inactif"}
                    </span>
                  </div>
                  {c.description && <p className="text-xs text-slate-500 mb-2">{c.description}</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>📊 {METRIC_LABEL[c.metric]} · objectif {c.target}</span>
                    <span>🎁 {c.reward > 0 ? `${c.reward.toLocaleString("fr-FR")} FCFA` : "Pas de récompense"}</span>
                    <span>📅 {formatDate(c.startAt)} → {formatDate(c.endAt)}</span>
                    <span>👥 {done}/{total} completé(s)</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <form action={toggleChallenge}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${c.active ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}>
                      {c.active ? "Désactiver" : "Activer"}
                    </button>
                  </form>
                  <form action={deleteChallenge}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className="rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors">
                      Supprimer
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

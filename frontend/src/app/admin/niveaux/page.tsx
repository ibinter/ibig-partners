import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function createLevel(fd: FormData) {
  "use server";
  await requireAdmin();
  await (prisma as any).partnerLevel.create({
    data: {
      name:   String(fd.get("name") || "").toUpperCase().replace(/\s+/g, "_"),
      label:  String(fd.get("label") || ""),
      minCp:  parseInt(String(fd.get("minCp") || "0")),
      color:  String(fd.get("color") || "#6366f1"),
      perks:  String(fd.get("perks") || ""),
      order:  parseInt(String(fd.get("order") || "0")),
    },
  });
  revalidatePath("/admin/niveaux");
}

async function updateLevel(fd: FormData) {
  "use server";
  await requireAdmin();
  await (prisma as any).partnerLevel.update({
    where: { id: String(fd.get("id")) },
    data: {
      label:  String(fd.get("label") || ""),
      minCp:  parseInt(String(fd.get("minCp") || "0")),
      color:  String(fd.get("color") || "#6366f1"),
      perks:  String(fd.get("perks") || ""),
      order:  parseInt(String(fd.get("order") || "0")),
      active: fd.get("active") === "1",
    },
  });
  revalidatePath("/admin/niveaux");
}

export default async function NiveauxAdminPage() {
  await requireAdmin();

  const levels = await (async () => {
    try { return await (prisma as any).partnerLevel.findMany({ orderBy: { minCp: "asc" } }); }
    catch { return []; }
  })();

  // Stats: count partners per level (based on total CP earned)
  const partnerStats: any[] = await (async () => {
    try {
      const txs = await (prisma as any).pointTransaction.groupBy({
        by: ["userId"],
        _sum: { points: true },
        where: { type: { in: ["CREDIT", "BONUS"] } },
      });
      return txs;
    } catch { return []; }
  })();

  const cpByUser: Record<string, number> = {};
  for (const tx of partnerStats) {
    cpByUser[tx.userId] = (tx._sum?.points ?? 0);
  }

  const countPerLevel = levels.map((lv: any, idx: number) => {
    const nextMin = levels[idx + 1]?.minCp ?? Infinity;
    const count = Object.values(cpByUser).filter((cp) => cp >= lv.minCp && cp < nextMin).length;
    return { ...lv, partnerCount: count };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Niveaux Partenaires"
        subtitle="Configurez les seuils et avantages des niveaux partenaires basés sur les CP gagnés."
      />

      {/* Création niveau */}
      <Card>
        <h2 className="mb-4 font-semibold text-slate-800">Nouveau niveau</h2>
        <form action={createLevel} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Identifiant (ex: PARTNER)</label>
              <input name="name" required placeholder="PARTNER" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono uppercase" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Label affiché</label>
              <input name="label" required placeholder="Business Partner" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">CP minimum</label>
              <input name="minCp" type="number" min="0" defaultValue="0" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Couleur (hex)</label>
              <input name="color" type="color" defaultValue="#6366f1" className="h-9 w-full rounded-lg border border-slate-200 px-1 py-1 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Ordre d'affichage</label>
              <input name="order" type="number" min="0" defaultValue="0" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Avantages (séparés par |)</label>
            <textarea name="perks" rows={2} placeholder="Accès catalogue élargi | Missions avancées | Badge exclusif" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none" />
          </div>
          <button type="submit" className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700">
            Créer le niveau
          </button>
        </form>
      </Card>

      {/* Liste des niveaux */}
      {levels.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center">
          <p className="text-slate-400 text-sm">Aucun niveau configuré.</p>
          <p className="text-slate-400 text-xs mt-1">Créez les 5 niveaux du cahier des charges : CONNECTEUR, PARTNER, BUSINESS_PARTNER, PREMIUM_PARTNER, ELITE_PARTNER.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {countPerLevel.map((lv: any) => (
            <div key={lv.id} className={`rounded-2xl border shadow-sm overflow-hidden ${lv.active ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-70"}`}>
              <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100">
                <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: lv.color }} />
                <div className="flex-1">
                  <span className="font-bold text-slate-800">{lv.label}</span>
                  <span className="ml-2 text-[10px] font-mono text-slate-400 uppercase">{lv.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-bold text-violet-700">{lv.minCp}+ CP</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-semibold">{lv.partnerCount} partenaire{lv.partnerCount !== 1 ? "s" : ""}</span>
                  {!lv.active && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Inactif</span>}
                </div>
              </div>
              {lv.perks && (
                <div className="px-5 py-2 text-xs text-slate-500">
                  {lv.perks.split("|").map((p: string, i: number) => (
                    <span key={i} className="inline-flex items-center gap-1 mr-3">
                      <span className="text-violet-400">✓</span> {p.trim()}
                    </span>
                  ))}
                </div>
              )}
              <form action={updateLevel} className="px-5 py-3 border-t border-slate-50 grid gap-3 sm:grid-cols-4 items-end">
                <input type="hidden" name="id" value={lv.id} />
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">Label</label>
                  <input name="label" defaultValue={lv.label} required className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">CP min</label>
                  <input name="minCp" type="number" defaultValue={lv.minCp} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">Couleur</label>
                  <input name="color" type="color" defaultValue={lv.color} className="h-9 w-full rounded-lg border border-slate-200 px-1 py-1" />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">Ordre</label>
                  <input name="order" type="number" defaultValue={lv.order} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">Avantages</label>
                  <input name="perks" defaultValue={lv.perks} placeholder="Avantage 1 | Avantage 2" className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
                </div>
                <div className="sm:col-span-4 flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                    <input type="checkbox" name="active" value="1" defaultChecked={lv.active} className="rounded" />
                    Actif
                  </label>
                  <button type="submit" className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-1.5 text-xs font-semibold text-white transition-colors">
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          ))}
        </div>
      )}

      {/* Suggestion d'initialisation */}
      {levels.length < 5 && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4">
          <p className="text-sm font-semibold text-amber-800 mb-1">Niveaux recommandés selon le cahier des charges</p>
          <div className="grid gap-1 text-xs text-amber-700 font-mono">
            <span>CONNECTEUR — 0 CP min</span>
            <span>PARTNER — 100 CP min</span>
            <span>BUSINESS_PARTNER — 500 CP min</span>
            <span>PREMIUM_PARTNER — 1500 CP min</span>
            <span>ELITE_PARTNER — 3000 CP min</span>
          </div>
        </div>
      )}
    </div>
  );
}

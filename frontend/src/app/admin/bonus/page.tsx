import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { revalidatePath } from "next/cache";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const BONUS_TYPES: Record<string, string> = {
  VOLUME: "Volume",
  CAMPAIGN: "Campagne",
  PERFORMANCE: "Performance",
  RECRUITMENT: "Recrutement",
  CONVERSION: "Conversion",
  TERRITORIAL: "Territorial",
  EVENT: "Événementiel",
  MANUAL: "Manuel",
};
const BONUS_TYPE_COLORS: Record<string, string> = {
  VOLUME: "bg-blue-100 text-blue-700",
  CAMPAIGN: "bg-purple-100 text-purple-700",
  PERFORMANCE: "bg-emerald-100 text-emerald-700",
  RECRUITMENT: "bg-orange-100 text-orange-700",
  CONVERSION: "bg-yellow-100 text-yellow-700",
  TERRITORIAL: "bg-teal-100 text-teal-700",
  EVENT: "bg-pink-100 text-pink-700",
  MANUAL: "bg-slate-100 text-slate-700",
};

async function createRule(fd: FormData) {
  "use server";
  await requireAdmin();
  await (prisma as any).bonusRule.create({
    data: {
      title: String(fd.get("title") || ""),
      type: String(fd.get("type") || "MANUAL"),
      description: String(fd.get("description") || "") || null,
      cpAmount: parseInt(String(fd.get("cpAmount") || "0")),
      cashAmount: parseInt(String(fd.get("cashAmount") || "0")),
      conditions: String(fd.get("conditions") || "") || null,
      startAt: fd.get("startAt") ? new Date(String(fd.get("startAt"))) : null,
      endAt: fd.get("endAt") ? new Date(String(fd.get("endAt"))) : null,
    },
  });
  revalidatePath("/admin/bonus");
}

async function updateRule(fd: FormData) {
  "use server";
  await requireAdmin();
  await (prisma as any).bonusRule.update({
    where: { id: String(fd.get("id")) },
    data: {
      title: String(fd.get("title") || ""),
      type: String(fd.get("type") || "MANUAL"),
      description: String(fd.get("description") || "") || null,
      cpAmount: parseInt(String(fd.get("cpAmount") || "0")),
      cashAmount: parseInt(String(fd.get("cashAmount") || "0")),
      conditions: String(fd.get("conditions") || "") || null,
      active: fd.get("active") === "1",
      startAt: fd.get("startAt") ? new Date(String(fd.get("startAt"))) : null,
      endAt: fd.get("endAt") ? new Date(String(fd.get("endAt"))) : null,
    },
  });
  revalidatePath("/admin/bonus");
}

async function attributeBonus(fd: FormData) {
  "use server";
  const admin = await requireAdmin();
  const userId = String(fd.get("userId") || "");
  const ruleId = String(fd.get("ruleId") || "") || null;
  const cpAmount = parseInt(String(fd.get("cpAmount") || "0"));
  const cashAmount = parseInt(String(fd.get("cashAmount") || "0"));
  const reason = String(fd.get("reason") || "Bonus manuel");
  const adminNote = String(fd.get("adminNote") || "") || null;

  if (!userId || (cpAmount === 0 && cashAmount === 0)) return;

  await (prisma as any).bonusTransaction.create({
    data: { userId, ruleId, cpAmount, cashAmount, reason, adminId: admin.id, adminNote },
  });

  if (cpAmount > 0) {
    await (prisma as any).pointTransaction.create({
      data: {
        userId,
        points: cpAmount,
        type: "BONUS",
        reason: "BONUS",
        ref: ruleId ?? undefined,
        adminNote: adminNote ?? `Bonus attribué : ${reason}`,
      },
    });
  }

  revalidatePath("/admin/bonus");
  revalidatePath("/espace/portefeuille");
}

export default async function BonusAdminPage() {
  await requireAdmin();

  const [rules, transactions, partners] = await Promise.all([
    (async () => {
      try { return await (prisma as any).bonusRule.findMany({ orderBy: { createdAt: "desc" } }); }
      catch { return []; }
    })(),
    (async () => {
      try {
        return await (prisma as any).bonusTransaction.findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            rule: { select: { title: true, type: true } },
          },
        });
      } catch { return []; }
    })(),
    (async () => {
      try {
        return await prisma.user.findMany({
          where: { role: "PARTNER" },
          select: { id: true, firstName: true, lastName: true, email: true },
          orderBy: { firstName: "asc" },
        });
      } catch { return []; }
    })(),
  ]);

  const totalCpDistributed = transactions.reduce((s: number, t: any) => s + (t.cpAmount ?? 0), 0);
  const totalCashDistributed = transactions.reduce((s: number, t: any) => s + (t.cashAmount ?? 0), 0);
  const activeRules = rules.filter((r: any) => r.active).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des Bonus"
        subtitle="Créez des règles bonus et attribuez-les manuellement aux partenaires."
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Règles actives", value: activeRules, icon: "⚡" },
          { label: "Règles totales", value: rules.length, icon: "📋" },
          { label: "CP distribués", value: `${totalCpDistributed} CP`, icon: "🪙" },
          { label: "Attributions (50 der.)", value: transactions.length, icon: "🎯" },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-2xl mb-1">{k.icon}</p>
            <p className="text-2xl font-extrabold text-slate-800">{k.value}</p>
            <p className="text-xs text-slate-500">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Création règle */}
        <Card>
          <h2 className="mb-4 font-semibold text-slate-800">Nouvelle règle bonus</h2>
          <form action={createRule} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Titre</label>
              <input name="title" required placeholder="Bonus volume Q3" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                <select name="type" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  {Object.entries(BONUS_TYPES).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">CP attribués</label>
                <input name="cpAmount" type="number" min="0" defaultValue="0" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Début</label>
                <input name="startAt" type="date" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Fin</label>
                <input name="endAt" type="date" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
              <textarea name="description" rows={2} placeholder="Décrivez les conditions de ce bonus" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Conditions</label>
              <input name="conditions" placeholder="ex: ≥ 5 ventes validées dans le mois" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <button type="submit" className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700">
              Créer la règle
            </button>
          </form>
        </Card>

        {/* Attribution manuelle */}
        <Card>
          <h2 className="mb-4 font-semibold text-slate-800">Attribution manuelle</h2>
          <form action={attributeBonus} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Partenaire</label>
              <select name="userId" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="">-- Sélectionner un partenaire --</option>
                {partners.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} — {p.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Règle bonus (optionnel)</label>
              <select name="ruleId" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="">-- Aucune règle (bonus libre) --</option>
                {rules.filter((r: any) => r.active).map((r: any) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.cpAmount} CP)
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">CP à attribuer</label>
                <input name="cpAmount" type="number" min="0" defaultValue="0" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Motif</label>
              <input name="reason" required placeholder="Bonus exceptionnel performance" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Note admin</label>
              <input name="adminNote" placeholder="Note interne visible uniquement par les admins" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <button type="submit" className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              Attribuer le bonus
            </button>
          </form>
        </Card>
      </div>

      {/* Liste des règles */}
      {rules.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Règles configurées</h2>
          <div className="space-y-3">
            {rules.map((r: any) => (
              <div key={r.id} className={`rounded-2xl border shadow-sm overflow-hidden ${r.active ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-70"}`}>
                <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BONUS_TYPE_COLORS[r.type] ?? "bg-slate-100 text-slate-600"}`}>
                    {BONUS_TYPES[r.type] ?? r.type}
                  </span>
                  <span className="font-semibold text-slate-800 flex-1">{r.title}</span>
                  <span className="text-sm font-bold text-violet-700">{r.cpAmount} CP</span>
                  {!r.active && <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Inactif</span>}
                </div>
                {r.description && (
                  <div className="px-5 py-2 text-xs text-slate-500">{r.description}</div>
                )}
                <form action={updateRule} className="px-5 py-3 border-t border-slate-50 grid gap-3 sm:grid-cols-4 items-end">
                  <input type="hidden" name="id" value={r.id} />
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">Titre</label>
                    <input name="title" defaultValue={r.title} required className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">Type</label>
                    <select name="type" defaultValue={r.type} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm">
                      {Object.entries(BONUS_TYPES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">CP</label>
                    <input name="cpAmount" type="number" defaultValue={r.cpAmount} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">Conditions</label>
                    <input name="conditions" defaultValue={r.conditions ?? ""} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
                  </div>
                  <div className="sm:col-span-4 flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input type="checkbox" name="active" value="1" defaultChecked={r.active} className="rounded" />
                      Actif
                    </label>
                    <button type="submit" className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-1.5 text-xs font-semibold text-white">
                      Enregistrer
                    </button>
                  </div>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historique attributions */}
      {transactions.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Historique des attributions (50 dernières)</h2>
          <div className="space-y-2">
            {transactions.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">
                    {t.user?.firstName} {t.user?.lastName}
                    <span className="ml-2 text-xs font-normal text-slate-400">{t.user?.email}</span>
                  </p>
                  <p className="text-xs text-slate-500">{t.reason}{t.rule ? ` — règle: ${t.rule.title}` : ""}</p>
                  {t.adminNote && <p className="text-xs text-slate-400 italic">{t.adminNote}</p>}
                </div>
                <div className="text-right shrink-0">
                  {t.cpAmount > 0 && <p className="text-sm font-bold text-violet-700">+{t.cpAmount} CP</p>}
                  {t.cashAmount > 0 && <p className="text-xs text-emerald-700">+{t.cashAmount} FCFA</p>}
                  <p className="text-[10px] text-slate-400">{formatDate(t.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

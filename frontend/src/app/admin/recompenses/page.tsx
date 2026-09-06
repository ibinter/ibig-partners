import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { revalidatePath } from "next/cache";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  FORMATION: "Formation", LOGICIEL: "Logiciel", AUDIT: "Audit",
  MARKETING: "Marketing", MISSION: "Mission premium", AUTRE: "Autre",
};
const CLAIM_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente", APPROVED: "Approuvée", REJECTED: "Refusée",
};
const CLAIM_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-600",
};

async function createReward(fd: FormData) {
  "use server";
  await requireAdmin();
  await (prisma as any).reward.create({
    data: {
      name:        String(fd.get("name") || ""),
      description: String(fd.get("description") || "") || null,
      points:      parseInt(String(fd.get("points") || "0")),
      stock:       fd.get("stock") ? parseInt(String(fd.get("stock"))) : -1,
      category:    String(fd.get("category") || "AUTRE"),
      validityDays:parseInt(String(fd.get("validityDays") || "30")),
      conditions:  String(fd.get("conditions") || "") || null,
      imageUrl:    String(fd.get("imageUrl") || "") || null,
    },
  });
  revalidatePath("/admin/recompenses");
}

async function updateReward(fd: FormData) {
  "use server";
  await requireAdmin();
  await (prisma as any).reward.update({
    where: { id: String(fd.get("id")) },
    data: {
      name:        String(fd.get("name") || ""),
      description: String(fd.get("description") || "") || null,
      points:      parseInt(String(fd.get("points") || "0")),
      stock:       fd.get("stock") !== "" ? parseInt(String(fd.get("stock"))) : -1,
      category:    String(fd.get("category") || "AUTRE"),
      validityDays:parseInt(String(fd.get("validityDays") || "30")),
      conditions:  String(fd.get("conditions") || "") || null,
      active:      fd.get("active") === "1",
    },
  });
  revalidatePath("/admin/recompenses");
}

async function processClaimAction(fd: FormData) {
  "use server";
  await requireAdmin();
  const status   = String(fd.get("action"));
  const adminNote = String(fd.get("adminNote") || "") || null;
  const claimId  = String(fd.get("id"));

  await (prisma as any).rewardClaim.update({
    where: { id: claimId },
    data: { status, adminNote, processedAt: new Date() },
  });

  // If rejecting: refund CP
  if (status === "REJECTED") {
    const claim = await (prisma as any).rewardClaim.findUnique({
      where: { id: claimId },
      include: { reward: { select: { points: true, name: true } } },
    });
    if (claim) {
      await (prisma as any).pointTransaction.create({
        data: {
          userId: claim.userId,
          points: claim.reward.points,
          type: "CREDIT",
          reason: "ADMIN",
          ref: claimId,
          adminNote: `Remboursement boutique refusée : ${claim.reward.name}`,
        },
      });
    }
  }

  revalidatePath("/admin/recompenses");
}

export default async function RecompensesAdminPage() {
  await requireAdmin();

  const [rewards, claims] = await Promise.all([
    (async () => { try { return await (prisma as any).reward.findMany({ orderBy: [{ category: "asc" }, { points: "asc" }] }); } catch { return []; } })(),
    (async () => {
      try {
        return await (prisma as any).rewardClaim.findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
          include: {
            user: { select: { firstName: true, lastName: true, code: true, email: true } },
            reward: { select: { name: true, points: true, category: true } },
          },
        });
      } catch { return []; }
    })(),
  ]);

  const pendingClaims = claims.filter((c: any) => c.status === "PENDING");
  const otherClaims   = claims.filter((c: any) => c.status !== "PENDING");

  const categories = Object.keys(CATEGORY_LABELS);
  const rewardsByCategory: Record<string, any[]> = {};
  for (const r of rewards) {
    const cat = r.category || "AUTRE";
    if (!rewardsByCategory[cat]) rewardsByCategory[cat] = [];
    rewardsByCategory[cat].push(r);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Boutique des avantages"
        subtitle="Gérez la boutique CP : création, modification, activation et demandes de rachat."
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Articles actifs", value: rewards.filter((r: any) => r.active).length, color: "emerald" },
          { label: "Articles inactifs", value: rewards.filter((r: any) => !r.active).length, color: "slate" },
          { label: "Demandes en attente", value: pendingClaims.length, color: "amber" },
          { label: "Total demandes", value: claims.length, color: "blue" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-2xl border p-4 ${color === "emerald" ? "bg-emerald-50 border-emerald-100" : color === "amber" ? "bg-amber-50 border-amber-100" : color === "blue" ? "bg-blue-50 border-blue-100" : "bg-white border-slate-100"}`}>
            <p className={`text-3xl font-extrabold ${color === "emerald" ? "text-emerald-700" : color === "amber" ? "text-amber-700" : color === "blue" ? "text-blue-700" : "text-slate-700"}`} style={{ fontVariantNumeric: "tabular-nums" }}>{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Création */}
      <Card>
        <h2 className="mb-4 font-semibold text-slate-800">Ajouter un article</h2>
        <form action={createReward} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nom de l'avantage *</label>
              <input name="name" required placeholder="ex: Réduction formation 30%" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Catégorie</label>
              <select name="category" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white">
                {categories.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea name="description" rows={2} placeholder="Description de l'avantage..." className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Prix en CP *</label>
              <input name="points" type="number" min="1" required placeholder="300" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Stock (-1 = illimité)</label>
              <input name="stock" type="number" min="-1" defaultValue="-1" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Validité (jours)</label>
              <input name="validityDays" type="number" min="1" defaultValue="30" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Conditions d'éligibilité</label>
            <input name="conditions" placeholder="ex: Réservé aux partenaires niveau PARTNER ou supérieur" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700">
            Créer l'article
          </button>
        </form>
      </Card>

      {/* Articles par catégorie */}
      {categories.filter(c => rewardsByCategory[c]?.length).map(cat => (
        <section key={cat}>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">{CATEGORY_LABELS[cat]}</h2>
          <div className="space-y-3">
            {rewardsByCategory[cat].map((r: any) => (
              <div key={r.id} className={`rounded-2xl border shadow-sm overflow-hidden ${r.active ? "border-violet-100 bg-white" : "border-slate-100 bg-slate-50 opacity-70"}`}>
                <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100">
                  <div className="flex-1">
                    <span className="font-bold text-slate-800">{r.name}</span>
                    {r.description && <span className="ml-2 text-xs text-slate-400">{r.description}</span>}
                  </div>
                  <div className="flex items-center gap-3 text-sm shrink-0">
                    <span className="font-bold text-violet-700">{r.points} CP</span>
                    <span className="text-xs text-slate-400">Stock: {r.stock === -1 ? "∞" : r.stock}</span>
                    {!r.active && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Inactif</span>}
                  </div>
                </div>
                <form action={updateReward} className="px-5 py-3 grid gap-3 sm:grid-cols-3 items-end">
                  <input type="hidden" name="id" value={r.id} />
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">Nom</label>
                    <input name="name" defaultValue={r.name} required className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">CP requis</label>
                    <input name="points" type="number" defaultValue={r.points} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">Stock</label>
                    <input name="stock" type="number" defaultValue={r.stock} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">Catégorie</label>
                    <select name="category" defaultValue={r.category} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm bg-white">
                      {categories.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">Validité (j)</label>
                    <input name="validityDays" type="number" defaultValue={r.validityDays} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">Description</label>
                    <input name="description" defaultValue={r.description || ""} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">Conditions</label>
                    <input name="conditions" defaultValue={r.conditions || ""} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
                  </div>
                  <div className="sm:col-span-3 flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input type="checkbox" name="active" value="1" defaultChecked={r.active} className="rounded" />
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
        </section>
      ))}

      {/* Demandes en attente */}
      {pendingClaims.length > 0 && (
        <Card>
          <h2 className="mb-4 font-semibold text-slate-800">Demandes en attente ({pendingClaims.length})</h2>
          <div className="space-y-3">
            {pendingClaims.map((c: any) => (
              <div key={c.id} className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-slate-800">{c.user?.firstName} {c.user?.lastName}
                      <span className="ml-1.5 text-xs font-mono text-slate-500">({c.user?.code})</span>
                    </p>
                    <p className="text-xs text-slate-500">{c.user?.email}</p>
                    <p className="text-sm font-medium text-violet-700 mt-1">🎁 {c.reward?.name} — {c.reward?.points} CP</p>
                    <p className="text-xs text-slate-400">{formatDate(c.createdAt)}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${CLAIM_STATUS_COLORS[c.status]}`}>
                    {CLAIM_STATUS_LABELS[c.status]}
                  </span>
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">Note admin (optionnel)</label>
                    <input form={`claim-form-approve-${c.id}`} name="adminNote" placeholder="Instructions de livraison..." className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
                  </div>
                  <form id={`claim-form-approve-${c.id}`} action={processClaimAction} className="flex gap-2">
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="action" value="APPROVED" />
                    <button type="submit" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white transition-colors">Approuver</button>
                  </form>
                  <form action={processClaimAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="action" value="REJECTED" />
                    <button type="submit" className="rounded-xl bg-rose-100 hover:bg-rose-200 px-4 py-1.5 text-xs font-semibold text-rose-700 transition-colors">Refuser + Rembourser</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Historique demandes */}
      {otherClaims.length > 0 && (
        <Card>
          <h2 className="mb-4 font-semibold text-slate-800">Historique des demandes</h2>
          <div className="space-y-2">
            {otherClaims.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {c.user?.firstName} {c.user?.lastName}
                    <span className="ml-1.5 text-xs font-mono text-slate-400">({c.user?.code})</span>
                  </p>
                  <p className="text-xs text-slate-500">🎁 {c.reward?.name} — {c.reward?.points} CP · {formatDate(c.createdAt)}</p>
                  {c.adminNote && <p className="text-xs text-slate-400 italic mt-0.5">{c.adminNote}</p>}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${CLAIM_STATUS_COLORS[c.status] ?? "bg-slate-100 text-slate-500"}`}>
                  {CLAIM_STATUS_LABELS[c.status] ?? c.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

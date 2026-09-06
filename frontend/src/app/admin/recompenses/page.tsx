import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { revalidatePath } from "next/cache";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

async function createReward(fd: FormData) {
  "use server";
  await requireAdmin();
  await (prisma as any).reward.create({
    data: {
      name: fd.get("name") as string,
      description: (fd.get("description") as string) || null,
      points: parseInt(fd.get("points") as string),
      stock: fd.get("stock") ? parseInt(fd.get("stock") as string) : -1,
    },
  });
  revalidatePath("/admin/recompenses");
}

async function toggleReward(fd: FormData) {
  "use server";
  await requireAdmin();
  const r = await (prisma as any).reward.findUnique({ where: { id: fd.get("id") as string } });
  await (prisma as any).reward.update({ where: { id: r.id }, data: { active: !r.active } });
  revalidatePath("/admin/recompenses");
}

async function processClaimAction(fd: FormData) {
  "use server";
  await requireAdmin();
  await (prisma as any).rewardClaim.update({
    where: { id: fd.get("id") as string },
    data: { status: fd.get("action") as string },
  });
  revalidatePath("/admin/recompenses");
}

export default async function RecompensesAdminPage() {
  await requireAdmin();
  const [rewards, claims] = await Promise.all([
    (prisma as any).reward.findMany({ orderBy: { points: "asc" } }),
    (prisma as any).rewardClaim.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { firstName: true, lastName: true, code: true } }, reward: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Récompenses" subtitle="Gérez la boutique de récompenses et les demandes de rachat." />

      <Card>
        <h2 className="mb-4 font-semibold text-slate-800">Nouvelle récompense</h2>
        <form action={createReward} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="name" required placeholder="Nom de la récompense" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input name="description" placeholder="Description (optionnel)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input name="points" type="number" min="1" required placeholder="Points requis" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input name="stock" type="number" min="-1" placeholder="Stock (-1 = illimité)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">Créer</button>
        </form>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        {rewards.map((r: any) => (
          <div key={r.id} className={`rounded-2xl border p-4 shadow-sm ${r.active ? "border-amber-100 bg-amber-50" : "border-slate-100 bg-white opacity-60"}`}>
            <p className="font-bold text-slate-800">🎁 {r.name}</p>
            {r.description && <p className="text-xs text-slate-500 mt-1">{r.description}</p>}
            <p className="mt-2 text-lg font-extrabold text-amber-600">{r.points} pts</p>
            <p className="text-xs text-slate-400">Stock : {r.stock === -1 ? "Illimité" : r.stock}</p>
            <form action={toggleReward} className="mt-2">
              <input type="hidden" name="id" value={r.id} />
              <button type="submit" className={`rounded-lg px-3 py-1 text-xs font-semibold ${r.active ? "bg-amber-200 text-amber-800" : "bg-emerald-100 text-emerald-700"}`}>
                {r.active ? "Désactiver" : "Activer"}
              </button>
            </form>
          </div>
        ))}
      </div>

      {claims.length > 0 && (
        <Card>
          <h2 className="mb-4 font-semibold text-slate-800">Demandes en attente ({claims.length})</h2>
          <div className="space-y-2">
            {claims.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{c.user.firstName} {c.user.lastName} ({c.user.code})</p>
                  <p className="text-xs text-slate-500">🎁 {c.reward.name} — {c.reward.points} pts · {formatDate(c.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  {["APPROVED","REJECTED"].map(action => (
                    <form key={action} action={processClaimAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="action" value={action} />
                      <button type="submit" className={`rounded-lg px-3 py-1 text-xs font-semibold ${action === "APPROVED" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"}`}>
                        {action === "APPROVED" ? "Approuver" : "Refuser"}
                      </button>
                    </form>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function upsertRate(fd: FormData) {
  "use server";
  const { requireAdmin } = await import("@/lib/auth");
  await requireAdmin();
  const code = fd.get("code") as string;
  const name = fd.get("name") as string;
  const rate = parseFloat(fd.get("rate") as string);
  if (!code || !name || isNaN(rate)) return;
  await (prisma as any).currencyRate.upsert({
    where: { code },
    update: { name, rateToFcfa: rate },
    create: { id: `cur_${code.toLowerCase()}`, code, name, rateToFcfa: rate },
  });
  revalidatePath("/admin/devises");
}

async function deleteRate(fd: FormData) {
  "use server";
  const { requireAdmin } = await import("@/lib/auth");
  await requireAdmin();
  await (prisma as any).currencyRate.delete({ where: { code: fd.get("code") as string } });
  revalidatePath("/admin/devises");
}

export default async function DevisesPage() {
  await requireAdmin();
  const rates = await (prisma as any).currencyRate.findMany({ orderBy: { code: "asc" } });

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Taux de change" subtitle="Gérez les taux de conversion depuis le FCFA." />

      {/* Tableau des taux */}
      <Card>
        <h2 className="font-semibold text-slate-800 mb-4">Taux actuels</h2>
        {rates.length === 0 ? (
          <p className="text-slate-400 text-sm">Aucun taux configuré.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="pb-2 text-slate-500 font-medium">Code</th>
                <th className="pb-2 text-slate-500 font-medium">Devise</th>
                <th className="pb-2 text-slate-500 font-medium text-right">1 unité = X FCFA</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {rates.map((r: any) => (
                <tr key={r.code} className="border-b border-slate-50 last:border-0">
                  <td className="py-2 font-bold text-slate-800">{r.code}</td>
                  <td className="py-2 text-slate-600">{r.name}</td>
                  <td className="py-2 text-right font-semibold text-emerald-700">{r.rateToFcfa.toLocaleString("fr-FR")}</td>
                  <td className="py-2 text-right">
                    <form action={deleteRate}>
                      <input type="hidden" name="code" value={r.code} />
                      <button type="submit" className="text-xs text-rose-500 hover:text-rose-700">Supprimer</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Ajouter / modifier */}
      <Card>
        <h2 className="font-semibold text-slate-800 mb-4">Ajouter / modifier un taux</h2>
        <form action={upsertRate} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Code ISO (ex: EUR)</label>
              <input name="code" maxLength={3} placeholder="EUR"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 outline-none uppercase" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Nom</label>
              <input name="name" placeholder="Euro"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">1 unité = X FCFA</label>
              <input name="rate" type="number" step="0.001" placeholder="655.957"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 outline-none" />
            </div>
          </div>
          <button type="submit"
            className="rounded-xl bg-amber-500 text-white px-5 py-2 text-sm font-semibold hover:bg-amber-600 transition-colors">
            Enregistrer
          </button>
        </form>
      </Card>

      {/* Info */}
      <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700">
        <strong>Note :</strong> Les partenaires peuvent choisir leur devise préférée dans leur profil. Les montants sont toujours stockés en FCFA et convertis à l'affichage selon le taux configuré ici.
      </div>
    </div>
  );
}

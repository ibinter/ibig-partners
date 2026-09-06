import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

async function adjustCp(fd: FormData) {
  "use server";
  const userId = fd.get("userId") as string;
  const points = parseInt(fd.get("points") as string, 10);
  const motif = fd.get("motif") as string;
  const author = fd.get("author") as string;
  if (!userId || isNaN(points) || !motif) throw new Error("Données manquantes");
  await (prisma as any).pointTransaction.create({
    data: {
      userId,
      points: Math.abs(points),
      type: points >= 0 ? "CREDIT" : "DEBIT",
      source: "AJUSTEMENT",
      description: `Ajustement admin — ${motif} (par ${author || "admin"})`,
    },
  });
}

export default async function CorrectionsCP() {
  const admin = await requireAdmin();

  const [partners, recentAdjustments] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PARTNER", approved: true },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true, code: true },
    }),
    (async () => {
      try {
        return await (prisma as any).pointTransaction.findMany({
          where: { source: "AJUSTEMENT" },
          orderBy: { createdAt: "desc" },
          take: 50,
          include: { user: { select: { firstName: true, lastName: true, code: true } } },
        });
      } catch { return []; }
    })(),
  ]);

  // Compute CP balance per partner
  const balances: Record<string, number> = {};
  try {
    const allTx = await (prisma as any).pointTransaction.findMany({
      select: { userId: true, points: true, type: true },
    });
    for (const tx of allTx) {
      if (!balances[tx.userId]) balances[tx.userId] = 0;
      if (["CREDIT", "BONUS"].includes(tx.type)) balances[tx.userId] += tx.points;
      else balances[tx.userId] -= Math.abs(tx.points);
    }
  } catch { /* ignore */ }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Corrections CP"
        subtitle="Ajustement manuel des Crédits PARTNERS avec traçabilité complète"
      />

      {/* Formulaire correction */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Nouvelle correction</h2>
        <form action={adjustCp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="hidden" name="author" value={`${admin.firstName} ${admin.lastName}`} />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Partenaire *</label>
            <select name="userId" required className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600">
              <option value="">Sélectionner un partenaire</option>
              {partners.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} ({p.code}) — solde: {balances[p.id] ?? 0} CP
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Points CP * <span className="text-gray-400">(+ crédit, - débit)</span>
            </label>
            <input
              type="number"
              name="points"
              required
              placeholder="+50 ou -30"
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motif * <span className="text-gray-400">(obligatoire pour traçabilité)</span></label>
            <input
              type="text"
              name="motif"
              required
              placeholder="Ex: Correction erreur mission #42"
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600"
            />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors">
              Appliquer la correction
            </button>
            <p className="mt-2 text-xs text-gray-500">La correction crée une transaction AJUSTEMENT traçable avec auteur, motif, date et référence. Elle ne peut pas être supprimée.</p>
          </div>
        </form>
      </div>

      {/* Historique des ajustements */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Historique des ajustements ({recentAdjustments.length})</h2>
        {recentAdjustments.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucun ajustement pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-gray-700 text-left text-gray-500">
                  <th className="pb-2 pr-4">Date</th>
                  <th className="pb-2 pr-4">Partenaire</th>
                  <th className="pb-2 pr-4">CP</th>
                  <th className="pb-2">Motif / Auteur</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {recentAdjustments.map((tx: any) => (
                  <tr key={tx.id} className="py-2">
                    <td className="py-2 pr-4 text-gray-500 whitespace-nowrap">{formatDate(tx.createdAt)}</td>
                    <td className="py-2 pr-4 font-medium">
                      {tx.user?.firstName} {tx.user?.lastName}
                      <span className="ml-1 text-gray-400 text-xs">({tx.user?.code})</span>
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`font-bold ${tx.type === "CREDIT" ? "text-green-600" : "text-red-600"}`}>
                        {tx.type === "CREDIT" ? "+" : "-"}{tx.points} CP
                      </span>
                    </td>
                    <td className="py-2 text-gray-600 dark:text-gray-400 text-xs max-w-xs truncate">{tx.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

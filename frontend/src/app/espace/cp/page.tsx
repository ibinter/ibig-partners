import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

const REASON_LABELS: Record<string, string> = {
  MISSION:      "Mission accomplie",
  WELCOME:      "Bonus de bienvenue",
  REFERRAL:     "Parrainage",
  BOOST:        "Boost commission dépensé",
  PURCHASE:     "Achat / Remise",
  ADJUSTMENT:   "Ajustement admin",
  MANUAL:       "Attribution manuelle",
};

export default async function EspaceCpPage() {
  const user = await requireUser();

  const transactions = await (prisma as any).pointTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Solde total
  const total = transactions.reduce(
    (acc: number, t: any) => acc + (t.points ?? 0),
    0
  );
  const balance = Math.max(0, total);

  // Stats
  const totalEarned = transactions
    .filter((t: any) => t.points > 0)
    .reduce((acc: number, t: any) => acc + t.points, 0);
  const totalSpent = transactions
    .filter((t: any) => t.points < 0)
    .reduce((acc: number, t: any) => acc + Math.abs(t.points), 0);

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Mes Credits Points (CP)"
        subtitle="Suivez vos gains, dépenses et avantages liés à vos CP."
      />

      {/* Bloc solde */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-5 text-white shadow-lg col-span-1">
          <p className="text-sm font-medium text-white/70 mb-1">Solde actuel</p>
          <p className="text-4xl font-extrabold tracking-tight">
            {balance.toLocaleString("fr-FR")}
          </p>
          <p className="text-sm font-semibold text-white/80 mt-1">CP</p>
          <p className="mt-3 text-xs text-white/60">
            Valeur estimée :{" "}
            <span className="font-bold text-white">
              {(balance * 10).toLocaleString("fr-FR")} FCFA
            </span>{" "}
            en remises
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 flex flex-col justify-center">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Total gagné</p>
          <p className="text-2xl font-extrabold text-emerald-700">
            +{totalEarned.toLocaleString("fr-FR")} CP
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            ≈ {(totalEarned * 10).toLocaleString("fr-FR")} FCFA de valeur cumulée
          </p>
        </div>

        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5 flex flex-col justify-center">
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-1">Total dépensé</p>
          <p className="text-2xl font-extrabold text-rose-700">
            -{totalSpent.toLocaleString("fr-FR")} CP
          </p>
          <p className="text-xs text-rose-600 mt-1">
            Boosts commission et remises utilisés
          </p>
        </div>
      </div>

      {/* Comment utiliser ses CP */}
      <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
        <h2 className="text-sm font-bold text-violet-800 mb-3">⚡ Comment utiliser vos CP</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl bg-white border border-violet-100 p-4">
            <p className="font-semibold text-violet-800 text-sm mb-1">💸 Remise sur produits IBIG</p>
            <p className="text-xs text-slate-600">
              1 CP = 10 FCFA de remise. Utilisez vos CP pour obtenir une réduction sur les abonnements et formations IBIG.
            </p>
          </div>
          <div className="rounded-xl bg-white border border-violet-100 p-4">
            <p className="font-semibold text-violet-800 text-sm mb-1">🚀 Boost de commission</p>
            <p className="text-xs text-slate-600">
              Dépensez 1 000 CP pour gagner +1% sur une vente (jusqu'à 5 000 CP = +5%).
              Disponible sur les missions CASH et MIXED depuis l'onglet{" "}
              <Link href="/espace/missions" className="underline text-violet-700">Missions</Link>.
            </p>
          </div>
        </div>
      </div>

      {/* Historique des transactions */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-3">Historique des transactions</h2>

        {transactions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <p className="text-4xl mb-3">⚡</p>
            <p className="font-semibold text-slate-700">Aucun CP pour le moment</p>
            <p className="text-sm text-slate-500 mt-1">
              Accomplissez des{" "}
              <Link href="/espace/missions" className="underline text-violet-700">missions partenaires</Link>{" "}
              pour gagner vos premiers CP.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Motif</th>
                    <th className="px-4 py-3 text-left hidden sm:table-cell">Détail</th>
                    <th className="px-4 py-3 text-right">Montant</th>
                    <th className="px-4 py-3 text-right hidden sm:table-cell">Solde</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(() => {
                    // Calculer le solde courant de bas en haut
                    let running = balance;
                    const rows: React.ReactNode[] = [];
                    // On trie du plus récent au plus ancien (déjà le cas)
                    for (let i = 0; i < transactions.length; i++) {
                      const t = transactions[i];
                      const rowBalance = running;
                      if (i > 0) running -= transactions[i - 1].points;
                      const isCredit = t.points > 0;
                      rows.push(
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                            {formatDate(t.createdAt)}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-700">
                            {REASON_LABELS[t.reason] ?? t.reason ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell max-w-xs truncate">
                            {t.adminNote ?? t.ref ?? "—"}
                          </td>
                          <td className={`px-4 py-3 text-right font-bold tabular-nums ${
                            isCredit ? "text-emerald-600" : "text-rose-600"
                          }`}>
                            {isCredit ? "+" : ""}{t.points.toLocaleString("fr-FR")} CP
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-slate-400 font-mono tabular-nums hidden sm:table-cell">
                            {rowBalance.toLocaleString("fr-FR")}
                          </td>
                        </tr>
                      );
                    }
                    return rows;
                  })()}
                </tbody>
              </table>
            </div>
            {transactions.length >= 100 && (
              <p className="px-4 py-3 text-xs text-slate-400 border-t border-slate-100 text-center">
                Affichage limité aux 100 dernières transactions.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

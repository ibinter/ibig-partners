import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { CATALOGUE_MISSIONS } from "./catalogue-data";

export const dynamic = "force-dynamic";

async function importMissions(fd: FormData) {
  "use server";
  const batchSize = parseInt(fd.get("batchSize") as string || "100", 10);
  const offset = parseInt(fd.get("offset") as string || "0", 10);
  const batch = CATALOGUE_MISSIONS.slice(offset, offset + batchSize);

  // Fetch existing titles to avoid duplicates
  const existing = await (async () => {
    try {
      const rows = await (prisma as any).mission.findMany({ select: { title: true } });
      return new Set(rows.map((r: any) => r.title as string));
    } catch { return new Set<string>(); }
  })();

  for (const m of batch) {
    if (existing.has(m.title)) continue;
    try {
      await (prisma as any).mission.create({
        data: {
          title: m.title,
          description: m.description,
          branch: m.branch,
          rewardType: m.rewardType,
          compensationAmount: m.compensationAmount,
          cpAmount: m.cpAmount,
          difficulty: m.difficulty,
          status: "ACTIVE",
          proofInstructions: "Transmettre une preuve vérifiable du résultat attendu (compte-rendu, confirmation client, bon de commande, etc.).",
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          slots: 10,
        },
      });
      existing.add(m.title);
    } catch { /* skip */ }
  }
}

export default async function ImportMissionsPage() {
  await requireAdmin();

  let currentCount = 0;
  try { currentCount = await (prisma as any).mission.count(); } catch { /* ignore */ }

  const byBranch: Record<string, number> = {};
  for (const m of CATALOGUE_MISSIONS) {
    byBranch[m.branch] = (byBranch[m.branch] || 0) + 1;
  }

  const total = CATALOGUE_MISSIONS.length;
  const progress = Math.min(100, Math.round((currentCount / total) * 100));

  const batches = [
    { label: "Lot 1 (1–100)",    offset: 0,    size: 100 },
    { label: "Lot 2 (101–200)",  offset: 100,  size: 100 },
    { label: "Lot 3 (201–300)",  offset: 200,  size: 100 },
    { label: "Lot 4 (301–400)",  offset: 300,  size: 100 },
    { label: "Lot 5 (401–500)",  offset: 400,  size: 100 },
    { label: "Lot 6 (501–600)",  offset: 500,  size: 100 },
    { label: "Lot 7 (601–700)",  offset: 600,  size: 100 },
    { label: "Lot 8 (701–800)",  offset: 700,  size: 100 },
    { label: "Lot 9 (801–900)",  offset: 800,  size: 100 },
    { label: "Lot 10 (901–1000)", offset: 900, size: 100 },
    { label: "Lot 11 (1001–1050)", offset: 1000, size: 50 },
    { label: "⚡ Tout importer (1050)", offset: 0, size: 1050 },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Import catalogue missions"
        subtitle={`Catalogue officiel IBIG PARTNERS — ${total} missions réelles (sans doublons)`}
      />

      {/* Progression */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Progression du catalogue</h2>
          <span className="text-2xl font-bold text-blue-600">{currentCount} / {total}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
          <div className="bg-blue-600 h-4 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-sm text-gray-500">{progress}% du catalogue importé</p>
      </div>

      {/* Import par lot */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-1">Import en masse</h2>
        <p className="text-sm text-gray-500 mb-4">
          {total} missions issues du fichier Excel officiel. Les doublons (même titre) sont détectés et ignorés.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {batches.map((batch) => (
            <form key={batch.label} action={importMissions}>
              <input type="hidden" name="batchSize" value={batch.size} />
              <input type="hidden" name="offset" value={batch.offset} />
              <button
                type="submit"
                className={`w-full px-3 py-2.5 text-white rounded-lg text-sm font-medium transition-colors ${
                  batch.offset === 0 && batch.size === 1050
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {batch.label}
              </button>
            </form>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Les doublons (même titre) sont ignorés. Importez par lots pour éviter les timeouts.</p>
      </div>

      {/* Répartition par branche */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Répartition par branche ({total} missions)</h2>
        <div className="space-y-2">
          {Object.entries(byBranch)
            .sort((a, b) => b[1] - a[1])
            .map(([branch, count]) => (
              <div key={branch} className="flex items-center gap-3">
                <div className="w-52 text-sm text-gray-700 dark:text-gray-300 truncate">{branch}</div>
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{ width: `${(count / Math.max(...Object.values(byBranch))) * 100}%` }}
                  />
                </div>
                <div className="text-sm font-medium w-10 text-right">{count}</div>
              </div>
            ))}
          <div className="border-t dark:border-gray-700 pt-2 flex items-center justify-between font-semibold text-sm">
            <span>TOTAL</span>
            <span className="text-blue-600">{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

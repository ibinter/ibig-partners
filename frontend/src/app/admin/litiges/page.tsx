import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

async function resolveDispute(fd: FormData) {
  "use server";
  const id = fd.get("id") as string;
  const resolution = fd.get("resolution") as string;
  const note = fd.get("note") as string;
  try {
    await (prisma as any).dispute.update({
      where: { id },
      data: { status: resolution, resolvedAt: new Date(), adminNote: note },
    });
  } catch { /* table may not exist */ }
}

async function createDispute(fd: FormData) {
  "use server";
  const userId = fd.get("userId") as string;
  const subject = fd.get("subject") as string;
  const description = fd.get("description") as string;
  const ref = fd.get("ref") as string;
  try {
    await (prisma as any).dispute.create({
      data: { userId, subject, description, referenceId: ref || null, status: "OPEN" },
    });
  } catch { /* ignore */ }
}

export default async function LitigesPage() {
  await requireAdmin();

  const [disputes, partners] = await Promise.all([
    (async () => {
      try {
        return await (prisma as any).dispute.findMany({
          orderBy: { createdAt: "desc" },
          take: 100,
          include: { user: { select: { firstName: true, lastName: true, code: true } } },
        });
      } catch { return []; }
    })(),
    prisma.user.findMany({
      where: { role: "PARTNER", approved: true },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true, code: true },
    }),
  ]);

  const open = disputes.filter((d: any) => d.status === "OPEN");
  const resolved = disputes.filter((d: any) => d.status !== "OPEN");

  const statusColor: Record<string, string> = {
    OPEN: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    RESOLVED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    REJECTED: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    IN_REVIEW: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gestion des litiges"
        subtitle="Traitement des contestations, erreurs signalées et demandes de révision"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Ouverts", value: open.length, color: "text-red-600" },
          { label: "Résolus", value: resolved.filter((d: any) => d.status === "RESOLVED").length, color: "text-green-600" },
          { label: "Rejetés", value: resolved.filter((d: any) => d.status === "REJECTED").length, color: "text-gray-500" },
          { label: "Total", value: disputes.length, color: "text-blue-600" },
        ].map((k) => (
          <div key={k.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className={`text-3xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-sm text-gray-500 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Ouvrir un litige */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Enregistrer un litige</h2>
        <form action={createDispute} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Partenaire *</label>
            <select name="userId" required className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600">
              <option value="">Sélectionner</option>
              {partners.map((p: any) => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Référence (mission/vente ID)</label>
            <input type="text" name="ref" placeholder="ID optionnel" className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sujet *</label>
            <input type="text" name="subject" required placeholder="Ex: CP non crédités après mission #45" className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
            <textarea name="description" required rows={2} placeholder="Détails du litige..." className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600" />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
              Enregistrer le litige
            </button>
          </div>
        </form>
      </div>

      {/* Litiges ouverts */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Litiges ouverts ({open.length})</h2>
        {open.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucun litige ouvert.</p>
        ) : (
          <div className="space-y-4">
            {open.map((d: any) => (
              <div key={d.id} className="border dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="font-medium">{d.subject}</div>
                    <div className="text-sm text-gray-500 mt-1">{d.user?.firstName} {d.user?.lastName} ({d.user?.code}) — {formatDate(d.createdAt)}</div>
                    {d.referenceId && <div className="text-xs text-gray-400">Réf: {d.referenceId}</div>}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{d.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor[d.status] || ""}`}>{d.status}</span>
                </div>
                <form action={resolveDispute} className="mt-4 flex gap-3 flex-wrap items-center">
                  <input type="hidden" name="id" value={d.id} />
                  <input type="text" name="note" placeholder="Note de résolution..." className="flex-1 min-w-40 border rounded px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:border-gray-600" />
                  <button type="submit" name="resolution" value="RESOLVED" className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm">Résoudre</button>
                  <button type="submit" name="resolution" value="IN_REVIEW" className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm">En révision</button>
                  <button type="submit" name="resolution" value="REJECTED" className="px-4 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm">Rejeter</button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historique */}
      {resolved.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Historique traités ({resolved.length})</h2>
          <div className="space-y-3">
            {resolved.slice(0, 20).map((d: any) => (
              <div key={d.id} className="flex items-center justify-between gap-4 py-2 border-b dark:border-gray-700 last:border-0">
                <div>
                  <span className="font-medium text-sm">{d.subject}</span>
                  <span className="text-gray-400 text-xs ml-2">{d.user?.firstName} {d.user?.lastName}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor[d.status] || ""}`}>{d.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

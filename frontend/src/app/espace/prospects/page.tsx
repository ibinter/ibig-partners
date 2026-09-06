import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { createProspect } from "./actions";
import KanbanClient from "./kanban-client";
import CsvImport from "./csv-import";

export const dynamic = "force-dynamic";

export default async function ProspectsPage() {
  const user = await requireUser();

  const prospects = await prisma.prospect.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, contact: true, status: true, priority: true, note: true },
  });

  const total     = prospects.length;
  const converted = prospects.filter((p) => p.status === "CONVERTED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title="Mes Prospects"
          subtitle={`${total} prospects · ${converted} convertis`}
        />
        <CsvImport />
      </div>

      {/* ── Nouveau prospect ── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 text-sm mb-4">➕ Ajouter un prospect</h3>
        <form action={createProspect} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nom *</label>
            <input
              name="name"
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Jean Dupont"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Téléphone / Email</label>
            <input
              name="contact"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+225 07 00 00 00"
            />
          </div>
          <div className="flex-[2] min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Note</label>
            <input
              name="note"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Client intéressé par Scolaby…"
            />
          </div>
          <SubmitButton variant="primary" size="sm" pendingLabel="Ajout…">
            ➕ Ajouter
          </SubmitButton>
        </form>
      </div>

      {/* ── Kanban ── */}
      {prospects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
          <p className="text-5xl mb-4">📇</p>
          <p className="text-sm font-semibold text-slate-500">Aucun prospect pour l'instant</p>
          <p className="text-xs text-slate-400 mt-1">Ajoutez votre premier prospect ci-dessus ou importez un CSV.</p>
        </div>
      ) : (
        <KanbanClient initialProspects={prospects} />
      )}
    </div>
  );
}

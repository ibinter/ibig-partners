import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PROSPECT_STATUS_LABELS } from "@/lib/constants";
import { addProspectNote, updateProspectStatus, deleteProspect } from "../../actions";

export const dynamic = "force-dynamic";

const NOTE_TYPE_LABEL: Record<string, string> = {
  NOTE:    "📝 Note",
  CALL:    "📞 Appel",
  EMAIL:   "✉️ Email",
  MEETING: "🤝 Réunion",
};

const STATUS_COLORS: Record<string, string> = {
  CONTACTED:  "bg-amber-100 text-amber-800",
  INTERESTED: "bg-blue-100 text-blue-800",
  DEMO:       "bg-blue-100 text-blue-800",
  QUOTE:      "bg-violet-100 text-violet-800",
  CONVERTED:  "bg-emerald-100 text-emerald-800",
  LOST:       "bg-red-100 text-red-600",
};

const NEXT_STATUS: Record<string, { status: string; label: string }> = {
  CONTACTED:  { status: "INTERESTED", label: "→ Intéressé" },
  INTERESTED: { status: "QUOTE",      label: "→ Devis" },
  DEMO:       { status: "QUOTE",      label: "→ Devis" },
  QUOTE:      { status: "CONVERTED",  label: "→ Converti" },
};

export default async function ProspectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const prospect = await (prisma as any).prospect.findUnique({
    where: { id },
    include: {
      notes: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!prospect || prospect.userId !== user.id) notFound();

  const statusLabel = PROSPECT_STATUS_LABELS[prospect.status] ?? prospect.status;
  const statusCls   = STATUS_COLORS[prospect.status] ?? "bg-slate-100 text-slate-700";
  const next        = NEXT_STATUS[prospect.status];

  const daysSince = Math.floor(
    (Date.now() - new Date(prospect.createdAt).getTime()) / (1000 * 60 * 60 * 24),
  );

  return (
    <div className="space-y-5 pb-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/espace/prospects" className="hover:text-slate-700 transition-colors">
          ← Mes Prospects
        </Link>
      </div>

      {/* Header prospect */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">{prospect.name}</h1>
            {prospect.contact && (
              <p className="text-sm text-slate-500 mt-1">{prospect.contact}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className={`inline-flex items-center rounded-xl px-3 py-1 text-xs font-bold ${statusCls}`}>
                {statusLabel}
              </span>
              {prospect.priority === "HIGH" && (
                <span className="inline-flex items-center rounded-xl px-2 py-1 text-xs font-bold bg-red-100 text-red-700">
                  🔴 Haute priorité
                </span>
              )}
              {prospect.priority === "LOW" && (
                <span className="inline-flex items-center rounded-xl px-2 py-1 text-xs font-bold bg-slate-100 text-slate-500">
                  🔵 Basse priorité
                </span>
              )}
              <span className="text-xs text-slate-400">Ajouté il y a {daysSince}j</span>
            </div>
          </div>

          {/* Actions statut */}
          <div className="flex flex-wrap items-center gap-2">
            {next && (
              <form action={updateProspectStatus}>
                <input type="hidden" name="id" value={prospect.id} />
                <input type="hidden" name="status" value={next.status} />
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition"
                >
                  {next.label}
                </button>
              </form>
            )}
            {prospect.status !== "LOST" && prospect.status !== "CONVERTED" && (
              <form action={updateProspectStatus}>
                <input type="hidden" name="id" value={prospect.id} />
                <input type="hidden" name="status" value="LOST" />
                <button
                  type="submit"
                  className="rounded-xl border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 px-4 py-2 text-sm font-semibold transition"
                >
                  Marquer Perdu
                </button>
              </form>
            )}
            <form action={deleteProspect}>
              <input type="hidden" name="id" value={prospect.id} />
              <button
                type="submit"
                className="rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 px-3 py-2 text-sm transition"
                title="Supprimer ce prospect"
              >
                🗑
              </button>
            </form>
          </div>
        </div>

        {prospect.note && (
          <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Note initiale</p>
            <p className="text-sm text-slate-700">{prospect.note}</p>
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Formulaire ajout note/échange */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Ajouter un échange</h2>
          <form action={addProspectNote} className="space-y-3">
            <input type="hidden" name="prospectId" value={prospect.id} />
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Type d&apos;échange</label>
              <select
                name="type"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              >
                <option value="NOTE">📝 Note</option>
                <option value="CALL">📞 Appel téléphonique</option>
                <option value="EMAIL">✉️ Email envoyé</option>
                <option value="MEETING">🤝 Réunion / Démo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Contenu</label>
              <textarea
                name="content"
                rows={4}
                placeholder="Résumé de l'échange, points importants, prochaines étapes…"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 text-white py-2.5 text-sm font-semibold hover:bg-blue-700 transition"
            >
              Enregistrer l&apos;échange
            </button>
          </form>
        </div>

        {/* Contact rapide */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Contact rapide</h2>
          {prospect.contact ? (
            <div className="space-y-3">
              {/^\+?[\d\s\-().]{7,}$/.test(prospect.contact) && (
                <>
                  <a
                    href={`https://wa.me/${prospect.contact.replace(/[^0-9+]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 transition"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-emerald-600 shrink-0" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp · {prospect.contact}
                  </a>
                  <a
                    href={`tel:${prospect.contact.replace(/[^0-9+]/g, "")}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    📞 Appeler · {prospect.contact}
                  </a>
                </>
              )}
              {prospect.contact.includes("@") && (
                <a
                  href={`mailto:${prospect.contact}`}
                  className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800 hover:bg-blue-100 transition"
                >
                  ✉️ Email · {prospect.contact}
                </a>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Aucun contact renseigné.</p>
          )}

          {/* Timeline du statut */}
          <div className="mt-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Pipeline</p>
            <div className="flex items-center gap-0">
              {["CONTACTED", "INTERESTED", "QUOTE", "CONVERTED"].map((s, i, arr) => {
                const isActive = prospect.status === s ||
                  (s === "INTERESTED" && prospect.status === "DEMO");
                const stageStatuses = ["CONTACTED", "INTERESTED", "DEMO", "QUOTE", "CONVERTED", "LOST"];
                const currentIdx = stageStatuses.indexOf(prospect.status);
                const thisIdx = stageStatuses.indexOf(s === "INTERESTED" ? "INTERESTED" : s);
                const isPast = currentIdx > thisIdx && prospect.status !== "LOST";
                return (
                  <div key={s} className="flex items-center flex-1 min-w-0">
                    <div className={`flex flex-col items-center flex-1 min-w-0`}>
                      <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${
                        isActive ? "bg-blue-600 border-blue-600" :
                        isPast   ? "bg-emerald-500 border-emerald-500" :
                                   "bg-white border-slate-300"
                      }`} />
                      <p className={`text-[9px] font-semibold mt-1 text-center leading-tight ${
                        isActive ? "text-blue-700" :
                        isPast   ? "text-emerald-700" :
                                   "text-slate-400"
                      }`}>
                        {PROSPECT_STATUS_LABELS[s]}
                      </p>
                    </div>
                    {i < arr.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-1 ${isPast ? "bg-emerald-400" : "bg-slate-200"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Historique des échanges */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50">
          <h2 className="text-sm font-semibold text-slate-800">
            Historique des échanges
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
              {prospect.notes.length}
            </span>
          </h2>
        </div>

        {prospect.notes.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-400">
            Aucun échange enregistré. Ajoutez votre premier échange ci-dessus.
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {prospect.notes.map((note: { id: string; type: string; content: string; createdAt: Date }) => (
              <div key={note.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-slate-600">
                        {NOTE_TYPE_LABEL[note.type] ?? "📝 Note"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                  </div>
                  <p className="text-[11px] text-slate-400 shrink-0">
                    {new Date(note.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

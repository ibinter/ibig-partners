import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { createEvent, toggleEvent, deleteEvent } from "./actions";

export const dynamic = "force-dynamic";

export default async function EvenementsAdminPage() {
  await requireAdmin();
  const events = await (prisma as any).ibigEvent.findMany({
    orderBy: { eventAt: "asc" },
    include: { _count: { select: { registrations: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Événements IBIG" subtitle="Gérez les webinaires et formations pour vos partenaires." />

      <Card>
        <h2 className="mb-4 font-semibold text-slate-800">Nouvel événement</h2>
        <form action={createEvent} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="title" required placeholder="Titre de l'événement" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input name="location" placeholder="Lieu ou lien Zoom/Meet" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <textarea name="description" rows={2} placeholder="Description" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Date et heure</label>
              <input name="eventAt" type="datetime-local" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Nb. places max (optionnel)</label>
              <input name="maxAttendees" type="number" min="1" placeholder="Illimité" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>
          <button type="submit" className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Créer l'événement
          </button>
        </form>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {events.map((ev: any) => {
          const d = new Date(ev.eventAt);
          const past = d < new Date();
          return (
            <div key={ev.id} className={`rounded-2xl border p-4 shadow-sm ${ev.active && !past ? "border-blue-100 bg-blue-50" : "border-slate-100 bg-white opacity-70"}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-800">{ev.title}</p>
                  {ev.description && <p className="text-xs text-slate-500 mt-0.5">{ev.description}</p>}
                  <p className="text-xs text-slate-500 mt-1">📅 {d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  {ev.location && <p className="text-xs text-slate-500">📍 {ev.location}</p>}
                  <p className="text-xs text-blue-600 mt-1 font-medium">
                    👥 {ev._count.registrations} inscrit{ev._count.registrations > 1 ? "s" : ""}
                    {ev.maxAttendees ? ` / ${ev.maxAttendees}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={toggleEvent}>
                    <input type="hidden" name="id" value={ev.id} />
                    <button type="submit" className={`rounded-lg px-2 py-1 text-xs font-semibold ${ev.active ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {ev.active ? "Désactiver" : "Activer"}
                    </button>
                  </form>
                  <form action={deleteEvent}>
                    <input type="hidden" name="id" value={ev.id} />
                    <button type="submit" className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600">Suppr.</button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
        {events.length === 0 && <p className="col-span-2 text-sm text-slate-400">Aucun événement créé.</p>}
      </div>
    </div>
  );
}

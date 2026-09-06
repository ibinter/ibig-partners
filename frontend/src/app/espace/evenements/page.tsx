import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function registerEvent(fd: FormData) {
  "use server";
  const { requireUser } = await import("@/lib/auth");
  const user = await requireUser();
  const eventId = fd.get("eventId") as string;
  try {
    await (prisma as any).eventRegistration.create({ data: { eventId, userId: user.id } });
  } catch { /* already registered */ }
  revalidatePath("/espace/evenements");
}

async function unregisterEvent(fd: FormData) {
  "use server";
  const { requireUser } = await import("@/lib/auth");
  const user = await requireUser();
  await (prisma as any).eventRegistration.deleteMany({
    where: { eventId: fd.get("eventId") as string, userId: user.id },
  });
  revalidatePath("/espace/evenements");
}

export default async function EvenementsPage() {
  const user = await requireUser();
  const now = new Date();

  const events = await (prisma as any).ibigEvent.findMany({
    where: { active: true },
    orderBy: { eventAt: "asc" },
    include: {
      _count: { select: { registrations: true } },
      registrations: { where: { userId: user.id }, select: { id: true } },
    },
  });

  const upcoming = events.filter((e: any) => new Date(e.eventAt) >= now);
  const past = events.filter((e: any) => new Date(e.eventAt) < now);

  return (
    <div className="space-y-6">
      <PageHeader title="Événements IBIG" subtitle="Inscrivez-vous aux webinaires et formations de l'équipe." />

      {upcoming.length === 0 && <Card><p className="text-sm text-slate-400">Aucun événement à venir pour le moment.</p></Card>}

      {upcoming.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {upcoming.map((ev: any) => {
            const registered = ev.registrations.length > 0;
            const full = ev.maxAttendees && ev._count.registrations >= ev.maxAttendees && !registered;
            const d = new Date(ev.eventAt);
            return (
              <div key={ev.id} className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
                <p className="font-bold text-slate-800">{ev.title}</p>
                {ev.description && <p className="text-xs text-slate-500 mt-1">{ev.description}</p>}
                <p className="text-xs text-slate-500 mt-2">📅 {d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                {ev.location && <p className="text-xs text-slate-500">📍 {ev.location}</p>}
                <p className="text-xs text-slate-500">👥 {ev._count.registrations} inscrit{ev._count.registrations > 1 ? "s" : ""}{ev.maxAttendees ? ` / ${ev.maxAttendees}` : ""}</p>
                <div className="mt-3">
                  {registered ? (
                    <form action={unregisterEvent}>
                      <input type="hidden" name="eventId" value={ev.id} />
                      <button type="submit" className="rounded-xl bg-rose-100 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-200">
                        ✓ Inscrit — Se désinscrire
                      </button>
                    </form>
                  ) : full ? (
                    <span className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500">Complet</span>
                  ) : (
                    <form action={registerEvent}>
                      <input type="hidden" name="eventId" value={ev.id} />
                      <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">
                        S'inscrire
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-500">Événements passés</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {past.map((ev: any) => (
              <div key={ev.id} className="rounded-2xl border border-slate-100 bg-white p-4 opacity-60">
                <p className="font-semibold text-slate-700 text-sm">{ev.title}</p>
                <p className="text-xs text-slate-400">{new Date(ev.eventAt).toLocaleDateString("fr-FR")}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

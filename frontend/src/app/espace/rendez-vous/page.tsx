/**
 * Feature 5 — Prise de RDV intégrée /espace/rendez-vous
 * Partenaires planifient leurs rendez-vous clients.
 */
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { createAppointment, updateAppointmentStatus } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  PENDING:   "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  DONE:      "bg-slate-100 text-slate-600",
  CANCELLED: "bg-rose-100 text-rose-700",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING:   "En attente",
  CONFIRMED: "Confirmé",
  DONE:      "Effectué",
  CANCELLED: "Annulé",
};

export default async function RendezVousPage() {
  const user = await requireUser();

  const appointments = await (prisma as any).appointment.findMany({
    where: { userId: user.id },
    orderBy: { scheduledAt: "asc" },
  });

  const now      = new Date();
  const upcoming = appointments.filter((a: any) => new Date(a.scheduledAt) >= now && a.status !== "CANCELLED");
  const past     = appointments.filter((a: any) => new Date(a.scheduledAt) < now || a.status === "DONE" || a.status === "CANCELLED");

  return (
    <div className="space-y-6">
      <PageHeader title="Mes rendez-vous" subtitle={`${upcoming.length} à venir · ${past.length} passé${past.length !== 1 ? "s" : ""}`} />

      {/* ── Nouveau RDV ── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 text-sm mb-4">📅 Planifier un nouveau rendez-vous</h3>
        <form action={createAppointment} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Titre *</label>
              <input name="title" required className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Appel découverte avec Jean D." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Date & heure *</label>
              <input name="scheduledAt" type="datetime-local" required className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nom du client</label>
              <input name="guestName" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jean Dupont" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Téléphone / Email client</label>
              <input name="guestContact" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+225 07 00 00 00 00" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Durée (minutes)</label>
              <select name="duration" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="15">15 min</option>
                <option value="30" selected>30 min</option>
                <option value="45">45 min</option>
                <option value="60">1 heure</option>
                <option value="90">1h30</option>
                <option value="120">2 heures</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Lien de réunion (optionnel)</label>
              <input name="meetUrl" type="url" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://meet.google.com/..." />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
            <textarea name="notes" rows={2} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Objectif du RDV, points à aborder..." />
          </div>
          <SubmitButton variant="primary" size="sm" pendingLabel="Planification…">
            📅 Planifier le rendez-vous
          </SubmitButton>
        </form>
      </div>

      {/* ── À venir ── */}
      {upcoming.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50">
            <h3 className="font-semibold text-slate-800 text-sm">À venir ({upcoming.length})</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {upcoming.map((a: any) => (
              <div key={a.id} className="px-5 py-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">📅</div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{a.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(a.scheduledAt).toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" })}
                      {a.duration && ` · ${a.duration} min`}
                    </p>
                    {a.guestName && <p className="text-xs text-slate-400">👤 {a.guestName}</p>}
                    {a.meetUrl && (
                      <a href={a.meetUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                        🔗 Rejoindre la réunion
                      </a>
                    )}
                    {a.notes && <p className="text-xs text-slate-400 mt-1 italic">{a.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[a.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {STATUS_LABEL[a.status] ?? a.status}
                  </span>
                  {a.status === "PENDING" && (
                    <form action={updateAppointmentStatus}>
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="status" value="CONFIRMED" />
                      <SubmitButton variant="success" size="sm" pendingLabel="…">✓ Confirmer</SubmitButton>
                    </form>
                  )}
                  <form action={updateAppointmentStatus}>
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="status" value="DONE" />
                    <SubmitButton variant="secondary" size="sm" pendingLabel="…">✓ Effectué</SubmitButton>
                  </form>
                  <form action={updateAppointmentStatus}>
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="status" value="CANCELLED" />
                    <SubmitButton variant="danger" size="sm" pendingLabel="…">Annuler</SubmitButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Passés ── */}
      {past.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50">
            <h3 className="font-semibold text-slate-800 text-sm text-slate-400">Historique ({past.length})</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {past.slice(0, 10).map((a: any) => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between gap-3 opacity-70">
                <div>
                  <p className="text-sm font-medium text-slate-700">{a.title}</p>
                  <p className="text-xs text-slate-400">{formatDate(a.scheduledAt)}{a.guestName ? ` · ${a.guestName}` : ""}</p>
                </div>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[a.status] ?? "bg-slate-100 text-slate-600"}`}>
                  {STATUS_LABEL[a.status] ?? a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {appointments.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
          <p className="text-5xl mb-4">📅</p>
          <p className="text-sm font-semibold text-slate-500">Aucun rendez-vous planifié</p>
          <p className="text-xs text-slate-400 mt-1">Planifiez votre premier rendez-vous client ci-dessus.</p>
        </div>
      )}
    </div>
  );
}

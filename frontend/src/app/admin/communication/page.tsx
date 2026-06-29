import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Button, Card, Field, PageHeader } from "@/components/ui";
import { sendAnnouncement } from "../actions";

export const dynamic = "force-dynamic";

export default async function CommunicationPage() {
  await requireAdmin();

  const [notifications, partners] = await Promise.all([
    prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { user: { select: { firstName: true, lastName: true } } },
    }),
    prisma.user.findMany({
      where: { role: "PARTNER", approved: true, active: true },
      select: { id: true, firstName: true, lastName: true, code: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  const globals = notifications.filter((n) => n.userId === null);
  const targeted = notifications.filter((n) => n.userId !== null);

  return (
    <div>
      <PageHeader
        title="Communication"
        subtitle="Envoyez des annonces globales ou des messages ciblés vers un partenaire spécifique."
      />

      <Card className="mb-6">
        <h2 className="font-semibold text-ink">Nouvelle annonce</h2>
        <form action={sendAnnouncement} className="mt-4 space-y-4">
          <Field label="Titre" name="title" required placeholder="Ex : Nouveaux produits disponibles !" />
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Message</label>
            <textarea
              name="body"
              required
              rows={4}
              placeholder="Rédigez votre message ici..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Audience</label>
              <select
                name="audience"
                id="audience-select"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="ALL">📢 Tous les partenaires actifs ({partners.length})</option>
                <option value="ONE">👤 Un partenaire spécifique</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Partenaire ciblé</label>
              <select
                name="targetId"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">— Sélectionner un partenaire —</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} ({p.code})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted">Requis si audience = &quot;Un partenaire spécifique&quot;</p>
            </div>
          </div>

          <Button type="submit">Envoyer</Button>
        </form>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-0">
          <h2 className="px-5 py-4 font-semibold text-ink">
            Annonces globales récentes
            <span className="ml-2 text-xs font-normal text-muted">({globals.length})</span>
          </h2>
          {globals.length === 0 ? (
            <p className="px-5 pb-5 text-sm text-muted">Aucune annonce globale.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {globals.map((n) => (
                <li key={n.id} className="px-5 py-3">
                  <p className="font-medium text-ink">{n.title}</p>
                  <p className="mt-0.5 text-sm text-muted line-clamp-2">{n.body}</p>
                  <p className="mt-1 text-xs text-muted">{formatDate(n.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-0">
          <h2 className="px-5 py-4 font-semibold text-ink">
            Messages ciblés récents
            <span className="ml-2 text-xs font-normal text-muted">({targeted.length})</span>
          </h2>
          {targeted.length === 0 ? (
            <p className="px-5 pb-5 text-sm text-muted">Aucun message ciblé.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {targeted.map((n) => (
                <li key={n.id} className="px-5 py-3">
                  <p className="font-medium text-ink">{n.title}</p>
                  {n.user && (
                    <p className="text-xs font-medium text-brand-600">
                      → {n.user.firstName} {n.user.lastName}
                    </p>
                  )}
                  <p className="mt-0.5 text-sm text-muted line-clamp-2">{n.body}</p>
                  <p className="mt-1 text-xs text-muted">{formatDate(n.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

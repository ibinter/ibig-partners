import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Card, PageHeader } from "@/components/ui";
import { sendAnnouncement } from "../actions";
import { AnnonceForm } from "./annonce-form";

export const revalidate = 30;

function parseBody(body: string): { text: string; imageUrl?: string } {
  try {
    const parsed = JSON.parse(body);
    if (parsed && typeof parsed.t === "string") {
      return { text: parsed.t, imageUrl: parsed.i ?? undefined };
    }
  } catch { /* plain text */ }
  return { text: body };
}

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
        <AnnonceForm action={sendAnnouncement} partners={partners} />
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
              {globals.map((n) => {
                const parsed = parseBody(n.body);
                return (
                  <li key={n.id} className="px-5 py-3">
                    <p className="font-medium text-ink">{n.title}</p>
                    {parsed.imageUrl && (
                      <img
                        src={parsed.imageUrl}
                        alt=""
                        className="mt-1.5 h-24 w-full rounded-lg object-cover border border-slate-100"
                      />
                    )}
                    <p className="mt-0.5 text-sm text-muted line-clamp-2">{parsed.text}</p>
                    <p className="mt-1 text-xs text-muted">{formatDate(n.createdAt)}</p>
                  </li>
                );
              })}
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
              {targeted.map((n) => {
                const parsed = parseBody(n.body);
                return (
                  <li key={n.id} className="px-5 py-3">
                    <p className="font-medium text-ink">{n.title}</p>
                    {n.user && (
                      <p className="text-xs font-medium text-brand-600">
                        → {n.user.firstName} {n.user.lastName}
                      </p>
                    )}
                    {parsed.imageUrl && (
                      <img
                        src={parsed.imageUrl}
                        alt=""
                        className="mt-1.5 h-20 w-full rounded-lg object-cover border border-slate-100"
                      />
                    )}
                    <p className="mt-0.5 text-sm text-muted line-clamp-2">{parsed.text}</p>
                    <p className="mt-1 text-xs text-muted">{formatDate(n.createdAt)}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

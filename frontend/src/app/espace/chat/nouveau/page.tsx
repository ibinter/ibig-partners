import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, PageHeader } from "@/components/ui";
import { STATUS_LABELS } from "@/lib/constants";
import { StartConversationButton } from "./StartConversationButton";

export const dynamic = "force-dynamic";

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

export default async function NouvelleConversationPage() {
  const user = await requireUser();

  const isAdmin = user.role === "ADMIN" || user.role === "SUPERADMIN";
  const filleulCount = isAdmin ? 1 : await prisma.user.count({ where: { sponsorId: user.id } });

  if (filleulCount === 0) {
    return (
      <div>
        <PageHeader title="Nouvelle conversation" subtitle="Disponible dès votre premier filleul" />
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-8 text-center">
          <p className="text-4xl mb-4">💬</p>
          <p className="text-sm text-muted">
            Recrutez votre premier affilié pour débloquer la messagerie.
          </p>
          <Link href="/espace/chat" className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline">
            ← Retour
          </Link>
        </div>
      </div>
    );
  }

  // Admins voient tous les affiliés, les autres voient leurs filleuls directs
  const filleuls = await prisma.user.findMany({
    where: isAdmin
      ? { active: true, id: { not: user.id } }
      : { sponsorId: user.id, active: true },
    orderBy: [{ status: "desc" }, { firstName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      status: true,
      photoUrl: true,
      city: true,
    },
  });

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Link
          href="/espace/chat"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 transition"
        >
          ← Retour
        </Link>
      </div>

      <PageHeader
        title="Nouvelle conversation"
        subtitle={isAdmin ? `${filleuls.length} affilié(s)` : `${filleuls.length} filleul${filleuls.length !== 1 ? "s" : ""} direct${filleuls.length !== 1 ? "s" : ""}`}
      />

      {filleuls.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center">
          <p className="text-3xl mb-3">👥</p>
          <p className="text-sm text-muted">Aucun filleul direct actif pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filleuls.map((p: any) => (
            <div
              key={p.id}
              className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm hover:border-blue-200 hover:shadow-md transition"
            >
              {p.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.photoUrl}
                  alt={`${p.firstName} ${p.lastName}`}
                  className="mb-3 h-16 w-16 rounded-full object-cover shadow"
                />
              ) : (
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold text-lg shadow">
                  {getInitials(p.firstName, p.lastName)}
                </div>
              )}

              <p className="font-semibold text-ink text-sm">
                {p.firstName} {p.lastName}
              </p>

              <span className="mt-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                {STATUS_LABELS[p.status] ?? p.status}
              </span>

              {p.city && (
                <p className="mt-1 text-xs text-muted">📍 {p.city}</p>
              )}

              <StartConversationButton targetUserId={p.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

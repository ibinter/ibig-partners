import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, PageHeader } from "@/components/ui";
import { STATUS_LABELS } from "@/lib/constants";
import { startConversation } from "../actions";

export const dynamic = "force-dynamic";

const GOLD_STATUSES = ["GOLD", "MASTER", "ELITE"];

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

const STATUS_BADGE_COLORS: Record<string, string> = {
  GOLD: "bg-amber-100 text-amber-700",
  MASTER: "bg-purple-100 text-purple-700",
  ELITE: "bg-blue-100 text-blue-700",
};

export default async function NouvelleConversationPage() {
  const user = await requireUser();

  if (!GOLD_STATUSES.includes(user.status)) {
    return (
      <div>
        <PageHeader title="Nouvelle conversation" subtitle="Accès réservé aux partenaires GOLD+" />
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <p className="text-4xl mb-4">🔒</p>
          <p className="text-sm text-muted">La messagerie est disponible à partir du statut Gold.</p>
          <Link href="/espace/chat" className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline">
            ← Retour
          </Link>
        </div>
      </div>
    );
  }

  const partners = await (prisma as any).user.findMany({
    where: {
      status: { in: GOLD_STATUSES },
      verificationStatus: "VERIFIED",
      active: true,
      id: { not: user.id },
    },
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
        subtitle={`${partners.length} partenaire${partners.length !== 1 ? "s" : ""} GOLD+ disponible${partners.length !== 1 ? "s" : ""}`}
      />

      {partners.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center">
          <p className="text-3xl mb-3">👥</p>
          <p className="text-sm text-muted">
            Aucun autre partenaire GOLD+ vérifié pour le moment.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((p: any) => (
            <div
              key={p.id}
              className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm hover:border-blue-200 hover:shadow-md transition"
            >
              {/* Avatar */}
              {p.photoUrl ? (
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

              <span
                className={`mt-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE_COLORS[p.status] ?? "bg-slate-100 text-slate-700"}`}
              >
                {STATUS_LABELS[p.status] ?? p.status}
              </span>

              {p.city && (
                <p className="mt-1 text-xs text-muted">📍 {p.city}</p>
              )}

              <form action={startConversation} className="mt-4 w-full">
                <input type="hidden" name="targetUserId" value={p.id} />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                  Démarrer une conversation
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

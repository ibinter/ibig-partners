import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const GOLD_STATUSES = ["GOLD", "MASTER", "ELITE"];

function formatRelative(date: Date | null): string {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Il y a ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `Il y a ${days} j`;
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

function getConversationName(conv: any, currentUserId: string): string {
  if (conv.name) return conv.name;
  if (conv.type === "DIRECT") {
    const other = conv.participants.find((p: any) => p.userId !== currentUserId);
    if (other?.user) return `${other.user.firstName} ${other.user.lastName}`;
  }
  return "Conversation";
}

export default async function ChatPage() {
  const user = await requireUser();

  if (!GOLD_STATUSES.includes(user.status)) {
    return (
      <div>
        <PageHeader
          title="Chat GOLD+"
          subtitle="Messagerie réservée aux partenaires Gold, Master et Elite"
        />
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <p className="text-4xl mb-4">🔒</p>
          <h2 className="font-bold text-ink text-lg mb-2">Accès réservé aux partenaires GOLD+</h2>
          <p className="text-sm text-muted mb-4">
            La messagerie est disponible à partir du statut Gold. Continuez à développer votre réseau pour débloquer cette fonctionnalité.
          </p>
          <Link
            href="/espace/classement"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition"
          >
            Voir ma progression →
          </Link>
        </div>
      </div>
    );
  }

  const conversations = await (prisma as any).chatConversation.findMany({
    where: { participants: { some: { userId: user.id } } },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      participants: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, status: true, photoUrl: true } },
        },
      },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  // Separate BROADCAST (pinned) from others
  const broadcast = conversations.filter((c: any) => c.type === "BROADCAST");
  const regular = conversations.filter((c: any) => c.type !== "BROADCAST");

  return (
    <div>
      <PageHeader
        title="Messages"
        subtitle="Échangez avec les partenaires de la communauté GOLD+"
      />

      <div className="mb-5 flex items-center justify-between">
        <p className="text-xs text-muted">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
        <Link
          href="/espace/chat/nouveau"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm"
        >
          + Nouvelle conversation
        </Link>
      </div>

      {conversations.length === 0 ? (
        <EmptyState>
          Aucune conversation pour le moment. Démarrez un échange avec un partenaire !
        </EmptyState>
      ) : (
        <div className="space-y-2">
          {/* Pinned BROADCAST channels */}
          {broadcast.map((conv: any) => (
            <Link
              key={conv.id}
              href={`/espace/chat/${conv.id}`}
              className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 hover:bg-amber-100 transition"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-bold text-lg shadow">
                📢
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-ink text-sm truncate">{conv.name ?? "Communauté GOLD+"}</p>
                  <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-xs font-bold text-amber-900">
                    Annonces
                  </span>
                </div>
                {conv.messages[0] && (
                  <p className="text-xs text-muted truncate mt-0.5">{conv.messages[0].body}</p>
                )}
              </div>
              {conv.lastMessageAt && (
                <span className="shrink-0 text-xs text-muted">{formatRelative(conv.lastMessageAt)}</span>
              )}
            </Link>
          ))}

          {/* Regular conversations */}
          {regular.map((conv: any) => {
            const name = getConversationName(conv, user.id);
            const otherParticipant =
              conv.type === "DIRECT"
                ? conv.participants.find((p: any) => p.userId !== user.id)
                : null;
            const lastMsg = conv.messages[0];
            const myParticipant = conv.participants.find((p: any) => p.userId === user.id);
            const unread =
              myParticipant?.lastReadAt && lastMsg
                ? new Date(lastMsg.createdAt) > new Date(myParticipant.lastReadAt)
                : false;

            return (
              <Link
                key={conv.id}
                href={`/espace/chat/${conv.id}`}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 hover:border-blue-200 hover:shadow-sm transition"
              >
                {/* Avatar */}
                {otherParticipant?.user?.photoUrl ? (
                  <img
                    src={otherParticipant.user.photoUrl}
                    alt={name}
                    className="h-12 w-12 shrink-0 rounded-full object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold text-sm shadow">
                    {otherParticipant?.user
                      ? getInitials(otherParticipant.user.firstName, otherParticipant.user.lastName)
                      : "GR"}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm truncate ${unread ? "font-bold text-ink" : "font-medium text-ink"}`}>
                      {name}
                    </p>
                    {otherParticipant?.user?.status && (
                      <span className="hidden sm:inline rounded-full bg-slate-100 px-2 py-0.5 text-xs text-muted">
                        {STATUS_LABELS[otherParticipant.user.status] ?? otherParticipant.user.status}
                      </span>
                    )}
                  </div>
                  {lastMsg && (
                    <p className={`text-xs truncate mt-0.5 ${unread ? "text-ink font-medium" : "text-muted"}`}>
                      {lastMsg.body}
                    </p>
                  )}
                  {!lastMsg && (
                    <p className="text-xs text-muted mt-0.5">Aucun message encore</p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                  {conv.lastMessageAt && (
                    <span className="text-xs text-muted">{formatRelative(conv.lastMessageAt)}</span>
                  )}
                  {unread && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      •
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_LABELS } from "@/lib/constants";
import { ChatMessages, type ChatMessageData } from "./ChatMessages";

export const dynamic = "force-dynamic";

const GOLD_STATUSES = ["GOLD", "MASTER", "ELITE"];

function initials(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!GOLD_STATUSES.includes(user.status)) redirect("/espace/chat");

  const { id } = await params;

  const conversation = await (prisma as any).chatConversation.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, status: true, photoUrl: true } },
        },
      },
      participants: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, status: true, photoUrl: true, city: true } },
        },
      },
    },
  });

  if (!conversation) notFound();

  // Vérifier que l'utilisateur est participant
  const isParticipant = conversation.participants.some((p: any) => p.userId === user.id);
  if (!isParticipant) redirect("/espace/chat");

  // Marquer comme lu
  await (prisma as any).chatParticipant.update({
    where: { conversationId_userId: { conversationId: id, userId: user.id } },
    data: { lastReadAt: new Date() },
  }).catch(() => {});

  // Déterminer le titre : nom du groupe ou autre participant (DIRECT)
  const other = conversation.participants.find((p: any) => p.userId !== user.id)?.user;
  const title =
    conversation.type === "DIRECT"
      ? other
        ? `${other.firstName} ${other.lastName}`
        : "Conversation"
      : conversation.name || "Groupe";
  const subtitle =
    conversation.type === "DIRECT" && other
      ? STATUS_LABELS[other.status]
      : `${conversation.participants.length} participants`;

  // Serialise messages for the client component (Dates → ISO strings)
  const initialMessages: ChatMessageData[] = conversation.messages.map((m: any) => ({
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    body: m.body,
    type: m.type,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
    sender: {
      id: m.sender.id,
      firstName: m.sender.firstName,
      lastName: m.sender.lastName,
      status: m.sender.status,
      photoUrl: m.sender.photoUrl ?? null,
    },
  }));

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] max-h-[800px]">
      {/* Header */}
      <div className="flex items-center gap-3 rounded-t-2xl border border-slate-100 bg-white px-5 py-3 shadow-sm">
        <Link
          href="/espace/chat"
          className="text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Retour"
        >
          ←
        </Link>
        {conversation.type === "DIRECT" && other ? (
          other.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={other.photoUrl} alt={title} className="h-10 w-10 rounded-full object-cover border border-slate-200" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
              {initials(other.firstName, other.lastName)}
            </div>
          )
        ) : (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-lg">
            💬
          </div>
        )}
        <div className="min-w-0">
          <p className="font-bold text-ink text-sm leading-tight">{title}</p>
          <p className="text-xs text-muted">{subtitle}</p>
        </div>
      </div>

      {/* Messages + Input (client component with polling) */}
      <ChatMessages
        initialMessages={initialMessages}
        conversationId={conversation.id}
        currentUserId={user.id}
      />
    </div>
  );
}

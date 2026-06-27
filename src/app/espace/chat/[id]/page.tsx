import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { ChatInput } from "./chat-input";

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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto border-x border-slate-100 bg-slate-50 px-4 py-5 space-y-4">
        {conversation.messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <p className="text-3xl mb-2">👋</p>
              <p className="text-sm font-semibold text-slate-600">Démarrez la conversation</p>
              <p className="text-xs text-slate-400 mt-1">Envoyez le premier message ci-dessous.</p>
            </div>
          </div>
        ) : (
          conversation.messages.map((m: any) => {
            const mine = m.senderId === user.id;
            const sc = STATUS_COLORS[m.sender.status];
            return (
              <div key={m.id} className={`flex gap-2.5 ${mine ? "flex-row-reverse" : ""}`}>
                {m.sender.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.sender.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0" />
                ) : (
                  <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                    {initials(m.sender.firstName, m.sender.lastName)}
                  </div>
                )}
                <div className={`max-w-[75%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
                  {!mine && (
                    <div className="flex items-center gap-1.5 mb-0.5 px-1">
                      <span className="text-xs font-semibold text-slate-600">
                        {m.sender.firstName} {m.sender.lastName}
                      </span>
                      <span className={`rounded-full px-1.5 text-[9px] font-semibold ${sc?.badge ?? "bg-slate-100 text-slate-600"}`}>
                        {STATUS_LABELS[m.sender.status]?.replace(/[⭐🏆👑\s]/g, "") || m.sender.status}
                      </span>
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      mine
                        ? "bg-blue-600 text-white rounded-tr-sm"
                        : "bg-white text-slate-800 border border-slate-100 rounded-tl-sm"
                    }`}
                  >
                    {m.body}
                  </div>
                  <span className="mt-0.5 px-1 text-[10px] text-slate-400">
                    {formatDateTime(m.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="rounded-b-2xl overflow-hidden">
        <ChatInput conversationId={conversation.id} />
      </div>
    </div>
  );
}

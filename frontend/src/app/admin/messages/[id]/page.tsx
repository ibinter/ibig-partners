import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_LABELS } from "@/lib/constants";
import { ChatMessages, type ChatMessageData } from "../../../espace/chat/[id]/ChatMessages";

export const dynamic = "force-dynamic";

function initials(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

export default async function AdminConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAdmin();
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

  const isParticipant = conversation.participants.some((p: any) => p.userId === user.id);
  if (!isParticipant) redirect("/admin/messages");

  await (prisma as any).chatParticipant
    .update({
      where: { conversationId_userId: { conversationId: id, userId: user.id } },
      data: { lastReadAt: new Date() },
    })
    .catch(() => {});

  const other = conversation.participants.find((p: any) => p.userId !== user.id)?.user;
  const title = other ? `${other.firstName} ${other.lastName}` : conversation.name || "Conversation";
  const subtitle = other ? STATUS_LABELS[other.status] ?? "Affilié" : `${conversation.participants.length} participants`;

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
      <div className="flex items-center gap-3 rounded-t-2xl border border-slate-100 bg-white px-5 py-3 shadow-sm">
        <Link href="/admin/messages" className="text-slate-400 transition-colors hover:text-slate-600" aria-label="Retour">
          ←
        </Link>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-bold text-white">
          {other ? initials(other.firstName, other.lastName) : "💬"}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight text-ink">{title}</p>
          <p className="text-xs text-muted">{subtitle}</p>
        </div>
      </div>

      <ChatMessages initialMessages={initialMessages} conversationId={conversation.id} currentUserId={user.id} />
    </div>
  );
}

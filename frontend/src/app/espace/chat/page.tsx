import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { STATUS_LABELS } from "@/lib/constants";
import ChatListClient, { type ConvRow } from "./chat-list-client";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const user = await requireUser();

  const isAdmin = user.role === "ADMIN" || user.role === "SUPERADMIN";
  const filleulCount = isAdmin ? 1 : await prisma.user.count({ where: { sponsorId: user.id } });

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

  if (filleulCount === 0 && conversations.length === 0) {
    return (
      <div className="space-y-5">
        <PageHeader title="Messages" subtitle="Échangez en direct avec vos filleuls et votre réseau" />
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-violet-50 p-10 text-center">
          <p className="text-5xl mb-4">💬</p>
          <h2 className="font-bold text-slate-800 text-lg mb-2">La messagerie se débloque avec votre premier filleul</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">
            Recrutez votre premier affilié pour accéder à la messagerie directe — partagez des conseils, des ressources et suivez vos filleuls en temps réel.
          </p>
          <Link
            href="/espace/reseau"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition shadow"
          >
            Voir mon réseau →
          </Link>
        </div>

        {/* Aperçu de ce que la messagerie permet */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-violet-700 px-5 py-3">
            <h3 className="font-semibold text-white text-sm">💬 Ce que vous pourrez faire avec la messagerie</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {[
              { icon: "📩", title: "Messages directs avec vos filleuls", desc: "Guidez-les dans leurs premières ventes, répondez à leurs questions, partagez des ressources." },
              { icon: "📢", title: "Annonces de la communauté Gold+", desc: "Recevez les actualités, nouvelles formations et opportunités diffusées par l'équipe IBIG." },
              { icon: "🤝", title: "Coordination de votre réseau", desc: "Organisez des actions collectives avec votre équipe pour maximiser vos commissions." },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-4 px-5 py-4">
                <span className="text-2xl shrink-0">{f.icon}</span>
                <div>
                  <p className="font-semibold text-sm text-slate-800">{f.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const rows: ConvRow[] = conversations.map((conv: any) => {
    const isBroadcast = conv.type === "BROADCAST";
    const other = conv.type === "DIRECT"
      ? conv.participants.find((p: any) => p.userId !== user.id)?.user
      : null;
    const myParticipant = conv.participants.find((p: any) => p.userId === user.id);
    const lastMsg = conv.messages[0] ?? null;
    const unread = !!(
      myParticipant?.lastReadAt &&
      lastMsg &&
      new Date(lastMsg.createdAt) > new Date(myParticipant.lastReadAt)
    );
    const name = conv.name
      ? conv.name
      : other
        ? `${other.firstName} ${other.lastName}`
        : "Groupe";

    return {
      id: conv.id,
      type: conv.type,
      name,
      lastBody: lastMsg?.body ?? null,
      lastAt: conv.lastMessageAt ? new Date(conv.lastMessageAt).toISOString() : null,
      unread: !isBroadcast && unread,
      isBroadcast,
      avatarUrl: other?.photoUrl ?? null,
      otherStatus: other?.status ? (STATUS_LABELS[other.status] ?? other.status) : null,
    };
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Messages"
        subtitle="Échangez avec vos filleuls et votre réseau IBIG"
      />
      <ChatListClient rows={rows} newHref="/espace/chat/nouveau" />
    </div>
  );
}

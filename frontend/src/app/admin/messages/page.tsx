import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

function initials(f?: string, l?: string) {
  return `${f?.[0] ?? ""}${l?.[0] ?? ""}`.toUpperCase();
}

export default async function AdminMessagesPage() {
  const user = await requireAdmin();

  const conversations = await (prisma as any).chatConversation.findMany({
    where: { participants: { some: { userId: user.id } } },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      participants: {
        include: { user: { select: { id: true, firstName: true, lastName: true, photoUrl: true } } },
      },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Messagerie"
        subtitle="Échangez en direct avec les affiliés — bienvenue, conseils, instructions."
      />

      <Card className="p-0">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">
            Aucune conversation pour le moment. Depuis{" "}
            <Link href="/admin/partenaires" className="font-semibold text-brand-600 hover:underline">
              Partenaires
            </Link>
            , cliquez « 💬 Contacter » sur un affilié pour démarrer.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {conversations.map((c: any) => {
              const other = c.participants.find((p: any) => p.userId !== user.id)?.user;
              const last = c.messages[0];
              const name = other ? `${other.firstName} ${other.lastName}` : c.name || "Conversation";
              return (
                <li key={c.id}>
                  <Link
                    href={`/admin/messages/${c.id}`}
                    className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-bold text-white">
                      {initials(other?.firstName, other?.lastName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{name}</p>
                      <p className="truncate text-xs text-muted">{last ? last.body : "Nouvelle conversation"}</p>
                    </div>
                    {c.lastMessageAt && (
                      <span className="shrink-0 text-xs text-muted">{formatDate(c.lastMessageAt)}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ conversationId: string }> };

// L'accès à une conversation est protégé par la vérification de PARTICIPATION
// ci-dessous : toute personne membre peut lire/écrire (y compris un affilié sans
// filleul qui a reçu un message de bienvenue d'un admin).

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/chat/[conversationId]/messages
// ──────────────────────────────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId } = await context.params;

  const participant = await (prisma as any).chatParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: user.id } },
  });
  if (!participant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await (prisma as any).chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: {
        select: { id: true, firstName: true, lastName: true, status: true, photoUrl: true },
      },
    },
  });

  // Marquer la conversation comme lue pour ce lecteur.
  await (prisma as any).chatParticipant.update({
    where: { conversationId_userId: { conversationId, userId: user.id } },
    data: { lastReadAt: new Date() },
  }).catch(() => {});

  return NextResponse.json({ messages });
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/chat/[conversationId]/messages   Body: { body: string }
// ──────────────────────────────────────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId } = await context.params;

  const participant = await (prisma as any).chatParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: user.id } },
  });
  if (!participant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await req.json().catch(() => ({}));
  const body = typeof json?.body === "string" ? json.body.trim() : "";
  if (!body) {
    return NextResponse.json({ error: "Message body is required" }, { status: 400 });
  }

  const message = await (prisma as any).chatMessage.create({
    data: { conversationId, senderId: user.id, body, type: "TEXT" },
    include: {
      sender: {
        select: { id: true, firstName: true, lastName: true, status: true, photoUrl: true },
      },
    },
  });

  await Promise.all([
    (prisma as any).chatConversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    }),
    (prisma as any).chatParticipant.update({
      where: { conversationId_userId: { conversationId, userId: user.id } },
      data: { lastReadAt: new Date() },
    }),
  ]);

  // Notifier les autres participants (cloche), sauf ceux déjà actifs dans le chat
  // (lu il y a moins de 60 s). Le lien pointe vers l'interface adaptée au rôle
  // du destinataire : /admin/messages pour un admin, /espace/chat pour un affilié.
  const others = await (prisma as any).chatParticipant.findMany({
    where: { conversationId, userId: { not: user.id } },
    select: { userId: true, lastReadAt: true, user: { select: { role: true } } },
  });
  const cutoff = Date.now() - 60_000;
  const toNotify = others.filter(
    (o: any) => !o.lastReadAt || new Date(o.lastReadAt).getTime() < cutoff,
  );
  if (toNotify.length > 0) {
    const senderName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "IBIG PARTNERS";
    const preview = body.length > 140 ? `${body.slice(0, 140)}…` : body;
    await prisma.notification.createMany({
      data: toNotify.map((o: any) => ({
        userId: o.userId,
        title: `💬 Nouveau message de ${senderName}`,
        body: preview,
        url:
          o.user?.role === "ADMIN" || o.user?.role === "SUPERADMIN"
            ? `/admin/messages/${conversationId}`
            : `/espace/chat/${conversationId}`,
      })),
    });
  }

  return NextResponse.json({ message }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const GOLD_STATUSES = ["GOLD", "MASTER", "ELITE"];

type RouteContext = { params: Promise<{ conversationId: string }> };

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/chat/[conversationId]/messages
// Returns all messages for the conversation (user must be a participant).
// ──────────────────────────────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user || !GOLD_STATUSES.includes(user.status)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId } = await context.params;

  // Verify participation
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
        select: {
          id: true,
          firstName: true,
          lastName: true,
          status: true,
          photoUrl: true,
        },
      },
    },
  });

  return NextResponse.json({ messages });
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/chat/[conversationId]/messages
// Creates a new message. Body: { body: string }
// ──────────────────────────────────────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user || !GOLD_STATUSES.includes(user.status)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId } = await context.params;

  // Verify participation
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
    data: {
      conversationId,
      senderId: user.id,
      body,
      type: "TEXT",
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          status: true,
          photoUrl: true,
        },
      },
    },
  });

  // Update conversation lastMessageAt and sender's lastReadAt
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

  return NextResponse.json({ message }, { status: 201 });
}

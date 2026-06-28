"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

type Sender = {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  photoUrl: string | null;
};

export type ChatMessageData = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  type: string;
  createdAt: string; // ISO string (serialised from server component)
  sender: Sender;
};

type Props = {
  initialMessages: ChatMessageData[];
  conversationId: string;
  currentUserId: string;
};

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function initials(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────

export function ChatMessages({ initialMessages, conversationId, currentUserId }: Props) {
  const [messages, setMessages] = useState<ChatMessageData[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Polling: refresh messages every 4 seconds
  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/${conversationId}/messages`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.messages)) {
        setMessages(data.messages as ChatMessageData[]);
      }
    } catch {
      // network errors are silently ignored to avoid disrupting UX
    }
  }, [conversationId]);

  useEffect(() => {
    const timer = setInterval(fetchMessages, 4000);
    return () => clearInterval(timer);
  }, [fetchMessages]);

  // Send a new message
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch(`/api/chat/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed }),
      });

      if (!res.ok) {
        setError("Erreur lors de l'envoi. Réessayez.");
        return;
      }

      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, data.message as ChatMessageData]);
      }
      setBody("");
      textareaRef.current?.focus();
    } catch {
      setError("Impossible d'envoyer le message. Vérifiez votre connexion.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* ── Message list ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto border-x border-slate-100 bg-slate-50 px-4 py-5 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <p className="text-3xl mb-2">👋</p>
              <p className="text-sm font-semibold text-slate-600">Démarrez la conversation</p>
              <p className="text-xs text-slate-400 mt-1">Envoyez le premier message ci-dessous.</p>
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === currentUserId;
            const sc = STATUS_COLORS[m.sender.status];
            return (
              <div key={m.id} className={`flex gap-2.5 ${mine ? "flex-row-reverse" : ""}`}>
                {m.sender.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.sender.photoUrl}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0"
                  />
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
                      <span
                        className={`rounded-full px-1.5 text-[9px] font-semibold ${
                          sc?.badge ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {STATUS_LABELS[m.sender.status]?.replace(/[⭐🏆👑\s]/g, "") ||
                          m.sender.status}
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
        {/* Anchor element for auto-scroll */}
        <div ref={bottomRef} />
      </div>

      {/* ── Input area ───────────────────────────────────────────────── */}
      <div className="rounded-b-2xl overflow-hidden">
        <form
          onSubmit={handleSend}
          className="flex items-end gap-2 border-t border-slate-100 bg-white p-3"
        >
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            required
            disabled={sending}
            placeholder="Écrivez votre message…"
            className="flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-3 focus:ring-blue-100 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !body.trim()}
            className="shrink-0 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "…" : "Envoyer"}
          </button>
        </form>
        {error && (
          <p className="px-4 pb-2 text-xs text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}

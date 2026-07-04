"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";

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
  createdAt: string;
  sender: Sender;
};

type Props = {
  initialMessages: ChatMessageData[];
  conversationId: string;
  currentUserId: string;
};

function initials(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

function isImageUrl(url: string) {
  return /^data:image\//i.test(url) || /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);
}

function isVideoLink(text: string) {
  return /youtu\.be|youtube\.com|vimeo\.com/i.test(text);
}

function isPdfUrl(url: string) {
  return /^data:application\/pdf/i.test(url) || /\.pdf(\?.*)?$/i.test(url);
}

function MessageBubble({ m, mine }: { m: ChatMessageData; mine: boolean }) {
  const sc = STATUS_COLORS[m.sender.status];
  const body = m.body;

  const isImage = isImageUrl(body);
  const isVideo = isVideoLink(body);
  const isPdf = isPdfUrl(body);
  const isLink = !isImage && !isPdf && /^https?:\/\//i.test(body);

  return (
    <div className={`flex gap-2.5 ${mine ? "flex-row-reverse" : ""}`}>
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
            <span className={`rounded-full px-1.5 text-[9px] font-semibold ${sc?.badge ?? "bg-slate-100 text-slate-600"}`}>
              {STATUS_LABELS[m.sender.status]?.replace(/[⭐🏆👑\s]/g, "") || m.sender.status}
            </span>
          </div>
        )}

        {isImage ? (
          <div className={`rounded-2xl overflow-hidden border ${mine ? "border-blue-300" : "border-slate-200"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={body} alt="image partagée" className="max-w-[260px] max-h-[300px] object-cover block" />
          </div>
        ) : isPdf ? (
          <a
            href={body}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium ${mine ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-700"}`}
          >
            <span className="text-lg">📄</span>
            <span className="underline underline-offset-2">Document PDF</span>
          </a>
        ) : isVideo ? (
          <a
            href={body}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium ${mine ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-700"}`}
          >
            <span className="text-lg">▶️</span>
            <span className="underline underline-offset-2 truncate max-w-[200px]">{body}</span>
          </a>
        ) : isLink ? (
          <a
            href={body}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm ${mine ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-700"}`}
          >
            <span>🔗</span>
            <span className="underline underline-offset-2 truncate max-w-[220px]">{body}</span>
          </a>
        ) : (
          <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${mine ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white text-slate-800 border border-slate-100 rounded-tl-sm"}`}>
            {body}
          </div>
        )}

        <span className="mt-0.5 px-1 text-[10px] text-slate-400">
          {formatDateTime(m.createdAt)}
        </span>
      </div>
    </div>
  );
}

export function ChatMessages({ initialMessages, conversationId, currentUserId }: Props) {
  const [messages, setMessages] = useState<ChatMessageData[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/${conversationId}/messages`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.messages)) setMessages(data.messages as ChatMessageData[]);
    } catch {}
  }, [conversationId]);

  useEffect(() => {
    const timer = setInterval(fetchMessages, 4000);
    return () => clearInterval(timer);
  }, [fetchMessages]);

  const sendBody = async (text: string) => {
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/chat/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (!res.ok) { setError("Erreur lors de l'envoi."); return; }
      const data = await res.json();
      if (data.message) setMessages((prev) => [...prev, data.message as ChatMessageData]);
    } catch {
      setError("Impossible d'envoyer. Vérifiez votre connexion.");
    } finally {
      setSending(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || sending) return;
    await sendBody(trimmed);
    setBody("");
    textareaRef.current?.focus();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    setError(null);
    try {
      // Limite 3 Mo pour le base64 inline
      if (file.size > 3 * 1024 * 1024) {
        setError("Fichier trop volumineux (max 3 Mo). Partagez un lien Google Drive ou Dropbox dans le message.");
        return;
      }
      // Convertir en data URL base64 et envoyer directement comme message
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await sendBody(dataUrl);
    } catch {
      setError("Impossible de lire le fichier.");
    } finally {
      setUploadingFile(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto border-x border-slate-100 bg-slate-50 px-4 py-5 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <p className="text-3xl mb-2">👋</p>
              <p className="text-sm font-semibold text-slate-600">Démarrez la conversation</p>
              <p className="text-xs text-slate-400 mt-1">Vous pouvez envoyer du texte, des images, des PDFs et des liens vidéo.</p>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble key={m.id} m={m} mine={m.senderId === currentUserId} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="rounded-b-2xl overflow-hidden">
        <form onSubmit={handleSend} className="flex items-end gap-2 border-t border-slate-100 bg-white p-3">
          {/* Bouton fichier */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadingFile || sending}
            title="Envoyer une image ou un document"
            className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition disabled:opacity-40"
          >
            {uploadingFile ? "⏳" : "📎"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
            rows={1}
            disabled={sending || uploadingFile}
            placeholder="Message, lien YouTube, conseil…"
            className="flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-3 focus:ring-blue-100 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || uploadingFile || !body.trim()}
            className="shrink-0 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "…" : "Envoyer"}
          </button>
        </form>
        {error && <p className="px-4 pb-2 text-xs text-red-600">{error}</p>}
        <p className="px-4 pb-2 text-[10px] text-slate-400">
          📎 Images & PDF · 🔗 Liens YouTube / vidéo · ⌨️ Entrée pour envoyer
        </p>
      </div>
    </div>
  );
}

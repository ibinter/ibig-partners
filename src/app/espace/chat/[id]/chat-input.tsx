"use client";

import { useRef } from "react";
import { sendMessage } from "../actions";

export function ChatInput({ conversationId }: { conversationId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await sendMessage(formData);
        formRef.current?.reset();
      }}
      className="flex items-end gap-2 border-t border-slate-100 bg-white p-3"
    >
      <input type="hidden" name="conversationId" value={conversationId} />
      <textarea
        name="body"
        rows={1}
        required
        placeholder="Écrivez votre message…"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            formRef.current?.requestSubmit();
          }
        }}
        className="flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-3 focus:ring-blue-100"
      />
      <button
        type="submit"
        className="shrink-0 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
      >
        Envoyer
      </button>
    </form>
  );
}

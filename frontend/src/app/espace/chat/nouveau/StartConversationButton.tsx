"use client";

import { useActionState } from "react";
import { startConversation } from "../actions";

export function StartConversationButton({
  targetUserId,
}: {
  targetUserId: string;
}) {
  const [error, action, pending] = useActionState(startConversation, null);

  return (
    <form action={action} className="mt-4 w-full">
      <input type="hidden" name="targetUserId" value={targetUserId} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60"
      >
        {pending ? "Chargement…" : "Démarrer une conversation"}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-600 text-center">{error}</p>
      )}
    </form>
  );
}

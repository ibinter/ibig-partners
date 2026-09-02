"use client";

import { useState } from "react";

export default function FetchButton({ slug }: { slug: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function handleFetch() {
    setState("loading");
    setMsg("");
    try {
      const res = await fetch("/api/admin/enrich-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (data.ok) {
        setState("done");
        setMsg("Import réussi ! Rechargez la page pour voir le résultat.");
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setState("error");
        setMsg(data.error ?? "Erreur inconnue");
      }
    } catch {
      setState("error");
      setMsg("Erreur réseau");
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleFetch}
        disabled={state === "loading"}
        className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-4 py-2 text-sm transition-colors"
      >
        {state === "loading" ? "⏳ Import en cours…" : "🤖 Importer depuis le site"}
      </button>
      {msg && (
        <p className={`text-xs font-semibold ${state === "done" ? "text-emerald-600" : "text-red-600"}`}>
          {msg}
        </p>
      )}
    </div>
  );
}

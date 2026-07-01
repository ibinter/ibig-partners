"use client";

import { useState } from "react";

export function SyncBranchesButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSync() {
    setLoading(true);
    setMsg("");
    try {
      const r = await fetch("/api/admin/sync-branches", { method: "POST" });
      const d = await r.json();
      setMsg(d.message ?? (r.ok ? "Synchronisation OK" : "Erreur"));
      if (r.ok) window.location.reload();
    } catch {
      setMsg("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleSync}
        disabled={loading}
        className="rounded-lg border border-brand-300 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100 disabled:opacity-50"
      >
        {loading ? "Synchronisation…" : "Synchroniser les branches"}
      </button>
      {msg && <p className="text-xs text-slate-500">{msg}</p>}
    </div>
  );
}

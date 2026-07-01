"use client";

import { useState } from "react";

export function MigrateButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleMigrate() {
    setLoading(true);
    setMsg("");
    try {
      const r = await fetch("/api/admin/migrate", { method: "POST" });
      const d = await r.json();
      if (r.ok) {
        setMsg("Migration OK — rechargement…");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMsg(d.error ?? "Erreur");
      }
    } catch {
      setMsg("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleMigrate}
        disabled={loading}
        className="rounded-lg bg-red-600 px-6 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? "Migration en cours…" : "Corriger le schéma DB"}
      </button>
      {msg && <p className="text-sm text-red-700 font-medium">{msg}</p>}
    </div>
  );
}

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

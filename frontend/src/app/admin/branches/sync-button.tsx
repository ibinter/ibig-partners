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

function SyncButton({ label, endpoint, className }: { label: string; endpoint: string; className: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handle() {
    setLoading(true);
    setMsg("");
    try {
      const r = await fetch(endpoint, { method: "POST" });
      const d = await r.json();
      setMsg(d.message ?? (r.ok ? "OK" : d.error ?? "Erreur"));
      if (r.ok) setTimeout(() => window.location.reload(), 1200);
    } catch {
      setMsg("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button onClick={handle} disabled={loading} className={className}>
        {loading ? "En cours…" : label}
      </button>
      {msg && <p className="text-xs text-slate-500 max-w-[220px] text-right">{msg}</p>}
    </div>
  );
}

export function SyncBranchesButton() {
  return (
    <SyncButton
      label="Synchroniser les branches"
      endpoint="/api/admin/sync-branches"
      className="rounded-lg border border-brand-300 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100 disabled:opacity-50"
    />
  );
}

export function SyncEduformButton() {
  return (
    <SyncButton
      label="Sync formations EDUFORM"
      endpoint="/api/admin/sync-eduform"
      className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
    />
  );
}

export function SyncConseilButton() {
  return (
    <SyncButton
      label="Sync IBIG CONSEIL+"
      endpoint="/api/admin/sync-conseil"
      className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-50"
    />
  );
}

export function SyncDigitalButton() {
  return (
    <SyncButton
      label="Sync IBIG DIGITAL"
      endpoint="/api/admin/sync-digital"
      className="rounded-lg border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100 disabled:opacity-50"
    />
  );
}

export function SyncDigitalKitsButton() {
  return (
    <SyncButton
      label="Sync DIGITAL KITS"
      endpoint="/api/admin/sync-digital-kits"
      className="rounded-lg border border-violet-300 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100 disabled:opacity-50"
    />
  );
}

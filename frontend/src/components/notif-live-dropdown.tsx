"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

type Notif = { id: string; title: string; body: string; url: string | null; createdAt: string };

export default function NotifLiveDropdown({ initialCount }: { initialCount: number }) {
  const [count, setCount]         = useState(initialCount);
  const [notifs, setNotifs]       = useState<Notif[]>([]);
  const [open, setOpen]           = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setCount(data.count);
      setNotifs(data.notifications);
    } catch {}
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications/unread", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    setCount(0);
    setNotifs([]);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        🔔
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-slate-100 bg-white shadow-xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-50 px-4 py-3">
            <p className="text-sm font-bold text-slate-800">Notifications {count > 0 && <span className="ml-1 text-rose-500">({count})</span>}</p>
            {count > 0 && (
              <button onClick={markAllRead} className="text-xs text-blue-500 hover:underline">Tout marquer lu</button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifs.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">Aucune nouvelle notification</div>
            ) : (
              notifs.map((n) => (
                <div key={n.id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                  {n.url ? (
                    <Link href={n.url} onClick={() => setOpen(false)}>
                      <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                    </Link>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                    </>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(n.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-50 px-4 py-2">
            <Link href="/espace/notifications" onClick={() => setOpen(false)} className="block text-center text-xs text-blue-500 hover:underline py-1">
              Voir toutes les notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

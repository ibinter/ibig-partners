"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export type ConvRow = {
  id: string;
  type: string;
  name: string;
  lastBody: string | null;
  lastAt: string | null;
  unread: boolean;
  isBroadcast: boolean;
  avatarUrl: string | null;
  otherStatus: string | null;
};

function formatRelative(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} h`;
  return `${Math.floor(hrs / 24)} j`;
}

function Initials({ name, gradient = "from-blue-500 to-blue-700" }: { name: string; gradient?: string }) {
  const parts = name.trim().split(" ");
  const initials = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return (
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white font-bold text-sm shadow`}>
      {initials.toUpperCase() || "?"}
    </div>
  );
}

export default function ChatListClient({ rows, newHref }: { rows: ConvRow[]; newHref: string }) {
  const [search, setSearch] = useState("");

  const broadcasts = rows.filter((r) => r.isBroadcast);
  const regular    = rows.filter((r) => !r.isBroadcast);
  const unreadCount = regular.filter((r) => r.unread).length;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return regular;
    return regular.filter((r) =>
      r.name.toLowerCase().includes(q) ||
      (r.lastBody ?? "").toLowerCase().includes(q)
    );
  }, [regular, search]);

  return (
    <div className="space-y-4">
      {/* ── KPI row ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-3 text-white shadow-sm text-center">
          <p className="text-2xl font-extrabold">{rows.length}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-200 mt-0.5">Conversations</p>
        </div>
        <div className={`rounded-2xl p-3 text-white shadow-sm text-center ${unreadCount > 0 ? "bg-gradient-to-br from-rose-500 to-rose-600" : "bg-gradient-to-br from-slate-600 to-slate-700"}`}>
          <p className="text-2xl font-extrabold">{unreadCount}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-white/70 mt-0.5">Non lus</p>
        </div>
        <Link
          href={newHref}
          className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-3 text-white shadow-sm text-center hover:from-emerald-700 hover:to-teal-700 transition flex flex-col items-center justify-center"
        >
          <p className="text-2xl font-extrabold">+</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-100 mt-0.5">Nouveau</p>
        </Link>
      </div>

      {/* ── Recherche ── */}
      {rows.length > 3 && (
        <input
          type="search"
          placeholder="Rechercher une conversation…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
        />
      )}

      {/* ── Broadcasts ── */}
      {broadcasts.map((conv) => (
        <Link
          key={conv.id}
          href={`/espace/chat/${conv.id}`}
          className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 hover:bg-amber-100 transition"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white text-lg shadow">
            📢
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-800 text-sm truncate">{conv.name || "Communauté GOLD+"}</p>
              <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">Annonces</span>
            </div>
            {conv.lastBody && <p className="text-xs text-slate-500 truncate mt-0.5">{conv.lastBody}</p>}
          </div>
          {conv.lastAt && <span className="shrink-0 text-xs text-slate-400">{formatRelative(conv.lastAt)}</span>}
        </Link>
      ))}

      {/* ── Conversations régulières ── */}
      {filtered.length === 0 && search ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm text-slate-400">Aucune conversation pour « {search} »</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((conv) => (
            <Link
              key={conv.id}
              href={`/espace/chat/${conv.id}`}
              className={`flex items-center gap-4 rounded-2xl border p-4 hover:border-blue-200 hover:shadow-sm transition ${
                conv.unread ? "border-blue-100 bg-blue-50/50" : "border-slate-100 bg-white"
              }`}
            >
              {conv.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={conv.avatarUrl} alt={conv.name} loading="lazy" decoding="async" className="h-12 w-12 shrink-0 rounded-full object-cover shadow-sm" />
              ) : (
                <Initials name={conv.name} />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm truncate ${conv.unread ? "font-bold text-slate-900" : "font-medium text-slate-800"}`}>
                    {conv.name}
                  </p>
                  {conv.otherStatus && (
                    <span className="hidden sm:inline rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 shrink-0">
                      {conv.otherStatus}
                    </span>
                  )}
                </div>
                {conv.lastBody ? (
                  <p className={`text-xs truncate mt-0.5 ${conv.unread ? "text-slate-700 font-medium" : "text-slate-400"}`}>
                    {conv.lastBody}
                  </p>
                ) : (
                  <p className="text-xs text-slate-300 mt-0.5">Aucun message encore</p>
                )}
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1.5">
                {conv.lastAt && (
                  <span className="text-xs text-slate-400">{formatRelative(conv.lastAt)}</span>
                )}
                {conv.unread && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                    ●
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { markOneRead, markAllRead } from "./actions";

export type NotifRow = {
  id: string;
  title: string;
  body: string;
  url: string | null;
  read: boolean;
  isGlobal: boolean;
  createdAt: string; // ISO
};

const FILTERS = [
  { key: "all",       label: "Tout" },
  { key: "unread",    label: "Non lues" },
  { key: "global",    label: "Annonces" },
  { key: "personal",  label: "Personnelles" },
];

function autoIcon(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("commission") || t.includes("commissi"))  return "💰";
  if (t.includes("vente") || t.includes("déclaration"))    return "🧾";
  if (t.includes("retrait") || t.includes("paiement"))     return "💸";
  if (t.includes("réseau") || t.includes("filleul") || t.includes("partenaire")) return "👥";
  if (t.includes("kyc") || t.includes("vérif"))            return "🔐";
  if (t.includes("badge") || t.includes("récompense"))     return "🏆";
  if (t.includes("statut"))                                 return "⭐";
  if (t.includes("bienvenu"))                               return "🎉";
  return "🔔";
}

function relativeDay(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (date.toDateString() === yesterday.toDateString()) return "Hier";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function NotifListClient({
  rows,
  unreadCount,
}: {
  rows: NotifRow[];
  unreadCount: number;
}) {
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "unread")   return rows.filter((n) => !n.isGlobal && !n.read);
    if (filter === "global")   return rows.filter((n) => n.isGlobal);
    if (filter === "personal") return rows.filter((n) => !n.isGlobal);
    return rows;
  }, [rows, filter]);

  const countFor = (key: string) => {
    if (key === "all")       return rows.length;
    if (key === "unread")    return rows.filter((n) => !n.isGlobal && !n.read).length;
    if (key === "global")    return rows.filter((n) => n.isGlobal).length;
    if (key === "personal")  return rows.filter((n) => !n.isGlobal).length;
    return 0;
  };

  // Group by day label
  const groups: { label: string; items: NotifRow[] }[] = [];
  for (const n of filtered) {
    const label = relativeDay(n.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(n);
    else groups.push({ label, items: [n] });
  }

  return (
    <div className="space-y-4">
      {/* Filtre + "Tout marquer lu" */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                filter === f.key
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                filter === f.key ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"
              }`}>
                {countFor(f.key)}
              </span>
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <form action={markAllRead} className="shrink-0">
            <button
              type="submit"
              className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-700 transition shadow-sm"
            >
              ✓ Tout marquer comme lu
            </button>
          </form>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-sm font-semibold text-slate-500">Aucune notification dans cette catégorie</p>
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.label} className="space-y-2">
              {/* Séparateur jour */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0">{group.label}</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {group.items.map((n) => {
                const isUnread = !n.isGlobal && !n.read;
                return (
                  <div
                    key={n.id}
                    className={`rounded-2xl border p-4 flex items-start gap-4 transition-colors shadow-sm ${
                      isUnread
                        ? "border-blue-200 bg-blue-50/50"
                        : n.isGlobal
                        ? "border-amber-100 bg-amber-50/30"
                        : "border-slate-100 bg-white"
                    }`}
                  >
                    {/* Icône */}
                    <span className="text-2xl shrink-0 mt-0.5">
                      {n.isGlobal ? "📢" : autoIcon(n.title)}
                    </span>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className={`text-sm leading-tight ${isUnread ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                          {n.title}
                        </p>
                        {n.isGlobal && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 border border-amber-200">
                            Annonce
                          </span>
                        )}
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">{n.body}</p>
                      <div className="mt-2 flex items-center gap-3 flex-wrap">
                        {n.url && (
                          <a
                            href={n.url}
                            className="text-xs font-semibold text-blue-600 hover:underline"
                          >
                            Ouvrir →
                          </a>
                        )}
                        <span className="text-xs text-slate-300">{formatTime(n.createdAt)}</span>
                      </div>
                    </div>

                    {/* Bouton "Lu" */}
                    {isUnread && (
                      <form action={markOneRead} className="shrink-0">
                        <input type="hidden" name="id" value={n.id} />
                        <button
                          type="submit"
                          className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:border-blue-300 hover:text-blue-600 transition"
                        >
                          Lu
                        </button>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

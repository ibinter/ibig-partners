"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { updateProspectStatus, deleteProspect } from "../actions";

type ProspectRow = {
  id: string;
  name: string;
  contact: string | null;
  note: string | null;
  status: string;
  statusLabel: string;
  productName: string | null;
  date: string;
  daysSince: number;
  priority: string;
};

const COLUMNS = [
  { key: "CONTACTED",  label: "Contacté",  color: "border-amber-400",  bg: "bg-amber-50",  dot: "bg-amber-400",  text: "text-amber-800" },
  { key: "INTERESTED", label: "Intéressé", color: "border-blue-400",   bg: "bg-blue-50",   dot: "bg-blue-500",  text: "text-blue-800" },
  { key: "QUOTE",      label: "Devis",     color: "border-violet-400", bg: "bg-violet-50", dot: "bg-violet-500",text: "text-violet-800" },
  { key: "CONVERTED",  label: "Converti",  color: "border-emerald-400",bg: "bg-emerald-50",dot: "bg-emerald-500",text: "text-emerald-800" },
];

const NEXT: Record<string, string> = {
  CONTACTED: "INTERESTED",
  DEMO: "QUOTE",
  INTERESTED: "QUOTE",
  QUOTE: "CONVERTED",
};

const PRIORITY_DOT: Record<string, string> = {
  HIGH:   "bg-red-500",
  NORMAL: "bg-slate-300",
  LOW:    "bg-blue-300",
};

function groupByColumn(rows: ProspectRow[]) {
  const map: Record<string, ProspectRow[]> = {
    CONTACTED: [], INTERESTED: [], QUOTE: [], CONVERTED: [],
  };
  for (const r of rows) {
    if (r.status === "DEMO") {
      map.INTERESTED.push(r);
    } else if (map[r.status]) {
      map[r.status].push(r);
    }
  }
  return map;
}

export default function KanbanBoard({ rows }: { rows: ProspectRow[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (r.status === "LOST") return false;
        return (
          !search ||
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          (r.contact ?? "").toLowerCase().includes(search.toLowerCase())
        );
      }),
    [rows, search],
  );

  const grouped = useMemo(() => groupByColumn(filtered), [filtered]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="search"
          placeholder="Rechercher un prospect…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
        />
        <span className="text-xs text-slate-400 shrink-0">{filtered.length} prospects</span>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const cards = grouped[col.key] ?? [];
          return (
            <div key={col.key} className={`flex flex-col rounded-2xl border-t-4 ${col.color} bg-white shadow-sm overflow-hidden`}>
              {/* En-tête colonne */}
              <div className={`flex items-center justify-between px-4 py-3 ${col.bg}`}>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                  <span className={`text-xs font-bold ${col.text}`}>{col.label}</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${col.bg} ${col.text} border border-current/20`}>
                  {cards.length}
                </span>
              </div>

              {/* Cartes */}
              <div className="flex flex-col gap-2 p-3 min-h-[200px]">
                {cards.length === 0 && (
                  <p className="text-center text-xs text-slate-300 mt-8">Aucun prospect</p>
                )}
                {cards.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-slate-100 bg-white shadow-sm p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${PRIORITY_DOT[p.priority] ?? "bg-slate-300"}`} />
                        <Link
                          href={`/espace/prospects/${p.id}`}
                          className="text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors truncate"
                        >
                          {p.name}
                        </Link>
                      </div>
                    </div>

                    {p.contact && (
                      <p className="text-[11px] text-slate-400 mb-1 truncate">{p.contact}</p>
                    )}
                    {p.productName && (
                      <p className="text-[10px] font-semibold text-slate-400 mb-1 truncate">🧩 {p.productName}</p>
                    )}
                    {p.note && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mb-2">{p.note}</p>
                    )}

                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-[10px] font-semibold ${
                        p.daysSince > 14 ? "text-rose-500" :
                        p.daysSince > 7  ? "text-amber-500" :
                        "text-slate-400"
                      }`}>
                        {p.daysSince}j
                      </span>
                      <div className="flex gap-1">
                        {NEXT[p.status] && (
                          <form action={updateProspectStatus}>
                            <input type="hidden" name="id" value={p.id} />
                            <input type="hidden" name="status" value={NEXT[p.status]} />
                            <button
                              type="submit"
                              title="Avancer"
                              className="rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1 text-[10px] font-bold transition"
                            >
                              →
                            </button>
                          </form>
                        )}
                        {p.status !== "CONVERTED" && (
                          <form action={updateProspectStatus}>
                            <input type="hidden" name="id" value={p.id} />
                            <input type="hidden" name="status" value="LOST" />
                            <button
                              type="submit"
                              title="Perdu"
                              className="rounded-lg bg-slate-50 hover:bg-red-50 text-slate-300 hover:text-red-400 px-2 py-1 text-[10px] font-bold transition"
                            >
                              ✕
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Perdus */}
      {rows.filter((r) => r.status === "LOST").length > 0 && (
        <details className="rounded-2xl border border-red-100 bg-red-50">
          <summary className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-red-600 cursor-pointer">
            ❌ Prospects perdus
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
              {rows.filter((r) => r.status === "LOST").length}
            </span>
          </summary>
          <div className="px-5 pb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {rows.filter((r) => r.status === "LOST").map((p) => (
              <div key={p.id} className="rounded-xl border border-red-100 bg-white p-3 opacity-70">
                <div className="flex items-center justify-between">
                  <Link href={`/espace/prospects/${p.id}`} className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">
                    {p.name}
                  </Link>
                  <form action={deleteProspect}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="text-slate-300 hover:text-red-400 text-xs transition">🗑</button>
                  </form>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{p.date}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

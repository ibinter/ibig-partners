"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui";
import { Button } from "@/components/button";
import { updateProspectStatus, deleteProspect } from "../actions";

type ProspectRow = {
  id: string;
  name: string;
  contact: string | null;
  note: string | null;
  status: string;
  statusLabel: string;
  statusTone: string;
  productName: string | null;
  date: string;
};

const FILTERS = [
  { key: "all",       label: "Tout",     dot: "bg-slate-400" },
  { key: "CONTACTED", label: "Contacté", dot: "bg-amber-400" },
  { key: "DEMO",      label: "Démo",     dot: "bg-blue-500" },
  { key: "CONVERTED", label: "Converti", dot: "bg-emerald-500" },
  { key: "LOST",      label: "Perdu",    dot: "bg-red-400" },
];

const NEXT_STATUS: Record<string, string> = {
  CONTACTED: "DEMO",
  DEMO: "CONVERTED",
};
const NEXT_LABEL: Record<string, string> = {
  CONTACTED: "→ Démo",
  DEMO: "→ Converti",
};

export default function ProspectsTable({ rows }: { rows: ProspectRow[] }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const matchStatus = filter === "all" || r.status === filter;
        const matchSearch =
          !search ||
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          (r.contact ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (r.productName ?? "").toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
      }),
    [rows, filter, search],
  );

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      {/* Barre de contrôle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center px-5 py-3 border-b border-slate-50">
        <input
          type="search"
          placeholder="Rechercher prospect, contact, produit…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
        />
        <div className="flex gap-1.5 flex-wrap shrink-0">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                filter === f.key
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${filter === f.key ? "bg-white" : f.dot}`} />
              {f.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${filter === f.key ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"}`}>
                {f.key === "all" ? rows.length : rows.filter((r) => r.status === f.key).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-slate-400">
          Aucun prospect pour ces critères.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-400">
              <tr>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide">Prospect</th>
                <th className="px-3 py-3 font-semibold uppercase tracking-wide">Contact</th>
                <th className="px-3 py-3 font-semibold uppercase tracking-wide">Produit</th>
                <th className="px-3 py-3 font-semibold uppercase tracking-wide">Statut</th>
                <th className="px-3 py-3 font-semibold uppercase tracking-wide">Ajouté le</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className={`hover:bg-slate-50/60 transition-colors ${p.status === "LOST" ? "opacity-60" : ""}`}
                >
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-800">{p.name}</p>
                    {p.note && <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{p.note}</p>}
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500">{p.contact ?? "—"}</td>
                  <td className="px-3 py-3 text-xs text-slate-500">{p.productName ?? "—"}</td>
                  <td className="px-3 py-3">
                    <Badge tone={p.statusTone as "gold" | "green" | "blue" | "red" | "gray" | "amber"}>
                      {p.statusLabel}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-400">{p.date}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {NEXT_STATUS[p.status] && (
                        <form action={updateProspectStatus}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="status" value={NEXT_STATUS[p.status]} />
                          <button
                            type="submit"
                            className="rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 text-xs font-semibold transition"
                          >
                            {NEXT_LABEL[p.status]}
                          </button>
                        </form>
                      )}
                      {p.status !== "LOST" && p.status !== "CONVERTED" && (
                        <form action={updateProspectStatus}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="status" value="LOST" />
                          <button
                            type="submit"
                            className="rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 px-2 py-1 text-xs font-semibold transition"
                          >
                            Perdu
                          </button>
                        </form>
                      )}
                      <form action={deleteProspect}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className="rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 px-2 py-1 text-sm transition"
                          title="Supprimer"
                        >
                          🗑
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

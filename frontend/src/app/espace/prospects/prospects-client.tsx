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
  daysSince: number;
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
                  <td className="px-3 py-3">
                    {p.contact ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-500">{p.contact}</span>
                        {/^\+?[\d\s\-().]{7,}$/.test(p.contact) && (
                          <a
                            href={`https://wa.me/${p.contact.replace(/[^0-9+]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-500 hover:text-emerald-600 transition text-base"
                            title="Contacter sur WhatsApp"
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500">{p.productName ?? "—"}</td>
                  <td className="px-3 py-3">
                    <Badge tone={p.statusTone as "gold" | "green" | "blue" | "red" | "gray" | "amber"}>
                      {p.statusLabel}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-xs">
                    <p className="text-slate-400">{p.date}</p>
                    {p.status !== "CONVERTED" && p.status !== "LOST" && p.daysSince > 0 && (
                      <span className={`font-semibold ${
                        p.daysSince > 14 ? "text-rose-500" :
                        p.daysSince > 7  ? "text-amber-500" :
                        "text-slate-400"
                      }`}>
                        {p.daysSince}j
                      </span>
                    )}
                  </td>
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

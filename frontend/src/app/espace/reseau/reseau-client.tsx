"use client";

import { useState, useMemo } from "react";

export type NetworkMember = {
  id: string;
  firstName: string;
  lastName: string;
  code: string;
  status: string;
  statusLabel: string;
  salesCount: number;
  active: boolean;
  approved: boolean;
  level: number;
  createdAt: string;
};

const LEVEL_STYLE: Record<number, { ring: string; text: string; dot: string }> = {
  1: { ring: "border-blue-200 bg-blue-50",    text: "text-blue-700",   dot: "bg-blue-400" },
  2: { ring: "border-violet-200 bg-violet-50", text: "text-violet-700", dot: "bg-violet-400" },
  3: { ring: "border-emerald-200 bg-emerald-50",text: "text-emerald-700",dot: "bg-emerald-400" },
};

const LEVEL_LABEL: Record<number, string> = {
  1: "N1 — Directs",
  2: "N2 — Indirects",
  3: "N3 — 3ème niveau",
};

const FILTERS = [
  { key: "all",    label: "Tous" },
  { key: "1",      label: "N1 Directs" },
  { key: "2",      label: "N2" },
  { key: "3",      label: "N3" },
  { key: "active", label: "Actifs" },
  { key: "inactive", label: "Inactifs" },
];

export default function ReseauClient({ members }: { members: NetworkMember[] }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = members;
    if (filter === "active")   list = list.filter((m) => m.active && m.approved);
    else if (filter === "inactive") list = list.filter((m) => !m.active || !m.approved);
    else if (["1","2","3"].includes(filter)) list = list.filter((m) => String(m.level) === filter);
    const q = search.toLowerCase();
    if (q) list = list.filter((m) =>
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
      m.code.toLowerCase().includes(q)
    );
    return list;
  }, [members, filter, search]);

  const countFor = (key: string) => {
    if (key === "all") return members.length;
    if (key === "active") return members.filter((m) => m.active && m.approved).length;
    if (key === "inactive") return members.filter((m) => !m.active || !m.approved).length;
    return members.filter((m) => String(m.level) === key).length;
  };

  if (members.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-50 px-5 py-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          placeholder="Rechercher par nom ou code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
        />
        <div className="flex gap-1.5 flex-wrap shrink-0">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition ${
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
      </div>

      {filtered.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-400">
          <p className="text-3xl mb-2">👥</p>
          <p>Aucun membre pour ces critères.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-400">
              <tr>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide">Partenaire</th>
                <th className="px-3 py-3 font-semibold uppercase tracking-wide">Niveau</th>
                <th className="px-3 py-3 font-semibold uppercase tracking-wide">Statut</th>
                <th className="px-3 py-3 font-semibold uppercase tracking-wide text-right">Ventes</th>
                <th className="px-3 py-3 font-semibold uppercase tracking-wide">État</th>
                <th className="px-3 py-3 font-semibold uppercase tracking-wide">Inscrit le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((m) => {
                const style = LEVEL_STYLE[m.level] ?? LEVEL_STYLE[1];
                return (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold border ${style.ring} ${style.text}`}>
                          {m.firstName?.[0]}{m.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{m.firstName} {m.lastName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{m.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-xl px-2 py-0.5 text-[10px] font-bold border ${style.ring} ${style.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                        {LEVEL_LABEL[m.level]}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500">{m.statusLabel}</td>
                    <td className="px-3 py-3 text-right">
                      <span className={`font-bold text-sm ${m.salesCount > 0 ? "text-emerald-700" : "text-slate-300"}`}>
                        {m.salesCount}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {!m.approved ? (
                        <span className="rounded-xl bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold">En validation</span>
                      ) : m.active ? (
                        <span className="rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold">✓ Actif</span>
                      ) : (
                        <span className="rounded-xl bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold">Inactif</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-400">{m.createdAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";

type SaleRow = {
  id: string;
  reference: string;
  productName: string;
  customerName: string;
  amount: number;
  amountDisplay: string;
  status: string;
  statusLabel: string;
  channel: string | null;
  proofUrl: string | null;
  date: string;
};

const FILTERS = [
  { key: "all",       label: "Tout",        dot: "bg-slate-400" },
  { key: "PENDING",   label: "En attente",  dot: "bg-amber-400" },
  { key: "CONFIRMED", label: "Confirmée",   dot: "bg-emerald-500" },
  { key: "REJECTED",  label: "Rejetée",     dot: "bg-rose-400" },
];

const STATUS_STYLE: Record<string, string> = {
  PENDING:   "bg-amber-100 text-amber-800 border border-amber-200",
  CONFIRMED: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  REJECTED:  "bg-rose-100 text-rose-800 border border-rose-200",
};

export default function VentesTable({ rows }: { rows: SaleRow[] }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() =>
    rows.filter((r) => {
      const matchStatus = filter === "all" || r.status === filter;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        r.productName.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.reference.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    }),
    [rows, filter, search]
  );

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      {/* Barre contrôle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center px-5 py-3 border-b border-slate-50">
        <input
          type="search"
          placeholder="Rechercher référence, produit, client…"
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
        <div className="py-12 text-center text-sm text-slate-400">
          <p className="text-3xl mb-3">📋</p>
          <p>Aucune vente pour ces critères.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-400">
              <tr>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide">Référence</th>
                <th className="px-3 py-3 font-semibold uppercase tracking-wide">Produit</th>
                <th className="px-3 py-3 font-semibold uppercase tracking-wide">Client</th>
                <th className="px-3 py-3 font-semibold uppercase tracking-wide text-right">Montant</th>
                <th className="px-3 py-3 font-semibold uppercase tracking-wide">Statut</th>
                <th className="px-3 py-3 font-semibold uppercase tracking-wide">Date</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3">
                    <span className="font-mono text-xs text-slate-400">{s.reference}</span>
                  </td>
                  <td className="px-3 py-3 font-semibold text-slate-800 max-w-[160px] truncate">{s.productName}</td>
                  <td className="px-3 py-3">
                    <p className="text-slate-700 font-medium">{s.customerName}</p>
                    {s.channel && <p className="text-[11px] text-slate-400 mt-0.5">{s.channel}</p>}
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-slate-800">{s.amountDisplay}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center rounded-xl px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[s.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {s.statusLabel}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-400">{s.date}</td>
                  <td className="px-3 py-3">
                    {s.proofUrl && (
                      <a
                        href={s.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-600 hover:underline font-semibold"
                      >
                        Preuve →
                      </a>
                    )}
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

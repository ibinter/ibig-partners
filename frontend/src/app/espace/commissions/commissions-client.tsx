"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui";

type CommissionRow = {
  id: string;
  reference: string;
  productName: string;
  pricingType: string;
  level: number;
  monthIndex: number | null;
  rate: number;
  amount: number;
  status: string;
  statusLabel: string;
  statusTone: string;
  date: string;
  amountDisplay: string;
  rateDisplay: string;
};

const FILTERS = [
  { key: "all",       label: "Tout" },
  { key: "PENDING",   label: "⏳ En attente" },
  { key: "VALIDATED", label: "✔️ Validées" },
  { key: "PAID",      label: "💸 Versées" },
];

export default function CommissionsTable({ rows }: { rows: CommissionRow[] }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const matchStatus = filter === "all" || r.status === filter;
        const matchSearch =
          !search ||
          r.productName.toLowerCase().includes(search.toLowerCase()) ||
          r.reference.toLowerCase().includes(search.toLowerCase());
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
          placeholder="Rechercher produit ou réf…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
        />
        <div className="flex gap-1.5 shrink-0 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                filter === f.key
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="shrink-0 text-xs text-slate-400">
          {filtered.length} entrée{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-slate-400">
          Aucune commission pour ces critères.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-400">
              <tr>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide">Produit</th>
                <th className="px-3 py-3 font-semibold uppercase tracking-wide">Réf.</th>
                <th className="px-3 py-3 font-semibold uppercase tracking-wide">Niv.</th>
                <th className="px-3 py-3 font-semibold uppercase tracking-wide">Taux</th>
                <th className="px-3 py-3 font-semibold uppercase tracking-wide text-right">Montant</th>
                <th className="px-3 py-3 font-semibold uppercase tracking-wide">Statut</th>
                <th className="px-3 py-3 font-semibold uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className={`hover:bg-slate-50/60 transition-colors ${
                    c.status === "PAID" ? "opacity-70" : ""
                  }`}
                >
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-800">{c.productName}</p>
                    {c.pricingType === "MONTHLY_SUB" && c.monthIndex && (
                      <p className="text-[11px] text-slate-400">Mois {c.monthIndex}</p>
                    )}
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-400">{c.reference}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      c.level === 1 ? "bg-blue-100 text-blue-700" :
                      c.level === 2 ? "bg-violet-100 text-violet-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {c.level}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-500">{c.rateDisplay}</td>
                  <td className="px-3 py-3 font-bold text-slate-800 text-right">{c.amountDisplay}</td>
                  <td className="px-3 py-3">
                    <Badge tone={c.statusTone as "gold" | "green" | "blue" | "red" | "gray"}>
                      {c.statusLabel}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-400">{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

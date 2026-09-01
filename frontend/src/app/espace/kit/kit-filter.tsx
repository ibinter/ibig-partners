"use client";

import { useState, useMemo } from "react";
import KitCard from "./kit-card";

interface Kit {
  id: string;
  title: string;
  type: string;
  content: string;
  branch?: { name: string } | null;
  product?: { name: string } | null;
}

interface AffiliateInfo {
  name: string;
  code: string;
  phone: string;
  email: string;
}

const TYPE_FILTERS = [
  { key: "all",     label: "Tout",           icon: "🗂️" },
  { key: "ARGUMENT", label: "Argumentaires", icon: "💬" },
  { key: "VISUAL",   label: "Visuels",       icon: "🖼️" },
  { key: "VIDEO",    label: "Vidéos",        icon: "🎥" },
];

export default function KitFilter({
  kits,
  affiliate,
}: {
  kits: Kit[];
  affiliate: AffiliateInfo;
}) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = kits;
    if (typeFilter !== "all") list = list.filter((k) => k.type === typeFilter);
    const q = search.toLowerCase();
    if (q) list = list.filter((k) =>
      k.title.toLowerCase().includes(q) ||
      (k.branch?.name ?? "").toLowerCase().includes(q) ||
      (k.product?.name ?? "").toLowerCase().includes(q)
    );
    return list;
  }, [kits, typeFilter, search]);

  const countFor = (key: string) =>
    key === "all" ? kits.length : kits.filter((k) => k.type === key).length;

  return (
    <div className="space-y-4">
      {/* Barre de filtres */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          placeholder="Rechercher une ressource…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
        />
        <div className="flex gap-1.5 flex-wrap shrink-0">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setTypeFilter(f.key)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                typeFilter === f.key
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>{f.icon}</span>
              {f.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                typeFilter === f.key ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"
              }`}>
                {countFor(f.key)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm font-semibold text-slate-500">Aucune ressource pour ces critères</p>
          <p className="text-xs text-slate-400 mt-1">Essayez un autre filtre ou effacez la recherche.</p>
        </div>
      ) : (
        <div className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((k) => (
            <KitCard key={k.id} kit={k as any} affiliate={affiliate} />
          ))}
        </div>
      )}
    </div>
  );
}

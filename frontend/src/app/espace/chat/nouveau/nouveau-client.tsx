"use client";

import { useState, useMemo } from "react";
import { StartConversationButton } from "./StartConversationButton";

type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  statusLabel: string;
  photoUrl: string | null;
  city: string | null;
  salesCount: number;
};

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const initials = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return (
    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold text-lg shadow">
      {initials.toUpperCase() || "?"}
    </div>
  );
}

export default function NouveauClient({ contacts }: { contacts: Contact[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      (c.city ?? "").toLowerCase().includes(q)
    );
  }, [contacts, search]);

  return (
    <div className="space-y-4">
      {contacts.length > 4 && (
        <input
          type="search"
          placeholder="Rechercher par nom ou ville…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
        />
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm text-slate-400">Aucun résultat pour « {search} »</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm hover:border-blue-200 hover:shadow-md transition"
            >
              {c.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.photoUrl}
                  alt={`${c.firstName} ${c.lastName}`}
                  loading="lazy"
                  decoding="async"
                  className="mb-3 h-16 w-16 rounded-full object-cover shadow"
                />
              ) : (
                <Initials name={`${c.firstName} ${c.lastName}`} />
              )}

              <p className="font-semibold text-slate-800 text-sm">{c.firstName} {c.lastName}</p>

              <span className="mt-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                {c.statusLabel}
              </span>

              <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                {c.city && <span>📍 {c.city}</span>}
                <span className={`font-semibold ${c.salesCount > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                  {c.salesCount} vente{c.salesCount !== 1 ? "s" : ""}
                </span>
              </div>

              <StartConversationButton targetUserId={c.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

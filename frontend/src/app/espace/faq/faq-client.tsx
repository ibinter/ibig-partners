"use client";

import { useState, useMemo } from "react";

export type FaqItem = { q: string; a: string };
export type FaqCategory = { icon: string; title: string; items: FaqItem[] };

export default function FaqClient({ categories }: { categories: FaqCategory[] }) {
  const [search, setSearch]   = useState("");
  const [open, setOpen]       = useState<string | null>(null);
  const [activeTab, setTab]   = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            (!q || item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)) &&
            (!activeTab || cat.title === activeTab),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [search, activeTab, categories]);

  const total = categories.reduce((s, c) => s + c.items.length, 0);

  return (
    <div className="space-y-6">
      {/* Barre de recherche */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setTab(null); }}
          placeholder="Rechercher parmi les 100 questions…"
          className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-lg"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filtres catégories */}
      {!search && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTab(null)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${!activeTab ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Tout ({total})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.title}
              onClick={() => setTab(activeTab === cat.title ? null : cat.title)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${activeTab === cat.title ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {cat.icon} {cat.title} ({cat.items.length})
            </button>
          ))}
        </div>
      )}

      {/* Résultats */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-3xl mb-3">🤔</p>
          <p className="text-sm font-semibold text-slate-700">Aucune question trouvée pour « {search} »</p>
          <p className="text-xs text-slate-400 mt-1">Essayez des termes différents ou contactez le support.</p>
        </div>
      ) : (
        filtered.map((cat) => (
          <div key={cat.title} className="space-y-2">
            {(!search) && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{cat.icon}</span>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">{cat.title}</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{cat.items.length}</span>
              </div>
            )}
            {cat.items.map((item, i) => {
              const id = `${cat.title}-${i}`;
              const isOpen = open === id;
              return (
                <div
                  key={id}
                  className={`rounded-2xl border transition-all ${isOpen ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : id)}
                    className="w-full flex items-start gap-3 px-4 py-3.5 text-left"
                  >
                    <span className={`mt-0.5 shrink-0 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black transition ${isOpen ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {isOpen ? "−" : "+"}
                    </span>
                    <span className={`text-sm font-semibold leading-snug ${isOpen ? "text-blue-900" : "text-slate-800"}`}>
                      {item.q}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pl-12">
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))
      )}

      {/* Footer */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 flex items-start gap-3">
        <span className="text-2xl shrink-0">💬</span>
        <div>
          <p className="text-sm font-semibold text-slate-800">Votre question n'est pas là ?</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Contactez notre équipe via le <a href="/espace/support" className="font-bold text-blue-600 underline">Support</a> ou rejoignez le groupe WhatsApp IBIG PARTNERS.
          </p>
        </div>
      </div>
    </div>
  );
}

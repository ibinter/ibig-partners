"use client";

import { useState, useTransition } from "react";
import { moveProspect, deleteProspect } from "./actions";

const COLUMNS: { key: string; label: string; color: string; bg: string; border: string }[] = [
  { key: "CONTACTED",  label: "Contacté",    color: "text-slate-600",   bg: "bg-slate-50",   border: "border-slate-200" },
  { key: "INTERESTED", label: "Intéressé",   color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200" },
  { key: "QUOTE",      label: "Devis",       color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-200" },
  { key: "DEMO",       label: "Démo / RDV",  color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200" },
  { key: "CONVERTED",  label: "Converti ✓",  color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { key: "LOST",       label: "Perdu",       color: "text-rose-500",    bg: "bg-rose-50",    border: "border-rose-200" },
];

type Prospect = { id: string; name: string; contact: string | null; status: string; priority: string; note: string | null };

export default function KanbanClient({ initialProspects }: { initialProspects: Prospect[] }) {
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects);
  const [dragging, setDragging]   = useState<string | null>(null);
  const [, startTransition]       = useTransition();

  function handleDragStart(id: string) {
    setDragging(id);
  }

  function handleDrop(colKey: string) {
    if (!dragging) return;
    const p = prospects.find((x) => x.id === dragging);
    if (!p || p.status === colKey) { setDragging(null); return; }

    setProspects((prev) => prev.map((x) => x.id === dragging ? { ...x, status: colKey } : x));
    setDragging(null);

    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", dragging);
      fd.set("status", colKey);
      await moveProspect(fd);
    });
  }

  function handleDelete(id: string) {
    setProspects((prev) => prev.filter((x) => x.id !== id));
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      await deleteProspect(fd);
    });
  }

  const PRIORITY_DOT: Record<string, string> = {
    HIGH: "bg-rose-400", NORMAL: "bg-slate-300", LOW: "bg-slate-200",
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3" style={{ minWidth: "900px" }}>
        {COLUMNS.map((col) => {
          const cards = prospects.filter((p) => p.status === col.key);
          return (
            <div
              key={col.key}
              className={`flex-1 min-w-[140px] rounded-2xl border ${col.border} ${col.bg} p-3 flex flex-col gap-2`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col.key)}
            >
              <div className="flex items-center justify-between mb-1">
                <p className={`text-[11px] font-bold uppercase tracking-wider ${col.color}`}>{col.label}</p>
                <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 bg-white/70 ${col.color}`}>{cards.length}</span>
              </div>

              {cards.map((p) => (
                <div
                  key={p.id}
                  draggable
                  onDragStart={() => handleDragStart(p.id)}
                  className="rounded-xl bg-white border border-slate-100 shadow-sm p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow select-none"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[p.priority] ?? "bg-slate-200"}`} />
                      <p className="text-xs font-semibold text-slate-800 truncate">{p.name}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="shrink-0 text-slate-300 hover:text-rose-500 transition-colors text-[10px] leading-none"
                      title="Supprimer"
                    >✕</button>
                  </div>
                  {p.contact && <p className="mt-1 text-[10px] text-slate-400 truncate">{p.contact}</p>}
                  {p.note && <p className="mt-1 text-[10px] text-slate-400 italic line-clamp-2">{p.note}</p>}

                  {/* Boutons statut rapide */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {COLUMNS.filter((c) => c.key !== p.status).slice(0, 2).map((c) => (
                      <button
                        key={c.key}
                        onClick={() => {
                          setProspects((prev) => prev.map((x) => x.id === p.id ? { ...x, status: c.key } : x));
                          startTransition(async () => {
                            const fd = new FormData();
                            fd.set("id", p.id);
                            fd.set("status", c.key);
                            await moveProspect(fd);
                          });
                        }}
                        className={`text-[9px] rounded-full px-2 py-0.5 font-semibold border ${c.border} ${c.color} ${c.bg} hover:opacity-80 transition`}
                      >
                        → {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {cards.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-slate-200/70 py-6 text-center text-[10px] text-slate-400">
                  Déposer ici
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

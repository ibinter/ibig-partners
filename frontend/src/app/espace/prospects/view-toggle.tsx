"use client";

import { useState } from "react";
import ProspectsTable from "./prospects-client";
import KanbanBoard from "./kanban-client";

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
  priority: string;
};

export default function ViewToggle({ rows }: { rows: ProspectRow[] }) {
  const [view, setView] = useState<"table" | "kanban">("kanban");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">
          {rows.length} prospect{rows.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setView("kanban")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              view === "kanban" ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current" fill="none">
              <rect x="1" y="1" width="4" height="14" rx="1"/>
              <rect x="6" y="1" width="4" height="10" rx="1"/>
              <rect x="11" y="1" width="4" height="12" rx="1"/>
            </svg>
            Kanban
          </button>
          <button
            onClick={() => setView("table")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              view === "table" ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current">
              <rect x="1" y="1" width="14" height="3" rx="1"/>
              <rect x="1" y="5" width="14" height="3" rx="1" opacity=".6"/>
              <rect x="1" y="9" width="14" height="3" rx="1" opacity=".4"/>
              <rect x="1" y="13" width="14" height="2" rx="1" opacity=".2"/>
            </svg>
            Liste
          </button>
        </div>
      </div>

      {view === "kanban" ? (
        <KanbanBoard rows={rows} />
      ) : (
        <ProspectsTable rows={rows} />
      )}
    </div>
  );
}

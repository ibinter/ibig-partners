"use client";

import { useState, useTransition } from "react";
import { importProspectsFromCsv } from "./actions";

export default function CsvImport() {
  const [open, setOpen]       = useState(false);
  const [csv, setCsv]         = useState("");
  const [result, setResult]   = useState<{ imported: number } | null>(null);
  const [, startTransition]   = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!csv.trim()) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("csv", csv);
      const r = await importProspectsFromCsv(fd);
      setResult(r);
      setCsv("");
      setTimeout(() => { setResult(null); setOpen(false); }, 2000);
    });
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
      >
        📥 Importer CSV
      </button>

      {open && (
        <div className="mt-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-700 mb-1">Coller un CSV (colonnes : nom, téléphone, email)</p>
          <p className="text-[11px] text-slate-400 mb-3">Exemple : Jean Dupont,+225 07 00 00 00,jean@example.com</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              rows={5}
              placeholder={"Jean Dupont,+225 07 00 00 00,jean@example.com\nMarie Koné,+225 05 11 22 33,"}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex items-center gap-2">
              <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700">
                Importer
              </button>
              <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-500 hover:text-slate-700">
                Annuler
              </button>
              {result && (
                <p className="text-xs text-emerald-600 font-semibold">✓ {result.imported} prospect(s) importé(s)</p>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

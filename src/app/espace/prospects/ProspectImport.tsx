"use client";

import { useState, useRef } from "react";
import { importProspects } from "../actions";

export function ProspectImport() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const lineCount = text.split(/\r?\n/).filter((l) => l.trim()).length;

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result ?? "");
      setText((prev) => (prev.trim() ? prev + "\n" + content : content));
    };
    reader.readAsText(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    const fd = new FormData();
    fd.set("data", text);
    await importProspects(fd);
    setSubmitting(false);
    setText("");
    setFileName("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M12 3v12" /><path d="m8 11 4 4 4-4" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
        Importer des contacts
      </button>
    );
  }

  return (
    <div className="card-premium p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">Importer des prospects / contacts</h3>
          <p className="mt-0.5 text-xs text-muted">
            Collez vos contacts ou importez un fichier CSV. Format par ligne :{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px]">Nom, Téléphone, Note</code>
          </p>
        </div>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600" aria-label="Fermer">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            📎 Choisir un fichier CSV
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt,text/csv,text/plain"
            onChange={onFile}
            className="hidden"
          />
          {fileName && <span className="text-xs text-emerald-600 font-medium">✓ {fileName}</span>}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          placeholder={"Kouassi Yao, 0700000000, Intéressé par Scolaby\nAya Traoré, aya@email.com\nMoussa Diabaté, 0500000000, Démo prévue lundi"}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-xs outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
        />

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted">
            {lineCount > 0 ? `${lineCount} contact${lineCount > 1 ? "s" : ""} prêt${lineCount > 1 ? "s" : ""} à importer` : "Aucune ligne détectée"}
          </span>
          <button
            type="submit"
            disabled={submitting || lineCount === 0}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Import en cours…" : `Importer ${lineCount || ""} contacts`}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";

type Props = {
  name: string;
  defaultUrl?: string | null;
  folder?: string;
  accept?: string;
  label?: string;
  hint?: string;
  preview?: "image" | "none";
  maxMb?: number;
};

export function FileUpload({
  name,
  defaultUrl,
  folder = "ibig-misc",
  accept = "image/jpeg,image/png,image/webp,application/pdf",
  label,
  hint,
  preview = "image",
  maxMb = 10,
}: Props) {
  const [url, setUrl]       = useState(defaultUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.size > maxMb * 1024 * 1024) {
      setError(`Fichier trop volumineux (max ${maxMb} Mo)`);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);
      const res  = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur upload"); return; }
      setUrl(data.url);
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  const isImage    = url && !url.endsWith(".pdf");
  const isPdf      = url && url.endsWith(".pdf");
  const hasPreview = preview === "image" && isImage;

  return (
    <div className="space-y-2">
      {label && <p className="text-xs font-semibold text-slate-600">{label}</p>}

      {/* Hidden input pour le formulaire server */}
      <input type="hidden" name={name} value={url} />

      {/* Zone de dépôt */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-5 text-center transition-colors ${
          loading
            ? "border-blue-300 bg-blue-50"
            : url
            ? "border-emerald-300 bg-emerald-50 hover:bg-emerald-100"
            : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
        />

        {loading ? (
          <>
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="text-xs text-blue-600 font-semibold">Upload en cours…</p>
          </>
        ) : hasPreview ? (
          <>
            <img src={url} alt="Aperçu" className="h-24 w-24 rounded-xl object-cover shadow" />
            <p className="text-xs text-emerald-700 font-semibold">✓ Fichier chargé — cliquez pour changer</p>
          </>
        ) : url ? (
          <>
            <span className="text-3xl">{isPdf ? "📄" : "🖼️"}</span>
            <p className="text-xs text-emerald-700 font-semibold">✓ Fichier chargé</p>
            <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{url.split("/").pop()}</p>
            <p className="text-[11px] text-slate-400">Cliquez pour remplacer</p>
          </>
        ) : (
          <>
            <span className="text-3xl text-slate-300">📎</span>
            <p className="text-xs font-semibold text-slate-500">Cliquez ou glissez un fichier ici</p>
            <p className="text-[11px] text-slate-400">JPEG, PNG, PDF · max {maxMb} Mo</p>
          </>
        )}
      </div>

      {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
      {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

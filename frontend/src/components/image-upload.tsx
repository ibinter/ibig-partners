"use client";

import { useRef, useState } from "react";

export function ImageUpload({
  name,
  label = "Image illustrative",
  required = false,
}: {
  name: string;
  label?: string;
  required?: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    setPreview(URL.createObjectURL(file));

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur upload");
      setUrl(data.url);
    } catch (e: any) {
      setError(e.message);
      setPreview(null);
    } finally {
      setUploading(false);
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

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
        {!required && <span className="ml-1 text-xs font-normal text-slate-400">(optionnel)</span>}
      </label>

      {/* hidden field that carries the uploaded URL to the server action */}
      <input type="hidden" name={name} value={url} />

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200">
          <img src={preview} alt="aperçu" className="w-full h-48 object-cover" />
          {uploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-sm font-semibold text-slate-600 animate-pulse">Envoi en cours…</span>
            </div>
          )}
          {!uploading && (
            <button
              type="button"
              onClick={() => { setPreview(null); setUrl(""); if (inputRef.current) inputRef.current.value = ""; }}
              className="absolute top-2 right-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-700 shadow hover:bg-white"
            >
              ✕ Changer
            </button>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-8 cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors"
        >
          <span className="text-3xl">🖼️</span>
          <p className="text-sm font-semibold text-slate-600">Cliquez ou glissez une image ici</p>
          <p className="text-xs text-slate-400">JPG, PNG, WEBP — max 5 Mo</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleChange}
      />

      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

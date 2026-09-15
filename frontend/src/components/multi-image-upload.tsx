"use client";

import { useRef, useState } from "react";

type UploadedImage = { url: string; uploading?: boolean };

export function MultiImageUpload({
  name,
  mainName,
  label = "Images",
  maxImages = 6,
}: {
  name: string;        // hidden field for JSON array of all URLs
  mainName: string;    // hidden field for main image URL
  label?: string;
  maxImages?: number;
}) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const mainUrl = images[0]?.url ?? "";
  const allUrls = images.filter(i => !i.uploading).map(i => i.url);

  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Erreur upload");
    return data.url as string;
  }

  async function handleFiles(files: FileList) {
    setError(null);
    const remaining = maxImages - images.length;
    const toUpload = Array.from(files).slice(0, remaining);

    // Add placeholders
    const placeholders: UploadedImage[] = toUpload.map(() => ({ url: "", uploading: true }));
    setImages(prev => [...prev, ...placeholders]);

    for (let i = 0; i < toUpload.length; i++) {
      try {
        const url = await uploadFile(toUpload[i]);
        setImages(prev => {
          const updated = [...prev];
          // Find first uploading slot
          const idx = updated.findIndex(x => x.uploading);
          if (idx !== -1) updated[idx] = { url };
          return updated;
        });
      } catch (e: any) {
        setError(e.message);
        setImages(prev => {
          const updated = [...prev];
          const idx = updated.findIndex(x => x.uploading);
          if (idx !== -1) updated.splice(idx, 1);
          return updated;
        });
      }
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) handleFiles(e.target.files);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  }

  function remove(idx: number) {
    setImages(prev => prev.filter((_, i) => i !== idx));
  }

  function makeMain(idx: number) {
    setImages(prev => {
      const updated = [...prev];
      const [item] = updated.splice(idx, 1);
      return [item, ...updated];
    });
  }

  const ready = images.filter(i => !i.uploading);
  const uploading = images.some(i => i.uploading);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label} <span className="text-xs font-normal text-slate-400">(max {maxImages} — optionnel)</span>
      </label>

      {/* Hidden fields */}
      <input type="hidden" name={mainName} value={mainUrl} />
      <input type="hidden" name={name} value={JSON.stringify(allUrls)} />

      {/* Image grid */}
      {images.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100">
              {img.uploading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-slate-400 animate-pulse">Envoi…</span>
                </div>
              ) : (
                <>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  {/* Main badge */}
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 rounded-full bg-brand-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                      ★ Principal
                    </span>
                  )}
                  {/* Actions */}
                  <div className="absolute bottom-0 inset-x-0 flex gap-1 p-1 bg-black/40">
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => makeMain(idx)}
                        title="Mettre en principal"
                        className="flex-1 rounded text-[9px] font-bold text-white bg-brand-600/80 hover:bg-brand-600 py-0.5"
                      >
                        ★ Principal
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      className="rounded px-1.5 py-0.5 text-[9px] font-bold text-white bg-rose-500/80 hover:bg-rose-500"
                    >
                      ✕
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Add more slot */}
          {images.length < maxImages && !uploading && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-1 hover:border-brand-400 hover:bg-brand-50 transition-colors"
            >
              <span className="text-xl">+</span>
              <span className="text-[10px] text-slate-400">Ajouter</span>
            </button>
          )}
        </div>
      )}

      {/* Drop zone (shown only when no images yet) */}
      {images.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-8 cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors"
        >
          <span className="text-3xl">🖼️</span>
          <p className="text-sm font-semibold text-slate-600">Cliquez ou glissez vos images ici</p>
          <p className="text-xs text-slate-400">JPG, PNG, WEBP — max 5 Mo par image — jusqu&apos;à {maxImages} images</p>
          <p className="text-xs text-slate-400">La 1ère image sera l&apos;image principale</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleChange}
      />

      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
      {ready.length > 0 && (
        <p className="mt-1 text-xs text-slate-400">
          {ready.length} image{ready.length > 1 ? "s" : ""} — la première est l&apos;image principale
        </p>
      )}
    </div>
  );
}

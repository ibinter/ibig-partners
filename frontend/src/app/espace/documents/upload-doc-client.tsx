"use client";

import { useState, useRef } from "react";

type UploadedDoc = { name: string; url: string; uploadedAt: string };

export default function UploadDocClient({ userId }: { userId: string }) {
  const [docs, setDocs]     = useState<UploadedDoc[]>([]);
  const [loading, setLoad]  = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const inputRef            = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Fichier trop volumineux (max 5 Mo)"); return; }
    setError(null);
    setLoad(true);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("userId", userId);

    try {
      const res = await fetch("/api/documents/upload", { method: "POST", body: fd });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Erreur upload"); return; }
      const data = await res.json();
      setDocs((prev) => [{ name: file.name, url: data.url, uploadedAt: new Date().toISOString() }, ...prev]);
    } catch {
      setError("Erreur réseau lors de l'upload");
    } finally {
      setLoad(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
      <h3 className="font-semibold text-blue-900 text-sm mb-1">📤 Déposer un document signé</h3>
      <p className="text-xs text-blue-700 mb-4">Contrat signé, attestation, justificatif — PDF ou image, max 5 Mo</p>

      <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed px-4 py-4 transition-colors ${
        loading ? "border-blue-200 bg-white/50" : "border-blue-300 bg-white hover:border-blue-500"
      }`}>
        <span className="text-2xl">{loading ? "⏳" : "📁"}</span>
        <div>
          <p className="text-sm font-semibold text-blue-800">{loading ? "Envoi en cours…" : "Sélectionner un fichier"}</p>
          <p className="text-xs text-blue-500">PDF, JPG, PNG — max 5 Mo</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={handleFile}
          disabled={loading}
        />
      </label>

      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}

      {docs.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-bold text-blue-800">Documents envoyés cette session :</p>
          {docs.map((d, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-white border border-blue-100 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-base">✅</span>
                <p className="text-xs font-medium text-slate-700 truncate max-w-[200px]">{d.name}</p>
              </div>
              <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                Voir →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

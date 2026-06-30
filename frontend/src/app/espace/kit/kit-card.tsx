"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";

interface Kit {
  id: string;
  title: string;
  type: string;
  content: string;
  branch?: { name: string } | null;
  product?: { name: string } | null;
}

interface AffiliateInfo {
  name: string;
  code: string;
  phone: string;
  email: string;
}

const TYPE_LABELS: Record<string, string> = {
  ARGUMENT: "Argumentaire",
  VISUAL: "Visuel",
  VIDEO: "Vidéo",
};

const TYPE_TONE: Record<string, "blue" | "green" | "amber"> = {
  ARGUMENT: "blue",
  VISUAL: "green",
  VIDEO: "amber",
};

function personalise(text: string, aff: AffiliateInfo) {
  return text
    .replace(/\[NOM PARTENAIRE\]/gi, aff.name)
    .replace(/\[MON NOM\]/gi, aff.name)
    .replace(/\[CODE\]/gi, aff.code)
    .replace(/\[MON CODE\]/gi, aff.code)
    .replace(/\[CODE PARTENAIRE\]/gi, aff.code)
    .replace(/\[TELEPHONE\]/gi, aff.phone)
    .replace(/\[EMAIL\]/gi, aff.email)
    .replace(/\[MON EMAIL\]/gi, aff.email);
}

export default function KitCard({ kit, affiliate }: { kit: Kit; affiliate: AffiliateInfo }) {
  const [copied, setCopied] = useState(false);
  const [customText, setCustomText] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const isArgument = kit.type === "ARGUMENT";
  const isVisual = kit.type === "VISUAL";
  const isVideo = kit.type === "VIDEO";

  const personalisedContent = isArgument ? personalise(kit.content, affiliate) : kit.content;
  const displayContent = customText ?? personalisedContent;

  function handleCopy() {
    navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function startEdit() {
    setEditValue(displayContent);
    setEditing(true);
  }

  function saveEdit() {
    setCustomText(editValue);
    setEditing(false);
  }

  function resetEdit() {
    setCustomText(null);
    setEditing(false);
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-5 pt-5">
        <Badge tone={TYPE_TONE[kit.type] ?? "blue"}>{TYPE_LABELS[kit.type] ?? kit.type}</Badge>
        <span className="truncate text-xs font-medium text-slate-400">
          {kit.branch?.name ?? kit.product?.name ?? "Général"}
        </span>
      </div>
      <h3 className="px-5 pt-2 font-semibold text-slate-800 leading-snug text-sm">{kit.title}</h3>

      {/* VISUAL */}
      {isVisual && (
        <div className="mt-3 px-5 pb-5 space-y-3">
          <div className="aspect-video w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={kit.content} alt={kit.title} className="h-full w-full object-contain" />
          </div>
          <div className="flex gap-2">
            <a
              href={kit.content}
              download
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700 transition"
            >
              📥 Télécharger
            </a>
            <a
              href={kit.content}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-teal-400 hover:text-teal-700 transition"
            >
              🔍 Plein écran
            </a>
          </div>
        </div>
      )}

      {/* VIDEO */}
      {isVideo && (
        <div className="mt-3 px-5 pb-5">
          <a
            href={kit.content}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg transition-transform group-hover:scale-110">
              <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-6 w-6"><path d="M8 5v14l11-7z" /></svg>
            </span>
            <span className="absolute bottom-2 left-3 text-xs font-medium text-white/80">▶ Voir la vidéo</span>
          </a>
        </div>
      )}

      {/* ARGUMENT */}
      {isArgument && (
        <div className="mt-3 flex flex-1 flex-col px-5 pb-5 space-y-3">
          {/* Tag personnalisation */}
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5">
            <span className="text-xs text-blue-600">✨ Personnalisé pour <strong>{affiliate.name}</strong> · <span className="font-mono">{affiliate.code}</span></span>
          </div>

          {/* Contenu */}
          {editing ? (
            <div className="space-y-2">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={8}
                className="w-full rounded-xl border border-blue-200 bg-white p-3 text-sm text-slate-700 leading-relaxed resize-y focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <div className="flex gap-2">
                <button onClick={saveEdit} className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition">
                  ✓ Enregistrer ma version
                </button>
                <button onClick={resetEdit} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 rounded-xl bg-slate-50 p-4">
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap line-clamp-6">{displayContent}</p>
            </div>
          )}

          {!editing && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCopy}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  copied
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {copied ? "✓ Copié !" : "📋 Copier"}
              </button>
              <button
                onClick={startEdit}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-700 transition"
              >
                ✏️ Adapter
              </button>
              {customText && (
                <button
                  onClick={resetEdit}
                  className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition"
                >
                  ↺ Original
                </button>
              )}
            </div>
          )}

          {/* WhatsApp & partage */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(displayContent)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100 transition"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" /></svg>
            Partager sur WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}

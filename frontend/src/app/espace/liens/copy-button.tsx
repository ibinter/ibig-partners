"use client";

import { useState } from "react";

export default function CopyButton({ text, label = "Copier" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard indisponible */
        }
      }}
      className="rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
    >
      {copied ? "✓ Copié !" : label}
    </button>
  );
}

export function LiensQuickCopy({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch { /* clipboard indisponible */ }
      }}
      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
        copied
          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
          : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
      }`}
    >
      {copied ? "✓ Copié !" : "📋 Copier"}
    </button>
  );
}

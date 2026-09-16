"use client";

import { useState } from "react";

export function DescriptionBlock({ text, maxLines = 8 }: { text: string; maxLines?: number }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;

  type Block = { type: "heading" | "bullet" | "text"; content: string };

  const rawLines = text.split(/\n/).flatMap(line => {
    const parts = line.split(/(?=\s*•\s)/);
    return parts.map(p => p.trim()).filter(p => p && !/^[*\-–—]+$/.test(p));
  });

  const blocks: Block[] = rawLines.map(line => {
    const clean = line.replace(/^[•\-]\s*/, "").trim();
    if (/^\d+[.)]\s/.test(clean)) return { type: "heading", content: clean };
    if (/^[•]/.test(line.trimStart())) return { type: "bullet", content: clean };
    return { type: "text", content: clean };
  });

  const isLong = blocks.length > maxLines;
  const visible = expanded || !isLong ? blocks : blocks.slice(0, maxLines);

  const rendered: React.ReactNode[] = [];
  let bulletGroup: string[] = [];

  const flushBullets = (key: string) => {
    if (bulletGroup.length === 0) return;
    rendered.push(
      <ul key={key} className="mt-1 mb-2 space-y-1 pl-1">
        {bulletGroup.map((c, j) => (
          <li key={j} className="flex items-start gap-2.5">
            <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
            <span className="text-sm text-slate-600 leading-relaxed">{c}</span>
          </li>
        ))}
      </ul>
    );
    bulletGroup = [];
  };

  visible.forEach((b, i) => {
    if (b.type === "heading") {
      flushBullets(`bgroup-${i}`);
      rendered.push(
        <div key={i} className="flex items-center gap-2 mt-4 first:mt-0 mb-1">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-blue-600 text-[10px] font-extrabold text-white">
            {b.content.match(/^(\d+)/)?.[1]}
          </span>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-700 leading-tight">
            {b.content.replace(/^\d+[.)]\s*/, "")}
          </p>
        </div>
      );
    } else if (b.type === "bullet") {
      bulletGroup.push(b.content);
    } else {
      flushBullets(`bgroup-${i}`);
      rendered.push(
        <p key={i} className="text-sm text-slate-600 leading-relaxed">{b.content}</p>
      );
    }
  });
  flushBullets("tail");

  const hiddenCount = blocks.length - maxLines;

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
      <div className="space-y-0.5">{rendered}</div>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
        >
          {expanded
            ? <><span>▲</span> Réduire</>
            : <><span>▼</span> Voir {hiddenCount} ligne{hiddenCount > 1 ? "s" : ""} de plus</>}
        </button>
      )}
    </div>
  );
}

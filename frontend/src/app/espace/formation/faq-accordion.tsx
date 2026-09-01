"use client";

import { useState } from "react";

type FaqItem = { q: string; a: string };

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((faq, i) => (
        <div key={i} className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left gap-3 hover:bg-slate-50 transition-colors"
          >
            <span className="text-sm font-semibold text-slate-800">{faq.q}</span>
            <span className={`shrink-0 text-slate-400 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}>
              ▾
            </span>
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-3 bg-slate-50/50">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

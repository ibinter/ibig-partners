"use client";

import { useEffect, useRef, useState } from "react";

type PartnerItem = {
  id: string;
  firstName: string;
  lastName: string;
  city: string | null;
  status: string;
};

const STATUS_COLOR: Record<string, string> = {
  SILVER: "#94a3b8",
  GOLD:   "#f59e0b",
  MASTER: "#8b5cf6",
  ELITE:  "#ef4444",
};

const STATUS_EMOJI: Record<string, string> = {
  SILVER: "🥈",
  GOLD:   "🥇",
  MASTER: "💎",
  ELITE:  "👑",
};

export function PartnersTicker({ partners }: { partners: PartnerItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  if (!partners.length) return null;

  // Duplicate list for seamless loop
  const items = [...partners, ...partners];

  return (
    <div
      className="relative overflow-hidden bg-gradient-to-r from-brand-50 via-white to-amber-50 border-y border-slate-100"
      style={{ padding: "14px 0" }}
    >
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-16 z-10"
        style={{ background: "linear-gradient(to right, rgba(248,249,252,1), rgba(248,249,252,0))" }} />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-16 z-10"
        style={{ background: "linear-gradient(to left, rgba(248,249,252,1), rgba(248,249,252,0))" }} />

      {/* Label */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
          🤝 Nos partenaires
        </span>
      </div>

      <div
        ref={trackRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="flex items-center gap-6 sm:pl-44"
        style={{
          animation: `ticker-scroll ${partners.length * 4}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
          width: "max-content",
        }}
      >
        {items.map((p, i) => (
          <span
            key={`${p.id}-${i}`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-white px-4 py-1.5 shadow-sm text-sm font-semibold text-slate-700 whitespace-nowrap"
          >
            <span style={{ color: STATUS_COLOR[p.status] ?? "#64748b", fontSize: 15 }}>
              {STATUS_EMOJI[p.status] ?? "👤"}
            </span>
            {p.firstName} {p.lastName.charAt(0)}.
            {p.city && (
              <span className="text-xs font-normal text-slate-400">· {p.city}</span>
            )}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

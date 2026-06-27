"use client";

import { useState, useEffect, useCallback } from "react";

export interface HeroSlide {
  eyebrow: string;
  titleLead: string;
  titleHighlight: string;
  titleTail?: string;
  desc: string;
}

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(t);
  }, [count]);

  return (
    <div>
      {/* Zone de slides — superposées, fondu enchaîné */}
      <div className="relative min-h-[230px] sm:min-h-[260px]">
        {slides.map((s, i) => (
          <div
            key={i}
            className={`hero-slide ${i === index ? "relative opacity-100" : "pointer-events-none absolute inset-0 opacity-0"}`}
            aria-hidden={i !== index}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-100 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
              {s.eyebrow}
            </span>

            <h1 className="text-hero mt-5 max-w-3xl text-white">
              {s.titleLead}{" "}
              <span className="bg-gradient-to-r from-gold-400 to-amber-300 bg-clip-text text-transparent">
                {s.titleHighlight}
              </span>
              {s.titleTail ? ` ${s.titleTail}` : ""}
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-100">
              {s.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Indicateurs */}
      {count > 1 && (
        <div className="mt-7 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Diapositive ${i + 1}`}
              className={`hero-dot h-1.5 rounded-full ${
                i === index ? "w-8 bg-gold-400" : "w-2.5 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

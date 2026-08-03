"use client";

import { useState, useEffect, useCallback } from "react";

export interface HeroSlide {
  eyebrow: string;
  titleLead: string;
  titleHighlight: string;
  titleTail?: string;
  desc: string;
}

/**
 * Slides mettant en avant le catalogue élargi d'IBIG SOFT (14 logiciels/ERP,
 * nouveaux secteurs). Utilisées par défaut si aucun tableau `slides` n'est passé.
 * Prix indiqués « à partir de ».
 */
export const CATALOG_HERO_SLIDES: HeroSlide[] = [
  {
    eyebrow: "IBIG SOFT — 14 logiciels métiers",
    titleLead: "14 ERP & logiciels métiers,",
    titleHighlight: "un seul programme d'affiliation",
    desc: "Scolaire, immobilier, commerce, stock, livraison, BTP, santé, agriculture, Mobile Money, ONG, facturation, secrétariat et génération de documents : un catalogue complet à promouvoir avec un seul compte partenaire.",
  },
  {
    eyebrow: "6 nouveaux secteurs, plus d'opportunités",
    titleLead: "Le catalogue passe de 6 à",
    titleHighlight: "14 solutions métiers",
    desc: "CONSTRUIRO ERP (BTP, dès 15 000 F), SANTAREX ERP (santé, dès 12 000 F), AGRIFRIK (agriculture, dès 6 500 F), GESTMONEY (Mobile Money, dès 9 900 F), ANOUANZÊ ERP (ONG, dès 12 900 F) : autant de marchés qui s'ouvrent à votre réseau.",
  },
  {
    eyebrow: "Des solutions pour chaque métier",
    titleLead: "Du scolaire à la flotte,",
    titleHighlight: "un logiciel pour chaque besoin",
    desc: "Scolaby (dès 10 000 F/mois), IBIG Fleet 360 (dès 19 900 F), Lokativo (dès 9 900 F), GESCOMXEL (dès 5 000 F), Zelivry (dès 4 900 F), STOCKFLOW ERP (dès 5 000 F) : des outils éprouvés, faciles à recommander.",
  },
  {
    eyebrow: "Facturation, secrétariat & documents",
    titleLead: "Gérez, facturez, documentez",
    titleHighlight: "sans vous ruiner",
    desc: "IBIG FactPro (facturation, dès 4 900 F), SECRETIS ERP (secrétariat, dès 4 900 F) et IBIG DocPro (génération de documents, dès 100 F/doc à l'usage) : des tarifs accessibles qui séduisent chaque entrepreneur.",
  },
];

export function HeroSlider({ slides = CATALOG_HERO_SLIDES }: { slides?: HeroSlide[] }) {
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

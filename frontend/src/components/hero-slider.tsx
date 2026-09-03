"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface HeroSlide {
  eyebrow: string;
  titleLead: string;
  titleHighlight: string;
  titleTail?: string;
  desc: string;
  tag?: string;
  stat?: string;
  statLabel?: string;
  accent?: string;
  bg?: string; // gradient CSS pour le fond de ce slide
}

export const CATALOG_HERO_SLIDES: HeroSlide[] = [
  {
    eyebrow: "Programme d'affiliation panafricain",
    titleLead: "Un seul compte,",
    titleHighlight: "10 branches à promouvoir",
    desc: "Logiciels, formations, immobilier, digital, services : avec IBIG PARTNERS vous accédez à tout l'écosystème IBIG SARL et gagnez des commissions sur chaque vente.",
    tag: "Nouveau", stat: "10", statLabel: "branches actives",
    bg: "linear-gradient(135deg,#041B4D 0%,#0b3a8a 100%)",
    accent: "orange",
  },
  {
    eyebrow: "IBIG SOFT — 14 logiciels SaaS & ERP",
    titleLead: "20% de commission",
    titleHighlight: "sur chaque logiciel vendu",
    desc: "Scolaby, Fleet 360, Lokativo, GESCOMXEL, BTP, Santé, Agriculture, Mobile Money — 14 ERP qui couvrent tous les secteurs.",
    stat: "20%", statLabel: "commission N1",
    bg: "linear-gradient(135deg,#0c2461 0%,#1e3799 100%)",
    accent: "blue",
  },
  {
    eyebrow: "IBIG EDUFORM — Formations certifiantes",
    titleLead: "200+ formations,",
    titleHighlight: "10% de commission",
    desc: "MBA accéléré, développement web, BTP, marketing digital, comptabilité, langues — en présentiel et e-learning.",
    stat: "200+", statLabel: "formations disponibles",
    bg: "linear-gradient(135deg,#78350f 0%,#b45309 100%)",
    accent: "amber",
  },
  {
    eyebrow: "IBIG IMMO TRUST — Immobilier sécurisé",
    titleLead: "Jusqu'à 400 000 FCFA",
    titleHighlight: "par transaction immobilière",
    desc: "Mandats de vente, construction clé en main, promotion VEFA — touchez 5% sur chaque opération conclue.",
    stat: "400K", statLabel: "FCFA par vente VEFA",
    bg: "linear-gradient(135deg,#4c1d95 0%,#6d28d9 100%)",
    accent: "violet",
  },
  {
    eyebrow: "IBIG DIGITAL — Création digitale",
    titleLead: "150 000 FCFA",
    titleHighlight: "sur une seule application mobile",
    desc: "Sites vitrine, e-commerce, applications Android & iOS, logo, community management — les solutions les plus demandées.",
    stat: "10%", statLabel: "sur le digital",
    bg: "linear-gradient(135deg,#1e1b4b 0%,#3730a3 100%)",
    accent: "indigo",
  },
  {
    eyebrow: "IBIG DIGITAL KITS — ERP & IA",
    titleLead: "Transformez les entreprises,",
    titleHighlight: "gagnez en transformant",
    desc: "Intégration ERP (Odoo, SAP, SAGE), chatbots IA, cybersécurité PME — les entreprises se digitalisent. Soyez leur guide.",
    stat: "80K", statLabel: "FCFA sur un ERP",
    bg: "linear-gradient(135deg,#134e4a 0%,#0f766e 100%)",
    accent: "teal",
  },
  {
    eyebrow: "IBIG CONSEIL+ — Structuration & Comptabilité",
    titleLead: "Accompagnez les PME,",
    titleHighlight: "et gagnez avec elles",
    desc: "Création d'entreprise, certification ISO, audit organisationnel, comptabilité externalisée — 10% sur chaque mission.",
    stat: "80K", statLabel: "FCFA / mission ISO",
    bg: "linear-gradient(135deg,#7c2d12 0%,#c2410c 100%)",
    accent: "orange",
  },
  {
    eyebrow: "IBIG MARKET — E-commerce & vente physique",
    titleLead: "Kits solaires, matériel médical,",
    titleHighlight: "8% sur chaque équipement",
    desc: "Énergie solaire, matériel IT, mobilier de bureau, audiovisuel — des produits à fort besoin sur tout le continent.",
    stat: "32K", statLabel: "FCFA / kit solaire",
    bg: "linear-gradient(135deg,#064e3b 0%,#059669 100%)",
    accent: "emerald",
  },
  {
    eyebrow: "IBIG MULTISERVICES — Événementiel & Logistique",
    titleLead: "Des services du quotidien",
    titleHighlight: "pour des revenus réguliers",
    desc: "Organisation événementielle, sécurité & gardiennage, tourisme d'affaires — des commissions récurrentes chaque mois.",
    stat: "50K", statLabel: "FCFA / événement",
    bg: "linear-gradient(135deg,#881337 0%,#be123c 100%)",
    accent: "rose",
  },
  {
    eyebrow: "IBIG FINANCEMENT — Microfinance & Assurance",
    titleLead: "Accompagnez les investisseurs,",
    titleHighlight: "touchez jusqu'à 25 000 FCFA",
    desc: "Microcrédits PME, assurance multirisques, levée de fonds — le marché financier africain vous attend.",
    stat: "5%", statLabel: "commission N1",
    bg: "linear-gradient(135deg,#713f12 0%,#ca8a04 100%)",
    accent: "yellow",
  },
  {
    eyebrow: "IBIG EMPLOI & TALENTS — Recrutement & RH",
    titleLead: "Placez des talents,",
    titleHighlight: "gagnez sur chaque recrutement",
    desc: "Recrutement CDI/CDD, externalisation RH, placement de profils qualifiés — 10% de commission sur chaque mission.",
    stat: "30K", statLabel: "FCFA / recrutement CDI",
    bg: "linear-gradient(135deg,#1e293b 0%,#334155 100%)",
    accent: "slate",
  },
];

const HIGHLIGHT_GRAD: Record<string, string> = {
  orange:  "from-orange-400 to-amber-300",
  blue:    "from-blue-300 to-cyan-200",
  amber:   "from-amber-300 to-yellow-200",
  violet:  "from-violet-300 to-purple-200",
  indigo:  "from-indigo-300 to-blue-200",
  teal:    "from-teal-300 to-cyan-200",
  emerald: "from-emerald-300 to-green-200",
  rose:    "from-rose-300 to-pink-200",
  yellow:  "from-yellow-300 to-amber-200",
  slate:   "from-slate-200 to-slate-100",
};

const STAT_CLS: Record<string, string> = {
  orange:  "bg-orange-500/20 text-orange-200 ring-orange-400/30",
  blue:    "bg-blue-500/20 text-blue-100 ring-blue-400/30",
  amber:   "bg-amber-500/20 text-amber-200 ring-amber-400/30",
  violet:  "bg-violet-500/20 text-violet-200 ring-violet-400/30",
  indigo:  "bg-indigo-500/20 text-indigo-200 ring-indigo-400/30",
  teal:    "bg-teal-500/20 text-teal-200 ring-teal-400/30",
  emerald: "bg-emerald-500/20 text-emerald-200 ring-emerald-400/30",
  rose:    "bg-rose-500/20 text-rose-200 ring-rose-400/30",
  yellow:  "bg-yellow-500/20 text-yellow-200 ring-yellow-400/30",
  slate:   "bg-slate-500/20 text-slate-200 ring-slate-400/30",
};

interface Props {
  slides?: HeroSlide[];
  /** éléments fixes à afficher dans chaque slide (CTAs, stats, etc.) */
  children?: React.ReactNode;
}

export function HeroSlider({ slides = CATALOG_HERO_SLIDES, children }: Props) {
  const count = slides.length;
  const [idx, setIdx]     = useState(0);
  const [moving, setMoving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goto = useCallback((to: number) => {
    if (moving) return;
    setIdx(((to % count) + count) % count);
  }, [count, moving]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setMoving(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % count);
        setMoving(false);
      }, 600);
    }, 6000);
  }, [count]);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  const handleNav = (to: number) => {
    if (moving || to === idx) return;
    setMoving(true);
    setTimeout(() => {
      setIdx(((to % count) + count) % count);
      setMoving(false);
    }, 600);
    startTimer();
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: "520px" }}>

      {/* ── Rail : tous les slides côte à côte, translateX pour défiler ── */}
      <div
        className="flex h-full transition-transform ease-in-out"
        style={{
          width: `${count * 100}%`,
          transform: `translateX(-${(idx * 100) / count}%)`,
          transitionDuration: "600ms",
        }}
      >
        {slides.map((slide, i) => {
          const accent = slide.accent ?? "orange";
          const grad   = HIGHLIGHT_GRAD[accent] ?? HIGHLIGHT_GRAD.orange;
          const stat   = STAT_CLS[accent] ?? STAT_CLS.orange;

          return (
            <div
              key={i}
              className="relative flex flex-col justify-center overflow-hidden px-4 py-16 sm:py-20 lg:py-24"
              style={{
                width: `${100 / count}%`,
                background: slide.bg ?? "linear-gradient(135deg,#041B4D 0%,#0b3a8a 100%)",
              }}
            >
              {/* Décors flottants propres à chaque slide */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="animate-float absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/5" />
                <div className="animate-float absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/5" style={{ animationDelay: "1s" }} />
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
              </div>

              {/* Contenu */}
              <div className="relative mx-auto w-full max-w-6xl">
                {/* Eyebrow + tag */}
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
                    {slide.eyebrow}
                  </span>
                  {slide.tag && (
                    <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-orange-500/30">
                      {slide.tag}
                    </span>
                  )}
                </div>

                {/* Titre */}
                <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl max-w-3xl">
                  {slide.titleLead}{" "}
                  <span className={`bg-gradient-to-r ${grad} bg-clip-text text-transparent`}>
                    {slide.titleHighlight}
                  </span>
                  {slide.titleTail ? ` ${slide.titleTail}` : ""}
                </h1>

                {/* Description */}
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
                  {slide.desc}
                </p>

                {/* Badge stat */}
                {slide.stat && (
                  <div className={`mt-6 inline-flex items-center gap-3 rounded-2xl px-5 py-3 ring-1 backdrop-blur-sm ${stat}`}>
                    <span className="text-2xl font-extrabold">{slide.stat}</span>
                    <span className="text-sm font-medium opacity-80">{slide.statLabel}</span>
                  </div>
                )}

                {/* Éléments communs (CTAs, stats, réassurance) passés en children */}
                {children && <div className="mt-8">{children}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Navigation (en overlay fixe) ── */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3">
        {/* Prev */}
        <button
          onClick={() => handleNav((idx - 1 + count) % count)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white/80 backdrop-blur-sm hover:bg-white/30 transition-all"
          aria-label="Précédent"
        >‹</button>

        {/* Dots */}
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => handleNav(i)}
            aria-label={`Slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === idx ? "w-7 h-2 bg-orange-400" : "w-2 h-2 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}

        {/* Next */}
        <button
          onClick={() => handleNav((idx + 1) % count)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white/80 backdrop-blur-sm hover:bg-white/30 transition-all"
          aria-label="Suivant"
        >›</button>

        {/* Compteur */}
        <span className="ml-1 text-xs font-semibold text-white/40 tabular-nums">
          {String(idx + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

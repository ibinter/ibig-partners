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
}

export const CATALOG_HERO_SLIDES: HeroSlide[] = [
  {
    eyebrow: "Programme d'affiliation panafricain",
    titleLead: "Un seul compte,",
    titleHighlight: "10 branches à promouvoir",
    desc: "Logiciels, formations, immobilier, digital, services : avec IBIG PARTNERS vous accédez à tout l'écosystème IBIG SARL et gagnez des commissions sur chaque vente.",
    tag: "Nouveau",
    stat: "10",
    statLabel: "branches actives",
    accent: "orange",
  },
  {
    eyebrow: "IBIG SOFT — 14 logiciels SaaS & ERP",
    titleLead: "20% de commission",
    titleHighlight: "sur chaque logiciel vendu",
    desc: "Scolaby, Fleet 360, Lokativo, GESCOMXEL, BTP, Santé, Agriculture, Mobile Money — 14 ERP qui couvrent tous les secteurs. Un prospect, un logiciel adapté.",
    stat: "20%",
    statLabel: "commission N1",
    accent: "blue",
  },
  {
    eyebrow: "IBIG EDUFORM — Formations certifiantes",
    titleLead: "200+ formations,",
    titleHighlight: "10% de commission",
    desc: "MBA accéléré, développement web, BTP, marketing digital, comptabilité, langues — en présentiel et e-learning. Chaque inscription génère une commission immédiate.",
    stat: "200+",
    statLabel: "formations disponibles",
    accent: "amber",
  },
  {
    eyebrow: "IBIG IMMO TRUST — Immobilier sécurisé",
    titleLead: "Jusqu'à 400 000 FCFA",
    titleHighlight: "par transaction immobilière",
    desc: "Mandats de vente, construction clé en main, promotion VEFA — accompagnez vos clients dans leurs projets immobiliers et touchez 5% sur chaque opération conclue.",
    stat: "400K",
    statLabel: "FCFA par vente VEFA",
    accent: "violet",
  },
  {
    eyebrow: "IBIG DIGITAL — Création digitale",
    titleLead: "150 000 FCFA",
    titleHighlight: "sur une seule application mobile",
    desc: "Sites vitrine, e-commerce, applications Android & iOS, logo & charte graphique, community management — promouvez les solutions digitales les plus demandées en Afrique.",
    stat: "10%",
    statLabel: "sur le digital",
    accent: "indigo",
  },
  {
    eyebrow: "IBIG DIGITAL KITS — ERP & Intelligence Artificielle",
    titleLead: "Transformez les entreprises,",
    titleHighlight: "gagnez en transformant",
    desc: "Intégration ERP (Odoo, SAP, SAGE), chatbots IA, cybersécurité PME, audit SI — les entreprises ont besoin de se digitaliser. Soyez leur guide, soyez rémunéré.",
    stat: "80K",
    statLabel: "FCFA sur un ERP",
    accent: "teal",
  },
  {
    eyebrow: "IBIG CONSEIL+ — Structuration & Comptabilité",
    titleLead: "Accompagnez les PME,",
    titleHighlight: "et gagnez avec elles",
    desc: "Création d'entreprise, certification ISO, audit organisationnel, comptabilité externalisée — conseillez, référencez et touchez 10% sur chaque mission signée.",
    stat: "80K",
    statLabel: "FCFA sur une mission ISO",
    accent: "orange",
  },
  {
    eyebrow: "IBIG MARKET — E-commerce & vente physique",
    titleLead: "Kits solaires, matériel médical",
    titleHighlight: "8% sur chaque équipement",
    desc: "Énergie solaire, matériel IT, mobilier de bureau, audiovisuel, climatisation — des produits à fort besoin sur tout le continent africain. Recommandez, gagnez.",
    stat: "32K",
    statLabel: "FCFA / kit solaire",
    accent: "emerald",
  },
  {
    eyebrow: "IBIG MULTISERVICES — Événementiel & Logistique",
    titleLead: "Des services du quotidien",
    titleHighlight: "pour des revenus réguliers",
    desc: "Organisation événementielle, sécurité & gardiennage, tourisme d'affaires, déménagement — des besoins permanents qui génèrent des commissions récurrentes chaque mois.",
    stat: "50K",
    statLabel: "FCFA / événement",
    accent: "rose",
  },
  {
    eyebrow: "IBIG FINANCEMENT — Microfinance & Assurance",
    titleLead: "Accompagnez les investisseurs,",
    titleHighlight: "touchez jusqu'à 25 000 FCFA",
    desc: "Microcrédits PME, assurance entreprise multirisques, levée de fonds, accompagnement investisseurs étrangers — le marché financier africain vous attend.",
    stat: "5%",
    statLabel: "commission N1",
    accent: "yellow",
  },
  {
    eyebrow: "IBIG EMPLOI & TALENTS — Recrutement & RH",
    titleLead: "Placez des talents,",
    titleHighlight: "gagnez sur chaque recrutement",
    desc: "Externalisation RH, recrutement CDI/CDD, placement de profils qualifiés, bilan de compétences — chaque mission de recrutement aboutie vous rapporte 10% de commission.",
    stat: "30K",
    statLabel: "FCFA / recrutement CDI",
    accent: "slate",
  },
];

const ACCENT_GRAD: Record<string, string> = {
  orange:  "from-orange-400 to-amber-300",
  blue:    "from-blue-300 to-cyan-200",
  amber:   "from-amber-400 to-yellow-300",
  violet:  "from-violet-400 to-purple-300",
  indigo:  "from-indigo-400 to-blue-300",
  teal:    "from-teal-400 to-cyan-300",
  emerald: "from-emerald-400 to-green-300",
  rose:    "from-rose-400 to-pink-300",
  yellow:  "from-yellow-400 to-amber-300",
  slate:   "from-slate-300 to-slate-200",
};

const ACCENT_STAT: Record<string, string> = {
  orange:  "bg-orange-500/20 text-orange-300 ring-orange-400/30",
  blue:    "bg-blue-500/20 text-blue-200 ring-blue-400/30",
  amber:   "bg-amber-500/20 text-amber-300 ring-amber-400/30",
  violet:  "bg-violet-500/20 text-violet-300 ring-violet-400/30",
  indigo:  "bg-indigo-500/20 text-indigo-300 ring-indigo-400/30",
  teal:    "bg-teal-500/20 text-teal-300 ring-teal-400/30",
  emerald: "bg-emerald-500/20 text-emerald-300 ring-emerald-400/30",
  rose:    "bg-rose-500/20 text-rose-300 ring-rose-400/30",
  yellow:  "bg-yellow-500/20 text-yellow-300 ring-yellow-400/30",
  slate:   "bg-slate-500/20 text-slate-300 ring-slate-400/30",
};

export function HeroSlider({ slides = CATALOG_HERO_SLIDES }: { slides?: HeroSlide[] }) {
  const count = slides.length;
  const [current, setCurrent] = useState(0);
  const [next, setNext]       = useState<number | null>(null);
  const [dir, setDir]         = useState<1 | -1>(1); // 1 = gauche→droite, -1 = droite→gauche
  const [phase, setPhase]     = useState<"idle" | "enter" | "done">("idle");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((to: number, direction: 1 | -1 = 1) => {
    if (phase !== "idle") return;
    setDir(direction);
    setNext(to);
    setPhase("enter");

    setTimeout(() => {
      setCurrent(to);
      setNext(null);
      setPhase("done");
      setTimeout(() => setPhase("idle"), 50);
    }, 480);
  }, [phase]);

  const advance = useCallback(() => {
    setCurrent((c) => {
      const to = (c + 1) % count;
      setDir(1);
      setNext(to);
      setPhase("enter");
      setTimeout(() => {
        setCurrent(to);
        setNext(null);
        setPhase("done");
        setTimeout(() => setPhase("idle"), 50);
      }, 480);
      return c;
    });
  }, [count]);

  useEffect(() => {
    timerRef.current = setInterval(advance, 6000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [advance]);

  const handleGo = (to: number) => {
    if (to === current || phase !== "idle") return;
    if (timerRef.current) clearInterval(timerRef.current);
    go(to, to > current ? 1 : -1);
    timerRef.current = setInterval(advance, 6000);
  };

  const s  = slides[current];
  const sn = next !== null ? slides[next] : null;
  const accent = s.accent ?? "orange";
  const accentN = sn?.accent ?? "orange";

  // Translate values pendant l'animation
  const currentX = phase === "enter" ? `${dir * -100}%` : "0%";
  const nextX    = phase === "enter" ? "0%" : `${dir * 100}%`;

  function SlideContent({ slide, accent: a }: { slide: HeroSlide; accent: string }) {
    const grad = ACCENT_GRAD[a] ?? ACCENT_GRAD.orange;
    const stat = ACCENT_STAT[a] ?? ACCENT_STAT.orange;
    return (
      <div className="w-full">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-100 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
            {slide.eyebrow}
          </span>
          {slide.tag && (
            <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-orange-500/30">
              {slide.tag}
            </span>
          )}
        </div>

        <h1 className="text-hero max-w-3xl text-white leading-tight">
          {slide.titleLead}{" "}
          <span className={`bg-gradient-to-r ${grad} bg-clip-text text-transparent`}>
            {slide.titleHighlight}
          </span>
          {slide.titleTail ? ` ${slide.titleTail}` : ""}
        </h1>

        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-100">
          {slide.desc}
        </p>

        {slide.stat && (
          <div className={`mt-6 inline-flex items-center gap-3 rounded-2xl px-5 py-3 ring-1 backdrop-blur-sm ${stat}`}>
            <span className="text-2xl font-extrabold">{slide.stat}</span>
            <span className="text-sm font-medium opacity-80">{slide.statLabel}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Zone de défilement */}
      <div className="relative overflow-hidden" style={{ minHeight: "260px" }}>

        {/* Slide actuel */}
        <div
          className="w-full transition-transform"
          style={{
            transitionDuration: "480ms",
            transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",
            transform: `translateX(${currentX})`,
          }}
        >
          <SlideContent slide={s} accent={accent} />
        </div>

        {/* Slide suivant (arrive depuis la droite ou gauche) */}
        {sn && (
          <div
            className="absolute inset-0 w-full transition-transform"
            style={{
              transitionDuration: "480ms",
              transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",
              transform: `translateX(${nextX})`,
              willChange: "transform",
            }}
          >
            <SlideContent slide={sn} accent={accentN} />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={() => handleGo((current - 1 + count) % count)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all text-sm"
          aria-label="Précédent"
        >
          ‹
        </button>

        <div className="flex items-center gap-1.5 flex-wrap">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => handleGo(i)}
              aria-label={`Slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-7 h-2 bg-orange-400"
                  : "w-2 h-2 bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => handleGo((current + 1) % count)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all text-sm"
          aria-label="Suivant"
        >
          ›
        </button>

        <span className="ml-2 text-xs font-semibold text-white/40 tabular-nums">
          {String(current + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

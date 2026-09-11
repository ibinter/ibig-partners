"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

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
  bg?: string;
}

export const CATALOG_HERO_SLIDES: HeroSlide[] = [
  {
    eyebrow: "Réseau commercial panafricain",
    titleLead: "Un seul réseau,",
    titleHighlight: "1 000+ opportunités commerciales",
    desc: "Missions commerciales, catalogue de produits, formation, affiliation multi-niveaux — avec IBIG PARTNERS, accédez à tout l'écosystème IBIG SARL et générez des revenus sur 10 branches d'activité.",
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
    titleLead: "1 000+ formations,",
    titleHighlight: "10% de commission",
    desc: "MBA accéléré, développement web, BTP, marketing digital, comptabilité, langues — en présentiel et e-learning.",
    stat: "1 000+", statLabel: "formations disponibles",
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

const A: Record<string, { grad: string; rgb: string }> = {
  orange:  { grad: "from-orange-400 to-amber-300",  rgb: "249,115,22"  },
  blue:    { grad: "from-blue-300 to-cyan-200",     rgb: "96,165,250"  },
  amber:   { grad: "from-amber-300 to-yellow-200",  rgb: "251,191,36"  },
  violet:  { grad: "from-violet-300 to-purple-200", rgb: "167,139,250" },
  indigo:  { grad: "from-indigo-300 to-blue-200",   rgb: "129,140,248" },
  teal:    { grad: "from-teal-300 to-cyan-200",     rgb: "45,212,191"  },
  emerald: { grad: "from-emerald-300 to-green-200", rgb: "52,211,153"  },
  rose:    { grad: "from-rose-300 to-pink-200",     rgb: "251,113,133" },
  yellow:  { grad: "from-yellow-300 to-amber-200",  rgb: "253,224,71"  },
  slate:   { grad: "from-slate-200 to-slate-100",   rgb: "148,163,184" },
};

/* ─── Illustrations ─── */
const ILL: Record<number, React.ReactNode> = {
  0: (
    <svg viewBox="0 0 480 440" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <filter id="glow0" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Continent Afrique stylisé */}
      <path d="M225 55 Q258 48 272 72 Q296 78 288 106 Q308 128 300 156 Q318 182 308 210 Q326 238 314 268 Q302 298 280 316 Q258 334 236 332 Q210 342 188 328 Q163 312 158 288 Q140 268 146 242 Q128 218 135 190 Q118 164 126 138 Q136 110 158 94 Q182 72 215 58 Z"
        fill="rgba(249,115,22,0.18)" stroke="rgba(249,115,22,0.55)" strokeWidth="2" filter="url(#glow0)"/>
      {/* Orbital rings */}
      <ellipse cx="235" cy="200" rx="168" ry="185" stroke="rgba(249,115,22,0.10)" strokeWidth="1.5" fill="none" strokeDasharray="10 14" className="hero-dash"/>
      <ellipse cx="235" cy="200" rx="215" ry="230" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none"/>
      {/* City nodes — Abidjan (main) */}
      <circle cx="198" cy="265" r="5" fill="rgba(249,115,22,0.95)" filter="url(#glow0)"/>
      <circle cx="198" cy="265" r="14" fill="rgba(249,115,22,0.12)" className="hero-ring" style={{transformOrigin:"198px 265px"}}/>
      <circle cx="198" cy="265" r="24" fill="rgba(249,115,22,0.06)" className="hero-ring" style={{transformOrigin:"198px 265px",animationDelay:"0.8s"}}/>
      {/* Dakar */}
      <circle cx="148" cy="158" r="5" fill="rgba(251,191,36,0.9)" filter="url(#glow0)"/>
      <circle cx="148" cy="158" r="12" fill="rgba(251,191,36,0.12)" className="hero-ring" style={{transformOrigin:"148px 158px",animationDelay:"0.4s"}}/>
      {/* Lagos */}
      <circle cx="252" cy="258" r="6" fill="rgba(251,191,36,0.9)" filter="url(#glow0)"/>
      <circle cx="252" cy="258" r="14" fill="rgba(251,191,36,0.10)" className="hero-ring" style={{transformOrigin:"252px 258px",animationDelay:"1.2s"}}/>
      {/* Nairobi */}
      <circle cx="310" cy="272" r="5" fill="rgba(52,211,153,0.85)" filter="url(#glow0)"/>
      {/* Accra */}
      <circle cx="212" cy="258" r="4" fill="rgba(255,255,255,0.7)"/>
      {/* Douala */}
      <circle cx="262" cy="242" r="4" fill="rgba(255,255,255,0.6)"/>
      {/* Connections */}
      <line x1="148" y1="158" x2="198" y2="265" stroke="rgba(249,115,22,0.4)" strokeWidth="1.5" strokeDasharray="6 5" className="hero-dash"/>
      <line x1="198" y1="265" x2="252" y2="258" stroke="rgba(249,115,22,0.55)" strokeWidth="2" strokeDasharray="5 4" className="hero-dash"/>
      <line x1="252" y1="258" x2="310" y2="272" stroke="rgba(249,115,22,0.35)" strokeWidth="1.5" strokeDasharray="6 5" className="hero-dash"/>
      <line x1="198" y1="265" x2="212" y2="258" stroke="rgba(249,115,22,0.6)" strokeWidth="2"/>
      <line x1="252" y1="258" x2="262" y2="242" stroke="rgba(249,115,22,0.4)" strokeWidth="1.5"/>
      {/* External nodes */}
      <circle cx="72" cy="128" r="5" fill="rgba(255,255,255,0.25)"/>
      <circle cx="420" cy="170" r="5" fill="rgba(255,255,255,0.25)"/>
      <circle cx="90" cy="310" r="4" fill="rgba(255,255,255,0.2)"/>
      <circle cx="398" cy="328" r="4" fill="rgba(255,255,255,0.2)"/>
      <circle cx="248" cy="45"  r="4" fill="rgba(255,255,255,0.2)"/>
      <line x1="148" y1="158" x2="72"  y2="128" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 8"/>
      <line x1="310" y1="272" x2="398" y2="328" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 8"/>
      <line x1="310" y1="272" x2="420" y2="170" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 8"/>
      <line x1="148" y1="158" x2="248" y2="45"  stroke="rgba(255,255,255,0.10)" strokeWidth="1" strokeDasharray="4 8"/>
    </svg>
  ),
  1: (
    <svg viewBox="0 0 480 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <filter id="glow1" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Window chrome */}
      <rect x="50" y="45" width="380" height="300" rx="16" fill="rgba(255,255,255,0.06)" stroke="rgba(96,165,250,0.3)" strokeWidth="1.5"/>
      <rect x="50" y="45" width="380" height="36" rx="16" fill="rgba(255,255,255,0.10)"/>
      <rect x="50" y="65" width="380" height="16" fill="rgba(255,255,255,0.06)"/>
      <circle cx="78"  cy="63" r="7" fill="rgba(255,80,80,0.7)"/>
      <circle cx="100" cy="63" r="7" fill="rgba(255,180,0,0.7)"/>
      <circle cx="122" cy="63" r="7" fill="rgba(50,200,80,0.7)"/>
      {/* URL bar */}
      <rect x="160" y="57" width="200" height="12" rx="6" fill="rgba(255,255,255,0.08)"/>
      <rect x="168" y="61" width="80" height="4" rx="2" fill="rgba(96,165,250,0.4)"/>
      {/* Dashboard content */}
      {/* Header kpi tiles */}
      {[
        { x: 68,  clr: "rgba(96,165,250,0.3)", w: 80 },
        { x: 160, clr: "rgba(52,211,153,0.3)", w: 80 },
        { x: 252, clr: "rgba(249,115,22,0.3)",  w: 80 },
        { x: 344, clr: "rgba(167,139,250,0.3)", w: 78 },
      ].map((t, i) => (
        <g key={i}>
          <rect x={t.x} y="98" width={t.w} height="44" rx="8" fill={t.clr} stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          <rect x={t.x+10} y="106" width="30" height="5" rx="2" fill="rgba(255,255,255,0.15)"/>
          <rect x={t.x+10} y="116" width={50} height="8" rx="3" fill="rgba(255,255,255,0.35)"/>
          <rect x={t.x+10} y="128" width="20" height="4" rx="2" fill="rgba(255,255,255,0.10)"/>
        </g>
      ))}
      {/* Bar chart */}
      <rect x="68" y="155" width="220" height="120" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      {[
        { x: 84,  h: 55, clr: "rgba(96,165,250,0.7)"  },
        { x: 114, h: 70, clr: "rgba(96,165,250,0.75)" },
        { x: 144, h: 45, clr: "rgba(96,165,250,0.65)" },
        { x: 174, h: 80, clr: "rgba(52,211,153,0.75)" },
        { x: 204, h: 65, clr: "rgba(52,211,153,0.7)"  },
        { x: 234, h: 90, clr: "rgba(249,115,22,0.8)",  },
      ].map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={260-b.h} width="22" height={b.h} rx="4" fill={b.clr} filter="url(#glow1)"/>
        </g>
      ))}
      {/* Trend line */}
      <path d="M95 240 Q138 215 163 230 Q195 208 215 195 Q245 170 255 165"
        stroke="rgba(249,115,22,0.8)" strokeWidth="2.5" fill="none" strokeLinecap="round" filter="url(#glow1)"/>
      <circle cx="255" cy="165" r="5" fill="rgba(249,115,22,0.9)" filter="url(#glow1)"/>
      {/* Side panel — code lines */}
      <rect x="298" y="155" width="124" height="120" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      {[0,1,2,3,4,5,6,7].map((i) => (
        <rect key={i} x={308} y={167 + i*14} width={[70,50,85,40,65,55,75,45][i]} height="6" rx="3"
          fill={i%3===0 ? "rgba(96,165,250,0.45)" : i%3===1 ? "rgba(249,115,22,0.35)" : "rgba(255,255,255,0.15)"}/>
      ))}
      {/* Progress bars */}
      <rect x="68" y="285" width="354" height="48" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      {[
        { w: 220, clr: "rgba(52,211,153,0.7)"  },
        { w: 160, clr: "rgba(96,165,250,0.6)"  },
        { w: 280, clr: "rgba(249,115,22,0.65)" },
      ].map((p, i) => (
        <g key={i}>
          <rect x="80" y={293+i*12} width="330" height="5" rx="2" fill="rgba(255,255,255,0.08)"/>
          <rect x="80" y={293+i*12} width={p.w} height="5" rx="2" fill={p.clr} filter="url(#glow1)"/>
        </g>
      ))}
    </svg>
  ),
  2: (
    <svg viewBox="0 0 480 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <filter id="glow2" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Diploma / certificate */}
      <rect x="100" y="60" width="280" height="190" rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(251,191,36,0.4)" strokeWidth="2"/>
      <rect x="112" y="72" width="256" height="166" rx="8" fill="none" stroke="rgba(251,191,36,0.2)" strokeWidth="1.5" strokeDasharray="6 4"/>
      {/* Seal */}
      <circle cx="240" cy="130" r="32" fill="rgba(251,191,36,0.2)" stroke="rgba(251,191,36,0.6)" strokeWidth="2" filter="url(#glow2)"/>
      <circle cx="240" cy="130" r="22" fill="rgba(251,191,36,0.15)" stroke="rgba(251,191,36,0.4)" strokeWidth="1"/>
      <path d="M231 130 L237 136 L251 122" stroke="rgba(251,191,36,0.9)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow2)"/>
      {/* Text lines */}
      <rect x="145" y="175" width="190" height="8" rx="4" fill="rgba(255,255,255,0.2)"/>
      <rect x="165" y="190" width="150" height="6" rx="3" fill="rgba(255,255,255,0.12)"/>
      <rect x="175" y="204" width="130" height="5" rx="2" fill="rgba(255,255,255,0.08)"/>
      {/* Ribbon */}
      <path d="M200 250 L220 235 L240 245 L260 235 L280 250 L240 260 Z" fill="rgba(251,191,36,0.4)" stroke="rgba(251,191,36,0.6)" strokeWidth="1"/>
      {/* Book stack */}
      {[
        { y: 330, w: 240, x: 120, clr: "rgba(251,191,36,0.35)" },
        { y: 312, w: 210, x: 135, clr: "rgba(249,115,22,0.30)" },
        { y: 295, w: 180, x: 150, clr: "rgba(255,255,255,0.18)" },
        { y: 280, w: 155, x: 162, clr: "rgba(251,191,36,0.22)" },
      ].map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height="22" rx="5"
          fill={b.clr} stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
      ))}
      {/* Graduation cap */}
      <rect x="168" y="28" width="144" height="20" rx="4" fill="rgba(251,191,36,0.55)" filter="url(#glow2)"/>
      <path d="M168 28 L240 8 L312 28" fill="rgba(251,191,36,0.4)" stroke="rgba(251,191,36,0.6)" strokeWidth="1.5"/>
      <line x1="240" y1="28" x2="240" y2="56" stroke="rgba(251,191,36,0.5)" strokeWidth="2"/>
      <circle cx="240" cy="56" r="5" fill="rgba(251,191,36,0.7)" filter="url(#glow2)"/>
      {/* Stars */}
      {[[60,80],[405,95],[415,310],[55,290],[240,390]].map(([x,y],i)=>(
        <text key={i} x={x} y={y} fontSize={i===4?"28":"20"} fill={`rgba(251,191,36,${[0.5,0.4,0.35,0.45,0.3][i]})`} textAnchor="middle">★</text>
      ))}
      {/* Floating badges */}
      <rect x="52" y="155" width="70" height="30" rx="15" fill="rgba(251,191,36,0.2)" stroke="rgba(251,191,36,0.4)" strokeWidth="1"/>
      <text x="87" y="174" fontSize="10" fill="rgba(251,191,36,0.9)" textAnchor="middle" fontWeight="bold">10% COM.</text>
      <rect x="358" y="165" width="78" height="30" rx="15" fill="rgba(52,211,153,0.2)" stroke="rgba(52,211,153,0.4)" strokeWidth="1"/>
      <text x="397" y="184" fontSize="10" fill="rgba(52,211,153,0.9)" textAnchor="middle" fontWeight="bold">CERTIFIÉ</text>
    </svg>
  ),
  3: (
    <svg viewBox="0 0 480 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <filter id="glow3" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Moon */}
      <circle cx="390" cy="75" r="38" fill="rgba(167,139,250,0.20)" stroke="rgba(167,139,250,0.35)" strokeWidth="1.5"/>
      <circle cx="405" cy="65" r="28" fill="rgba(76,29,149,0.7)"/>
      <circle cx="390" cy="75" r="38" fill="none" stroke="rgba(167,139,250,0.20)" strokeWidth="1"/>
      {/* Stars */}
      {[[55,55],[80,120],[430,180],[420,290],[60,300]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={[3,2,2.5,2,3][i]} fill={`rgba(167,139,250,${[0.6,0.4,0.5,0.35,0.55][i]})`}/>
      ))}
      {/* Ground */}
      <rect x="30" y="340" width="420" height="80" rx="0" fill="rgba(167,139,250,0.08)"/>
      <line x1="30" y1="340" x2="450" y2="340" stroke="rgba(167,139,250,0.2)" strokeWidth="1.5"/>
      {/* Background building */}
      <rect x="60"  y="220" width="55" height="120" rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(167,139,250,0.15)" strokeWidth="1"/>
      <rect x="365" y="200" width="65" height="140" rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(167,139,250,0.15)" strokeWidth="1"/>
      {/* Main building — tall */}
      <rect x="155" y="100" width="170" height="240" rx="6" fill="rgba(167,139,250,0.18)" stroke="rgba(167,139,250,0.5)" strokeWidth="2" filter="url(#glow3)"/>
      {/* Roof triangle */}
      <path d="M148 100 L240 55 L332 100 Z" fill="rgba(167,139,250,0.25)" stroke="rgba(167,139,250,0.55)" strokeWidth="1.5"/>
      {/* Windows main building */}
      {[110,140,170,200,230,260,290].map((y,row)=>
        [165,195,225,265,295].map((x,col)=>(
          <rect key={`${row}-${col}`} x={x} y={y} width="20" height="16" rx="3"
            fill={`rgba(167,139,250,${(row+col)%3===0?0.6:0.2})`}
            stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"/>
        ))
      )}
      {/* Door */}
      <rect x="218" y="300" width="44" height="40" rx="4" fill="rgba(167,139,250,0.3)" stroke="rgba(167,139,250,0.5)" strokeWidth="1"/>
      {/* Left secondary building windows */}
      {[230,260,300].map((y,i)=>
        [70,90].map((x,j)=>(
          <rect key={`l${i}${j}`} x={x} y={y} width="18" height="15" rx="2" fill="rgba(167,139,250,0.25)"/>
        ))
      )}
      {/* Key badge */}
      <rect x="340" y="92" width="72" height="36" rx="18" fill="rgba(167,139,250,0.25)" stroke="rgba(167,139,250,0.55)" strokeWidth="1.5" filter="url(#glow3)"/>
      <text x="376" y="115" fontSize="18" textAnchor="middle" fill="rgba(167,139,250,0.9)">🔑</text>
      {/* Glow ground reflection */}
      <ellipse cx="240" cy="345" rx="120" ry="12" fill="rgba(167,139,250,0.12)" filter="url(#glow3)"/>
    </svg>
  ),
  4: (
    <svg viewBox="0 0 480 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <filter id="glow4" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Browser window — back */}
      <rect x="55" y="65" width="240" height="180" rx="12" fill="rgba(255,255,255,0.06)" stroke="rgba(129,140,248,0.3)" strokeWidth="1.5"/>
      <rect x="55" y="65" width="240" height="28" rx="12" fill="rgba(255,255,255,0.08)"/>
      <circle cx="74"  cy="79" r="5" fill="rgba(255,80,80,0.6)"/>
      <circle cx="89"  cy="79" r="5" fill="rgba(255,180,0,0.6)"/>
      <circle cx="104" cy="79" r="5" fill="rgba(50,200,80,0.6)"/>
      <rect x="118" y="75" width="120" height="9" rx="4" fill="rgba(255,255,255,0.08)"/>
      {/* Browser chart */}
      {[0,1,2,3,4].map(i=>(
        <rect key={i} x={70+i*40} y={195-[50,70,40,80,60][i]} width="28" height={[50,70,40,80,60][i]} rx="4"
          fill={`rgba(129,140,248,${0.4+i*0.08})`} filter="url(#glow4)"/>
      ))}
      <line x1="65" y1="240" x2="290" y2="240" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
      {/* Smartphone — front */}
      <rect x="270" y="55" width="155" height="300" rx="24" fill="rgba(255,255,255,0.08)" stroke="rgba(129,140,248,0.45)" strokeWidth="2.5" filter="url(#glow4)"/>
      <rect x="283" y="78" width="129" height="254" rx="12" fill="rgba(30,27,75,0.6)"/>
      {/* Notch */}
      <rect x="320" y="62" width="55" height="10" rx="5" fill="rgba(255,255,255,0.08)"/>
      <circle cx="347" cy="67" r="3" fill="rgba(255,255,255,0.15)"/>
      {/* App screen */}
      <rect x="290" y="86" width="115" height="50" rx="8" fill="rgba(129,140,248,0.35)"/>
      <rect x="298" y="92" width="60" height="6" rx="3" fill="rgba(255,255,255,0.4)"/>
      <rect x="298" y="102" width="40" height="4" rx="2" fill="rgba(255,255,255,0.2)"/>
      <rect x="370" y="88" width="28" height="42" rx="14" fill="rgba(249,115,22,0.5)" filter="url(#glow4)"/>
      {/* App icons grid */}
      {[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1],[0,2],[1,2],[2,2]].map(([col,row],i)=>(
        <rect key={i} x={293+col*38} y={145+row*38} width="30" height="30" rx="8"
          fill={["rgba(249,115,22,0.5)","rgba(52,211,153,0.45)","rgba(251,191,36,0.45)","rgba(167,139,250,0.45)","rgba(96,165,250,0.5)","rgba(251,113,133,0.45)","rgba(45,212,191,0.45)","rgba(249,115,22,0.4)","rgba(255,255,255,0.15)"][i]}
          filter="url(#glow4)"/>
      ))}
      {/* Home bar */}
      <rect x="325" y="318" width="55" height="4" rx="2" fill="rgba(255,255,255,0.25)"/>
      {/* Floating notif badge */}
      <rect x="50" y="270" width="90" height="40" rx="12" fill="rgba(249,115,22,0.25)" stroke="rgba(249,115,22,0.5)" strokeWidth="1.5" filter="url(#glow4)"/>
      <text x="95" y="285" fontSize="9" fill="rgba(255,255,255,0.8)" textAnchor="middle" fontWeight="bold">+150K FCFA</text>
      <text x="95" y="298" fontSize="8" fill="rgba(255,255,255,0.5)" textAnchor="middle">Nouvelle vente 🎉</text>
      {/* Wi-Fi waves */}
      {[20,35,50].map((r,i)=>(
        <path key={i} d={`M ${347-r} ${35-r*0.4} A ${r} ${r} 0 0 1 ${347+r} ${35-r*0.4}`}
          stroke="rgba(129,140,248,0.2)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      ))}
    </svg>
  ),
  5: (
    <svg viewBox="0 0 480 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <filter id="glow5" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* CPU */}
      <rect x="160" y="120" width="160" height="160" rx="12" fill="rgba(45,212,191,0.12)" stroke="rgba(45,212,191,0.55)" strokeWidth="2.5" filter="url(#glow5)"/>
      <rect x="178" y="138" width="124" height="124" rx="8" fill="rgba(45,212,191,0.08)" stroke="rgba(45,212,191,0.25)" strokeWidth="1"/>
      <text x="240" y="210" textAnchor="middle" fontSize="28" fill="rgba(45,212,191,0.9)" fontFamily="monospace" fontWeight="bold" filter="url(#glow5)">AI</text>
      <text x="240" y="230" textAnchor="middle" fontSize="10" fill="rgba(45,212,191,0.5)" fontFamily="monospace">IBIG SOFT</text>
      {/* Pins top/bottom */}
      {[170,192,214,240,266,288,310].map((x,i)=>(
        <g key={i}>
          <line x1={x} y1="100" x2={x} y2="120" stroke="rgba(45,212,191,0.5)" strokeWidth="2"/>
          <circle cx={x} cy="96" r="4" fill="rgba(45,212,191,0.4)"/>
          <line x1={x} y1="280" x2={x} y2="300" stroke="rgba(45,212,191,0.5)" strokeWidth="2"/>
          <circle cx={x} cy="304" r="4" fill="rgba(45,212,191,0.4)"/>
        </g>
      ))}
      {/* Pins left/right */}
      {[130,152,176,200,224,248].map((y,i)=>(
        <g key={i}>
          <line x1="140" y1={y} x2="160" y2={y} stroke="rgba(45,212,191,0.5)" strokeWidth="2"/>
          <circle cx="136" cy={y} r="4" fill="rgba(45,212,191,0.4)"/>
          <line x1="320" y1={y} x2="340" y2={y} stroke="rgba(45,212,191,0.5)" strokeWidth="2"/>
          <circle cx="344" cy={y} r="4" fill="rgba(45,212,191,0.4)"/>
        </g>
      ))}
      {/* Data flows */}
      {[
        [60,200,140,200],[340,200,420,200],
        [240,304,240,380],[240,100,240,40],
        [340,130,400,80],[340,270,400,320],
        [140,130,80,80],[140,270,80,320],
      ].map(([x1,y1,x2,y2],i)=>(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(45,212,191,0.25)" strokeWidth="1.5" strokeDasharray="6 5" className="hero-dash"/>
      ))}
      {/* Terminal nodes */}
      {[[60,200],[420,200],[240,380],[240,40],[400,80],[400,320],[80,80],[80,320]].map(([cx,cy],i)=>(
        <circle key={i} cx={cx} cy={cy} r="8" fill="rgba(45,212,191,0.2)" stroke="rgba(45,212,191,0.6)" strokeWidth="1.5" filter="url(#glow5)"/>
      ))}
    </svg>
  ),
  6: (
    <svg viewBox="0 0 480 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <filter id="glow6" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {[80,140,200,260,310,360].map((y,i)=>(
        <line key={i} x1="55" y1={y} x2="440" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
      ))}
      <line x1="55" y1="55" x2="55" y2="365" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
      <line x1="55" y1="365" x2="440" y2="365" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
      {[
        { x: 75,  h: 90,  c: "rgba(249,115,22,0.55)" },
        { x: 143, h: 130, c: "rgba(249,115,22,0.65)" },
        { x: 211, h: 100, c: "rgba(249,115,22,0.60)" },
        { x: 279, h: 165, c: "rgba(52,211,153,0.70)"  },
        { x: 347, h: 200, c: "rgba(52,211,153,0.80)"  },
      ].map((b,i)=>(
        <g key={i}>
          <rect x={b.x} y={365-b.h} width="55" height={b.h} rx="6"
            fill={b.c} stroke="rgba(255,255,255,0.12)" strokeWidth="1" filter="url(#glow6)"/>
          <rect x={b.x} y={365-b.h} width="55" height="8" rx="4" fill="rgba(255,255,255,0.15)"/>
        </g>
      ))}
      <path d="M102 300 Q170 265 238 282 Q307 235 375 200 Q410 182 425 170"
        stroke="rgba(251,191,36,0.9)" strokeWidth="3" fill="none" strokeLinecap="round" filter="url(#glow6)"/>
      <path d="M102 300 Q170 265 238 282 Q307 235 375 200 Q410 182 425 170 L425 365 L102 365 Z"
        fill="rgba(251,191,36,0.06)"/>
      <circle cx="425" cy="170" r="8" fill="rgba(251,191,36,0.9)" filter="url(#glow6)"/>
      <circle cx="425" cy="170" r="16" fill="rgba(251,191,36,0.15)" className="hero-ring" style={{transformOrigin:"425px 170px"}}/>
      {/* Badge */}
      <rect x="338" y="80" width="105" height="36" rx="18" fill="rgba(52,211,153,0.2)" stroke="rgba(52,211,153,0.5)" strokeWidth="1.5"/>
      <text x="390" y="99" fontSize="11" fill="rgba(52,211,153,0.9)" textAnchor="middle" fontWeight="bold">+80K FCFA / mission</text>
    </svg>
  ),
  7: (
    <svg viewBox="0 0 480 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <filter id="glow7" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <circle cx="360" cy="80" r="32" fill="rgba(253,224,71,0.15)" stroke="rgba(253,224,71,0.3)" strokeWidth="1"/>
      {[0,45,90,135,180,225,270,315].map((deg,i)=>(
        <line key={i}
          x1={360+28*Math.cos(deg*Math.PI/180)} y1={80+28*Math.sin(deg*Math.PI/180)}
          x2={360+36*Math.cos(deg*Math.PI/180)} y2={80+36*Math.sin(deg*Math.PI/180)}
          stroke="rgba(253,224,71,0.45)" strokeWidth="2"/>
      ))}
      <circle cx="360" cy="80" r="18" fill="rgba(253,224,71,0.35)" filter="url(#glow7)"/>
      <path d="M60 155 L240 90 L420 155" fill="rgba(5,150,105,0.25)" stroke="rgba(52,211,153,0.55)" strokeWidth="2"/>
      <rect x="80" y="155" width="320" height="185" rx="6" fill="rgba(255,255,255,0.05)" stroke="rgba(52,211,153,0.2)" strokeWidth="1"/>
      <rect x="95" y="170" width="95" height="75" rx="6" fill="rgba(255,255,255,0.07)" stroke="rgba(52,211,153,0.2)" strokeWidth="1"/>
      <rect x="390" y="170" width="0" height="0"/>
      <rect x="290" y="170" width="95" height="75" rx="6" fill="rgba(255,255,255,0.07)" stroke="rgba(52,211,153,0.2)" strokeWidth="1"/>
      {[[95,170],[290,170]].map(([x,y],i)=>[0,1,2].map(j=>(
        <rect key={`${i}${j}`} x={x+8} y={y+10+j*18} width={[50,35,42][j]} height="9" rx="4" fill="rgba(52,211,153,0.25)"/>
      )))}
      <rect x="185" y="215" width="110" height="125" rx="6" fill="rgba(52,211,153,0.20)" stroke="rgba(52,211,153,0.45)" strokeWidth="1.5" filter="url(#glow7)"/>
      <rect x="197" y="255" width="86" height="85" rx="4" fill="rgba(52,211,153,0.15)"/>
      <rect x="120" y="135" width="240" height="28" rx="6" fill="rgba(52,211,153,0.3)" filter="url(#glow7)"/>
      <text x="240" y="153" fontSize="10" fill="rgba(255,255,255,0.8)" textAnchor="middle" fontWeight="bold">IBIG MARKET</text>
      <rect x="360" y="230" width="70" height="38" rx="10" fill="rgba(253,224,71,0.2)" stroke="rgba(253,224,71,0.5)" strokeWidth="1.5" filter="url(#glow7)"/>
      <text x="395" y="244" fontSize="8" fill="rgba(253,224,71,0.9)" textAnchor="middle" fontWeight="bold">PANIER</text>
      <text x="395" y="256" fontSize="11" fill="rgba(253,224,71,0.9)" textAnchor="middle">🛒</text>
    </svg>
  ),
  8: (
    <svg viewBox="0 0 480 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <filter id="glow8" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <ellipse cx="240" cy="360" rx="200" ry="24" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.10)" strokeWidth="1"/>
      <path d="M40 55 Q62 170 55 330" stroke="rgba(190,18,60,0.55)" strokeWidth="30" fill="none" strokeLinecap="round"/>
      <path d="M440 55 Q418 170 425 330" stroke="rgba(190,18,60,0.55)" strokeWidth="30" fill="none" strokeLinecap="round"/>
      {[[110,50,148,290],[240,35,240,310],[370,50,332,290]].map(([x1,y1,x2,y2],i)=>(
        <g key={i}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(253,224,71,0.12)" strokeWidth="34"/>
          <circle cx={x1} cy={y1} r="8" fill="rgba(253,224,71,0.5)" filter="url(#glow8)"/>
        </g>
      ))}
      {[120,240,360].map((x,i)=>(
        <g key={i}>
          <circle cx={x} cy={268} r={i===1?22:16} fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
          <rect x={x-(i===1?18:12)} y={290} width={i===1?36:24} height={i===1?50:40} rx="6" fill="rgba(255,255,255,0.10)"/>
          <circle cx={x} cy={258} r={i===1?9:6} fill="rgba(255,255,255,0.2)"/>
        </g>
      ))}
      <rect x="100" y="338" width="280" height="22" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
      {[[65,95],[110,60],[380,70],[420,140],[58,200],[430,230]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={i%2===0?3:2.5} fill={`rgba(253,224,71,${[0.6,0.5,0.55,0.4,0.45,0.5][i]})`}/>
      ))}
      <rect x="152" y="48" width="176" height="30" rx="15" fill="rgba(251,113,133,0.2)" stroke="rgba(251,113,133,0.4)" strokeWidth="1.5" filter="url(#glow8)"/>
      <text x="240" y="68" fontSize="11" fill="rgba(255,255,255,0.85)" textAnchor="middle" fontWeight="bold">ÉVÉNEMENT · 50K FCFA</text>
    </svg>
  ),
  9: (
    <svg viewBox="0 0 480 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <filter id="glow9" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {[310,285,260,235,210,190].map((y,i)=>(
        <ellipse key={i} cx="240" cy={y} rx={85-i*3} ry={16-i} fill={`rgba(202,138,4,${0.10+i*0.06})`} stroke="rgba(202,138,4,0.35)" strokeWidth="1"/>
      ))}
      <ellipse cx="240" cy="190" rx="85" ry="16" fill="rgba(202,138,4,0.55)" stroke="rgba(202,138,4,0.8)" strokeWidth="1.5" filter="url(#glow9)"/>
      <text x="240" y="196" textAnchor="middle" fontSize="14" fill="rgba(255,220,80,0.9)" fontFamily="sans-serif" fontWeight="bold">FCFA</text>
      <path d="M60 360 L100 330 L160 280 L230 225 Q260 200 300 175 L360 130 L420 95"
        stroke="rgba(202,138,4,0.75)" strokeWidth="3" fill="none" strokeLinecap="round" filter="url(#glow9)"/>
      <path d="M60 360 L100 330 L160 280 L230 225 Q260 200 300 175 L360 130 L420 95 L420 390 L60 390 Z"
        fill="rgba(202,138,4,0.06)"/>
      <circle cx="420" cy="95" r="10" fill="rgba(202,138,4,0.9)" filter="url(#glow9)"/>
      <circle cx="420" cy="95" r="20" fill="rgba(202,138,4,0.15)" className="hero-ring" style={{transformOrigin:"420px 95px"}}/>
      <path d="M410 85 L420 95 L430 85" stroke="rgba(202,138,4,0.9)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {[[70,100],[130,175],[200,250]].map(([cx,cy],i)=>(
        <circle key={i} cx={cx} cy={cy} r="5" fill="rgba(202,138,4,0.6)" filter="url(#glow9)"/>
      ))}
      <rect x="50" y="52" width="130" height="32" rx="16" fill="rgba(202,138,4,0.20)" stroke="rgba(202,138,4,0.45)" strokeWidth="1.5"/>
      <text x="115" y="73" fontSize="11" fill="rgba(202,138,4,0.9)" textAnchor="middle" fontWeight="bold">5% commission N1</text>
    </svg>
  ),
  10: (
    <svg viewBox="0 0 480 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <filter id="glow10" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {[
        [240,100,28],[130,160,20],[350,150,20],[80,260,18],[240,270,22],[400,260,18],[160,360,16],[320,360,16],
      ].map(([cx,cy,r],i)=>(
        <g key={i}>
          <circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.08)" stroke="rgba(148,163,184,0.35)" strokeWidth="1.5"/>
          <circle cx={cx} cy={cy-r*0.3} r={r*0.5} fill="rgba(255,255,255,0.15)"/>
          <path d={`M ${cx-r*0.85} ${cy+r*0.65} Q ${cx} ${cy+r*1.3} ${cx+r*0.85} ${cy+r*0.65}`} fill="rgba(255,255,255,0.06)"/>
        </g>
      ))}
      {[
        [240,100,130,160],[240,100,350,150],[130,160,80,260],[350,150,400,260],
        [240,100,240,270],[130,160,240,270],[350,150,240,270],
        [80,260,160,360],[240,270,160,360],[240,270,320,360],[400,260,320,360],
      ].map(([x1,y1,x2,y2],i)=>(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(148,163,184,0.20)" strokeWidth="1" strokeDasharray="5 4"/>
      ))}
      <circle cx="240" cy="100" r="14" fill="rgba(52,211,153,0.25)" stroke="rgba(52,211,153,0.7)" strokeWidth="2" filter="url(#glow10)"/>
      <path d="M234 100 L239 105 L248 94" stroke="rgba(52,211,153,0.95)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="240" cy="100" r="28" fill="rgba(52,211,153,0.08)" className="hero-ring" style={{transformOrigin:"240px 100px"}}/>
      <rect x="175" y="310" width="130" height="55" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(148,163,184,0.25)" strokeWidth="1"/>
      <rect x="185" y="318" width="110" height="10" rx="4" fill="rgba(148,163,184,0.3)"/>
      <rect x="185" y="333" width="80"  height="6"  rx="3" fill="rgba(148,163,184,0.18)"/>
      <rect x="185" y="345" width="95"  height="6"  rx="3" fill="rgba(148,163,184,0.15)"/>
      <rect x="185" y="357" width="60"  height="6"  rx="3" fill="rgba(52,211,153,0.3)"/>
      <rect x="54" y="56" width="110" height="30" rx="15" fill="rgba(148,163,184,0.15)" stroke="rgba(148,163,184,0.3)" strokeWidth="1.5"/>
      <text x="109" y="76" fontSize="10" fill="rgba(148,163,184,0.8)" textAnchor="middle" fontWeight="bold">30K FCFA / CDI</text>
    </svg>
  ),
};

const DUR  = 650;
const TICK = 5500;

interface Props {
  slides?: HeroSlide[];
  children?: React.ReactNode;
}

export function HeroSlider({ slides = CATALOG_HERO_SLIDES, children }: Props) {
  const count = slides.length;
  const [cur,   setCur]  = useState(0);
  const [next,  setNext] = useState<number | null>(null);
  const [dir,   setDir]  = useState<1 | -1>(1);
  const [phase, setPhase] = useState<"idle" | "run">("idle");
  const phaseR = useRef<"idle" | "run">("idle");
  const curR   = useRef(0);
  const timerR = useRef<ReturnType<typeof setInterval> | null>(null);
  const animR  = useRef<ReturnType<typeof setTimeout>  | null>(null);

  const goto = useCallback((to: number, d: 1 | -1 = 1) => {
    if (phaseR.current !== "idle") {
      phaseR.current = "idle";
      if (animR.current) { clearTimeout(animR.current); animR.current = null; }
    }
    if (to === curR.current) return;
    phaseR.current = "run";
    setNext(to); setDir(d); setPhase("run");
    animR.current = setTimeout(() => {
      curR.current = to;
      phaseR.current = "idle";
      animR.current = null;
      setCur(to); setNext(null); setPhase("idle");
    }, DUR);
  }, []);

  const resetTimer = useCallback(() => {
    if (timerR.current) clearInterval(timerR.current);
    timerR.current = setInterval(() => goto((curR.current + 1) % count, 1), TICK);
  }, [count, goto]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerR.current) clearInterval(timerR.current);
      if (animR.current)  clearTimeout(animR.current);
    };
  }, [resetTimer]);

  const nav = (to: number) => { goto(to, to > cur ? 1 : -1); resetTimer(); };

  const renderSlide = (idx: number, role: "current" | "entering") => {
    const s      = slides[idx];
    const acc    = A[s.accent ?? "orange"] ?? A.orange;
    const illus  = ILL[idx] ?? ILL[0];
    const active = phase === "run";
    const enter  = role === "entering";

    const wrapStyle: React.CSSProperties = enter
      ? {
          opacity:   active ? 1 : 0,
          transform: active ? "translateX(0) scale(1)" : `translateX(${dir * 4}%) scale(1.015)`,
          transition: active ? `opacity ${DUR}ms cubic-bezier(.4,0,.2,1),transform ${DUR}ms cubic-bezier(.4,0,.2,1)` : "none",
          zIndex: 2,
        }
      : {
          opacity:   active ? 0 : 1,
          transform: active ? `translateX(${dir * -4}%) scale(0.985)` : "translateX(0) scale(1)",
          transition: active ? `opacity ${DUR}ms cubic-bezier(.4,0,.2,1),transform ${DUR}ms cubic-bezier(.4,0,.2,1)` : "none",
          zIndex: 1,
        };

    /* key on inner text triggers stagger animations only for entering slides */
    const innerKey = enter ? `e${idx}` : "c";

    return (
      <div
        key={role}
        className="absolute inset-0 overflow-hidden"
        style={{ background: s.bg ?? "linear-gradient(135deg,#041B4D,#0b3a8a)", ...wrapStyle }}
      >
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.032]"
          style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "24px 24px" }}
        />
        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/25 via-transparent to-black/35" />
        {/* Right glow */}
        <div
          className="absolute right-[-8%] top-1/2 -translate-y-1/2 w-[55%] aspect-square rounded-full opacity-20 blur-[90px] pointer-events-none"
          style={{ background: `radial-gradient(circle, rgba(${acc.rgb},1) 0%, transparent 70%)` }}
        />

        {/* ── Content grid ── */}
        <div className="absolute inset-x-0 top-0 flex items-center" style={{ height: "calc(100% - 56px)" }}>
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-12 xl:px-16">
            <div className="grid lg:grid-cols-[54%_46%] gap-8 lg:gap-12 items-center">

              {/* LEFT — text */}
              <div key={innerKey} className="flex flex-col gap-5 text-center lg:text-left py-10 lg:py-0">

                {/* Eyebrow + tag */}
                <div className="hero-s1 flex flex-wrap items-center gap-2.5 justify-center lg:justify-start">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.10em] text-white/80 backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: `rgba(${acc.rgb},0.95)` }} />
                    {s.eyebrow}
                  </span>
                  {s.tag && (
                    <span className="rounded-full bg-orange-500 px-3.5 py-1 text-xs font-bold text-white shadow-lg shadow-orange-500/40">
                      {s.tag}
                    </span>
                  )}
                </div>

                {/* H1 */}
                <h1
                  className="hero-s2 text-[3.8rem] font-black leading-[1.0] tracking-tight text-white sm:text-8xl lg:text-9xl xl:text-[9rem]"
                  style={{ textWrap: "balance" } as React.CSSProperties}
                >
                  {s.titleLead}{" "}
                  <span className={`bg-gradient-to-r ${acc.grad} bg-clip-text text-transparent`}>
                    {s.titleHighlight}
                  </span>
                  {s.titleTail ? ` ${s.titleTail}` : ""}
                </h1>

                {/* Desc */}
                <p className="hero-s3 text-sm leading-relaxed text-white/65 sm:text-base lg:text-[1.05rem] max-w-lg mx-auto lg:mx-0">
                  {s.desc}
                </p>

                {/* Stat badge */}
                {s.stat && (
                  <div className="hero-s4 flex justify-center lg:justify-start">
                    <div
                      className="inline-flex items-baseline gap-3 rounded-2xl border border-white/15 px-5 py-3 backdrop-blur-sm"
                      style={{ background: `rgba(${acc.rgb},0.16)` }}
                    >
                      <span
                        className="text-4xl font-black tabular-nums sm:text-5xl"
                        style={{ color: `rgba(${acc.rgb},1)`, filter: `drop-shadow(0 0 10px rgba(${acc.rgb},0.7))` }}
                      >
                        {s.stat}
                      </span>
                      <span className="text-sm font-medium text-white/60 sm:text-base">{s.statLabel}</span>
                    </div>
                  </div>
                )}

                {/* CTAs */}
                <div className="hero-s5 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                  <Link
                    href="/rejoindre"
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-extrabold text-brand-700 shadow-xl shadow-black/25 transition-all hover:-translate-y-0.5 hover:shadow-white/20 sm:rounded-2xl sm:px-8 sm:py-4 sm:text-base"
                    style={{ fontFamily: "var(--font-poppins,sans-serif)" }}
                  >
                    <svg className="h-4 w-4 shrink-0 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                    Devenir Partenaire — c&apos;est gratuit
                  </Link>
                  <a
                    href="#simulateur"
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:rounded-2xl sm:px-8 sm:py-4 sm:text-base"
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                    </svg>
                    Simuler mes gains
                  </a>
                </div>

                {/* Reassurance */}
                <ul className="hero-s5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-white/45 justify-center lg:justify-start">
                  {["Gratuit", "Inscription en 2 min", "Sans carte bancaire", "Sans engagement"].map((t) => (
                    <li key={t} className="flex items-center gap-1.5">
                      <svg className="h-3 w-3 shrink-0" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6.5L4.5 9L10 3" stroke="rgba(249,115,22,0.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* RIGHT — illustration (desktop only) */}
              <div className="hidden lg:flex items-center justify-center relative" style={{ height: "440px" }}>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="h-72 w-72 rounded-full blur-[100px] opacity-35"
                    style={{ background: `rgba(${acc.rgb},1)` }}
                  />
                </div>
                <div className="relative z-10 w-full h-full">{illus}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile illustration overlay */}
        <div className="absolute right-2 top-6 h-36 w-32 opacity-[0.06] pointer-events-none lg:hidden">
          {illus}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes heroIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-s1 { animation: heroIn .50s cubic-bezier(.4,0,.2,1) 0ms   both; }
        .hero-s2 { animation: heroIn .55s cubic-bezier(.4,0,.2,1) 80ms  both; }
        .hero-s3 { animation: heroIn .55s cubic-bezier(.4,0,.2,1) 160ms both; }
        .hero-s4 { animation: heroIn .50s cubic-bezier(.4,0,.2,1) 240ms both; }
        .hero-s5 { animation: heroIn .50s cubic-bezier(.4,0,.2,1) 310ms both; }
        @keyframes heroBar { from { width: 0% } to { width: 100% } }
        @keyframes heroRing {
          0%   { transform: scale(1);   opacity: 0.5; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        .hero-ring { animation: heroRing 2.8s ease-out infinite; }
        @keyframes heroDash { to { stroke-dashoffset: -20; } }
        .hero-dash { animation: heroDash 4s linear infinite; }
      `}</style>

      <div className="relative w-full">
        {/* ── Slides ── */}
        <div className="relative overflow-hidden" style={{ minHeight: "max(620px, 88svh)" }}>
          {renderSlide(cur, "current")}
          {next !== null && renderSlide(next, "entering")}

          {/* Progress bar */}
          <div className="absolute bottom-[52px] left-0 right-0 z-20 px-6 sm:px-10 lg:px-16 pointer-events-none">
            <div className="h-[2px] rounded-full bg-white/15 overflow-hidden max-w-[140px] mx-auto lg:mx-0">
              <div
                key={`bar-${cur}`}
                className="h-full rounded-full bg-orange-400"
                style={{ animation: `heroBar ${TICK}ms linear forwards` }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-2.5 py-3.5 px-6">
            <button
              onClick={() => nav((cur - 1 + count) % count)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white text-lg backdrop-blur-sm hover:bg-white/30 transition-all active:scale-90"
              aria-label="Précédent"
            >‹</button>

            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => nav(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === cur
                      ? "w-6 h-2 bg-orange-400 shadow shadow-orange-500/60"
                      : "w-2 h-2 bg-white/25 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => nav((cur + 1) % count)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white text-lg backdrop-blur-sm hover:bg-white/30 transition-all active:scale-90"
              aria-label="Suivant"
            >›</button>

            <span className="ml-1 text-[11px] font-semibold tabular-nums text-white/30">
              {String(cur + 1).padStart(2, "0")}&thinsp;/&thinsp;{String(count).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* ── Children zone (stats bar) ── */}
        {children && (
          <div
            className="px-4 pb-7 pt-5 text-center"
            style={{ background: slides[cur]?.bg ?? "linear-gradient(135deg,#041B4D 0%,#0b3a8a 100%)" }}
          >
            {children}
          </div>
        )}
      </div>
    </>
  );
}

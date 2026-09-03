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
  bg?: string;
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

/* ── Illustrations SVG inline par slide ── */
const ILLUSTRATIONS: Record<number, React.ReactNode> = {
  0: ( // Réseau panafricain
    <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="200" cy="160" r="120" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
      <circle cx="200" cy="160" r="80" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
      <circle cx="200" cy="160" r="40" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
      {/* Nœuds réseau */}
      {[
        [200,160],[80,100],[320,100],[80,220],[320,220],[200,40],[200,280],[140,160],[260,160]
      ].map(([cx,cy],i)=>(
        <g key={i}>
          <circle cx={cx} cy={cy} r={i===0?14:8} fill={i===0?"rgba(255,106,0,0.9)":"rgba(255,255,255,0.2)"} />
          {i>0 && <line x1="200" y1="160" x2={cx} y2={cy} stroke="rgba(255,106,0,0.2)" strokeWidth="1" strokeDasharray="4 4"/>}
        </g>
      ))}
      {/* Continent Afrique stylisé */}
      <path d="M185 80 Q210 70 215 90 Q230 95 225 115 Q240 130 230 150 Q235 170 220 185 Q210 200 200 195 Q185 205 178 190 Q165 185 168 165 Q155 145 165 130 Q160 110 175 100 Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
    </svg>
  ),
  1: ( // Logiciels / code
    <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="40" y="40" width="320" height="240" rx="16" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      <rect x="40" y="40" width="320" height="32" rx="16" fill="rgba(255,255,255,0.08)"/>
      <circle cx="68" cy="56" r="6" fill="rgba(255,80,80,0.6)"/>
      <circle cx="88" cy="56" r="6" fill="rgba(255,180,0,0.6)"/>
      <circle cx="108" cy="56" r="6" fill="rgba(50,200,80,0.6)"/>
      {[90,120,150,180,210,240].map((y,i)=>(
        <rect key={i} x="64" y={y} width={[180,120,160,100,140,80][i]} height="12" rx="6" fill="rgba(255,255,255,0.07)"/>
      ))}
      {[90,150,210].map((y,i)=>(
        <rect key={i} x="64" y={y} width="40" height="12" rx="6" fill="rgba(100,180,255,0.3)"/>
      ))}
      {[120,180,240].map((y,i)=>(
        <rect key={i} x="64" y={y} width="30" height="12" rx="6" fill="rgba(255,106,0,0.4)"/>
      ))}
    </svg>
  ),
  2: ( // Formation / livre
    <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Pile de livres */}
      {[240,210,180,150].map((y,i)=>(
        <rect key={i} x={80+i*6} y={y} width={240-i*12} height="28" rx="4"
          fill={["rgba(255,180,0,0.3)","rgba(255,106,0,0.3)","rgba(255,255,255,0.15)","rgba(255,220,100,0.25)"][i]}
          stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
      ))}
      {/* Diplôme */}
      <rect x="130" y="60" width="140" height="100" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
      <circle cx="200" cy="100" r="20" fill="rgba(255,180,0,0.2)" stroke="rgba(255,180,0,0.5)" strokeWidth="2"/>
      <path d="M192 100 L197 105 L210 92" stroke="rgba(255,180,0,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="150" y="130" width="100" height="8" rx="4" fill="rgba(255,255,255,0.1)"/>
      <rect x="165" y="144" width="70" height="6" rx="3" fill="rgba(255,255,255,0.06)"/>
      {/* Étoiles */}
      {[[60,70],[330,90],[350,200],[50,230]].map(([x,y],i)=>(
        <text key={i} x={x} y={y} fontSize="18" fill="rgba(255,180,0,0.4)">★</text>
      ))}
    </svg>
  ),
  3: ( // Immobilier
    <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Bâtiments */}
      <rect x="60" y="160" width="60" height="120" rx="4" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
      <rect x="150" y="100" width="100" height="180" rx="4" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
      <rect x="270" y="130" width="70" height="150" rx="4" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
      {/* Fenêtres */}
      {[[70,175],[80,175],[70,205],[80,205]].map(([x,y],i)=>(
        <rect key={i} x={x} y={y} width="18" height="18" rx="2" fill="rgba(255,180,50,0.3)"/>
      ))}
      {[[160,115],[185,115],[210,115],[160,145],[185,145],[210,145],[160,175],[185,175],[210,175]].map(([x,y],i)=>(
        <rect key={i} x={x} y={y} width="24" height="20" rx="2" fill="rgba(100,180,255,0.2)"/>
      ))}
      {/* Toit maison principale */}
      <path d="M145 100 L200 55 L255 100" stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="rgba(255,255,255,0.04)"/>
      {/* Sol */}
      <line x1="40" y1="280" x2="360" y2="280" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
      {/* Croissant lune / soleil */}
      <circle cx="340" cy="60" r="28" fill="rgba(255,220,100,0.12)" stroke="rgba(255,220,100,0.25)" strokeWidth="1"/>
      <circle cx="350" cy="52" r="20" fill="rgba(255,180,50,0.08)"/>
    </svg>
  ),
  4: ( // Digital / smartphone
    <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Smartphone */}
      <rect x="150" y="40" width="100" height="200" rx="20" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
      <rect x="158" y="56" width="84" height="148" rx="8" fill="rgba(55,48,163,0.4)"/>
      {/* Écran app */}
      <rect x="163" y="61" width="74" height="40" rx="4" fill="rgba(99,102,241,0.4)"/>
      <rect x="163" y="107" width="34" height="34" rx="4" fill="rgba(255,106,0,0.3)"/>
      <rect x="203" y="107" width="34" height="34" rx="4" fill="rgba(255,255,255,0.1)"/>
      <rect x="163" y="147" width="34" height="34" rx="4" fill="rgba(255,255,255,0.1)"/>
      <rect x="203" y="147" width="34" height="34" rx="4" fill="rgba(100,200,100,0.2)"/>
      {/* Cercle caméra */}
      <circle cx="200" cy="48" r="5" fill="rgba(255,255,255,0.15)"/>
      {/* Ondes Wi-Fi */}
      {[30,50,70].map((r,i)=>(
        <path key={i} d={`M ${200-r} ${40-r*0.5} A ${r} ${r} 0 0 1 ${200+r} ${40-r*0.5}`}
          stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none"/>
      ))}
      {/* Éléments flottants */}
      <rect x="60" y="80" width="60" height="10" rx="5" fill="rgba(255,255,255,0.06)"/>
      <rect x="60" y="100" width="40" height="10" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="280" y="120" width="60" height="10" rx="5" fill="rgba(255,255,255,0.06)"/>
      <rect x="290" y="140" width="40" height="10" rx="5" fill="rgba(255,255,255,0.04)"/>
    </svg>
  ),
  5: ( // IA / ERP — circuit
    <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* CPU */}
      <rect x="150" y="110" width="100" height="100" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(20,180,160,0.4)" strokeWidth="2"/>
      <rect x="162" y="122" width="76" height="76" rx="4" fill="rgba(20,180,160,0.1)" stroke="rgba(20,180,160,0.2)" strokeWidth="1"/>
      <text x="200" y="167" textAnchor="middle" fontSize="14" fill="rgba(20,180,160,0.8)" fontFamily="monospace">AI</text>
      {/* Broches */}
      {[130,150,170,190,210,230,250,270].map((y,i)=>(
        <g key={i}>
          <line x1="130" y1={y} x2="150" y2={y} stroke="rgba(20,180,160,0.4)" strokeWidth="2"/>
          <line x1="250" y1={y} x2="270" y2={y} stroke="rgba(20,180,160,0.4)" strokeWidth="2"/>
        </g>
      ))}
      {[150,170,200,230,250].map((x,i)=>(
        <g key={i}>
          <line x1={x} y1="90" x2={x} y2="110" stroke="rgba(20,180,160,0.4)" strokeWidth="2"/>
          <line x1={x} y1="210" x2={x} y2="230" stroke="rgba(20,180,160,0.4)" strokeWidth="2"/>
        </g>
      ))}
      {/* Données qui circulent */}
      {[[60,160,130,160],[270,130,340,80],[270,190,340,240]].map(([x1,y1,x2,y2],i)=>(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(20,180,160,0.2)" strokeWidth="1" strokeDasharray="6 4"/>
      ))}
      {[[60,160],[340,80],[340,240]].map(([cx,cy],i)=>(
        <circle key={i} cx={cx} cy={cy} r="8" fill="rgba(20,180,160,0.2)" stroke="rgba(20,180,160,0.5)" strokeWidth="1"/>
      ))}
    </svg>
  ),
  6: ( // Conseil / graphique croissance
    <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Grille */}
      {[80,120,160,200,240].map((y,i)=>(
        <line key={i} x1="60" y1={y} x2="340" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
      ))}
      {/* Barres */}
      {[[80,260,40],[140,220,40],[200,180,40],[260,140,40],[300,100,40]].map(([x,y,w],i)=>(
        <rect key={i} x={x} y={y} width={w} height={280-y} rx="4"
          fill={`rgba(255,${106+i*20},0,${0.2+i*0.08})`} stroke={`rgba(255,${106+i*20},0,0.4)`} strokeWidth="1"/>
      ))}
      {/* Ligne tendance */}
      <path d="M100 255 Q180 200 260 130 Q300 100 320 90" stroke="rgba(255,200,100,0.6)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="320" cy="90" r="6" fill="rgba(255,200,100,0.8)"/>
      {/* Axe */}
      <line x1="60" y1="280" x2="340" y2="280" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
      <line x1="60" y1="60" x2="60" y2="280" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
    </svg>
  ),
  7: ( // Market / boutique
    <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Toit boutique */}
      <path d="M60 140 L200 80 L340 140" fill="rgba(5,150,105,0.2)" stroke="rgba(5,150,105,0.4)" strokeWidth="2"/>
      {/* Facade */}
      <rect x="80" y="140" width="240" height="140" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      {/* Porte */}
      <rect x="170" y="200" width="60" height="80" rx="4" fill="rgba(5,150,105,0.2)" stroke="rgba(5,150,105,0.3)" strokeWidth="1"/>
      {/* Vitrine */}
      <rect x="90" y="155" width="70" height="55" rx="4" fill="rgba(255,255,255,0.06)"/>
      <rect x="240" y="155" width="70" height="55" rx="4" fill="rgba(255,255,255,0.06)"/>
      {/* Enseigne */}
      <rect x="120" y="125" width="160" height="22" rx="4" fill="rgba(5,150,105,0.3)"/>
      {/* Soleil */}
      <circle cx="340" cy="70" r="22" fill="rgba(255,220,50,0.15)" stroke="rgba(255,220,50,0.3)" strokeWidth="1"/>
      {/* Panier */}
      <path d="M330 185 L345 185 L348 200 L327 200 Z" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
      <circle cx="332" cy="204" r="3" fill="rgba(255,255,255,0.4)"/>
      <circle cx="344" cy="204" r="3" fill="rgba(255,255,255,0.4)"/>
    </svg>
  ),
  8: ( // Multiservices / événement
    <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Scène */}
      <ellipse cx="200" cy="240" rx="160" ry="20" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      {/* Rideau gauche */}
      <path d="M40 40 Q60 160 50 240" stroke="rgba(190,18,60,0.4)" strokeWidth="24" fill="none" strokeLinecap="round"/>
      {/* Rideau droit */}
      <path d="M360 40 Q340 160 350 240" stroke="rgba(190,18,60,0.4)" strokeWidth="24" fill="none" strokeLinecap="round"/>
      {/* Projecteurs */}
      {[[120,40,160,200],[200,30,200,220],[280,40,240,200]].map(([x1,y1,x2,y2],i)=>(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,220,100,0.1)" strokeWidth="30"/>
      ))}
      {/* Silhouettes */}
      {[140,200,260].map((x,i)=>(
        <g key={i}>
          <circle cx={x} cy={188} r={i===1?14:10} fill="rgba(255,255,255,0.1)"/>
          <rect x={x-(i===1?10:7)} y={202} width={i===1?20:14} height={i===1?30:24} rx="4" fill="rgba(255,255,255,0.08)"/>
        </g>
      ))}
      {/* Étoiles */}
      {[[80,80],[320,60],[350,140],[55,180]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={i%2===0?3:2} fill="rgba(255,220,100,0.5)"/>
      ))}
    </svg>
  ),
  9: ( // Financement / monnaie
    <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Pièces empilées */}
      {[280,260,240,220,200].map((y,i)=>(
        <g key={i}>
          <ellipse cx="200" cy={y} rx={70-i*2} ry="14" fill={`rgba(202,138,4,${0.15+i*0.07})`} stroke="rgba(202,138,4,0.4)" strokeWidth="1"/>
        </g>
      ))}
      <ellipse cx="200" cy="200" rx="70" ry="14" fill="rgba(202,138,4,0.4)" stroke="rgba(202,138,4,0.6)" strokeWidth="1"/>
      {/* Symbole FCFA / monnaie */}
      <text x="200" y="206" textAnchor="middle" fontSize="13" fill="rgba(255,220,80,0.8)" fontFamily="sans-serif">FCFA</text>
      {/* Graphe montée */}
      <path d="M60 250 L100 230 L160 190 L220 150 L290 100 L340 70"
        stroke="rgba(202,138,4,0.5)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M60 250 L100 230 L160 190 L220 150 L290 100 L340 70 L340 280 L60 280 Z"
        fill="rgba(202,138,4,0.05)"/>
      {/* Flèche haut */}
      <path d="M330 60 L340 70 L350 60" stroke="rgba(202,138,4,0.6)" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  10: ( // Emploi / talent
    <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Profils */}
      {[[120,100],[200,80],[280,100],[80,200],[200,185],[320,200]].map(([cx,cy],i)=>(
        <g key={i}>
          <circle cx={cx} cy={cy} r={i===1||i===4?20:14} fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
          <circle cx={cx} cy={cy-4} r={i===1||i===4?8:5} fill="rgba(255,255,255,0.12)"/>
          <path d={`M ${cx-(i===1||i===4?16:11)} ${cy+(i===1||i===4?12:8)} Q ${cx} ${cy+(i===1||i===4?24:17)} ${cx+(i===1||i===4?16:11)} ${cy+(i===1||i===4?12:8)}`}
            fill="rgba(255,255,255,0.06)"/>
        </g>
      ))}
      {/* Lignes connexion */}
      {[[120,100,200,80],[200,80,280,100],[120,100,80,200],[280,100,320,200],[200,80,200,185]].map(([x1,y1,x2,y2],i)=>(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(100,116,139,0.3)" strokeWidth="1" strokeDasharray="4 3"/>
      ))}
      {/* Badge check talent */}
      <circle cx="200" cy="80" r="10" fill="rgba(100,200,120,0.3)" stroke="rgba(100,200,120,0.6)" strokeWidth="1.5"/>
      <path d="M195 80 L199 84 L207 75" stroke="rgba(100,200,120,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Valise */}
      <rect x="172" y="240" width="56" height="40" rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
      <rect x="186" y="234" width="28" height="10" rx="4" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
      <line x1="172" y1="258" x2="228" y2="258" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
    </svg>
  ),
};

/* ── Durée de la transition ── */
const DUR = 800; // ms

interface Props {
  slides?: HeroSlide[];
  children?: React.ReactNode;
}

export function HeroSlider({ slides = CATALOG_HERO_SLIDES, children }: Props) {
  const count  = slides.length;
  const [cur,  setCur]  = useState(0);   // slide visible
  const [next, setNext] = useState<number | null>(null); // slide entrante
  const [dir,  setDir]  = useState<1 | -1>(1); // 1 = gauche→droite, -1 = droite→gauche
  const [phase, setPhase] = useState<"idle" | "run">("idle");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goto = useCallback((to: number, direction: 1 | -1 = 1) => {
    if (phase !== "idle" || to === cur) return;
    setNext(to);
    setDir(direction);
    setPhase("run");
    animRef.current = setTimeout(() => {
      setCur(to);
      setNext(null);
      setPhase("idle");
    }, DUR);
  }, [phase, cur]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      goto((cur + 1) % count, 1);
    }, 6500);
  }, [cur, count, goto]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animRef.current)  clearTimeout(animRef.current);
    };
  }, [startTimer]);

  const handleNav = (to: number) => {
    const d: 1 | -1 = to > cur ? 1 : -1;
    goto(to, d);
    startTimer();
  };

  // Styles d'animation par rôle + phase
  const style = {
    // Slide en cours — reste visible, sort vers la gauche quand la transition joue
    current: (active: boolean): React.CSSProperties => ({
      opacity:   active ? 0 : 1,
      transform: active
        ? `translateX(${dir * -8}%) scale(0.97)`
        : "translateX(0%) scale(1)",
      transition: active
        ? `opacity ${DUR}ms cubic-bezier(0.4,0,0.2,1), transform ${DUR}ms cubic-bezier(0.4,0,0.2,1)`
        : "none",
      zIndex: 1,
    }),
    // Slide entrante — entre depuis la droite (ou gauche) et glisse au centre
    entering: (active: boolean): React.CSSProperties => ({
      opacity:   active ? 1 : 0,
      transform: active
        ? "translateX(0%) scale(1)"
        : `translateX(${dir * 6}%) scale(1.02)`,
      transition: active
        ? `opacity ${DUR}ms cubic-bezier(0.22,1,0.36,1), transform ${DUR}ms cubic-bezier(0.22,1,0.36,1)`
        : "none",
      zIndex: 2,
    }),
  };

  const renderSlide = (i: number, role: "current" | "entering") => {
    const slide = slides[i];
    const accent = slide.accent ?? "orange";
    const grad   = HIGHLIGHT_GRAD[accent] ?? HIGHLIGHT_GRAD.orange;
    const stat   = STAT_CLS[accent] ?? STAT_CLS.orange;
    const illus  = ILLUSTRATIONS[i] ?? ILLUSTRATIONS[0];
    const active = phase === "run";
    const s = role === "current" ? style.current(active) : style.entering(active);

    return (
      <div
        key={role}
        className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-16 sm:py-24 sm:pb-28 lg:py-28 lg:pb-32 text-center"
        style={{ background: slide.bg ?? "linear-gradient(135deg,#041B4D 0%,#0b3a8a 100%)", ...s }}
      >
        {/* Illustration de fond */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
          <div className="h-full w-full max-w-2xl">{illus}</div>
        </div>

        {/* Décors géométriques */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/5 animate-float" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5 animate-float" style={{ animationDelay: "1.5s" }} />
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
          <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
          <div className="absolute inset-0 opacity-[0.035]"
            style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
        </div>

        {/* Contenu */}
        <div className="relative z-10 mx-auto w-full max-w-4xl">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
              {slide.eyebrow}
            </span>
            {slide.tag && (
              <span className="rounded-full bg-orange-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-orange-500/30">
                {slide.tag}
              </span>
            )}
          </div>

          <h1
            className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            {slide.titleLead}{" "}
            <span className={`bg-gradient-to-r ${grad} bg-clip-text text-transparent`}>
              {slide.titleHighlight}
            </span>
            {slide.titleTail ? ` ${slide.titleTail}` : ""}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">
            {slide.desc}
          </p>

          {slide.stat && (
            <div className="mt-7 flex justify-center">
              <div className={`inline-flex items-center gap-3 rounded-2xl px-6 py-3 ring-1 backdrop-blur-sm ${stat}`}>
                <span className="text-3xl font-extrabold tabular-nums">{slide.stat}</span>
                <span className="text-sm font-medium opacity-80">{slide.statLabel}</span>
              </div>
            </div>
          )}

          {children && <div className="mt-9">{children}</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: "620px" }}>
      {/* Slide courant */}
      {renderSlide(cur, "current")}

      {/* Slide entrant (monté uniquement pendant la transition) */}
      {next !== null && renderSlide(next, "entering")}

      {/* Navigation */}
      <div className="absolute bottom-7 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2.5">
        <button
          onClick={() => handleNav((cur - 1 + count) % count)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white text-xl backdrop-blur-sm transition-all hover:bg-white/30 hover:scale-110 active:scale-95"
          aria-label="Précédent"
        >‹</button>

        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => handleNav(i)}
            aria-label={`Slide ${i + 1}`}
            className={`rounded-full transition-all duration-400 ${
              i === cur
                ? "w-8 h-2.5 bg-orange-400 shadow-lg shadow-orange-500/50"
                : "w-2 h-2 bg-white/20 hover:bg-white/50 hover:scale-125"
            }`}
          />
        ))}

        <button
          onClick={() => handleNav((cur + 1) % count)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white text-xl backdrop-blur-sm transition-all hover:bg-white/30 hover:scale-110 active:scale-95"
          aria-label="Suivant"
        >›</button>

        <span className="ml-2 text-xs font-semibold tabular-nums text-white/35">
          {String(cur + 1).padStart(2, "0")}&thinsp;/&thinsp;{String(count).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

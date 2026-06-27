// Illustrations SVG vectorielles — toujours nettes, responsives (viewBox),
// aux couleurs de la marque. Aucune dépendance externe.

/** Dashboard de revenus stylisé pour le hero. */
export function HeroDashboard({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 520 440" className={className} role="img" aria-label="Tableau de bord des revenus IBIG PARTNERS" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hd-card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f3f7ff" />
        </linearGradient>
        <linearGradient id="hd-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b5fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#0b5fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hd-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f5b73d" />
          <stop offset="1" stopColor="#e69a14" />
        </linearGradient>
        <filter id="hd-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="18" floodColor="#0c1e5c" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Carte principale */}
      <g filter="url(#hd-shadow)">
        <rect x="40" y="50" width="400" height="280" rx="22" fill="url(#hd-card)" />
      </g>

      {/* En-tête de carte */}
      <text x="66" y="92" fontFamily="sans-serif" fontSize="14" fontWeight="700" fill="#0f1729">Revenus du mois</text>
      <text x="66" y="124" fontFamily="sans-serif" fontSize="30" fontWeight="800" fill="#0b4fe0">540 000 FCFA</text>
      <g>
        <rect x="320" y="74" width="92" height="26" rx="13" fill="#e7f8ef" />
        <text x="366" y="91" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight="700" fill="#0a9a55">▲ +28%</text>
      </g>

      {/* Aire + courbe */}
      <path d="M66 250 L120 232 L174 240 L228 200 L282 210 L336 168 L390 150 L414 150 L414 300 L66 300 Z" fill="url(#hd-area)" />
      <path d="M66 250 L120 232 L174 240 L228 200 L282 210 L336 168 L390 150" fill="none" stroke="#0b5fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      {[["66","250"],["120","232"],["174","240"],["228","200"],["282","210"],["336","168"],["390","150"]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4.5" fill="#fff" stroke="#0b5fff" strokeWidth="2.5" />
      ))}

      {/* Mini-barres niveaux */}
      <g>
        {[["N1", 70, "#0b5fff"], ["N2", 46, "#6366f1"], ["N3", 28, "#a855f7"]].map(([lbl, h, c], i) => (
          <g key={i} transform={`translate(${300 + i * 38}, ${300 - (h as number)})`}>
            <rect width="22" height={h as number} rx="6" fill={c as string} opacity="0.85" />
          </g>
        ))}
      </g>

      {/* Badge flottant "Statut Gold" */}
      <g filter="url(#hd-shadow)" transform="translate(330, 280)">
        <rect width="150" height="64" rx="16" fill="#fff" />
        <circle cx="34" cy="32" r="18" fill="url(#hd-gold)" />
        <text x="34" y="38" textAnchor="middle" fontFamily="sans-serif" fontSize="16">★</text>
        <text x="62" y="28" fontFamily="sans-serif" fontSize="12" fontWeight="700" fill="#0f1729">Statut Gold</text>
        <text x="62" y="46" fontFamily="sans-serif" fontSize="11" fill="#5b6577">+5% bonus</text>
      </g>

      {/* Nœud réseau flottant */}
      <g filter="url(#hd-shadow)" transform="translate(20, 250)">
        <rect width="132" height="60" rx="16" fill="#fff" />
        <circle cx="30" cy="30" r="16" fill="#e8efff" />
        <path d="M30 22 a4 4 0 1 1 0 8 a4 4 0 1 1 0 -8 M22 42 c0-4 3.5-6 8-6 s8 2 8 6" fill="none" stroke="#0b5fff" strokeWidth="2" />
        <text x="56" y="27" fontFamily="sans-serif" fontSize="12" fontWeight="700" fill="#0f1729">Réseau actif</text>
        <text x="56" y="45" fontFamily="sans-serif" fontSize="14" fontWeight="800" fill="#0b4fe0">+42</text>
      </g>

      {/* Pièces */}
      <g transform="translate(404, 40)">
        <circle cx="0" cy="0" r="20" fill="url(#hd-gold)" />
        <text x="0" y="5" textAnchor="middle" fontFamily="sans-serif" fontSize="14" fontWeight="800" fill="#7a4e06">₣</text>
      </g>
    </svg>
  );
}

/** Schéma de réseau à 3 niveaux. */
export function NetworkTree({ className = "" }: { className?: string }) {
  const node = (x: number, y: number, color: string, r = 18) => (
    <g transform={`translate(${x}, ${y})`}>
      <circle r={r} fill={color} opacity="0.15" />
      <circle r={r - 6} fill={color} />
    </g>
  );
  return (
    <svg viewBox="0 0 460 320" className={className} role="img" aria-label="Réseau de parrainage à 3 niveaux" xmlns="http://www.w3.org/2000/svg">
      {/* liens */}
      <g stroke="#cbd5e1" strokeWidth="2" fill="none">
        <path d="M230 56 L120 140 M230 56 L340 140" />
        <path d="M120 150 L70 240 M120 150 L170 240" />
        <path d="M340 150 L290 240 M340 150 L390 240" />
      </g>

      {/* N1 (vous) */}
      {node(230, 56, "#0b5fff", 24)}
      <text x="230" y="61" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fontWeight="800" fill="#fff">VOUS</text>
      <g>
        <rect x="282" y="44" width="120" height="26" rx="13" fill="#e8efff" />
        <text x="342" y="61" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="700" fill="#0b4fe0">N1 · taux plein</text>
      </g>

      {/* N2 */}
      {node(120, 145, "#6366f1")}
      {node(340, 145, "#6366f1")}
      <g>
        <rect x="8" y="132" width="92" height="24" rx="12" fill="#eef0ff" />
        <text x="54" y="148" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="700" fill="#4f46e5">N2 · 50%</text>
      </g>

      {/* N3 */}
      {[70, 170, 290, 390].map((x, i) => <g key={i}>{node(x, 245, "#a855f7", 15)}</g>)}
      <g>
        <rect x="360" y="232" width="92" height="24" rx="12" fill="#f5edff" />
        <text x="406" y="248" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="700" fill="#9333ea">N3 · 25%</text>
      </g>
    </svg>
  );
}

/** Graphique en barres : progression des revenus par statut. */
export function GrowthBars({ className = "" }: { className?: string }) {
  const bars = [
    { label: "Starter", h: 60,  c: "#94a3b8" },
    { label: "Silver",  h: 110, c: "#64748b" },
    { label: "Gold",    h: 165, c: "#f5b73d" },
    { label: "Master",  h: 215, c: "#6366f1" },
    { label: "Elite",   h: 260, c: "#0b5fff" },
  ];
  const baseY = 290;
  return (
    <svg viewBox="0 0 460 320" className={className} role="img" aria-label="Progression des revenus selon le statut" xmlns="http://www.w3.org/2000/svg">
      {/* grille */}
      <g stroke="#eef1f7" strokeWidth="1">
        {[70, 130, 190, 250].map((y) => <line key={y} x1="40" y1={y} x2="440" y2={y} />)}
      </g>
      <line x1="40" y1={baseY} x2="440" y2={baseY} stroke="#cbd5e1" strokeWidth="2" />

      {bars.map((b, i) => {
        const x = 64 + i * 78;
        const y = baseY - b.h;
        return (
          <g key={b.label}>
            <rect x={x} y={y} width="46" height={b.h} rx="8" fill={b.c}>
              <animate attributeName="height" from="0" to={b.h} dur="0.9s" begin={`${i * 0.12}s`} fill="freeze" />
              <animate attributeName="y" from={baseY} to={y} dur="0.9s" begin={`${i * 0.12}s`} fill="freeze" />
            </rect>
            <text x={x + 23} y={baseY + 18} textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight="600" fill="#5b6577">{b.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

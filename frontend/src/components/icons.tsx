import type { SVGProps } from "react";

/**
 * Jeu d'icônes au trait (style ligne, currentColor) — remplace les emojis
 * pour un rendu professionnel et homogène sur tout le site.
 */

type IconName =
  | "key" | "network" | "wallet" | "sparkles" | "shield" | "lock"
  | "card" | "phone" | "globe" | "building" | "chart" | "puzzle"
  | "link" | "target" | "rocket" | "trophy" | "users" | "trending"
  | "graduation" | "home" | "briefcase" | "check" | "handshake"
  | "store" | "cpu" | "layers" | "coins";

const PATHS: Record<IconName, React.ReactNode> = {
  key: <><circle cx="7.5" cy="15.5" r="4.5" /><path d="m21 2-9.6 9.6" /><path d="m15.5 7.5 3 3L22 7l-3-3" /></>,
  network: <><circle cx="12" cy="5" r="2.5" /><circle cx="5" cy="19" r="2.5" /><circle cx="19" cy="19" r="2.5" /><path d="M12 7.5v4M10 13l-3 3.5M14 13l3 3.5" /></>,
  wallet: <><path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5" /><path d="M16 12h.01" /></>,
  sparkles: <><path d="m12 3 1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9Z" /><path d="M19 14v4M21 16h-4" /></>,
  shield: <><path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5Z" /><path d="m9 12 2 2 4-4" /></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  card: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>,
  phone: <><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M11 18h2" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" /></>,
  building: <><rect x="5" y="3" width="14" height="18" rx="1.5" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3" /></>,
  chart: <><path d="M3 3v18h18" /><path d="m7 14 3-3 3 2 4-5" /></>,
  puzzle: <><path d="M10 3h4v3a2 2 0 0 0 4 0V3h0a2 2 0 0 1 2 2v3h0a2 2 0 0 0 0 4h0v4a2 2 0 0 1-2 2h-3v0a2 2 0 0 0-4 0v0H7a2 2 0 0 1-2-2v-3H5a2 2 0 0 1 0-4h0V5a2 2 0 0 1 2-2h3Z" /></>,
  link: <><path d="M9 15 15 9" /><path d="M11 6.5 13 4.5a4 4 0 0 1 6 6l-2 2" /><path d="M13 17.5 11 19.5a4 4 0 0 1-6-6l2-2" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /></>,
  rocket: <><path d="M5 13c-1.5 1.5-2 5-2 5s3.5-.5 5-2" /><path d="M12 3c4 1 7 4 8 8-2 3-5 5-8 6-3-1-6-3-8-6 1-4 4-7 8-8Z" /><circle cx="12" cy="10" r="2" /></>,
  trophy: <><path d="M7 4h10v5a5 5 0 0 1-10 0Z" /><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 18h6M10 21h4M12 14v4" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5" /><path d="M16 6a3 3 0 0 1 0 6M17 15c2.5.5 4 2.3 4 5" /></>,
  trending: <><path d="m3 17 6-6 4 4 8-8" /><path d="M17 7h4v4" /></>,
  graduation: <><path d="m12 4 10 5-10 5L2 9Z" /><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" /></>,
  home: <><path d="M4 11 12 4l8 7" /><path d="M6 10v10h12V10" /><path d="M10 20v-5h4v5" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" /></>,
  check: <><path d="m5 12 4 4 10-10" /></>,
  handshake: <><path d="m11 17 2 2a1 1 0 0 0 1.4 0l3.6-3.6" /><path d="M4 13 2.5 11.5a2 2 0 0 1 0-3L7 4l4 3 3-1 6 5-2 3" /><path d="m7 13 2 2M9 11l2 2" /></>,
  store: <><path d="M4 9h16l-1-4H5Z" /><path d="M4 9v10h16V9M9 19v-5h6v5" /></>,
  cpu: <><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" /><rect x="10" y="10" width="4" height="4" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5Z" /><path d="m3 13 9 5 9-5M3 17l9 5 9-5" /></>,
  coins: <><circle cx="9" cy="9" r="6" /><path d="M15.5 4a6 6 0 0 1 0 16M7 9h4M9 7v4" /></>,
};

export function Icon({
  name,
  className = "h-6 w-6",
  strokeWidth = 1.7,
  ...rest
}: { name: IconName; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}

export type { IconName };

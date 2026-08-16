"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Pages françaises disposant d'un équivalent anglais (mapping page-à-page).
// Les pages FR sans équivalent renvoient vers l'accueil anglais /en.
const FR_TO_EN: Record<string, string> = {
  "/": "/en",
  "/rejoindre": "/en/rejoindre",
};

/**
 * Sélecteur de langue FR/EN.
 * - Depuis une page /en/* : renvoie vers l'équivalent français (retrait du préfixe).
 * - Depuis une page française : renvoie vers l'équivalent anglais s'il existe,
 *   sinon vers l'accueil anglais /en.
 */
export function LangSwitcher() {
  const pathname = usePathname() || "/";
  const isEn = pathname === "/en" || pathname.startsWith("/en/");
  const target = isEn
    ? pathname.replace(/^\/en/, "") || "/"
    : FR_TO_EN[pathname] ?? "/en";
  const label = isEn ? "FR" : "EN";
  const aria = isEn ? "Passer en français" : "Switch to English";

  return (
    <Link
      href={target}
      hrefLang={isEn ? "fr" : "en"}
      aria-label={aria}
      title={aria}
      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-bold text-slate-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
    >
      <span aria-hidden>🌐</span>
      {label}
    </Link>
  );
}

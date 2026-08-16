"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Sélecteur de langue FR/EN.
 * - Depuis une page /en/* : renvoie vers l'équivalent français (retrait du préfixe).
 * - Depuis une page française : renvoie vers l'accueil anglais /en.
 *   (Le mapping page-à-page côté FR→EN s'enrichira à mesure que d'autres
 *   pages anglaises seront ajoutées.)
 */
export function LangSwitcher() {
  const pathname = usePathname() || "/";
  const isEn = pathname === "/en" || pathname.startsWith("/en/");
  const target = isEn ? pathname.replace(/^\/en/, "") || "/" : "/en";
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

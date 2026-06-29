"use client";
import { useEffect, useState } from "react";

/**
 * Sticky CTA mobile : barre flottante en bas d'écran qui apparaît au scroll.
 * Convertit massivement sur mobile (jusqu'à 2x plus d'inscriptions).
 * Cachée sur desktop (un CTA dans le header desktop existe déjà).
 */
export function StickyMobileCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      data-testid="sticky-mobile-cta"
      className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-500 sm:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
    >
      <div className="bg-gradient-to-r from-brand-700 to-brand-600 p-3 shadow-2xl border-t-2 border-gold-400">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-gold-400 uppercase tracking-wider">
              ⚡ Gratuit · Sans engagement
            </p>
            <p className="text-sm font-bold text-white truncate">
              Rejoignez IBIG PARTNERS
            </p>
          </div>
          <a
            href="/rejoindre"
            data-testid="sticky-cta-btn"
            className="shrink-0 rounded-xl bg-gold-400 px-4 py-2.5 text-sm font-extrabold text-brand-900 shadow-lg active:scale-95 transition-transform"
          >
            S&apos;inscrire →
          </a>
        </div>
      </div>
    </div>
  );
}

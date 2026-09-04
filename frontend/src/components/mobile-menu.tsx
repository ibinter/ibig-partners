"use client";

import { useState } from "react";
import Link from "next/link";

type Lang = "fr" | "en";

const NAV = {
  fr: [
    { href: "/#branches", icon: "🏢", label: "Branches" },
    { href: "/#commissions", icon: "💰", label: "Commissions" },
    { href: "/#statuts", icon: "⭐", label: "Statuts" },
    { href: "/#espace", icon: "🖥️", label: "Espace partenaire" },
  ],
  en: [
    { href: "/en#software", icon: "🖥️", label: "Software" },
    { href: "/en#commissions", icon: "💰", label: "Commissions" },
    { href: "/en#faq", icon: "❓", label: "FAQ" },
    { href: "/en/partenaires", icon: "🏢", label: "Our partners" },
  ],
} as const;

const T = {
  fr: { open: "Ouvrir le menu", close: "Fermer le menu", signIn: "Connexion", signInHref: "/connexion", join: "Devenir Partenaire — c'est gratuit", joinHref: "/rejoindre" },
  en: { open: "Open menu", close: "Close menu", signIn: "Sign in", signInHref: "/connexion", join: "Become a Partner — it's free", joinHref: "/en/rejoindre" },
} as const;

export function MobileMenu({ lang = "fr" }: { lang?: Lang }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const t = T[lang];
  const nav = NAV[lang];

  return (
    <>
      {/* Bouton hamburger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-xl border border-slate-200 bg-white p-2 shadow-sm lg:hidden"
        aria-label={open ? t.close : t.open}
      >
        <span className={`block h-[2px] w-6 rounded-full bg-[#041B4D] transition-all duration-200 ${open ? "translate-y-[7px] rotate-45" : ""}`} />
        <span className={`block h-[2px] w-6 rounded-full bg-[#041B4D] transition-all duration-200 ${open ? "opacity-0 scale-x-0" : ""}`} />
        <span className={`block h-[2px] w-6 rounded-full bg-[#041B4D] transition-all duration-200 ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
      </button>

      {/* Menu plein écran — fixed inset-0, aucun risque de chevauchement */}
      {open && (
        <div className="fixed inset-0 z-[500] flex flex-col bg-white lg:hidden">
          {/* Barre du haut avec logo et croix */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-base font-extrabold text-[#041B4D]" style={{ fontFamily: "var(--font-poppins,sans-serif)" }}>
              IBIG <span style={{ color: "#FF6A00" }}>PARTNERS</span>
            </span>
            <button
              onClick={close}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
              aria-label={t.close}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Liens */}
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={close}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTAs en bas */}
          <div className="border-t border-slate-100 p-4 flex flex-col gap-3">
            <Link
              href={t.signInHref}
              onClick={close}
              className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-[#041B4D]"
            >
              {t.signIn}
            </Link>
            <Link
              href={t.joinHref}
              onClick={close}
              className="rounded-xl px-4 py-3.5 text-center text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg,#FF6A00,#e55d00)" }}
            >
              {t.join}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

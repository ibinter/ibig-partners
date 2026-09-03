"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [top, setTop] = useState(68);
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);
  const t = T[lang];
  const nav = NAV[lang];

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const header = btnRef.current?.closest("header");
    if (header) {
      const rect = header.getBoundingClientRect();
      setTop(rect.bottom);
    }
    const onScroll = () => {
      const header = btnRef.current?.closest("header");
      if (header) setTop(header.getBoundingClientRect().bottom);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  const dropdown = open && mounted ? createPortal(
    <>
      <div className="fixed inset-0 z-[199] lg:hidden" onClick={close} />
      <div
        className="fixed inset-x-0 z-[200] border-b border-slate-200 bg-white shadow-xl lg:hidden"
        style={{ top: `${top}px` }}
      >
        <nav className="flex flex-col gap-1 p-4">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={close}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700"
            >
              <span className="text-lg">{item.icon}</span> {item.label}
            </a>
          ))}
          <hr className="my-2 border-slate-100" />
          <Link
            href={t.signInHref}
            onClick={close}
            className="rounded-xl px-4 py-3 text-center text-sm font-medium text-brand-700 hover:bg-brand-50"
          >
            {t.signIn}
          </Link>
          <Link
            href={t.joinHref}
            onClick={close}
            className="rounded-xl bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-700"
          >
            {t.join}
          </Link>
        </nav>
      </div>
    </>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-xl border border-slate-200 bg-white p-2 shadow-sm lg:hidden"
        aria-label={open ? t.close : t.open}
      >
        <span
          className={`block h-[2px] w-6 rounded-full bg-[#041B4D] transition-all duration-200 ${
            open ? "translate-y-[7px] rotate-45" : ""
          }`}
        />
        <span
          className={`block h-[2px] w-6 rounded-full bg-[#041B4D] transition-all duration-200 ${
            open ? "opacity-0 scale-x-0" : ""
          }`}
        />
        <span
          className={`block h-[2px] w-6 rounded-full bg-[#041B4D] transition-all duration-200 ${
            open ? "-translate-y-[7px] -rotate-45" : ""
          }`}
        />
      </button>
      {dropdown}
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="flex flex-col items-center justify-center gap-1.5 p-2 md:hidden"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
      >
        <span
          className={`block h-0.5 w-5 rounded-full bg-slate-700 transition-all duration-200 ${
            open ? "translate-y-2 rotate-45" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-5 rounded-full bg-slate-700 transition-all duration-200 ${
            open ? "opacity-0 scale-x-0" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-5 rounded-full bg-slate-700 transition-all duration-200 ${
            open ? "-translate-y-2 -rotate-45" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 border-b border-slate-200 bg-white shadow-xl md:hidden">
          <nav className="flex flex-col gap-1 p-4">
            <a
              href="/#branches"
              onClick={close}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700"
            >
              <span className="text-lg">🏢</span> Branches
            </a>
            <a
              href="/#commissions"
              onClick={close}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700"
            >
              <span className="text-lg">💰</span> Commissions
            </a>
            <a
              href="/#statuts"
              onClick={close}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700"
            >
              <span className="text-lg">⭐</span> Statuts
            </a>
            <a
              href="/#espace"
              onClick={close}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700"
            >
              <span className="text-lg">🖥️</span> Espace partenaire
            </a>
            <hr className="my-2 border-slate-100" />
            <Link
              href="/connexion"
              onClick={close}
              className="rounded-xl px-4 py-3 text-center text-sm font-medium text-brand-700 hover:bg-brand-50"
            >
              Connexion
            </Link>
            <Link
              href="/rejoindre"
              onClick={close}
              className="rounded-xl bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-700"
            >
              Devenir Partenaire — c&apos;est gratuit
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}

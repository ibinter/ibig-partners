"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "ibig_welcome_seen";

export function WelcomeModal({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) setOpen(true);
    } catch {}
  }, []);

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, userId); } catch {}
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-6 py-6 text-white text-center relative">
          <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10 blur-md" />
          <p className="text-3xl mb-2">👋</p>
          <h2 className="text-xl font-extrabold">Bienvenue chez IBIG PARTNERS !</h2>
          <p className="text-blue-200 text-sm mt-1">Voici par où commencer pour gagner vos premières commissions.</p>
        </div>

        {/* 3 étapes prioritaires */}
        <div className="p-5 space-y-3">
          <Link
            href="/espace/verification"
            onClick={dismiss}
            className="flex items-center gap-4 rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-3.5 hover:border-amber-400 hover:bg-amber-100 transition group"
          >
            <span className="text-2xl shrink-0">🔐</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-900">1 — Vérifiez votre identité (KYC)</p>
              <p className="text-xs text-amber-700 mt-0.5">Indispensable pour recevoir vos commissions.</p>
            </div>
            <span className="text-amber-400 group-hover:text-amber-600 shrink-0">→</span>
          </Link>

          <Link
            href="/espace/produits"
            onClick={dismiss}
            className="flex items-center gap-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3.5 hover:border-emerald-400 hover:bg-emerald-100 transition group"
          >
            <span className="text-2xl shrink-0">🧩</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-emerald-900">2 — Activez vos produits</p>
              <p className="text-xs text-emerald-700 mt-0.5">Choisissez ce que vous allez promouvoir.</p>
            </div>
            <span className="text-emerald-400 group-hover:text-emerald-600 shrink-0">→</span>
          </Link>

          <Link
            href="/espace/liens"
            onClick={dismiss}
            className="flex items-center gap-4 rounded-2xl border-2 border-blue-200 bg-blue-50 px-4 py-3.5 hover:border-blue-400 hover:bg-blue-100 transition group"
          >
            <span className="text-2xl shrink-0">🔗</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-blue-900">3 — Copiez votre lien affilié</p>
              <p className="text-xs text-blue-700 mt-0.5">Partagez-le sur WhatsApp, Facebook, etc.</p>
            </div>
            <span className="text-blue-400 group-hover:text-blue-600 shrink-0">→</span>
          </Link>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex items-center justify-between gap-3">
          <Link
            href="/espace/bienvenue"
            onClick={dismiss}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Voir le guide complet (30 jours) →
          </Link>
          <button
            onClick={dismiss}
            className="rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

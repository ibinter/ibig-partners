"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

export default function PartenairesFilter({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const q = searchParams.get("q") ?? "";
  const etat = searchParams.get("etat") ?? "";
  const verif = searchParams.get("verif") ?? "";
  const badge = searchParams.get("badge") ?? "";

  const hasFilter = q || etat || verif || badge;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 px-4 py-3">
      {/* Recherche */}
      <input
        type="search"
        placeholder="Nom, email, code…"
        defaultValue={q}
        onChange={(e) => update("q", e.target.value)}
        className="h-9 w-56 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
      />

      {/* État */}
      <select
        value={etat}
        onChange={(e) => update("etat", e.target.value)}
        className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
      >
        <option value="">Tous les états</option>
        <option value="pending">En attente</option>
        <option value="active">Actif</option>
        <option value="suspended">Suspendu</option>
      </select>

      {/* Vérification */}
      <select
        value={verif}
        onChange={(e) => update("verif", e.target.value)}
        className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
      >
        <option value="">Toutes vérifications</option>
        <option value="VERIFIED">Vérifié</option>
        <option value="SUBMITTED">Dossier reçu</option>
        <option value="REJECTED">Refusé</option>
        <option value="NONE">Non vérifié</option>
      </select>

      {/* Score */}
      <select
        value={badge}
        onChange={(e) => update("badge", e.target.value)}
        className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
      >
        <option value="">Tous les scores</option>
        <option value="ELITE">🏆 ELITE</option>
        <option value="GOLD">⭐ GOLD</option>
        <option value="SILVER">🥈 SILVER</option>
        <option value="BRONZE">🥉 BRONZE</option>
        <option value="STARTER">🌱 STARTER</option>
      </select>

      {hasFilter && (
        <button
          onClick={() => router.push(pathname)}
          className="h-9 rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
        >
          ✕ Réinitialiser
        </button>
      )}

      <span className="ml-auto text-xs text-muted">{total} résultat{total > 1 ? "s" : ""}</span>
    </div>
  );
}

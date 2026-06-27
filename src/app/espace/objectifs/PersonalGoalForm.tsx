"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "ibig_personal_monthly_goal";

export function PersonalGoalForm({ monthlySales }: { monthlySales: number }) {
  const [goal, setGoal] = useState<number>(0);
  const [draft, setDraft] = useState<string>("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const n = Number(stored);
      if (!Number.isNaN(n)) {
        setGoal(n);
        setDraft(String(n));
      }
    }
  }, []);

  function save(e: React.FormEvent) {
    e.preventDefault();
    const n = Math.max(0, Number(draft) || 0);
    setGoal(n);
    window.localStorage.setItem(STORAGE_KEY, String(n));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const progress = goal > 0 ? Math.min(100, Math.round((monthlySales / goal) * 100)) : 0;
  const reached = goal > 0 && monthlySales >= goal;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="font-bold text-slate-800 text-sm">🎯 Mon objectif mensuel personnel</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Fixez-vous un objectif de ventes pour ce mois. Suivi enregistré sur cet appareil.
          </p>
        </div>
      </div>

      <form onSubmit={save} className="flex flex-wrap items-end gap-3 mb-5">
        <label className="block">
          <span className="block text-xs font-semibold text-slate-600 mb-1.5">
            Objectif (nombre de ventes)
          </span>
          <input
            type="number"
            min={0}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ex : 10"
            className="w-40 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </label>
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          {saved ? "✓ Enregistré" : "Définir l'objectif"}
        </button>
      </form>

      {goal > 0 ? (
        <div>
          <div className="flex items-center justify-between text-xs font-medium mb-1.5">
            <span className="text-slate-600">
              {monthlySales} / {goal} ventes ce mois
            </span>
            <span className={reached ? "text-emerald-600 font-bold" : "text-slate-500"}>
              {progress}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all ${
                reached
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                  : "bg-gradient-to-r from-blue-500 to-blue-600"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {reached ? (
            <p className="mt-3 text-sm font-semibold text-emerald-600">
              🎉 Objectif atteint ! Fixez-vous un nouveau défi.
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Plus que <strong className="text-slate-700">{goal - monthlySales}</strong> vente
              {goal - monthlySales > 1 ? "s" : ""} pour atteindre votre objectif.
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-400 italic">
          Aucun objectif défini. Fixez-en un pour suivre votre progression mensuelle.
        </p>
      )}
    </div>
  );
}

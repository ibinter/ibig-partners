"use client";

/**
 * Défi de la semaine — challenge motivationnel sur le dashboard.
 * Affiche un objectif, un countdown et une récompense.
 */

import { useEffect, useState } from "react";

interface Props {
  currentSales: number;
}

export function WeeklyChallenge({ currentSales }: Props) {
  const [timeLeft, setTimeLeft] = useState("");

  // Défi fixe pour démarrer : 3 ventes / semaine = bonus
  const TARGET = 3;
  const REWARD = "+5 000 FCFA";

  // Lundi prochain
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const end = new Date(now);
      const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
      end.setDate(now.getDate() + (7 - dayOfWeek + 1));
      end.setHours(0, 0, 0, 0);

      const diff = end.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      setTimeLeft(`${days}j ${hours}h ${mins}min`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  const progress = Math.min(100, (currentSales / TARGET) * 100);
  const isComplete = currentSales >= TARGET;

  return (
    <div
      data-testid="weekly-challenge"
      className={`card-premium relative overflow-hidden p-5 ${
        isComplete ? "ring-2 ring-emerald-400" : ""
      }`}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <h3 className="font-extrabold text-ink">Défi de la semaine</h3>
            {isComplete && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                ✓ RÉUSSI
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-700">
            Réalisez <strong className="text-brand-700">{TARGET} ventes</strong> cette semaine et débloquez un <strong className="text-emerald-600">bonus de {REWARD}</strong>
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="label-caps text-orange-600">Temps restant</p>
          <p className="text-numeral text-lg text-ink">{timeLeft}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5 text-xs">
          <span className="font-bold text-slate-700">
            {currentSales} / {TARGET} ventes
          </span>
          <span className="font-bold text-orange-600">{Math.round(progress)}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isComplete
                ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                : "bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

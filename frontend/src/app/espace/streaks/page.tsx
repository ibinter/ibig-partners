"use client";
import { useEffect, useState } from "react";

export default function StreaksPage() {
  const [data, setData] = useState<{ streak: number; longest: number; points: number; bonus?: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/espace/track-activity", { method: "POST" })
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  const days = ["L", "M", "M", "J", "V", "S", "D"];
  const streak = data?.streak ?? 0;

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold">🔥 Mes Streaks</h1>
        <p className="text-sm text-gray-500 mt-1">Connectez-vous chaque jour pour maintenir votre série et gagner des points bonus.</p>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse bg-gray-100 rounded-2xl" />
      ) : (
        <>
          <div className="rounded-2xl border bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 text-center">
            <div className="text-6xl font-black text-orange-500">{streak}</div>
            <div className="text-sm font-semibold text-orange-700 dark:text-orange-300 mt-1">jour{streak > 1 ? "s" : ""} consécutif{streak > 1 ? "s" : ""}</div>
            {data?.bonus && <div className="mt-2 text-xs text-orange-600 font-medium">+{data.bonus} points gagnés aujourd&apos;hui !</div>}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((d, i) => (
              <div key={i} className={`rounded-xl p-2 text-center text-xs font-bold ${
                i < streak % 7 ? "bg-orange-400 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
              }`}>
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border p-4 text-center">
              <div className="text-2xl font-black text-indigo-600">{data?.longest ?? 0}</div>
              <div className="text-xs text-gray-500 mt-1">Record personnel</div>
            </div>
            <div className="rounded-2xl border p-4 text-center">
              <div className="text-2xl font-black text-emerald-600">{data?.points ?? 0}</div>
              <div className="text-xs text-gray-500 mt-1">Points totaux streaks</div>
            </div>
          </div>

          <div className="rounded-2xl border p-4 space-y-2 text-sm">
            <p className="font-semibold">Bonus par palier :</p>
            <div className="flex items-center justify-between">
              <span>Connexion quotidienne</span>
              <span className="font-bold text-orange-500">+10 pts</span>
            </div>
            <div className="flex items-center justify-between">
              <span>3 jours consécutifs</span>
              <span className="font-bold text-orange-500">+15 pts</span>
            </div>
            <div className="flex items-center justify-between">
              <span>7 jours consécutifs</span>
              <span className="font-bold text-orange-500">+20 pts</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";

export default function LeaderboardOptInPage() {
  const [optedIn, setOptedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/espace/leaderboard-optin").then((r) => r.json()).then((d) => { setOptedIn(d.optedIn); setLoading(false); });
  }, []);

  async function save() {
    await fetch("/api/espace/leaderboard-optin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ optedIn }) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Chargement…</div>;

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Classement public</h1>
        <p className="text-sm text-gray-500 mt-1">Participez au top mensuel des meilleurs partenaires</p>
      </div>

      <div className="rounded-2xl border bg-white dark:bg-gray-900 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-bold text-gray-900 dark:text-white">Apparaître dans le classement public</p>
            <p className="text-sm text-gray-500 mt-1">
              Votre nom et vos ventes du mois seront affichés sur la page publique{" "}
              <a href="/classement-public" target="_blank" className="text-indigo-600 hover:underline">/classement-public</a>.
              Vous pouvez vous retirer à tout moment.
            </p>
          </div>
          <button
            onClick={() => setOptedIn((v) => !v)}
            className={`relative h-7 w-12 rounded-full transition-colors shrink-0 ${optedIn ? "bg-indigo-600" : "bg-gray-200"}`}
          >
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${optedIn ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>

        <div className={`rounded-xl p-3 text-sm ${optedIn ? "bg-indigo-50 text-indigo-700" : "bg-gray-50 text-gray-500"}`}>
          {optedIn ? "✅ Vous participez au classement public mensuel." : "🔒 Votre profil reste privé (non visible dans le classement)."}
        </div>
      </div>

      <button onClick={save} className="w-full rounded-2xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-colors">
        {saved ? "✓ Enregistré !" : "Enregistrer"}
      </button>

      <a href="/classement-public" target="_blank" className="block text-center text-sm text-indigo-600 hover:underline">
        Voir le classement public →
      </a>
    </div>
  );
}

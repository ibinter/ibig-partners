"use client";

import { useState } from "react";

export default function NettoyagePage() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleCleanup() {
    if (!confirm("⚠️ ATTENTION : Cette action supprime DÉFINITIVEMENT tous les comptes demo et leurs données. Continuer ?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cleanup-demo", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setResult(data.message + (data.users?.length ? "\n\nSupprimés :\n" + data.users.join("\n") : ""));
        setDone(true);
      } else {
        setResult("Erreur : " + (data.error ?? "Inconnue"));
      }
    } catch (e) {
      setResult("Erreur réseau : " + String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 py-10">
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <h1 className="text-xl font-bold text-rose-800 mb-2">🧹 Nettoyage des données démo</h1>
        <p className="text-sm text-rose-700 mb-4">
          Supprime <strong>définitivement</strong> tous les comptes partenaires de démonstration
          (koffi, aya, moussa, fatou) ainsi que toutes leurs données associées :
          ventes, commissions, clics, prospects, opportunités.
        </p>
        <p className="text-sm text-rose-700 mb-6">
          ✅ Conservé : ton compte SUPERADMIN, les branches, produits, badges, formations et paramètres.
        </p>

        {!done && (
          <button
            onClick={handleCleanup}
            disabled={loading}
            className="w-full rounded-xl bg-rose-600 px-6 py-3 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Nettoyage en cours…" : "🗑️ Lancer le nettoyage"}
          </button>
        )}

        {result && (
          <div className={`mt-4 rounded-xl border p-4 text-sm whitespace-pre-line ${done ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-white text-rose-700"}`}>
            {result}
          </div>
        )}

        {done && (
          <a
            href="/admin"
            className="mt-4 block w-full rounded-xl bg-emerald-600 px-6 py-3 text-center text-sm font-bold text-white hover:bg-emerald-700 transition-colors"
          >
            ✅ Retour au tableau de bord
          </a>
        )}
      </div>
    </div>
  );
}

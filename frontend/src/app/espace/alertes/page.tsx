"use client";
import { useEffect, useState } from "react";

type Prefs = { newNetworkSale: boolean; rankingChange: boolean; newProspect: boolean; commissionPaid: boolean; weeklyDigest: boolean };

const ALERTS = [
  { key: "newNetworkSale", label: "Nouvelle vente dans mon réseau", desc: "Alerte dès qu'un filleul fait une vente", icon: "🌳" },
  { key: "rankingChange", label: "Changement de classement", desc: "Quand votre position dans le classement change", icon: "🏆" },
  { key: "newProspect", label: "Nouveau prospect entrant", desc: "Rappel quand un prospect reste sans suivi 7 jours", icon: "📇" },
  { key: "commissionPaid", label: "Commission payée", desc: "Notification quand une commission est versée", icon: "💰" },
  { key: "weeklyDigest", label: "Résumé hebdomadaire", desc: "Récapitulatif de votre activité chaque lundi", icon: "📋" },
] as const;

export default function AlertesPage() {
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/espace/alert-preferences").then((r) => r.json()).then(setPrefs);
  }, []);

  async function save() {
    if (!prefs) return;
    await fetch("/api/espace/alert-preferences", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(prefs) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!prefs) return <div className="text-center py-20 text-gray-400">Chargement…</div>;

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Alertes intelligentes</h1>
        <p className="text-sm text-gray-500 mt-1">Choisissez quand être notifié(e)</p>
      </div>
      <div className="rounded-2xl border bg-white dark:bg-gray-900 divide-y">
        {ALERTS.map((a) => (
          <div key={a.key} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">{a.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{a.label}</p>
                <p className="text-xs text-gray-500">{a.desc}</p>
              </div>
            </div>
            <button
              onClick={() => setPrefs((p) => p ? { ...p, [a.key]: !p[a.key as keyof Prefs] } : p)}
              className={`relative h-6 w-11 rounded-full transition-colors ${prefs[a.key as keyof Prefs] ? "bg-indigo-600" : "bg-gray-200"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${prefs[a.key as keyof Prefs] ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        ))}
      </div>
      <button onClick={save} className="w-full rounded-2xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-colors">
        {saved ? "✓ Enregistré !" : "Enregistrer mes préférences"}
      </button>
    </div>
  );
}

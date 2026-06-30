"use client";

import { useState } from "react";
import OnboardingTour from "@/components/onboarding-tour";

export default function TourPreview() {
  const [show, setShow] = useState(false);

  function launch() {
    // Reset le flag pour permettre l'affichage
    localStorage.removeItem("ibig_tour_v2_done");
    setShow(true);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col items-center gap-4 text-center">
        <span className="text-5xl">🎯</span>
        <div>
          <h2 className="font-bold text-slate-900">Lancer la visite guidée</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            Cliquez pour voir exactement ce qu'un nouvel affilié voit lors de sa première connexion. 9 étapes interactives.
          </p>
        </div>
        <button
          onClick={launch}
          className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white hover:bg-blue-700 transition shadow-md"
        >
          ▶ Lancer la visite guidée
        </button>
      </div>

      {/* Résumé des étapes */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Les 9 étapes de la visite</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { num: 1, icon: "🎉", title: "Bienvenue", desc: "Message d'accueil IBIG PARTNERS" },
            { num: 2, icon: "📊", title: "Tableau de bord", desc: "Vue d'ensemble du dashboard" },
            { num: 3, icon: "🔗", title: "Liens d'affiliation", desc: "Liens uniques + QR codes" },
            { num: 4, icon: "💰", title: "Commissions N1/N2/N3", desc: "Exemple chiffré sur 3 niveaux" },
            { num: 5, icon: "🔐", title: "KYC (urgent)", desc: "CTA vers la vérification" },
            { num: 6, icon: "👥", title: "Mon Réseau", desc: "Parrainage et filleuls" },
            { num: 7, icon: "🎓", title: "Académie IBIG", desc: "Formation et Coach IA" },
            { num: 8, icon: "🎨", title: "Kit Marketing", desc: "Outils personnalisables" },
            { num: 9, icon: "🚀", title: "C'est parti !", desc: "Plan d'action 7 premiers jours" },
          ].map((step) => (
            <div key={step.num} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {step.num}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{step.icon} {step.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {show && <OnboardingTour isNewUser={true} />}
    </div>
  );
}

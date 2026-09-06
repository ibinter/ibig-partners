"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  { title: "Mon Profil",    icon: "👤", desc: "Complétez votre présentation publique" },
  { title: "Mon Marché",    icon: "🗺️", desc: "Définissez vos secteurs d'activité" },
  { title: "Premier Lien", icon: "🔗", desc: "Créez votre premier lien d'affiliation" },
  { title: "Mon Contrat",  icon: "📋", desc: "Signez votre contrat de partenariat" },
  { title: "Premiers Pas", icon: "🚀", desc: "Vous êtes prêt à démarrer !" },
];

export default function SetupPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const pct = Math.round(((step) / (STEPS.length - 1)) * 100);

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else router.push("/espace");
  }

  const LINKS = ["/espace/profil", "/espace/mon-marche", "/espace/liens", "/espace/contrat", "/espace"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <p className="text-white text-2xl font-extrabold tracking-tight">IBIG Partners</p>
          <p className="text-slate-400 text-sm mt-1">Guide de démarrage</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Étape {step + 1} sur {STEPS.length}</span>
            <span>{pct}% complété</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 rounded-full"
              style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Steps indicators */}
        <div className="flex justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${i < step ? "bg-emerald-500 text-white" : i === step ? "bg-amber-500 text-white ring-4 ring-amber-500/30" : "bg-slate-700 text-slate-400"}`}>
                {i < step ? "✓" : s.icon}
              </div>
              <span className={`text-xs hidden sm:block ${i === step ? "text-white" : "text-slate-500"}`}>{s.title}</span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-5xl">{STEPS[step].icon}</span>
            <h1 className="text-2xl font-extrabold text-slate-800 mt-3">{STEPS[step].title}</h1>
            <p className="text-slate-500 mt-1">{STEPS[step].desc}</p>
          </div>

          {step === 4 ? (
            <div className="text-center space-y-4">
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-6">
                <p className="text-emerald-700 font-semibold text-lg">🎉 Bienvenue dans IBIG Partners !</p>
                <p className="text-emerald-600 text-sm mt-2">Votre espace partenaire est prêt. Déclarez votre première vente et commencez à gagner des commissions !</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[["🔗 Mes Liens", "/espace/liens"], ["📝 Déclarer une vente", "/espace/ventes"], ["🌳 Mon Réseau", "/espace/reseau"], ["🎓 Académie", "/espace/academie"]].map(([label, href]) => (
                  <a key={href} href={href} className="rounded-xl border border-slate-100 p-3 text-center text-slate-700 hover:bg-slate-50 transition-colors font-medium">{label}</a>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-slate-600 text-sm mb-6">
                {step === 0 && "Ajoutez une photo, une bio et vos coordonnées pour que les prospects puissent vous faire confiance."}
                {step === 1 && "Indiquez vos secteurs d'activité et votre zone géographique pour recevoir des opportunités ciblées."}
                {step === 2 && "Créez votre lien d'affiliation personnalisé et partagez-le pour commencer à générer des ventes."}
                {step === 3 && "Lisez et signez votre contrat de partenariat pour activer vos paiements de commissions."}
              </p>
              <a href={LINKS[step]}
                className="inline-block rounded-2xl bg-slate-800 text-white px-6 py-3 font-semibold hover:bg-slate-700 transition-colors">
                Accéder à cette étape →
              </a>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
              className="text-sm text-slate-400 hover:text-slate-600 disabled:opacity-0 transition-colors">
              ← Précédent
            </button>
            <button onClick={next}
              className="rounded-2xl bg-amber-500 text-white px-6 py-2.5 font-semibold hover:bg-amber-600 transition-colors text-sm">
              {step === STEPS.length - 1 ? "Accéder à mon espace →" : "Étape suivante →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

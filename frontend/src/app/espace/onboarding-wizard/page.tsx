"use client";
import { useEffect, useState } from "react";

type Progress = {
  profileCompleted?: boolean;
  firstProductActivated?: boolean;
  firstLinkCopied?: boolean;
  firstProspectAdded?: boolean;
  firstShareDone?: boolean;
  completedAt?: string;
};

const STEPS = [
  { key: "profileCompleted", title: "Compléter mon profil", desc: "Ajoutez votre photo, bio et informations de contact dans Mon Profil.", icon: "👤", href: "/espace/profil", cta: "Aller sur mon profil" },
  { key: "firstProductActivated", title: "Activer mon premier produit", desc: "Choisissez un produit à promouvoir dans Mes Produits.", icon: "🧩", href: "/espace/produits", cta: "Voir mes produits" },
  { key: "firstLinkCopied", title: "Copier mon lien affilié", desc: "Copiez votre lien de tracking dans Mes Liens pour commencer à partager.", icon: "🔗", href: "/espace/liens", cta: "Voir mes liens" },
  { key: "firstProspectAdded", title: "Ajouter mon premier prospect", desc: "Enregistrez un contact dans votre liste de prospects.", icon: "📇", href: "/espace/prospects", cta: "Ajouter un prospect" },
  { key: "firstShareDone", title: "Partager sur WhatsApp", desc: "Envoyez votre lien à un proche via WhatsApp depuis Mes Liens.", icon: "📲", href: "/espace/liens", cta: "Partager maintenant" },
];

export default function OnboardingWizardPage() {
  const [progress, setProgress] = useState<Progress>({});
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch("/api/espace/onboarding-progress").then((r) => r.json()).then((p) => { setProgress(p); setLoading(false); });
  }, []);

  const completed = STEPS.filter((s) => progress[s.key as keyof Progress]).length;
  const allDone = completed === STEPS.length;

  async function markDone(key: string) {
    const updated = { ...progress, [key]: true };
    setProgress(updated);
    await fetch("/api/espace/onboarding-progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
    const nextIdx = STEPS.findIndex((s) => !updated[s.key as keyof Progress]);
    if (nextIdx !== -1) setCurrent(nextIdx);
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Chargement…</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Guide de démarrage avancé</h1>
        <p className="text-sm text-gray-500 mt-1">5 étapes pour maximiser votre succès IBIG</p>
      </div>

      <div className="rounded-2xl border bg-white dark:bg-gray-900 p-5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{completed} / {STEPS.length} étapes complétées</span>
          <span className="text-sm font-bold text-indigo-600">{Math.round((completed / STEPS.length) * 100)} %</span>
        </div>
        <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-800">
          <div className="h-3 rounded-full bg-indigo-600 transition-all" style={{ width: `${(completed / STEPS.length) * 100}%` }} />
        </div>
      </div>

      {allDone && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
          <p className="text-3xl mb-2">🎉</p>
          <p className="font-black text-emerald-800 text-lg">Félicitations ! Vous êtes prêt(e) à réussir !</p>
          <p className="text-sm text-emerald-700 mt-1">Toutes les étapes sont complétées. Votre succès commence maintenant.</p>
        </div>
      )}

      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const done = !!progress[step.key as keyof Progress];
          const active = i === current && !done;
          return (
            <div key={step.key} className={`rounded-2xl border p-5 transition-all ${done ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20" : active ? "border-indigo-300 bg-indigo-50 dark:bg-indigo-950/20 shadow-md" : "bg-white dark:bg-gray-900"}`}>
              <div className="flex items-start gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xl shrink-0 ${done ? "bg-emerald-100" : active ? "bg-indigo-100" : "bg-gray-100"}`}>
                  {done ? "✅" : step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-bold text-sm ${done ? "text-emerald-800 dark:text-emerald-300 line-through" : "text-gray-900 dark:text-white"}`}>{i + 1}. {step.title}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                  {!done && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      <a href={step.href} className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors">
                        {step.cta} →
                      </a>
                      <button onClick={() => markDone(step.key)} className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                        Marquer comme fait
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

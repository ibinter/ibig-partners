"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Onboarding gamifié — checklist 5 étapes pour les nouveaux partenaires.
 * Avec barre de progression, confettis et déblocage de badges.
 * Boost ENORME de l'activation J+1 (>40% des nouveaux partenaires).
 */

type Step = {
  id: string;
  title: string;
  desc: string;
  icon: string;
  reward: string;
  href: string;
  cta: string;
};

const STEPS: Step[] = [
  {
    id: "profile",
    title: "Complétez votre profil",
    desc: "Photo, ville et préférences de paiement",
    icon: "👤",
    reward: "+50 pts",
    href: "/espace/profil",
    cta: "Compléter",
  },
  {
    id: "activate",
    title: "Activez votre 1ère branche",
    desc: "Choisissez ce que vous voulez promouvoir",
    icon: "🎯",
    reward: "+100 pts · Badge Activé",
    href: "/espace/produits",
    cta: "Activer",
  },
  {
    id: "link",
    title: "Copiez votre 1er lien",
    desc: "Votre URL d'affiliation personnalisée",
    icon: "🔗",
    reward: "+50 pts",
    href: "/espace/liens",
    cta: "Voir mes liens",
  },
  {
    id: "share",
    title: "Partagez sur WhatsApp",
    desc: "1-clic vers vos contacts",
    icon: "📲",
    reward: "+100 pts · Badge Promoteur",
    href: "/espace/liens",
    cta: "Partager",
  },
  {
    id: "prospect",
    title: "Ajoutez un 1er prospect",
    desc: "Suivez vos leads dans votre mini-CRM",
    icon: "🎉",
    reward: "+200 pts · Académie débloquée",
    href: "/espace/prospects",
    cta: "Créer",
  },
];

interface QuestProps {
  doneSteps?: {
    profile?: boolean;
    activate?: boolean;
    link?: boolean;
    share?: boolean;
    prospect?: boolean;
  };
}

export function OnboardingQuest({ doneSteps = {} }: QuestProps) {
  const [hidden, setHidden] = useState(false);
  const [localDone, setLocalDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("ibig_quest_hidden") : null;
    setHidden(stored === "1");
    const localProgress = typeof window !== "undefined" ? localStorage.getItem("ibig_quest_done") : null;
    if (localProgress) {
      try {
        setLocalDone(JSON.parse(localProgress));
      } catch {}
    }
  }, []);

  const done = { ...localDone, ...doneSteps };
  const completed = STEPS.filter((s) => done[s.id]).length;
  const pct = Math.round((completed / STEPS.length) * 100);

  const markDone = (id: string) => {
    const next = { ...localDone, [id]: true };
    setLocalDone(next);
    localStorage.setItem("ibig_quest_done", JSON.stringify(next));
    // Animation confettis simple
    triggerConfetti();
  };

  if (hidden || completed === STEPS.length) return null;

  return (
    <div
      data-testid="onboarding-quest"
      className="card-premium relative overflow-hidden border-2 border-gold-400/30 mb-5"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-gold-500 to-orange-500" />

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <h3 className="font-extrabold text-lg text-ink">Mission Démarrage</h3>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                +500 pts à gagner
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Complétez ces 5 étapes pour activer 100% de votre potentiel
            </p>
          </div>
          <button
            data-testid="quest-hide"
            onClick={() => {
              setHidden(true);
              localStorage.setItem("ibig_quest_hidden", "1");
            }}
            className="text-xs text-muted hover:text-ink"
            aria-label="Masquer"
          >
            ✕
          </button>
        </div>

        {/* Barre de progression */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-600">
              Étape {completed}/{STEPS.length}
            </span>
            <span className="text-xs font-bold text-emerald-600">{pct}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-gold-500 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Liste des étapes */}
        <div className="space-y-2">
          {STEPS.map((step, i) => {
            const isDone = done[step.id];
            const isNext = !isDone && STEPS.slice(0, i).every((s) => done[s.id]);
            return (
              <div
                key={step.id}
                data-testid={`quest-step-${step.id}`}
                className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                  isDone
                    ? "border-emerald-200 bg-emerald-50/50"
                    : isNext
                    ? "border-brand-200 bg-brand-50/30 shadow-sm"
                    : "border-slate-200 bg-white opacity-60"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                    isDone
                      ? "bg-emerald-500 text-white"
                      : isNext
                      ? "bg-gradient-to-br from-brand-100 to-brand-50 ring-2 ring-brand-300"
                      : "bg-slate-100"
                  }`}
                >
                  {isDone ? "✓" : step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-ink leading-tight">
                    {step.title}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {step.desc} <span className="text-amber-600 font-semibold">· {step.reward}</span>
                  </p>
                </div>
                {!isDone && (
                  <Link
                    href={step.href}
                    onClick={() => setTimeout(() => markDone(step.id), 800)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      isNext
                        ? "bg-brand-600 text-white hover:bg-brand-700 shadow-sm"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {step.cta} →
                  </Link>
                )}
                {isDone && (
                  <span className="shrink-0 rounded-lg bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                    ✓ OK
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function triggerConfetti() {
  // Confettis vanilla JS simple
  if (typeof window === "undefined") return;

  const colors = ["#0b5fff", "#f5b73d", "#10b981", "#ef4444", "#8b5cf6"];
  const count = 60;
  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed; pointer-events: none;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 9999; overflow: hidden;
  `;
  document.body.appendChild(container);

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    const size = 6 + Math.random() * 8;
    piece.style.cssText = `
      position: absolute;
      width: ${size}px; height: ${size * 0.4}px;
      background: ${colors[i % colors.length]};
      top: -10px;
      left: ${Math.random() * 100}%;
      opacity: ${0.7 + Math.random() * 0.3};
      transform: rotate(${Math.random() * 360}deg);
      border-radius: 2px;
    `;
    const fall = piece.animate(
      [
        { transform: `translate3d(0,0,0) rotate(0deg)`, opacity: 1 },
        {
          transform: `translate3d(${(Math.random() - 0.5) * 200}px, ${window.innerHeight + 30}px, 0) rotate(${
            720 + Math.random() * 720
          }deg)`,
          opacity: 0,
        },
      ],
      { duration: 2400 + Math.random() * 1500, easing: "cubic-bezier(.2,.6,.4,1)" },
    );
    container.appendChild(piece);
    fall.onfinish = () => piece.remove();
  }
  setTimeout(() => container.remove(), 4500);
}

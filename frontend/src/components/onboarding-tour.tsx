"use client";

import { useEffect, useState } from "react";

const TOUR_KEY = "ibig_tour_v2_done";

interface Step {
  icon: string;
  title: string;
  subtitle: string;
  body: string;
  tip?: string;
  cta?: { label: string; href: string };
  color: string;
  accentColor: string;
}

const STEPS: Step[] = [
  {
    icon: "🎉",
    title: "Bienvenue dans IBIG PARTNERS !",
    subtitle: "Votre programme d'affiliation est activé",
    body: "Vous faites maintenant partie du reseau de partenaires affilies d'INTERMARK BUSINESS INTERNATIONAL GROUP SARL. En quelques minutes, nous allons vous montrer comment tirer le meilleur de votre espace partenaire.",
    tip: "Cette visite ne dure que 2 minutes. Vous pouvez la revoir a tout moment depuis le menu Ressources.",
    color: "from-blue-700 via-blue-600 to-indigo-700",
    accentColor: "text-yellow-300",
  },
  {
    icon: "📊",
    title: "Votre tableau de bord",
    subtitle: "Tout votre activite en un coup d'oeil",
    body: "Le Dashboard centralise vos commissions du mois, vos ventes recentes, votre statut actuel et vos objectifs. C'est votre page d'accueil — verifiez-la chaque jour pour suivre votre progression en temps reel.",
    tip: "Les chiffres se mettent a jour automatiquement a chaque nouvelle vente ou commission.",
    cta: { label: "Voir mon dashboard", href: "/espace" },
    color: "from-slate-800 via-slate-700 to-slate-800",
    accentColor: "text-blue-300",
  },
  {
    icon: "🔗",
    title: "Vos liens d'affiliation",
    subtitle: "Votre outil numero 1 pour gagner des commissions",
    body: "Dans « Mes Liens », activez les produits que vous voulez promouvoir et recuperez votre lien unique. Partagez-le sur WhatsApp, reseaux sociaux, par SMS ou en personne. Chaque vente via votre lien vous rapporte une commission automatiquement.",
    tip: "Telechargez aussi votre QR Code — parfait pour vos supports imprimes, cartes de visite et presentations.",
    cta: { label: "Obtenir mes liens", href: "/espace/liens" },
    color: "from-blue-600 via-blue-500 to-cyan-600",
    accentColor: "text-yellow-300",
  },
  {
    icon: "💰",
    title: "Commissions sur 3 niveaux",
    subtitle: "Gagnez meme quand vous ne travaillez pas",
    body: "N1 : vos propres ventes (taux plein). N2 : les ventes de vos filleuls (50% du taux). N3 : les ventes des filleuls de vos filleuls (25% du taux). Exemple concret : votre filleul vend EDUFORM a 400 000 FCFA — vous gagnez 20 000 FCFA automatiquement, sans rien faire.",
    tip: "Pour IBIG SOFT mensuel, les commissions sont versees sur 4 mois — fidelisite recompensee !",
    cta: { label: "Voir mes commissions", href: "/espace/commissions" },
    color: "from-emerald-700 via-emerald-600 to-teal-700",
    accentColor: "text-yellow-300",
  },
  {
    icon: "🔐",
    title: "Verifiez votre compte (KYC)",
    subtitle: "Etape obligatoire pour recevoir vos paiements",
    body: "Pour recevoir vos commissions, vous devez completer votre verification KYC (identite + coordonnees de paiement). Sans KYC valide, vos commissions s'accumulent mais ne sont pas versees. L'equipe IBIG traite votre dossier sous 24-48h.",
    tip: "Preparez votre piece d'identite (CNI ou passeport) et vos coordonnees Orange Money / Wave / banque.",
    cta: { label: "Completer mon KYC maintenant", href: "/espace/verification" },
    color: "from-amber-600 via-orange-600 to-red-600",
    accentColor: "text-white",
  },
  {
    icon: "👥",
    title: "Construisez votre reseau",
    subtitle: "Recrutez des partenaires — multipliez vos revenus",
    body: "Chaque partenaire que vous recrutez devient votre filleul N1. Ses ventes vous rapportent automatiquement des commissions N2. Partagez votre lien de parrainage : ibigpartners.com/rejoindre?ref=VOTRE-CODE. Suivez et animez votre reseau dans « Mon Reseau ».",
    tip: "Un reseau de 10 filleuls actifs peut doubler vos revenus mensuels sans effort supplementaire.",
    cta: { label: "Voir mon reseau", href: "/espace/reseau" },
    color: "from-violet-700 via-purple-600 to-violet-700",
    accentColor: "text-yellow-300",
  },
  {
    icon: "🎓",
    title: "L'Academie IBIG",
    subtitle: "Formez-vous pour mieux vendre",
    body: "L'Academie contient des videos, guides PDF, articles, podcasts audio et quiz pour vous aider a maitriser chaque produit IBIG. Plus vous vous formez, plus vous vendez efficacement. Le Coach IA repond a toutes vos questions 24h/24.",
    tip: "Commencez par les modules 'Scolaby' et 'Techniques de prospection' — ce sont les plus populaires.",
    cta: { label: "Ouvrir l'Academie", href: "/espace/academie" },
    color: "from-pink-700 via-rose-600 to-pink-700",
    accentColor: "text-yellow-300",
  },
  {
    icon: "🎨",
    title: "Kit Marketing",
    subtitle: "Vos outils de campagne prets a l'emploi",
    body: "Le Kit Marketing contient des argumentaires personnalises avec votre nom et code, des visuels prets a partager, des scripts WhatsApp et des videos de presentation. Copiez, adaptez et partagez en un clic. Votre nom est automatiquement insere dans chaque argumentaire.",
    tip: "Utilisez les argumentaires 'cles en main' — ils sont optimises pour maximiser les conversions.",
    cta: { label: "Ouvrir le Kit Marketing", href: "/espace/kit" },
    color: "from-teal-700 via-emerald-600 to-teal-700",
    accentColor: "text-yellow-300",
  },
  {
    icon: "🚀",
    title: "Vous etes pret !",
    subtitle: "Votre aventure IBIG PARTNERS commence maintenant",
    body: "Vous avez tout ce qu'il faut pour reussir. Voici votre plan d'action pour les 7 premiers jours :\n1. Completez votre KYC (24h)\n2. Activez vos liens d'affiliation\n3. Partagez a 10 contacts de confiance\n4. Recrutez votre 1er filleul\n5. Completez 3 modules de l'Academie",
    tip: "Le support IBIG est disponible sur WhatsApp au +225 07 78 88 25 92 — n'hesitez pas !",
    color: "from-blue-700 via-blue-600 to-indigo-700",
    accentColor: "text-yellow-300",
  },
];

export default function OnboardingTour({ isNewUser }: { isNewUser: boolean }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!isNewUser) return;
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) {
      setTimeout(() => setVisible(true), 800);
    }
  }, [isNewUser]);

  function dismiss() {
    localStorage.setItem(TOUR_KEY, "1");
    setVisible(false);
  }

  function goTo(n: number) {
    setAnimating(true);
    setTimeout(() => {
      setStep(n);
      setAnimating(false);
    }, 200);
  }

  function next() {
    if (step < STEPS.length - 1) goTo(step + 1);
    else dismiss();
  }

  function prev() {
    if (step > 0) goTo(step - 1);
  }

  if (!visible) return null;

  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl transition-all duration-200 ${
          animating ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {/* Header gradient */}
        <div className={`bg-gradient-to-br ${s.color} px-8 pt-8 pb-10 text-center relative`}>
          {/* Close button */}
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition text-sm"
          >
            ✕ Passer
          </button>

          {/* Step indicator */}
          <div className="flex justify-center gap-1.5 mb-6">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-6 h-2 bg-white"
                    : i < step
                    ? "w-2 h-2 bg-white/60"
                    : "w-2 h-2 bg-white/25"
                }`}
              />
            ))}
          </div>

          <div className="text-6xl mb-4">{s.icon}</div>
          <h2 className="text-2xl font-extrabold text-white leading-tight">{s.title}</h2>
          <p className={`mt-1 text-sm font-semibold ${s.accentColor}`}>{s.subtitle}</p>
        </div>

        {/* Body */}
        <div className="bg-white px-8 py-6 space-y-4">
          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{s.body}</p>

          {s.tip && (
            <div className="flex gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
              <span className="text-lg shrink-0">💡</span>
              <p className="text-xs text-blue-800 leading-relaxed">{s.tip}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2">
            {s.cta && (
              <a
                href={s.cta.href}
                onClick={dismiss}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 text-center text-sm font-bold text-white hover:from-blue-700 hover:to-blue-800 transition shadow-md"
              >
                {s.cta.label} →
              </a>
            )}

            <div className="flex gap-3">
              {!isFirst && (
                <button
                  onClick={prev}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  ← Precedent
                </button>
              )}
              <button
                onClick={next}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  isFirst ? "flex-1" : "flex-1"
                } ${
                  isLast
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {isLast ? "C'est parti ! 🚀" : "Suivant →"}
              </button>
            </div>
          </div>

          {/* Step counter */}
          <p className="text-center text-xs text-slate-400">
            Etape {step + 1} sur {STEPS.length}
          </p>
        </div>
      </div>
    </div>
  );
}

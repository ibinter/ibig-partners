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

      {/* Statuts affiliés */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6">
        <h3 className="font-semibold text-slate-800 mb-1">Progression des statuts affiliés</h3>
        <p className="text-xs text-slate-400 mb-5">5 niveaux · déblocage automatique selon le chiffre d'affaires cumulé</p>
        <div className="flex flex-col sm:flex-row items-stretch gap-0">
          {[
            { status: "STARTER", icon: "🌱", color: "bg-slate-100 text-slate-700 border-slate-200",  badge: "bg-slate-200 text-slate-700",  desc: "Accès de base · liens d'affiliation · Académie niveau 1" },
            { status: "SILVER",  icon: "🥈", color: "bg-blue-50 text-blue-800 border-blue-200",      badge: "bg-blue-100 text-blue-800",    desc: "Kit Marketing · bonus recrutement · formations avancées" },
            { status: "GOLD",    icon: "🥇", color: "bg-amber-50 text-amber-800 border-amber-200",   badge: "bg-amber-100 text-amber-800",  desc: "Accès prioritaire aux nouveaux produits · support dédié" },
            { status: "MASTER",  icon: "💎", color: "bg-green-50 text-green-800 border-green-200",   badge: "bg-green-100 text-green-800",  desc: "Événements VIP · outils premium · rapports avancés" },
            { status: "ELITE",   icon: "👑", color: "bg-violet-50 text-violet-800 border-violet-200",badge: "bg-violet-100 text-violet-800",desc: "Statut maximum · tous avantages · commission bonifiée" },
          ].map((s, i, arr) => (
            <div key={s.status} className="flex sm:flex-col flex-row items-center sm:items-stretch">
              <div className={`flex-1 rounded-2xl border p-4 text-center ${s.color}`}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold mb-2 ${s.badge}`}>{s.status}</span>
                <p className="text-[11px] leading-snug opacity-80">{s.desc}</p>
              </div>
              {i < arr.length - 1 && (
                <div className="flex items-center justify-center text-slate-300 font-bold text-lg px-1 sm:py-1 sm:px-0 shrink-0">→</div>
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-400 text-center">Le statut actuel est visible dans le tableau de bord et la barre latérale. Il évolue automatiquement à chaque palier atteint.</p>
      </div>

      {/* Coach IA */}
      <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 flex items-start gap-4">
        <span className="text-3xl shrink-0">🤖</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-violet-900">Coach IA — disponible 24h/24</h3>
          <p className="text-sm text-violet-800 mt-1 leading-relaxed">
            Chaque affilié dispose d'un Coach IA intégré à l'Académie IBIG. Il répond instantanément à toutes les questions sur les produits, les techniques de vente, les commissions et le fonctionnement de la plateforme — sans attendre le support humain.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              { icon: "💬", label: "Réponses instantanées",      desc: "Aucune attente, disponible à toute heure" },
              { icon: "📦", label: "Connaissance produits",       desc: "Tous les 330+ produits des 9 branches" },
              { icon: "💡", label: "Conseils de vente",           desc: "Scripts, objections, argumentaires" },
              { icon: "🎓", label: "Aide à la formation",         desc: "Explique les modules, résume les contenus" },
            ].map((f) => (
              <div key={f.label} className="flex items-start gap-2 rounded-xl bg-white/60 px-3 py-2.5">
                <span className="text-lg shrink-0">{f.icon}</span>
                <div>
                  <p className="text-xs font-bold text-violet-900">{f.label}</p>
                  <p className="text-[11px] text-violet-700 leading-snug">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-violet-600">📍 Accessible via <strong>Académie → Coach IA</strong> dans l'espace affilié. Présenté à l'étape 7 de la visite guidée.</p>
        </div>
      </div>

      {/* Retrait self-service */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 flex items-start gap-4">
        <span className="text-3xl shrink-0">💸</span>
        <div>
          <h3 className="font-bold text-emerald-900">Retrait self-service</h3>
          <p className="text-sm text-emerald-800 mt-1 leading-relaxed">
            Une fois le KYC validé, chaque affilié peut demander le virement de ses commissions directement depuis son espace partenaire — <strong>sans passer par le support</strong>. La demande est traitée automatiquement. Cette information est présentée à l'étape 5 (KYC) de la visite guidée.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">✅ Disponible après validation KYC</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">💳 Orange Money · Wave · Banque</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">🚀 Aucune intervention support requise</span>
          </div>
        </div>
      </div>

      {/* Résumé des 9 branches */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6">
        <h3 className="font-semibold text-slate-800 mb-1">Les 9 branches du groupe IBIG</h3>
        <p className="text-xs text-slate-400 mb-4">330+ produits & services · commissions sur 3 niveaux (N1 / N2 / N3)</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: "💻", name: "IBIG SOFT",          desc: "14 logiciels de gestion (ERP, CRM, compta…)",    taux: "20 % / 10 % / 5 %" },
            { icon: "🎓", name: "IBIG EDUFORM",        desc: "10 formations professionnelles certifiées",       taux: "10 % / 5 % / 2,5 %" },
            { icon: "🏠", name: "IBIG IMMO TRUST",     desc: "Immobilier, gestion locative, investissement",    taux: "10 % / 5 % / 2,5 %" },
            { icon: "🛒", name: "IBIG MARKET",         desc: "Marketplace produits (alimentation, mode…)",      taux: "8 % / 4 % / 2 %" },
            { icon: "🌐", name: "IBIG DIGITAL",        desc: "10 services web & marketing digital",             taux: "10 % / 5 % / 2 %" },
            { icon: "⚙️", name: "IBIG DIGITAL KITS",   desc: "8 services tech (dev web, ERP, cybersécurité)",   taux: "10 % / 5 % / 2 %" },
            { icon: "📋", name: "IBIG CONSEIL+",       desc: "6 missions de conseil & audit stratégique",       taux: "10 % / 5 % / 2,5 %" },
            { icon: "🔧", name: "IBIG MULTISERVICES",  desc: "6 services BTP, maintenance, logistique",         taux: "10 % / 5 % / 2 %" },
            { icon: "🌍", name: "IBIG INTERNATIONAL",  desc: "Commerce international & import-export",          taux: "Sur devis" },
          ].map((b) => (
            <div key={b.name} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <span className="text-2xl shrink-0">{b.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{b.name}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">{b.desc}</p>
                <p className="mt-1.5 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  N1 / N2 / N3 : {b.taux}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {show && <OnboardingTour isNewUser={true} />}
    </div>
  );
}

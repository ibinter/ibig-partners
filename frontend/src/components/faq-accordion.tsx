"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "C'est vraiment gratuit ?",
    a: "Oui, l'inscription est 100% gratuite et sans engagement. Vous ne payez absolument rien pour devenir partenaire IBIG. Il n'y a aucun frais caché.",
  },
  {
    q: "Comment je suis payé ?",
    a: "Via Orange Money, Wave, MTN Money ou virement bancaire selon votre préférence renseignée dans votre profil. Vous définissez votre mode de paiement dès l'inscription et pouvez le modifier à tout moment.",
  },
  {
    q: "Quel délai pour recevoir mes commissions ?",
    a: "Vos commissions sont validées sous 7 jours ouvrables. Le versement est effectué chaque semaine pour l'ensemble des commissions validées en attente de paiement.",
  },
  {
    q: "Qui peut devenir partenaire ?",
    a: "Toute personne majeure résidant en Côte d'Ivoire ou dans la diaspora. Aucune expérience commerciale n'est requise — IBIG vous fournit tous les outils (liens, visuels, argumentaires) pour démarrer immédiatement.",
  },
  {
    q: "Dois-je vendre tous les produits IBIG ?",
    a: "Non. Dans votre espace partenaire, vous activez librement les branches et produits que vous souhaitez promouvoir. Vous pouvez vous spécialiser sur une branche ou tout couvrir.",
  },
  {
    q: "Y a-t-il un minimum de ventes requis ?",
    a: "Aucun minimum. Chaque vente génère des commissions immédiatement. Plus vous vendez et développez votre réseau de filleuls, plus vous progressez dans les statuts et augmentez vos taux.",
  },
  {
    q: "Comment fonctionne le parrainage ?",
    a: "Chaque partenaire reçoit un lien d'affiliation unique. Quand quelqu'un s'inscrit via votre lien, il devient votre filleul Niveau 1. Ses propres filleuls deviennent vos Niveau 2, et ainsi de suite sur 3 niveaux.",
  },
];

export function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {FAQS.map((faq, i) => (
        <div
          key={i}
          className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
            openIdx === i
              ? "border-brand-200 bg-brand-50/50 shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <button
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            className="flex w-full items-center justify-between px-6 py-4 text-left"
          >
            <span className="text-sm font-semibold text-ink">{faq.q}</span>
            <span
              className={`ml-4 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                openIdx === i
                  ? "bg-brand-600 text-white rotate-180"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              ▼
            </span>
          </button>
          {openIdx === i && (
            <div className="border-t border-brand-100 px-6 py-4 text-sm leading-relaxed text-slate-600">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

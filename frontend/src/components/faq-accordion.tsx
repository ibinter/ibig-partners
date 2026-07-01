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
    a: "IBIG PARTNERS est un programme panafricain et international, sans limite de pays : toute personne majeure peut rejoindre le réseau, en Côte d'Ivoire, ailleurs en Afrique, ou depuis la diaspora partout dans le monde. C'est un programme pensé pour donner à la jeunesse africaine — et à tous ceux qui veulent s'y associer — un vrai moyen de générer des revenus. Aucune expérience commerciale n'est requise — IBIG vous fournit tous les outils (liens, visuels, argumentaires) pour démarrer immédiatement, où que vous soyez.",
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
  {
    q: "Est-ce un système pyramidal / une arnaque ?",
    a: "Non. Vous n'êtes jamais payé pour recruter quelqu'un — vos commissions viennent uniquement de ventes réelles de produits et services (logiciels, formations, immobilier, etc.) livrés par IBIG SARL, une entreprise enregistrée en Côte d'Ivoire. Aucun frais d'entrée, aucun stock à acheter : c'est un programme d'affiliation classique, pas un système pyramidal.",
  },
  {
    q: "Le programme est-il nouveau ? Est-ce risqué de rejoindre maintenant ?",
    a: "Oui, IBIG PARTNERS vient de lancer sa plateforme digitale. C'est justement l'intérêt de rejoindre tôt : moins de partenaires dans le réseau signifie plus de territoire disponible pour recruter, et les premiers inscrits ont un accès prioritaire aux meilleures opportunités avant que le réseau ne se densifie. Le groupe IBIG SARL, lui, existe depuis plus longtemps avec des produits déjà utilisés par de vrais clients.",
  },
  {
    q: "Et si je n'arrive pas à vendre ?",
    a: "Aucun engagement ni objectif minimum n'est imposé. Vous gardez l'accès à la plateforme, à l'Académie et à vos liens sans aucune pénalité. La majorité des partenaires démarrent en partageant simplement leurs liens à leur entourage proche (WhatsApp, réseaux sociaux) — aucune compétence commerciale préalable n'est nécessaire.",
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

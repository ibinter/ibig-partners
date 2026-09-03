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
    q: "Quels logiciels IBIG SOFT puis-je promouvoir ?",
    a: "IBIG SOFT propose désormais 14 logiciels et ERP couvrant de nombreux secteurs : Scolaby (gestion scolaire, à partir de 10 000), IBIG Fleet 360 (gestion de flotte, à partir de 19 900), Lokativo (immobilier, à partir de 9 900), GESCOMXEL (commerce, à partir de 5 000), Zelivry (livraison, à partir de 4 900), STOCKFLOW ERP (gestion de stock, à partir de 5 000), CONSTRUIRO ERP (BTP, à partir de 15 000), SANTAREX ERP (santé, à partir de 12 000), AGRIFRIK (agricole, à partir de 6 500), GESTMONEY (Mobile Money, à partir de 9 900), ANOUANZÊ ERP (ONG, à partir de 12 900), IBIG FactPro (facturation, à partir de 4 900), SECRETIS ERP (secrétariat, à partir de 4 900) et IBIG DocPro (génération de documents, dès 100 F/document à l'usage). Vous pouvez promouvoir tout le catalogue ou vous concentrer sur les secteurs qui vous parlent le plus.",
  },
  {
    q: "Y a-t-il un logiciel pour mon secteur ?",
    a: "Très probablement. Le catalogue IBIG SOFT couvre l'éducation (Scolaby), le transport et la flotte (IBIG Fleet 360), l'immobilier (Lokativo), le commerce (GESCOMXEL), la livraison (Zelivry), la gestion de stock (STOCKFLOW ERP), le BTP (CONSTRUIRO ERP), la santé (SANTAREX ERP), l'agriculture (AGRIFRIK), le Mobile Money (GESTMONEY), les ONG et associations (ANOUANZÊ ERP), la facturation (IBIG FactPro), le secrétariat (SECRETIS ERP) et la génération de documents (IBIG DocPro). Identifiez le besoin de votre prospect, puis proposez-lui le logiciel adapté à son métier.",
  },
  {
    q: "Combien je gagne en vendant un logiciel IBIG SOFT ?",
    a: "La commission logiciels est de 20% au Niveau 1, dégressive sur 4 mois. Pour IBIG DocPro, facturé à l'usage (dès 100 F/document), vous touchez 20% au Niveau 1 sur la consommation. Les taux exacts et les niveaux de parrainage sont détaillés dans votre espace partenaire.",
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
    q: "Est-ce un système pyramidal ou un Ponzi ?",
    a: "Non — et c'est une distinction importante. Un système de Ponzi ou pyramidal rémunère les participants avec l'argent des nouveaux inscrits, sans produit réel. IBIG PARTNERS fonctionne à l'inverse : (1) L'inscription est 100% gratuite — vous n'investissez rien. (2) Vous n'êtes jamais payé pour avoir recruté quelqu'un : votre commission vient uniquement d'une vente réelle d'un produit ou service (logiciel, formation, bien immobilier, prestation digitale…). (3) Ces produits existent indépendamment du programme : IBIG SOFT, EDUFORM, IMMO TRUST, DIGITAL fonctionnent avec de vrais clients, que vous soyez partenaire ou non. (4) Les taux de commission sont publics, plafonnés et calculables à l'avance — aucune promesse de rendement garanti. En résumé : si personne ne vend rien, personne n'est payé. C'est la définition d'un programme d'affiliation légitime.",
  },
  {
    q: "Comment savoir qu'IBIG SARL est une vraie entreprise ?",
    a: "IBIG SARL — Intermark Business International Group — est une société enregistrée en Côte d'Ivoire. Le groupe opère plusieurs branches actives avec des clients réels : IBIG SOFT commercialise 14 logiciels SaaS utilisés par des entreprises ivoiriennes, IBIG EDUFORM dispense des formations certifiantes en présentiel, IBIG IMMO TRUST accompagne des transactions immobilières documentées. Vous pouvez contacter l'équipe, visiter les sites de chaque branche et vérifier les réalisations. Aucun produit n'est virtuel ou hypothétique.",
  },
  {
    q: "Pourquoi y a-t-il des niveaux de parrainage (N1, N2, N3) ? N'est-ce pas du MLM ?",
    a: "Les commissions multi-niveaux existent dans l'affiliation classique : Amazon, Shopify, HubSpot et la plupart des SaaS B2B les pratiquent. Ce qui différencie l'affiliation du MLM illégal : dans l'affiliation, 100% des revenus viennent de la vente de produits à des clients finaux, pas du recrutement de nouveaux membres. Chez IBIG, le N2 et N3 récompensent le travail de développement commercial — si votre filleul vend un logiciel à une école, vous touchez un petit pourcentage car vous avez indirectement contribué à cette vente. Cela reste légal et transparent.",
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

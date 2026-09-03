import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import {
  buildKnowledgePrompt,
  findDynamicAnswer,
  loadAssistantContext,
  type AssistantContext,
} from "@/lib/assistant-knowledge";

/**
 * Assistant de formation IBIG — moteur de base de connaissances 100% gratuit.
 * Aucune API externe, aucune facturation. Les réponses sont des contenus de
 * formation curés. Le moteur sélectionne la meilleure réponse par score de
 * correspondance de mots-clés sur la question normalisée.
 */

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // retire les accents
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface KbEntry {
  keywords: string[]; // déclencheurs (mono ou multi-mots)
  answer: string;
}

const KB: KbEntry[] = [
  // ── Produits ───────────────────────────────────────────────
  {
    keywords: ["scolaby", "logiciel scolaire", "gestion scolaire", "ecole", "etablissement"],
    answer:
      "📚 Scolaby est la plateforme de gestion scolaire d'IBIG SOFT (à partir de 10 000 FCFA/mois pour le maternelle/primaire ≤300 élèves, jusqu'à 150 000 FCFA/mois pour les grands groupes scolaires — tarif selon cycle et taille d'établissement).\n\nElle gère : élèves, inscriptions, notes, bulletins, absences, paiements de frais et communication parents-école.\n\n👉 Cible idéale : directeurs d'écoles, du préscolaire au supérieur.\n💰 Commission : 20% N1 le 1er mois (dégressif sur 4 mois). Un abonnement annuel existe aussi (20% N1 one-shot).\n\nConseil de vente : proposez une démo gratuite au directeur — c'est le meilleur déclencheur d'achat.",
  },
  {
    keywords: ["fleet", "flotte", "gestion flotte", "lokativo", "gescomxel", "zelivry", "stockflow", "erp", "construiro", "btp", "santarex", "hopital", "sante", "agrifrik", "agricole", "gestmoney", "mobile money", "anouanze", "ong", "association", "factpro", "facturation", "secretis", "courrier", "secretariat", "docpro", "document"],
    answer:
      "💻 IBIG SOFT compte 14 logiciels/ERP (tous 20% N1 le 1er mois, dégressif sur 4 mois, sauf DocPro à l'usage) :\n\n• Scolaby — gestion scolaire (dès 10 000 FCFA/mois)\n• IBIG Fleet 360 — gestion de flotte (dès 19 900 FCFA/mois)\n• Lokativo — gestion immobilière (dès 9 900 FCFA/mois)\n• GESCOMXEL — gestion commerciale, stock et caisse (dès 5 000 FCFA/mois)\n• Zelivry — gestion de livraison (dès 4 900 FCFA/mois)\n• STOCKFLOW ERP — ERP commercial cloud (dès 5 000 FCFA/mois)\n• CONSTRUIRO ERP — ERP BTP & construction (dès 15 000 FCFA/mois)\n• SANTAREX ERP — gestion hospitalière (dès 12 000 FCFA/mois)\n• AGRIFRIK — ERP agricole (dès 6 500 FCFA/mois)\n• GESTMONEY — réseaux Mobile Money (dès 9 900 FCFA/mois)\n• ANOUANZÊ ERP — associations & ONG (dès 12 900 FCFA/mois)\n• IBIG FactPro — facturation OHADA (dès 4 900 FCFA/mois)\n• SECRETIS ERP — courrier & secrétariat (dès 4 900 FCFA/mois)\n• IBIG DocPro — génération de documents (dès 100 FCFA/document, à l'usage)\n\nRetrouvez le détail, prix exacts et liens dans « Mes Produits ».",
  },
  {
    keywords: ["construiro", "btp", "construction", "chantier", "chantiers", "batiment", "travaux publics", "erp btp"],
    answer:
      "🏗️ CONSTRUIRO ERP est l'ERP BTP & construction d'IBIG SOFT (à partir de 15 000 FCFA/mois — construiro.com).\n\nIl gère : chantiers, devis, RH/paie BTP, matériaux et engins.\n\n👉 Cible idéale : entreprises de BTP, promoteurs, bureaux d'études et entrepreneurs du bâtiment.\n🔑 Arguments clés : suivi des chantiers en temps réel + gestion dédiée de la paie BTP et des engins/matériaux, un besoin que les logiciels de compta classiques ne couvrent pas.\n\n❓ Objection fréquente : « On gère déjà nos chantiers sur Excel. »\n💬 Réponse : Excel ne relie pas devis, matériaux, engins et paie BTP en temps réel — avec CONSTRUIRO, un retard de chantier ou un dépassement de budget se voit immédiatement, ce qui protège vos marges.\n\n💰 Commission : 20% N1 le 1er mois (dégressif sur 4 mois).",
  },
  {
    keywords: ["santarex", "hopital", "hôpital", "clinique", "sante", "santé", "medical", "dme", "pharmacie", "laboratoire", "hospitalier"],
    answer:
      "🏥 SANTAREX ERP est le logiciel de gestion hospitalière d'IBIG SOFT (à partir de 12 000 FCFA/mois — santarex.ibigsoft.com).\n\nIl gère : dossier médical électronique (DME), pharmacie, laboratoire, hospitalisation et facturation.\n\n👉 Cible idéale : cliniques, hôpitaux, centres de santé et cabinets médicaux.\n🔑 Arguments clés : un dossier patient centralisé (DME) relié à la pharmacie, au labo et à la facturation — moins d'erreurs, encaissements plus fiables.\n\n❓ Objection fréquente : « C'est trop compliqué pour notre petite structure. »\n💬 Réponse : SANTAREX se déploie par modules — on peut démarrer avec le DME et la facturation, puis ajouter pharmacie et labo au rythme de la structure.\n\n💰 Commission : 20% N1 le 1er mois (dégressif sur 4 mois).",
  },
  {
    keywords: ["agrifrik", "agricole", "agriculture", "culture", "cultures", "elevage", "élevage", "intrants", "syscohada", "ferme"],
    answer:
      "🌾 AGRIFRIK est l'ERP agricole d'IBIG SOFT (à partir de 6 500 FCFA/mois — agrifrik.ibigsoft.com).\n\nIl gère : cultures, élevage, stocks/intrants et comptabilité SYSCOHADA.\n\n👉 Cible idéale : exploitations agricoles, coopératives, éleveurs et agro-entrepreneurs.\n🔑 Arguments clés : suivi des cultures et de l'élevage relié aux stocks d'intrants, avec une compta conforme SYSCOHADA — le tout à un tarif très accessible.\n\n❓ Objection fréquente : « L'agriculture, ça ne se gère pas avec un logiciel. »\n💬 Réponse : justement, AGRIFRIK aide à savoir quel intrant a coûté quoi et quelle culture ou quel élevage est rentable — des décisions chiffrées au lieu du ressenti, dès 6 500 FCFA/mois.\n\n💰 Commission : 20% N1 le 1er mois (dégressif sur 4 mois).",
  },
  {
    keywords: ["gestmoney", "mobile money", "momo", "transactions", "float", "kyc", "point de transfert", "reseau mobile money"],
    answer:
      "📲 GESTMONEY est l'ERP des réseaux Mobile Money d'IBIG SOFT (à partir de 9 900 FCFA/mois — gestmoney.ibigsoft.com).\n\nIl gère : transactions, float, commissions et KYC.\n\n👉 Cible idéale : gérants de points Mobile Money, agrégateurs et réseaux multi-points.\n🔑 Arguments clés : suivi du float et des commissions par point en temps réel + KYC centralisé — fini les écarts de caisse en fin de journée.\n\n❓ Objection fréquente : « Mon opérateur me fournit déjà une application. »\n💬 Réponse : l'appli de l'opérateur ne consolide pas TOUS vos points ni votre float global — GESTMONEY vous donne une vue réseau unique et le calcul automatique de vos commissions.\n\n💰 Commission : 20% N1 le 1er mois (dégressif sur 4 mois).",
  },
  {
    keywords: ["anouanze", "anouanzê", "ong", "association", "associations", "cotisation", "cotisations", "dons", "meal", "sycebnl", "projet"],
    answer:
      "🤲 ANOUANZÊ ERP est le logiciel des associations & ONG d'IBIG SOFT (à partir de 12 900 FCFA/mois — anouanze.ibigsoft.com).\n\nIl gère : membres, cotisations, dons, projets MEAL et comptabilité SYCEBNL.\n\n👉 Cible idéale : ONG, associations, fondations et coopératives.\n🔑 Arguments clés : suivi des dons et des projets MEAL relié à une compta conforme SYCEBNL — la transparence exigée par les bailleurs devient automatique.\n\n❓ Objection fréquente : « Nos bailleurs nous imposent déjà leurs propres formats de reporting. »\n💬 Réponse : ANOUANZÊ centralise membres, cotisations, dons et projets pour produire ces rapports plus vite et sans erreur, avec une compta SYCEBNL prête pour les audits.\n\n💰 Commission : 20% N1 le 1er mois (dégressif sur 4 mois).",
  },
  {
    keywords: ["factpro", "facturation", "facture", "factures", "devis", "pos", "point de vente", "ohada", "multi-devises"],
    answer:
      "🧾 IBIG FactPro est le logiciel de facturation OHADA d'IBIG SOFT (à partir de 4 900 FCFA/mois — factpro.ibigsoft.com).\n\nIl gère : devis, factures, POS (point de vente) et multi-devises.\n\n👉 Cible idéale : TPE/PME, commerçants et prestataires qui veulent des factures conformes OHADA sans se compliquer.\n🔑 Arguments clés : devis et factures conformes OHADA en quelques clics, avec POS et multi-devises — pour à peine 4 900 FCFA/mois.\n\n❓ Objection fréquente : « Je fais mes factures sur Word, ça suffit. »\n💬 Réponse : Word ne garantit ni la conformité OHADA, ni le suivi des impayés, ni la caisse — FactPro professionnalise votre image et vous fait gagner du temps dès la première facture.\n\n💰 Commission : 20% N1 le 1er mois (dégressif sur 4 mois).",
  },
  {
    keywords: ["secretis", "courrier", "secretariat", "secrétariat", "ged", "visiteurs", "workflow", "workflows", "parapheur"],
    answer:
      "📬 SECRETIS ERP est le logiciel de courrier & secrétariat d'IBIG SOFT (à partir de 4 900 FCFA/mois — secretis.ibigsoft.com).\n\nIl gère : courrier (entrant/sortant), GED, visiteurs et workflows.\n\n👉 Cible idéale : administrations, collectivités, directions et grandes entreprises avec un fort volume de courrier.\n🔑 Arguments clés : traçabilité complète du courrier et des documents (GED) + workflows de validation — plus aucun courrier perdu, chaque dossier est suivi.\n\n❓ Objection fréquente : « On a déjà une secrétaire qui gère le courrier. »\n💬 Réponse : SECRETIS ne remplace pas votre secrétaire, il la rend plus efficace — le courrier est tracé, retrouvable en un clic et les validations ne traînent plus sur un bureau.\n\n💰 Commission : 20% N1 le 1er mois (dégressif sur 4 mois).",
  },
  {
    keywords: ["docpro", "document", "documents", "cv", "contrat", "contrats", "statuts", "business plan", "generation document", "modele"],
    answer:
      "📄 IBIG DocPro génère des documents professionnels conformes OHADA (dès 100 FCFA/document, à l'usage — docpro.ibigsoft.com).\n\nIl produit : CV, contrats, statuts, business plans et autres documents conformes.\n\n👉 Cible idéale : entrepreneurs, créateurs d'entreprise, chercheurs d'emploi et petites structures sans juriste.\n🔑 Arguments clés : des documents pro et conformes OHADA en quelques minutes, sans abonnement — on paie seulement à l'usage, dès 100 FCFA/document.\n\n❓ Objection fréquente : « Je peux trouver des modèles gratuits sur internet. »\n💬 Réponse : les modèles gratuits ne sont ni à jour ni conformes OHADA — un contrat ou des statuts mal rédigés coûtent bien plus cher qu'un document DocPro à 100 FCFA.\n\n💰 Commission : 20% N1 à l'usage (paiement au document).",
  },
  {
    keywords: ["produits ibig", "quels produits", "catalogue", "liste des produits", "que vend", "offres", "branches"],
    answer:
      "🗂️ Le groupe IBIG SARL propose 11 branches :\n\n• IBIG SOFT — 14 logiciels/ERP SaaS (Scolaby, Fleet 360, Lokativo, GESCOMXEL, Zelivry, STOCKFLOW ERP, CONSTRUIRO, SANTAREX, AGRIFRIK, GESTMONEY, ANOUANZÊ, FactPro, SECRETIS, DocPro)\n• IBIG EDUFORM — formations professionnelles certifiantes (catalogue + formats sur mesure, présentiel, international, individuel)\n• IBIG IMMO TRUST — immobilier (vente, location, gérance, diaspora, foncier)\n• IBIG MARKET — commerce en ligne et en magasin\n• IBIG DIGITAL — création digitale et communication visuelle\n• IBIG DIGITAL KITS — transformation numérique (ERP, apps, IA, chatbots)\n• IBIG CONSEIL+ — structuration, comptabilité, juridique\n• IBIG FINANCEMENT — crédit PME, leasing, assurances (santé, vie, auto, RC pro), épargne retraite, levée de fonds — 20 offres\n• IBIG EMPLOI & TALENTS — recrutement CDI/CDD, placement cadres, externalisation RH, coaching, audit RH, GPEC — 20 offres\n• IBIG PARTNERS — le programme d'affiliation lui-même\n• IBIG MULTISERVICES — événementiel, déménagement, maintenance, gardiennage, transport VIP — 55 services\n\nActivez les produits qui vous intéressent dans « Mes Produits », puis partagez vos liens d'affiliation. Consultez l'onglet Produits pour le détail et les prix.",
  },
  {
    keywords: ["immo trust", "immobilier", "immo", "bien", "vente bien", "location", "gerance", "agence"],
    answer:
      "🏠 IBIG IMMO TRUST couvre la vente, la location, le conseil, la diaspora et la gérance immobilière.\n\n⚠️ IMPORTANT : sur les produits de transaction (vente, achat, terrain, location commerciale), vos commissions s'appliquent sur le montant du produit affiché (souvent une commission d'agence), PAS sur le prix total du bien.\n\n💰 Taux : 10% N1, 5% N2, 2,5% N3 sur la majorité des services immobiliers.\n\nCas particulier — Gestion Locative Complète : la commission correspond à 1 mois de commission d'agence, versé à l'affilié en 2 fois (une vente enregistrée par mois de mandat).\n\nLes taux exacts par produit sont toujours visibles dans « Mes Produits ».",
  },
  {
    keywords: ["formation", "eduform", "cours", "catalogue formation"],
    answer:
      "🎓 IBIG EDUFORM propose des formations professionnelles certifiantes (comptabilité, RH, QHSE, Sage, SAP, IA…), ainsi que des formats sur mesure entreprise, présentiel, international/diaspora et individuel.\n\n💰 Commission : 10% N1, 5% N2, 2% N3 en général (one-shot à la confirmation du paiement) ; les formats sur mesure/entreprise/international/individuel suivent le taux propre à chaque offre.\n\n👉 Cible : DRH, managers, professionnels en reconversion. Les entreprises forment souvent plusieurs employés à la fois — pensez aux ventes groupées.",
  },

  // ── Commissions ────────────────────────────────────────────
  {
    keywords: ["commission n2", "niveau 2", "n2", "filleul vend", "commission filleul"],
    answer:
      "💰 Le Niveau 2 (N2), c'est la commission que vous touchez quand VOTRE FILLEUL réalise une vente.\n\nElle vaut 50% de votre taux N1.\n\nExemple : si votre taux N1 est de 20%, vous touchez 10% sur les ventes de vos filleuls directs — automatiquement, sans rien faire de plus. C'est la base du revenu passif.",
  },
  {
    keywords: ["commission n3", "niveau 3", "n3", "filleul de filleul"],
    answer:
      "💰 Le Niveau 3 (N3), c'est la commission sur les ventes des filleuls de vos filleuls.\n\nElle vaut 25% de votre taux N1.\n\nExemple : taux N1 de 20% → vous touchez 5% au niveau 3. Plus votre réseau grandit en profondeur, plus ce revenu s'accumule.",
  },
  {
    keywords: ["commission", "3 niveaux", "niveaux", "comment gagner", "revenu", "gains", "combien", "taux"],
    answer:
      "💰 Les commissions IBIG fonctionnent sur 3 niveaux :\n\n• N1 — vos ventes directes : taux plein.\n• N2 — ventes de vos filleuls : 50% de votre taux N1.\n• N3 — ventes des filleuls de vos filleuls : 25% de votre taux N1.\n\nLes taux de base varient selon le produit (SaaS, formation, immobilier…). Votre statut ajoute un bonus à TOUS vos taux (+2% à +12%).\n\nConsultez « Guide Commissions » dans votre espace pour la grille complète.",
  },
  {
    keywords: ["bonus statut", "bonus", "pourcentage statut"],
    answer:
      "✨ Votre statut ajoute un bonus à TOUS vos taux de commission :\n\n• Starter : +0%\n• Silver : +2%\n• Gold : +5%\n• Master : +8%\n• Elite : +12%\n\nCe bonus s'additionne au taux de base du produit. Monter en statut augmente donc tous vos revenus d'un coup.",
  },

  // ── Statuts ────────────────────────────────────────────────
  {
    keywords: ["statut gold", "passer gold", "devenir gold", "atteindre gold"],
    answer:
      "⭐⭐⭐ Pour atteindre le statut GOLD, il faut réunir les 3 conditions :\n\n• 25 ventes confirmées\n• 10 filleuls directs (N1)\n• une équipe active de 20 personnes (N1+N2+N3 ayant fait ≥1 vente)\n\nAvantages Gold : +5% sur tous vos taux, badge Ambassadeur IBIG, et accès au Chat GOLD+.",
  },
  {
    keywords: ["statut master", "devenir master", "master partner"],
    answer:
      "🏆 Pour devenir MASTER PARTNER :\n\n• 50 ventes confirmées\n• 25 filleuls directs (N1)\n• équipe active de 50 personnes\n\nAvantages : +8% sur tous les taux et possibilité de devenir Représentant Communal officiel IBIG.",
  },
  {
    keywords: ["statut elite", "devenir elite", "elite representant", "representant pays"],
    answer:
      "👑 Le statut ELITE REPRÉSENTANT est le sommet :\n\n• 100 ventes confirmées\n• 50 filleuls directs (N1)\n• équipe active de 100 personnes\n\nAvantages : +12% sur tous les taux et statut de Représentant Pays officiel IBIG SARL.",
  },
  {
    keywords: ["statut", "silver", "niveaux statut", "progression", "monter niveau", "equipe active"],
    answer:
      "🏅 Les 5 statuts IBIG PARTNERS :\n\n• Starter — inscription (0%)\n• Silver — 10 ventes (+2%)\n• Gold — 25 ventes + 10 filleuls + 20 actifs (+5%)\n• Master — 50 ventes + 25 filleuls + 50 actifs (+8%)\n• Elite — 100 ventes + 50 filleuls + 100 actifs (+12%)\n\n« Équipe active » = vos filleuls N1+N2+N3 ayant fait au moins 1 vente confirmée. Suivez votre progression dans « Mes Objectifs ».",
  },

  // ── Paiements ──────────────────────────────────────────────
  {
    keywords: ["paiement", "etre paye", "retrait", "toucher argent", "versement", "seuil", "minimum", "quand paye"],
    answer:
      "🏦 Vos paiements :\n\n• Les commissions sont versées après encaissement confirmé du client (délai ~7 jours ouvrables).\n• Le seuil minimum de versement est de 5 000 FCFA.\n• Quand le seuil est atteint, le paiement se déclenche.\n• Moyens disponibles : Orange Money, Wave, MTN MoMo, virement bancaire.\n• Chaque paiement génère un reçu téléchargeable.\n\n⚠️ Votre compte doit être VÉRIFIÉ (KYC) pour toucher vos commissions.",
  },
  {
    keywords: ["verification", "verifier compte", "kyc", "valider compte", "piece identite", "documents"],
    answer:
      "🔐 La vérification (KYC) est obligatoire pour toucher vos commissions.\n\nAprès inscription, allez dans « Vérifier mon compte » et envoyez :\n• Particulier : pièce d'identité, CV, coordonnées, 2 contacts de référence, infos de paiement.\n• Entreprise : RCCM, NIF, compte contribuable, représentant légal, coordonnées.\n\nL'équipe IBIG analyse votre dossier. Une fois validé, vous recevez une confirmation et pouvez percevoir vos revenus.",
  },

  // ── Vente / prospection ────────────────────────────────────
  {
    keywords: ["recruter filleul", "recruter", "parrainer", "agrandir equipe", "construire equipe", "filleuls"],
    answer:
      "🤝 Pour recruter des filleuls efficacement :\n\n1. Partagez votre lien de parrainage sur WhatsApp, Facebook, LinkedIn.\n2. Ciblez des personnes motivées qui cherchent un revenu complémentaire.\n3. Montrez-leur des cas concrets de gains (Guide Commissions).\n4. Formez et accompagnez vos filleuls : un filleul actif vous rapporte du N2 et du N3.\n\nRappel : en tant que parrain, vous DEVEZ former vos filleuls. Vous pouvez facturer honnêtement installation, coaching et prise en main.",
  },
  {
    keywords: ["vendre", "technique vente", "conclure", "prospect", "prospection", "convaincre", "objection", "client"],
    answer:
      "🎯 Techniques de vente gagnantes :\n\n1. Écoutez le besoin réel avant de proposer.\n2. Présentez le produit IBIG adapté à SA situation.\n3. Répondez aux objections avec des faits et une démo.\n4. Proposez un essai quand c'est possible.\n5. Accompagnez le client jusqu'à la prise en main complète.\n\nUn client satisfait devient votre meilleur ambassadeur. Suivez vos prospects dans l'onglet « Mes Prospects ».",
  },
  {
    keywords: ["lien", "lien affiliation", "partager lien", "cookie", "tracking", "90 jours"],
    answer:
      "🔗 Vos liens d'affiliation :\n\n• Activez un produit puis copiez votre lien dans « Mes Liens ».\n• Partagez-le partout : réseaux sociaux, WhatsApp, email.\n• Le cookie de suivi dure 90 jours : si quelqu'un clique aujourd'hui et achète dans les 90 jours, la commission vous revient.\n\nPlus vous partagez, plus vous multipliez vos chances de vente.",
  },

  // ── Chat / communauté ──────────────────────────────────────
  {
    keywords: ["chat", "messagerie", "discuter", "communaute", "gold plus", "parler partenaires"],
    answer:
      "💬 Le Chat GOLD+ est réservé aux partenaires Gold, Master et Elite.\n\nIl permet d'échanger directement avec les meilleurs partenaires du réseau, partager des bonnes pratiques et bâtir des collaborations.\n\nPour y accéder, atteignez le statut Gold (25 ventes + 10 filleuls + 20 actifs).",
  },
  {
    keywords: ["badge", "recompense", "trophee"],
    answer:
      "🏅 Les badges récompensent vos accomplissements :\n\n• Première vente, Vendeur confirmé (10), Champion (50 ventes)\n• Ambassadeur Gold, Master Partner, Elite Représentant\n• Bâtisseur d'équipe (10 filleuls)\n\nIls sont attribués automatiquement. Consultez-les dans « Mes Badges ».",
  },
];

// Réponse par défaut quand aucune correspondance fiable n'est trouvée
const DEFAULT_ANSWER =
  "Je suis l'assistant de formation IBIG PARTNERS. Je peux vous aider sur :\n\n• Les produits des 11 branches (logiciels, formations, immobilier, financement, emploi & RH, digital, conseil, multiservices…)\n• Les commissions sur 3 niveaux et les taux\n• Les statuts et comment progresser\n• Les paiements et la vérification du compte\n• Les techniques de vente et le recrutement de filleuls\n\nReformulez votre question avec un de ces sujets, ou consultez le « Guide Commissions » et l'Académie pour aller plus loin.";

const GREETING_ANSWER =
  "Bonjour 👋 Je suis votre assistant de formation IBIG PARTNERS. Posez-moi une question sur les produits, les commissions, les statuts, les paiements ou la vente — je vous réponds tout de suite !";

function findBestAnswer(message: string): string {
  const q = normalize(message);
  if (!q) return DEFAULT_ANSWER;

  // Salutations simples
  const greetings = ["bonjour", "salut", "bonsoir", "hello", "coucou", "merci", "cava", "ca va"];
  if (greetings.some((g) => q === g || q.startsWith(g + " ")) && q.split(" ").length <= 3) {
    return GREETING_ANSWER;
  }

  const qWords = new Set(q.split(" "));
  let best: { score: number; answer: string } | null = null;

  for (const entry of KB) {
    let score = 0;
    for (const kw of entry.keywords) {
      const k = normalize(kw);
      if (!k) continue;
      if (k.includes(" ")) {
        // expression multi-mots : forte pondération si présente telle quelle
        if (q.includes(k)) score += 5 + k.split(" ").length;
      } else {
        // mot simple : correspondance exacte de token
        if (qWords.has(k)) score += 2;
        else if (q.includes(k) && k.length >= 5) score += 1; // correspondance partielle
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { score, answer: entry.answer };
    }
  }

  if (best && best.score >= 2) return best.answer;
  return DEFAULT_ANSWER;
}

const SYSTEM_PROMPT = `Tu es l'assistant de formation officiel d'IBIG PARTNERS, le programme d'affiliation multi-niveaux panafricain et international d'INTERMARK BUSINESS INTERNATIONAL GROUP SARL (IBIG SARL), basé à Abidjan, Côte d'Ivoire — ouvert sans limite de pays, en Afrique comme dans la diaspora.

Tu aides les partenaires affiliés à :
- Comprendre les 11 branches et le catalogue de produits IBIG (IBIG SOFT, IBIG EDUFORM, IBIG IMMO TRUST, IBIG MARKET, IBIG DIGITAL, IBIG DIGITAL KITS, IBIG CONSEIL+, IBIG FINANCEMENT, IBIG EMPLOI & TALENTS, IBIG PARTNERS, IBIG MULTISERVICES) — le catalogue exact avec prix et taux réels t'est fourni ci-dessous, utilise-le en priorité
- Maîtriser les commissions sur 3 niveaux (N1, N2=50% de N1, N3=25% de N1, sauf abonnements et formations qui suivent des barèmes dédiés)
- Progresser dans les statuts : Starter → Silver (10 ventes, +2%) → Gold (25 ventes + 10 filleuls + 20 actifs, +5%) → Master (50 ventes + 25 filleuls + 50 actifs, +8%) → Elite (100 ventes + 50 filleuls + 100 actifs, +12%)
- Vendre et recruter efficacement
- Comprendre les paiements (seuil 5 000 FCFA, Orange Money, Wave, MTN MoMo, virement bancaire)

Règles :
- Réponds toujours en français
- Sois concis, pratique et motivant
- Utilise des emojis avec modération
- Si tu ne sais pas, dis-le clairement et oriente vers support@ibigpartners.com
- Ne parle que de ce qui concerne IBIG PARTNERS`;

async function geminiAnswer(
  message: string,
  history: { role: string; content: string }[],
  context: AssistantContext,
): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: `${SYSTEM_PROMPT}\n\n${buildKnowledgePrompt(context)}`,
  });

  const geminiHistory = history.slice(-8).map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history: geminiHistory });
  const result = await chat.sendMessage(message);
  return result.response.text();
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { message, history = [] } = body as { message?: string; history?: {role:string;content:string}[] };

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ reply: "Veuillez entrer une question." }, { status: 400 });
    }
    if (message.length > 2000) {
      return NextResponse.json({ reply: "Votre question est trop longue. Merci de la résumer." }, { status: 400 });
    }

    const context = await loadAssistantContext(user.id, user.status);

    // Si la clé Gemini est configurée, on utilise l'IA — sinon fallback sur la base de connaissances
    if (process.env.GOOGLE_AI_API_KEY) {
      try {
        const safeHistory = Array.isArray(history)
          ? history
              .filter((item) => item && typeof item.content === "string" && ["user", "assistant"].includes(item.role))
              .slice(-8)
              .map((item) => ({ role: item.role, content: item.content.slice(0, 2000) }))
          : [];
        const reply = await geminiAnswer(message, safeHistory, context);
        return NextResponse.json({ reply });
      } catch (err) {
        console.error("[Gemini] Erreur, fallback KB :", err);
      }
    }

    const reply = findDynamicAnswer(message, context) ?? findBestAnswer(message);
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { reply: "Une erreur s'est produite. Veuillez reformuler votre question." },
      { status: 200 },
    );
  }
}

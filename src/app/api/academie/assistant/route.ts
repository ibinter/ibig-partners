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
      "📚 Scolaby est la plateforme de gestion scolaire d'IBIG SOFT (à partir de 30 000 FCFA/mois).\n\nElle gère : élèves, inscriptions, notes, bulletins, absences, paiements de frais et communication parents-école.\n\n👉 Cible idéale : directeurs d'écoles, du préscolaire au supérieur.\n💰 Commission : 20% N1 le 1er mois (dégressif sur 4 mois). Un abonnement annuel existe aussi (20% N1 one-shot).\n\nConseil de vente : proposez une démo gratuite au directeur — c'est le meilleur déclencheur d'achat.",
  },
  {
    keywords: ["produits ibig", "quels produits", "catalogue", "liste des produits", "que vend", "offres", "branches"],
    answer:
      "🗂️ Le groupe IBIG SARL propose 5 grandes branches :\n\n• IBIG SOFT — logiciels SaaS (Scolaby, Fleet 360, RH…)\n• IBIG EDUFORM — formations professionnelles\n• IBIG IMMO TRUST — immobilier (vente, location, gérance)\n• IBIG MARKET — produits & e-commerce\n• INTERMARK BUSINESS — services aux entreprises\n\nActivez les produits qui vous intéressent dans « Mes Produits », puis partagez vos liens d'affiliation. Consultez l'onglet Produits pour le détail et les prix.",
  },
  {
    keywords: ["immo trust", "immobilier", "immo", "bien", "vente bien", "location", "gerance", "agence"],
    answer:
      "🏠 IBIG IMMO TRUST couvre la vente, la location et la gérance immobilière.\n\n⚠️ IMPORTANT : vos commissions s'appliquent sur la COMMISSION DE L'AGENCE, PAS sur le prix de vente du bien.\n\nExemple : un bien à 50 M FCFA, commission agence = 1 M FCFA → vous touchez 25% = 250 000 FCFA (N1).\n\nTaux : 25% N1, 12,5% N2, pas de N3. Pour la gérance : 1 mois de commission agence, payé en 2×50%, N1 uniquement.",
  },
  {
    keywords: ["hrm", "rh", "ressources humaines", "suite rh", "paie"],
    answer:
      "👥 La suite RH d'IBIG SOFT aide les entreprises à gérer leurs collaborateurs, contrats, congés et paie.\n\n👉 Cible : DRH, managers et PME.\n💰 Abonnement SaaS : 20% N1 le 1er mois (dégressif sur 4 mois).\n\nArgument clé : automatiser la paie et le suivi RH fait gagner un temps énorme aux PME.",
  },
  {
    keywords: ["formation", "eduform", "cours", "catalogue formation"],
    answer:
      "🎓 IBIG EDUFORM propose des formations professionnelles certifiantes.\n\n💰 Commission : 10% N1, 5% N2, 2% N3 (one-shot à la confirmation du paiement).\n\n👉 Cible : DRH, managers, professionnels en reconversion. Les entreprises forment souvent plusieurs employés à la fois — pensez aux ventes groupées.",
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
      "🏦 Vos paiements :\n\n• Les commissions sont versées après encaissement confirmé du client (délai ~7 jours ouvrables).\n• Vous fixez votre seuil minimum de versement (par défaut 5 000 FCFA) dans « Mes Paiements ».\n• Quand le seuil est atteint, le paiement se déclenche.\n• Moyens : Orange Money, Wave, MTN MoMo, virement bancaire, PayPal, Western Union.\n• À l'international, les frais sont déduits des commissions.\n• Chaque paiement génère un reçu téléchargeable.\n\n⚠️ Votre compte doit être VÉRIFIÉ (KYC) pour toucher vos commissions.",
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
  "Je suis l'assistant de formation IBIG PARTNERS. Je peux vous aider sur :\n\n• Les produits (Scolaby, RH, immobilier, formations…)\n• Les commissions sur 3 niveaux et les taux\n• Les statuts et comment progresser\n• Les paiements et la vérification du compte\n• Les techniques de vente et le recrutement de filleuls\n\nReformulez votre question avec un de ces sujets, ou consultez le « Guide Commissions » et l'Académie pour aller plus loin.";

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

const SYSTEM_PROMPT = `Tu es l'assistant de formation officiel d'IBIG PARTNERS, le programme d'affiliation multi-niveaux d'INTERMARK BUSINESS INTERNATIONAL GROUP SARL (IBIG SARL), basé à Abidjan, Côte d'Ivoire.

Tu aides les partenaires affiliés à :
- Comprendre les produits IBIG (Scolaby, Suite RH, IBIG IMMO TRUST, formations IBIG EDUFORM, IBIG MARKET)
- Maîtriser les commissions sur 3 niveaux (N1, N2=50% de N1, N3=25% de N1)
- Progresser dans les statuts : Starter → Silver (10 ventes) → Gold (25 ventes + 10 filleuls + 20 actifs) → Master (50 ventes + 25 filleuls + 50 actifs) → Elite (100 ventes + 50 filleuls + 100 actifs)
- Vendre et recruter efficacement
- Comprendre les paiements (seuil 5 000 FCFA, Orange Money, Wave, MTN MoMo, Virement)

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

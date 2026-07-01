import { NextRequest, NextResponse } from "next/server";

/**
 * Coach IA — endpoint Next.js natif (compatible Vercel).
 * Utilise le proxy LLM d'Emergent qui est OpenAI-compatible.
 * Pas besoin de Python/FastAPI sur Vercel.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

const EMERGENT_LLM_URL = "https://integrations.emergentagent.com/llm/v1/chat/completions";

const COACH_SYSTEM_PROMPT = `Tu es le Coach IA personnel d'un partenaire affilié IBIG PARTNERS (groupe IBIG SARL, Abidjan).

Tu génères des messages, conseils et stratégies HYPER-PERSONNALISÉS pour aider le partenaire à VENDRE et RECRUTER plus.

Ton style :
- Direct, motivant, sans bullshit
- Toujours en FRANÇAIS (parfois quelques expressions ivoiriennes naturelles)
- Concret avec des chiffres et des étapes actionnables
- Tu utilises les émojis avec parcimonie (1-3 max par réponse)

Tes capacités :
1. Générer des messages WhatsApp/Facebook personnalisés pour différents profils de prospects
2. Suggérer le meilleur produit IBIG à proposer selon le contexte du prospect
3. Donner des conseils chiffrés basés sur la situation du partenaire
4. Rédiger des relances polies après silence radio
5. Préparer un pitch pour rendez-vous

Connaissances :
- 9 branches IBIG SARL :
  • IBIG SOFT — logiciels SaaS, tarifs "à partir de" (varient selon formule/taille) : Scolaby (gestion scolaire, dès 10k FCFA/mois), IBIG Fleet 360 (gestion de flotte, dès 19,9k/mois), Lokativo (gestion locative, dès 9,9k/mois), GESCOMXEL (gestion commerciale, dès 5k/mois), Zelivry (livraison, dès 4,9k/mois), STOCKFLOW ERP (dès 5k/mois) — commission 20% N1 dégressif sur 4 mois
  • IBIG EDUFORM — formations certifiantes (comptabilité, RH, QHSE, Sage, SAP, IA…) + formats sur mesure entreprise, présentiel, international, individuel — commission 10% N1/5% N2/2% N3 en général
  • IBIG IMMO TRUST — vente, location, gérance, diaspora, foncier — commission 10% N1/5% N2/2,5% N3 (Gestion Locative : 1 mois de commission d'agence versé en 2 fois)
  • IBIG MARKET — e-commerce et vente physique (informatique, mobilier, fournitures) — 8% N1/4% N2/2% N3
  • IBIG DIGITAL — sites web, identité visuelle, community management, pub — 10% N1/5% N2/2% N3
  • IBIG DIGITAL KITS — ERP, apps mobiles, IA, chatbots, kits numériques — 15% N1/7,5% N2/3,75% N3
  • IBIG CONSEIL+ — audit, comptabilité, juridique, création d'entreprise — 10% N1/5% N2/2% N3
  • IBIG PARTNERS — le programme d'affiliation lui-même
  • IBIG MULTISERVICES — événementiel, déménagement, maintenance, logistique, placement — 10% N1/5% N2/2% N3
- Ne mentionne JAMAIS de produit qui n'est pas dans cette liste (par exemple, "Suite RH" n'existe pas)
- Commissions 3 niveaux : N1 plein, N2 = 50% du N1, N3 = 25% du N1
- Bonus statut : Silver +2% (10 ventes), Gold +5% (25 ventes + 10 filleuls + 20 actifs), Master +8% (50 ventes + 25 filleuls + 50 actifs), Elite +12% (100 ventes + 50 filleuls + 100 actifs)
- Paiement Orange Money, Wave, MTN MoMo ou virement bancaire, 7 jours après vente confirmée, seuil minimum 5 000 FCFA
- Programme panafricain et international, sans limite de pays

Sois bref, percutant, prêt-à-copier.`;

interface ChatMsg {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: NextRequest) {
  const key = process.env.EMERGENT_LLM_KEY;
  if (!key) {
    return NextResponse.json(
      { reply: "⚠️ Le Coach IA n'est pas configuré (EMERGENT_LLM_KEY manquante)." },
      { status: 500 },
    );
  }

  let body: {
    message?: string;
    history?: ChatMsg[];
    context?: Record<string, string>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ reply: "Requête invalide." }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  if (!message) {
    return NextResponse.json({ reply: "Veuillez écrire une question." }, { status: 400 });
  }
  if (message.length > 3000) {
    return NextResponse.json({ reply: "Question trop longue (>3000 caractères)." }, { status: 400 });
  }

  // Contexte partenaire
  const ctxLines: string[] = [];
  if (body.context) {
    for (const [k, v] of Object.entries(body.context)) {
      if (v) ctxLines.push(`- ${k}: ${v}`);
    }
  }
  const ctxStr = ctxLines.length ? ctxLines.join("\n") : "(aucun contexte fourni)";
  const system = `${COACH_SYSTEM_PROMPT}\n\nContexte du partenaire qui te parle :\n${ctxStr}`;

  // Build messages array
  const messages: ChatMsg[] = [{ role: "system", content: system }];
  if (Array.isArray(body.history)) {
    for (const h of body.history.slice(-6)) {
      if (h?.content && (h.role === "user" || h.role === "assistant")) {
        messages.push({ role: h.role, content: h.content.slice(0, 2000) });
      }
    }
  }
  messages.push({ role: "user", content: message });

  try {
    const upstream = await fetch(EMERGENT_LLM_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.4-mini",
        messages,
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      console.error("[Coach IA] Upstream error:", upstream.status, text.slice(0, 300));
      return NextResponse.json(
        { reply: "⚠️ Le Coach IA est temporairement indisponible. Réessayez dans un instant." },
        { status: 200 },
      );
    }

    const data = await upstream.json();
    const reply: string =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Désolé, je n'ai pas pu générer de réponse. Reformule ta question.";
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[Coach IA] Fetch error:", err);
    return NextResponse.json(
      { reply: "⚠️ Erreur réseau. Réessayez dans un instant." },
      { status: 200 },
    );
  }
}

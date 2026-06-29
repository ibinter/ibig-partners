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
- Produits IBIG : Scolaby (gestion scolaire 30k FCFA/mois), Suite RH SaaS, IBIG IMMO TRUST (immobilier), formations IBIG EDUFORM, IBIG MARKET
- Commissions 3 niveaux : N1 plein, N2 = 50% du N1, N3 = 25% du N1
- Bonus statut : Silver +2%, Gold +5%, Master +8%, Elite +12%
- Paiement Mobile Money 7 jours après vente confirmée

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

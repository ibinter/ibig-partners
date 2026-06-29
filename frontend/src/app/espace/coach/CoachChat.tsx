"use client";
import { useState, useRef, useEffect } from "react";

interface Props {
  partnerName: string;
  partnerStatus: string;
  partnerCity: string;
  partnerCode: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  {
    icon: "💬",
    label: "Message WhatsApp pour un directeur d'école",
    prompt: "Rédige-moi un message WhatsApp court (max 4 lignes) pour proposer Scolaby à un directeur d'école primaire que je connais peu. Je veux qu'il accepte une démo.",
  },
  {
    icon: "🔄",
    label: "Relance après silence radio",
    prompt: "Mon prospect ne m'a pas répondu depuis 5 jours après ma première proposition. Rédige une relance polie qui réveille son intérêt sans le brusquer.",
  },
  {
    icon: "💡",
    label: "Quel produit proposer ?",
    prompt: "J'ai un contact qui dirige une PME de 12 employés à Abidjan. Quel produit IBIG je dois lui proposer en priorité et pourquoi ? Donne-moi un argumentaire de 3 points.",
  },
  {
    icon: "🎯",
    label: "Pitch en 30 secondes",
    prompt: "Prépare-moi un pitch oral de 30 secondes (à dire en RDV) pour présenter IBIG PARTNERS à un ami qui cherche un revenu complémentaire.",
  },
  {
    icon: "📈",
    label: "Plan pour atteindre Gold",
    prompt: "Je suis Silver. Quel est le plan d'action concret semaine par semaine pour passer Gold (25 ventes + 10 filleuls + 20 actifs) en 60 jours ?",
  },
  {
    icon: "🤝",
    label: "Convaincre un proche d'être filleul",
    prompt: "Mon cousin hésite à devenir mon filleul IBIG. Il dit qu'il n'a pas le temps. Comment lui répondre pour le rassurer et le motiver ?",
  },
];

export function CoachChat({ partnerName, partnerStatus, partnerCity, partnerCode }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Salut ${partnerName.split(" ")[0]} ! 👋 Je suis ton Coach IA personnel.\n\nJe peux t'aider à :\n• Rédiger des messages WhatsApp percutants\n• Préparer des relances\n• Choisir le bon produit selon le profil de ton prospect\n• Bâtir un plan pour passer au statut supérieur\n\nClique sur un raccourci ci-dessous ou pose-moi ta question directement.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: newMessages.slice(-7, -1),
          context: {
            nom: partnerName,
            statut: partnerStatus,
            ville: partnerCity || "non renseignée",
            code_affilie: partnerCode,
          },
        }),
      });
      const data = await res.json();
      const reply = data.reply || "Désolé, je n'ai pas pu générer de réponse. Réessaye.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "⚠️ Erreur de connexion au Coach IA. Réessaye dans un instant." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="coach-chat" className="grid gap-5 lg:grid-cols-[1fr_280px]">
      {/* Conversation */}
      <div className="card-premium flex flex-col h-[70vh] overflow-hidden">
        <div className="border-b border-slate-100 bg-gradient-to-r from-brand-50 to-violet-50 px-5 py-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-brand-600 text-white shadow-md text-xl">
            🤖
          </div>
          <div className="flex-1">
            <p className="font-bold text-ink text-sm">Coach IBIG — GPT-5.4 Mini</p>
            <p className="text-xs text-emerald-600 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              En ligne · Réponses en temps réel
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
          {messages.map((m, i) => (
            <div
              key={i}
              data-testid={`msg-${i}-${m.role}`}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line leading-relaxed ${
                  m.role === "user"
                    ? "bg-brand-600 text-white rounded-br-md"
                    : "bg-white text-slate-800 ring-1 ring-slate-200 rounded-bl-md shadow-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 ring-1 ring-slate-200 shadow-sm">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-slate-100 p-3 bg-white">
          <div className="flex gap-2">
            <input
              data-testid="coach-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Demandez n'importe quoi à votre coach…"
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              disabled={loading}
            />
            <button
              data-testid="coach-send"
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "..." : "Envoyer →"}
            </button>
          </div>
        </div>
      </div>

      {/* Raccourcis */}
      <div className="space-y-3">
        <div className="card-premium p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
            ⚡ Raccourcis intelligents
          </p>
          <div className="space-y-2">
            {QUICK_PROMPTS.map((q, i) => (
              <button
                key={i}
                data-testid={`quick-${i}`}
                onClick={() => send(q.prompt)}
                disabled={loading}
                className="w-full text-left rounded-xl bg-slate-50 hover:bg-brand-50 border border-slate-100 hover:border-brand-200 p-3 text-xs transition-all disabled:opacity-50"
              >
                <span className="text-base mr-1">{q.icon}</span>
                <span className="font-semibold text-slate-700">{q.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-4">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
            💡 Conseil
          </p>
          <p className="text-xs text-amber-900 leading-relaxed">
            Plus tu donnes de contexte (qui est ton prospect, son secteur, le produit visé), plus le Coach te génère un message percutant.
          </p>
        </div>
      </div>
    </div>
  );
}

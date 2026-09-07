"use client";
import { useState, useRef, useEffect } from "react";

interface Props {
  partnerName: string;
  partnerStatus: string;
  partnerCity: string;
  partnerCode: string;
  salesCount: number;
  totalComm: number;
  totalCommDisplay: string;
  directCount: number;
  activeCount: number;
  linksCount: number;
  networkTotal: number;
  nextStatusLabel: string | null;
  nextSalesMissing: number;
  nextDirectMissing: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CATEGORIES = [
  {
    key: "vente",
    label: "💼 Vente",
    prompts: [
      {
        icon: "💬",
        label: "Message WhatsApp directeur d'école",
        prompt: "Rédige un message WhatsApp court (max 4 lignes) pour proposer Scolaby à un directeur d'école primaire que je connais peu. Je veux qu'il accepte une démo.",
      },
      {
        icon: "🔄",
        label: "Relance après silence radio",
        prompt: "Mon prospect ne m'a pas répondu depuis 5 jours après ma première proposition. Rédige une relance polie qui réveille son intérêt sans le brusquer.",
      },
      {
        icon: "🎯",
        label: "Pitch oral 30 secondes",
        prompt: "Prépare un pitch oral de 30 secondes (à dire en RDV) pour présenter IBIG PARTNERS à un ami qui cherche un revenu complémentaire.",
      },
      {
        icon: "💡",
        label: "Quel produit proposer à une PME ?",
        prompt: "J'ai un contact qui dirige une PME de 12 employés à Abidjan dans le commerce. Quel(s) produit(s) IBIG je dois lui proposer en priorité et pourquoi ? Donne un argumentaire de 3 points et un message WhatsApp prêt à envoyer.",
      },
      {
        icon: "🏢",
        label: "Argumentaire pour un DRH",
        prompt: "J'ai un rendez-vous avec un DRH d'une entreprise de 50 personnes la semaine prochaine. Quels produits IBIG EMPLOI & TALENTS et IBIG FINANCEMENT dois-je lui proposer ? Donne-moi un argumentaire structuré et les commissions que je peux gagner.",
      },
      {
        icon: "🚀",
        label: "Closer un prospect qui hésite",
        prompt: "J'ai fait une démo Scolaby il y a 1 semaine. Le directeur est intéressé mais dit qu'il doit encore réfléchir. Donne-moi 3 arguments de closing et un message WhatsApp de relance pour le pousser à décider aujourd'hui.",
      },
    ],
  },
  {
    key: "recrutement",
    label: "👥 Recrutement",
    prompts: [
      {
        icon: "🤝",
        label: "Convaincre un proche d'être filleul",
        prompt: "Mon cousin hésite à devenir mon filleul IBIG. Il dit qu'il n'a pas le temps. Comment lui répondre pour le rassurer et le motiver ?",
      },
      {
        icon: "📢",
        label: "Post Facebook pour recruter",
        prompt: "Rédige un post Facebook court et accrocheur pour recruter des partenaires IBIG dans ma ville. Ton style : simple, honnête, pas de promesses exagérées.",
      },
      {
        icon: "📞",
        label: "Script d'appel pour présenter l'opportunité",
        prompt: "Donne-moi un script d'appel téléphonique de 2 minutes pour présenter l'opportunité IBIG PARTNERS à quelqu'un qui ne me connaît pas très bien.",
      },
      {
        icon: "❓",
        label: "Répondre aux objections fréquentes",
        prompt: "Quelles sont les 5 objections les plus fréquentes quand je présente IBIG à quelqu'un, et comment y répondre efficacement ? Inclus la réponse à 'c'est un Ponzi'.",
      },
      {
        icon: "📋",
        label: "Message de bienvenue pour nouveau filleul",
        prompt: "Mon nouveau filleul vient de s'inscrire sur IBIG PARTNERS. Rédige un message de bienvenue WhatsApp qui l'enthousiasme, explique les premières étapes à faire et lui donne confiance.",
      },
    ],
  },
  {
    key: "missions",
    label: "🎯 Missions",
    prompts: [
      {
        icon: "💰",
        label: "Quelle mission CASH accomplir ?",
        prompt: "Explique-moi comment les missions CASH fonctionnent sur IBIG PARTNERS et comment choisir les plus rentables selon mon profil. Donne-moi une stratégie pour en accomplir 2-3 par mois.",
      },
      {
        icon: "🔵",
        label: "Comprendre les missions CP",
        prompt: "Je suis nouveau sur IBIG PARTNERS. Qu'est-ce que les CP (Crédibilité Points) et comment les missions CP peuvent m'aider à progresser plus vite ? Donne-moi les 5 missions CP les plus faciles à accomplir en premier.",
      },
      {
        icon: "🟡",
        label: "Stratégie missions MIXTES",
        prompt: "Pourquoi les missions MIXTES sont-elles les meilleures ? Comment je dois organiser mon activité commerciale pour accomplir le maximum de missions MIXTES chaque mois et doubler mes revenus ?",
      },
      {
        icon: "📊",
        label: "Plan missions + ventes combiné",
        prompt: `Je suis au statut ${"{status}"}. Donne-moi un plan sur 30 jours qui combine mes ventes normales avec les missions CASH et MIXTES disponibles pour maximiser mes revenus et accumuler des CP en même temps.`,
        dynamic: true,
      },
    ],
  },
  {
    key: "strategie",
    label: "📈 Stratégie",
    prompts: [
      {
        icon: "🚀",
        label: "Plan pour passer au statut suivant",
        prompt: `Je suis au statut ${"{status}"}. Il me manque ${"{salesMissing}"} ventes et ${"{directMissing}"} filleuls pour le statut suivant. Donne-moi un plan d'action semaine par semaine pour y arriver en 60 jours.`,
        dynamic: true,
      },
      {
        icon: "📅",
        label: "Plan sur 30 jours — débutant",
        prompt: "Je débute sur IBIG PARTNERS. Donne-moi un plan d'action réaliste sur 30 jours pour faire mes premières ventes, recruter mes premiers filleuls et accomplir mes premières missions.",
      },
      {
        icon: "🏆",
        label: "Stratégie réseau multi-niveaux",
        prompt: "Comment je dois organiser mon équipe (filleuls N1 et N2) pour maximiser mes commissions résiduelles tout en restant actif sur les ventes directes ? Donne-moi un modèle concret.",
      },
      {
        icon: "🗺️",
        label: "Quels secteurs cibler dans ma ville ?",
        prompt: `Je suis basé à ${"{city}"}. Quels secteurs d'activité dois-je cibler en priorité pour vendre les produits IBIG (ERP, logiciels, solutions RH, formations) ? Donne des exemples concrets d'entreprises et des scripts adaptés.`,
        dynamic: true,
      },
      {
        icon: "💎",
        label: "Calculer mes gains potentiels",
        prompt: `J'ai actuellement ${"{salesMissing > 0 ? 'peu de' : 'plusieurs'}"} ventes et ${"{directMissing > 0 ? 'peu de' : 'plusieurs'}"} filleuls. Si je fais 5 ventes Scolaby ce mois et recrute 2 filleuls qui font 2 ventes chacun, calcule exactement mes commissions N1, N2 et l'impact sur mon statut.`,
        dynamic: true,
      },
    ],
  },
  {
    key: "redaction",
    label: "✍️ Rédaction",
    prompts: [
      {
        icon: "📧",
        label: "E-mail de suivi après démo",
        prompt: "Je viens de faire une démo Scolaby à un directeur d'école. Rédige un e-mail de suivi professionnel (max 10 lignes) pour remercier et pousser à la décision.",
      },
      {
        icon: "📝",
        label: "SMS de prospection court",
        prompt: "Rédige un SMS de prospection (max 160 caractères) pour proposer une démo de logiciel RH à un DRH.",
      },
      {
        icon: "💼",
        label: "Présentation LinkedIn courte",
        prompt: "Rédige une mise à jour de ma section 'À propos' LinkedIn qui met en avant mon rôle de partenaire IBIG et qui attire des prospects PME.",
      },
      {
        icon: "🔁",
        label: "Story WhatsApp — témoignage client",
        prompt: "Rédige un court texte de story WhatsApp (2-3 lignes max) racontant le succès d'un client fictif avec un produit IBIG, pour donner envie à mes contacts de s'informer.",
      },
      {
        icon: "📣",
        label: "Post Instagram/Facebook motivant",
        prompt: "Rédige un post Instagram/Facebook court (max 6 lignes) qui montre l'opportunité IBIG PARTNERS de façon authentique et motivante, sans être du spam. Je veux que mes amis posent des questions.",
      },
    ],
  },
];

export function CoachChat({
  partnerName, partnerStatus, partnerCity, partnerCode,
  salesCount, totalCommDisplay,
  directCount, activeCount, linksCount, networkTotal,
  nextStatusLabel, nextSalesMissing, nextDirectMissing,
}: Props) {
  const firstName = partnerName.split(" ")[0];
  const [activeCategory, setActiveCategory] = useState("vente");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Salut ${firstName} ! 👋 Je suis ton Coach IA personnel.\n\nJ'ai accès à ton profil (${salesCount} ventes confirmées, ${directCount} filleuls N1, statut ${partnerStatus}) pour te donner des conseils sur-mesure.\n\nChoisis un raccourci ou pose-moi ta question directement.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const resolvePrompt = (tpl: string) =>
    tpl
      .replace("{status}", partnerStatus)
      .replace("{salesMissing}", String(nextSalesMissing))
      .replace("{directMissing}", String(nextDirectMissing))
      .replace("{city}", partnerCity || "ma ville");

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
            ventes_confirmees: salesCount,
            commissions_totales: totalCommDisplay,
            filleuls_n1: directCount,
            filleuls_actifs: activeCount,
            reseau_total: networkTotal,
            liens_actifs: linksCount,
            prochain_statut: nextStatusLabel ?? "déjà au maximum",
            ventes_manquantes: nextSalesMissing,
            filleuls_manquants: nextDirectMissing,
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

  const currentCat = CATEGORIES.find((c) => c.key === activeCategory) ?? CATEGORIES[0];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      {/* ── Conversation ── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col h-[72vh] overflow-hidden">
        {/* Header chat */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-violet-50 to-blue-50 px-5 py-3 flex items-center gap-3 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-600 text-white shadow-md text-xl shrink-0">
            🤖
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 text-sm">Coach IBIG — IA personnalisée</p>
            <p className="text-xs text-emerald-600 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              En ligne · Adapté à ton profil
            </p>
          </div>
          <div className="text-right shrink-0 hidden sm:block">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Statut actuel</p>
            <p className="text-xs font-bold text-slate-700">{partnerStatus}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-xs shrink-0 mr-2 mt-0.5">
                  🤖
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line leading-relaxed ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-br-md"
                    : "bg-white text-slate-800 ring-1 ring-slate-200 rounded-bl-md shadow-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-xs shrink-0 mr-2 mt-0.5">🤖</div>
              <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 ring-1 ring-slate-200 shadow-sm">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-100 p-3 bg-white shrink-0">
          <div className="flex gap-2">
            <input
              data-testid="coach-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Posez n'importe quelle question à votre coach…"
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
            <button
              data-testid="coach-send"
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 transition"
            >
              {loading ? "…" : "Envoyer →"}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 px-1">Entrée pour envoyer · Le coach connaît votre profil et vos stats en temps réel</p>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <div className="space-y-3">

        {/* Contexte transmis */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">🔍 Contexte transmis au Coach</p>
          <div className="space-y-1.5">
            {[
              { label: "Statut",          value: partnerStatus },
              { label: "Ventes conf.",    value: String(salesCount) },
              { label: "Filleuls N1",     value: String(directCount) },
              { label: "Filleuls actifs", value: String(activeCount) },
              { label: "Réseau total",    value: String(networkTotal) },
              { label: "Liens actifs",    value: String(linksCount) },
              { label: "Commissions",     value: totalCommDisplay },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{label}</span>
                <span className="font-semibold text-slate-800">{value}</span>
              </div>
            ))}
          </div>
          {nextStatusLabel && (
            <div className="mt-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-3 py-2">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Prochain palier</p>
              <p className="text-xs font-semibold text-amber-900 mt-0.5">{nextStatusLabel}</p>
              <p className="text-[10px] text-amber-700 mt-0.5">
                {nextSalesMissing > 0 && `${nextSalesMissing} ventes manquantes`}
                {nextSalesMissing > 0 && nextDirectMissing > 0 && " · "}
                {nextDirectMissing > 0 && `${nextDirectMissing} filleuls manquants`}
                {nextSalesMissing === 0 && nextDirectMissing === 0 && "Objectifs atteints !"}
              </p>
            </div>
          )}
        </div>

        {/* Raccourcis catégorisés */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-50 flex overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`shrink-0 px-3 py-2.5 text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === cat.key
                    ? "border-b-2 border-blue-600 text-blue-700 bg-blue-50/50"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="p-3 space-y-1.5">
            {currentCat.prompts.map((q, i) => (
              <button
                key={i}
                data-testid={`quick-${i}`}
                onClick={() => send(resolvePrompt(q.prompt))}
                disabled={loading}
                className="w-full text-left rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 px-3 py-2.5 text-xs transition-all disabled:opacity-50"
              >
                <span className="text-base mr-1.5">{q.icon}</span>
                <span className="font-semibold text-slate-700">{q.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conseil contextuel */}
        <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-200 p-4">
          <p className="text-[10px] font-bold text-violet-700 uppercase tracking-wider mb-2">💡 Pour de meilleures réponses</p>
          <p className="text-xs text-violet-900 leading-relaxed">
            Précisez le <strong>secteur</strong> de votre prospect, le <strong>produit visé</strong> et ce qu&apos;il vous a dit. Plus le contexte est riche, plus le conseil est précis.
          </p>
        </div>

      </div>
    </div>
  );
}

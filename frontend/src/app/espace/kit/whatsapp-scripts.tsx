"use client";

import { useState } from "react";

interface AffiliateInfo {
  name: string;
  code: string;
  phone: string;
}

const SCRIPTS = [
  {
    category: "🚀 Première approche",
    color: "from-green-500 to-emerald-600",
    items: [
      {
        label: "Message générique — premier contact",
        text: (a: AffiliateInfo) =>
          `Bonjour [PRENOM] 👋

Je voulais te partager quelque chose qui m'a vraiment intéressé.

Je travaille avec IBIG PARTNERS, une plateforme qui propose des logiciels de gestion, des formations professionnelles et bien d'autres services pour les entreprises et particuliers.

J'ai pensé à toi car je sais que tu [RAISON - ex: gères une boutique / cherches à te former / travailles dans...].

Est-ce que tu as 5 minutes pour que je t'en parle ? Ou je peux t'envoyer plus d'infos si tu préfères.

— ${a.name} (Code partenaire : ${a.code})`,
      },
      {
        label: "Logiciel Scolaby — écoles & académies",
        text: (a: AffiliateInfo) =>
          `Bonjour [PRENOM] 👋

Tu gères une école, une académie ou un centre de formation ?

J'ai découvert *Scolaby*, un logiciel qui gère tout : inscriptions, notes, bulletins, absences, paiements des frais... tout en ligne, depuis ton téléphone.

Plus besoin de cahiers ou de tableaux Excel. Tout est centralisé et les parents peuvent suivre en temps réel.

Ça coûte seulement 10 000 FCFA/mois et la démo prend 10 minutes.

Tu veux que je t'arrange ça ? Je m'appelle ${a.name} (${a.code})`,
      },
      {
        label: "IBIG FactPro — TPE/PME facturation",
        text: (a: AffiliateInfo) =>
          `Bonjour [PRENOM] 👋

Tu fais encore tes factures à la main ou sur Word ?

*IBIG FactPro* c'est un logiciel simple pour créer des factures professionnelles en 2 clics, suivre tes paiements et gérer ta trésorerie.

À seulement 4 900 FCFA/mois — moins cher qu'un repas au restaurant.

Je t'envoie une démo gratuite si tu veux. ${a.name} (${a.code})`,
      },
      {
        label: "Formation IBIG EDUFORM",
        text: (a: AffiliateInfo) =>
          `Bonjour [PRENOM] 👋

Est-ce que tu cherches à te former en comptabilité, management, RH ou développement d'entreprise ?

IBIG EDUFORM propose des formations certifiantes animées par des experts. En présentiel ou à distance.

J'ai pensé à toi en voyant leur programme. Ça pourrait vraiment booster ta carrière ou ton business.

Tu veux que je t'envoie le catalogue ? — ${a.name} (${a.code})`,
      },
    ],
  },
  {
    category: "🔁 Relance & suivi",
    color: "from-blue-500 to-blue-700",
    items: [
      {
        label: "Relance après premier contact (sans réponse)",
        text: (a: AffiliateInfo) =>
          `Bonjour [PRENOM] 😊

Je me permets de te relancer suite à mon message de l'autre jour au sujet de [PRODUIT].

Je sais que tu es occupé(e), c'est tout à fait normal !

Si ça t'intéresse encore, je suis disponible pour une démo rapide de 10 minutes quand tu veux — même en soirée.

Dis-moi juste oui ou non, et je m'adapte 🙏

${a.name} — ${a.code}`,
      },
      {
        label: "Relance après démo (prospect qui réfléchit)",
        text: (a: AffiliateInfo) =>
          `Bonjour [PRENOM] 👋

Tu as eu le temps de réfléchir à ce qu'on s'est dit lors de notre démo ?

Je voulais juste te rappeler que l'offre est à [PRIX] et que la mise en place prend moins d'une journée.

Si tu as des questions ou des blocages, n'hésite pas — je suis là pour t'aider.

${a.name} (${a.code}) — Partenaire IBIG`,
      },
      {
        label: "Relance avec témoignage client",
        text: (a: AffiliateInfo) =>
          `Bonjour [PRENOM] 👋

Je pensais à toi en lisant le témoignage d'un client qui a adopté [PRODUIT] récemment.

Il me disait que ça lui a économisé [AVANTAGE - ex: 3h de travail par semaine / 50 000 FCFA/mois...].

Tu n'as pas encore sauté le pas, mais je pense que ça vaut vraiment le coup d'essayer.

Je t'offre une démo gratuite cette semaine si tu veux. Tu me dis ?

— ${a.name} (${a.code})`,
      },
    ],
  },
  {
    category: "👥 Recrutement filleuls",
    color: "from-violet-600 to-purple-700",
    items: [
      {
        label: "Recrutement — contact personnel",
        text: (a: AffiliateInfo) =>
          `Bonjour [PRENOM] 👋

Je voulais te parler d'une opportunité que je trouve vraiment sérieuse.

Je suis partenaire affilié chez IBIG — je recommande des logiciels et formations à des entreprises, et je touche une commission sur chaque vente. Sans investir un seul franc.

Le mois dernier j'ai gagné [MON GAIN] juste en partageant des liens et en parlant autour de moi.

C'est gratuit pour s'inscrire et tu peux commencer à gagner dès la première semaine.

Tu veux que je t'explique comment ça marche ? Mon code parrain : *${a.code}*`,
      },
      {
        label: "Recrutement — groupe WhatsApp",
        text: (a: AffiliateInfo) =>
          `Bonsoir à tous 👋

Je cherche des personnes sérieuses qui veulent un revenu complémentaire SANS investissement.

Je travaille avec *IBIG PARTNERS* — on recommande des logiciels et formations à des entreprises et on touche des commissions. C'est 100% légal, 0 franc d'inscription.

Conditions :
✅ Gratuit pour s'inscrire
✅ Commissions jusqu'à 20% par vente
✅ Réseau sur 3 niveaux
✅ Paiement via Orange Money / Wave

Si tu es intéressé(e), réponds à ce message ou contacte-moi en privé.

*${a.name}* · Code parrain : *${a.code}*`,
      },
      {
        label: "Réponse à la question « C'est un Ponzi ? »",
        text: (a: AffiliateInfo) =>
          `Bonne question, je comprends que tu sois méfiant(e) 👍

Non, ce n'est pas un Ponzi ni une pyramide. Voici pourquoi :

1️⃣ *Inscription gratuite* — tu ne dépenses rien
2️⃣ *Produits réels* — des logiciels (Scolaby, FactPro...) et des formations que tu peux toi-même tester
3️⃣ *Paiement uniquement sur des ventes réelles* — si personne ne vend rien, personne n'est payé
4️⃣ *Société enregistrée* — IBIG SARL existe légalement en Côte d'Ivoire

C'est exactement le même modèle qu'Amazon Associates ou Jumia Affiliates.

Tu peux visiter ibigsoft.com pour voir les produits par toi-même.

Des questions ? Je suis là — ${a.name} (${a.code})`,
      },
    ],
  },
  {
    category: "⚡ Clôture & conversion",
    color: "from-amber-500 to-orange-600",
    items: [
      {
        label: "Créer l'urgence (offre limitée)",
        text: (a: AffiliateInfo) =>
          `Bonjour [PRENOM] 👋

Je voulais te prévenir : [PRODUIT] a une offre spéciale en ce moment qui se termine [DATE].

Si tu souscris cette semaine, tu bénéficies de [AVANTAGE - ex: premier mois offert / installation gratuite / remise].

Je ne voudrais pas que tu rates ça. Tu veux qu'on finalise maintenant ?

— ${a.name}, Partenaire IBIG (${a.code})`,
      },
      {
        label: "Lever l'objection « c'est cher »",
        text: (a: AffiliateInfo) =>
          `Je comprends tout à fait [PRENOM] 😊

Voici comment je vois les choses :

[PRODUIT] coûte [PRIX]/mois.

Mais combien tu perds chaque mois à cause de [PROBLEME - ex: mauvaise gestion / factures manuelles / temps perdu] ?

Souvent, le logiciel est rentabilisé dès le premier mois.

Et si ça ne te convient pas après 30 jours, tu n'es pas engagé(e) sur le long terme.

Tu veux qu'on essaie un mois pour voir ?

${a.name} (${a.code})`,
      },
    ],
  },
];

function ScriptCard({
  label,
  text,
  affiliate,
}: {
  label: string;
  text: (a: AffiliateInfo) => string;
  affiliate: AffiliateInfo;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const content = text(affiliate);

  function handleCopy() {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50/60 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-800">{label}</span>
        <span className={`text-slate-400 text-xs transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>▼</span>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{content}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
                copied
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : "bg-slate-800 text-white hover:bg-slate-900"
              }`}
            >
              {copied ? "✓ Copié !" : "📋 Copier le message"}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(content)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-bold text-green-700 hover:bg-green-100 transition"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WhatsappScripts({ affiliate }: { affiliate: AffiliateInfo }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-4 text-white flex items-start gap-3">
        <span className="text-2xl shrink-0">📱</span>
        <div>
          <p className="font-extrabold text-base">Scripts WhatsApp prêts à envoyer</p>
          <p className="text-sm text-green-100 mt-0.5">
            Messages personnalisés avec votre nom <strong className="text-white">{affiliate.name}</strong> et votre code <strong className="text-white font-mono">{affiliate.code}</strong>. Cliquez, copiez, envoyez.
          </p>
          <p className="text-xs text-green-200 mt-1.5">
            💡 Remplacez les parties entre [CROCHETS] par les infos de votre prospect avant d'envoyer.
          </p>
        </div>
      </div>

      {SCRIPTS.map((cat) => (
        <div key={cat.category} className="space-y-2">
          <div className={`rounded-xl bg-gradient-to-r ${cat.color} px-4 py-2.5`}>
            <p className="font-bold text-white text-sm">{cat.category}</p>
          </div>
          {cat.items.map((item) => (
            <ScriptCard
              key={item.label}
              label={item.label}
              text={item.text}
              affiliate={affiliate}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

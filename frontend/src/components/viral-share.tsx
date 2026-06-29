"use client";
import { useState } from "react";

/**
 * Partage VIRAL 1-clic — WhatsApp / FB / IG / Telegram + Copie message optimisé.
 * Place ce composant dans /espace/liens et /espace/produits.
 * Multiplie par 3-5 le partage spontané des affiliés.
 */

interface Props {
  productName: string;
  affiliateCode: string;
  partnerName: string;
  baseUrl?: string;
  pricingType?: string;
  price?: number;
}

export function ViralShare({
  productName,
  affiliateCode,
  partnerName,
  baseUrl = "https://ibig-affiliate-boost.preview.emergentagent.com",
  pricingType = "PRODUCT",
  price,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [showCustom, setShowCustom] = useState(false);

  const link = `${baseUrl}/aff/${affiliateCode}`;

  // Génération message optimisé conversion par produit
  const messages = generateMessages({ productName, link, partnerName, pricingType, price });
  const [activeMsg, setActiveMsg] = useState(0);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const share = (platform: "whatsapp" | "facebook" | "telegram" | "twitter" | "instagram") => {
    const msg = encodeURIComponent(messages[activeMsg].text);
    const url = encodeURIComponent(link);
    let shareUrl = "";

    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${msg}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${msg}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${url}&text=${msg}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${msg}&url=${url}`;
        break;
      case "instagram":
        // IG ne supporte pas le partage URL ; on copie au presse-papier
        navigator.clipboard.writeText(messages[activeMsg].text);
        alert("Message copié ! Collez-le dans Instagram (Story, DM ou bio).");
        return;
    }
    window.open(shareUrl, "_blank", "width=600,height=600");
  };

  return (
    <div
      data-testid="viral-share"
      className="rounded-2xl border border-brand-100 bg-gradient-to-br from-white to-brand-50/30 p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          <div>
            <h3 className="font-bold text-ink">Partager &amp; gagner</h3>
            <p className="text-xs text-muted">Message optimisé conversion</p>
          </div>
        </div>
      </div>

      {/* Sélecteur de message */}
      <div className="mb-3 flex gap-2 flex-wrap">
        {messages.map((m, i) => (
          <button
            key={i}
            data-testid={`msg-tab-${i}`}
            onClick={() => setActiveMsg(i)}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeMsg === i
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {m.tone}
          </button>
        ))}
      </div>

      {/* Aperçu du message */}
      <div className="mb-4 rounded-xl bg-white p-4 ring-1 ring-slate-100 text-sm text-slate-700 whitespace-pre-line">
        {messages[activeMsg].text}
      </div>

      {/* Boutons partage */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        <ShareBtn
          testid="share-whatsapp"
          onClick={() => share("whatsapp")}
          bg="bg-[#25D366] hover:bg-[#1ebd5a]"
          label="WhatsApp"
          icon={<WhatsappIcon />}
        />
        <ShareBtn
          testid="share-facebook"
          onClick={() => share("facebook")}
          bg="bg-[#1877F2] hover:bg-[#1565d8]"
          label="Facebook"
          icon={<span className="font-extrabold text-lg">f</span>}
        />
        <ShareBtn
          testid="share-telegram"
          onClick={() => share("telegram")}
          bg="bg-[#0088cc] hover:bg-[#0077b5]"
          label="Telegram"
          icon={<TelegramIcon />}
        />
        <ShareBtn
          testid="share-twitter"
          onClick={() => share("twitter")}
          bg="bg-slate-800 hover:bg-slate-900"
          label="X"
          icon={<span className="font-extrabold">𝕏</span>}
        />
        <ShareBtn
          testid="share-instagram"
          onClick={() => share("instagram")}
          bg="bg-gradient-to-br from-amber-500 via-pink-500 to-violet-600 hover:opacity-90"
          label="Instagram"
          icon={<span className="text-base">📷</span>}
        />
      </div>

      {/* Copier le lien */}
      <div className="flex gap-2">
        <input
          data-testid="affiliate-link"
          value={link}
          readOnly
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 font-mono"
        />
        <button
          data-testid="copy-link"
          onClick={() => copy(link)}
          className="rounded-lg bg-brand-600 hover:bg-brand-700 px-4 py-2 text-xs font-bold text-white transition-colors"
        >
          {copied ? "✓ Copié" : "📋 Copier"}
        </button>
      </div>

      {/* Bouton custom IA */}
      <button
        data-testid="generate-ia"
        onClick={() => setShowCustom(!showCustom)}
        className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-brand-300 px-4 py-2.5 text-xs font-bold text-brand-700 hover:bg-brand-50 transition-colors"
      >
        ✨ Générer un message personnalisé avec l&apos;IA
      </button>
      {showCustom && (
        <p className="mt-2 text-xs text-muted text-center">
          → Disponible dans <a href="/espace/coach" className="text-brand-600 font-semibold underline">Coach IA</a>
        </p>
      )}
    </div>
  );
}

function ShareBtn({
  onClick,
  bg,
  icon,
  label,
  testid,
}: {
  onClick: () => void;
  bg: string;
  icon: React.ReactNode;
  label: string;
  testid: string;
}) {
  return (
    <button
      data-testid={testid}
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-xl ${bg} px-2 py-3 text-white shadow-sm transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-md`}
    >
      <span className="flex h-6 w-6 items-center justify-center">{icon}</span>
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

function WhatsappIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
    </svg>
  );
}

function generateMessages({
  productName,
  link,
  partnerName,
  pricingType,
  price,
}: {
  productName: string;
  link: string;
  partnerName: string;
  pricingType: string;
  price?: number;
}) {
  const priceStr = price ? `${price.toLocaleString("fr-FR")} FCFA` : "";

  return [
    {
      tone: "💼 Pro",
      text: `Bonjour,

Je vous présente ${productName}${priceStr ? ` (${priceStr})` : ""} — une solution efficace que j'utilise et recommande personnellement.

Avantages clés :
✓ Adapté au contexte africain
✓ Support client réactif
✓ Mise en place rapide

Découvrir : ${link}

À votre disposition pour toute question.
${partnerName}`,
    },
    {
      tone: "🔥 Convaincant",
      text: `🚀 Découvrez ${productName} !

${pricingType === "MONTHLY_SUB" ? "Un abonnement abordable qui change tout." : "Une opportunité à ne pas manquer."}

✅ Testé et approuvé
✅ Résultats concrets
✅ Service client 24/7
${priceStr ? `💰 À partir de ${priceStr}\n` : ""}
👉 ${link}

— ${partnerName}`,
    },
    {
      tone: "❤️ Personnel",
      text: `Salut !

J'utilise ${productName} depuis quelque temps et franchement c'est top. Je voulais te le partager car je pense que ça peut t'intéresser aussi.

${priceStr ? `Tarif : ${priceStr}\n` : ""}Lien direct : ${link}

Dis-moi ce que tu en penses 😊
${partnerName}`,
    },
  ];
}

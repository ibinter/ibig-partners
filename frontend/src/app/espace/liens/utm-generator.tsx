"use client";

import { useState } from "react";

const UTM_SOURCES = ["whatsapp", "facebook", "instagram", "linkedin", "email", "sms", "autre"];
const UTM_MEDIUMS = ["social", "direct", "email", "referral", "cpc", "autre"];
const UTM_CAMPAIGNS = ["lancement", "promo", "recrutement", "suivi", "relance", "partenariat"];

type LinkCard = { productName: string; url: string };

export default function UtmGenerator({ links }: { links: LinkCard[] }) {
  const [selectedUrl, setSelectedUrl] = useState(links[0]?.url ?? "");
  const [source,   setSource]   = useState("whatsapp");
  const [medium,   setMedium]   = useState("social");
  const [campaign, setCampaign] = useState("lancement");
  const [term,     setTerm]     = useState("");
  const [copied,   setCopied]   = useState(false);

  function buildUrl() {
    if (!selectedUrl) return "";
    const params = new URLSearchParams();
    params.set("utm_source",   source);
    params.set("utm_medium",   medium);
    params.set("utm_campaign", campaign);
    if (term.trim()) params.set("utm_term", term.trim());
    return `${selectedUrl}?${params.toString()}`;
  }

  const utmUrl = buildUrl();

  async function copy() {
    try { await navigator.clipboard.writeText(utmUrl); } catch { }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (links.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-slate-800 text-sm mb-4">🔗 Générateur de liens UTM</h3>
      <p className="text-xs text-slate-500 mb-4">Trackez l'origine de vos visiteurs en ajoutant des paramètres UTM à vos liens d'affiliation.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Produit</label>
          <select
            value={selectedUrl}
            onChange={(e) => setSelectedUrl(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {links.map((l) => (
              <option key={l.url} value={l.url}>{l.productName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Source (utm_source)</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {UTM_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Médium (utm_medium)</label>
          <select
            value={medium}
            onChange={(e) => setMedium(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {UTM_MEDIUMS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Campagne (utm_campaign)</label>
          <select
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {UTM_CAMPAIGNS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Mot-clé optionnel (utm_term)</label>
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="ex: promo_juillet"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 flex items-start gap-3">
        <p className="flex-1 text-xs font-mono text-slate-700 break-all">{utmUrl}</p>
        <button
          onClick={copy}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
            copied ? "bg-emerald-100 text-emerald-700" : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {copied ? "✓ Copié !" : "Copier"}
        </button>
      </div>
    </div>
  );
}

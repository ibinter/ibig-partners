"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Formation = {
  id: number;
  titre: string;
  slug: string;
  url: string;
  domaine: string;
  type: string;
  duree: string;
  pitch: string;
  image: string | null;
  date_debut: string | null;
  tarif_en_ligne: number | null;
  tarif_presentiel: number | null;
  frais_inscription: number;
};

const DOMAIN_EMOJIS: Record<string, string> = {
  "Comptabilité & Finance": "💰",
  "Comptabilité": "📒",
  "Fiscalité": "🏛️",
  "Droit Social": "⚖️",
  "RH & Paie": "👥",
  "Gestion de Projet": "📋",
  "QHSE": "🛡️",
  "Contrôle de Gestion": "📊",
  "Logiciels de Gestion (Sage)": "💻",
  "Logiciels de Gestion (SAP)": "🖥️",
  "Commerce & Marketing": "📣",
  "Communication": "📡",
  "Intelligence Artificielle": "🤖",
  "Management": "🎯",
  "Immobilier": "🏠",
  "Logistique & SCM": "🚚",
  "Design & Communication": "🎨",
  "Humanitaire & ONG": "🌍",
  "Finance & Direction": "📈",
  "Entrepreneuriat": "🚀",
};

function fmtFcfa(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M FCFA`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k FCFA`;
  return `${n} FCFA`;
}

function fmtDate(d: string | null) {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return null;
  }
}

function buildFormationUrl(baseUrl: string, affiliateRef: string | null): string {
  if (!affiliateRef) return baseUrl;
  try {
    const url = new URL(baseUrl);
    url.searchParams.set("ibig_ref", affiliateRef);
    return url.toString();
  } catch {
    const sep = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${sep}ibig_ref=${encodeURIComponent(affiliateRef)}`;
  }
}

export function FormationCards({ formations }: { formations: Formation[] }) {
  const searchParams = useSearchParams();
  const [affiliateRef, setAffiliateRef] = useState<string | null>(null);

  useEffect(() => {
    // 1. Priorité : ref dans l'URL courante
    const urlRef = searchParams.get("ref");
    if (urlRef && /^[A-Z0-9\-]{4,30}$/i.test(urlRef)) {
      setAffiliateRef(urlRef);
      // Persiste pour les clics futurs
      try {
        localStorage.setItem("ibig_affiliate_ref", urlRef);
        localStorage.setItem("ibig_affiliate_ref_at", Date.now().toString());
      } catch { /* ignore */ }
      return;
    }
    // 2. Fallback : ref stocké en localStorage (valide 30 jours)
    try {
      const stored = localStorage.getItem("ibig_affiliate_ref");
      const storedAt = parseInt(localStorage.getItem("ibig_affiliate_ref_at") ?? "0", 10);
      if (stored && Date.now() - storedAt < 30 * 24 * 60 * 60 * 1000) {
        setAffiliateRef(stored);
      }
    } catch { /* ignore */ }
  }, [searchParams]);

  const domains = [...new Set(formations.map((f) => f.domaine))].sort();

  if (formations.length === 0) {
    return (
      <div className="text-center py-20 text-muted">
        <p className="text-4xl mb-4">📚</p>
        <p className="font-semibold">Catalogue temporairement indisponible</p>
        <p className="text-sm mt-2">
          Réessayez dans quelques instants ou visitez{" "}
          <a href="https://ibig-eduform.com" target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">
            ibig-eduform.com
          </a>
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Filtre domaines */}
      <div className="flex flex-wrap gap-2 mb-8">
        {domains.map((d) => (
          <span key={d} className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-medium text-ink shadow-sm">
            {DOMAIN_EMOJIS[d] ?? "📚"} {d}
          </span>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {formations.map((f) => (
          <a
            key={f.id}
            href={buildFormationUrl(f.url, affiliateRef)}
            target="_blank"
            rel="noopener noreferrer"
            className="card-premium group flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            {f.image && (
              <div className="aspect-video overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.image}
                  alt={f.titre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            )}
            <div className="flex flex-col flex-1 p-5">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-700 px-2.5 py-0.5 text-xs font-semibold">
                  {DOMAIN_EMOJIS[f.domaine] ?? "📚"} {f.domaine}
                </span>
                {f.type === "Samedi Pro" && (
                  <span className="inline-flex rounded-full bg-amber-50 text-amber-700 px-2.5 py-0.5 text-xs font-semibold">
                    📅 Samedi Pro
                  </span>
                )}
                {f.duree && (
                  <span className="inline-flex rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-xs font-medium">
                    ⏱ {f.duree}
                  </span>
                )}
              </div>

              <h2 className="font-extrabold text-ink text-base leading-snug mb-2 group-hover:text-brand-600 transition-colors">
                {f.titre}
              </h2>

              {f.pitch && (
                <p className="text-xs text-muted leading-relaxed mb-3 line-clamp-2">{f.pitch}</p>
              )}

              <div className="mt-auto space-y-1.5">
                {fmtDate(f.date_debut) && (
                  <div className="text-xs text-muted flex items-center gap-1">
                    <span>📅</span> Début : <span className="font-medium text-ink">{fmtDate(f.date_debut)}</span>
                  </div>
                )}
                {f.tarif_en_ligne && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">Tarif individuel</span>
                    <span className="font-extrabold text-brand-700 text-numeral">{fmtFcfa(f.tarif_en_ligne)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-xs text-emerald-600 font-semibold">
                    ✅ Commission : {f.tarif_en_ligne ? fmtFcfa(Math.round(f.tarif_en_ligne * 0.1)) : "10%"}
                  </span>
                  <span className="text-xs font-bold text-brand-600 group-hover:underline">Voir →</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}

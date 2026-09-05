import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const dynamic = "force-dynamic";
export const revalidate = 900; // 15 min

export const metadata: Metadata = {
  title: "Formations Certifiantes IBIG EDUFORM — Gagnez des commissions",
  description:
    "Promouvez les 24 formations certifiantes IBIG EDUFORM et gagnez 10% de commission. Comptabilité, Fiscalité, RH, Digital, Management, IA et plus — certifications reconnues en Afrique.",
  keywords: [
    "formations certifiantes Côte d'Ivoire", "IBIG EDUFORM affiliation", "commission formation professionnelle Afrique",
    "formation comptabilité Abidjan", "formation management Côte d'Ivoire", "certification professionnelle Afrique",
    "formation RH paie Abidjan", "formation intelligence artificielle Afrique",
  ],
  alternates: { canonical: "/formations" },
  openGraph: {
    title: "Formations IBIG EDUFORM — Promouvez & Gagnez 10% de commission",
    description: "24 formations certifiantes à promouvoir via IBIG PARTNERS. Commission 10% N1 sur chaque inscription confirmée.",
    url: "/formations",
  },
};

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

async function getFormations(): Promise<Formation[]> {
  try {
    const res = await fetch("https://ibig-eduform.com/api/formations.php", {
      next: { revalidate: 900 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.formations) ? data.formations : [];
  } catch {
    return [];
  }
}

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

export default async function FormationsPage() {
  const formations = await getFormations();
  const domains = [...new Set(formations.map((f) => f.domaine))].sort();

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 py-16 text-white text-center px-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-gold-300 mb-4">
            🎓 IBIG EDUFORM × IBIG PARTNERS
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Formations Certifiantes
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-brand-100 text-lg">
            Promouvez les {formations.length || "24"}+ formations certifiantes IBIG EDUFORM et gagnez{" "}
            <strong className="text-gold-300">10% de commission</strong> sur chaque inscription confirmée.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
              <span className="text-2xl">🎓</span>
              <div className="text-left">
                <div className="font-bold">{formations.length || "24"}+ formations</div>
                <div className="text-brand-200 text-xs">certifiantes actives</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
              <span className="text-2xl">💰</span>
              <div className="text-left">
                <div className="font-bold">10% N1 · 5% N2 · 2% N3</div>
                <div className="text-brand-200 text-xs">commission par inscription</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
              <span className="text-2xl">📍</span>
              <div className="text-left">
                <div className="font-bold">Abidjan & En ligne</div>
                <div className="text-brand-200 text-xs">présentiel + e-learning</div>
              </div>
            </div>
          </div>
        </section>

        {/* Catalogue */}
        <section className="py-12 px-4 bg-slate-50">
          <div className="mx-auto max-w-7xl">
            {formations.length === 0 ? (
              <div className="text-center py-20 text-muted">
                <p className="text-4xl mb-4">📚</p>
                <p className="font-semibold">Catalogue temporairement indisponible</p>
                <p className="text-sm mt-2">Réessayez dans quelques instants ou visitez{" "}
                  <a href="https://ibig-eduform.com" target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">ibig-eduform.com</a>
                </p>
              </div>
            ) : (
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
                      href={f.url}
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
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-brand-700 to-brand-900 py-14 text-center text-white px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Prêt à promouvoir ces formations ?</h2>
          <p className="text-brand-100 max-w-xl mx-auto mb-8">
            Créez votre compte partenaire gratuitement et commencez à partager vos liens d'affiliation EDUFORM dès aujourd'hui.
          </p>
          <Link
            href="/rejoindre"
            className="inline-flex items-center gap-2 rounded-xl bg-gold-400 px-8 py-3.5 font-extrabold text-brand-900 shadow-xl hover:-translate-y-0.5 hover:bg-gold-300 transition-all"
          >
            🚀 Rejoindre gratuitement
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

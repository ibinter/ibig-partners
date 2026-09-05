import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { FormationCards } from "@/components/formation-cards";

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
            <Suspense fallback={
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="card-premium h-64 animate-pulse bg-slate-100 rounded-2xl" />
                ))}
              </div>
            }>
              <FormationCards formations={formations} />
            </Suspense>
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

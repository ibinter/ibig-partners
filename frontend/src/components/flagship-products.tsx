"use client";

import { ScrollReveal } from "@/components/scroll-reveal";

const fcfa = (n: number) =>
  n.toLocaleString("fr-FR") + " FCFA";

const FLAGSHIP = [
  {
    branch: "IBIG IMMO TRUST",
    branchColor: "bg-violet-50 text-violet-700",
    barColor: "from-violet-500 to-purple-700",
    emoji: "🏠",
    products: [
      { name: "Mandat de Vente Immobilière", target: "Propriétaires, agences", price: 2000000, gain: 100000 },
      { name: "BTP — Construction Clé en Main", target: "Particuliers, promoteurs", price: 5000000, gain: 250000 },
      { name: "Promotion Immobilière (VEFA)", target: "Investisseurs, diaspora", price: 8000000, gain: 400000 },
    ],
  },
  {
    branch: "IBIG EDUFORM",
    branchColor: "bg-amber-50 text-amber-700",
    barColor: "from-amber-500 to-orange-600",
    emoji: "🎓",
    products: [
      { name: "MBA Accéléré (500h)", target: "Cadres, entrepreneurs", price: 500000, gain: 50000 },
      { name: "Formation Dev Web Full Stack", target: "Jeunes, techniciens", price: 200000, gain: 20000 },
      { name: "BTP & Génie Civil", target: "BTP, conducteurs travaux", price: 220000, gain: 22000 },
    ],
  },
  {
    branch: "IBIG DIGITAL",
    branchColor: "bg-indigo-50 text-indigo-700",
    barColor: "from-indigo-500 to-blue-700",
    emoji: "🚀",
    products: [
      { name: "Pack Commerce en Ligne", target: "Boutiques, PME", price: 850000, gain: 85000 },
      { name: "Pack Digital 360°", target: "Toutes entreprises", price: 1250000, gain: 125000 },
      { name: "Application Android + iOS", target: "Startups, entreprises", price: 1500000, gain: 150000 },
    ],
  },
  {
    branch: "IBIG MARKET",
    branchColor: "bg-emerald-50 text-emerald-700",
    barColor: "from-emerald-500 to-teal-600",
    emoji: "🛍️",
    products: [
      { name: "Kits Énergie Solaire", target: "Particuliers, PME", price: 400000, gain: 32000 },
      { name: "Matériel Médical & Paramédical", target: "Cliniques, pharmacies", price: 300000, gain: 24000 },
      { name: "Matériel Audiovisuel", target: "Écoles, salle de conférence", price: 200000, gain: 16000 },
    ],
  },
  {
    branch: "IBIG CONSEIL+",
    branchColor: "bg-orange-50 text-orange-700",
    barColor: "from-orange-500 to-red-600",
    emoji: "📊",
    products: [
      { name: "Certification ISO (Accompagnement)", target: "PME, industries", price: 800000, gain: 80000 },
      { name: "Audit Organisationnel", target: "Entreprises, ONG", price: 500000, gain: 50000 },
      { name: "Comptabilité Externalisée", target: "TPE, PME", price: 80000, gain: 8000, per: "/mois" },
    ],
  },
  {
    branch: "IBIG EMPLOI & TALENTS",
    branchColor: "bg-slate-100 text-slate-700",
    barColor: "from-slate-600 to-slate-800",
    emoji: "🤝",
    products: [
      { name: "Mission de Recrutement CDI", target: "Entreprises, DRH", price: 300000, gain: 30000 },
      { name: "Externalisation RH Complète", target: "PME sans DRH", price: 200000, gain: 20000, per: "/mois" },
      { name: "Placement de Profils Qualifiés", target: "BTP, IT, finance", price: 200000, gain: 20000 },
    ],
  },
];

export function FlagshipProducts() {
  return (
    <section id="produits-phares" className="bg-white py-16 sm:py-20 lg:py-24 scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-12">
            <span className="label-caps inline-block rounded-full bg-brand-50 px-4 py-1.5 text-brand-600">
              Produits phares à promouvoir
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
              Ce que vous vendez — concret et rémunérateur
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted">
              Chaque produit est réel, livrable et déjà utilisé par des clients. Voici ce que vaut votre commission dès la première vente.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {FLAGSHIP.map((branch, bi) => (
            <ScrollReveal key={branch.branch} animation="fade-up" delay={bi * 80}>
              <div className="flex flex-col rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden h-full">
                {/* Header */}
                <div className={`bg-gradient-to-r ${branch.barColor} px-5 py-4`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{branch.emoji}</span>
                    <span className="font-extrabold text-white text-sm">{branch.branch}</span>
                  </div>
                </div>

                {/* Products */}
                <div className="flex flex-col flex-1 divide-y divide-slate-50 p-1">
                  {branch.products.map((p) => (
                    <div key={p.name} className="flex items-start gap-3 px-4 py-3.5">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-ink text-sm leading-snug">{p.name}</p>
                        <p className="text-xs text-muted mt-0.5">Cible : {p.target}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Prix : {fcfa(p.price)}{p.per ?? ""}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-muted font-medium">Votre gain</p>
                        <p className="font-extrabold text-emerald-600 text-sm">{fcfa(p.gain)}</p>
                        {p.per && <p className="text-[10px] text-slate-400">{p.per}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer chip */}
                <div className={`px-5 py-3 ${branch.branchColor} text-center`}>
                  <span className="text-xs font-bold">
                    Commission jusqu&apos;à {Math.round((branch.products[0].gain / branch.products[0].price) * 100)}% N1
                  </span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="/rejoindre"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-4 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-brand-700"
          >
            Choisir mes produits et commencer →
          </a>
          <p className="mt-3 text-xs text-muted">
            Accès à tous les produits dès l&apos;inscription · Gratuit · Sans stock
          </p>
        </div>
      </div>
    </section>
  );
}

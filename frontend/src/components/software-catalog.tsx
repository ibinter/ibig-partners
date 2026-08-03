"use client";

import { Icon, type IconName } from "@/components/icons";
import { ScrollReveal } from "@/components/scroll-reveal";
import Link from "next/link";

interface Software {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  icon: IconName;
  color: string;
  chipColor: string;
  price: string;
  commission: string;
  features: string[];
  siteUrl?: string;
}

const SOFTWARES: Software[] = [
  {
    name: "SCOLABY",
    slug: "scolaby",
    tagline: "Gestion Scolaire",
    description: "Plateforme complète pour la gestion des établissements scolaires : inscriptions, notes, emploi du temps, bulletins et communication parents.",
    icon: "graduation",
    color: "from-brand-500 to-brand-700",
    chipColor: "bg-brand-50 text-brand-700",
    price: "10 000 FCFA/mois",
    commission: "20% N1 (mois 1, dégressif)",
    features: ["Gestion des élèves", "Bulletins automatisés", "Paiement scolarité", "App parents"],
    siteUrl: "https://scolaby.com",
  },
  {
    name: "ZELIVRY",
    slug: "zelivry",
    tagline: "Gestion de Livraison",
    description: "Solution de gestion de livraison et de logistique du dernier kilomètre. Suivi en temps réel, optimisation des tournées et notifications clients.",
    icon: "rocket",
    color: "from-emerald-500 to-teal-600",
    chipColor: "bg-emerald-50 text-emerald-700",
    price: "4 900 FCFA/mois",
    commission: "20% N1 (mois 1, dégressif)",
    features: ["Suivi temps réel", "Optimisation tournées", "Notifications SMS", "Gestion livreurs"],
    siteUrl: "https://zelivry.com",
  },
  {
    name: "STOCKFLOW",
    slug: "stockflow",
    tagline: "ERP & Gestion de Stock",
    description: "ERP complet avec gestion de stock, facturation, comptabilité et tableaux de bord. Conçu pour les PME africaines.",
    icon: "layers",
    color: "from-violet-500 to-purple-700",
    chipColor: "bg-violet-50 text-violet-700",
    price: "5 000 FCFA/mois",
    commission: "20% N1 (mois 1, dégressif)",
    features: ["Gestion de stock", "Facturation", "Comptabilité", "Rapports avancés"],
    siteUrl: "https://stockflow.ibigsoft.com",
  },
  {
    name: "LOKATIVO",
    slug: "lokativo",
    tagline: "Gestion Immobilière",
    description: "Plateforme de gestion immobilière : annonces, visites, contrats de bail, quittances et suivi des loyers impayés.",
    icon: "home",
    color: "from-amber-500 to-orange-600",
    chipColor: "bg-amber-50 text-amber-700",
    price: "9 900 FCFA/mois",
    commission: "20% N1 (mois 1, dégressif)",
    features: ["Annonces immobilières", "Gestion baux", "Quittances auto", "Suivi impayés"],
    siteUrl: "https://lokativo.com",
  },
  {
    name: "GESCOMXEL",
    slug: "gescomxel",
    tagline: "Gestion Commerciale",
    description: "Logiciel de gestion commerciale intégré : devis, bons de commande, livraison, facturation et suivi clients.",
    icon: "chart",
    color: "from-indigo-500 to-blue-700",
    chipColor: "bg-indigo-50 text-indigo-700",
    price: "5 000 FCFA/mois",
    commission: "20% N1 (mois 1, dégressif)",
    features: ["Devis & factures", "Gestion clients", "Suivi commercial", "Statistiques ventes"],
    siteUrl: "https://ibigsoft.com/gescomxel.php",
  },
  {
    name: "IBIG FLEET 360",
    slug: "ibig-fleet-360",
    tagline: "Gestion de Flotte",
    description: "Solution complète de gestion de flotte automobile : GPS, maintenance, consommation carburant, assurances et alertes.",
    icon: "cpu",
    color: "from-rose-500 to-pink-600",
    chipColor: "bg-rose-50 text-rose-700",
    price: "19 900 FCFA/mois",
    commission: "20% N1 (mois 1, dégressif)",
    features: ["Tracking GPS", "Maintenance préventive", "Conso carburant", "Alertes temps réel"],
    siteUrl: "https://ibigfleet360.com",
  },
  {
    name: "CONSTRUIRO ERP",
    slug: "construiro",
    tagline: "ERP BTP & Construction",
    description: "ERP tout-en-un du bâtiment : projets et chantiers, devis & métrés, RH/paie, matériaux, engins, finance et reporting — pensé pour le BTP africain.",
    icon: "building",
    color: "from-orange-500 to-red-600",
    chipColor: "bg-orange-50 text-orange-700",
    price: "15 000 FCFA/mois",
    commission: "20% N1 (mois 1, dégressif)",
    features: ["Gestion de chantiers", "Devis & métrés (DQE)", "RH & paie BTP", "Matériaux & engins"],
    siteUrl: "https://construiro.com",
  },
  {
    name: "SANTAREX ERP",
    slug: "santarex",
    tagline: "Gestion Hospitalière",
    description: "Plateforme SaaS de gestion hospitalière multi-tenant : dossiers patients (DME), consultations, pharmacie, laboratoire, hospitalisation et facturation.",
    icon: "shield",
    color: "from-red-500 to-rose-600",
    chipColor: "bg-red-50 text-red-700",
    price: "12 000 FCFA/mois",
    commission: "20% N1 (mois 1, dégressif)",
    features: ["Dossier patient (DME)", "Pharmacie & labo", "Hospitalisation", "Facturation & BI"],
    siteUrl: "https://santarex.ibigsoft.com",
  },
  {
    name: "AGRIFRIK",
    slug: "agrifrik",
    tagline: "ERP Agricole",
    description: "ERP agricole pour l'Afrique subsaharienne : cultures, élevage, pisciculture, stocks & intrants, exportation, comptabilité SYSCOHADA et IA agronomique.",
    icon: "globe",
    color: "from-green-500 to-emerald-600",
    chipColor: "bg-green-50 text-green-700",
    price: "6 500 FCFA/mois",
    commission: "20% N1 (mois 1, dégressif)",
    features: ["Cultures & élevage", "Stocks & intrants", "Compta SYSCOHADA", "IA agronomique ARIA"],
    siteUrl: "https://agrifrik.ibigsoft.com",
  },
  {
    name: "GESTMONEY",
    slug: "gestmoney",
    tagline: "Réseaux Mobile Money",
    description: "Plateforme cloud de gestion des réseaux Mobile Money (Orange Money, MTN MoMo, Wave, Moov) : transactions, float, commissions, KYC et comptabilité OHADA.",
    icon: "wallet",
    color: "from-cyan-500 to-sky-600",
    chipColor: "bg-cyan-50 text-cyan-700",
    price: "9 900 FCFA/mois",
    commission: "20% N1 (mois 1, dégressif)",
    features: ["Transactions & float", "Commissions auto", "KYC clients", "Comptabilité OHADA"],
    siteUrl: "https://gestmoney.ibigsoft.com",
  },
  {
    name: "ANOUANZÊ ERP",
    slug: "anouanze",
    tagline: "Associations & ONG",
    description: "ERP dédié aux associations, ONG et organisations à but non lucratif : membres, cotisations, dons, projets MEAL, partenaires et comptabilité SYCEBNL.",
    icon: "handshake",
    color: "from-fuchsia-500 to-pink-600",
    chipColor: "bg-fuchsia-50 text-fuchsia-700",
    price: "12 900 FCFA/mois",
    commission: "20% N1 (mois 1, dégressif)",
    features: ["Membres & cotisations", "Dons & projets MEAL", "Compta SYCEBNL", "Événements"],
    siteUrl: "https://anouanze.ibigsoft.com",
  },
  {
    name: "IBIG FACTPRO",
    slug: "factpro",
    tagline: "Facturation Pro",
    description: "Logiciel de facturation SaaS conforme OHADA : devis, factures, avoirs, acomptes, factures récurrentes, caisse POS et QR anti-falsification. Multi-devises.",
    icon: "card",
    color: "from-blue-500 to-indigo-600",
    chipColor: "bg-blue-50 text-blue-700",
    price: "4 900 FCFA/mois",
    commission: "20% N1 (mois 1, dégressif)",
    features: ["Devis & factures", "QR anti-falsification", "Caisse POS", "Multi-devises"],
    siteUrl: "https://factpro.ibigsoft.com",
  },
  {
    name: "SECRETIS ERP",
    slug: "secretis",
    tagline: "Courrier & Secrétariat",
    description: "Solution de gestion du courrier et du secrétariat : courrier entrant/sortant, GED, visiteurs & réunions, tâches & workflows, notes de frais et Assistante IA.",
    icon: "briefcase",
    color: "from-teal-500 to-cyan-700",
    chipColor: "bg-teal-50 text-teal-700",
    price: "4 900 FCFA/mois",
    commission: "20% N1 (mois 1, dégressif)",
    features: ["Courrier & GED", "Visiteurs & réunions", "Tâches & workflows", "Assistante IA SARA"],
    siteUrl: "https://secretis.ibigsoft.com",
  },
  {
    name: "IBIG DOCPRO",
    slug: "docpro",
    tagline: "Génération de Documents",
    description: "Génération intelligente de documents professionnels conformes OHADA (CV, contrats, statuts, business plans…) : 1 200+ modèles, 15 pays africains. Paiement à l'usage.",
    icon: "sparkles",
    color: "from-slate-600 to-slate-800",
    chipColor: "bg-slate-100 text-slate-700",
    price: "dès 100 FCFA/document",
    commission: "20% N1",
    features: ["1 200+ modèles", "Conforme OHADA", "PDF / Word / PowerPoint", "Portefeuille de crédits"],
    siteUrl: "https://docpro.ibigsoft.com",
  },
];

export function SoftwareCatalog() {
  return (
    <section id="logiciels" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center">
            <span className="label-caps inline-block rounded-full px-4 py-1.5 bg-indigo-50 text-indigo-600">
              Catalogue logiciels IBIG SOFT
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
              14 logiciels SaaS à promouvoir
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted">
              Chaque logiciel répond à un besoin métier spécifique en Afrique, avec plusieurs formules
              mensuelles et annuelles selon la taille du client. Promouvez ceux qui correspondent à votre
              réseau et gagnez des commissions récurrentes.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SOFTWARES.map((sw, i) => (
            <ScrollReveal key={sw.slug} animation="scale-in" delay={i * 80}>
              <div className="card-premium group flex h-full flex-col overflow-hidden p-0">
                <div className={`flex items-center gap-3 bg-gradient-to-r ${sw.color} px-5 py-4 text-white`}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                    <Icon name={sw.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="label-caps text-white/80">{sw.tagline}</p>
                    <h3 className="font-bold leading-tight">{sw.name}</h3>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-sm leading-relaxed text-slate-600">{sw.description}</p>
                  
                  <div className="mt-4 space-y-1.5">
                    {sw.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
                        <Icon name="check" className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-4 space-y-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">À partir de</span>
                      <span className="font-bold text-brand-700">{sw.price}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Commissions</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${sw.chipColor}`}>
                        {sw.commission}
                      </span>
                    </div>
                  </div>

                  {sw.siteUrl && (
                    <a
                      href={sw.siteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      Voir le site <Icon name="trending" className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal animation="fade-up" delay={200}>
          <div className="mt-10 text-center">
            <Link
              href="/rejoindre"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-3.5 font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-xl"
            >
              Promouvoir ces logiciels
              <Icon name="rocket" className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

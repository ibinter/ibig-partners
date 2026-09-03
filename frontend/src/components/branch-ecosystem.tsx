import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";
import { ScrollReveal } from "@/components/scroll-reveal";
import { fcfa } from "@/lib/format";

type Product = { name: string; price: number; gain: number; per?: string };
type BranchData = {
  name: string;
  tagline: string;
  website: string;
  commission: string;
  commissionFull: string;
  icon: IconName;
  bar: string;
  chip: string;
  earnColor: string;
  desc: string;
  products: Product[];
};

const BRANCHES: BranchData[] = [
  {
    name: "IBIG SOFT",
    tagline: "14 logiciels SaaS & ERP métiers",
    website: "https://ibigsoft.com/",
    commission: "20% N1",
    commissionFull: "20% N1 • 10% N2 • 5% N3",
    icon: "cpu",
    bar: "from-brand-500 to-brand-700",
    chip: "bg-brand-50 text-brand-700",
    earnColor: "text-brand-600",
    desc: "Scolaby (écoles), Fleet 360 (flottes), Lokativo (locatif), GESCOMXEL (commercial), Logiciel Hôtelier, Cabinet Médical, Caisse POS — couvrant 17+ secteurs.",
    products: [
      { name: "Logiciel Hôtelier", price: 50000, gain: 10000, per: "/mois" },
      { name: "Scolaby (annuel)", price: 300000, gain: 60000 },
      { name: "Logiciel BTP & Chantiers", price: 45000, gain: 9000, per: "/mois" },
    ],
  },
  {
    name: "IBIG EDUFORM",
    tagline: "200+ formations certifiantes",
    website: "https://ibig-eduform.com/",
    commission: "10% N1",
    commissionFull: "10% N1 • 5% N2 • 2% N3",
    icon: "graduation",
    bar: "from-amber-500 to-orange-600",
    chip: "bg-amber-50 text-amber-700",
    earnColor: "text-amber-600",
    desc: "Comptabilité, marketing digital, BTP, santé, leadership, langues — en présentiel et e-learning. Coaching et MBA accéléré certifiant.",
    products: [
      { name: "MBA Accéléré (certifié)", price: 500000, gain: 50000 },
      { name: "Formation Développement Web", price: 200000, gain: 20000 },
      { name: "Formation BTP & Génie Civil", price: 220000, gain: 22000 },
    ],
  },
  {
    name: "IBIG IMMO TRUST",
    tagline: "Immobilier sécurisé & rentable",
    website: "https://ibigimmotrust.com/",
    commission: "5% N1",
    commissionFull: "5% N1 • 3% N2 • 1% N3",
    icon: "home",
    bar: "from-violet-500 to-purple-700",
    chip: "bg-violet-50 text-violet-700",
    earnColor: "text-violet-600",
    desc: "Vente, location, gestion locative, construction BTP, assistance diaspora, régularisation foncière et promotion immobilière.",
    products: [
      { name: "Mandat de Vente", price: 2000000, gain: 100000 },
      { name: "BTP — Construction Clé en Main", price: 5000000, gain: 250000 },
      { name: "Promotion Immobilière (VEFA)", price: 8000000, gain: 400000 },
    ],
  },
  {
    name: "IBIG MARKET",
    tagline: "E-commerce & vente physique",
    website: "https://ibig-market.com/",
    commission: "8% N1",
    commissionFull: "8% N1 • 4% N2 • 2% N3",
    icon: "store",
    bar: "from-emerald-500 to-teal-600",
    chip: "bg-emerald-50 text-emerald-700",
    earnColor: "text-emerald-600",
    desc: "Matériel IT, mobilier de bureau, énergie solaire, matériel médical, audiovisuel, climatisation — pour entreprises et particuliers.",
    products: [
      { name: "Kits Énergie Solaire", price: 400000, gain: 32000 },
      { name: "Matériel Médical & Paramédical", price: 300000, gain: 24000 },
      { name: "Matériel Audiovisuel & Projection", price: 200000, gain: 16000 },
    ],
  },
  {
    name: "IBIG DIGITAL",
    tagline: "Sites, apps & identité visuelle",
    website: "https://digital.intermark-business.com/",
    commission: "10% N1",
    commissionFull: "10% N1 • 5% N2 • 2% N3",
    icon: "rocket",
    bar: "from-indigo-500 to-blue-700",
    chip: "bg-indigo-50 text-indigo-700",
    earnColor: "text-indigo-600",
    desc: "Sites vitrine & e-commerce, applications Android/iOS, logo et charte graphique, community management, cartes professionnelles digitales.",
    products: [
      { name: "Pack Commerce en Ligne", price: 850000, gain: 85000 },
      { name: "Pack Digital 360", price: 1250000, gain: 125000 },
      { name: "Application Android + iOS", price: 1500000, gain: 150000 },
    ],
  },
  {
    name: "IBIG DIGITAL KITS",
    tagline: "ERP, IA & transformation numérique",
    website: "https://kits.intermark-business.com/",
    commission: "10% N1",
    commissionFull: "10% N1 • 5% N2 • 2% N3",
    icon: "sparkles",
    bar: "from-teal-500 to-cyan-600",
    chip: "bg-teal-50 text-teal-700",
    earnColor: "text-teal-600",
    desc: "Intégration ERP (Odoo, SAP, SAGE), chatbots IA, GED, cybersécurité PME, infogérance, audit SI.",
    products: [
      { name: "Application Mobile (Kit)", price: 1500000, gain: 150000 },
      { name: "Intégration ERP", price: 800000, gain: 80000 },
      { name: "Chatbot & IA Conversationnelle", price: 350000, gain: 35000 },
    ],
  },
  {
    name: "IBIG CONSEIL+",
    tagline: "Structuration, comptabilité & juridique",
    website: "https://intermark-business.com/conseil",
    commission: "10% N1",
    commissionFull: "10% N1 • 5% N2 • 2% N3",
    icon: "chart",
    bar: "from-orange-500 to-red-600",
    chip: "bg-orange-50 text-orange-700",
    earnColor: "text-orange-600",
    desc: "Création d'entreprise, comptabilité externalisée, audit financier, levée de fonds, stratégie, accompagnement ISO.",
    products: [
      { name: "Accompagnement Certification ISO", price: 800000, gain: 80000 },
      { name: "Audit Organisationnel", price: 500000, gain: 50000 },
      { name: "Comptabilité Externalisée", price: 80000, gain: 8000, per: "/mois" },
    ],
  },
  {
    name: "IBIG MULTISERVICES",
    tagline: "Événementiel, logistique & services",
    website: "https://intermark-business.com/multiservices",
    commission: "10% N1",
    commissionFull: "10% N1 • 5% N2 • 2% N3",
    icon: "users",
    bar: "from-rose-500 to-pink-600",
    chip: "bg-rose-50 text-rose-700",
    earnColor: "text-rose-600",
    desc: "Organisation événementielle, sécurité & gardiennage, nettoyage, déménagement, tourisme d'affaires, secrétariat externalisé.",
    products: [
      { name: "Organisation Événementielle", price: 500000, gain: 50000 },
      { name: "Voyages d'Affaires & Tourisme", price: 500000, gain: 50000 },
      { name: "Sécurité & Gardiennage", price: 200000, gain: 20000, per: "/mois" },
    ],
  },
  {
    name: "IBIG FINANCEMENT",
    tagline: "Microfinance, assurance & investissement",
    website: "https://ibigpartners.com/financement",
    commission: "5% N1",
    commissionFull: "5% N1 • 3% N2 • 1% N3",
    icon: "coins",
    bar: "from-yellow-500 to-amber-600",
    chip: "bg-amber-50 text-amber-800",
    earnColor: "text-amber-700",
    desc: "Microcrédits PME, assurance entreprise multirisques, assurance vie, épargne collective, levée de fonds, accompagnement investisseurs.",
    products: [
      { name: "Accompagnement Investisseurs Étrangers", price: 500000, gain: 25000 },
      { name: "Assurance Entreprise Multirisques", price: 300000, gain: 15000, per: "/an" },
      { name: "Aide à la Levée de Fonds", price: 400000, gain: 20000 },
    ],
  },
  {
    name: "IBIG EMPLOI & TALENTS",
    tagline: "Recrutement, placement & RH",
    website: "https://ibigpartners.com/emploi",
    commission: "10% N1",
    commissionFull: "10% N1 • 5% N2 • 2% N3",
    icon: "handshake",
    bar: "from-slate-600 to-slate-800",
    chip: "bg-slate-100 text-slate-700",
    earnColor: "text-slate-700",
    desc: "Recrutement CDI/CDD, externalisation RH complète, placement de profils qualifiés, bilan de compétences, portage salarial.",
    products: [
      { name: "Externalisation RH Complète", price: 200000, gain: 20000, per: "/mois" },
      { name: "Mission de Recrutement CDI", price: 300000, gain: 30000 },
      { name: "Placement de Profils Qualifiés", price: 200000, gain: 20000 },
    ],
  },
];

export function BranchEcosystem() {
  return (
    <section id="ecosysteme" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-12">
            <span className="label-caps inline-block rounded-full px-4 py-1.5 bg-violet-50 text-violet-600">
              IBIG SARL — 10 branches actives
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
              Tout l&apos;écosystème IBIG à promouvoir
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted">
              Un seul compte partenaire pour accéder à 10 branches, des dizaines de produits et des centaines d&apos;opportunités de commission — logiciels, formations, immobilier, digital, services et bien plus.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BRANCHES.map((b, i) => (
            <ScrollReveal key={b.name} animation="fade-up" delay={i * 60}>
              <div className="card-premium flex h-full flex-col overflow-hidden p-0">
                {/* Header coloré */}
                <div className={`bg-gradient-to-r ${b.bar} px-5 py-4 text-white`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
                        <Icon name={b.icon} className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-xs font-extrabold text-white leading-tight">{b.name}</p>
                        <p className="text-[11px] text-white/70 leading-tight">{b.tagline}</p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-white/25 px-2.5 py-1 text-xs font-extrabold text-white whitespace-nowrap">
                      {b.commission}
                    </span>
                  </div>
                </div>

                {/* Corps */}
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs leading-relaxed text-slate-500 mb-4">{b.desc}</p>

                  {/* Produits phares */}
                  <div className="flex-1 space-y-2 mb-4">
                    {b.products.map((p) => (
                      <div
                        key={p.name}
                        className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-700">{p.name}</p>
                          <p className="text-[11px] text-slate-400">{fcfa(p.price)}{p.per ?? ""}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className={`text-xs font-extrabold ${b.earnColor}`}>+{fcfa(p.gain)}</p>
                          <p className="text-[10px] text-slate-400">commission{p.per ?? ""}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pied */}
                  <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${b.chip}`}>
                      {b.commissionFull}
                    </span>
                    <a
                      href={b.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-brand-600 hover:underline shrink-0"
                    >
                      Voir le site ↗
                    </a>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal animation="fade-up" delay={200}>
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-700 px-6 py-8 text-center text-white">
            <p className="text-xl font-extrabold sm:text-2xl">
              10 branches · Des dizaines de produits · Une seule inscription
            </p>
            <p className="mt-2 text-sm text-brand-100">
              Activez librement les branches que vous voulez promouvoir depuis votre espace partenaire.
            </p>
            <Link
              href="/rejoindre"
              className="mt-6 inline-block rounded-xl bg-white px-8 py-3.5 font-bold text-brand-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-brand-50"
            >
              Rejoindre IBIG PARTNERS — c&apos;est gratuit →
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

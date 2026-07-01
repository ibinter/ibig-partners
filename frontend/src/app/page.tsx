import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { FaqAccordion } from "@/components/faq-accordion";
import { ScrollReveal } from "@/components/scroll-reveal";
import { HeroSlider, type HeroSlide } from "@/components/hero-slider";
import { Icon, type IconName } from "@/components/icons";
import { HeroDashboard, NetworkTree, GrowthBars } from "@/components/illustrations";
import { fcfa } from "@/lib/format";
import { STATUS_DETAILS } from "@/lib/constants";
import { LiveCalculator } from "@/components/live-calculator";
import { SocialProofBar } from "@/components/social-proof-bar";
import { StickyMobileCta } from "@/components/sticky-mobile-cta";
import { Testimonials } from "@/components/testimonials";
import { HallOfFame } from "@/components/hall-of-fame";
import { ParrainDuMois } from "@/components/parrain-du-mois";

export const dynamic = "force-dynamic";

const HERO_SLIDES: HeroSlide[] = [
  {
    eyebrow: "IBIG SARL — Intermark Business International Group",
    titleLead: "Une seule plateforme,",
    titleHighlight: "tout l'écosystème IBIG",
    desc: "IBIG PARTNERS réunit l'ensemble des produits et services du groupe IBIG SARL dans un programme d'affiliation unique. Un compte, des dizaines d'opportunités, des revenus à la clé.",
  },
  {
    eyebrow: "Notre mission en Afrique",
    titleLead: "Créons ensemble la",
    titleHighlight: "richesse en Afrique",
    desc: "Nous démocratisons l'accès au revenu : chacun, où qu'il soit sur le continent ou dans la diaspora, peut devenir acteur de l'économie numérique africaine et en vivre.",
  },
  {
    eyebrow: "Un revenu qui dure",
    titleLead: "Bâtissez une équipe,",
    titleHighlight: "des revenus sur 3 niveaux",
    desc: "Vendez, parrainez, accompagnez. Vous gagnez sur vos ventes directes et sur celles de votre réseau, jusqu'au 3ème niveau — un revenu qui grandit avec votre communauté.",
  },
];

const POSITIONING: { icon: IconName; title: string; desc: string }[] = [
  { icon: "key",     title: "Un seul compte",        desc: "Accédez à l'ensemble du portefeuille IBIG SARL avec un seul identifiant partenaire." },
  { icon: "network", title: "Réseau 3 niveaux",      desc: "Touchez des commissions sur vos ventes et celles de vos filleuls N2 et N3." },
  { icon: "wallet",  title: "Paiement rapide",       desc: "Commissions validées en 7 jours, versées via Mobile Money, banque ou international." },
  { icon: "sparkles",title: "Kit marketing offert",  desc: "Visuels, argumentaires et liens tracés prêts à l'emploi dès l'inscription." },
];

const MISSION: { icon: IconName; title: string; desc: string }[] = [
  { icon: "globe",     title: "Démocratiser le revenu",   desc: "Offrir à chaque Africain, urbain ou rural, salarié ou indépendant, une source de revenu accessible sans capital de départ." },
  { icon: "store",     title: "Valoriser le local",       desc: "Promouvoir des solutions conçues en Afrique pour l'Afrique : logiciels, formations, immobilier et services adaptés à nos réalités." },
  { icon: "users",     title: "Créer des entrepreneurs",  desc: "Transformer chaque partenaire en chef d'entreprise de son réseau, avec les outils et la formation pour réussir." },
  { icon: "handshake", title: "Inclure la diaspora",      desc: "Connecter la diaspora aux opportunités du continent et permettre à chacun d'investir son énergie dans l'économie africaine." },
];

const PARTNER_MODULES: { icon: IconName; title: string; desc: string }[] = [
  { icon: "chart",   title: "Dashboard",      desc: "CA généré, commissions en attente et versées, progression de statut en temps réel." },
  { icon: "puzzle",  title: "Mes Produits",   desc: "Sélectionnez librement les branches et produits que vous souhaitez promouvoir." },
  { icon: "link",    title: "Mes Liens",      desc: "Liens d'affiliation uniques, code promo personnel, QR code téléchargeable." },
  { icon: "network", title: "Mon Réseau",     desc: "Visualisez vos filleuls Niveau 1/2/3 et la performance de chacun." },
  { icon: "coins",   title: "Mes Commissions",desc: "Historique complet, statut par paiement, export PDF et Excel." },
  { icon: "graduation", title: "Académie IBIG", desc: "Vidéos, guides, assistant intelligent et formations pour monter en compétence." },
  { icon: "target",  title: "Mes Prospects",  desc: "Suivi de vos leads : contacté, démo faite, converti ou perdu. Import en masse." },
];

const TRUST: { icon: IconName; text: string }[] = [
  { icon: "check", text: "Inscription 100% gratuite" },
  { icon: "lock",  text: "Données sécurisées" },
  { icon: "card",  text: "Orange Money, Wave & MTN" },
  { icon: "phone", text: "Accessible depuis mobile" },
  { icon: "globe", text: "Ouvert à la diaspora" },
];

const BRANCH_ACCENTS = [
  { bar: "from-brand-500 to-brand-700",     chip: "bg-brand-50 text-brand-700" },
  { bar: "from-violet-500 to-purple-700",   chip: "bg-violet-50 text-violet-700" },
  { bar: "from-emerald-500 to-teal-600",    chip: "bg-emerald-50 text-emerald-700" },
  { bar: "from-amber-500 to-orange-600",    chip: "bg-amber-50 text-amber-700" },
  { bar: "from-indigo-500 to-blue-700",     chip: "bg-indigo-50 text-indigo-700" },
  { bar: "from-orange-500 to-red-600",      chip: "bg-orange-50 text-orange-700" },
  { bar: "from-teal-500 to-cyan-600",       chip: "bg-teal-50 text-teal-700" },
  { bar: "from-rose-500 to-pink-600",       chip: "bg-rose-50 text-rose-700" },
];

const STATUS_CONFIG = [
  { key: "STARTER", label: "Starter",          ring: "",                       dot: "bg-slate-400",  badge: "bg-slate-100 text-slate-700" },
  { key: "SILVER",  label: "Silver",           ring: "ring-1 ring-slate-200",  dot: "bg-slate-500",  badge: "bg-slate-100 text-slate-800" },
  { key: "GOLD",    label: "Gold",             ring: "ring-1 ring-amber-200",  dot: "bg-amber-500",  badge: "bg-amber-100 text-amber-800" },
  { key: "MASTER",  label: "Master Partner",   ring: "ring-1 ring-brand-200",  dot: "bg-brand-600",  badge: "bg-brand-100 text-brand-800" },
  { key: "ELITE",   label: "Elite Représentant", ring: "ring-2 ring-gold-400", dot: "bg-gold-500",   badge: "bg-yellow-100 text-yellow-800" },
];

function SectionEyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`label-caps inline-block rounded-full px-4 py-1.5 ${className}`}>
      {children}
    </span>
  );
}

export default async function HomePage() {
  const branches = await prisma.branch.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  return (
    <>
      <SiteHeader />

      {/* ═══════════ HERO ═══════════ */}
      <section className="gradient-hero relative overflow-hidden text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/5" />
          <div className="animate-float absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5" style={{ animationDelay: "1s" }} />
          <div className="animate-float absolute right-1/4 top-1/2 h-48 w-48 rounded-full bg-brand-500/20" style={{ animationDelay: "2s" }} />
          {/* trame légère */}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            {/* Colonne texte */}
            <div>
              <HeroSlider slides={HERO_SLIDES} />

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link
                  href="/rejoindre"
                  className="rounded-xl bg-white px-6 py-3.5 text-center font-bold text-brand-700 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-50 hover:shadow-xl sm:px-7"
                >
                  Devenir Partenaire — c&apos;est gratuit
                </Link>
                <a
                  href="#mission"
                  className="rounded-xl border-2 border-white/30 px-6 py-3.5 text-center font-semibold text-white transition-all duration-200 hover:bg-white/10 sm:px-7"
                >
                  Découvrir notre mission
                </a>
              </div>
            </div>

            {/* Colonne illustration */}
            <div className="hidden lg:block">
              <HeroDashboard className="animate-float w-full" />
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:flex sm:flex-wrap sm:gap-10 lg:mt-14">
            {[
              { val: branches.length || "8", label: "Branches du groupe" },
              { val: "3",   label: "Niveaux de commission" },
              { val: "50%", label: "Commission max N1" },
              { val: "7j",  label: "Délai de paiement" },
            ].map(({ val, label }) => (
              <div key={label} className="flex flex-col">
                <span className="text-numeral text-3xl text-gold-400 sm:text-4xl">{val}</span>
                <span className="mt-1 text-sm text-brand-200">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TRUST BAR ═══════════ */}
      <section className="border-b border-slate-100 bg-white py-5">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 text-sm font-medium text-slate-600">
          {TRUST.map(({ icon, text }) => (
            <span key={text} className="flex items-center gap-2">
              <Icon name={icon} className="h-4 w-4 text-brand-500" />
              {text}
            </span>
          ))}
        </div>
      </section>

      {/* ═══════════ SOCIAL PROOF (NEW) ═══════════ */}
      <SocialProofBar />

      {/* ═══════════ CALCULATEUR LIVE (NEW) ═══════════ */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-10">
              <SectionEyebrow className="bg-amber-50 text-amber-600">
                ⚡ Simulez · Décidez · Lancez-vous
              </SectionEyebrow>
              <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
                Combien pourriez-vous gagner ?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted">
                Bougez les sliders et découvrez votre revenu potentiel en temps réel.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="scale-in" delay={100}>
            <LiveCalculator />
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════ MISSION / AFRIQUE ═══════════ */}
      <section id="mission" className="relative overflow-hidden bg-white py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <ScrollReveal animation="slide-left">
              <div>
                <SectionEyebrow className="bg-emerald-50 text-emerald-600">Notre raison d&apos;être</SectionEyebrow>
                <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
                  La plateforme d&apos;opportunités pensée pour l&apos;Afrique
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted">
                  IBIG PARTNERS n&apos;est pas qu&apos;un programme d&apos;affiliation. C&apos;est un
                  levier d&apos;inclusion économique : permettre à chacun de générer un revenu
                  digne en valorisant des solutions africaines, et de bâtir une équipe qui
                  perpétue ces revenus.
                </p>
                <p className="mt-3 leading-relaxed text-muted">
                  Notre objectif : faire émerger une génération d&apos;entrepreneurs du
                  numérique, du Nord au Sud du continent, et au-delà avec la diaspora.
                </p>
                <Link
                  href="/rejoindre"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-700"
                >
                  Rejoindre le mouvement
                  <Icon name="rocket" className="h-4 w-4" />
                </Link>
              </div>
            </ScrollReveal>

            <div className="grid gap-4 sm:grid-cols-2">
              {MISSION.map((m, i) => (
                <ScrollReveal key={m.title} animation="fade-up" delay={i * 100}>
                  <div className="card-premium h-full p-6">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600">
                      <Icon name={m.icon} className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-bold text-ink">{m.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{m.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ POURQUOI ═══════════ */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollReveal animation="fade-up">
            <div className="text-center">
              <SectionEyebrow className="bg-brand-50 text-brand-600">Pourquoi nous choisir</SectionEyebrow>
              <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
                Tous les avantages, aucune contrainte
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted">
                Une plateforme conçue pour vous donner les atouts d&apos;un commercial
                d&apos;élite, en toute liberté.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {POSITIONING.map(({ icon, title, desc }, i) => (
              <ScrollReveal key={title} animation="fade-up" delay={i * 100}>
                <div className="card-premium group h-full p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 transition-transform group-hover:scale-110">
                    <Icon name={icon} className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-bold text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ BRANCHES ═══════════ */}
      <section id="branches" className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollReveal animation="fade-up">
            <div className="text-center">
              <SectionEyebrow className="bg-violet-50 text-violet-600">INTERMARK BUSINESS INTERNATIONAL GROUP SARL</SectionEyebrow>
              <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
                {branches.length || "8"} branches à promouvoir
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted">
                Chaque branche dispose de sa ligne de produits et de son propre modèle
                de commissions — tout géré depuis un seul espace partenaire.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {branches.map((b, i) => {
              const accent = BRANCH_ACCENTS[i % BRANCH_ACCENTS.length];
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const branchWebsite: string | undefined = (b as any).website;
              const cardContent = (
                <div className="card-premium group flex h-full flex-col overflow-hidden p-0">
                  <div className={`h-1.5 w-full bg-gradient-to-r ${accent.bar}`} />
                  <div className="flex flex-1 flex-col p-6">
                    <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${accent.chip}`}>
                      <Icon name="building" className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-extrabold text-ink">{b.name}</h3>
                    <p className="label-caps mt-1 text-slate-400">{b.tagline}</p>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{b.description}</p>
                    <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-muted">
                      {b.offerType && (
                        <p><span className="font-semibold text-slate-700">Offre :</span> {b.offerType}</p>
                      )}
                      {b.commissionModel && (
                        <p><span className="font-semibold text-slate-700">Commission :</span> {b.commissionModel}</p>
                      )}
                      {branchWebsite && (
                        <p className="mt-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600">
                            ↗ Voir le site
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
              return (
                <ScrollReveal key={b.id} animation="scale-in" delay={i * 70}>
                  {branchWebsite ? (
                    <a href={branchWebsite} target="_blank" rel="noopener noreferrer" className="block h-full">
                      {cardContent}
                    </a>
                  ) : (
                    <div className="h-full">{cardContent}</div>
                  )}
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ COMMISSIONS ═══════════ */}
      <section id="commissions" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollReveal animation="fade-up">
            <div className="text-center">
              <SectionEyebrow className="bg-emerald-50 text-emerald-600">Rémunération transparente</SectionEyebrow>
              <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
                Grille de commissions
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted">
                Vous touchez sur vos ventes <strong>et</strong> sur celles de vos filleuls
                jusqu&apos;au 3ème niveau.
              </p>
            </div>
          </ScrollReveal>

          {/* Schéma réseau 3 niveaux */}
          <ScrollReveal animation="scale-in" delay={100}>
            <div className="mx-auto mt-10 max-w-2xl">
              <NetworkTree className="w-full" />
            </div>
          </ScrollReveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <ScrollReveal animation="slide-left">
              <div className="card-premium overflow-hidden p-0">
                <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-4 text-white">
                  <h3 className="font-bold">Abonnements mensuels (IBIG SOFT)</h3>
                  <p className="mt-0.5 text-xs text-brand-100">Dégressif sur 4 mois — exemple sur {fcfa(10000)}/mois</p>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-5 py-3">Mois</th>
                      <th className="px-3 py-3 text-brand-600">Vous (N1)</th>
                      <th className="px-3 py-3 text-indigo-600">Filleul (N2)</th>
                      <th className="px-3 py-3 text-violet-600">N3</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      ["Mois 1", "20%", "10%", "5%"],
                      ["Mois 2", "15%", "8%",  "3%"],
                      ["Mois 3", "10%", "5%",  "2%"],
                      ["Mois 4", "5%",  "3%",  "1%"],
                    ].map((r) => (
                      <tr key={r[0]} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-5 py-2.5 font-medium text-slate-700">{r[0]}</td>
                        <td className="px-3 py-2.5 font-bold text-brand-600">{r[1]}</td>
                        <td className="px-3 py-2.5 text-indigo-600">{r[2]}</td>
                        <td className="px-3 py-2.5 text-violet-600">{r[3]}</td>
                      </tr>
                    ))}
                    <tr className="bg-brand-50 font-bold">
                      <td className="px-5 py-3 text-brand-800">Total cumulé</td>
                      <td className="px-3 py-3 text-brand-700">50%</td>
                      <td className="px-3 py-3 text-indigo-700">26%</td>
                      <td className="px-3 py-3 text-violet-700">11%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </ScrollReveal>

            <div className="space-y-5">
              {[
                { title: "Abonnements annuels — one-shot", grad: "from-emerald-500 to-teal-600", rows: [["Niveau 1 (vous)", "20%", "text-emerald-600"], ["Niveau 2", "8%", "text-teal-600"], ["Niveau 3", "3%", "text-cyan-600"]] },
                { title: "Formations IBIG EDUFORM",        grad: "from-amber-500 to-orange-500", rows: [["Niveau 1 (vous)", "10%", "text-amber-600"], ["Niveau 2", "5%", "text-orange-600"], ["Niveau 3", "2%", "text-red-500"]] },
                { title: "Services & Prestations",         grad: "from-violet-500 to-purple-600", rows: [["Niveau 1 (vous)", "Selon produit", "text-violet-600"], ["Niveau 2", "50% du taux N1", "text-purple-600"], ["Niveau 3", "25% du taux N1", "text-fuchsia-600"]] },
              ].map((block, i) => (
                <ScrollReveal key={block.title} animation="fade-up" delay={i * 100}>
                  <div className="card-premium overflow-hidden p-0">
                    <div className={`bg-gradient-to-r ${block.grad} px-5 py-4 text-white`}>
                      <h3 className="font-bold">{block.title}</h3>
                    </div>
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-slate-100">
                        {block.rows.map(([lvl, rate, color]) => (
                          <tr key={lvl} className="hover:bg-slate-50/50">
                            <td className="px-5 py-3 font-medium text-slate-700">{lvl}</td>
                            <td className={`px-3 py-3 font-bold ${color}`}>{rate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SIMULATEUR ═══════════ */}
      <section className="gradient-simulateur py-24 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollReveal animation="fade-up">
            <div className="text-center">
              <SectionEyebrow className="bg-white/10 text-brand-200">Exemple concret</SectionEyebrow>
              <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
                Combien puis-je gagner&nbsp;?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-brand-200">
                Scénarios réalistes sur IBIG SOFT (Scolaby à partir de {fcfa(10000)}/mois).
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                delay: 0, icon: "trending" as IconName, label: "Débutant", sub: "3 ventes directes",
                rows: [{ text: `3 × ${fcfa(10000)} × 20%`, val: fcfa(6000), color: "text-emerald-400" }],
                total: fcfa(6000), totalColor: "text-emerald-400",
                border: "border-white/10 bg-white/5",
              },
              {
                delay: 120, icon: "rocket" as IconName, label: "Actif Silver", sub: "5 ventes + 2 filleuls",
                badge: "Populaire",
                rows: [
                  { text: `5 × ${fcfa(10000)} × 20%`, val: fcfa(10000), color: "text-emerald-400" },
                  { text: `N2 : 4 ventes × 10%`,       val: fcfa(4000), color: "text-sky-400" },
                ],
                total: fcfa(14000), totalColor: "text-gold-400",
                border: "border-gold-400/30 bg-gradient-to-br from-white/10 to-gold-500/5 ring-1 ring-gold-400/20",
              },
              {
                delay: 240, icon: "trophy" as IconName, label: "Master Gold", sub: "10 ventes + réseau actif",
                rows: [
                  { text: `10 × ${fcfa(10000)} × 25%`, val: fcfa(25000), color: "text-emerald-400" },
                  { text: `N2 : 10 ventes × 10%`,       val: fcfa(10000), color: "text-sky-400" },
                  { text: `N3 : 6 ventes × 5%`,         val: fcfa(3000),  color: "text-violet-400" },
                ],
                total: fcfa(38000), totalColor: "text-violet-400",
                border: "border-violet-400/20 bg-white/5",
              },
            ].map((scenario) => (
              <ScrollReveal key={scenario.label} animation="scale-in" delay={scenario.delay}>
                <div className={`flex h-full flex-col rounded-2xl border p-6 backdrop-blur-sm ${scenario.border}`}>
                  {scenario.badge && (
                    <div className="mb-1 flex justify-end">
                      <span className="rounded-full bg-gold-400/20 px-2 py-0.5 text-xs font-bold text-gold-400">
                        {scenario.badge}
                      </span>
                    </div>
                  )}
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                      <Icon name={scenario.icon} className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-bold text-white">{scenario.label}</p>
                      <p className="text-xs text-brand-300">{scenario.sub}</p>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2 text-sm">
                    {scenario.rows.map((r) => (
                      <div key={r.text} className="flex justify-between">
                        <span className="text-brand-200">{r.text}</span>
                        <span className={`font-bold ${r.color}`}>{r.val}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <p className="text-xs text-brand-300">Revenus mois 1</p>
                    <p className={`text-numeral text-2xl ${scenario.totalColor}`}>{scenario.total}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal animation="fade-up" delay={300}>
            <p className="mt-8 text-center text-xs text-brand-300">
              * Estimations basées sur les taux standard. Les commissions réelles varient selon les produits et statuts.
            </p>
            <div className="mt-6 text-center">
              <Link
                href="/rejoindre"
                className="inline-block rounded-xl bg-white px-8 py-4 font-bold text-brand-700 shadow-xl transition-all duration-200 hover:-translate-y-1 hover:bg-brand-50 hover:shadow-2xl"
              >
                Commencer à gagner maintenant →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════ OBJECTIF 500 000 FCFA ═══════════ */}
      <section id="objectif-500k" className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollReveal animation="fade-up">
            <div className="text-center">
              <SectionEyebrow className="bg-gold-400/15 text-amber-700">Votre objectif</SectionEyebrow>
              <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
                Comment gagner{" "}
                <span className="bg-gradient-to-r from-amber-500 to-gold-500 bg-clip-text text-transparent">500 000 FCFA</span>
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted">
                Plusieurs chemins mènent à 500 000 FCFA en promouvant les produits IBIG.
                Voici 4 stratégies concrètes, chiffrées au taux de base — vos gains augmentent
                encore avec votre statut.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {[
              {
                icon: "coins" as IconName,
                tag: "Vente directe",
                title: "Le spécialiste des abonnements annuels",
                lines: [
                  ["9 abonnements annuels Scolaby", "300 000 × 20%"],
                  ["Commission par vente", "60 000 FCFA"],
                ],
                total: "540 000 FCFA",
                foot: "Idéal si vous ciblez les écoles et institutions.",
                grad: "from-emerald-500 to-teal-600",
              },
              {
                icon: "network" as IconName,
                tag: "Revenu passif",
                title: "Le bâtisseur de réseau",
                lines: [
                  ["4 ventes annuelles personnelles", "240 000 FCFA"],
                  ["12 ventes de vos filleuls (N2 à 8%)", "288 000 FCFA"],
                ],
                total: "528 000 FCFA",
                foot: "Plus de la moitié provient de votre équipe.",
                grad: "from-brand-600 to-indigo-700",
              },
              {
                icon: "home" as IconName,
                tag: "Forte valeur",
                title: "L'expert immobilier IBIG IMMO TRUST",
                lines: [
                  ["2 transactions immobilières", "—"],
                  ["Commission agence 1 000 000 × 25%", "250 000 FCFA"],
                ],
                total: "500 000 FCFA",
                foot: "Le taux s'applique sur la commission agence, pas le prix du bien.",
                grad: "from-violet-600 to-purple-700",
              },
              {
                icon: "layers" as IconName,
                tag: "Diversifié",
                title: "Le combo malin",
                lines: [
                  ["20 abonnements mensuels (sur 4 mois)", "300 000 FCFA"],
                  ["10 formations EduForm (100 000 × 10%)", "100 000 FCFA"],
                  ["Réseau N2 sur abonnements", "≈ 110 000 FCFA"],
                ],
                total: "≈ 510 000 FCFA",
                foot: "En combinant plusieurs branches du groupe.",
                grad: "from-amber-500 to-orange-600",
              },
            ].map((s, i) => (
              <ScrollReveal key={s.title} animation="fade-up" delay={i * 90}>
                <div className="card-premium flex h-full flex-col overflow-hidden p-0">
                  <div className={`flex items-center gap-3 bg-gradient-to-r ${s.grad} px-5 py-4 text-white`}>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                      <Icon name={s.icon} className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="label-caps text-white/80">{s.tag}</p>
                      <h3 className="font-bold leading-tight">{s.title}</h3>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex-1 space-y-2 text-sm">
                      {s.lines.map(([label, val]) => (
                        <div key={label} className="flex items-center justify-between gap-3 border-b border-slate-50 pb-2">
                          <span className="text-slate-600">{label}</span>
                          <span className="shrink-0 font-semibold text-slate-800">{val}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-xs text-muted">Revenu estimé</p>
                        <p className="text-numeral text-2xl text-emerald-600">{s.total}</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        Objectif atteint ✓
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-slate-400">{s.foot}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal animation="fade-up" delay={200}>
            <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-8 text-center text-white sm:flex-row sm:justify-between sm:text-left">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Icon name="cpu" className="h-6 w-6 text-gold-400" />
                </span>
                <div>
                  <p className="font-bold">Simulez vos propres gains</p>
                  <p className="text-sm text-brand-100">Une calculatrice interactive vous attend dans votre espace partenaire.</p>
                </div>
              </div>
              <Link
                href="/rejoindre"
                className="shrink-0 rounded-xl bg-white px-6 py-3 font-bold text-brand-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-brand-50"
              >
                Accéder au simulateur
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════ STATUTS ═══════════ */}
      <section id="statuts" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollReveal animation="fade-up">
            <div className="text-center">
              <SectionEyebrow className="bg-amber-50 text-amber-600">Progressez et gagnez plus</SectionEyebrow>
              <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
                Votre statut grandit avec vous
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted">
                Plus vous vendez et développez votre réseau, plus votre taux de commission
                augmente automatiquement.
              </p>
            </div>
          </ScrollReveal>

          {/* Graphique : revenus croissants par statut */}
          <ScrollReveal animation="scale-in" delay={100}>
            <div className="mx-auto mt-10 max-w-xl rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <p className="mb-2 text-center text-sm font-semibold text-ink">Potentiel de revenu par statut</p>
              <GrowthBars className="w-full" />
            </div>
          </ScrollReveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {STATUS_DETAILS.map((s, i) => {
              const cfg = STATUS_CONFIG.find((c) => c.key === s.status) ?? STATUS_CONFIG[0];
              return (
                <ScrollReveal key={s.status} animation="fade-up" delay={i * 80}>
                  <div className={`card-premium h-full p-6 text-center ${cfg.ring}`}>
                    <span className={`mx-auto flex h-3 w-3 rounded-full ${cfg.dot}`} />
                    <p className="mt-4 text-lg font-extrabold text-ink">{cfg.label}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.condition}</p>
                    <span className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-bold ${cfg.badge}`}>
                      {s.bonus}
                    </span>
                    <p className="mt-3 text-xs text-muted">{s.advantage}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          <ScrollReveal animation="fade-up" delay={300}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm">
              {["Starter", "Silver", "Gold", "Master", "Elite"].map((label, i, arr) => (
                <span key={label} className="flex items-center gap-3">
                  <span className={`font-semibold ${i === arr.length - 1 ? "text-gold-500" : i >= 2 ? "text-brand-700" : "text-slate-500"}`}>
                    {label}
                  </span>
                  {i < arr.length - 1 && <Icon name="trending" className="h-4 w-4 text-brand-300" />}
                </span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════ ESPACE PARTENAIRE ═══════════ */}
      <section id="espace" className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollReveal animation="fade-up">
            <div className="text-center">
              <SectionEyebrow className="bg-indigo-50 text-indigo-600">Votre espace dédié</SectionEyebrow>
              <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
                Tout ce qu&apos;il vous faut pour réussir
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted">
                Gérez l&apos;intégralité de votre activité en totale autonomie, directement
                depuis votre téléphone.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {PARTNER_MODULES.map(({ icon, title, desc }, i) => (
              <ScrollReveal key={title} animation="scale-in" delay={i * 60}>
                <div className="card-premium group h-full p-5">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 transition-transform group-hover:scale-110">
                    <Icon name={icon} className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 font-bold text-ink transition-colors group-hover:text-brand-700">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{desc}</p>
                </div>
              </ScrollReveal>
            ))}
            <ScrollReveal animation="scale-in" delay={PARTNER_MODULES.length * 60}>
              <div className="flex h-full flex-col items-center justify-center rounded-[20px] border border-dashed border-brand-200 bg-brand-50/50 p-5 text-center">
                <Icon name="sparkles" className="h-6 w-6 text-brand-500" />
                <p className="mt-2 font-bold text-brand-700">Et bien plus</p>
                <p className="mt-1 text-sm text-brand-500">Analytics, classement, chat GOLD+, badges…</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══════════ PARRAIN DU MOIS (NEW) ═══════════ */}
      <ParrainDuMois />

      {/* ═══════════ HALL OF FAME (NEW) ═══════════ */}
      <HallOfFame />

      {/* ═══════════ TÉMOIGNAGES (NEW) ═══════════ */}
      <Testimonials />

      {/* ═══════════ FAQ ═══════════ */}
      <section id="faq" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-3xl px-4">
          <ScrollReveal animation="fade-up">
            <div className="text-center">
              <SectionEyebrow className="bg-teal-50 text-teal-600">Vos questions</SectionEyebrow>
              <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
                Questions fréquentes
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted">
                Tout ce que vous devez savoir avant de rejoindre IBIG PARTNERS.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={150}>
            <div className="mt-10"><FaqAccordion /></div>
            <p className="mt-8 text-center text-sm text-muted">
              Une autre question ?{" "}
              <Link href="/connexion" className="font-semibold text-brand-600 hover:underline">
                Connectez-vous et ouvrez un ticket support →
              </Link>
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════ CTA FINAL ═══════════ */}
      <section className="gradient-cta relative overflow-hidden py-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/5" />
          <div className="animate-float absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/5" style={{ animationDelay: "1.5s" }} />
          <div className="animate-float absolute left-1/3 top-1/4 h-40 w-40 rounded-full bg-white/5" style={{ animationDelay: "0.7s" }} />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center text-white">
          <ScrollReveal animation="scale-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <Icon name="rocket" className="h-8 w-8 text-gold-400" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold sm:text-4xl">
              Prêt à rejoindre IBIG PARTNERS&nbsp;?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-brand-100">
              Inscription gratuite. Aucun investissement. Commencez à générer des revenus
              dès aujourd&apos;hui en promouvant ce que vous aimez.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/rejoindre"
                className="rounded-xl bg-white px-8 py-4 text-lg font-bold text-brand-700 shadow-xl transition-all duration-200 hover:-translate-y-1 hover:bg-brand-50 hover:shadow-2xl"
              >
                Créer mon compte — Gratuit
              </Link>
              <Link
                href="/connexion"
                className="rounded-xl border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-white/10"
              >
                Déjà partenaire ? Se connecter
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-brand-200">
              {["Sans engagement", "Aucune carte bancaire requise", "Activez vos produits en 2 minutes"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Icon name="check" className="h-4 w-4 text-gold-400" /> {t}
                </span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SiteFooter />
      <StickyMobileCta />
    </>
  );
}

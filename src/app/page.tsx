import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { FaqAccordion } from "@/components/faq-accordion";
import { ScrollReveal } from "@/components/scroll-reveal";
import { fcfa } from "@/lib/format";
import { STATUS_DETAILS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const POSITIONING = [
  { icon: "🔑", title: "Un seul compte", desc: "Accédez à l'ensemble du portefeuille IBIG SARL avec un seul identifiant partenaire." },
  { icon: "🌳", title: "Réseau 3 niveaux", desc: "Touchez des commissions sur vos ventes et celles de vos filleuls N2 et N3." },
  { icon: "💸", title: "Paiement rapide", desc: "Commissions validées en 7 jours, versées chaque semaine via Mobile Money ou virement." },
  { icon: "🎨", title: "Kit marketing offert", desc: "Visuels, argumentaires et liens tracés prêts à l'emploi dès l'inscription." },
];

const PARTNER_MODULES = [
  { icon: "📊", title: "Dashboard", desc: "CA généré, commissions en attente et versées, progression de statut en temps réel." },
  { icon: "🧩", title: "Mes Produits", desc: "Sélectionnez librement les branches et produits que vous souhaitez promouvoir." },
  { icon: "🔗", title: "Mes Liens", desc: "Liens d'affiliation uniques, code promo personnel, QR code téléchargeable." },
  { icon: "🌳", title: "Mon Réseau", desc: "Visualisez vos filleuls Niveau 1/2/3 et la performance de chacun." },
  { icon: "💰", title: "Mes Commissions", desc: "Historique complet, statut par paiement, export PDF et Excel." },
  { icon: "🎨", title: "Kit Marketing", desc: "Visuels professionnels, argumentaires et supports prêts à partager." },
  { icon: "🎯", title: "Mes Prospects", desc: "Suivi de vos leads : contacté, démo faite, converti ou perdu." },
];

const BRANCH_COLORS = [
  "border-l-brand-500", "border-l-violet-500", "border-l-emerald-500", "border-l-amber-500",
  "border-l-indigo-500", "border-l-orange-500", "border-l-teal-500", "border-l-rose-500",
];
const BRANCH_ACCENT_BG = [
  "bg-brand-50", "bg-violet-50", "bg-emerald-50", "bg-amber-50",
  "bg-indigo-50", "bg-orange-50", "bg-teal-50", "bg-rose-50",
];
const BRANCH_TITLE_COLORS = [
  "text-brand-700", "text-violet-700", "text-emerald-700", "text-amber-700",
  "text-indigo-700", "text-orange-700", "text-teal-700", "text-rose-700",
];

const STATUS_CONFIG = [
  { key: "STARTER", emoji: "⭐",  label: "Starter",          bg: "bg-slate-50",     border: "border-slate-200",  badge: "bg-slate-100 text-slate-700",   ring: "" },
  { key: "SILVER",  emoji: "🥈",  label: "Silver",           bg: "bg-slate-100/60", border: "border-slate-300",  badge: "bg-slate-200 text-slate-800",   ring: "ring-2 ring-slate-300" },
  { key: "GOLD",    emoji: "🥇",  label: "Gold",             bg: "bg-amber-50",     border: "border-amber-200",  badge: "bg-amber-100 text-amber-800",   ring: "ring-2 ring-amber-300" },
  { key: "MASTER",  emoji: "🏆",  label: "Master Partner",   bg: "bg-brand-50",     border: "border-brand-200",  badge: "bg-brand-100 text-brand-800",   ring: "ring-2 ring-brand-400" },
  { key: "ELITE",   emoji: "👑",  label: "Elite Représentant", bg: "bg-yellow-50",  border: "border-yellow-300", badge: "bg-yellow-100 text-yellow-800", ring: "ring-2 ring-yellow-400" },
];

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
          <div className="animate-float absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/5" style={{ animationDelay: "0s" }} />
          <div className="animate-float absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5" style={{ animationDelay: "1s" }} />
          <div className="animate-float absolute right-1/4 top-1/2 h-48 w-48 rounded-full bg-brand-500/20" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              IBIG SARL — Groupe Intermark Business International
            </span>
          </div>

          <h1 className="animate-fade-up delay-100 mt-6 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            Gagnez des revenus en promouvant{" "}
            <span className="text-gold-400">tout l&apos;écosystème IBIG</span>
          </h1>

          <p className="animate-fade-up delay-200 mt-6 max-w-2xl text-lg text-brand-100 leading-relaxed">
            Un compte unique, tous les produits du groupe, une grille de commissions
            transparente sur <strong className="text-white">3 niveaux</strong> et un
            tableau de bord en temps réel.
          </p>

          <div className="animate-fade-up delay-300 mt-8 flex flex-wrap gap-4">
            <Link
              href="/rejoindre"
              className="rounded-xl bg-white px-7 py-3.5 font-bold text-brand-700 shadow-lg hover:bg-brand-50 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              Devenir Partenaire — c&apos;est gratuit 🚀
            </Link>
            <a
              href="#commissions"
              className="rounded-xl border-2 border-white/30 px-7 py-3.5 font-semibold text-white hover:bg-white/10 transition-all duration-200"
            >
              Voir les commissions
            </a>
          </div>

          <div className="animate-fade-up delay-400 mt-14 grid grid-cols-2 gap-6 sm:flex sm:flex-wrap">
            {[
              { val: branches.length || "8", label: "Branches du groupe",  color: "text-gold-400" },
              { val: "3",   label: "Niveaux de commission", color: "text-emerald-400" },
              { val: "50%", label: "Commission max N1",      color: "text-sky-400" },
              { val: "7j",  label: "Délai de paiement",      color: "text-violet-400" },
            ].map(({ val, label, color }) => (
              <div key={label} className="flex flex-col">
                <span className={`text-3xl font-extrabold ${color}`}>{val}</span>
                <span className="mt-0.5 text-sm text-brand-200">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TRUST BAR ═══════════ */}
      <section className="border-b border-slate-100 bg-white py-5">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 text-sm font-medium text-slate-600">
          {[
            { icon: "✅", text: "Inscription 100% gratuite" },
            { icon: "🔒", text: "Données sécurisées" },
            { icon: "💳", text: "Orange Money, Wave & MTN" },
            { icon: "📱", text: "Accessible depuis mobile" },
            { icon: "🌍", text: "Ouvert à la diaspora" },
          ].map(({ icon, text }) => (
            <span key={text} className="flex items-center gap-2">
              <span>{icon}</span> {text}
            </span>
          ))}
        </div>
      </section>

      {/* ═══════════ POURQUOI ═══════════ */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <ScrollReveal animation="fade-up">
          <div className="text-center">
            <span className="rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-600">
              Pourquoi nous choisir
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
              Pourquoi IBIG PARTNERS&nbsp;?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              Une plateforme conçue pour vous donner tous les avantages d&apos;un commercial salarié, sans les contraintes.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {POSITIONING.map(({ icon, title, desc }, i) => (
            <ScrollReveal key={title} animation="fade-up" delay={i * 100}>
              <div className="group card hover-lift h-full p-6 cursor-default">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-2xl group-hover:bg-brand-100 transition-colors">
                  {icon}
                </div>
                <h3 className="font-bold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══════════ BRANCHES ═══════════ */}
      <section id="branches" className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollReveal animation="fade-up">
            <div className="text-center">
              <span className="rounded-full bg-violet-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-violet-600">
                Le groupe IBIG SARL
              </span>
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
            {branches.map((b, i) => (
              <ScrollReveal key={b.id} animation="scale-in" delay={i * 80}>
                <div className={`card hover-lift flex flex-col border-l-4 p-6 h-full ${BRANCH_COLORS[i % BRANCH_COLORS.length]}`}>
                  <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg ${BRANCH_ACCENT_BG[i % BRANCH_ACCENT_BG.length]}`}>
                    🏢
                  </div>
                  <h3 className={`text-lg font-extrabold ${BRANCH_TITLE_COLORS[i % BRANCH_TITLE_COLORS.length]}`}>
                    {b.name}
                  </h3>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mt-0.5">
                    {b.tagline}
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                    {b.description}
                  </p>
                  <div className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-xs text-muted">
                    {b.offerType && (
                      <p><span className="font-semibold text-slate-700">Offre :</span> {b.offerType}</p>
                    )}
                    {b.commissionModel && (
                      <p><span className="font-semibold text-slate-700">Commission :</span> {b.commissionModel}</p>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ COMMISSIONS ═══════════ */}
      <section id="commissions" className="mx-auto max-w-6xl px-4 py-24">
        <ScrollReveal animation="fade-up">
          <div className="text-center">
            <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-600">
              Rémunération transparente
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
              Grille de commissions
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted">
              Vous touchez sur vos ventes <strong>et</strong> sur celles de vos filleuls
              jusqu&apos;au 3ème niveau.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <ScrollReveal animation="slide-left">
            <div className="card overflow-hidden p-0">
              <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-4 text-white">
                <h3 className="font-bold">📅 Abonnements mensuels (IBIG SOFT)</h3>
                <p className="text-xs text-brand-100 mt-0.5">Dégressif sur 4 mois — exemple sur {fcfa(30000)}/mois</p>
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
                    <tr key={r[0]} className="hover:bg-slate-50/50 transition-colors">
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
            <ScrollReveal animation="fade-up" delay={100}>
              <div className="card overflow-hidden p-0">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-4 text-white">
                  <h3 className="font-bold">📆 Abonnements annuels — one-shot</h3>
                </div>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {[
                      ["Niveau 1 (vous)", "20%", "text-emerald-600"],
                      ["Niveau 2",        "8%",  "text-teal-600"],
                      ["Niveau 3",        "3%",  "text-cyan-600"],
                    ].map(([lvl, rate, color]) => (
                      <tr key={lvl} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3 font-medium text-slate-700">{lvl}</td>
                        <td className={`px-3 py-3 font-bold ${color}`}>{rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={200}>
              <div className="card overflow-hidden p-0">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4 text-white">
                  <h3 className="font-bold">🎓 Formations IBIG EDUFORM</h3>
                </div>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {[
                      ["Niveau 1 (vous)", "10%", "text-amber-600"],
                      ["Niveau 2",        "5%",  "text-orange-600"],
                      ["Niveau 3",        "2%",  "text-red-500"],
                    ].map(([lvl, rate, color]) => (
                      <tr key={lvl} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3 font-medium text-slate-700">{lvl}</td>
                        <td className={`px-3 py-3 font-bold ${color}`}>{rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={300}>
              <div className="card overflow-hidden p-0">
                <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-4 text-white">
                  <h3 className="font-bold">🛠️ Services & Prestations</h3>
                </div>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {[
                      ["Niveau 1 (vous)", "Selon produit",  "text-violet-600"],
                      ["Niveau 2",        "50% du taux N1", "text-purple-600"],
                      ["Niveau 3",        "25% du taux N1", "text-fuchsia-600"],
                    ].map(([lvl, rate, color]) => (
                      <tr key={lvl} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3 font-medium text-slate-700">{lvl}</td>
                        <td className={`px-3 py-3 font-bold ${color}`}>{rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══════════ SIMULATEUR ═══════════ */}
      <section className="gradient-simulateur py-24 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollReveal animation="fade-up">
            <div className="text-center">
              <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-200">
                Exemple concret
              </span>
              <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
                Combien puis-je gagner&nbsp;? 💡
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-brand-200">
                Scénarios réalistes sur IBIG SOFT (Scolaby à {fcfa(30000)}/mois).
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                delay: 0,
                icon: "🌱", label: "Débutant", sub: "3 ventes directes",
                rows: [{ text: `3 × ${fcfa(30000)} × 20%`, val: fcfa(18000), color: "text-emerald-400" }],
                total: fcfa(18000), totalColor: "text-emerald-400",
                border: "border-white/10 bg-white/5",
              },
              {
                delay: 120,
                icon: "🚀", label: "Actif Silver", sub: "5 ventes + 2 filleuls",
                badge: "Populaire",
                rows: [
                  { text: `5 × ${fcfa(30000)} × 20%`, val: fcfa(30000), color: "text-emerald-400" },
                  { text: `N2 : 4 ventes × 10%`,       val: fcfa(12000), color: "text-sky-400" },
                ],
                total: fcfa(42000), totalColor: "text-gold-400",
                border: "border-gold-400/30 bg-gradient-to-br from-white/10 to-gold-500/5 ring-1 ring-gold-400/20",
              },
              {
                delay: 240,
                icon: "🏆", label: "Master Gold", sub: "10 ventes + réseau actif",
                rows: [
                  { text: `10 × ${fcfa(30000)} × 25%`, val: fcfa(75000), color: "text-emerald-400" },
                  { text: `N2 : 10 ventes × 10%`,       val: fcfa(30000), color: "text-sky-400" },
                  { text: `N3 : 6 ventes × 5%`,         val: fcfa(9000),  color: "text-violet-400" },
                ],
                total: fcfa(114000), totalColor: "text-violet-400",
                border: "border-violet-400/20 bg-white/5",
              },
            ].map((scenario) => (
              <ScrollReveal key={scenario.label} animation="scale-in" delay={scenario.delay}>
                <div className={`rounded-2xl border p-6 backdrop-blur-sm h-full flex flex-col ${scenario.border}`}>
                  {scenario.badge && (
                    <div className="mb-1 flex justify-end">
                      <span className="rounded-full bg-gold-400/20 px-2 py-0.5 text-xs font-bold text-gold-400">
                        {scenario.badge}
                      </span>
                    </div>
                  )}
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl">
                      {scenario.icon}
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
                    <p className={`text-2xl font-extrabold ${scenario.totalColor}`}>{scenario.total}</p>
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
                className="inline-block rounded-xl bg-white px-8 py-4 font-bold text-brand-700 shadow-xl hover:bg-brand-50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200"
              >
                Commencer à gagner maintenant →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════ STATUTS ═══════════ */}
      <section id="statuts" className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollReveal animation="fade-up">
            <div className="text-center">
              <span className="rounded-full bg-amber-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-600">
                Progressez et gagnez plus
              </span>
              <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
                Votre statut grandit avec vous
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted">
                Plus vous vendez et développez votre réseau, plus votre taux de commission augmente automatiquement.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {STATUS_DETAILS.map((s, i) => {
              const cfg = STATUS_CONFIG.find((c) => c.key === s.status) ?? STATUS_CONFIG[0];
              return (
                <ScrollReveal key={s.status} animation="fade-up" delay={i * 100}>
                  <div className={`card border p-6 text-center hover-lift h-full ${cfg.bg} ${cfg.border} ${cfg.ring}`}>
                    <p className="text-4xl">{cfg.emoji}</p>
                    <p className="mt-3 text-lg font-extrabold text-ink">{cfg.label}</p>
                    <p className="mt-2 text-sm text-slate-500 leading-relaxed">{s.condition}</p>
                    <span className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-bold ${cfg.badge}`}>
                      {s.bonus}
                    </span>
                    <p className="mt-3 text-xs text-muted">{s.advantage}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          <ScrollReveal animation="fade-up" delay={400}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-sm text-muted">
              <span className="font-medium text-slate-500">⭐ Starter</span>
              <span className="text-brand-300">──▶</span>
              <span className="font-medium text-slate-600">🥈 Silver</span>
              <span className="text-brand-300">──▶</span>
              <span className="font-medium text-amber-600">🥇 Gold</span>
              <span className="text-brand-300">──▶</span>
              <span className="font-bold text-brand-700">🏆 Master</span>
              <span className="text-brand-300">──▶</span>
              <span className="font-bold text-yellow-600">👑 Elite</span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════ ESPACE PARTENAIRE ═══════════ */}
      <section id="espace" className="mx-auto max-w-6xl px-4 py-24">
        <ScrollReveal animation="fade-up">
          <div className="text-center">
            <span className="rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-600">
              Votre espace dédié
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
              Tout ce qu&apos;il vous faut pour réussir
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted">
              Gérez l&apos;intégralité de votre activité en totale autonomie, directement depuis votre téléphone.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {PARTNER_MODULES.map(({ icon, title, desc }, i) => (
            <ScrollReveal key={title} animation="scale-in" delay={i * 70}>
              <div className="card group hover-lift h-full p-5 hover:border-brand-200 transition-all duration-200">
                <div className="mb-3 text-2xl">{icon}</div>
                <h3 className="font-bold text-ink group-hover:text-brand-700 transition-colors">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{desc}</p>
              </div>
            </ScrollReveal>
          ))}
          <ScrollReveal animation="scale-in" delay={PARTNER_MODULES.length * 70}>
            <div className="card border-dashed border-brand-200 bg-brand-50/50 p-5 flex flex-col items-center justify-center text-center hover-lift h-full">
              <span className="text-2xl">✨</span>
              <p className="mt-2 font-bold text-brand-700">Et bien plus</p>
              <p className="mt-1 text-sm text-brand-500">Analytics, classement, support, notifications…</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section id="faq" className="bg-white py-24">
        <div className="mx-auto max-w-3xl px-4">
          <ScrollReveal animation="fade-up">
            <div className="text-center">
              <span className="rounded-full bg-teal-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-teal-600">
                Vos questions
              </span>
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
          <div className="animate-float absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/5" style={{ animationDelay: "0s" }} />
          <div className="animate-float absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/5" style={{ animationDelay: "1.5s" }} />
          <div className="animate-float absolute left-1/3 top-1/4 h-40 w-40 rounded-full bg-white/5" style={{ animationDelay: "0.7s" }} />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center text-white">
          <ScrollReveal animation="scale-in">
            <p className="text-5xl">🚀</p>
            <h2 className="mt-5 text-3xl font-extrabold sm:text-4xl">
              Prêt à rejoindre IBIG PARTNERS&nbsp;?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-brand-100 text-lg leading-relaxed">
              Inscription gratuite. Aucun investissement. Commencez à générer des revenus
              dès aujourd&apos;hui en promouvant ce que vous aimez.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/rejoindre"
                className="rounded-xl bg-white px-8 py-4 font-bold text-brand-700 shadow-xl hover:bg-brand-50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 text-lg"
              >
                Créer mon compte — Gratuit
              </Link>
              <Link
                href="/connexion"
                className="rounded-xl border-2 border-white/30 px-8 py-4 font-semibold text-white hover:bg-white/10 transition-all duration-200 text-lg"
              >
                Déjà partenaire ? Se connecter
              </Link>
            </div>
            <p className="mt-6 text-sm text-brand-200">
              ✓ Sans engagement · ✓ Aucune carte bancaire requise · ✓ Activez vos produits en 2 minutes
            </p>
          </ScrollReveal>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

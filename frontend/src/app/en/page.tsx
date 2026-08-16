import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Icon, type IconName } from "@/components/icons";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "IBIG PARTNERS — Pan-African Affiliate Program",
  description:
    "Join the IBIG SARL affiliate program: one account to promote 14 business software products, training, real estate and services across Africa and the diaspora.",
  alternates: {
    canonical: "https://ibigpartners.com/en",
    languages: {
      fr: "https://ibigpartners.com/",
      en: "https://ibigpartners.com/en",
      "x-default": "https://ibigpartners.com/",
    },
  },
  openGraph: {
    title: "IBIG PARTNERS — Pan-African Affiliate Program",
    description:
      "One account for the entire IBIG ecosystem: 14 business software products, training, real estate and services, with transparent 3-level commissions.",
    siteName: "IBIG PARTNERS",
    locale: "en_US",
    type: "website",
  },
};

/* ── Reassurance line under the primary CTA ── */
const REASSURANCE = ["Free", "Sign up in 2 min", "No credit card", "No commitment"];

/* ── Hero stats bar ── */
const STATS: { val: string; label: string }[] = [
  { val: "9", label: "Group branches" },
  { val: "3", label: "Commission levels" },
  { val: "50%", label: "Up to, on N1" },
  { val: "7 days", label: "Payout window" },
];

/* ── 14 business software (ERP/SaaS) — exact data ── */
const SOFTWARES: {
  name: string;
  sector: string;
  price: string;
  site: string;
  icon: IconName;
  color: string;
  chipColor: string;
}[] = [
  { name: "Scolaby", sector: "School management", price: "from 10,000 FCFA/mo", site: "scolaby.com", icon: "graduation", color: "from-brand-500 to-brand-700", chipColor: "bg-brand-50 text-brand-700" },
  { name: "IBIG Fleet 360", sector: "Fleet management", price: "from 19,900 FCFA/mo", site: "ibigfleet360.com", icon: "cpu", color: "from-rose-500 to-pink-600", chipColor: "bg-rose-50 text-rose-700" },
  { name: "Lokativo", sector: "Real estate management", price: "from 9,900 FCFA/mo", site: "lokativo.com", icon: "home", color: "from-amber-500 to-orange-600", chipColor: "bg-amber-50 text-amber-700" },
  { name: "GESCOMXEL", sector: "Commercial management / CRM", price: "from 5,000 FCFA/mo", site: "ibigsoft.com/gescomxel.php", icon: "chart", color: "from-indigo-500 to-blue-700", chipColor: "bg-indigo-50 text-indigo-700" },
  { name: "Zelivry", sector: "Delivery management", price: "from 4,900 FCFA/mo", site: "zelivry.com", icon: "rocket", color: "from-emerald-500 to-teal-600", chipColor: "bg-emerald-50 text-emerald-700" },
  { name: "STOCKFLOW ERP", sector: "Stock / commercial ERP", price: "from 5,000 FCFA/mo", site: "stockflow.ibigsoft.com", icon: "layers", color: "from-violet-500 to-purple-700", chipColor: "bg-violet-50 text-violet-700" },
  { name: "CONSTRUIRO ERP", sector: "Construction / BTP", price: "from 15,000 FCFA/mo", site: "construiro.com", icon: "building", color: "from-orange-500 to-red-600", chipColor: "bg-orange-50 text-orange-700" },
  { name: "SANTAREX ERP", sector: "Hospital management", price: "from 12,000 FCFA/mo", site: "santarex.ibigsoft.com", icon: "shield", color: "from-red-500 to-rose-600", chipColor: "bg-red-50 text-red-700" },
  { name: "AGRIFRIK", sector: "Agricultural ERP", price: "from 6,500 FCFA/mo", site: "agrifrik.ibigsoft.com", icon: "globe", color: "from-green-500 to-emerald-600", chipColor: "bg-green-50 text-green-700" },
  { name: "GESTMONEY", sector: "Mobile Money networks", price: "from 9,900 FCFA/mo", site: "gestmoney.ibigsoft.com", icon: "wallet", color: "from-cyan-500 to-sky-600", chipColor: "bg-cyan-50 text-cyan-700" },
  { name: "ANOUANZÊ ERP", sector: "Associations & NGOs", price: "from 12,900 FCFA/mo", site: "anouanze.ibigsoft.com", icon: "handshake", color: "from-fuchsia-500 to-pink-600", chipColor: "bg-fuchsia-50 text-fuchsia-700" },
  { name: "IBIG FactPro", sector: "Invoicing (OHADA)", price: "from 4,900 FCFA/mo", site: "factpro.ibigsoft.com", icon: "card", color: "from-blue-500 to-indigo-600", chipColor: "bg-blue-50 text-blue-700" },
  { name: "SECRETIS ERP", sector: "Mail & secretariat", price: "from 4,900 FCFA/mo", site: "secretis.ibigsoft.com", icon: "briefcase", color: "from-teal-500 to-cyan-700", chipColor: "bg-teal-50 text-teal-700" },
  { name: "IBIG DocPro", sector: "Document generation", price: "from 100 FCFA/document (pay-as-you-go)", site: "docpro.ibigsoft.com", icon: "sparkles", color: "from-slate-600 to-slate-800", chipColor: "bg-slate-100 text-slate-700" },
];

/* ── How it works ── */
const STEPS: { icon: IconName; title: string; desc: string }[] = [
  { icon: "key", title: "Sign up free", desc: "Create your partner account in about two minutes — no card, no commitment." },
  { icon: "puzzle", title: "Activate products", desc: "Pick the software, training and services you want to promote from your dashboard." },
  { icon: "link", title: "Share your links", desc: "Get unique tracked links and a personal promo code, ready to share anywhere." },
  { icon: "coins", title: "Earn commissions", desc: "Get paid on your sales and on your network's sales, down to the third level." },
];

/* ── Why join ── */
const WHY: { icon: IconName; title: string; desc: string }[] = [
  { icon: "key", title: "One single account", desc: "Access the entire IBIG SARL portfolio with a single partner login." },
  { icon: "network", title: "3-level network", desc: "Earn on your own sales and on those of your N2 and N3 referrals." },
  { icon: "wallet", title: "Fast payout", desc: "Commissions validated and paid within 7 days via Mobile Money or bank transfer." },
  { icon: "sparkles", title: "Free marketing kit", desc: "Visuals, sales scripts and tracked links ready to use from day one." },
];

/* ── Mini-FAQ ── */
const FAQ: { q: string; a: string }[] = [
  {
    q: "Is it really free?",
    a: "Yes. Creating your partner account is 100% free — no subscription, no joining fee, no card required. You only ever earn; you never pay to participate.",
  },
  {
    q: "Is this a pyramid scheme?",
    a: "No. Commissions come only from real product sales made by IBIG SARL, a company officially registered in Côte d'Ivoire. There is no fee to join and no reward for merely recruiting people — you are paid when genuine software, training or services are sold.",
  },
  {
    q: "How am I paid?",
    a: "Once a commission is validated, you are paid within 7 days via Orange Money, Wave, MTN MoMo or bank transfer — wherever you are on the continent or in the diaspora.",
  },
];

function SectionEyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`label-caps inline-block rounded-full px-4 py-1.5 ${className}`}>
      {children}
    </span>
  );
}

export default function EnglishHomePage() {
  return (
    <>
      <SiteHeader />

      {/* ═══════════ HERO ═══════════ */}
      <section className="gradient-hero relative overflow-hidden text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/5" />
          <div className="animate-float absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5" style={{ animationDelay: "1s" }} />
          <div className="animate-float absolute right-1/4 top-1/2 h-48 w-48 rounded-full bg-brand-500/20" style={{ animationDelay: "2s" }} />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <span className="label-caps inline-block rounded-full bg-white/10 px-4 py-1.5 text-brand-100">
              IBIG SARL — Intermark Business International Group
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              One account,{" "}
              <span className="bg-gradient-to-r from-gold-400 to-amber-300 bg-clip-text text-transparent">
                the entire IBIG ecosystem
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-brand-100 sm:text-xl">
              IBIG PARTNERS is the affiliate program of the IBIG SARL group. Promote 14 business
              software products, professional training, real estate and services — all from a single
              partner account, and earn commissions on every sale.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                href="/en/rejoindre"
                className="rounded-xl bg-white px-6 py-3.5 text-center font-bold text-brand-700 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-50 hover:shadow-xl sm:px-7"
              >
                Become a Partner — it&apos;s free
              </Link>
              <a
                href="#software"
                className="rounded-xl border-2 border-white/30 px-6 py-3.5 text-center font-semibold text-white transition-all duration-200 hover:bg-white/10 sm:px-7"
              >
                See the software
              </a>
            </div>

            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-brand-100">
              {REASSURANCE.map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Icon name="check" className="h-3.5 w-3.5 shrink-0 text-gold-400" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Stats bar */}
          <div className="mt-12 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:flex sm:flex-wrap sm:gap-10 lg:mt-14">
            {STATS.map(({ val, label }) => (
              <div key={label} className="flex flex-col">
                <span className="text-numeral text-3xl text-gold-400 sm:text-4xl">{val}</span>
                <span className="mt-1 text-sm text-brand-200">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SOFTWARE CATALOG (inline, English) ═══════════ */}
      <section id="software" className="scroll-mt-20 bg-white py-24">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollReveal animation="fade-up">
            <div className="text-center">
              <SectionEyebrow className="bg-indigo-50 text-indigo-600">IBIG SOFT catalog</SectionEyebrow>
              <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
                14 business software (ERP/SaaS) to promote
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted">
                Each product solves a specific business need in Africa, with monthly and annual plans
                to fit any client. Promote the ones that match your network and earn recurring commissions.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SOFTWARES.map((sw, i) => (
              <ScrollReveal key={sw.name} animation="scale-in" delay={i * 60}>
                <div className="card-premium group flex h-full flex-col overflow-hidden p-0">
                  <div className={`flex items-center gap-3 bg-gradient-to-r ${sw.color} px-5 py-4 text-white`}>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                      <Icon name={sw.icon} className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="label-caps text-white/80">{sw.sector}</p>
                      <h3 className="font-bold leading-tight">{sw.name}</h3>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <span className="text-xs font-semibold text-slate-500">Price</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-right text-xs font-bold ${sw.chipColor}`}>
                        {sw.price}
                      </span>
                    </div>
                    <a
                      href={`https://${sw.site}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
                    >
                      {sw.site} <Icon name="trending" className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal animation="fade-up" delay={200}>
            <div className="mt-10 text-center">
              <Link
                href="/en/rejoindre"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-3.5 font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-xl"
              >
                Promote these products
                <Icon name="rocket" className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════ COMMISSIONS ═══════════ */}
      <section id="commissions" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollReveal animation="fade-up">
            <div className="text-center">
              <SectionEyebrow className="bg-emerald-50 text-emerald-600">Transparent rewards</SectionEyebrow>
              <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
                A simple 3-level commission model
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted">
                You earn on your own sales <strong>and</strong> on those of your referrals, down to the
                third level. Commissions are paid via Orange Money, Wave, MTN MoMo or bank transfer.
              </p>
            </div>
          </ScrollReveal>

          <div className="mx-auto mt-12 max-w-2xl">
            <ScrollReveal animation="slide-left">
              <div className="card-premium overflow-hidden p-0">
                <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-4 text-white">
                  <h3 className="font-bold">Monthly software subscriptions</h3>
                  <p className="mt-0.5 text-xs text-brand-100">
                    Degressive over 4 months — N1 starts at 20%, N2 and N3 lower
                  </p>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-5 py-3">Month</th>
                      <th className="px-3 py-3 text-brand-600">You (N1)</th>
                      <th className="px-3 py-3 text-indigo-600">Referral (N2)</th>
                      <th className="px-3 py-3 text-violet-600">N3</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      ["Month 1", "20%", "10%", "5%"],
                      ["Month 2", "15%", "8%", "3%"],
                      ["Month 3", "10%", "5%", "2%"],
                      ["Month 4", "5%", "3%", "1%"],
                    ].map((r) => (
                      <tr key={r[0]} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-5 py-2.5 font-medium text-slate-700">{r[0]}</td>
                        <td className="px-3 py-2.5 font-bold text-brand-600">{r[1]}</td>
                        <td className="px-3 py-2.5 text-indigo-600">{r[2]}</td>
                        <td className="px-3 py-2.5 text-violet-600">{r[3]}</td>
                      </tr>
                    ))}
                    <tr className="bg-brand-50 font-bold">
                      <td className="px-5 py-3 text-brand-800">Cumulative total</td>
                      <td className="px-3 py-3 text-brand-700">50%</td>
                      <td className="px-3 py-3 text-indigo-700">26%</td>
                      <td className="px-3 py-3 text-violet-700">11%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </ScrollReveal>

            <p className="mt-4 text-center text-sm text-muted">
              Annual plans, training and services follow the same 3-level logic, with N2 and N3 rates
              derived from the N1 rate.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollReveal animation="fade-up">
            <div className="text-center">
              <SectionEyebrow className="bg-brand-50 text-brand-600">Get started</SectionEyebrow>
              <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">How it works</h2>
              <p className="mx-auto mt-3 max-w-xl text-muted">
                Four simple steps between signing up and your first commission.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon, title, desc }, i) => (
              <ScrollReveal key={title} animation="fade-up" delay={i * 100}>
                <div className="card-premium group relative h-full p-6">
                  <span className="text-numeral absolute right-5 top-4 text-3xl text-slate-100">
                    {i + 1}
                  </span>
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

      {/* ═══════════ WHY JOIN ═══════════ */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollReveal animation="fade-up">
            <div className="text-center">
              <SectionEyebrow className="bg-violet-50 text-violet-600">Why join</SectionEyebrow>
              <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
                Every advantage, no constraints
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted">
                A platform built to give you the tools of an elite sales rep, with full freedom.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map(({ icon, title, desc }, i) => (
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

      {/* ═══════════ FAQ ═══════════ */}
      <section id="faq" className="bg-white py-24">
        <div className="mx-auto max-w-3xl px-4">
          <ScrollReveal animation="fade-up">
            <div className="text-center">
              <SectionEyebrow className="bg-brand-50 text-brand-600">FAQ</SectionEyebrow>
              <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
                Frequently asked questions
              </h2>
            </div>
          </ScrollReveal>

          <div className="mt-12 space-y-4">
            {FAQ.map(({ q, a }, i) => (
              <ScrollReveal key={q} animation="fade-up" delay={i * 100}>
                <div className="card-premium p-6">
                  <h3 className="flex items-start gap-3 font-bold text-ink">
                    <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-brand-500" />
                    {q}
                  </h3>
                  <p className="mt-2 pl-7 text-sm leading-relaxed text-muted">{a}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl font-extrabold text-ink sm:text-5xl">
              Ready to build your <br className="hidden sm:block" /> success with us?
            </h2>
            <p className="mt-6 text-lg text-muted sm:text-xl">
              Join the partners already earning with the IBIG ecosystem — from the continent and the diaspora.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/en/rejoindre"
                className="w-full rounded-xl bg-brand-600 px-8 py-4 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-brand-700 hover:shadow-xl sm:w-auto"
              >
                Create my free account
              </Link>
              <Link
                href="/connexion"
                className="w-full rounded-xl border border-slate-200 bg-white px-8 py-4 font-bold text-ink shadow-sm transition-all hover:-translate-y-1 hover:bg-slate-50 sm:w-auto"
              >
                Log in
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted">No hidden fees · No commitment · Support 7/7</p>
          </ScrollReveal>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

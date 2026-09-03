import Link from "next/link";
import Image from "next/image";
import { MobileMenu } from "./mobile-menu";
import { LangSwitcher } from "./lang-switcher";

type Lang = "fr" | "en";

export function Logo({ light = false, lang = "fr" }: { light?: boolean; lang?: Lang }) {
  return (
    <Link href={lang === "en" ? "/en" : "/"} className="group flex shrink-0 items-center gap-2.5 transition-transform hover:scale-[1.02]">
      <span className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl shadow-md shadow-brand-700/30 ring-1 ring-white/10">
        <Image src="/icon.svg" alt="IBIG PARTNERS" width={40} height={40} priority />
      </span>
      <span className={`whitespace-nowrap font-extrabold tracking-tight leading-none ${light ? "text-white" : "text-ink"}`}>
        IBIG <span className={light ? "text-gold-400" : "text-brand-600"}>PARTNERS</span>
      </span>
    </Link>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="relative rounded-lg px-3 py-2 text-slate-600 hover:text-brand-700 transition-colors after:absolute after:bottom-1 after:left-1/2 after:h-0.5 after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-brand-500 after:transition-all hover:after:w-4"
    >
      {children}
    </a>
  );
}

const MARQUEE_ITEMS: Record<Lang, string[]> = {
  fr: [
    "Bienvenue sur IBIG PARTNERS — votre plateforme d'opportunités économiques en Afrique",
    "Un seul compte, tous les produits du groupe IBIG SARL",
    "Des commissions transparentes sur 3 niveaux",
    "Inscription 100% gratuite, sans investissement",
    "Construisez un revenu durable et bâtissez votre équipe",
  ],
  en: [
    "Welcome to IBIG PARTNERS — your platform of economic opportunities in Africa",
    "One account, every product of the IBIG SARL group",
    "Transparent commissions across 3 levels",
    "100% free sign-up, no investment required",
    "Build a lasting income and grow your team",
  ],
};

function MarqueeBanner({ lang = "fr" }: { lang?: Lang }) {
  // Deux copies identiques pour une boucle continue sans coupure.
  const sequence = [...MARQUEE_ITEMS[lang], ...MARQUEE_ITEMS[lang]];
  return (
    <div className="relative z-40 flex items-stretch bg-gradient-to-r from-brand-800 via-brand-700 to-brand-600 text-white">
      <div className="marquee-mask flex-1 overflow-hidden py-2">
        <div className="marquee-track">
          {sequence.map((item, i) => (
            <span key={i} className="mx-6 inline-flex items-center gap-3 text-xs font-medium tracking-wide text-brand-50">
              <span className="text-gold-400">◆</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const HEADER_NAV: Record<Lang, { href: string; label: string }[]> = {
  fr: [
    { href: "/#branches", label: "Branches" },
    { href: "/#commissions", label: "Commissions" },
    { href: "/#statuts", label: "Statuts" },
    { href: "/#espace", label: "Espace partenaire" },
    { href: "/#faq", label: "FAQ" },
  ],
  en: [
    { href: "/en#software", label: "Software" },
    { href: "/en#commissions", label: "Commissions" },
    { href: "/en#faq", label: "FAQ" },
  ],
};

const HEADER_T = {
  fr: { top: "Top Partenaires", topHref: "/top-partenaires", partners: "Nos partenaires", partnersHref: "/partenaires", signIn: "Connexion", join: "Devenir Partenaire", joinHref: "/rejoindre" },
  en: { top: "Top Partners", topHref: "/en/top-partenaires", partners: "Our partners", partnersHref: "/en/partenaires", signIn: "Sign in", join: "Become a Partner", joinHref: "/en/rejoindre" },
} as const;

export function SiteHeader({ lang = "fr" }: { lang?: Lang }) {
  const t = HEADER_T[lang];
  return (
    <>
    <MarqueeBanner lang={lang} />
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 shadow-[0_1px_0_rgba(11,79,224,0.04),0_8px_24px_-12px_rgba(11,79,224,0.08)]">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <Logo lang={lang} />

        {/* Navigation desktop */}
        <nav className="hidden items-center gap-1 text-sm font-medium text-slate-600 lg:flex">
          {HEADER_NAV[lang].map((item) => (
            <NavLink key={item.href} href={item.href}>{item.label}</NavLink>
          ))}
          <Link
            href={t.topHref}
            className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400/15 to-orange-500/15 px-3 py-1.5 text-amber-700 font-semibold ring-1 ring-amber-300/40 hover:from-amber-400/25 hover:to-orange-500/25 transition-all"
          >
            <span>🏆</span>
            <span className="hidden xl:inline">{t.top}</span>
            <span className="xl:hidden">Top</span>
          </Link>
          <NavLink href={t.partnersHref}>{t.partners}</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <LangSwitcher />
          <Link
            href="/connexion"
            className="hidden rounded-lg px-3.5 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition-colors sm:inline-flex"
          >
            {t.signIn}
          </Link>
          <Link
            href={t.joinHref}
            className="group relative hidden sm:inline-flex items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-brand-600 via-brand-600 to-brand-700 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-600/40"
          >
            <span className="relative z-10">{t.join}</span>
            <span className="relative z-10 transition-transform group-hover:translate-x-0.5">→</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </Link>
          {/* Hamburger mobile */}
          <MobileMenu lang={lang} />
        </div>
      </div>
    </header>
    </>
  );
}

function WhatsAppBubble() {
  return (
    <a
      href="https://wa.me/2250778882592?text=Bonjour%2C%20je%20souhaite%20des%20informations%20sur%20IBIG%20PARTNERS"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter IBIG PARTNERS sur WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-transform hover:scale-110"
      style={{ backgroundColor: "#25D366" }}
    >
      <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  );
}

const FOOTER_T = {
  fr: {
    brand: "La plateforme centrale d'affiliation et de partenariat commercial d'INTERMARK BUSINESS INTERNATIONAL GROUP SARL. Gagnez des commissions sur 3 niveaux.",
    freeSignup: "✓ Inscription gratuite",
    fastPay: "✓ Paiement rapide",
    group: "Groupe IBIG",
    builtBy: "— Développé par IBIG Soft",
    program: "Programme",
    nav: [
      { href: "/#branches", label: "Branches", cls: "text-slate-400 hover:text-brand-400" },
      { href: "/#commissions", label: "Commissions", cls: "text-slate-400 hover:text-brand-400" },
      { href: "/#statuts", label: "Statuts", cls: "text-slate-400 hover:text-brand-400" },
      { href: "/#faq", label: "FAQ", cls: "text-slate-400 hover:text-brand-400" },
    ],
    top: "🏆 Top Partenaires",
    topHref: "/top-partenaires",
    partners: "Nos partenaires",
    partnersHref: "/partenaires",
    join: "Rejoindre",
    joinHref: "/rejoindre",
    signIn: "Connexion",
    legal: "Légal",
    cgu: "CGU",
    cgv: "CGV",
    cguHref: "/cgu",
    cgvHref: "/cgv",
    privacy: "Politique de confidentialité",
    privacyHref: "/confidentialite",
    cookies: "Politique cookies",
    cookiesHref: "/cookies",
    support: "— Support",
    groupTag: "— Groupe",
    rights: "© 2026 IBIG PARTNERS. Tous droits réservés.",
    devBy: "Développé par",
  },
  en: {
    brand: "The central affiliate and commercial partnership platform of INTERMARK BUSINESS INTERNATIONAL GROUP SARL. Earn commissions across 3 levels.",
    freeSignup: "✓ Free sign-up",
    fastPay: "✓ Fast payout",
    group: "IBIG Group",
    builtBy: "— Built by IBIG Soft",
    program: "Program",
    nav: [
      { href: "/en#software", label: "Software", cls: "text-slate-400 hover:text-brand-400" },
      { href: "/en#commissions", label: "Commissions", cls: "text-slate-400 hover:text-brand-400" },
      { href: "/en#faq", label: "FAQ", cls: "text-slate-400 hover:text-brand-400" },
    ],
    top: "🏆 Top Partners",
    topHref: "/en/top-partenaires",
    partners: "Our partners",
    partnersHref: "/en/partenaires",
    join: "Join",
    joinHref: "/en/rejoindre",
    signIn: "Sign in",
    legal: "Legal",
    cgu: "Terms of Use",
    cgv: "Terms of Sale",
    cguHref: "/en/cgu",
    cgvHref: "/en/cgv",
    privacy: "Privacy Policy",
    privacyHref: "/en/confidentialite",
    cookies: "Cookie Policy",
    cookiesHref: "/en/cookies",
    support: "— Support",
    groupTag: "— Group",
    rights: "© 2026 IBIG PARTNERS. All rights reserved.",
    devBy: "Built by",
  },
} as const;

export function SiteFooter({ lang = "fr" }: { lang?: Lang }) {
  const f = FOOTER_T[lang];
  return (
    <>
      <footer className="mt-auto bg-slate-900 text-slate-300">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">

            {/* Colonne 1 : Marque */}
            <div className="lg:col-span-1">
              <Logo light lang={lang} />
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {f.brand}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-900/50 px-3 py-1 text-xs font-semibold text-emerald-400">
                  {f.freeSignup}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-900/50 px-3 py-1 text-xs font-semibold text-brand-300">
                  {f.fastPay}
                </span>
              </div>
              <a
                href="https://intermark-business.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-xs text-slate-500 hover:text-brand-400 transition-colors"
              >
                intermark-business.com ↗
              </a>
            </div>

            {/* Colonne 2 : Groupe IBIG */}
            <div>
              <p className="text-sm font-bold text-white">{f.group}</p>
              <div className="mt-3 space-y-2 text-sm text-slate-400">
                <a href="https://intermark-business.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-300 hover:text-brand-400 transition-colors">INTERMARK BUSINESS INTERNATIONAL GROUP SARL</a>
                <p>Cocody Riviera Palmeraie<br />Abidjan, Côte d&apos;Ivoire</p>
                <p>
                  <a href="https://intermark-business.com/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-400 transition-colors">
                    intermark-business.com ↗
                  </a>
                </p>
                <p>
                  <a href="https://ibigsoft.com/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-400 transition-colors">
                    ibigsoft.com ↗
                  </a>
                  <span className="ml-1 text-xs text-slate-500">{f.builtBy}</span>
                </p>
              </div>
            </div>

            {/* Colonne 3 : Programme */}
            <div>
              <p className="text-sm font-bold text-white">{f.program}</p>
              <ul className="mt-3 space-y-2 text-sm">
                {f.nav.map((item) => (
                  <li key={item.href}><a href={item.href} className="text-slate-400 hover:text-brand-400 transition-colors">{item.label}</a></li>
                ))}
                <li><Link href={f.topHref} className="text-amber-400 hover:text-amber-300 transition-colors font-semibold">{f.top}</Link></li>
                <li><Link href={f.partnersHref} className="text-slate-400 hover:text-brand-400 transition-colors">{f.partners}</Link></li>
                <li><Link href={f.joinHref} className="text-slate-400 hover:text-brand-400 transition-colors">{f.join}</Link></li>
                <li><Link href="/connexion" className="text-slate-400 hover:text-brand-400 transition-colors">{f.signIn}</Link></li>
              </ul>
            </div>

            {/* Colonne 4 : Légal */}
            <div>
              <p className="text-sm font-bold text-white">{f.legal}</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href={f.cguHref} className="text-slate-400 hover:text-brand-400 transition-colors">{f.cgu}</Link></li>
                <li><Link href={f.cgvHref} className="text-slate-400 hover:text-brand-400 transition-colors">{f.cgv}</Link></li>
                <li><Link href={f.privacyHref} className="text-slate-400 hover:text-brand-400 transition-colors">{f.privacy}</Link></li>
                <li><Link href={f.cookiesHref} className="text-slate-400 hover:text-brand-400 transition-colors">{f.cookies}</Link></li>
              </ul>
            </div>

            {/* Colonne 5 : Contact */}
            <div>
              <p className="text-sm font-bold text-white">Contact</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li>
                  <a href="mailto:contact@ibigpartners.com" className="hover:text-brand-400 transition-colors">
                    contact@ibigpartners.com
                  </a>
                </li>
                <li>
                  <a href="mailto:support@ibigpartners.com" className="hover:text-brand-400 transition-colors">
                    support@ibigpartners.com
                  </a>
                  <span className="ml-1 text-xs text-slate-500">{f.support}</span>
                </li>
                <li>
                  <a href="mailto:contact@intermark-business.com" className="hover:text-brand-400 transition-colors">
                    contact@intermark-business.com
                  </a>
                  <span className="ml-1 text-xs text-slate-500">{f.groupTag}</span>
                </li>
                <li>
                  <a href="tel:+2252722276014" className="hover:text-brand-400 transition-colors">
                    +225 27 22 27 60 14
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/2250778882592" target="_blank" rel="noopener noreferrer" className="hover:text-brand-400 transition-colors">
                    +225 07 78 88 25 92
                  </a>
                  <span className="ml-1 text-xs text-slate-500">— WhatsApp</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-6 text-xs text-slate-500">
            <p>{f.rights}</p>
            <a href="https://intermark-business.com/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-400 transition-colors">INTERMARK BUSINESS INTERNATIONAL GROUP SARL</a>
            <p>
              {f.devBy}{" "}
              <a href="https://ibigsoft.com/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-400 transition-colors">
                IBIG Soft
              </a>
            </p>
          </div>
        </div>
      </footer>
      <WhatsAppBubble />
    </>
  );
}

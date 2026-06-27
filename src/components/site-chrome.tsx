import Link from "next/link";
import { MobileMenu } from "./mobile-menu";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white font-extrabold text-sm shadow-sm">
        iB
      </span>
      <span className={`font-extrabold tracking-tight ${light ? "text-white" : "text-ink"}`}>
        IBIG <span className={light ? "text-brand-300" : "text-brand-500"}>PARTNERS</span>
      </span>
    </Link>
  );
}

const MARQUEE_ITEMS = [
  "Bienvenue sur IBIG PARTNERS — votre plateforme d'opportunités économiques en Afrique",
  "Un seul compte, tous les produits du groupe IBIG SARL",
  "Des commissions transparentes sur 3 niveaux",
  "Inscription 100% gratuite, sans investissement",
  "Construisez un revenu durable et bâtissez votre équipe",
];

function MarqueeBanner() {
  // Deux copies identiques pour une boucle continue sans coupure.
  const sequence = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
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
      <Link
        href="/rejoindre"
        className="hidden shrink-0 items-center gap-1.5 self-stretch bg-gold-400 px-5 text-xs font-bold uppercase tracking-wide text-brand-900 transition-colors hover:bg-gold-500 sm:flex"
      >
        Devenir Partenaire →
      </Link>
    </div>
  );
}

export function SiteHeader() {
  return (
    <>
    <MarqueeBanner />
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Logo />

        {/* Navigation desktop */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <a href="/#branches" className="hover:text-brand-600 transition-colors">Branches</a>
          <a href="/#commissions" className="hover:text-brand-600 transition-colors">Commissions</a>
          <a href="/#statuts" className="hover:text-brand-600 transition-colors">Statuts</a>
          <a href="/#espace" className="hover:text-brand-600 transition-colors">Espace partenaire</a>
          <a href="/#faq" className="hover:text-brand-600 transition-colors">FAQ</a>
          <Link href="/partenaires" className="hover:text-brand-600 transition-colors">Nos partenaires</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/connexion"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 transition-colors sm:block"
          >
            Connexion
          </Link>
          <Link
            href="/rejoindre"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors shadow-sm"
          >
            Devenir Partenaire
          </Link>
          {/* Hamburger mobile */}
          <MobileMenu />
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

export function SiteFooter() {
  return (
    <>
      <footer className="mt-auto bg-slate-900 text-slate-300">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">

            {/* Colonne 1 : Marque */}
            <div className="lg:col-span-1">
              <Logo light />
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                La plateforme centrale d&apos;affiliation et de partenariat
                commercial d&apos;INTERMARK BUSINESS INTERNATIONAL GROUP SARL.
                Gagnez des commissions sur 3 niveaux.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-900/50 px-3 py-1 text-xs font-semibold text-emerald-400">
                  ✓ Inscription gratuite
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-900/50 px-3 py-1 text-xs font-semibold text-brand-300">
                  ✓ Paiement rapide
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
              <p className="text-sm font-bold text-white">Groupe IBIG</p>
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
                  <span className="ml-1 text-xs text-slate-500">— Développé par IBIG Soft</span>
                </p>
              </div>
            </div>

            {/* Colonne 3 : Programme */}
            <div>
              <p className="text-sm font-bold text-white">Programme</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="/#branches" className="text-slate-400 hover:text-brand-400 transition-colors">Branches</a></li>
                <li><a href="/#commissions" className="text-slate-400 hover:text-brand-400 transition-colors">Commissions</a></li>
                <li><a href="/#statuts" className="text-slate-400 hover:text-brand-400 transition-colors">Statuts</a></li>
                <li><a href="/#faq" className="text-slate-400 hover:text-brand-400 transition-colors">FAQ</a></li>
                <li><Link href="/partenaires" className="text-slate-400 hover:text-brand-400 transition-colors">Nos partenaires</Link></li>
                <li><Link href="/rejoindre" className="text-slate-400 hover:text-brand-400 transition-colors">Rejoindre</Link></li>
                <li><Link href="/connexion" className="text-slate-400 hover:text-brand-400 transition-colors">Connexion</Link></li>
              </ul>
            </div>

            {/* Colonne 4 : Légal */}
            <div>
              <p className="text-sm font-bold text-white">Légal</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/cgu" className="text-slate-400 hover:text-brand-400 transition-colors">CGU</Link></li>
                <li><Link href="/cgv" className="text-slate-400 hover:text-brand-400 transition-colors">CGV</Link></li>
                <li><Link href="/confidentialite" className="text-slate-400 hover:text-brand-400 transition-colors">Politique de confidentialité</Link></li>
                <li><Link href="/cookies" className="text-slate-400 hover:text-brand-400 transition-colors">Politique cookies</Link></li>
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
                  <span className="ml-1 text-xs text-slate-500">— Support</span>
                </li>
                <li>
                  <a href="mailto:contact@intermark-business.com" className="hover:text-brand-400 transition-colors">
                    contact@intermark-business.com
                  </a>
                  <span className="ml-1 text-xs text-slate-500">— Groupe</span>
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
            <p>© 2026 IBIG PARTNERS. Tous droits réservés.</p>
            <a href="https://intermark-business.com/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-400 transition-colors">INTERMARK BUSINESS INTERNATIONAL GROUP SARL</a>
            <p>
              Développé par{" "}
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

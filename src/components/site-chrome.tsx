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

export function SiteHeader() {
  return (
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
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-wrap items-start justify-between gap-8">
          {/* Brand */}
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-sm text-muted leading-relaxed">
              La plateforme centrale d&apos;affiliation et de partenariat
              commercial du Groupe IBIG SARL. Gagnez des commissions sur 3 niveaux.
            </p>
            <div className="mt-4 flex gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                ✓ Inscription gratuite
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                ✓ Paiement rapide
              </span>
            </div>
          </div>

          {/* Adresse */}
          <div>
            <p className="text-sm font-bold text-ink">IBIG SARL</p>
            <p className="mt-2 text-sm text-muted">Groupe Intermark Business International</p>
            <p className="text-sm text-muted">Cocody Riviera Palmeraie</p>
            <p className="text-sm text-muted">Abidjan, Côte d&apos;Ivoire</p>
            <p className="mt-2 text-sm text-muted">
              <a href="https://ibigpartners.com" className="hover:text-brand-600">ibigpartners.com</a>
              {" · "}
              <a href="https://ibigsoft.com" className="hover:text-brand-600">ibigsoft.com</a>
            </p>
          </div>

          {/* Liens */}
          <div>
            <p className="text-sm font-bold text-ink">Programme</p>
            <ul className="mt-2 space-y-2 text-sm text-muted">
              <li><a href="/#branches" className="hover:text-brand-600 transition-colors">Branches du groupe</a></li>
              <li><a href="/#commissions" className="hover:text-brand-600 transition-colors">Grille de commissions</a></li>
              <li><a href="/#statuts" className="hover:text-brand-600 transition-colors">Niveaux de statut</a></li>
              <li><a href="/#faq" className="hover:text-brand-600 transition-colors">Questions fréquentes</a></li>
            </ul>
          </div>

          {/* Compte */}
          <div>
            <p className="text-sm font-bold text-ink">Espace partenaire</p>
            <ul className="mt-2 space-y-2 text-sm text-muted">
              <li><Link href="/rejoindre" className="hover:text-brand-600 transition-colors">Devenir partenaire</Link></li>
              <li><Link href="/connexion" className="hover:text-brand-600 transition-colors">Se connecter</Link></li>
              <li><Link href="/cgu" className="hover:text-brand-600 transition-colors">Conditions d'utilisation</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} IBIG SARL. Tous droits réservés.</p>
          <p>Développé pour le Groupe Intermark Business International</p>
        </div>
      </div>
    </footer>
  );
}

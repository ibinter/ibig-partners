import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const metadata = {
  title: "Politique cookies — IBIG PARTNERS",
  description: "Politique d'utilisation des cookies sur la plateforme IBIG PARTNERS.",
};

export default function CookiesPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/" className="text-sm text-brand-600 hover:underline">← Retour à l'accueil</Link>

        <h1 className="mt-6 text-3xl font-extrabold text-ink">Politique cookies</h1>
        <p className="mt-2 text-sm text-muted">Dernière mise à jour : juin 2026 — INTERMARK BUSINESS INTERNATIONAL GROUP SARL (IBIG SARL), Abidjan, Côte d&apos;Ivoire</p>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-slate-700">

          <section>
            <h2 className="text-lg font-bold text-ink">1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
            <p className="mt-3">
              Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone)
              lors de votre visite sur la plateforme IBIG PARTNERS. Il permet à notre site de vous reconnaître,
              de mémoriser vos préférences et d&apos;améliorer votre expérience de navigation.
            </p>
            <p className="mt-3">
              Les cookies ne peuvent pas endommager votre appareil ni accéder à d&apos;autres informations
              que celles que vous avez accepté de partager avec nous.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">2. Cookies utilisés sur IBIG PARTNERS</h2>

            <h3 className="mt-4 font-semibold text-ink">2.1 Cookies techniques (essentiels)</h3>
            <p className="mt-2">
              Ces cookies sont indispensables au fonctionnement de la plateforme. Ils ne peuvent pas être
              désactivés sans impacter votre utilisation du service.
            </p>
            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-left font-semibold text-slate-600">
                  <tr>
                    <th className="px-4 py-2">Nom</th>
                    <th className="px-4 py-2">Finalité</th>
                    <th className="px-4 py-2">Durée</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-2 font-mono">session_token</td>
                    <td className="px-4 py-2">Authentification et session partenaire</td>
                    <td className="px-4 py-2">Session (fermeture navigateur)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono">csrf_token</td>
                    <td className="px-4 py-2">Protection contre les attaques CSRF</td>
                    <td className="px-4 py-2">Session</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono">remember_me</td>
                    <td className="px-4 py-2">Maintien de la connexion (option "Se souvenir")</td>
                    <td className="px-4 py-2">30 jours</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="mt-6 font-semibold text-ink">2.2 Cookies analytiques</h3>
            <p className="mt-2">
              Ces cookies nous permettent de comprendre comment les visiteurs interagissent avec notre
              plateforme, afin de l&apos;améliorer. Les données collectées sont anonymisées.
            </p>
            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-left font-semibold text-slate-600">
                  <tr>
                    <th className="px-4 py-2">Nom</th>
                    <th className="px-4 py-2">Finalité</th>
                    <th className="px-4 py-2">Durée</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-2 font-mono">_analytics</td>
                    <td className="px-4 py-2">Mesure d&apos;audience anonymisée</td>
                    <td className="px-4 py-2">13 mois</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono">aff_click</td>
                    <td className="px-4 py-2">Suivi des clics sur les liens d&apos;affiliation</td>
                    <td className="px-4 py-2">30 jours</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="mt-6 font-semibold text-ink">2.3 Cookies marketing (optionnels)</h3>
            <p className="mt-2">
              Ces cookies sont utilisés pour vous proposer des contenus pertinents et mesurer l&apos;efficacité
              de nos campagnes. Ils nécessitent votre consentement explicite.
            </p>
            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-left font-semibold text-slate-600">
                  <tr>
                    <th className="px-4 py-2">Nom</th>
                    <th className="px-4 py-2">Finalité</th>
                    <th className="px-4 py-2">Durée</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-2 font-mono">_fbp</td>
                    <td className="px-4 py-2">Publicité Facebook (Meta Pixel, si activé)</td>
                    <td className="px-4 py-2">90 jours</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono">ref_code</td>
                    <td className="px-4 py-2">Attribution du code parrain lors de l&apos;inscription</td>
                    <td className="px-4 py-2">30 jours</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">3. Comment gérer vos cookies</h2>
            <p className="mt-3">
              Vous pouvez à tout moment modifier vos préférences en matière de cookies :
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong>Via votre navigateur</strong> : la plupart des navigateurs vous permettent de
                bloquer ou supprimer les cookies dans leurs paramètres (Paramètres → Confidentialité →
                Cookies). Notez que la désactivation de certains cookies peut affecter le fonctionnement
                de la plateforme.
              </li>
              <li>
                <strong>Google Chrome</strong> : Paramètres → Confidentialité et sécurité → Cookies
              </li>
              <li>
                <strong>Mozilla Firefox</strong> : Paramètres → Vie privée et sécurité → Cookies
              </li>
              <li>
                <strong>Safari</strong> : Préférences → Confidentialité → Cookies
              </li>
              <li>
                <strong>Microsoft Edge</strong> : Paramètres → Confidentialité, recherche et services → Cookies
              </li>
            </ul>
            <p className="mt-3">
              Pour en savoir plus sur la gestion des cookies, visitez{" "}
              <a
                href="https://www.allaboutcookies.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:underline"
              >
                allaboutcookies.org
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">4. Contact</h2>
            <p className="mt-3">Pour toute question relative à notre politique de cookies :</p>
            <ul className="mt-3 space-y-1">
              <li>Email : <a href="mailto:contact@ibigpartners.com" className="text-brand-600 hover:underline">contact@ibigpartners.com</a></li>
              <li>Adresse : INTERMARK BUSINESS INTERNATIONAL GROUP SARL, Cocody Riviera Palmeraie, Abidjan, Côte d&apos;Ivoire</li>
            </ul>
          </section>

        </div>

        <div className="mt-12 border-t border-slate-200 pt-8 text-center">
          <Link
            href="/rejoindre"
            className="inline-block rounded-xl bg-brand-600 px-8 py-3 font-semibold text-white hover:bg-brand-700"
          >
            Devenir Partenaire — c&apos;est gratuit
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

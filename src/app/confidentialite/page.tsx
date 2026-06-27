import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const metadata = {
  title: "Politique de confidentialité — IBIG PARTNERS",
  description: "Politique de confidentialité et protection des données personnelles — INTERMARK BUSINESS INTERNATIONAL GROUP SARL.",
};

export default function ConfidentialitePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/" className="text-sm text-brand-600 hover:underline">← Retour à l'accueil</Link>

        <h1 className="mt-6 text-3xl font-extrabold text-ink">Politique de confidentialité</h1>
        <p className="mt-2 text-sm text-muted">Dernière mise à jour : juin 2026 — INTERMARK BUSINESS INTERNATIONAL GROUP SARL (IBIG SARL), Abidjan, Côte d&apos;Ivoire</p>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-slate-700">

          <section>
            <h2 className="text-lg font-bold text-ink">1. Données collectées</h2>
            <p className="mt-3">
              Dans le cadre du programme IBIG PARTNERS, <strong>INTERMARK BUSINESS INTERNATIONAL GROUP SARL</strong>
              (IBIG SARL) collecte les données personnelles suivantes :
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Données d'identification</strong> : nom, prénom, date de naissance, numéro de pièce d'identité.</li>
              <li><strong>Données de contact</strong> : adresse email, numéro de téléphone, adresse postale.</li>
              <li><strong>Données financières</strong> : coordonnées mobile money, IBAN, informations PayPal.</li>
              <li><strong>Données professionnelles</strong> : statut, type de partenaire (particulier/entreprise), RCCM pour les entreprises.</li>
              <li><strong>Données d'utilisation</strong> : historique de connexion, ventes, commissions, clics sur les liens d'affiliation.</li>
              <li><strong>Données techniques</strong> : adresse IP, type de navigateur, appareil utilisé.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">2. Finalités du traitement</h2>
            <p className="mt-3">Vos données sont traitées pour les finalités suivantes :</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Gestion de votre compte partenaire et de votre réseau d&apos;affiliation.</li>
              <li>Calcul et versement de vos commissions.</li>
              <li>Vérification de votre identité (KYC) et prévention de la fraude.</li>
              <li>Communication relative au programme (newsletters, notifications).</li>
              <li>Amélioration de la plateforme et statistiques d&apos;utilisation.</li>
              <li>Respect de nos obligations légales et réglementaires.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">3. Base légale du traitement</h2>
            <p className="mt-3">Le traitement de vos données repose sur :</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>L&apos;exécution du contrat</strong> : gestion du programme d&apos;affiliation.</li>
              <li><strong>Le consentement</strong> : envoi de communications marketing.</li>
              <li><strong>L&apos;obligation légale</strong> : vérification d&apos;identité, déclarations fiscales.</li>
              <li><strong>L&apos;intérêt légitime</strong> : sécurité de la plateforme, prévention de la fraude.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">4. Durée de conservation</h2>
            <p className="mt-3">Vos données sont conservées :</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Données de compte actif</strong> : pendant toute la durée de votre partenariat.</li>
              <li><strong>Données financières</strong> : 10 ans après la dernière transaction (obligations légales comptables).</li>
              <li><strong>Données de connexion et logs</strong> : 12 mois.</li>
              <li><strong>Données de compte inactif</strong> : 3 ans après le dernier accès, puis suppression.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">5. Droits des personnes concernées</h2>
            <p className="mt-3">
              Conformément à la loi ivoirienne n°2013-450 relative à la protection des données à caractère
              personnel et aux standards RGPD, vous disposez des droits suivants :
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Droit d&apos;accès</strong> : obtenir une copie de vos données.</li>
              <li><strong>Droit de rectification</strong> : corriger des données inexactes.</li>
              <li><strong>Droit à l&apos;effacement</strong> : demander la suppression de vos données (sous conditions légales).</li>
              <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format lisible.</li>
              <li><strong>Droit d&apos;opposition</strong> : vous opposer au traitement à des fins marketing.</li>
              <li><strong>Droit de limitation</strong> : restreindre le traitement de vos données.</li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits, contactez-nous à :
              <a href="mailto:contact@ibigpartners.com" className="ml-1 text-brand-600 hover:underline">
                contact@ibigpartners.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">6. Délégué à la protection des données (DPO)</h2>
            <p className="mt-3">
              Pour toute question relative à la protection de vos données personnelles, vous pouvez contacter
              notre responsable de la protection des données :
            </p>
            <ul className="mt-3 space-y-1">
              <li>Email : <a href="mailto:contact@ibigpartners.com" className="text-brand-600 hover:underline">contact@ibigpartners.com</a></li>
              <li>Adresse : INTERMARK BUSINESS INTERNATIONAL GROUP SARL, Cocody Riviera Palmeraie, Abidjan, Côte d&apos;Ivoire</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">7. Cookies</h2>
            <p className="mt-3">
              IBIG PARTNERS utilise des cookies pour assurer le bon fonctionnement de la plateforme et
              améliorer votre expérience. Pour en savoir plus sur notre usage des cookies, consultez notre{" "}
              <Link href="/cookies" className="text-brand-600 hover:underline">Politique cookies</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">8. Partage des données</h2>
            <p className="mt-3">
              Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec :
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Les branches du groupe IBIG pour la gestion des commissions.</li>
              <li>Les prestataires techniques hébergeant la plateforme (sous contrat de confidentialité).</li>
              <li>Les autorités légales ivoiriennes si requis par la loi.</li>
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

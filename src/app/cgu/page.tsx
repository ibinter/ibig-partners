import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const metadata = {
  title: "Conditions Générales d'Utilisation — IBIG PARTNERS",
  description: "Conditions générales du programme d'affiliation IBIG PARTNERS.",
};

export default function CguPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/" className="text-sm text-brand-600 hover:underline">← Retour à l'accueil</Link>

        <h1 className="mt-6 text-3xl font-extrabold text-ink">Conditions Générales d'Utilisation</h1>
        <p className="mt-2 text-sm text-muted">Dernière mise à jour : juin 2025 — IBIG SARL, Abidjan, Côte d'Ivoire</p>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-slate-700">

          <section>
            <h2 className="text-lg font-bold text-ink">1. Présentation du programme</h2>
            <p className="mt-3">
              IBIG PARTNERS est le programme officiel d'affiliation multi-niveaux du Groupe <strong>IBIG SARL</strong>
              (Intermark Business International), société à responsabilité limitée enregistrée en Côte d'Ivoire,
              dont le siège social est situé à Cocody Riviera Palmeraie, Abidjan.
            </p>
            <p className="mt-3">
              Le programme permet à toute personne physique (le « Partenaire ») de promouvoir les produits et
              services des branches du Groupe IBIG et de percevoir des commissions sur les ventes réalisées via
              son lien d'affiliation unique, ainsi que sur les ventes de ses filleuls jusqu'au 3ème niveau.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">2. Conditions d'adhésion</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Être une personne physique majeure (18 ans ou plus).</li>
              <li>Résider en Côte d'Ivoire ou dans la diaspora africaine.</li>
              <li>Fournir des informations exactes et à jour lors de l'inscription.</li>
              <li>Disposer d'un compte mobile money ou bancaire actif pour la réception des commissions.</li>
              <li>L'inscription est <strong>entièrement gratuite</strong> et sans engagement minimum.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">3. Commissions et rémunération</h2>
            <p className="mt-3">
              Les taux de commission sont définis par branche et par type de produit. Ils sont consultables
              dans votre espace partenaire et peuvent être mis à jour par IBIG SARL avec un préavis de 15 jours.
            </p>
            <p className="mt-3">
              Les commissions sont calculées sur le montant <strong>hors taxes</strong> de la vente confirmée.
              Elles sont validées sous <strong>7 jours ouvrables</strong> après confirmation de la vente
              et versées selon le calendrier de paiement hebdomadaire.
            </p>
            <p className="mt-3">
              Le versement s'effectue via les moyens suivants selon votre préférence renseignée dans votre profil :
              Orange Money, Wave, MTN MoMo, Moov Money ou virement bancaire.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">4. Structure multi-niveaux</h2>
            <p className="mt-3">
              IBIG PARTNERS applique un système de parrainage sur <strong>3 niveaux</strong> :
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li><strong>Niveau 1</strong> : partenaires directement parrainés par vous.</li>
              <li><strong>Niveau 2</strong> : partenaires parrainés par vos filleuls Niveau 1.</li>
              <li><strong>Niveau 3</strong> : partenaires parrainés par vos filleuls Niveau 2.</li>
            </ul>
            <p className="mt-3">
              Les taux appliqués aux niveaux 2 et 3 sont inférieurs au taux Niveau 1 et varient selon votre statut.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">5. Obligations du Partenaire</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Promouvoir les produits IBIG de manière honnête et conforme à la réalité.</li>
              <li>Ne pas utiliser de méthodes de promotion trompeuses, spamming ou contraires aux lois en vigueur.</li>
              <li>Ne pas usurper l'identité d'IBIG SARL ni utiliser des visuels non fournis par le Groupe.</li>
              <li>Informer IBIG SARL de tout changement de coordonnées bancaires ou mobile money.</li>
              <li>Ne pas créer plusieurs comptes partenaires (un seul compte par personne physique).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">6. Suspension et résiliation</h2>
            <p className="mt-3">
              IBIG SARL se réserve le droit de suspendre ou résilier un compte partenaire en cas de :
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Non-respect des présentes CGU.</li>
              <li>Fraude avérée, manipulation de ventes ou faux parrainages.</li>
              <li>Inactivité supérieure à 12 mois consécutifs.</li>
              <li>Fausses informations fournies lors de l'inscription.</li>
            </ul>
            <p className="mt-3">
              Les commissions validées et en attente de paiement seront versées dans les 30 jours suivant
              la résiliation, sauf en cas de fraude.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">7. Protection des données personnelles</h2>
            <p className="mt-3">
              IBIG SARL collecte et traite vos données personnelles (nom, email, téléphone, coordonnées bancaires)
              uniquement dans le cadre de la gestion du programme d'affiliation. Ces données ne sont
              jamais vendues à des tiers.
            </p>
            <p className="mt-3">
              Conformément aux lois ivoiriennes et aux standards internationaux (RGPD), vous disposez d'un
              droit d'accès, de rectification et de suppression de vos données en contactant :
              <a href="mailto:contact@ibigsoft.com" className="ml-1 text-brand-600 hover:underline">
                contact@ibigsoft.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">8. Limitation de responsabilité</h2>
            <p className="mt-3">
              IBIG SARL ne saurait être tenu responsable des pertes de revenus du Partenaire liées à une
              interruption de service, une modification du catalogue produits ou une évolution des taux de commission.
              La plateforme IBIG PARTNERS est fournie « en l'état » sans garantie de disponibilité continue.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">9. Droit applicable et juridiction</h2>
            <p className="mt-3">
              Les présentes CGU sont régies par le droit ivoirien. Tout litige sera soumis aux juridictions
              compétentes d'Abidjan, Côte d'Ivoire, après tentative de résolution amiable.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">10. Contact</h2>
            <p className="mt-3">
              Pour toute question relative au programme ou aux présentes conditions :
            </p>
            <ul className="mt-3 space-y-1">
              <li>Email : <a href="mailto:partenaires@ibigsoft.com" className="text-brand-600 hover:underline">partenaires@ibigsoft.com</a></li>
              <li>Adresse : IBIG SARL, Cocody Riviera Palmeraie, Abidjan, Côte d'Ivoire</li>
              <li>Site web : <a href="https://ibigpartners.com" className="text-brand-600 hover:underline">ibigpartners.com</a></li>
            </ul>
          </section>

        </div>

        <div className="mt-12 border-t border-slate-200 pt-8 text-center">
          <Link
            href="/rejoindre"
            className="inline-block rounded-xl bg-brand-600 px-8 py-3 font-semibold text-white hover:bg-brand-700"
          >
            Devenir Partenaire — c'est gratuit
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

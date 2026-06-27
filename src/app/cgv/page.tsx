import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const metadata = {
  title: "Conditions Générales de Vente — IBIG PARTNERS",
  description: "Conditions générales de vente du programme d'affiliation IBIG PARTNERS — INTERMARK BUSINESS INTERNATIONAL GROUP SARL.",
};

export default function CgvPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/" className="text-sm text-brand-600 hover:underline">← Retour à l'accueil</Link>

        <h1 className="mt-6 text-3xl font-extrabold text-ink">Conditions Générales de Vente</h1>
        <p className="mt-2 text-sm text-muted">Dernière mise à jour : juin 2026 — INTERMARK BUSINESS INTERNATIONAL GROUP SARL (IBIG SARL), Abidjan, Côte d&apos;Ivoire</p>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-slate-700">

          <section>
            <h2 className="text-lg font-bold text-ink">1. Objet</h2>
            <p className="mt-3">
              Les présentes Conditions Générales de Vente (CGV) régissent les relations commerciales entre
              <strong> INTERMARK BUSINESS INTERNATIONAL GROUP SARL</strong> (ci-après « IBIG SARL »),
              société enregistrée en Côte d&apos;Ivoire, dont le siège est à Cocody Riviera Palmeraie, Abidjan,
              et toute personne physique ou morale (le « Client ») acquérant un produit ou service via la
              plateforme IBIG PARTNERS ou via un Partenaire affilié.
            </p>
            <p className="mt-3">
              Toute commande implique l&apos;acceptation pleine et entière des présentes CGV. IBIG SARL se
              réserve le droit de les modifier à tout moment ; les CGV applicables sont celles en vigueur
              à la date de la commande.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">2. Prix et paiements</h2>
            <p className="mt-3">
              Tous les prix sont exprimés en Francs CFA (FCFA) et s&apos;entendent TTC. IBIG SARL se réserve
              le droit de modifier ses tarifs à tout moment, sans préavis, sauf pour les commandes déjà confirmées.
            </p>
            <p className="mt-3">
              Les paiements s&apos;effectuent via les moyens suivants :
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Orange Money</strong> — CI, Sénégal, Cameroun, Mali, Burkina Faso, Guinée, Niger, RDC…</li>
              <li><strong>Wave</strong> — CI, Sénégal, Mali, Burkina Faso, Guinée, Ouganda</li>
              <li><strong>MTN Mobile Money (MoMo)</strong> — CI, Cameroun, Ghana, Bénin, Congo, Zambie…</li>
              <li><strong>Moov Money / Flooz</strong> — CI, Bénin, Togo, Burkina Faso, Niger, Tchad, Gabon</li>
              <li><strong>Airtel Money</strong> — RDC, Gabon, Congo-Brazzaville, Rwanda, Zambie…</li>
              <li><strong>M-Pesa</strong> — Afrique de l&apos;Est et Centrale (Kenya, Tanzania, RDC, Mozambique…)</li>
              <li><strong>Virement bancaire</strong> — zones UEMOA, CEMAC et international</li>
              <li><strong>CinetPay</strong> — agrégateur panafricain (carte, mobile money, virement)</li>
              <li><strong>Western Union</strong> — transfert international depuis la diaspora</li>
              <li><strong>MoneyGram</strong> — transfert international depuis la diaspora</li>
              <li><strong>Wise (ex-TransferWise)</strong> — virement international low-cost</li>
              <li><strong>WorldRemit</strong> — envoi vers mobile money ou compte bancaire africain</li>
              <li><strong>Remitly</strong> — transfert international vers l&apos;Afrique</li>
            </ul>
            <p className="mt-3">
              Toute commande est ferme et définitive dès réception du paiement complet. Une confirmation
              est envoyée par email ou SMS dans les 24 heures.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">3. Commissions et rémunération des partenaires</h2>
            <p className="mt-3">
              Pour les produits commercialisés via le réseau IBIG PARTNERS, une partie du prix de vente
              est reversée aux Partenaires affiliés selon la grille de commissions en vigueur, consultable
              dans l&apos;espace partenaire et sur la page publique ibigpartners.com.
            </p>
            <p className="mt-3">
              Les commissions portent sur le montant hors taxes de la vente confirmée et sont calculées
              sur 3 niveaux de parrainage (N1, N2, N3). Le Client n&apos;est pas partie à cette relation
              commerciale entre IBIG SARL et ses Partenaires.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">4. Modalités de versement des commissions</h2>
            <p className="mt-3">
              Les commissions des Partenaires sont versées selon le calendrier suivant :
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Validation des commissions : sous 7 jours ouvrables après confirmation de la vente.</li>
              <li>Versement hebdomadaire tous les vendredis.</li>
              <li>Seuil minimum de déclenchement : 5 000 FCFA (modifiable dans le profil).</li>
              <li>Frais de transfert international à la charge du Partenaire.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">5. Rétractation et remboursements</h2>
            <p className="mt-3">
              Pour les produits numériques (logiciels SaaS, formations en ligne), le Client dispose d&apos;un
              délai de <strong>7 jours calendaires</strong> à compter de la date d&apos;accès pour exercer son
              droit de rétractation, sous réserve que le service n&apos;ait pas été pleinement utilisé.
            </p>
            <p className="mt-3">
              Pour les services et prestations, aucun remboursement ne peut être accordé après le début
              de la prestation, sauf défaut avéré imputable à IBIG SARL.
            </p>
            <p className="mt-3">
              Les demandes de remboursement doivent être adressées à :
              <a href="mailto:support@ibigpartners.com" className="ml-1 text-brand-600 hover:underline">
                support@ibigpartners.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">6. Responsabilité</h2>
            <p className="mt-3">
              IBIG SARL s&apos;engage à fournir les produits et services commandés dans les meilleures conditions.
              Sa responsabilité ne saurait être engagée en cas de force majeure, de défaillance technique
              des réseaux de communication, ou d&apos;utilisation anormale du service par le Client.
            </p>
            <p className="mt-3">
              La responsabilité d&apos;IBIG SARL est limitée au montant effectivement payé par le Client pour
              la commande concernée.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">7. Droit applicable et juridiction compétente</h2>
            <p className="mt-3">
              Les présentes CGV sont soumises au droit ivoirien. Tout litige relatif à leur interprétation
              ou à leur exécution sera soumis aux juridictions compétentes d&apos;Abidjan, Côte d&apos;Ivoire,
              après tentative obligatoire de résolution amiable dans un délai de 30 jours.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">8. Contact</h2>
            <ul className="mt-3 space-y-1">
              <li>Email : <a href="mailto:contact@ibigpartners.com" className="text-brand-600 hover:underline">contact@ibigpartners.com</a></li>
              <li>Support : <a href="mailto:support@ibigpartners.com" className="text-brand-600 hover:underline">support@ibigpartners.com</a></li>
              <li>Téléphone : <a href="tel:+2252722276014" className="text-brand-600 hover:underline">+225 27 22 27 60 14</a></li>
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

import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Sale — IBIG PARTNERS",
  description: "Terms of sale of the IBIG PARTNERS affiliate program — INTERMARK BUSINESS INTERNATIONAL GROUP SARL.",
  alternates: {
    canonical: "https://ibigpartners.com/en/cgv",
    languages: {
      fr: "https://ibigpartners.com/cgv",
      en: "https://ibigpartners.com/en/cgv",
      "x-default": "https://ibigpartners.com/cgv",
    },
  },
};

export default function CgvPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/en" className="text-sm text-brand-600 hover:underline">← Back to home</Link>

        <h1 className="mt-6 text-3xl font-extrabold text-ink">Terms of Sale</h1>
        <p className="mt-2 text-sm text-muted">This is an English translation provided for convenience. In case of any discrepancy, the French version prevails.</p>
        <p className="mt-2 text-sm text-muted">Last updated: June 2026 — <a href="https://intermark-business.com/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 hover:underline">INTERMARK BUSINESS INTERNATIONAL GROUP SARL</a> (IBIG SARL), Abidjan, Côte d&apos;Ivoire</p>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-slate-700">

          <section>
            <h2 className="text-lg font-bold text-ink">1. Purpose</h2>
            <p className="mt-3">
              These Terms of Sale (the &quot;Terms&quot;) govern the commercial relations between
              <strong><a href="https://intermark-business.com/" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline"> INTERMARK BUSINESS INTERNATIONAL GROUP SARL</a></strong> (hereinafter &quot;IBIG SARL&quot;),
              a company registered in Côte d&apos;Ivoire, with its registered office at Cocody Riviera Palmeraie, Abidjan,
              and any natural or legal person (the &quot;Customer&quot;) acquiring a product or service through the
              IBIG PARTNERS platform or through an affiliated Partner.
            </p>
            <p className="mt-3">
              Any order implies the full and unreserved acceptance of these Terms. IBIG SARL reserves
              the right to modify them at any time; the applicable Terms are those in force
              on the date of the order.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">2. Prices and payments</h2>
            <p className="mt-3">
              All prices are expressed in CFA Francs (FCFA) and are inclusive of all taxes. IBIG SARL reserves
              the right to modify its rates at any time, without notice, except for orders already confirmed.
            </p>
            <p className="mt-3">
              Payments are made using the following means:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Orange Money</strong></li>
              <li><strong>Wave</strong></li>
              <li><strong>MTN Mobile Money (MoMo)</strong></li>
              <li><strong>Bank transfer</strong></li>
            </ul>
            <p className="mt-3">
              Any order is firm and final upon receipt of full payment. A confirmation
              is sent by email or SMS within 24 hours.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">3. Commissions and partner remuneration</h2>
            <p className="mt-3">
              For products marketed through the IBIG PARTNERS network, part of the sale price
              is paid to affiliated Partners according to the commission schedule in force, available
              in the partner area and on the public page ibigpartners.com.
            </p>
            <p className="mt-3">
              Commissions are based on the pre-tax amount of the confirmed sale and are calculated
              over 3 referral levels (N1, N2, N3). The Customer is not a party to this commercial
              relationship between IBIG SARL and its Partners.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">4. Terms of payment of commissions</h2>
            <p className="mt-3">
              Partners&apos; commissions are paid according to the following schedule:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Validation of commissions: within 7 business days after confirmation of the sale.</li>
              <li>Weekly payment every Friday.</li>
              <li>Minimum payout threshold: 5,000 FCFA (adjustable in the profile).</li>
              <li>International transfer fees borne by the Partner.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">5. Withdrawal and refunds</h2>
            <p className="mt-3">
              For digital products (SaaS and ERP software, online training, documents generated on a per-unit basis), the Customer has a
              period of <strong>7 calendar days</strong> from the date of access to exercise their
              right of withdrawal, provided that the service has not been fully used.
            </p>
            <p className="mt-3">
              For services and provisions, no refund can be granted after the start
              of the service, except for a proven fault attributable to IBIG SARL.
            </p>
            <p className="mt-3">
              Refund requests must be sent to:
              <a href="mailto:support@ibigpartners.com" className="ml-1 text-brand-600 hover:underline">
                support@ibigpartners.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">6. Liability</h2>
            <p className="mt-3">
              IBIG SARL undertakes to provide the ordered products and services under the best conditions.
              It cannot be held liable in the event of force majeure, technical failure
              of communication networks, or abnormal use of the service by the Customer.
            </p>
            <p className="mt-3">
              IBIG SARL&apos;s liability is limited to the amount actually paid by the Customer for
              the order concerned.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">7. Applicable law and competent jurisdiction</h2>
            <p className="mt-3">
              These Terms are governed by Ivorian law. Any dispute relating to their interpretation
              or their performance shall be submitted to the competent courts of Abidjan, Côte d&apos;Ivoire,
              after a mandatory attempt at amicable resolution within a period of 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">8. Contact</h2>
            <ul className="mt-3 space-y-1">
              <li>Email: <a href="mailto:contact@ibigpartners.com" className="text-brand-600 hover:underline">contact@ibigpartners.com</a></li>
              <li>Support: <a href="mailto:support@ibigpartners.com" className="text-brand-600 hover:underline">support@ibigpartners.com</a></li>
              <li>Phone: <a href="tel:+2252722276014" className="text-brand-600 hover:underline">+225 27 22 27 60 14</a></li>
              <li>Address: <a href="https://intermark-business.com/" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">INTERMARK BUSINESS INTERNATIONAL GROUP SARL</a>, Cocody Riviera Palmeraie, Abidjan, Côte d&apos;Ivoire</li>
            </ul>
          </section>

        </div>

        <div className="mt-12 border-t border-slate-200 pt-8 text-center">
          <Link
            href="/en/rejoindre"
            className="inline-block rounded-xl bg-brand-600 px-8 py-3 font-semibold text-white hover:bg-brand-700"
          >
            Become a Partner — it&apos;s free
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

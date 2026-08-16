import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "Privacy Policy — IBIG PARTNERS",
  description: "Privacy policy and protection of personal data — INTERMARK BUSINESS INTERNATIONAL GROUP SARL.",
  alternates: {
    canonical: "https://ibigpartners.com/en/confidentialite",
    languages: {
      fr: "https://ibigpartners.com/confidentialite",
      en: "https://ibigpartners.com/en/confidentialite",
      "x-default": "https://ibigpartners.com/confidentialite",
    },
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <SiteHeader lang="en" />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/en" className="text-sm text-brand-600 hover:underline">← Back to home</Link>

        <h1 className="mt-6 text-3xl font-extrabold text-ink">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted">This is an English translation provided for convenience. In case of any discrepancy, the French version prevails.</p>
        <p className="mt-2 text-sm text-muted">Last updated: June 2026 — <a href="https://intermark-business.com/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 hover:underline">INTERMARK BUSINESS INTERNATIONAL GROUP SARL</a> (IBIG SARL), Abidjan, Côte d&apos;Ivoire</p>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-slate-700">

          <section>
            <h2 className="text-lg font-bold text-ink">1. Data collected</h2>
            <p className="mt-3">
              Within the framework of the IBIG PARTNERS program, <strong><a href="https://intermark-business.com/" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">INTERMARK BUSINESS INTERNATIONAL GROUP SARL</a></strong>
              (IBIG SARL) collects the following personal data:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Identification data</strong>: last name, first name, date of birth, identity document number.</li>
              <li><strong>Contact data</strong>: email address, phone number, postal address.</li>
              <li><strong>Financial data</strong>: mobile money details (Orange Money, Wave, MTN MoMo), IBAN.</li>
              <li><strong>Professional data</strong>: status, partner type (individual/company), RCCM for companies.</li>
              <li><strong>Usage data</strong>: login history, sales, commissions, clicks on affiliate links.</li>
              <li><strong>Technical data</strong>: IP address, browser type, device used.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">2. Purposes of processing</h2>
            <p className="mt-3">Your data is processed for the following purposes:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Management of your partner account and your affiliation network.</li>
              <li>Calculation and payment of your commissions.</li>
              <li>Verification of your identity (KYC) and fraud prevention.</li>
              <li>Communication relating to the program (newsletters, notifications).</li>
              <li>Improvement of the platform and usage statistics.</li>
              <li>Compliance with our legal and regulatory obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">3. Legal basis for processing</h2>
            <p className="mt-3">The processing of your data is based on:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Performance of the contract</strong>: management of the affiliation program.</li>
              <li><strong>Consent</strong>: sending of marketing communications.</li>
              <li><strong>Legal obligation</strong>: identity verification, tax declarations.</li>
              <li><strong>Legitimate interest</strong>: platform security, fraud prevention.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">4. Retention period</h2>
            <p className="mt-3">Your data is retained:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Active account data</strong>: for the entire duration of your partnership.</li>
              <li><strong>Financial data</strong>: 10 years after the last transaction (legal accounting obligations).</li>
              <li><strong>Login data and logs</strong>: 12 months.</li>
              <li><strong>Inactive account data</strong>: 3 years after the last access, then deletion.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">5. Rights of data subjects</h2>
            <p className="mt-3">
              In accordance with Ivorian law No. 2013-450 on the protection of personal data
              and GDPR standards, you have the following rights:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Right of access</strong>: obtain a copy of your data.</li>
              <li><strong>Right of rectification</strong>: correct inaccurate data.</li>
              <li><strong>Right to erasure</strong>: request the deletion of your data (subject to legal conditions).</li>
              <li><strong>Right to portability</strong>: receive your data in a readable format.</li>
              <li><strong>Right to object</strong>: object to processing for marketing purposes.</li>
              <li><strong>Right to restriction</strong>: restrict the processing of your data.</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, contact us at:
              <a href="mailto:contact@ibigpartners.com" className="ml-1 text-brand-600 hover:underline">
                contact@ibigpartners.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">6. Data Protection Officer (DPO)</h2>
            <p className="mt-3">
              For any question relating to the protection of your personal data, you may contact
              our data protection officer:
            </p>
            <ul className="mt-3 space-y-1">
              <li>Email: <a href="mailto:contact@ibigpartners.com" className="text-brand-600 hover:underline">contact@ibigpartners.com</a></li>
              <li>Address: <a href="https://intermark-business.com/" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">INTERMARK BUSINESS INTERNATIONAL GROUP SARL</a>, Cocody Riviera Palmeraie, Abidjan, Côte d&apos;Ivoire</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">7. Cookies</h2>
            <p className="mt-3">
              IBIG PARTNERS uses cookies to ensure the proper functioning of the platform and
              to improve your experience. To learn more about our use of cookies, please refer to our{" "}
              <Link href="/en/cookies" className="text-brand-600 hover:underline">Cookie Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">8. Data sharing</h2>
            <p className="mt-3">
              Your data is never sold to third parties. It may be shared with:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>The branches of the IBIG group for the management of commissions.</li>
              <li>The technical providers hosting the platform (under a confidentiality agreement).</li>
              <li>The Ivorian legal authorities if required by law.</li>
            </ul>
          </section>

        </div>

        <div className="mt-12 border-t border-slate-200 pt-8 text-center">
          <Link
            href="/rejoindre"
            className="inline-block rounded-xl bg-brand-600 px-8 py-3 font-semibold text-white hover:bg-brand-700"
          >
            Become a Partner — it&apos;s free
          </Link>
        </div>
      </main>
      <SiteFooter lang="en" />
    </>
  );
}

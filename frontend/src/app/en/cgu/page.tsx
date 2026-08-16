import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "Terms of Use — IBIG PARTNERS",
  description: "Terms of use of the IBIG PARTNERS affiliate program.",
  alternates: {
    canonical: "https://ibigpartners.com/en/cgu",
    languages: {
      fr: "https://ibigpartners.com/cgu",
      en: "https://ibigpartners.com/en/cgu",
      "x-default": "https://ibigpartners.com/cgu",
    },
  },
};

export default function CguPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/en" className="text-sm text-brand-600 hover:underline">← Back to home</Link>

        <h1 className="mt-6 text-3xl font-extrabold text-ink">Terms of Use</h1>
        <p className="mt-2 text-sm text-muted">Last updated: June 2026 — IBIG SARL, Abidjan, Côte d&apos;Ivoire</p>

        <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-muted">
          This is an English translation provided for convenience. In case of any discrepancy, the French version prevails.
        </p>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-slate-700">

          <section>
            <h2 className="text-lg font-bold text-ink">1. Overview of the program</h2>
            <p className="mt-3">
              IBIG PARTNERS is the official multi-level affiliate program of <strong><a href="https://intermark-business.com/" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">INTERMARK BUSINESS INTERNATIONAL GROUP SARL</a></strong>
              (IBIG SARL), a limited liability company registered in Côte d&apos;Ivoire,
              whose registered office is located at Cocody Riviera Palmeraie, Abidjan.
            </p>
            <p className="mt-3">
              The program allows any natural person (the &laquo; Partner &raquo;) to promote the products and
              services of the branches of the IBIG Group and to earn commissions on the sales made through
              their unique affiliate link, as well as on the sales of their referrals down to the 3rd level.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">2. Membership conditions</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Be a natural person of legal age (18 years or older).</li>
              <li>Reside anywhere in the world — the program is pan-African and international, with no country limit.</li>
              <li>Provide accurate and up-to-date information upon registration.</li>
              <li>Have an active mobile money or bank account to receive commissions.</li>
              <li>Registration is <strong>entirely free</strong> and without any minimum commitment.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">3. Commissions and remuneration</h2>
            <p className="mt-3">
              Commission rates are set per branch and per product type. They can be viewed
              in your partner area and may be updated by IBIG SARL with a 15-day notice.
            </p>
            <p className="mt-3">
              Commissions are calculated on the <strong>pre-tax</strong> amount of the confirmed sale.
              They are validated within <strong>7 business days</strong> after confirmation of the sale
              and paid according to the weekly payment schedule.
            </p>
            <p className="mt-3">
              Payment is made via the following means according to the preference indicated in your profile:
              Orange Money, Wave, MTN MoMo or bank transfer.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">4. Multi-level structure</h2>
            <p className="mt-3">
              IBIG PARTNERS applies a referral system across <strong>3 levels</strong>:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li><strong>Level 1</strong>: partners directly referred by you.</li>
              <li><strong>Level 2</strong>: partners referred by your Level 1 referrals.</li>
              <li><strong>Level 3</strong>: partners referred by your Level 2 referrals.</li>
            </ul>
            <p className="mt-3">
              The rates applied to levels 2 and 3 are lower than the Level 1 rate and vary according to your status.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">5. Partner obligations</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Promote IBIG products honestly and in accordance with reality.</li>
              <li>Not use misleading promotion methods, spamming or practices contrary to applicable laws.</li>
              <li>Not impersonate IBIG SARL nor use visuals not provided by the Group.</li>
              <li>Inform IBIG SARL of any change to bank or mobile money details.</li>
              <li>Not create multiple partner accounts (one single account per natural person).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">6. Suspension and termination</h2>
            <p className="mt-3">
              IBIG SARL reserves the right to suspend or terminate a partner account in the event of:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Failure to comply with these Terms of Use.</li>
              <li>Proven fraud, sales manipulation or false referrals.</li>
              <li>Inactivity exceeding 12 consecutive months.</li>
              <li>False information provided upon registration.</li>
            </ul>
            <p className="mt-3">
              Validated commissions pending payment will be paid within 30 days following
              termination, except in the event of fraud.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">7. Protection of personal data</h2>
            <p className="mt-3">
              IBIG SARL collects and processes your personal data (name, email, phone, bank details)
              solely within the framework of managing the affiliate program. This data is
              never sold to third parties.
            </p>
            <p className="mt-3">
              In accordance with Ivorian laws and international standards (GDPR), you have a
              right of access, rectification and deletion of your data by contacting:
              <a href="mailto:contact@ibigpartners.com" className="ml-1 text-brand-600 hover:underline">
                contact@ibigpartners.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">8. Limitation of liability</h2>
            <p className="mt-3">
              IBIG SARL cannot be held responsible for the Partner&apos;s loss of income related to a
              service interruption, a change to the product catalog or a change in commission rates.
              The IBIG PARTNERS platform is provided &laquo; as is &raquo; without any guarantee of continuous availability.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">9. Applicable law and jurisdiction</h2>
            <p className="mt-3">
              These Terms of Use are governed by Ivorian law. Any dispute will be submitted to the
              competent courts of Abidjan, Côte d&apos;Ivoire, after an attempt at amicable resolution.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">10. Contact</h2>
            <p className="mt-3">
              For any question relating to the program or these terms:
            </p>
            <ul className="mt-3 space-y-1">
              <li>Email: <a href="mailto:partenaires@ibigsoft.com" className="text-brand-600 hover:underline">partenaires@ibigsoft.com</a></li>
              <li>Address: IBIG SARL, Cocody Riviera Palmeraie, Abidjan, Côte d&apos;Ivoire</li>
              <li>Website: <a href="https://ibigpartners.com" className="text-brand-600 hover:underline">ibigpartners.com</a></li>
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

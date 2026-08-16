import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "Cookie Policy — IBIG PARTNERS",
  description: "Policy on the use of cookies on the IBIG PARTNERS platform.",
  alternates: {
    canonical: "https://ibigpartners.com/en/cookies",
    languages: {
      fr: "https://ibigpartners.com/cookies",
      en: "https://ibigpartners.com/en/cookies",
      "x-default": "https://ibigpartners.com/cookies",
    },
  },
};

export default function CookiesPage() {
  return (
    <>
      <SiteHeader lang="en" />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/en" className="text-sm text-brand-600 hover:underline">← Back to home</Link>

        <h1 className="mt-6 text-3xl font-extrabold text-ink">Cookie Policy</h1>
        <p className="mt-2 text-sm text-muted">This is an English translation provided for convenience. In case of any discrepancy, the French version prevails.</p>
        <p className="mt-2 text-sm text-muted">Last updated: June 2026 — <a href="https://intermark-business.com/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 hover:underline">INTERMARK BUSINESS INTERNATIONAL GROUP SARL</a> (IBIG SARL), Abidjan, Côte d&apos;Ivoire</p>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-slate-700">

          <section>
            <h2 className="text-lg font-bold text-ink">1. What is a cookie?</h2>
            <p className="mt-3">
              A cookie is a small text file placed on your device (computer, tablet, smartphone)
              when you visit the IBIG PARTNERS platform. It allows our site to recognise you,
              to remember your preferences and to improve your browsing experience.
            </p>
            <p className="mt-3">
              Cookies cannot damage your device or access any information
              other than what you have agreed to share with us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">2. Cookies used on IBIG PARTNERS</h2>

            <h3 className="mt-4 font-semibold text-ink">2.1 Technical cookies (essential)</h3>
            <p className="mt-2">
              These cookies are essential for the platform to function. They cannot be
              disabled without impacting your use of the service.
            </p>
            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-left font-semibold text-slate-600">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Purpose</th>
                    <th className="px-4 py-2">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-2 font-mono">session_token</td>
                    <td className="px-4 py-2">Partner authentication and session</td>
                    <td className="px-4 py-2">Session (browser closing)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono">csrf_token</td>
                    <td className="px-4 py-2">Protection against CSRF attacks</td>
                    <td className="px-4 py-2">Session</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono">remember_me</td>
                    <td className="px-4 py-2">Keeping you signed in (&quot;Remember me&quot; option)</td>
                    <td className="px-4 py-2">30 days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="mt-6 font-semibold text-ink">2.2 Analytics cookies</h3>
            <p className="mt-2">
              These cookies allow us to understand how visitors interact with our
              platform, in order to improve it. The data collected is anonymised.
            </p>
            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-left font-semibold text-slate-600">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Purpose</th>
                    <th className="px-4 py-2">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-2 font-mono">_analytics</td>
                    <td className="px-4 py-2">Anonymised audience measurement</td>
                    <td className="px-4 py-2">13 months</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono">aff_click</td>
                    <td className="px-4 py-2">Tracking of clicks on affiliate links</td>
                    <td className="px-4 py-2">30 days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="mt-6 font-semibold text-ink">2.3 Marketing cookies (optional)</h3>
            <p className="mt-2">
              These cookies are used to offer you relevant content and measure the effectiveness
              of our campaigns. They require your explicit consent.
            </p>
            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-left font-semibold text-slate-600">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Purpose</th>
                    <th className="px-4 py-2">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-2 font-mono">_fbp</td>
                    <td className="px-4 py-2">Facebook advertising (Meta Pixel, if enabled)</td>
                    <td className="px-4 py-2">90 days</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono">ref_code</td>
                    <td className="px-4 py-2">Attribution of the referral code at sign-up</td>
                    <td className="px-4 py-2">30 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">3. How to manage your cookies</h2>
            <p className="mt-3">
              You can change your cookie preferences at any time:
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong>Through your browser</strong>: most browsers allow you to
                block or delete cookies in their settings (Settings → Privacy →
                Cookies). Note that disabling certain cookies may affect the operation
                of the platform.
              </li>
              <li>
                <strong>Google Chrome</strong>: Settings → Privacy and security → Cookies
              </li>
              <li>
                <strong>Mozilla Firefox</strong>: Settings → Privacy &amp; Security → Cookies
              </li>
              <li>
                <strong>Safari</strong>: Preferences → Privacy → Cookies
              </li>
              <li>
                <strong>Microsoft Edge</strong>: Settings → Privacy, search and services → Cookies
              </li>
            </ul>
            <p className="mt-3">
              To learn more about managing cookies, visit{" "}
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
            <p className="mt-3">For any question regarding our cookie policy:</p>
            <ul className="mt-3 space-y-1">
              <li>Email: <a href="mailto:contact@ibigpartners.com" className="text-brand-600 hover:underline">contact@ibigpartners.com</a></li>
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
      <SiteFooter lang="en" />
    </>
  );
}

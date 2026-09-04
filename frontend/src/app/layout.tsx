import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { PWARegister, PWAInstallBanner } from "@/components/pwa-register";
import { TawkVisibility } from "@/components/tawk-visibility";
import { TawkChat } from "@/components/tawk-chat";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.startsWith("https://")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://ibigpartners.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "IBIG PARTNERS — Programme d'Affiliation Panafricain | Gagnez des commissions en Afrique",
    template: "%s | IBIG PARTNERS",
  },
  description:
    "Rejoignez IBIG PARTNERS, le programme d'affiliation panafricain n°1 : commissions sur 14 logiciels SaaS, formations certifiantes, immobilier et 11 branches IBIG SARL. Inscription gratuite, paiement Mobile Money.",
  keywords: [
    "affiliation Afrique", "programme d'affiliation Côte d'Ivoire", "gagner de l'argent en ligne Afrique",
    "commission marketing Abidjan", "IBIG PARTNERS", "IBIG SARL", "réseau MLM légal Afrique",
    "affiliation logiciel SaaS Afrique", "partenaire commercial Côte d'Ivoire",
    "revenus passifs Afrique", "affiliation formations certifiantes", "Mobile Money commission",
    "programme partenaire panafricain", "affiliation multi-niveaux Afrique",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "IBIG PARTNERS — Programme d'Affiliation Panafricain",
    description:
      "Un seul compte pour promouvoir 14 logiciels et ERP SaaS, formations, immobilier et services des 11 branches d'IBIG SARL, avec des commissions transparentes.",
    siteName: "IBIG PARTNERS",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "IBIG PARTNERS — Programme d'Affiliation Panafricain",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IBIG PARTNERS — Programme d'Affiliation Panafricain",
    description:
      "Un seul compte pour promouvoir 14 logiciels et ERP SaaS, formations, immobilier et services des 11 branches d'IBIG SARL.",
    images: ["/icon-512.png"],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IBIG PARTNERS",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#041B4D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${SITE_URL}/#organization`,
                  name: "IBIG PARTNERS",
                  legalName: "IBIG SARL — Intermark Business International Group",
                  url: SITE_URL,
                  logo: {
                    "@type": "ImageObject",
                    url: `${SITE_URL}/icon-512.png`,
                    width: 512,
                    height: 512,
                  },
                  description:
                    "Programme d'affiliation panafricain : un seul compte pour accéder à 14 logiciels ERP SaaS, formations certifiantes, immobilier et services des 11 branches IBIG SARL.",
                  areaServed: ["CI", "SN", "CM", "BJ", "TG", "BF", "GN", "ML", "MR", "NE", "CD"],
                  sameAs: [
                    "https://www.facebook.com/ibigpartners",
                    "https://www.linkedin.com/company/ibig-sarl",
                  ],
                },
                {
                  "@type": "WebSite",
                  "@id": `${SITE_URL}/#website`,
                  url: SITE_URL,
                  name: "IBIG PARTNERS",
                  publisher: { "@id": `${SITE_URL}/#organization` },
                  inLanguage: ["fr", "en"],
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate: `${SITE_URL}/offres?q={search_term_string}`,
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />
        {children}
        <TawkVisibility />
        <PWARegister />
        <PWAInstallBanner />

        {/* Tawk.to live chat — chargé uniquement sur les pages publiques */}
        <TawkChat />

        {/* IBIG SARL — Tracking cross-site : envoie les visites PARTNERS vers l'admin Analytics d'intermark-business.com */}
        <Script id="ibig-sarl-tracking" strategy="afterInteractive">
          {`
            (function(){
              'use strict';
              var site = 'partners';
              var endpoint = 'https://intermark-business.com/api/track.php';
              var SESS_KEY = '_ibig_xsess';
              var sess = '', isUnique = 0;
              try {
                sess = localStorage.getItem(SESS_KEY) || '';
                if (!sess) {
                  sess = Array.from(crypto.getRandomValues(new Uint8Array(16)))
                    .map(function(b){return b.toString(16).padStart(2,'0');}).join('');
                  localStorage.setItem(SESS_KEY, sess);
                  isUnique = 1;
                }
              } catch(e){}
              var payload = {
                site: site,
                url: location.href,
                path: location.pathname,
                referer: document.referrer || '',
                session: sess,
                unique: isUnique
              };
              try {
                if (window.fetch) {
                  fetch(endpoint, {
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body: JSON.stringify(payload),
                    credentials:'omit',
                    keepalive: true,
                    mode:'cors'
                  }).catch(function(){});
                } else if (navigator.sendBeacon) {
                  var blob = new Blob([JSON.stringify(payload)], {type:'application/json'});
                  navigator.sendBeacon(endpoint, blob);
                }
              } catch(e){}
            })();
          `}
        </Script>
      </body>
    </html>
  );
}

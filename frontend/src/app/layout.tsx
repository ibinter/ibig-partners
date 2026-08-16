import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.startsWith("https://")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://ibigpartners.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "IBIG PARTNERS — Programme d'Affiliation Panafricain",
  description:
    "Programme d'affiliation panafricain : un seul compte pour accéder à 14 logiciels et ERP SaaS, formations, immobilier et services des 9 branches IBIG SARL.",
  openGraph: {
    title: "IBIG PARTNERS — Programme d'Affiliation Panafricain",
    description:
      "Un seul compte pour promouvoir 14 logiciels et ERP SaaS, formations, immobilier et services des 9 branches d'IBIG SARL, avec des commissions transparentes.",
    siteName: "IBIG PARTNERS",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IBIG PARTNERS — Programme d'Affiliation Panafricain",
    description:
      "Un seul compte pour promouvoir 14 logiciels et ERP SaaS, formations, immobilier et services des 9 branches d'IBIG SARL.",
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
  themeColor: "#0b5fff",
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
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
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

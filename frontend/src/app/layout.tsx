import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { PWARegister, PWAInstallBanner } from "@/components/pwa-register";
import { TawkVisibility } from "@/components/tawk-visibility";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "IBIG PARTNERS — Programme d'Affiliation Multi-Niveaux",
  description:
    "La plateforme centrale d'affiliation du Groupe IBIG SARL. Un seul compte, tous les produits, des commissions transparentes versées rapidement.",
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

        {/* Tawk.to live chat — bottom-left, identifié IBIG PARTNERS */}
        <Script id="tawk-to-ibig-partners" strategy="afterInteractive">
          {`
            var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
            Tawk_API.customStyle = {
              visibility: {
                desktop: { position: 'bl', xOffset: 15, yOffset: 15 },
                mobile:  { position: 'bl', xOffset: 5,  yOffset: 70 }
              }
            };
            Tawk_API.visitor = {
              name:  'Visiteur IBIG PARTNERS',
              email: 'visitor@ibigpartners.com'
            };
            Tawk_API.onLoad = function(){
              if (typeof Tawk_API.addTags === 'function') {
                Tawk_API.addTags(['ibig-partners','affiliation'], function(){});
              }
            };
            (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/6a1ee383d0b6e01c2e34b6be/1jq4ahf1s';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </Script>
      </body>
    </html>
  );
}

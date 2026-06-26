import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PWARegister, PWAInstallBanner } from "@/components/pwa-register";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
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
    icon: "/icon.svg",
    apple: "/icon-192.svg",
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
        <PWARegister />
        <PWAInstallBanner />
      </body>
    </html>
  );
}

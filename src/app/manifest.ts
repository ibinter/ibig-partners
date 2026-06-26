import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IBIG PARTNERS",
    short_name: "IBIG PARTNERS",
    description: "Programme d'affiliation multi-niveaux du Groupe IBIG SARL",
    start_url: "/espace",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0b5fff",
    orientation: "portrait",
    lang: "fr",
    categories: ["business", "finance"],
    icons: [
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Mes Commissions",
        short_name: "Commissions",
        description: "Consulter mes commissions",
        url: "/espace/commissions",
        icons: [{ src: "/icon-192.svg", sizes: "192x192" }],
      },
      {
        name: "Mes Liens",
        short_name: "Liens",
        description: "Mes liens d'affiliation et QR codes",
        url: "/espace/liens",
        icons: [{ src: "/icon-192.svg", sizes: "192x192" }],
      },
      {
        name: "Mon Réseau",
        short_name: "Réseau",
        description: "Voir mon réseau de filleuls",
        url: "/espace/reseau",
        icons: [{ src: "/icon-192.svg", sizes: "192x192" }],
      },
    ],
    screenshots: [],
  };
}

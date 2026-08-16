import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.startsWith("https://")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://ibigpartners.com";

// Routes publiques indexables (les espaces /admin et /espace sont privés).
const ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/en", priority: 0.9, changeFrequency: "weekly" },
  { path: "/rejoindre", priority: 0.9, changeFrequency: "monthly" },
  { path: "/en/rejoindre", priority: 0.8, changeFrequency: "monthly" },
  { path: "/partenaires", priority: 0.7, changeFrequency: "monthly" },
  { path: "/top-partenaires", priority: 0.6, changeFrequency: "weekly" },
  { path: "/connexion", priority: 0.5, changeFrequency: "yearly" },
  { path: "/cgv", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cgu", priority: 0.3, changeFrequency: "yearly" },
  { path: "/en/cgu", priority: 0.2, changeFrequency: "yearly" },
  { path: "/en/cgv", priority: 0.2, changeFrequency: "yearly" },
  { path: "/confidentialite", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}

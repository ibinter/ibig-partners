import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

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
  { path: "/en/partenaires", priority: 0.6, changeFrequency: "monthly" },
  { path: "/top-partenaires", priority: 0.6, changeFrequency: "weekly" },
  { path: "/en/top-partenaires", priority: 0.5, changeFrequency: "weekly" },
  { path: "/connexion", priority: 0.5, changeFrequency: "yearly" },
  { path: "/catalogue", priority: 0.8, changeFrequency: "weekly" },
  { path: "/en/catalogue", priority: 0.7, changeFrequency: "weekly" },
  { path: "/missions", priority: 0.7, changeFrequency: "weekly" },
  { path: "/offres", priority: 0.8, changeFrequency: "weekly" },
  { path: "/cgv", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cgu", priority: 0.3, changeFrequency: "yearly" },
  { path: "/en/cgu", priority: 0.2, changeFrequency: "yearly" },
  { path: "/en/cgv", priority: 0.2, changeFrequency: "yearly" },
  { path: "/confidentialite", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
  { path: "/en/confidentialite", priority: 0.2, changeFrequency: "yearly" },
  { path: "/en/cookies", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Pages produits dynamiques — une entrée par produit actif
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { slug: true },
    });
    productRoutes = products.map((p) => ({
      url: `${SITE_URL}/offres/${p.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    }));
  } catch { /* Ne pas bloquer le build si la DB est inaccessible */ }

  return [...staticRoutes, ...productRoutes];
}

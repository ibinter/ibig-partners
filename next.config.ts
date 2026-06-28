import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Un package-lock.json existe aussi plus haut dans le profil Windows.
  // Sans racine explicite, Turbopack essaie de parcourir tout le profil et
  // le build échoue avec une erreur d'accès refusé.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;

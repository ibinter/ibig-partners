import type { NextConfig } from "next";
import path from "path";
import fs from "fs";

// Détecte le dossier racine où `node_modules/next` est réellement installé.
// Dans certains déploiements, les dépendances sont hissées au dossier parent :
// on remonte l'arborescence jusqu'à trouver `next` plutôt que de supposer cwd.
function resolveTurbopackRoot(start: string): string {
  let dir = start;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (fs.existsSync(path.join(dir, "node_modules", "next"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return start; // racine atteinte : on garde cwd par défaut
    dir = parent;
  }
}

const nextConfig: NextConfig = {
  turbopack: {
    root: resolveTurbopackRoot(process.cwd()),
  },
  // Cluster Emergent : autoriser les origines cross-cluster en dev
  allowedDevOrigins: [
    "*.preview.emergentagent.com",
    "*.preview.emergentcf.cloud",
    "*.cluster-5.preview.emergentcf.cloud",
    "ibig-affiliate-boost.preview.emergentagent.com",
    "ibig-affiliate-boost.cluster-5.preview.emergentcf.cloud",
  ],
  // Server Actions cross-origin (preview URL diffère du forwarded host)
  experimental: {
    serverActions: {
      allowedOrigins: [
        "ibig-affiliate-boost.preview.emergentagent.com",
        "ibig-affiliate-boost.cluster-5.preview.emergentcf.cloud",
        "*.preview.emergentagent.com",
        "*.preview.emergentcf.cloud",
      ],
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
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

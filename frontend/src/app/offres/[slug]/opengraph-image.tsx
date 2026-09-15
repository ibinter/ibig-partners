import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const revalidate = 3600; // 1h

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRANCH_COLORS: Record<string, { from: string; to: string; emoji: string }> = {
  "ibig-soft":           { from: "#7c3aed", to: "#5b21b6", emoji: "⚙️" },
  "ibig-eduform":        { from: "#3b82f6", to: "#1d4ed8", emoji: "🎓" },
  "ibig-immo-trust":     { from: "#f59e0b", to: "#d97706", emoji: "🏠" },
  "ibig-digital":        { from: "#0891b2", to: "#0e7490", emoji: "💻" },
  "ibig-digital-kits":   { from: "#0d9488", to: "#0f766e", emoji: "🔧" },
  "ibig-conseil-plus":   { from: "#475569", to: "#334155", emoji: "📋" },
  "ibig-market":         { from: "#f43f5e", to: "#e11d48", emoji: "🛒" },
  "ibig-multiservices":  { from: "#f97316", to: "#ea580c", emoji: "🛠️" },
  "ibig-emploi-talents": { from: "#a21caf", to: "#86198f", emoji: "👥" },
};

const DEFAULT_COLORS = { from: "#0b5fff", to: "#1e40af", emoji: "📦" };

function getColors(branchId: string) {
  if (BRANCH_COLORS[branchId]) return BRANCH_COLORS[branchId];
  for (const [key, val] of Object.entries(BRANCH_COLORS)) {
    if (branchId.includes(key.replace("ibig-", ""))) return val;
  }
  return DEFAULT_COLORS;
}

function formatPrice(price: number, pricingType: string): string {
  if (price <= 0) return "Sur devis";
  const formatted = price.toLocaleString("fr-FR") + " FCFA";
  if (pricingType === "MONTHLY_SUB") return formatted + "/mois";
  if (pricingType === "ANNUAL_SUB") return formatted + "/an";
  return formatted;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await (prisma as any).product.findUnique({
    where: { slug, active: true },
    include: { branch: true },
  });

  const name       = product?.name ?? "Produit IBIG";
  const branchName = product?.branch?.name ?? "IBIG PARTNERS";
  const branchId   = product?.branch?.id ?? product?.branch?.slug ?? "";
  const price      = product?.price ?? 0;
  const pricingType = product?.pricingType ?? "";
  const colors     = getColors(branchId);
  const priceDisplay = formatPrice(price, pricingType);

  let tagline = "";
  try {
    if (product?.marketingData) {
      const md = JSON.parse(product.marketingData);
      tagline = md.tagline ?? "";
    }
  } catch { /* */ }
  if (!tagline && product?.description) {
    tagline = product.description.slice(0, 100) + (product.description.length > 100 ? "…" : "");
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
          padding: 0,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Cercles décoratifs */}
        <div style={{
          position: "absolute", top: -80, right: -80,
          width: 400, height: 400, borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: -60,
          width: 300, height: 300, borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
        }} />
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }} />

        {/* Contenu principal */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", padding: "52px 64px", height: "100%" }}>

          {/* Header : branche + IBIG PARTNERS */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "rgba(255,255,255,0.18)", borderRadius: 50,
              padding: "10px 20px", border: "1px solid rgba(255,255,255,0.25)",
            }}>
              <span style={{ fontSize: 22 }}>{colors.emoji}</span>
              <span style={{ color: "#fff", fontSize: 15, fontWeight: 800, letterSpacing: 1 }}>{branchName}</span>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(255,255,255,0.15)", borderRadius: 50,
              padding: "8px 18px", border: "1px solid rgba(255,255,255,0.2)",
            }}>
              <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>IBIG PARTNERS</span>
            </div>
          </div>

          {/* Prix */}
          <div style={{
            display: "flex", alignItems: "center",
            background: "rgba(255,255,255,0.2)", borderRadius: 14,
            padding: "8px 20px", width: "fit-content", marginBottom: 24,
            border: "1px solid rgba(255,255,255,0.3)",
          }}>
            <span style={{ color: "#fff", fontSize: 22, fontWeight: 900 }}>{priceDisplay}</span>
          </div>

          {/* Nom du produit */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <span style={{
              color: "#fff",
              fontSize: name.length > 30 ? 52 : 68,
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: -1,
              textShadow: "0 2px 20px rgba(0,0,0,0.2)",
              marginBottom: 20,
            }}>{name}</span>

            {tagline && (
              <span style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 22,
                fontWeight: 500,
                lineHeight: 1.4,
                maxWidth: 700,
              }}>{tagline}</span>
            )}
          </div>

          {/* Footer */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: 24, marginTop: 24,
          }}>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 600 }}>
              ibigpartners.com/offres/{slug}
            </span>
            <div style={{
              background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: "8px 18px",
              border: "1px solid rgba(255,255,255,0.25)",
            }}>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>🚀 Commission jusqu'à 20 %</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

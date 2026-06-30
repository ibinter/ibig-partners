import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

/**
 * OG Image dynamique pour les partages d'affiliés.
 * URL : /api/og?code=AFF-KOFFI-001&product=scolaby
 * Génère une belle image 1200x630 avec :
 *  - Nom & photo du partenaire (avatar lettre)
 *  - Produit promu
 *  - Logo IBIG PARTNERS
 *  - Mention "Cliquez pour découvrir"
 *
 * Utilisé automatiquement par les réseaux sociaux (Facebook, Twitter, WhatsApp preview).
 */

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code") || "";
  const productSlug = searchParams.get("product") || "";

  // Fallback générique
  let partner = { firstName: "Un partenaire", lastName: "IBIG", initial: "i", status: "STARTER" };
  let product = "L'écosystème IBIG SARL";

  try {
    if (code) {
      const u = await prisma.user.findUnique({
        where: { code },
        select: { firstName: true, lastName: true, status: true },
      });
      if (u) {
        partner = {
          firstName: u.firstName,
          lastName: u.lastName,
          initial: u.firstName.charAt(0).toUpperCase(),
          status: u.status,
        };
      }
    }
    if (productSlug) {
      const p = await prisma.product.findUnique({
        where: { slug: productSlug },
        select: { name: true },
      });
      if (p) product = p.name;
    }
  } catch {}

  const statusEmoji: Record<string, string> = {
    STARTER: "⭐",
    SILVER: "⭐⭐",
    GOLD: "⭐⭐⭐",
    MASTER: "🏆",
    ELITE: "👑",
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0c2d7a 0%, #0d3fb4 45%, #0b4fe0 100%)",
          color: "white",
          fontFamily: "system-ui",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Décor */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: 9999,
            background: "rgba(245, 183, 61, 0.15)",
            display: "flex",
          }}
        />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 60,
              height: 60,
              background: "white",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0b4fe0",
              fontWeight: 900,
              fontSize: 28,
            }}
          >
            iB
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 900, fontSize: 30, letterSpacing: -1 }}>
              IBIG <span style={{ color: "#f5b73d" }}>PARTNERS</span>
            </span>
            <span style={{ fontSize: 14, color: "#bfdbfe", marginTop: 2 }}>
              INTERMARK BUSINESS INTERNATIONAL GROUP SARL
            </span>
          </div>
        </div>

        {/* Corps */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            marginTop: 30,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 9999,
                background: "linear-gradient(135deg, #f5b73d 0%, #e69a14 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 900,
                fontSize: 60,
                boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
              }}
            >
              {partner.initial}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 24, color: "#f5b73d", fontWeight: 700 }}>
                {statusEmoji[partner.status] ?? "⭐"} {partner.status}
              </span>
              <span style={{ fontSize: 48, fontWeight: 900, letterSpacing: -1, marginTop: 4 }}>
                {partner.firstName} {partner.lastName}
              </span>
              <span style={{ fontSize: 20, color: "#bfdbfe", marginTop: 4 }}>
                vous recommande sur IBIG PARTNERS
              </span>
            </div>
          </div>

          <div
            style={{
              marginTop: 36,
              padding: "20px 28px",
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              borderRadius: 16,
              borderLeft: "6px solid #f5b73d",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span style={{ fontSize: 14, color: "#f5b73d", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>
              Produit recommandé
            </span>
            <span style={{ fontSize: 36, fontWeight: 800, marginTop: 8 }}>{product}</span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            paddingTop: 20,
          }}
        >
          <span style={{ fontSize: 18, color: "#bfdbfe" }}>
            🚀 Cliquez pour découvrir · Inscription 100% gratuite
          </span>
          <span style={{ fontSize: 14, color: "#94a3b8" }}>
            ibigpartners.com
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}

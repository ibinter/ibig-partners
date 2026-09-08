import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "IBIG PARTNERS — Programme d'Affiliation Panafricain";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #041B4D 0%, #0A3A8A 50%, #1E5FD8 100%)",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Cercles déco */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,165,0,0.1)", display: "flex" }} />

        {/* Badge */}
        <div style={{ display: "flex", alignItems: "center", background: "rgba(255,165,0,0.2)", border: "1px solid rgba(255,165,0,0.5)", borderRadius: 999, padding: "8px 24px", marginBottom: 32 }}>
          <span style={{ color: "#FFA500", fontSize: 16, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
            🌍 Programme Panafricain N°1
          </span>
        </div>

        {/* Logo texte */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: 16, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: 28, fontWeight: 900 }}>iB</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "white", fontSize: 52, fontWeight: 900, letterSpacing: -1, lineHeight: 1 }}>
              IBIG <span style={{ color: "#FFA500" }}>PARTNERS</span>
            </span>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, fontWeight: 400, marginTop: 4 }}>
              Ensemble, plus de possibilités
            </span>
          </div>
        </div>

        {/* Description */}
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 22, textAlign: "center", maxWidth: 800, lineHeight: 1.5, margin: "0 0 40px" }}>
          Un seul compte pour promouvoir 10 branches IBIG et gagner des commissions en Afrique
        </p>

        {/* Pills */}
        <div style={{ display: "flex", gap: 16 }}>
          {["💰 Commissions attractives", "📱 Mobile Money", "🎓 Formation incluse", "🌍 11 pays"].map((tag) => (
            <div key={tag} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 999, padding: "10px 20px", color: "white", fontSize: 15, fontWeight: 600 }}>
              {tag}
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{ position: "absolute", bottom: 32, color: "rgba(255,255,255,0.4)", fontSize: 16 }}>
          ibigpartners.com
        </div>
      </div>
    ),
    { ...size }
  );
}

import { NextRequest, NextResponse } from "next/server";

// Routes protégées par le middleware auth
const PROTECTED_PREFIXES = ["/espace", "/admin"];

// Routes sensibles soumises au rate limiting (POST uniquement)
const RATE_LIMITED_PATHS = [
  "/connexion",
  "/rejoindre",
  "/connexion/otp",
  "/connexion/mot-de-passe-oublie",
  "/connexion/reinitialiser-mot-de-passe",
  "/api/",
];

// Rate limit simple basé sur les headers (Edge-compatible, pas d'import Node)
// Compteurs stockés dans des Map globales — réinitialisées par redémarrage d'instance
const counters = new Map<string, { n: number; resetAt: number }>();

function edgeRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = counters.get(key);
  if (!entry || entry.resetAt < now) {
    counters.set(key, { n: 1, resetAt: now + windowMs });
    return true;
  }
  entry.n++;
  return entry.n <= limit;
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = getIp(req);

  // ── Rate limiting sur les routes sensibles ──────────────────────────────
  if (req.method === "POST" && RATE_LIMITED_PATHS.some((p) => pathname.startsWith(p))) {
    // Connexion / inscription : 10 tentatives / 10 min par IP
    const isAuthRoute = ["/connexion", "/rejoindre", "/connexion/otp",
      "/connexion/mot-de-passe-oublie", "/connexion/reinitialiser-mot-de-passe"]
      .some((p) => pathname === p || pathname.startsWith(p + "/"));

    if (isAuthRoute) {
      const allowed = edgeRateLimit(`auth:${ip}`, 10, 10 * 60 * 1000);
      if (!allowed) {
        return new NextResponse(
          JSON.stringify({ error: "Trop de tentatives. Réessayez dans 10 minutes." }),
          { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "600" } }
        );
      }
    }

    // API générale : 60 requêtes / minute par IP
    if (pathname.startsWith("/api/")) {
      const allowed = edgeRateLimit(`api:${ip}`, 60, 60 * 1000);
      if (!allowed) {
        return new NextResponse(
          JSON.stringify({ error: "Limite de requêtes atteinte." }),
          { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } }
        );
      }
    }
  }

  // GET sur les API : 120 requêtes / minute par IP
  if (req.method === "GET" && pathname.startsWith("/api/")) {
    const allowed = edgeRateLimit(`api-get:${ip}`, 120, 60 * 1000);
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Limite de requêtes atteinte." }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } }
      );
    }
  }

  // ── Auth : redirection si non connecté ──────────────────────────────────
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected) {
    const session = req.cookies.get("ibig_session");
    if (!session?.value) {
      const url = req.nextUrl.clone();
      url.pathname = "/connexion";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // ── Headers de sécurité sur toutes les réponses ──────────────────────────
  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-DNS-Prefetch-Control", "on");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval requis par Next.js dev
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://res.cloudinary.com https://lh3.googleusercontent.com",
      "connect-src 'self' https://api.resend.com https://*.supabase.co",
      "frame-ancestors 'none'",
    ].join("; ")
  );
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf)).*)",
  ],
};

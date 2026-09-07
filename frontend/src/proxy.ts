import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-me",
);

// ── Rate limiting (Edge-compatible, in-memory par instance) ──────────────────
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

// ── Security headers ─────────────────────────────────────────────────────────
const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-DNS-Prefetch-Control": "on",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://res.cloudinary.com https://lh3.googleusercontent.com",
    "connect-src 'self' https://api.resend.com https://*.supabase.co",
    "frame-ancestors 'none'",
  ].join("; "),
};

function applySecurityHeaders(res: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(key, value);
  }
  return res;
}

// ── Auth helpers ─────────────────────────────────────────────────────────────
async function getRole(token?: string): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return (payload.role as string) ?? null;
  } catch {
    return null;
  }
}

// ── Auth routes soumises au rate limiting ────────────────────────────────────
const AUTH_PATHS = [
  "/connexion",
  "/rejoindre",
  "/connexion/otp",
  "/connexion/mot-de-passe-oublie",
  "/connexion/reinitialiser-mot-de-passe",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getIp(request);

  // ── Rate limiting sur les routes d'authentification (POST) ──────────────
  if (request.method === "POST" && AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    const allowed = edgeRateLimit(`auth:${ip}`, 10, 10 * 60 * 1000);
    if (!allowed) {
      return applySecurityHeaders(
        new NextResponse(
          JSON.stringify({ error: "Trop de tentatives. Réessayez dans 10 minutes." }),
          { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "600" } }
        )
      );
    }
  }

  // ── Rate limiting sur les API ────────────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    const limit = request.method === "GET" ? 120 : 60;
    const key = request.method === "GET" ? `api-get:${ip}` : `api-post:${ip}`;
    const allowed = edgeRateLimit(key, limit, 60 * 1000);
    if (!allowed) {
      return applySecurityHeaders(
        new NextResponse(
          JSON.stringify({ error: "Limite de requêtes atteinte. Réessayez dans une minute." }),
          { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } }
        )
      );
    }
  }

  // ── Auth : espace partenaire ─────────────────────────────────────────────
  const token = request.cookies.get("ibig_session")?.value;
  const role = await getRole(token);

  if (pathname.startsWith("/espace")) {
    if (!role) {
      const url = new URL("/connexion", request.url);
      url.searchParams.set("next", pathname);
      return applySecurityHeaders(NextResponse.redirect(url));
    }
  }

  // ── Auth : espace admin ──────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!role) {
      const url = new URL("/connexion", request.url);
      url.searchParams.set("next", pathname);
      return applySecurityHeaders(NextResponse.redirect(url));
    }
    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      return applySecurityHeaders(NextResponse.redirect(new URL("/espace", request.url)));
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf)).*)",
  ],
};

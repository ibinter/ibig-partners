import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-me",
);

// Verification optimiste de session (cookie JWT). L'autorisation fine est
// re-verifiee dans les layouts et server actions via src/lib/auth.ts.
async function getRole(token?: string): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return (payload.role as string) ?? null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("ibig_session")?.value;
  const role = await getRole(token);

  // Espace partenaire : authentification requise.
  if (pathname.startsWith("/espace")) {
    if (!role) {
      const url = new URL("/connexion", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Espace admin : role ADMIN ou SUPERADMIN requis.
  if (pathname.startsWith("/admin")) {
    if (!role) {
      const url = new URL("/connexion", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL("/espace", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/espace/:path*", "/admin/:path*"],
};

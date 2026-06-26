import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { COOKIE_TRACKING_DAYS } from "@/lib/constants";

// Lien d'affiliation : /aff/AFF-KOFFI-001?p=scolaby
// - enregistre un clic,
// - pose un cookie de tracking de 90 jours,
// - redirige vers le site produit (avec ?ref=) ou vers la page d'inscription.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const refCode = code.toUpperCase();
  const productSlug = request.nextUrl.searchParams.get("p");

  const partner = await prisma.user.findFirst({ where: { code: refCode } });

  let destination = `/rejoindre?ref=${encodeURIComponent(refCode)}`;
  if (partner && productSlug) {
    const product = await prisma.product.findUnique({ where: { slug: productSlug } });
    if (product) {
      // enregistre le clic sur le lien correspondant (s'il existe)
      const link = await prisma.affiliateLink.findUnique({
        where: { userId_productId: { userId: partner.id, productId: product.id } },
      });
      if (link) {
        await prisma.affiliateLink.update({
          where: { id: link.id },
          data: { clicks: { increment: 1 } },
        });
        await prisma.click.create({
          data: {
            linkId: link.id,
            ip: request.headers.get("x-forwarded-for") ?? undefined,
            userAgent: request.headers.get("user-agent") ?? undefined,
          },
        });
      }
      if (product.siteUrl) {
        destination = `https://${product.siteUrl}/?ref=${encodeURIComponent(refCode)}`;
      } else {
        destination = `/rejoindre?ref=${encodeURIComponent(refCode)}&product=${encodeURIComponent(product.name)}`;
      }
    }
  }

  const res = NextResponse.redirect(new URL(destination, request.url));
  if (partner) {
    res.cookies.set("ibig_ref", refCode, {
      maxAge: 60 * 60 * 24 * COOKIE_TRACKING_DAYS,
      path: "/",
      sameSite: "lax",
    });
  }
  return res;
}

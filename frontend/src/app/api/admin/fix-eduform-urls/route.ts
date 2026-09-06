/**
 * Endpoint temporaire — fix siteUrl de toutes les formations EDUFORM.
 * GET /api/admin/fix-eduform-urls?token=FIX_EDUFORM_2026_8x4k
 * À supprimer après usage.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SECRET = "FIX_EDUFORM_2026_8x4k";

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("token") !== SECRET) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  // Met à jour TOUTES les formations EDUFORM avec le bon format /formation/slug-sans-prefixe
  // Couvre : homepage, null, ancien format formation-detail.php, ET toute URL incorrecte
  const result = await prisma.$executeRaw(
    Prisma.sql`
      UPDATE "Product"
      SET "siteUrl" = 'https://ibig-eduform.com/formation/' || regexp_replace(slug, '^eduform-', '')
      WHERE slug LIKE 'eduform-%'
    `
  );

  const total = await prisma.product.count({
    where: { slug: { startsWith: "eduform-" } },
  });

  return NextResponse.json({
    ok: true,
    updated: result,
    total,
    message: `${result} formations EDUFORM mises à jour sur ${total} total.`,
  });
}

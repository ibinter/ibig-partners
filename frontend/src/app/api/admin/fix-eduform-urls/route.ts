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

  // 1. Récupérer les formations depuis l'API EDUFORM
  type ApiFormation = { slug: string; url: string; titre: string };
  let apiFormations: ApiFormation[] = [];
  try {
    const res = await fetch("https://ibig-eduform.com/api/formations.php", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      apiFormations = Array.isArray(data?.formations) ? data.formations : [];
    }
  } catch (e) {
    console.warn("fix-eduform-urls: API indisponible", e);
  }

  // 2. Appliquer les URLs réelles de l'API (une requête par formation API = ~24)
  let fixedFromApi = 0;
  for (const f of apiFormations) {
    const r = await prisma.product.updateMany({
      where: { slug: `eduform-${f.slug}` },
      data: { siteUrl: f.url },
    });
    fixedFromApi += r.count;
  }

  const apiPartnerSlugs = apiFormations.map(f => `eduform-${f.slug}`);

  // 3. Une seule requête SQL pour mettre à jour toutes les autres formations EDUFORM
  // Génère : https://ibig-eduform.com/formation/<slug-sans-préfixe>
  const result = await prisma.$executeRaw(
    Prisma.sql`
      UPDATE "Product"
      SET "siteUrl" = 'https://ibig-eduform.com/formation/' || regexp_replace(slug, '^eduform-', '')
      WHERE slug LIKE 'eduform-%'
        AND slug NOT IN (${Prisma.join(apiPartnerSlugs.length > 0 ? apiPartnerSlugs : ["__none__"])})
        AND ("siteUrl" IS NULL OR "siteUrl" IN ('https://ibig-eduform.com', 'https://ibig-eduform.com/'))
    `
  );

  const remaining = await prisma.product.count({
    where: {
      slug: { startsWith: "eduform-" },
      OR: [
        { siteUrl: "https://ibig-eduform.com" },
        { siteUrl: "https://ibig-eduform.com/" },
        { siteUrl: null },
      ],
    },
  });

  return NextResponse.json({
    ok: true,
    fixedFromApi,
    fixedFromSlug: result,
    remaining,
    message: `${fixedFromApi} URLs depuis l'API EDUFORM + ${result} générées par SQL. ${remaining} restant(s) sans URL valide.`,
  });
}

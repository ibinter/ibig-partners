/**
 * Endpoint temporaire — fix siteUrl de toutes les formations EDUFORM.
 * GET /api/admin/fix-eduform-urls?token=FIX_EDUFORM_2026
 * À supprimer après usage.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SECRET = "FIX_EDUFORM_2026_8x4k";

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("token") !== SECRET) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  // 1. Récupérer les 24 formations depuis l'API EDUFORM
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

  // 2. Mettre à jour les produits dont l'URL vient de l'API (format /formation/slug)
  let fixedFromApi = 0;
  for (const f of apiFormations) {
    const partnerSlug = `eduform-${f.slug}`;
    const r = await prisma.product.updateMany({
      where: { slug: partnerSlug },
      data: { siteUrl: f.url },
    });
    fixedFromApi += r.count;
  }

  // 3. Pour tous les autres produits EDUFORM avec homepage comme siteUrl → /formation/slug
  const apiPartnerSlugs = apiFormations.map(f => `eduform-${f.slug}`);
  const stale = await prisma.product.findMany({
    where: {
      AND: [
        { slug: { startsWith: "eduform-" } },
        { NOT: { slug: { in: apiPartnerSlugs } } },
      ],
      OR: [
        { siteUrl: "https://ibig-eduform.com" },
        { siteUrl: "https://ibig-eduform.com/" },
        { siteUrl: null },
      ],
    },
    select: { id: true, slug: true },
  });

  let fixedFromSlug = 0;
  for (const p of stale) {
    const slugSansPrefixe = p.slug.replace(/^eduform-/, "");
    await prisma.product.update({
      where: { id: p.id },
      data: { siteUrl: `https://ibig-eduform.com/formation/${slugSansPrefixe}` },
    });
    fixedFromSlug++;
  }

  // 4. Compter combien restent avec homepage
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
    fixedFromSlug,
    remaining,
    message: `${fixedFromApi} URLs depuis l'API EDUFORM + ${fixedFromSlug} générées depuis les slugs. ${remaining} produit(s) sans URL valide restants.`,
  });
}

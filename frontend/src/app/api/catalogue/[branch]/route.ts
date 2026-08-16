import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Endpoint de RÉFÉRENCE du flux catalogue (Voie A).
 *
 * Expose le catalogue actif d'une branche au format attendu par le connecteur
 * `catalog-feed`. Sert d'implémentation de référence pour les équipes externes
 * (chaque plateforme IBIG devra exposer un `/api/catalogue` renvoyant la même
 * structure) et permet à d'autres systèmes de lire le catalogue de PARTNERS.
 *
 * GET /api/catalogue/<branchSlug>
 * → { branch, count, products: [{ slug, name, pricingType, price, rate, siteUrl, description }] }
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ branch: string }> }
) {
  const { branch } = await params;
  try {
    const b = await prisma.branch.findUnique({ where: { slug: branch } });
    if (!b) {
      return NextResponse.json({ error: "Branche introuvable" }, { status: 404 });
    }

    const products = await prisma.product.findMany({
      where: { branchId: b.id, active: true },
      select: {
        slug: true,
        name: true,
        pricingType: true,
        price: true,
        rate: true,
        siteUrl: true,
        description: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(
      { branch: b.slug, count: products.length, products },
      { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } }
    );
  } catch (err) {
    console.error("catalogue feed error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

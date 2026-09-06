import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SECRET = "FIX_EDUFORM_RESET_2026";

// Seules les formations avec une vraie page sur ibig-eduform.com
const REAL_URLS: Record<string, string> = {
  "eduform-compta-finance-4en1": "https://ibig-eduform.com/formation/comptabilite-et-finance-4-en-1",
  "eduform-daf-dirigeant": "https://ibig-eduform.com/formation/daf-dirigeant",
  "eduform-expert-rh-3en1": "https://ibig-eduform.com/formation/grh-expert-3-en-1",
  "eduform-audit-controle-4en1": "https://ibig-eduform.com/formation/audit-et-controle-de-gestion-4-en-1",
  "eduform-marches-publics-3en1": "https://ibig-eduform.com/formation/passation-des-marches-publics-et-gestion-des-achats-3-en-1",
  "eduform-projets-humanitaires-3en1": "https://ibig-eduform.com/formation/gestion-et-management-de-projets-humanitaires-et-ong-3-en-1",
  "eduform-immobilier-3en1": "https://ibig-eduform.com/formation/immobilier-professionnel-3-en-1",
  "eduform-logistique-supply-chain-4en1": "https://ibig-eduform.com/formation/logistique-et-supply-chain-management-4-en-1",
  "eduform-qhse-4en1": "https://ibig-eduform.com/formation/qhse-expert-4-en-1",
  "eduform-ia-professionnels": "https://ibig-eduform.com/formation/intelligence-artificielle-pour-professionnels",
  "eduform-sage100-comptabilite": "https://ibig-eduform.com/formation/sage-100-comptabilite",
  "eduform-sage100-paie-rh": "https://ibig-eduform.com/formation/sage-100-paie-et-rh",
  "eduform-power-bi": "https://ibig-eduform.com/formation/microsoft-power-bi",
  "eduform-microsoft-project": "https://ibig-eduform.com/formation/microsoft-project",
  "eduform-sap-fi": "https://ibig-eduform.com/formation/sap-fi-comptabilite-financiere",
  "eduform-canva-pro": "https://ibig-eduform.com/formation/canva-pro-et-design-marketing",
  "eduform-kobotoolbox": "https://ibig-eduform.com/formation/kobotoolbox-et-collecte-de-donnees",
  "eduform-sage100-gescom": "https://ibig-eduform.com/formation/sage-100-gescom",
  "eduform-sage-etats-fiscaux": "https://ibig-eduform.com/formation/sage-etats-comptables-et-fiscaux",
};

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("token") !== SECRET) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  // 1. Remettre TOUT à la homepage
  const reset = await prisma.$executeRaw(
    Prisma.sql`UPDATE "Product" SET "siteUrl" = 'https://ibig-eduform.com' WHERE slug LIKE 'eduform-%'`
  );

  // 2. Mettre les vraies URLs pour les 19 formations qui ont une page dédiée
  let fixed = 0;
  for (const [slug, url] of Object.entries(REAL_URLS)) {
    const n = await prisma.$executeRaw(
      Prisma.sql`UPDATE "Product" SET "siteUrl" = ${url} WHERE slug = ${slug}`
    );
    fixed += Number(n);
  }

  return NextResponse.json({
    ok: true,
    reset,
    fixed,
    message: `${reset} formations remises à la homepage, ${fixed} avec une vraie URL de page dédiée.`,
  });
}

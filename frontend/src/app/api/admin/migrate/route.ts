import { NextResponse, NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Route GET temporaire — accessible sans connexion via ?key=ibig-migrate-2026
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== "ibig-migrate-2026") {
    return NextResponse.json({ error: "Clé invalide" }, { status: 403 });
  }
  return runMigrations();
}

async function runMigrations() {
  const results: string[] = [];

  try {
    // Ajouter colonne website sur Branch si absente
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Branch" ADD COLUMN IF NOT EXISTS "website" TEXT
    `);
    results.push("Branch.website : OK");
  } catch (e) {
    results.push(`Branch.website : ${e}`);
  }

  try {
    // Ajouter colonne order sur Branch si absente
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Branch" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0
    `);
    results.push("Branch.order : OK");
  } catch (e) {
    results.push(`Branch.order : ${e}`);
  }

  try {
    // Ajouter colonne siteUrl sur Product si absente
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "siteUrl" TEXT
    `);
    results.push("Product.siteUrl : OK");
  } catch (e) {
    results.push(`Product.siteUrl : ${e}`);
  }

  try {
    // Ajouter colonne description sur Product si absente
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "description" TEXT
    `);
    results.push("Product.description : OK");
  } catch (e) {
    results.push(`Product.description : ${e}`);
  }

  try {
    // Ajouter colonne active sur Product si absente
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true
    `);
    results.push("Product.active : OK");
  } catch (e) {
    results.push(`Product.active : ${e}`);
  }

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "partnerCommission" INTEGER NOT NULL DEFAULT 0
    `);
    results.push("Opportunity.partnerCommission : OK");
  } catch (e) {
    results.push(`Opportunity.partnerCommission : ${e}`);
  }

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "partnerCommissionType" TEXT NOT NULL DEFAULT 'FIXED'
    `);
    results.push("Opportunity.partnerCommissionType : OK");
  } catch (e) {
    results.push(`Opportunity.partnerCommissionType : ${e}`);
  }

  return NextResponse.json({ ok: true, results });
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }
  return runMigrations();
}

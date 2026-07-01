import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

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

  return NextResponse.json({ ok: true, results });
}

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isSyncAuthorized } from "@/lib/sync-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const EDUFORM_API = "https://ibig-eduform.com/api/formations.php";

// Mapping domaine EDUFORM → slug de branche EDUFORM dans ibig-partners
const DOMAIN_TO_BRANCH: Record<string, string> = {
  finance:         "eduform-finance",
  rh:              "eduform-rh",
  management:      "eduform-management",
  marketing:       "eduform-marketing",
  informatique:    "eduform-informatique",
  droit:           "eduform-droit",
  qhse:            "eduform-qhse",
  immobilier:      "eduform-immobilier",
  logistique:      "eduform-logistique",
  banque:          "eduform-banque",
  devperso:        "eduform-devperso",
  projets:         "eduform-projets",
  entrepreneuriat: "eduform-entrepreneuriat",
  metiers:         "eduform-metiers",
  mines:           "eduform-mines",
  sante:           "eduform-sante",
  tourisme:        "eduform-tourisme",
  services:        "eduform-services",
};

const CATEGORY_BRANCHES: Record<string, { slug: string; label: string }> = {
  finance:         { slug: "eduform-finance",         label: "EDUFORM — Finance, Comptabilité & Audit" },
  rh:              { slug: "eduform-rh",              label: "EDUFORM — Ressources Humaines & Paie" },
  management:      { slug: "eduform-management",      label: "EDUFORM — Management & Leadership" },
  marketing:       { slug: "eduform-marketing",       label: "EDUFORM — Marketing, Commerce & Communication" },
  informatique:    { slug: "eduform-informatique",    label: "EDUFORM — Informatique & Digital" },
  droit:           { slug: "eduform-droit",           label: "EDUFORM — Droit, Conformité & Marchés Publics" },
  qhse:            { slug: "eduform-qhse",            label: "EDUFORM — QHSE, Santé & Environnement" },
  immobilier:      { slug: "eduform-immobilier",      label: "EDUFORM — Immobilier & BTP" },
  logistique:      { slug: "eduform-logistique",      label: "EDUFORM — Logistique & Supply Chain" },
  banque:          { slug: "eduform-banque",          label: "EDUFORM — Banque, Assurance & Finance Inclusive" },
  devperso:        { slug: "eduform-devperso",        label: "EDUFORM — Développement Personnel & Soft Skills" },
  projets:         { slug: "eduform-projets",         label: "EDUFORM — Gestion de Projets, Humanitaire & ONG" },
  entrepreneuriat: { slug: "eduform-entrepreneuriat", label: "EDUFORM — Entrepreneuriat, Innovation & Agribusiness" },
  metiers:         { slug: "eduform-metiers",         label: "EDUFORM — Formations Métiers & Certificats Professionnels" },
  mines:           { slug: "eduform-mines",           label: "EDUFORM — Mines, Énergie & Pétrole" },
  sante:           { slug: "eduform-sante",           label: "EDUFORM — Santé, Médecine & Bien-être" },
  tourisme:        { slug: "eduform-tourisme",        label: "EDUFORM — Tourisme, Hôtellerie & Restauration" },
  services:        { slug: "eduform-services",        label: "EDUFORM — Services & Formats Entreprise" },
};

export async function POST(request: Request) {
  try {
    if (!(await isSyncAuthorized())) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // 1. Fetch live from EDUFORM
    const res = await fetch(EDUFORM_API, {
      headers: { "Accept": "application/json" },
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `EDUFORM API error: ${res.status}` },
        { status: 502 }
      );
    }
    const data = await res.json();
    if (!data.ok || !Array.isArray(data.formations)) {
      return NextResponse.json({ error: "Réponse EDUFORM invalide", raw: data }, { status: 502 });
    }

    const formations: Array<{
      id: number; titre: string; slug: string; url: string;
      domaine: string; pitch: string; tarif_en_ligne: number | null; tarif_presentiel: number | null;
    }> = data.formations;

    // 2. Save feed URL setting
    await prisma.setting.upsert({
      where:  { key: "catalog_feed_ibig-eduform" },
      update: { value: EDUFORM_API },
      create: { key: "catalog_feed_ibig-eduform", value: EDUFORM_API },
    }).catch(() => {});

    // 3. Ensure main branch exists
    const mainBranch = await prisma.branch.findUnique({ where: { slug: "ibig-eduform" } });
    if (!mainBranch) {
      return NextResponse.json({ error: "Branche ibig-eduform introuvable en base" }, { status: 500 });
    }

    // 4. Ensure sub-branches exist (upsert)
    const branchIds: Record<string, string> = {};
    const mainBranchData = await prisma.branch.findFirst({ where: { slug: "ibig-eduform" } });
    for (const [domaine, info] of Object.entries(CATEGORY_BRANCHES)) {
      const branch = await prisma.branch.upsert({
        where:  { slug: info.slug },
        update: { name: info.label },
        create: {
          id:               randomUUID(),
          slug:             info.slug,
          name:             info.label,
          tagline:          info.label,
          description:      info.label,
          offerType:        "Cours / Formation",
          commissionModel:  "10/5/2%",
          active:           true,
          order:            (mainBranchData?.order ?? 1) + 1,
          website:          "https://ibig-eduform.com",
        },
      });
      branchIds[domaine] = branch.id;
    }

    // 5. Upsert all formations
    const esc = (s: string) => "'" + String(s).replace(/'/g, "''").replace(/\r?\n/g, " ") + "'";

    const CHUNK_SIZE = 100;
    let synced = 0;

    for (let i = 0; i < formations.length; i += CHUNK_SIZE) {
      const chunk = formations.slice(i, i + CHUNK_SIZE);
      const rows = chunk.map(f => {
        const slug = f.slug ? "eduform-" + f.slug : "eduform-" + f.id;
        const domaine = (f.domaine ?? "").toLowerCase().trim();
        const branchId = branchIds[domaine] ?? mainBranch.id;
        const price = f.tarif_en_ligne ?? f.tarif_presentiel ?? 200000;
        const siteUrl = f.url || `https://ibig-eduform.com/formation/${f.slug}`;
        // category = libellé lisible du domaine (pour les filtres sidebar)
        const catLabel = domaine ? (CATEGORY_BRANCHES[domaine]?.label ?? domaine) : "Autre";
        return `(${esc(randomUUID())},${esc(branchId)},${esc(f.titre)},${esc(slug)},${esc(f.pitch || "")},${price},${"'COURSE'"},10,${esc(siteUrl)},true,${esc(catLabel)})`;
      });

      await prisma.$executeRawUnsafe(
        `INSERT INTO "Product" (id,"branchId",name,slug,description,price,"pricingType",rate,"siteUrl",active,category) VALUES ${rows.join(",")} ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name,price=EXCLUDED.price,"branchId"=EXCLUDED."branchId",active=true,"siteUrl"=EXCLUDED."siteUrl",category=EXCLUDED.category`
      );
      synced += chunk.length;
    }

    return NextResponse.json({
      ok:      true,
      synced,
      done:    synced,
      total:   formations.length,
      message: `${synced}/${formations.length} formations synchronisées depuis ibig-eduform.com`,
    });

  } catch (err: any) {
    console.error("sync-eduform error:", err);
    return NextResponse.json({ error: err?.message ?? "Erreur serveur" }, { status: 500 });
  }
}

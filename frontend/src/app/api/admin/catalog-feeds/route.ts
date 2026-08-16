import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isTrustedFeedUrl } from "@/lib/catalog-feed";

export const dynamic = "force-dynamic";

const PREFIX = "catalog_feed_";

async function requireAdmin() {
  const user = await getCurrentUser();
  return !!user && (user.role === "ADMIN" || user.role === "SUPERADMIN");
}

/** Liste les flux externes (Voie A) configurés par branche. */
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }
  const settings = await prisma.setting.findMany({ where: { key: { startsWith: PREFIX } } });
  const feeds = settings
    .map((s) => ({ branchSlug: s.key.slice(PREFIX.length), url: s.value }))
    .sort((a, b) => a.branchSlug.localeCompare(b.branchSlug));
  return NextResponse.json({ feeds });
}

/**
 * Configure (ou retire) le flux externe d'une branche.
 * Body: { branchSlug: string, url: string }  — url vide = retour au catalogue interne (repli).
 */
export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as { branchSlug?: unknown; url?: unknown } | null;
  const branchSlug = typeof body?.branchSlug === "string" ? body.branchSlug.trim() : "";
  const url = typeof body?.url === "string" ? body.url.trim() : "";

  if (!branchSlug) {
    return NextResponse.json({ error: "branchSlug requis" }, { status: 400 });
  }

  const branch = await prisma.branch.findUnique({ where: { slug: branchSlug } });
  if (!branch) {
    return NextResponse.json({ error: `Branche ${branchSlug} introuvable` }, { status: 404 });
  }

  const key = `${PREFIX}${branchSlug}`;

  if (!url) {
    await prisma.setting.deleteMany({ where: { key } });
    return NextResponse.json({
      ok: true,
      branchSlug,
      url: null,
      message: "Flux retiré : cette branche repasse sur son catalogue interne.",
    });
  }

  if (!isTrustedFeedUrl(url)) {
    return NextResponse.json(
      { error: "URL non autorisée : HTTPS et domaine IBIG requis." },
      { status: 400 }
    );
  }

  await prisma.setting.upsert({
    where: { key },
    update: { value: url },
    create: { key, value: url },
  });

  return NextResponse.json({
    ok: true,
    branchSlug,
    url,
    message: "Flux externe configuré. La prochaine synchro tirera le catalogue depuis cette URL.",
  });
}

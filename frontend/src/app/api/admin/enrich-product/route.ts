import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isSyncAuthorized } from "@/lib/sync-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Extrait du texte utile d'un HTML brut (supprime scripts, styles, nav, footer)
function extractText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 8000);
}

// Extrait la balise <title>
function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1].trim() : "";
}

// Extrait la meta description
function extractMetaDesc(html: string): string {
  const m = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  return m ? m[1].trim() : "";
}

// Extrait la première image og:image ou grande image
function extractImage(html: string): string {
  const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  return og ? og[1].trim() : "";
}

// Génère automatiquement des bullets à partir du texte de la page
function generateBullets(pageText: string, productName: string): string[] {
  const bullets: string[] = [];
  const lower = pageText.toLowerCase();

  // Détecte les certifications
  const certMatch = productName.match(/(\d+)\s*en\s*1/i);
  if (certMatch) bullets.push(`${certMatch[1]} certificats reconnus en un seul parcours`);

  // Détecte les heures
  const heures = pageText.match(/(\d+)\s*h(?:eures?)?/i);
  if (heures) bullets.push(`${heures[1]} heures de formation intensive`);

  // Détecte les modules/modules
  const modules = pageText.match(/(\d+)\s*modules?/i);
  if (modules) bullets.push(`${modules[1]} modules progressifs`);

  // Mots-clés positifs dans le texte
  if (lower.includes("attestation") || lower.includes("certificat")) {
    bullets.push("Attestation IBIG EDUFORM délivrée à la fin");
  }
  if (lower.includes("pratique") || lower.includes("opérationnel")) {
    bullets.push("Formation 100 % pratique et opérationnelle");
  }
  if (lower.includes("replay") || lower.includes("revoir")) {
    bullets.push("Replay des sessions disponible");
  }
  if (lower.includes("groupe") || lower.includes("whatsapp")) {
    bullets.push("Groupe d'entraide et suivi post-formation");
  }
  if (lower.includes("accompagnement") || lower.includes("formateur")) {
    bullets.push("Formateur expert disponible pour vos questions");
  }
  if (lower.includes("emploi") || lower.includes("recrutement") || lower.includes("cv")) {
    bullets.push("Attestation valorisable sur votre CV");
  }

  // Fallback si trop peu de bullets
  if (bullets.length < 3) {
    bullets.push("Formation animée par des experts certifiés");
    bullets.push("Accès depuis n'importe quel appareil (PC, mobile)");
    bullets.push("Certification reconnue par les employeurs");
  }

  return bullets.slice(0, 6);
}

export async function POST(request: NextRequest) {
  if (!(await isSyncAuthorized())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { slug } = await request.json().catch(() => ({}));
  if (!slug) return NextResponse.json({ error: "slug requis" }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  if (!product.siteUrl) return NextResponse.json({ error: "Aucun siteUrl pour ce produit" }, { status: 400 });

  const url = product.siteUrl.startsWith("http") ? product.siteUrl : `https://${product.siteUrl}`;

  let html = "";
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "IBIG-Partners-Bot/1.0" },
      signal: AbortSignal.timeout(12000),
    });
    html = await res.text();
  } catch {
    return NextResponse.json({ error: `Impossible de charger ${url}` }, { status: 502 });
  }

  const pageTitle   = extractTitle(html);
  const metaDesc    = extractMetaDesc(html);
  const pageText    = extractText(html);
  const imageUrl    = extractImage(html);

  // Tagline : préférer meta description, sinon titre de page
  const tagline = metaDesc || pageTitle || product.name;

  // Audience : extrait depuis description produit (après "Idéal pour" ou "Pour ")
  const audienceMatch = (product.description ?? "").match(/(?:Idéal pour|Pour)\s*:\s*([^.]+)\./i)
    ?? (product.description ?? "").match(/(?:Idéal pour|Pour)\s+([^.]+)\./i);
  const audience = audienceMatch ? audienceMatch[1].trim() : "";

  // Ce qui est inclus : cherche dans description produit
  const includesRaw: string[] = [];
  if ((product.description ?? "").toLowerCase().includes("attestation")) includesRaw.push("Attestation IBIG EDUFORM");
  if ((product.description ?? "").toLowerCase().includes("replay"))      includesRaw.push("Replay des sessions");
  if ((product.description ?? "").toLowerCase().includes("support"))     includesRaw.push("Support de cours PDF");
  if ((product.description ?? "").toLowerCase().includes("whatsapp") || (product.description ?? "").toLowerCase().includes("groupe d'entraide")) {
    includesRaw.push("Groupe d'entraide WhatsApp");
  }
  if ((product.description ?? "").toLowerCase().includes("accompagnement post")) includesRaw.push("Accompagnement post-formation");
  if (includesRaw.length === 0) includesRaw.push("Supports pédagogiques", "Attestation de participation", "Suivi formateur");

  const bullets = generateBullets(pageText + " " + (product.description ?? ""), product.name);

  const marketingData = {
    tagline:    tagline.slice(0, 200),
    bullets,
    audience,
    includes:   includesRaw,
    imageUrl,
    fetchedAt:  new Date().toISOString(),
    sourceUrl:  url,
  };

  await (prisma as any).product.update({
    where: { slug },
    data: { marketingData: JSON.stringify(marketingData) },
  });

  return NextResponse.json({ ok: true, marketingData });
}

/**
 * Proxy sécurisé pour les fichiers Cloudinary en mode "authenticated".
 * Récupère le fichier côté serveur (avec les credentials API) et le renvoie
 * au client — sans exposer les credentials ni demander de configuration Cloudinary.
 *
 * Usage : GET /api/cloudinary/signed-url?url=<cloudinary_url_encodée>
 *
 * Variables d'env requises :
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary non configuré" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url");
  if (!fileUrl) return NextResponse.json({ error: "url requis" }, { status: 400 });

  // Sécurité : autoriser uniquement les URLs Cloudinary
  let parsed: URL;
  try {
    parsed = new URL(fileUrl);
  } catch {
    return NextResponse.json({ error: "URL invalide" }, { status: 400 });
  }
  if (!parsed.hostname.endsWith("cloudinary.com")) {
    return NextResponse.json({ error: "Hôte non autorisé" }, { status: 403 });
  }

  // Récupérer le fichier avec authentification Basic (API key:secret)
  const upstream = await fetch(fileUrl, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
    },
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: `Fichier inaccessible (${upstream.status})` },
      { status: upstream.status }
    );
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
  const buffer = await upstream.arrayBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
      "Content-Disposition": contentType.includes("pdf") ? "inline" : "inline",
    },
  });
}

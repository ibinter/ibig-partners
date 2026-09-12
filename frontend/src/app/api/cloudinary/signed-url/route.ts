/**
 * Proxy sécurisé pour les fichiers Cloudinary en mode "authenticated" ou protégés.
 * Utilise l'API Admin Cloudinary pour récupérer l'URL sécurisée, puis renvoie
 * le fichier au client — sans exposer les credentials.
 *
 * Usage : GET /api/cloudinary/signed-url?url=<cloudinary_url_encodée>
 *
 * Variables d'env requises :
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Extrait le public_id depuis une URL Cloudinary standard */
function extractPublicId(url: string): string | null {
  try {
    const u = new URL(url);
    // Format : /cloudname/image/upload/v123456/folder/filename.ext
    //       ou /cloudname/image/authenticated/s--sig--/folder/filename.ext
    const parts = u.pathname.split("/");
    // Trouver l'index après "upload" ou "authenticated"
    const uploadIdx = parts.findIndex((p) => p === "upload" || p === "authenticated");
    if (uploadIdx === -1) return null;
    let rest = parts.slice(uploadIdx + 1).join("/");
    // Ignorer la version (v123456) et les transformations (s--...-- ou fl_...)
    rest = rest.replace(/^v\d+\//, "");
    rest = rest.replace(/^s--[^/]+--\//, "");
    // Retirer l'extension pour les images (Cloudinary stocke sans extension)
    // Garder l'extension pour les PDFs
    return rest;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
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

  const publicId = extractPublicId(fileUrl);
  if (!publicId) {
    return NextResponse.json({ error: "public_id introuvable dans l'URL" }, { status: 400 });
  }

  // Déterminer le resource_type depuis l'URL (image, video, raw)
  const resourceType = parsed.pathname.includes("/video/") ? "video"
    : parsed.pathname.includes("/raw/") ? "raw"
    : "image";

  // Générer une URL signée Cloudinary (valable 2h)
  const timestamp = Math.floor(Date.now() / 1000) + 7200;

  // Signature : SHA-1 de "public_id=<id>&timestamp=<ts><secret>"
  const toSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(toSign).digest("hex");

  // Télécharger via l'API Admin Cloudinary
  const downloadUrl =
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload/${publicId}` +
    `?timestamp=${timestamp}&api_key=${apiKey}&signature=${signature}`;

  // Récupérer les métadonnées pour obtenir l'URL de livraison
  const metaRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/${resourceType}/upload/${encodeURIComponent(publicId)}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
      },
    }
  );

  if (metaRes.ok) {
    const meta = await metaRes.json();
    const secureUrl: string = meta.secure_url ?? fileUrl;

    // Proxy le fichier depuis l'URL sécurisée
    const fileRes = await fetch(secureUrl);
    if (fileRes.ok) {
      const contentType = fileRes.headers.get("content-type") ?? "application/octet-stream";
      const buffer = await fileRes.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "private, max-age=3600",
          "Content-Disposition": "inline",
        },
      });
    }
  }

  // Fallback : essayer directement avec Basic auth sur l'URL originale
  const directRes = await fetch(fileUrl, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
    },
  });

  if (!directRes.ok) {
    return NextResponse.json(
      { error: `Fichier inaccessible (${directRes.status}). Vérifiez les paramètres Cloudinary.` },
      { status: directRes.status }
    );
  }

  const contentType = directRes.headers.get("content-type") ?? "application/octet-stream";
  const buffer = await directRes.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
      "Content-Disposition": "inline",
    },
  });
}

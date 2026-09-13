/**
 * Proxy sécurisé pour les fichiers Cloudinary (images et PDFs).
 * PDFs stockés via resource_type=auto peuvent être en type "raw" même si
 * l'URL originale contient "/image/upload/" — on essaie les deux.
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
export const maxDuration = 30;

const BASIC_AUTH = (key: string, secret: string) =>
  `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`;

/** Télécharge un fichier Cloudinary via l'API Admin et renvoie son contenu */
async function fetchViaAdminApi(
  cloudName: string,
  apiKey: string,
  apiSecret: string,
  publicId: string,
  resourceType: "image" | "raw" | "video"
): Promise<{ buffer: ArrayBuffer; contentType: string } | null> {
  const metaUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/${resourceType}/upload/${encodeURIComponent(publicId)}`;
  const metaRes = await fetch(metaUrl, {
    headers: { Authorization: BASIC_AUTH(apiKey, apiSecret) },
  });
  if (!metaRes.ok) return null;

  const meta = await metaRes.json();
  const secureUrl: string = meta.secure_url;
  if (!secureUrl) return null;

  // Pour les PDFs, ajouter fl_attachment pour forcer le téléchargement du PDF brut
  const fetchUrl = secureUrl.endsWith(".pdf")
    ? secureUrl.replace("/upload/", "/upload/fl_attachment/")
    : secureUrl;

  const fileRes = await fetch(fetchUrl);
  if (!fileRes.ok) return null;

  return {
    buffer: await fileRes.arrayBuffer(),
    contentType: fileRes.headers.get("content-type") ?? "application/octet-stream",
  };
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary non configuré (API_KEY / API_SECRET manquants)" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url");
  if (!fileUrl) return NextResponse.json({ error: "url requis" }, { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(fileUrl);
  } catch {
    return NextResponse.json({ error: "URL invalide" }, { status: 400 });
  }
  if (!parsed.hostname.endsWith("cloudinary.com")) {
    return NextResponse.json({ error: "Hôte non autorisé" }, { status: 403 });
  }

  // Extraire cloud_name depuis l'URL
  const pathParts = parsed.pathname.split("/").filter(Boolean);
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? pathParts[0];

  // Extraire le public_id (tout ce qui suit /upload/ ou /authenticated/, sans version)
  const uploadIdx = pathParts.findIndex((p) => p === "upload" || p === "authenticated");
  if (uploadIdx === -1) return NextResponse.json({ error: "URL Cloudinary invalide" }, { status: 400 });

  let publicIdParts = pathParts.slice(uploadIdx + 1);
  // Retirer la version (v123456...)
  if (/^v\d+$/.test(publicIdParts[0])) publicIdParts = publicIdParts.slice(1);
  // Retirer les transformations (s--...-- ou fl_...)
  publicIdParts = publicIdParts.filter((p) => !p.startsWith("s--") && !p.startsWith("fl_"));
  const publicId = publicIdParts.join("/");

  const isPdf = publicId.toLowerCase().endsWith(".pdf");

  // Pour les PDFs : essayer "raw" en premier (type correct pour les PDFs dans Cloudinary)
  // Pour les images : essayer "image"
  const orderedTypes: Array<"image" | "raw" | "video"> = isPdf
    ? ["raw", "image"]
    : ["image", "raw"];

  for (const resourceType of orderedTypes) {
    const result = await fetchViaAdminApi(cloudName, apiKey, apiSecret, publicId, resourceType);
    if (result) {
      return new NextResponse(result.buffer, {
        headers: {
          "Content-Type": isPdf ? "application/pdf" : result.contentType,
          "Cache-Control": "private, max-age=3600",
          "Content-Disposition": "inline",
        },
      });
    }
  }

  return NextResponse.json(
    { error: "Fichier introuvable sur Cloudinary. Vérifiez que le fichier existe." },
    { status: 404 }
  );
}

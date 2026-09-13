/**
 * Proxy Cloudinary : récupère le fichier via l'API Admin et le renvoie au navigateur.
 * Contourne le 401 sur les fichiers "authenticated" ou "raw".
 *
 * GET /api/cloudinary/signed-url?url=<cloudinary_url_encodée>
 * Env : CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function extractPublicId(pathname: string): string {
  // /cloudname/resource_type/delivery_type/vXXX/folder/file.ext
  // ou /cloudname/resource_type/delivery_type/folder/file.ext
  const parts = pathname.split("/").filter(Boolean);
  // Trouver l'index de upload/authenticated/raw
  const idx = parts.findIndex((p) =>
    p === "upload" || p === "authenticated" || p === "raw"
  );
  if (idx === -1) return parts.slice(1).join("/"); // fallback

  let rest = parts.slice(idx + 1);
  // Supprimer version (v123456)
  if (rest[0] && /^v\d+$/.test(rest[0])) rest = rest.slice(1);
  // Supprimer transformations Cloudinary (s--sig--, fl_xxx, etc.)
  rest = rest.filter((p) => !p.startsWith("s--") && !p.match(/^[a-z]{1,4}_/));
  return rest.join("/");
}

async function fetchFile(
  cloudName: string,
  apiKey: string,
  apiSecret: string,
  publicId: string,
  resourceType: string
): Promise<{ buffer: ArrayBuffer; contentType: string } | null> {
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/${resourceType}/upload/${encodeURIComponent(publicId)}`;

  try {
    const infoRes = await fetch(url, {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!infoRes.ok) return null;

    const info = await infoRes.json();
    const secureUrl: string = info.secure_url;
    if (!secureUrl) return null;

    // Télécharger le fichier réel via l'URL sécurisée + auth Admin
    const fileRes = await fetch(secureUrl, {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!fileRes.ok) return null;

    const buffer = await fileRes.arrayBuffer();
    const contentType =
      fileRes.headers.get("content-type") ?? "application/octet-stream";
    return { buffer, contentType };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const fileUrl = new URL(req.url).searchParams.get("url");
  if (!fileUrl) {
    return NextResponse.json({ error: "Paramètre url manquant" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(fileUrl);
  } catch {
    return NextResponse.json({ error: "URL invalide" }, { status: 400 });
  }

  if (!parsed.hostname.endsWith("cloudinary.com")) {
    return NextResponse.json({ error: "Hôte non autorisé" }, { status: 403 });
  }

  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  // Si pas de credentials → redirection directe (espoir que le fichier est public)
  if (!apiKey || !apiSecret || !cloudName) {
    return NextResponse.redirect(fileUrl);
  }

  // Extraire le public_id et le resource_type depuis l'URL
  const parts = parsed.pathname.split("/").filter(Boolean);
  // Format: /cloudname/resource_type/delivery_type/...
  // parts[0] = cloudname, parts[1] = resource_type (image|raw|video), parts[2] = upload|authenticated|...
  const urlResourceType = parts[1] ?? "image"; // image, raw, video
  const publicId = extractPublicId(parsed.pathname);
  const isPdf = publicId.toLowerCase().endsWith(".pdf");

  // Essayer dans l'ordre le plus probable
  const typesToTry = isPdf
    ? ["raw", "image", "video"]
    : urlResourceType === "raw"
    ? ["raw", "image"]
    : ["image", "raw"];

  for (const resType of typesToTry) {
    const result = await fetchFile(cloudName, apiKey, apiSecret, publicId, resType);
    if (result) {
      const disposition = isPdf
        ? `inline; filename="${publicId.split("/").pop()}"`
        : "inline";
      return new NextResponse(result.buffer, {
        status: 200,
        headers: {
          "Content-Type": result.contentType,
          "Content-Disposition": disposition,
          "Cache-Control": "private, max-age=3600",
        },
      });
    }
  }

  // Dernier recours : redirection directe
  return NextResponse.redirect(fileUrl);
}

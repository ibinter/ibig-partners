/**
 * Proxy Cloudinary : rend le fichier public via l'API Admin, puis redirige.
 * La 1ère ouverture migre le fichier de "restricted" à "public".
 * Les ouvertures suivantes fonctionnent directement.
 *
 * GET /api/cloudinary/signed-url?url=<cloudinary_url_encodée>
 * Env : CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function extractInfo(pathname: string): { resourceType: string; publicId: string } {
  const parts = pathname.split("/").filter(Boolean);
  // parts: [cloudname, resource_type, delivery_type, vXXX?, folder, file]
  const resourceType = parts[1] ?? "image"; // image | raw | video
  const idx = parts.findIndex((p) => p === "upload" || p === "authenticated" || p === "raw");
  let rest = idx !== -1 ? parts.slice(idx + 1) : parts.slice(2);
  // Supprimer version (v123456)
  if (rest[0] && /^v\d+$/.test(rest[0])) rest = rest.slice(1);
  // Supprimer transformations Cloudinary
  rest = rest.filter((p) => !p.startsWith("s--"));
  return { resourceType, publicId: rest.join("/") };
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

  if (!apiKey || !apiSecret || !cloudName) {
    return NextResponse.redirect(fileUrl);
  }

  const { resourceType, publicId } = extractInfo(parsed.pathname);
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  // Rendre le fichier public via l'API Admin Cloudinary
  // Essayer resource_type "image" d'abord (pour les PDFs uploadés en auto), puis "raw"
  const typesToTry = publicId.toLowerCase().endsWith(".pdf")
    ? ["image", "raw"]
    : [resourceType, "image", "raw"];

  for (const resType of typesToTry) {
    const apiUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/${resType}/upload`;
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_ids: [publicId],
          access_mode: "public",
        }),
      });

      if (res.ok) {
        // Reconstruire l'URL publique avec le bon resource_type
        const publicUrl = `https://res.cloudinary.com/${cloudName}/${resType}/upload/${publicId}`;
        return NextResponse.redirect(publicUrl);
      }
    } catch {
      // Continuer avec le prochain type
    }
  }

  // Dernier recours : rediriger vers l'URL originale
  return NextResponse.redirect(fileUrl);
}

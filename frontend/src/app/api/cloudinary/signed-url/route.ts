/**
 * Génère une URL de téléchargement privée Cloudinary (private_download).
 * Bypass toutes les restrictions d'accès du compte.
 *
 * GET /api/cloudinary/signed-url?url=<cloudinary_url_encodée>
 * Env : CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME
 */

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function extractInfo(pathname: string): {
  resourceType: string;
  publicId: string;
  format: string;
} {
  const parts = pathname.split("/").filter(Boolean);
  // parts: [cloudname, resource_type, delivery_type, vXXX?, ...publicId.format]
  const resourceType = parts[1] ?? "image";
  const idx = parts.findIndex(
    (p) => p === "upload" || p === "authenticated" || p === "raw"
  );
  let rest = idx !== -1 ? parts.slice(idx + 1) : parts.slice(2);
  if (rest[0] && /^v\d+$/.test(rest[0])) rest = rest.slice(1);
  rest = rest.filter((p) => !p.startsWith("s--"));

  const lastPart = rest[rest.length - 1] ?? "";
  const dotIdx = lastPart.lastIndexOf(".");
  let format = "";
  if (dotIdx !== -1) {
    format = lastPart.slice(dotIdx + 1);
    rest[rest.length - 1] = lastPart.slice(0, dotIdx);
  }

  return { resourceType, publicId: rest.join("/"), format };
}

function signParams(params: Record<string, string>, apiSecret: string): string {
  // Trier les paramètres alphabétiquement et créer la chaîne à signer
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1")
    .update(sorted + apiSecret)
    .digest("hex");
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

  const { resourceType, publicId, format } = extractInfo(parsed.pathname);
  const timestamp = String(Math.floor(Date.now() / 1000));

  const params: Record<string, string> = {
    public_id: publicId,
    resource_type: resourceType,
    timestamp,
    type: "upload",
  };
  if (format) params.format = format;

  const signature = signParams(params, apiSecret);

  // Construire l'URL private_download
  const qs = new URLSearchParams({
    ...params,
    api_key: apiKey,
    signature,
  });

  const privateUrl = `https://api.cloudinary.com/v1_1/${cloudName}/private_download?${qs}`;

  // Récupérer côté serveur et streamer au navigateur
  try {
    const fileRes = await fetch(privateUrl);
    if (!fileRes.ok) {
      // Fallback redirection directe
      return NextResponse.redirect(fileUrl);
    }
    const buffer = await fileRes.arrayBuffer();
    const contentType =
      fileRes.headers.get("content-type") ??
      (format === "pdf" ? "application/pdf" : "application/octet-stream");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${publicId.split("/").pop()}.${format}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.redirect(fileUrl);
  }
}

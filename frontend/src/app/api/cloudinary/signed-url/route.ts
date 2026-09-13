/**
 * Redirige vers une URL private_download Cloudinary signée.
 * Le navigateur suit la redirection → Cloudinary sert le fichier directement.
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

  // Paramètres à signer pour /download (SDK Cloudinary officiel)
  // Endpoint : /v1_1/{cloud}/{resource_type}/download
  const toSign: Record<string, string> = {
    public_id: publicId,
    timestamp,
    type: "upload",
  };
  if (format) toSign.format = format;

  const sorted = Object.keys(toSign)
    .sort()
    .map((k) => `${k}=${toSign[k]}`)
    .join("&");

  const signature = createHash("sha1")
    .update(sorted + apiSecret)
    .digest("hex");

  const qs = new URLSearchParams({
    ...toSign,
    api_key: apiKey,
    signature,
  });

  // URL correcte : /{resource_type}/download (pas /private_download)
  const downloadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/download?${qs}`;

  return NextResponse.redirect(downloadUrl);
}

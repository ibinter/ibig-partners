/**
 * Proxy Cloudinary : rend le fichier public (PUT access_mode=public) puis redirige.
 *
 * GET /api/cloudinary/signed-url?url=<cloudinary_url_encodée>
 * Env : CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function extractInfo(pathname: string): { resourceType: string; publicId: string } {
  const parts = pathname.split("/").filter(Boolean);
  const resourceType = parts[1] ?? "image";
  const idx = parts.findIndex((p) => p === "upload" || p === "authenticated" || p === "raw");
  let rest = idx !== -1 ? parts.slice(idx + 1) : parts.slice(2);
  if (rest[0] && /^v\d+$/.test(rest[0])) rest = rest.slice(1);
  rest = rest.filter((p) => !p.startsWith("s--"));
  return { resourceType, publicId: rest.join("/") };
}

async function makePublic(
  cloudName: string,
  auth: string,
  resourceType: string,
  publicId: string
): Promise<boolean> {
  // PUT /v1_1/{cloud}/resources/{type}/upload/{public_id}
  const encodedId = publicId.split("/").map(encodeURIComponent).join("/");
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/${resourceType}/upload/${encodedId}`;
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ access_mode: "public" }),
    });
    return res.ok;
  } catch {
    return false;
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

  if (!apiKey || !apiSecret || !cloudName) {
    return NextResponse.redirect(fileUrl);
  }

  const { resourceType, publicId } = extractInfo(parsed.pathname);
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  const isPdf = publicId.toLowerCase().endsWith(".pdf");
  const typesToTry = isPdf ? ["image", "raw"] : [resourceType];

  for (const resType of typesToTry) {
    const ok = await makePublic(cloudName, auth, resType, publicId);
    if (ok) {
      const publicUrl = `https://res.cloudinary.com/${cloudName}/${resType}/upload/${publicId}`;
      return NextResponse.redirect(publicUrl);
    }
  }

  return NextResponse.redirect(fileUrl);
}

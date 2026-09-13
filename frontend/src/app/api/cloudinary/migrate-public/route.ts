/**
 * Migration one-shot : rend publics tous les fichiers du dossier ibig-kyc-cv et ibig-misc.
 * GET /api/cloudinary/migrate-public  (admin uniquement)
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const FOLDERS = ["ibig-kyc-cv", "kyb-docs"];
const RESOURCE_TYPES = ["image", "raw"];

async function listAndPublish(
  cloudName: string,
  auth: string,
  folder: string,
  resourceType: string
): Promise<{ done: string[]; errors: string[] }> {
  const done: string[] = [];
  const errors: string[] = [];

  let nextCursor: string | undefined;
  do {
    const params = new URLSearchParams({
      type: "upload",
      prefix: folder,
      max_results: "100",
      ...(nextCursor ? { next_cursor: nextCursor } : {}),
    });
    const listUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/${resourceType}?${params}`;
    const listRes = await fetch(listUrl, { headers: { Authorization: `Basic ${auth}` } });
    if (!listRes.ok) break;

    const data = await listRes.json();
    const resources: { public_id: string }[] = data.resources ?? [];
    nextCursor = data.next_cursor;

    for (const r of resources) {
      const encodedId = r.public_id.split("/").map(encodeURIComponent).join("/");
      const putUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/${resourceType}/upload/${encodedId}`;
      try {
        const putRes = await fetch(putUrl, {
          method: "PUT",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ access_mode: "public" }),
        });
        if (putRes.ok) done.push(r.public_id);
        else errors.push(`${r.public_id} (${putRes.status})`);
      } catch {
        errors.push(`${r.public_id} (exception)`);
      }
    }
  } while (nextCursor);

  return { done, errors };
}

export async function GET() {
  await requireAdmin();

  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  if (!apiKey || !apiSecret || !cloudName) {
    return NextResponse.json({ error: "Cloudinary non configuré" }, { status: 500 });
  }

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const results: Record<string, unknown> = {};

  for (const folder of FOLDERS) {
    for (const resType of RESOURCE_TYPES) {
      const key = `${folder}/${resType}`;
      results[key] = await listAndPublish(cloudName, auth, folder, resType);
    }
  }

  return NextResponse.json({ ok: true, results });
}

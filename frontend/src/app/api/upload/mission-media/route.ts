import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BUCKET       = "mission-media";

export async function POST(req: Request) {
  await requireUser();

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });

  const ext  = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buf  = Buffer.from(await file.arrayBuffer());

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${name}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "true",
      },
      body: buf,
    }
  );

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    return NextResponse.json({ error: "Upload échoué", detail: err }, { status: 500 });
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${name}`;
  return NextResponse.json({ url: publicUrl });
}

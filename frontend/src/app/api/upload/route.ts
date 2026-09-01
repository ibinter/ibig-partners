import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "application/pdf",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

    const cloudName   = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      return NextResponse.json({ error: "Upload non configuré" }, { status: 500 });
    }

    const form = await request.formData();
    const file   = form.get("file") as File | null;
    const folder = String(form.get("folder") ?? "ibig-misc");

    if (!file) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Type de fichier non autorisé (JPEG, PNG, PDF)" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 10 Mo)" }, { status: 400 });
    }

    const cloudForm = new FormData();
    cloudForm.append("file", file);
    cloudForm.append("upload_preset", uploadPreset);
    cloudForm.append("folder", folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      { method: "POST", body: cloudForm }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Cloudinary error:", err);
      return NextResponse.json({ error: "Échec de l'upload" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ url: data.secure_url });
  } catch (err: any) {
    console.error("upload error:", err);
    return NextResponse.json({ error: err?.message ?? "Erreur serveur" }, { status: 500 });
  }
}

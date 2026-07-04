import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

    const isAdmin = user.role === "ADMIN" || user.role === "SUPERADMIN";
    if (!isAdmin) {
      const filleulCount = await prisma.user.count({ where: { sponsorId: user.id } });
      if (filleulCount === 0) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return NextResponse.json({ error: "Upload non configuré" }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });

    // Limite 10 Mo
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 10 Mo)" }, { status: 400 });
    }

    // Upload vers Cloudinary via unsigned preset
    const cloudForm = new FormData();
    cloudForm.append("file", file);
    cloudForm.append("upload_preset", uploadPreset);
    cloudForm.append("folder", "ibig-chat");

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      { method: "POST", body: cloudForm }
    );

    if (!cloudRes.ok) {
      const err = await cloudRes.text();
      console.error("Cloudinary error:", err);
      return NextResponse.json({ error: "Échec de l'upload" }, { status: 500 });
    }

    const cloudData = await cloudRes.json();
    return NextResponse.json({ url: cloudData.secure_url });
  } catch (err: any) {
    console.error("upload route error:", err);
    return NextResponse.json({ error: err?.message ?? "Erreur serveur" }, { status: 500 });
  }
}

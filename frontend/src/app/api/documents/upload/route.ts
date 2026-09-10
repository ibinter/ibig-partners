import { requireUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import * as ftp from "basic-ftp";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await requireUser();

  const fd   = await req.formData();
  const file = fd.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Fichier trop volumineux" }, { status: 400 });

  const ext      = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const allowed  = ["pdf", "jpg", "jpeg", "png"];
  if (!allowed.includes(ext)) return NextResponse.json({ error: "Type de fichier non autorisé" }, { status: 400 });

  const ts        = Date.now();
  const remoteName = `${user.id}_${ts}.${ext}`;
  const remotePath = `/ibig-docs/${remoteName}`;

  const host     = process.env.FTP_HOST;
  const ftpUser  = process.env.FTP_USER;
  const password = process.env.FTP_PASS ?? "";
  const baseUrl  = process.env.FTP_BASE_URL ?? `https://ibigsoft.com/ibig-docs`;

  if (!host || !ftpUser) {
    return NextResponse.json({ error: "Serveur de documents non configuré (FTP_HOST ou FTP_USER manquant)" }, { status: 503 });
  }

  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    await client.access({ host, user: ftpUser, password, secure: true });
    await client.ensureDir("/ibig-docs");

    const buf   = Buffer.from(await file.arrayBuffer());
    const { Readable } = await import("stream");
    const stream = Readable.from(buf);
    await client.uploadFrom(stream, remotePath);
  } catch (err) {
    console.error("[FTP UPLOAD ERROR]", err);
    return NextResponse.json({ error: "Erreur FTP lors de l'upload" }, { status: 500 });
  } finally {
    client.close();
  }

  const url = `${baseUrl}/${remoteName}`;
  return NextResponse.json({ ok: true, url });
}

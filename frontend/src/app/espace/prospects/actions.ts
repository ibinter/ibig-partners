"use server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProspect(fd: FormData) {
  const user = await requireUser();
  const name    = (fd.get("name") as string)?.trim();
  const contact = (fd.get("contact") as string)?.trim() || null;
  const note    = (fd.get("note") as string)?.trim() || null;
  if (!name) return;

  await prisma.prospect.create({
    data: { userId: user.id, name, contact, note, status: "CONTACTED", priority: "NORMAL" },
  });
  revalidatePath("/espace/prospects");
}

export async function moveProspect(fd: FormData) {
  const user   = await requireUser();
  const id     = fd.get("id") as string;
  const status = fd.get("status") as string;
  if (!id || !status) return;

  await prisma.prospect.updateMany({
    where: { id, userId: user.id },
    data: { status, lastContactedAt: new Date() },
  });
  revalidatePath("/espace/prospects");
}

export async function deleteProspect(fd: FormData) {
  const user = await requireUser();
  const id   = fd.get("id") as string;
  if (!id) return;

  await prisma.prospect.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/espace/prospects");
}

export async function importProspectsFromCsv(fd: FormData) {
  const user = await requireUser();
  const raw  = (fd.get("csv") as string)?.trim();
  if (!raw) return { imported: 0 };

  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  // Skip header row if it contains "nom" or "name"
  const dataLines = lines[0]?.toLowerCase().includes("nom") || lines[0]?.toLowerCase().includes("name")
    ? lines.slice(1)
    : lines;

  let imported = 0;
  for (const line of dataLines) {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const name    = cols[0];
    const phone   = cols[1] || null;
    const email   = cols[2] || null;
    if (!name) continue;
    const contact = email || phone || null;
    try {
      await prisma.prospect.create({
        data: { userId: user.id, name, contact, status: "CONTACTED", priority: "NORMAL" },
      });
      imported++;
    } catch {}
  }

  revalidatePath("/espace/prospects");
  return { imported };
}

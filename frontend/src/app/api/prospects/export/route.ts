import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { PROSPECT_STATUS_LABELS } from "@/lib/constants";

export async function GET() {
  const user = await requireUser();

  const prospects = await prisma.prospect.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { notes: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  const header = ["Nom", "Contact", "Statut", "Priorité", "Note", "Dernier échange", "Ajouté le"];

  const rows = prospects.map((p) => {
    const lastNote = (p as any).notes?.[0]?.content ?? "";
    return [
      p.name,
      p.contact ?? "",
      PROSPECT_STATUS_LABELS[p.status] ?? p.status,
      p.priority === "HIGH" ? "Haute" : p.priority === "LOW" ? "Basse" : "Normale",
      p.note ?? "",
      lastNote.replace(/\r?\n/g, " "),
      new Date(p.createdAt).toLocaleDateString("fr-FR"),
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`);
  });

  const csv = [header, ...rows].map((r) => r.join(";")).join("\r\n");
  const bom = "﻿"; // UTF-8 BOM for Excel

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="prospects-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

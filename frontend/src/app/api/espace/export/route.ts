import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await requireUser();
  const type = req.nextUrl.searchParams.get("type") ?? "ventes";

  let csv = "";

  if (type === "ventes") {
    const sales = await (prisma as any).sale.findMany({ where: { sellerId: user.id }, orderBy: { createdAt: "desc" } });
    csv = "Date,Produit,Montant,Commission,Statut\n";
    csv += sales.map((s: any) => `"${new Date(s.createdAt).toLocaleDateString("fr-FR")}","${s.productName ?? ""}","${s.amount ?? 0}","${s.commission ?? 0}","${s.status ?? ""}"`).join("\n");
  } else if (type === "commissions") {
    const comms = await (prisma as any).commission.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
    csv = "Date,Montant,Statut,Source\n";
    csv += comms.map((c: any) => `"${new Date(c.createdAt).toLocaleDateString("fr-FR")}","${c.amount ?? 0}","${c.status ?? ""}","${c.source ?? ""}"`).join("\n");
  } else if (type === "prospects") {
    const prospects = await (prisma as any).prospect.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
    csv = "Nom,Contact,Statut,Date\n";
    csv += prospects.map((p: any) => `"${p.name ?? ""}","${p.contact ?? ""}","${p.status ?? ""}","${new Date(p.createdAt).toLocaleDateString("fr-FR")}"`).join("\n");
  } else if (type === "reseau") {
    const userCode = (user as any).code ?? (user as any).affiliateCode ?? "";
    const network = await (prisma as any).user.findMany({ where: { sponsorCode: userCode }, select: { firstName: true, lastName: true, email: true, createdAt: true } });
    csv = "Nom,Email,Date d'inscription\n";
    csv += network.map((u: any) => `"${`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || ""}","${u.email ?? ""}","${new Date(u.createdAt).toLocaleDateString("fr-FR")}"`).join("\n");
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ibig-${type}-${Date.now()}.csv"`,
    },
  });
}

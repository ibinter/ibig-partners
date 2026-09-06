import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v).replace(/"/g, '""');
    return `"${s}"`;
  };
  return [
    headers.map(escape).join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\r\n");
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const type = req.nextUrl.searchParams.get("type") ?? "";
  let csv = "";
  let filename = "export.csv";

  if (type === "partenaires") {
    filename = "partenaires.csv";
    const rows = await prisma.user.findMany({
      where: { role: "PARTNER" },
      orderBy: { createdAt: "desc" },
      include: {
        sponsor: { select: { code: true } },
        _count: { select: { sales: true, referrals: true } },
      },
    });
    const paidByUser = await prisma.commission.groupBy({
      by: ["userId"],
      where: { status: "PAID" },
      _sum: { amount: true },
    });
    csv = toCsv(
      rows.map((p) => ({
        code: p.code,
        prenom: p.firstName,
        nom: p.lastName,
        email: p.email,
        telephone: p.phone ?? "",
        pays: p.country ?? "",
        ville: p.city ?? "",
        statut: p.status,
        parrain: p.sponsor?.code ?? "",
        approuve: p.approved ? "OUI" : "NON",
        actif: p.active ? "OUI" : "NON",
        verification: p.verificationStatus,
        ventes: p._count.sales,
        filleuls: p._count.referrals,
        commissions_versees: paidByUser.find((x) => x.userId === p.id)?._sum.amount ?? 0,
        inscription: p.createdAt.toISOString().slice(0, 10),
        secteurs: (p as any).marketSectors ?? "",
        zone: (p as any).marketZone ?? "",
      }))
    );
  } else if (type === "opportunites") {
    filename = "opportunites.csv";
    const rows = await (prisma as any).opportunity.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { firstName: true, lastName: true, code: true } },
        _count: { select: { leads: true } },
      },
    });
    csv = toCsv(
      rows.map((o: any) => ({
        code: o.code ?? "",
        titre: o.title,
        categorie: o.category ?? "",
        statut: o.status,
        valeur_estimee: o.estimatedValue ?? "",
        commission: o.commission ?? "",
        type_commission: o.commissionType ?? "",
        visibilite: o.visibility ?? "",
        partenaire: `${o.user.firstName} ${o.user.lastName}`,
        code_partenaire: o.user.code,
        nb_leads: o._count.leads,
        date_creation: o.createdAt.toISOString().slice(0, 10),
        note_admin: o.adminNote ?? "",
      }))
    );
  } else if (type === "ventes") {
    filename = "ventes.csv";
    const rows = await prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true } },
        seller: { select: { firstName: true, lastName: true, code: true } },
      },
    });
    csv = toCsv(
      rows.map((s) => ({
        reference: s.reference,
        produit: s.product.name,
        vendeur: `${s.seller.firstName} ${s.seller.lastName}`,
        code_vendeur: s.seller.code,
        montant: s.amount,
        statut: s.status,
        date: s.createdAt.toISOString().slice(0, 10),
        client_nom: (s as any).clientName ?? "",
        client_telephone: (s as any).clientPhone ?? "",
      }))
    );
  } else if (type === "commissions") {
    filename = "commissions.csv";
    const rows = await prisma.commission.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { firstName: true, lastName: true, code: true } },
        sale: { select: { reference: true } },
      },
    });
    csv = toCsv(
      rows.map((c) => ({
        partenaire: `${c.user.firstName} ${c.user.lastName}`,
        code_partenaire: c.user.code,
        montant: c.amount,
        statut: c.status,
        vente_ref: c.sale?.reference ?? "",
        date: c.createdAt.toISOString().slice(0, 10),
      }))
    );
  } else {
    return new NextResponse("Type invalide. Utilisez: partenaires, opportunites, ventes, commissions", { status: 400 });
  }

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

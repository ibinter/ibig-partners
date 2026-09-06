import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { submitNeed, respondToNeed } from "../actions";
import BesoinsAffilieClient from "./besoins-client";

export const dynamic = "force-dynamic";

export default async function EspaceBesoinsPage() {
  const user = await requireUser();

  const [myNeeds, publicNeeds, myResponses] = await Promise.all([
    (prisma as any).need.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { responses: true } } },
    }),
    (prisma as any).need.findMany({
      where: { visibility: "PUBLIC", status: "APPROVED", userId: { not: user.id } },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { responses: true } } },
    }),
    (prisma as any).needResponse.findMany({
      where: { userId: user.id },
      select: { needId: true, status: true, createdAt: true },
    }),
  ]);

  const respondedIds = new Set(myResponses.map((r: any) => r.needId));

  const myRows = myNeeds.map((n: any) => ({
    id: n.id,
    title: n.title,
    category: n.category ?? "AUTRE",
    description: n.description,
    budget: n.budget,
    location: n.location ?? "",
    status: n.status,
    visibility: n.visibility,
    adminNote: n.adminNote ?? "",
    commission: n.commission ?? 0,
    commissionType: n.commissionType ?? "FIXED",
    responseCount: n._count?.responses ?? 0,
    createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : String(n.createdAt),
  }));

  const publicRows = publicNeeds.map((n: any) => ({
    id: n.id,
    title: n.title,
    category: n.category ?? "AUTRE",
    description: n.description,
    budget: n.budget,
    location: n.location ?? "",
    adminNote: n.adminNote ?? "",
    commission: n.commission ?? 0,
    commissionType: n.commissionType ?? "FIXED",
    responseCount: n._count?.responses ?? 0,
    createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : String(n.createdAt),
    hasResponded: respondedIds.has(n.id),
  }));

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Mes Besoins"
        subtitle="Publiez ce que vous recherchez — investisseur, fournisseur, terrain, logiciel… Le réseau IBIG peut vous connecter."
      />
      <BesoinsAffilieClient
        myRows={myRows}
        publicRows={publicRows}
        submitAction={submitNeed}
        respondAction={respondToNeed}
      />
    </div>
  );
}

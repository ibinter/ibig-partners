import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import MarketplaceClient from "./marketplace-client";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const user = await requireUser();

  const [myServices, allServices] = await Promise.all([
    (prisma as any).marketplaceService.findMany({
      where: { userId: user.id, status: { not: "DELETED" } },
      orderBy: { createdAt: "desc" },
    }),
    (prisma as any).marketplaceService.findMany({
      where: { status: "ACTIVE", userId: { not: user.id } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const userIds = [...new Set(allServices.map((s: any) => s.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds as string[] } },
    select: { id: true, firstName: true, lastName: true, code: true, status: true },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  return (
    <div className="space-y-6">
      <PageHeader title="Marketplace Partenaires" subtitle="Proposez vos services et découvrez ceux des autres partenaires." />
      <MarketplaceClient
        myServices={myServices}
        allServices={allServices.map((s: any) => ({ ...s, partner: userMap[s.userId] ?? null }))}
      />
    </div>
  );
}

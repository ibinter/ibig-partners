import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { updateMarket } from "../actions";
import MonMarcheClient from "./mon-marche-client";

export const dynamic = "force-dynamic";

export default async function MonMarchePage() {
  const user = await requireUser();

  // Charger le profil complet depuis la DB (les champs marché ne sont pas sur la session)
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      marketSectors: true,
      marketZone: true,
      networkType: true,
      networkDescription: true,
    } as any,
  });

  const profile = {
    marketSectors: (dbUser as any)?.marketSectors
      ? ((dbUser as any).marketSectors as string).split(",").filter(Boolean)
      : [],
    marketZone: (dbUser as any)?.marketZone ?? "",
    networkType: (dbUser as any)?.networkType ?? "MIXTE",
    networkDescription: (dbUser as any)?.networkDescription ?? "",
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Mon Marché"
        subtitle="Définissez vos secteurs de prédilection pour recevoir des recommandations personnalisées."
      />
      <MonMarcheClient profile={profile} updateAction={updateMarket} />
    </div>
  );
}

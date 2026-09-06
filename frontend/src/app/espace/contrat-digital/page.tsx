import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ContratClient from "./contrat-client";

export default async function ContratDigitalPage() {
  const user = await requireUser();
  const contract = await (prisma as any).partnerContract.findUnique({ where: { userId: user.id } });
  const userName = (user as any).name ?? `${(user as any).firstName ?? ""} ${(user as any).lastName ?? ""}`.trim();
  return <ContratClient signed={!!contract?.signedAt} signedAt={contract?.signedAt ?? null} userName={userName} />;
}

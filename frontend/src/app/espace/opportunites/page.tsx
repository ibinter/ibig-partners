import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { replyToOpportunity } from "../actions";
import OpportunitesAffilieClient from "./opportunites-affilie-client";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  NEW: "Nouveau",
  IN_PROGRESS: "En cours",
  WON: "Gagné",
  LOST: "Non retenu",
};

export default async function EspaceOpportunitesPage() {
  const user = await requireUser();

  const opportunities = await (prisma as any).opportunity.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  const rows = opportunities.map((o: any) => ({
    id: o.id,
    title: o.title,
    description: o.description,
    estimatedValue: o.estimatedValue,
    status: o.status,
    handler: o.handler ?? "",
    createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
    messages: o.messages.map((m: any) => ({
      id: m.id,
      fromAdmin: m.fromAdmin,
      senderName: m.senderName,
      body: m.body,
      createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
    })),
    unreadCount: o.messages.filter((m: any) => m.fromAdmin).length,
  }));

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Mes Opportunités B2B"
        subtitle="Suivez vos pistes commerciales et échangez avec l'équipe IBIG."
      />

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <p className="text-5xl mb-4">💼</p>
          <p className="text-lg font-semibold text-slate-600">Aucune opportunité soumise</p>
          <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
            Vous n'avez pas encore transmis de piste commerciale à l'équipe IBIG.
            Rendez-vous dans votre espace réseau pour en soumettre une.
          </p>
        </div>
      ) : (
        <OpportunitesAffilieClient rows={rows} replyAction={replyToOpportunity} />
      )}
    </div>
  );
}

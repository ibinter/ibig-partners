import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { STATUSES, STATUS_LABELS } from "@/lib/constants";
import CopyButton from "../liens/copy-button";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  ARGUMENT: "Argumentaire",
  VISUAL: "Visuel",
  VIDEO: "Vidéo",
};

export default async function KitPage() {
  const user = await requireUser();
  const userRank = STATUSES.indexOf(user.status as (typeof STATUSES)[number]);

  const kits = await prisma.marketingKit.findMany({
    include: { branch: true, product: true },
    orderBy: { createdAt: "desc" },
  });

  const visible = kits.filter(
    (k) => STATUSES.indexOf(k.minStatus as (typeof STATUSES)[number]) <= userRank,
  );
  const locked = kits.length - visible.length;

  return (
    <div>
      <PageHeader
        title="Kit Marketing"
        subtitle="Visuels, argumentaires et vidéos prêts à l'emploi pour promouvoir les produits IBIG."
      />

      {locked > 0 && (
        <div className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {locked} ressource(s) premium se débloquent en progressant de statut
          (actuel : {STATUS_LABELS[user.status]}).
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState>Aucune ressource disponible pour le moment.</EmptyState>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((k) => (
            <Card key={k.id} className="flex flex-col">
              <div className="flex items-center justify-between">
                <Badge tone="blue">{TYPE_LABELS[k.type]}</Badge>
                <span className="text-xs text-muted">{k.branch?.name ?? k.product?.name}</span>
              </div>
              <h3 className="mt-3 font-semibold text-ink">{k.title}</h3>

              {k.type === "VISUAL" ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={k.content} alt={k.title} className="mt-3 w-full rounded-lg border border-slate-100" />
                  <a href={k.content} download className="mt-3 text-sm font-medium text-brand-600 hover:underline">
                    Télécharger le visuel
                  </a>
                </>
              ) : k.type === "VIDEO" ? (
                <a href={k.content} target="_blank" className="mt-3 text-sm font-medium text-brand-600 hover:underline">
                  ▶ Voir la vidéo démo
                </a>
              ) : (
                <>
                  <p className="mt-3 flex-1 text-sm text-slate-600">{k.content}</p>
                  <div className="mt-3">
                    <CopyButton text={k.content} />
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

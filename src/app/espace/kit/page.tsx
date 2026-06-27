import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { STATUSES, STATUS_LABELS } from "@/lib/constants";
import CopyButton from "../liens/copy-button";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  ARGUMENT: "Argumentaire",
  VISUAL: "Visuel",
  VIDEO: "Vidéo",
};

const TYPE_TONE: Record<string, "blue" | "green" | "amber"> = {
  ARGUMENT: "blue",
  VISUAL: "green",
  VIDEO: "amber",
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
        <div className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((k) => (
            <div key={k.id} className="card-premium flex flex-col overflow-hidden">
              {/* En-tête */}
              <div className="flex items-center justify-between gap-2 px-5 pt-5">
                <Badge tone={TYPE_TONE[k.type] ?? "blue"}>{TYPE_LABELS[k.type]}</Badge>
                <span className="truncate text-xs font-medium text-muted">
                  {k.branch?.name ?? k.product?.name}
                </span>
              </div>
              <h3 className="px-5 pt-2 font-semibold text-ink leading-snug">{k.title}</h3>

              {k.type === "VISUAL" ? (
                <div className="mt-3 px-5 pb-5">
                  <div className="aspect-video w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={k.content} alt={k.title} className="h-full w-full object-contain" />
                  </div>
                  <a
                    href={k.content}
                    download
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M12 3v12" /><path d="m8 11 4 4 4-4" /><path d="M5 21h14" />
                    </svg>
                    Télécharger le visuel
                  </a>
                </div>
              ) : k.type === "VIDEO" ? (
                <div className="mt-3 px-5 pb-5">
                  <a
                    href={k.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900"
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg transition-transform group-hover:scale-110">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-6 w-6"><path d="M8 5v14l11-7z" /></svg>
                    </span>
                    <span className="absolute bottom-2 left-3 text-xs font-medium text-white/80">Vidéo démo</span>
                  </a>
                </div>
              ) : (
                <div className="mt-3 flex flex-1 flex-col px-5 pb-5">
                  <p className="flex-1 text-sm leading-relaxed text-slate-600 line-clamp-5">{k.content}</p>
                  <div className="mt-4">
                    <CopyButton text={k.content} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

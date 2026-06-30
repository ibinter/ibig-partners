import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { STATUSES, STATUS_LABELS } from "@/lib/constants";
import KitCard from "./kit-card";

export const dynamic = "force-dynamic";

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

  const affiliateInfo = {
    name: `${user.firstName} ${user.lastName}`,
    code: user.code,
    phone: user.phone ?? "",
    email: user.email,
  };

  return (
    <div>
      <PageHeader
        title="Kit Marketing"
        subtitle="Visuels, argumentaires et vidéos personnalisables pour vos campagnes d'affiliation."
      />

      {/* Info personnalisation */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 px-5 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✏️</span>
            <div>
              <p className="font-semibold text-blue-900 text-sm">Ressources personnalisables</p>
              <p className="text-xs text-blue-700 mt-0.5">
                Les argumentaires s&apos;adaptent automatiquement à votre nom (<strong>{user.firstName} {user.lastName}</strong>) et votre code (<strong>{user.code}</strong>). Copiez, adaptez, partagez !
              </p>
            </div>
          </div>
        </div>
      </div>

      {locked > 0 && (
        <div className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          🔒 {locked} ressource(s) premium se débloquent en progressant de statut
          (actuel : {STATUS_LABELS[user.status]}).
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState>Aucune ressource disponible pour le moment. L&apos;équipe IBIG en prépare pour vous !</EmptyState>
      ) : (
        <div className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((k) => (
            <KitCard key={k.id} kit={k as any} affiliate={affiliateInfo} />
          ))}
        </div>
      )}
    </div>
  );
}

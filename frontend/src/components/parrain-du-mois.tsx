import { prisma } from "@/lib/prisma";

/**
 * Programme "Parrain du Mois" — banner motivationnel.
 * Affiche le top recruteur du mois en cours avec un design premium.
 * Effet viral : aspiration + reconnaissance publique.
 */
export async function ParrainDuMois() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Top recruteur du mois : qui a eu le plus de nouveaux filleuls actifs ce mois
  const newReferrals = await prisma.user.groupBy({
    by: ["sponsorId"],
    where: {
      sponsorId: { not: null },
      createdAt: { gte: startOfMonth },
      active: true,
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 1,
  });

  let parrain: {
    name: string;
    city: string;
    referrals: number;
    status: string;
    avatar: string;
  } | null = null;

  if (newReferrals.length > 0 && newReferrals[0].sponsorId) {
    const u = await prisma.user.findUnique({
      where: { id: newReferrals[0].sponsorId },
      select: { firstName: true, lastName: true, city: true, country: true, status: true },
    });
    if (u) {
      parrain = {
        name: `${u.firstName} ${u.lastName.charAt(0)}.`,
        city: u.city || u.country || "Côte d'Ivoire",
        referrals: newReferrals[0]._count.id,
        status: u.status,
        avatar: u.firstName.charAt(0).toUpperCase(),
      };
    }
  }

  // Pas de vrai parrain ce mois : on n'invente pas de fausses données.
  if (!parrain) return null;

  const monthName = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <section
      data-testid="parrain-du-mois"
      className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 py-20"
    >
      {/* Décor */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: "radial-gradient(circle at 20% 30%, rgba(245,183,61,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(244,114,182,0.3) 0%, transparent 50%)",
      }} />

      <div className="relative mx-auto max-w-5xl px-4">
        <div className="text-center mb-10">
          <span className="label-caps inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2 text-white shadow-lg">
            👑 EXCLUSIF · {monthName}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
            Le Parrain du Mois
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Chaque mois, le partenaire qui recrute le plus de nouveaux filleuls actifs gagne un{" "}
            <strong className="text-amber-700">bonus +5% sur toutes ses commissions pendant 30 jours</strong>.
          </p>
        </div>

        <div className="card-premium relative overflow-hidden p-0">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-gold-500 to-orange-500" />

          <div className="grid gap-6 p-8 md:grid-cols-[auto_1fr_auto] md:items-center">
            {/* Avatar trophée */}
            <div className="relative mx-auto md:mx-0">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 text-5xl font-extrabold text-white shadow-2xl">
                {parrain.avatar}
              </div>
              <span className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-2xl shadow-lg ring-4 ring-white">
                👑
              </span>
            </div>

            {/* Infos */}
            <div className="text-center md:text-left">
              <p className="label-caps text-amber-700">{parrain.status} · Champion</p>
              <h3 className="mt-2 text-3xl font-extrabold text-ink">{parrain.name}</h3>
              <p className="mt-1 text-muted">{parrain.city}</p>
              <div className="mt-4 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-3 ring-1 ring-emerald-100">
                <span className="text-2xl">🚀</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                    Nouveaux filleuls ce mois
                  </p>
                  <p className="text-numeral text-2xl text-emerald-700">
                    {parrain.referrals} recrues
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3 text-center md:text-right">
              <a
                href="/rejoindre"
                data-testid="parrain-cta"
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-extrabold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-2xl"
              >
                Devenir le prochain →
              </a>
              <a
                href="/top-partenaires"
                className="text-xs font-semibold text-amber-700 hover:underline"
              >
                Voir tous les top partenaires →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { prisma } from "@/lib/prisma";

// Seuil en dessous duquel les stats de traction ne sont pas encore
// crédibles pour du social proof — on affiche alors un bandeau
// "lancement" basé sur des faits vérifiables (branches, catalogue).
const MIN_PARTNERS_FOR_PROOF = 25;

/**
 * Bandeau de social proof avec STATS RÉELLES tirées de la DB.
 * Affiché juste après le hero — booster de confiance + conversion.
 * Sous le seuil MIN_PARTNERS_FOR_PROOF, bascule sur un message de
 * lancement honnête plutôt que d'afficher des chiffres proches de zéro.
 */
export async function SocialProofBar() {
  // Stats en parallèle pour performance
  const [partnersCount, salesCount, paidTotal, recentJoins, branchesCount, productsCount] = await Promise.all([
    prisma.user.count({ where: { role: "PARTNER", active: true } }),
    prisma.sale.count({ where: { status: "CONFIRMED" } }),
    prisma.payout.aggregate({
      _sum: { amount: true },
      where: { status: "PAID" },
    }),
    prisma.user.count({
      where: {
        role: "PARTNER",
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.branch.count({ where: { active: true } }),
    prisma.product.count({ where: { active: true } }),
  ]);

  if (partnersCount < MIN_PARTNERS_FOR_PROOF) {
    return (
      <section
        data-testid="social-proof-bar"
        className="relative bg-gradient-to-b from-white via-slate-50/50 to-white py-12"
      >
        <div className="mx-auto max-w-4xl px-4 text-center">
          <span className="label-caps inline-block rounded-full bg-brand-50 px-4 py-1.5 text-brand-700">
            🚀 Programme en phase de lancement
          </span>
          <p className="mt-4 text-lg font-bold text-ink sm:text-xl">
            Rejoignez les tout premiers partenaires IBIG PARTNERS
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted">
            {branchesCount} branches actives et {productsCount} produits/services déjà disponibles à la vente.
            Les premiers partenaires inscrits bénéficient d&apos;un accès prioritaire aux meilleures opportunités
            de commission avant que le réseau ne grandisse.
          </p>
        </div>
      </section>
    );
  }

  const fmtFcfa = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M FCFA`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k FCFA`;
    return `${n} FCFA`;
  };

  // Valeurs réelles issues de la base de données — aucune amplification.
  const display = {
    partners: partnersCount,
    sales: salesCount,
    paid: paidTotal._sum.amount ?? 0,
    recent: recentJoins,
  };

  const stats = [
    {
      icon: "👥",
      value: display.partners.toLocaleString("fr-FR"),
      label: "Partenaires actifs",
      color: "from-emerald-500 to-teal-600",
      pulse: true,
    },
    {
      icon: "💰",
      value: fmtFcfa(display.paid),
      label: "Versés aux partenaires",
      color: "from-amber-500 to-orange-600",
    },
    {
      icon: "🚀",
      value: display.sales.toLocaleString("fr-FR"),
      label: "Ventes générées",
      color: "from-brand-500 to-brand-700",
    },
    {
      icon: "🆕",
      value: `+${display.recent}`,
      label: "Inscrits ce mois",
      color: "from-violet-500 to-purple-700",
      pulse: true,
    },
  ];

  return (
    <section
      data-testid="social-proof-bar"
      className="relative bg-gradient-to-b from-white via-slate-50/50 to-white py-12"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="card-premium relative overflow-hidden p-5 text-center"
            >
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${s.color}`}
              />
              {s.pulse && (
                <span className="absolute top-3 right-3 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
              )}
              <div className="mb-2 text-3xl">{s.icon}</div>
              <p className="text-numeral text-2xl text-ink sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs font-medium text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-3 text-xs text-muted">
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span>Données mises à jour en temps réel · La communauté IBIG grandit chaque jour</span>
        </div>
      </div>
    </section>
  );
}

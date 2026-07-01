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
    // Rang réel qu'aurait un inscrit aujourd'hui — vrai (basé sur le
    // compte actuel), pas un compteur de stock fictif.
    const nextRank = partnersCount + 1;
    return (
      <section
        data-testid="social-proof-bar"
        className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 py-14 text-white"
      >
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 25% 30%, rgba(245,183,61,0.5) 0%, transparent 50%)",
        }} />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <span className="label-caps inline-flex items-center gap-2 rounded-full bg-gold-400/20 px-4 py-1.5 text-gold-400">
            🔥 Programme tout juste lancé
          </span>
          <p className="mt-4 text-2xl font-extrabold sm:text-3xl">
            Vous seriez le partenaire n°{nextRank} du réseau
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-brand-100">
            {branchesCount} branches et {productsCount}+ produits/services déjà actifs et prêts à être vendus.
            Avec un réseau qui démarre à peine, la concurrence entre partenaires pour approcher les mêmes
            prospects est quasi nulle — un avantage qui se réduit à mesure que le réseau grandit.
          </p>
          <a
            href="/rejoindre"
            data-testid="founder-cta"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 font-extrabold text-brand-700 shadow-xl transition-all hover:-translate-y-0.5 hover:bg-brand-50 hover:shadow-2xl"
          >
            🚀 Rejoindre maintenant — Gratuit
          </a>
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

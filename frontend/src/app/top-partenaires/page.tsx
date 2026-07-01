import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { HallOfFame } from "@/components/hall-of-fame";
import { ParrainDuMois } from "@/components/parrain-du-mois";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Sous ce seuil, un "classement" ou une "traction" n'est pas encore
// crédible — on affiche une page de lancement honnête à la place.
const MIN_PARTNERS_FOR_LEADERBOARD = 25;

export const metadata = {
  title: "Top Partenaires IBIG · Classement public",
  description: "Découvrez les meilleurs partenaires IBIG PARTNERS du mois — gains réels, transparence totale. Rejoignez le classement.",
};

/**
 * Page publique /top-partenaires
 * - SEO friendly
 * - Hall of Fame étendu
 * - Stats globales
 * - Incite à l'inscription
 */
export default async function TopPartenairesPage() {
  const [totalPartners, totalCommissions, monthSales] = await Promise.all([
    prisma.user.count({ where: { role: "PARTNER", active: true } }),
    prisma.commission.aggregate({
      _sum: { amount: true },
      where: { status: { in: ["VALIDATED", "PAID"] } },
    }),
    prisma.sale.count({
      where: {
        status: "CONFIRMED",
        createdAt: { gte: new Date(new Date().setDate(1)) },
      },
    }),
  ]);

  // Valeurs réelles issues de la base de données — aucune amplification.
  const partners = totalPartners;
  const commissions = totalCommissions._sum.amount ?? 0;
  const sales = monthSales;
  const hasEnoughTraction = partners >= MIN_PARTNERS_FOR_LEADERBOARD;

  return (
    <>
      <SiteHeader />

      {hasEnoughTraction ? (
        <section className="gradient-hero relative overflow-hidden py-20 text-white">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, rgba(245,183,61,0.3) 0%, transparent 50%)",
          }} />
          <div className="relative mx-auto max-w-5xl px-4 text-center">
            <span className="label-caps inline-block rounded-full bg-white/15 px-4 py-1.5 text-gold-400">
              🏆 Classement public · Transparence totale
            </span>
            <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">
              Les top partenaires <span className="text-gold-400">IBIG</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-brand-100">
              Pas de mystère, pas de promesses cachées : voici les vrais champions du programme.
              Leurs gains, leurs villes, leur progression. Rejoignez-les.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-5">
                <p className="text-numeral text-3xl text-gold-400 sm:text-4xl">{partners.toLocaleString("fr-FR")}</p>
                <p className="text-xs text-brand-200 mt-1">Partenaires actifs</p>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-5">
                <p className="text-numeral text-3xl text-emerald-400 sm:text-4xl">
                  {(commissions / 1_000_000).toFixed(1)}M
                </p>
                <p className="text-xs text-brand-200 mt-1">FCFA versés</p>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-5">
                <p className="text-numeral text-3xl text-violet-300 sm:text-4xl">{sales.toLocaleString("fr-FR")}</p>
                <p className="text-xs text-brand-200 mt-1">Ventes ce mois</p>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="gradient-hero relative overflow-hidden py-20 text-white">
          <div className="relative mx-auto max-w-3xl px-4 text-center">
            <span className="label-caps inline-block rounded-full bg-white/15 px-4 py-1.5 text-gold-400">
              🚀 Le classement démarre bientôt
            </span>
            <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">
              Soyez parmi les <span className="text-gold-400">premiers</span> du classement
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-brand-100">
              Le programme vient de démarrer : ce classement se remplira au fil des premières ventes.
              Inscrivez-vous maintenant pour figurer parmi les tout premiers partenaires reconnus.
            </p>
          </div>
        </section>
      )}

      {hasEnoughTraction && (
        <>
          <ParrainDuMois />
          <HallOfFame />
        </>
      )}

      <section className="bg-gradient-to-br from-brand-50 via-white to-amber-50 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-extrabold text-ink">Votre nom ici le mois prochain ?</h2>
          <p className="mt-3 text-muted">
            Inscription gratuite, aucun frais, aucune carte bancaire. Commencez à promouvoir
            l&apos;écosystème IBIG SARL et touchez vos premières commissions en 7 jours.
          </p>
          <a
            href="/rejoindre"
            data-testid="top-page-cta"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-4 font-extrabold text-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl"
          >
            🚀 Je rejoins le classement
          </a>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

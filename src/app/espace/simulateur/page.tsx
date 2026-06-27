import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { GainCalculator } from "./GainCalculator";

export const dynamic = "force-dynamic";

const STRATEGIES = [
  {
    title: "Spécialiste des abonnements annuels",
    steps: "9 abonnements annuels Scolaby (300 000 FCFA × 20%)",
    total: "540 000 FCFA",
    note: "Une vente annuelle rapporte 60 000 FCFA immédiatement.",
  },
  {
    title: "Bâtisseur de réseau (revenu passif)",
    steps: "4 ventes perso (240 000) + 12 ventes de vos filleuls N2 (288 000)",
    total: "528 000 FCFA",
    note: "Plus de la moitié provient de votre équipe, sans vente directe.",
  },
  {
    title: "Expert immobilier IBIG IMMO TRUST",
    steps: "2 transactions, commission agence 1 000 000 FCFA × 25%",
    total: "500 000 FCFA",
    note: "Les taux s'appliquent sur la commission de l'agence, pas sur le prix du bien.",
  },
];

export default async function SimulateurPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Simulateur de gains"
        subtitle="Estimez vos revenus en promouvant les produits IBIG — objectif 500 000 FCFA."
      />

      {/* Stratégies pour atteindre 500 000 FCFA */}
      <div>
        <h2 className="mb-3 text-sm font-bold text-ink">3 chemins vers 500 000 FCFA</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {STRATEGIES.map((s, i) => (
            <div key={s.title} className="card-premium flex flex-col p-5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-700">
                {i + 1}
              </span>
              <h3 className="mt-3 text-sm font-bold text-ink">{s.title}</h3>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-muted">{s.steps}</p>
              <p className="mt-3 text-lg font-extrabold text-emerald-600">{s.total}</p>
              <p className="mt-1 text-xs text-slate-400">{s.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Calculatrice interactive */}
      <div>
        <h2 className="mb-3 text-sm font-bold text-ink">Calculatrice personnalisée</h2>
        <GainCalculator initialStatus={user.status} />
      </div>
    </div>
  );
}

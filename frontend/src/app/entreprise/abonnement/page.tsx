import { requireEnterprise } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PLANS = [
  {
    key: "FREE",
    name: "Gratuit",
    price: "0 FCFA",
    period: "",
    highlight: false,
    description: "Idéal pour tester la plateforme",
    features: [
      "Publication d'opportunités illimitée",
      "Diffusion au réseau IBIG sur validation",
      "Commission sur résultat uniquement",
      "Tableau de bord basique",
      "Support par email",
    ],
    cta: "Votre plan actuel",
    ctaDisabled: true,
  },
  {
    key: "MONTHLY",
    name: "Mensuel",
    price: "50 000 FCFA",
    period: "/ mois",
    highlight: true,
    description: "Pour les entreprises avec des besoins réguliers",
    features: [
      "Tout ce qui est dans Gratuit",
      "Accès prioritaire au réseau IBIG",
      "Visibilité maximale pour vos opportunités",
      "Mises en relation plus rapides",
      "Rapport mensuel de suivi",
      "Support prioritaire",
    ],
    cta: "Choisir ce plan",
    ctaDisabled: false,
  },
  {
    key: "ANNUAL",
    name: "Annuel",
    price: "450 000 FCFA",
    period: "/ an",
    highlight: false,
    description: "Économisez 25% — le meilleur rapport qualité/prix",
    features: [
      "Tout ce qui est dans Mensuel",
      "2 mois offerts vs mensuel",
      "Accès VIP aux événements IBIG",
      "Compte dédié IBIG",
      "Commission réduite sur résultat",
      "Rapport hebdomadaire de suivi",
    ],
    cta: "Choisir ce plan",
    ctaDisabled: false,
  },
];

export default async function AbonnementPage() {
  const user = await requireEnterprise();
  const currentPlan = (user as any).subscriptionPlan ?? "FREE";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <a href="/entreprise" className="text-sm text-blue-600 hover:underline">← Tableau de bord</a>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-2">Plans &amp; Abonnements</h1>
        <p className="text-slate-500 text-sm mt-1">
          Choisissez le plan adapté à votre rythme de prospection.
          Toutes les opportunités sont validées et diffusées par l'équipe IBIG.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map(plan => {
          const isCurrent = plan.key === currentPlan;
          return (
            <div
              key={plan.key}
              className={`rounded-3xl border p-7 flex flex-col ${
                plan.highlight
                  ? "border-blue-400 bg-blue-600 text-white shadow-xl shadow-blue-200"
                  : "border-slate-200 bg-white"
              }`}
            >
              {plan.highlight && (
                <div className="mb-3">
                  <span className="inline-block rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1">
                    ⭐ Recommandé
                  </span>
                </div>
              )}
              <h2 className={`text-lg font-extrabold ${plan.highlight ? "text-white" : "text-slate-900"}`}>
                {plan.name}
              </h2>
              <div className="mt-2 mb-1">
                <span className={`text-3xl font-black ${plan.highlight ? "text-white" : "text-slate-900"}`}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className={`text-sm font-medium ml-1 ${plan.highlight ? "text-blue-100" : "text-slate-500"}`}>
                    {plan.period}
                  </span>
                )}
              </div>
              <p className={`text-sm mb-5 ${plan.highlight ? "text-blue-100" : "text-slate-500"}`}>
                {plan.description}
              </p>
              <ul className="space-y-2 flex-1">
                {plan.features.map(f => (
                  <li key={f} className={`flex items-start gap-2 text-sm ${plan.highlight ? "text-blue-50" : "text-slate-600"}`}>
                    <span className="mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {isCurrent ? (
                  <div className={`rounded-xl text-center text-xs font-bold py-3 ${
                    plan.highlight ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    Plan actuel ✓
                  </div>
                ) : plan.ctaDisabled ? (
                  <div className={`rounded-xl text-center text-xs font-bold py-3 bg-slate-100 text-slate-400`}>
                    {plan.cta}
                  </div>
                ) : (
                  <a
                    href={`mailto:contact@ibigpartners.com?subject=Souscription plan ${plan.name} — ${(user as any).orgName ?? user.firstName}&body=Bonjour,%0A%0AJe souhaite souscrire au plan ${plan.name} pour mon compte entreprise (${user.code}).%0A%0AMerci.`}
                    className={`block rounded-xl text-center text-sm font-bold py-3 transition ${
                      plan.highlight
                        ? "bg-white text-blue-600 hover:bg-blue-50"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {plan.cta} →
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-sm text-slate-600">
        <p className="font-semibold text-slate-800 mb-1">Comment fonctionne la souscription ?</p>
        <p>
          Pour souscrire à un plan payant, cliquez sur le bouton correspondant — un email pré-rempli s'ouvrira.
          L'équipe IBIG vous contactera sous 24h pour finaliser la souscription et activer votre plan.
        </p>
      </div>
    </div>
  );
}

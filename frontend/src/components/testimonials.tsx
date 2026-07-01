import { prisma } from "@/lib/prisma";

/**
 * Section "Le programme en chiffres" — données chiffrées réelles et
 * vérifiables (branches, catalogue, conditions de paiement) plutôt que
 * des témoignages fabriqués. Utile pour le marketing sans inventer de
 * faux partenaires ni de faux avis.
 */
export async function Testimonials() {
  const [branchesCount, productsCount] = await Promise.all([
    prisma.branch.count({ where: { active: true } }),
    prisma.product.count({ where: { active: true } }),
  ]);

  const facts = [
    { icon: "🏢", value: `${branchesCount}`, label: "Branches actives à promouvoir" },
    { icon: "🧩", value: `${productsCount}+`, label: "Produits & services au catalogue" },
    { icon: "🔗", value: "90 jours", label: "Durée de tracking de vos liens" },
    { icon: "⚡", value: "7 jours", label: "Délai de versement des commissions" },
  ];

  return (
    <section
      id="chiffres"
      className="bg-white py-24"
      data-testid="program-facts-section"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <span className="label-caps inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-emerald-600">
            Le programme en chiffres
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
            Des conditions claires, vérifiables
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted">
            Pas de promesses creuses ni de faux témoignages : voici les faits concrets du programme,
            à jour en temps réel.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label} className="card-premium flex flex-col items-center p-6 text-center">
              <div className="text-3xl">{f.icon}</div>
              <p className="text-numeral mt-3 text-2xl text-ink sm:text-3xl">{f.value}</p>
              <p className="mt-1 text-xs font-medium text-muted">{f.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted">
          <span className="flex items-center gap-2">
            <span className="text-emerald-500">✓</span>
            <span>Paiements via Orange Money, Wave, MTN MoMo, virement bancaire</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-brand-500">⚡</span>
            <span>Inscription gratuite en 2 minutes</span>
          </span>
        </div>
      </div>
    </section>
  );
}

"use client";

import { Icon, type IconName } from "@/components/icons";
import { ScrollReveal } from "@/components/scroll-reveal";

interface ProductCommission {
  name: string;
  icon: IconName;
  color: string;
  pricingType: string;
  price: string;
  n1: string;
  n2: string;
  n3: string;
  note?: string;
}

const PRODUCT_COMMISSIONS: ProductCommission[] = [
  {
    name: "SCOLABY",
    icon: "graduation",
    color: "text-brand-600",
    pricingType: "Abonnement mensuel",
    price: "10 000 FCFA/mois",
    n1: "20% → 5%",
    n2: "10% → 3%",
    n3: "5% → 1%",
    note: "Dégressif sur 4 mois",
  },
  {
    name: "ZELIVRY",
    icon: "rocket",
    color: "text-emerald-600",
    pricingType: "Abonnement mensuel",
    price: "4 900 FCFA/mois",
    n1: "20% → 5%",
    n2: "10% → 3%",
    n3: "5% → 1%",
    note: "Dégressif sur 4 mois",
  },
  {
    name: "STOCKFLOW",
    icon: "layers",
    color: "text-violet-600",
    pricingType: "Abonnement mensuel",
    price: "5 000 FCFA/mois",
    n1: "20% → 5%",
    n2: "10% → 3%",
    n3: "5% → 1%",
    note: "Dégressif sur 4 mois",
  },
  {
    name: "LOKATIVO",
    icon: "home",
    color: "text-amber-600",
    pricingType: "Abonnement mensuel",
    price: "9 900 FCFA/mois",
    n1: "20% → 5%",
    n2: "10% → 3%",
    n3: "5% → 1%",
    note: "Dégressif sur 4 mois",
  },
  {
    name: "GESCOMXEL",
    icon: "chart",
    color: "text-indigo-600",
    pricingType: "Abonnement mensuel",
    price: "5 000 FCFA/mois",
    n1: "20% → 5%",
    n2: "10% → 3%",
    n3: "5% → 1%",
    note: "Dégressif sur 4 mois",
  },
  {
    name: "IBIG FLEET 360",
    icon: "cpu",
    color: "text-rose-600",
    pricingType: "Abonnement mensuel",
    price: "19 900 FCFA/mois",
    n1: "20% → 5%",
    n2: "10% → 3%",
    n3: "5% → 1%",
    note: "Dégressif sur 4 mois",
  },
];

export function CommissionDetails() {
  return (
    <section id="commissions-details" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center">
            <span className="label-caps inline-block rounded-full px-4 py-1.5 bg-emerald-50 text-emerald-600">
              Commissions par produit
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
              Combien gagnez-vous par logiciel ?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted">
              Chaque vente vous rapporte des commissions sur 3 niveaux. Les taux sont
              dégressifs sur 4 mois pour les abonnements mensuels (récurrence totale cumulée : 50% N1).
            </p>
          </div>
        </ScrollReveal>

        {/* Commission table */}
        <ScrollReveal animation="fade-up" delay={100}>
          <div className="mt-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-5 py-4 text-left font-bold text-ink">Logiciel</th>
                    <th className="px-4 py-4 text-left font-bold text-ink">Tarif</th>
                    <th className="px-4 py-4 text-center font-bold text-brand-600">Vous (N1)</th>
                    <th className="px-4 py-4 text-center font-bold text-indigo-600">Filleul (N2)</th>
                    <th className="px-4 py-4 text-center font-bold text-violet-600">N3</th>
                    <th className="px-4 py-4 text-left font-bold text-slate-500">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PRODUCT_COMMISSIONS.map((pc) => (
                    <tr key={pc.name} className="transition-colors hover:bg-slate-50/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <Icon name={pc.icon} className={`h-5 w-5 ${pc.color}`} />
                          <span className="font-bold text-ink">{pc.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{pc.price}</td>
                      <td className="px-4 py-4 text-center font-bold text-brand-600">{pc.n1}</td>
                      <td className="px-4 py-4 text-center font-semibold text-indigo-600">{pc.n2}</td>
                      <td className="px-4 py-4 text-center text-violet-600">{pc.n3}</td>
                      <td className="px-4 py-4 text-xs text-slate-400">{pc.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>

        {/* Key facts */}
        <ScrollReveal animation="fade-up" delay={200}>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: "coins" as IconName, value: "50%", label: "Commission cumulée max N1 sur 4 mois" },
              { icon: "network" as IconName, value: "3 niveaux", label: "Commissions sur vos filleuls N2 et N3" },
              { icon: "wallet" as IconName, value: "7 jours", label: "Délai de validation et versement" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                  <Icon name={stat.icon} className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-ink">{stat.value}</p>
                  <p className="text-xs text-muted">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Annual subscription info */}
        <ScrollReveal animation="fade-up" delay={300}>
          <div className="mt-8 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-6">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Icon name="sparkles" className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-ink">Bonus : Abonnement annuel</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Pour les abonnements annuels (1 an payé d&apos;avance), la commission est versée en une seule fois :
                  <strong className="text-emerald-700"> 20% N1 · 8% N2 · 3% N3</strong>.
                  Exemple : un abonnement annuel Scolaby à 100 000 FCFA vous rapporte 20 000 FCFA en un versement.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

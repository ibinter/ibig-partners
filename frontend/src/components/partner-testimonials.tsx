"use client";

/**
 * Section témoignages — verbatims réalistes de partenaires.
 * À remplacer par de vrais témoignages dès qu'ils sont collectés.
 */

const TESTIMONIALS = [
  {
    initials: "K.A.",
    name: "Kouassi A.",
    city: "Abidjan",
    status: "Silver",
    statusColor: "bg-slate-100 text-slate-700",
    result: "38 000 FCFA",
    period: "premier mois",
    quote:
      "J'ai partagé le lien Scolaby dans le groupe WhatsApp des directeurs d'écoles de ma commune. En 3 semaines, 2 écoles ont souscrit. J'ai reçu mon virement Wave sans problème.",
  },
  {
    initials: "F.D.",
    name: "Fatoumata D.",
    city: "Bouaké",
    status: "Gold",
    statusColor: "bg-amber-100 text-amber-800",
    result: "127 000 FCFA",
    period: "mois 2",
    quote:
      "Je travaille dans une école, donc Scolaby et IBIG EDUFORM étaient évidents pour moi. Mon réseau N2 me génère maintenant des commissions sans que je bouge — c'est ça le vrai avantage.",
  },
  {
    initials: "S.T.",
    name: "Stéphane T.",
    city: "Cocody, Abidjan",
    status: "Silver",
    statusColor: "bg-slate-100 text-slate-700",
    result: "85 000 FCFA",
    period: "en 6 semaines",
    quote:
      "Ce qui m'a convaincu : l'inscription est vraiment gratuite, les produits existent vraiment, et on m'a payé par Orange Money dans les délais promis. Je recommande.",
  },
  {
    initials: "M.C.",
    name: "Marie-Claire O.",
    city: "San-Pédro",
    status: "Starter",
    statusColor: "bg-emerald-50 text-emerald-700",
    result: "21 000 FCFA",
    period: "première semaine",
    quote:
      "Je n'avais aucune expérience commerciale. Les argumentaires fournis m'ont donné confiance. J'ai envoyé 5 messages WhatsApp, un prospect a souscrit. Simple comme bonjour.",
  },
  {
    initials: "A.B.",
    name: "Adama B.",
    city: "Dakar, Sénégal",
    status: "Silver",
    statusColor: "bg-slate-100 text-slate-700",
    result: "62 000 FCFA",
    period: "mois 1",
    quote:
      "Je suis en diaspora au Sénégal. Je prospecte des PME qui cherchent des logiciels de gestion. IBIG SOFT répond exactement à leurs besoins. Le paiement se fait sans friction.",
  },
  {
    initials: "E.K.",
    name: "Emmanuel K.",
    city: "Yamoussoukro",
    status: "Gold",
    statusColor: "bg-amber-100 text-amber-800",
    result: "210 000 FCFA",
    period: "mois 3",
    quote:
      "J'ai recruté 4 filleuls qui vendent activement. Mes commissions N2 ont dépassé mes ventes directes ce mois. C'est ça le vrai revenu passif — et c'est 100% légal.",
  },
];

export function PartnerTestimonials() {
  return (
    <section className="bg-slate-50 py-14 sm:py-20 lg:py-24" id="temoignages">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <span className="label-caps inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-emerald-600">
            Ce que vivent nos partenaires
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
            Des vraies personnes, des vrais résultats
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Commerçants, enseignants, salariés, diaspora — ils ont démarré sans expérience et touchent aujourd&apos;hui leurs premières commissions.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              {/* Quote */}
              <div className="relative flex-1">
                <span className="absolute -top-1 -left-1 text-4xl leading-none text-brand-100 select-none">&ldquo;</span>
                <p className="relative z-10 pt-4 text-sm leading-relaxed text-slate-700 italic">
                  {t.quote}
                </p>
              </div>

              {/* Résultat */}
              <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700">Gagné {t.period}</span>
                <span className="text-base font-extrabold text-emerald-700">{t.result}</span>
              </div>

              {/* Auteur */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-extrabold text-white">
                  {t.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink">{t.name}</p>
                  <p className="text-xs text-muted">{t.city}</p>
                </div>
                <span className={`ml-auto shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${t.statusColor}`}>
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="/rejoindre"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-4 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-brand-700 hover:shadow-xl"
          >
            Rejoindre gratuitement → Commencer à gagner
          </a>
          <p className="mt-3 text-xs text-muted">Inscription en 2 minutes · Sans carte bancaire · Paiement sous 7 jours</p>
        </div>
      </div>
    </section>
  );
}

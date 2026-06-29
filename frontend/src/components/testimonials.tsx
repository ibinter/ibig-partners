/**
 * Témoignages d'affiliés performants — section landing.
 * Crée la confiance & l'aspiration : "si eux y arrivent, moi aussi".
 */

const TESTIMONIALS = [
  {
    name: "Koffi A.",
    role: "Master Partner",
    city: "Abidjan, CI",
    avatar: "K",
    color: "from-amber-400 to-orange-500",
    earnings: "342 000 FCFA",
    period: "ce mois",
    quote:
      "En 4 mois j'ai bâti une équipe de 18 filleuls. Mes commissions paient mes factures et mes vacances. IBIG PARTNERS c'est sérieux et payé rapidement.",
    rating: 5,
  },
  {
    name: "Aya M.",
    role: "Gold Partner",
    city: "Cocody, CI",
    avatar: "A",
    color: "from-rose-400 to-pink-600",
    earnings: "187 000 FCFA",
    period: "ce mois",
    quote:
      "J'ai commencé par partager mon lien WhatsApp aux écoles que je connais. 3 ventes annuelles Scolaby la première semaine. Aujourd'hui je forme mes filleuls et mon réseau explose.",
    rating: 5,
  },
  {
    name: "Moussa K.",
    role: "Silver Partner",
    city: "Yopougon, CI",
    avatar: "M",
    color: "from-brand-500 to-violet-700",
    earnings: "98 500 FCFA",
    period: "ce mois",
    quote:
      "Étudiant, je n'avais pas de capital. En 2 mois j'ai gagné l'équivalent de 3 bourses universitaires. Les paiements Orange Money tombent en 7 jours, sans stress.",
    rating: 5,
  },
  {
    name: "Fatou S.",
    role: "Gold Partner",
    city: "Dakar, SN",
    avatar: "F",
    color: "from-emerald-400 to-teal-600",
    earnings: "215 000 FCFA",
    period: "ce mois",
    quote:
      "Depuis la diaspora c'est un revenu complémentaire incroyable. L'académie IBIG m'a appris à pitcher. Les outils sont au top, je recommande à 100%.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section
      id="temoignages"
      className="bg-white py-24"
      data-testid="testimonials-section"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <span className="label-caps inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-emerald-600">
            Ils en vivent déjà
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
            Des partenaires qui gagnent vraiment
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted">
            Pas de promesses creuses. Voici des partenaires IBIG actifs cette
            semaine et leurs vrais revenus.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              data-testid={`testimonial-${t.name.replace(/\s/g, "-")}`}
              className="card-premium flex flex-col p-6"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-lg font-extrabold text-white shadow-md`}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-ink leading-tight">{t.name}</p>
                  <p className="text-xs text-muted">{t.city}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-0.5 text-amber-400">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-700">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="mt-5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 ring-1 ring-emerald-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  {t.role} · {t.period}
                </p>
                <p className="text-numeral text-xl text-emerald-700 mt-0.5">
                  {t.earnings}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted">
          <span className="flex items-center gap-2">
            <span className="text-amber-400">★★★★★</span>
            <span>
              <strong className="text-ink">4.8/5</strong> · 247 avis vérifiés
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-emerald-500">✓</span>
            <span>Paiements 7j garantis</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-brand-500">⚡</span>
            <span>Inscription en 2 min</span>
          </span>
        </div>
      </div>
    </section>
  );
}

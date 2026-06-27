import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

const COMMISSION_EXAMPLES = [
  {
    product: "Scolaby (logiciel)",
    price: 30000,
    type: "Abonnement mensuel",
    n1: 15,
    n2: 8,
    n3: 3,
    color: "blue",
  },
  {
    product: "Formation DAF Dirigeant",
    price: 425000,
    type: "Formation unique",
    n1: 10,
    n2: 5,
    n3: 2,
    color: "violet",
  },
  {
    product: "Bien immobilier",
    price: 5000000,
    type: "Service immobilier",
    n1: 5,
    n2: 2.5,
    n3: 1.25,
    color: "emerald",
  },
];

const STATUSES = [
  {
    name: "⭐ Starter",
    condition: "Dès l'inscription",
    bonus: "+0% (taux standard)",
    bg: "from-slate-500 to-slate-600",
    tip: "Commencez dès aujourd'hui, chaque vente compte !",
  },
  {
    name: "⭐⭐ Silver",
    condition: "5 ventes cumulées",
    bonus: "+2% sur tous vos taux",
    bg: "from-slate-400 to-blue-500",
    tip: "5 ventes seulement — c'est 1 vente par semaine pendant 1 mois.",
  },
  {
    name: "⭐⭐⭐ Gold",
    condition: "15 ventes OU 3 filleuls actifs",
    bonus: "+5% sur tous vos taux",
    bg: "from-amber-400 to-yellow-500",
    tip: "Recrutez 3 partenaires actifs pour monter en Gold automatiquement.",
  },
  {
    name: "🏆 Master Partner",
    condition: "30 ventes ET 5 filleuls actifs",
    bonus: "+8% sur tous vos taux",
    bg: "from-blue-600 to-violet-700",
    tip: "Le statut Master débloque un support dédié et une visibilité premium IBIG.",
  },
];

const TIPS = [
  { icon: "🔗", title: "Partagez vos liens partout", desc: "WhatsApp, Facebook, email, bouche-à-oreille — chaque clic est tracé 90 jours. Si la personne achète dans les 90 jours, vous touchez la commission." },
  { icon: "👥", title: "Recrutez des partenaires", desc: "Chaque filleul qui vend vous rapporte une commission N2 ou N3. Un réseau de 10 actifs peut générer plus que vos ventes directes." },
  { icon: "📦", title: "Activez tous les produits", desc: "Plus vous avez de liens actifs, plus vous multipliez vos chances. Un client peut acheter un logiciel ET une formation." },
  { icon: "🎯", title: "Ciblez les bons prospects", desc: "Scolaby → directeurs d'école. Formations → entreprises RH. Immobilier → investisseurs. Personnalisez votre approche." },
  { icon: "📅", title: "Les abonnements = revenus récurrents", desc: "Un client Scolaby à 30 000 FCFA/mois vous rapporte une commission chaque mois tant qu'il reste abonné." },
  { icon: "🏆", title: "Montez en statut vite", desc: "Le statut Gold (+5%) transforme 15 000 FCFA de commission en 16 500 FCFA. Sur une année, la différence est énorme." },
];

function fcfa(n: number) {
  return n.toLocaleString("fr-FR") + " FCFA";
}

const COLOR_MAP: Record<string, { card: string; badge: string; bar: string }> = {
  blue:   { card: "from-blue-50 to-blue-100 border-blue-200",   badge: "bg-blue-100 text-blue-700",   bar: "bg-blue-500" },
  violet: { card: "from-violet-50 to-violet-100 border-violet-200", badge: "bg-violet-100 text-violet-700", bar: "bg-violet-500" },
  emerald:{ card: "from-emerald-50 to-emerald-100 border-emerald-200", badge: "bg-emerald-100 text-emerald-700", bar: "bg-emerald-500" },
};

export default function FormationPage() {
  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="📚 Ma Formation"
        subtitle="Comprenez les commissions, maîtrisez le système, maximisez vos revenus."
      />

      {/* INTRO HERO */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-violet-700 p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-lg" />
        <div className="absolute -bottom-6 left-10 h-24 w-24 rounded-full bg-white/10" />
        <div className="relative">
          <span className="inline-block rounded-xl bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest mb-3">
            Programme IBIG PARTNERS
          </span>
          <h2 className="text-xl font-bold mb-2">Qu&apos;est-ce qu&apos;une commission d&apos;affiliation ?</h2>
          <p className="text-blue-100 text-sm leading-relaxed max-w-2xl">
            Chaque fois qu&apos;un client achète un produit IBIG SARL via <strong className="text-white">votre lien unique</strong>,
            vous recevez automatiquement un <strong className="text-white">pourcentage du montant</strong> de la vente.
            Pas de stock. Pas d&apos;investissement. Juste votre réseau et vos liens.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              ["🔗", "Vous partagez votre lien"],
              ["🛒", "Un client achète"],
              ["💰", "Vous touchez la commission"],
            ].map(([icon, label]) => (
              <div key={label} className="rounded-xl bg-white/15 px-3 py-2 text-center">
                <p className="text-2xl">{icon}</p>
                <p className="text-xs font-semibold text-white mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LES 3 NIVEAUX */}
      <div>
        <h2 className="text-base font-bold text-ink mb-1">Le système 3 niveaux</h2>
        <p className="text-sm text-muted mb-4">Vous gagnez sur vos ventes directes, <strong>ET</strong> sur les ventes de vos filleuls jusqu&apos;au 3ᵉ niveau.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { level: "Niveau 1", who: "Vos ventes directes", rate: "Taux plein", color: "bg-gradient-to-br from-blue-600 to-blue-700", example: "Vous vendez Scolaby → 15% du prix" },
            { level: "Niveau 2", who: "Ventes de vos filleuls", rate: "50% du taux N1", color: "bg-gradient-to-br from-violet-500 to-violet-700", example: "Votre filleul vend → vous touchez 7,5%" },
            { level: "Niveau 3", who: "Ventes des filleuls de vos filleuls", rate: "25% du taux N1", color: "bg-gradient-to-br from-emerald-500 to-teal-600", example: "Son filleul vend → vous touchez 3,75%" },
          ].map((n) => (
            <div key={n.level} className={`${n.color} rounded-2xl p-5 text-white shadow-md relative overflow-hidden`}>
              <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-white/10" />
              <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">{n.level}</p>
              <p className="font-bold text-lg">{n.who}</p>
              <p className="text-sm text-white/80 mt-1">{n.rate}</p>
              <p className="mt-3 text-xs bg-white/15 rounded-xl px-3 py-2 leading-relaxed">{n.example}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SIMULATEUR */}
      <div>
        <h2 className="text-base font-bold text-ink mb-1">Exemples concrets de gains</h2>
        <p className="text-sm text-muted mb-4">Voici ce que vous pouvez gagner sur les produits IBIG.</p>
        <div className="space-y-4">
          {COMMISSION_EXAMPLES.map((ex) => {
            const c = COLOR_MAP[ex.color];
            const n1 = Math.round(ex.price * ex.n1 / 100);
            const n2 = Math.round(ex.price * ex.n2 / 100);
            const n3 = Math.round(ex.price * ex.n3 / 100);
            return (
              <div key={ex.product} className={`rounded-2xl border bg-gradient-to-r ${c.card} p-5`}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-bold text-ink text-sm">{ex.product}</h3>
                    <p className="text-xs text-muted mt-0.5">Prix : <strong>{fcfa(ex.price)}</strong> · {ex.type}</p>
                  </div>
                  <span className={`rounded-xl px-2.5 py-1 text-xs font-bold ${c.badge}`}>{ex.type}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Vous vendez (N1)", rate: ex.n1, amount: n1 },
                    { label: "Filleul vend (N2)", rate: ex.n2, amount: n2 },
                    { label: "Réseau N3", rate: ex.n3, amount: n3 },
                  ].map((row) => (
                    <div key={row.label} className="bg-white/70 rounded-xl p-3">
                      <p className="text-[10px] font-semibold text-muted uppercase tracking-wide">{row.label}</p>
                      <p className="text-xs text-muted mt-1">Taux : <strong>{row.rate}%</strong></p>
                      <p className="text-base font-bold text-ink mt-1">{fcfa(row.amount)}</p>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
                        <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${(row.rate / ex.n1) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                {ex.type === "Abonnement mensuel" && (
                  <p className="mt-3 text-xs font-semibold text-blue-700 bg-blue-50 rounded-xl px-3 py-2">
                    ♻️ Commission récurrente : {fcfa(n1)}/mois × 12 mois = <strong>{fcfa(n1 * 12)}</strong> par an pour 1 seul client !
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* STATUTS */}
      <div>
        <h2 className="text-base font-bold text-ink mb-1">Les 4 statuts partenaires</h2>
        <p className="text-sm text-muted mb-4">Plus vous avancez, plus vos taux augmentent automatiquement.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {STATUSES.map((s) => (
            <div key={s.name} className={`rounded-2xl bg-gradient-to-br ${s.bg} p-5 text-white shadow-md`}>
              <p className="text-lg font-bold">{s.name}</p>
              <p className="text-xs text-white/70 mt-1">Condition : <strong className="text-white">{s.condition}</strong></p>
              <p className="mt-2 inline-block rounded-xl bg-white/20 px-3 py-1 text-xs font-bold">{s.bonus}</p>
              <p className="mt-3 text-xs text-white/80 leading-relaxed border-t border-white/20 pt-3">💡 {s.tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CONSEILS */}
      <div>
        <h2 className="text-base font-bold text-ink mb-1">6 stratégies pour maximiser vos revenus</h2>
        <p className="text-sm text-muted mb-4">Appliqués par nos meilleurs partenaires.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TIPS.map((tip) => (
            <div key={tip.title} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="text-2xl mb-3">{tip.icon}</div>
              <h3 className="font-bold text-sm text-ink mb-1">{tip.title}</h3>
              <p className="text-xs text-muted leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ COMMISSIONS */}
      <div>
        <h2 className="text-base font-bold text-ink mb-4">Questions fréquentes</h2>
        <div className="space-y-3">
          {[
            {
              q: "Quand est-ce que je reçois mon argent ?",
              a: "Les commissions sont versées sous 7 jours ouvrables après encaissement confirmé du client. Le seuil minimum de versement est de 5 000 FCFA.",
            },
            {
              q: "Combien de temps dure le cookie de tracking ?",
              a: "90 jours. Si quelqu'un clique sur votre lien aujourd'hui et achète dans les 90 jours suivants, vous touchez la commission — même s'il n'achète pas immédiatement.",
            },
            {
              q: "Est-ce que je touche une commission si mon filleul vend ?",
              a: "Oui ! C'est la magie du système multi-niveaux. Vous touchez une commission N2 sur toutes les ventes de vos filleuls directs, et N3 sur les ventes de leurs filleuls.",
            },
            {
              q: "Les commissions sur abonnement continuent longtemps ?",
              a: "Oui. Pour les produits SaaS comme Scolaby, vous touchez une commission chaque mois que le client reste abonné. Un client fidèle = revenus récurrents automatiques.",
            },
            {
              q: "Puis-je avoir plusieurs liens pour le même produit ?",
              a: "Non, vous avez un seul lien par produit — mais ce lien est permanent et traçable. Vous pouvez partager ce même lien sur autant de canaux que vous voulez.",
            },
          ].map((faq, i) => (
            <div key={i} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
              <p className="font-semibold text-sm text-ink mb-2">❓ {faq.q}</p>
              <p className="text-sm text-muted leading-relaxed">→ {faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-700 p-6 text-center text-white shadow-lg">
        <p className="text-xl font-bold mb-2">Prêt à gagner vos premières commissions ? 🚀</p>
        <p className="text-blue-100 text-sm mb-4">Activez vos produits, partagez vos liens, et regardez vos revenus croître.</p>
        <a href="/espace/produits" className="inline-block rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50 transition-colors shadow">
          Activer mes produits →
        </a>
      </div>
    </div>
  );
}

import { PageHeader } from "@/components/ui";
import { STATUS_DETAILS } from "@/lib/constants";
import PdfDownloadButton from "./pdf-button";

export const dynamic = "force-dynamic";

// ─── Grille complète des taux par catégorie ──────────────────────────────────
const PRODUCT_RATES = [
  {
    category: "Logiciels SaaS (abonnements mensuels)",
    icon: "💻",
    color: "blue",
    products: ["Scolaby", "HRM Suite", "Gestion stock", "..."],
    rows: [
      { label: "Mois 1", n1: "20%", n2: "10%", n3: "5%" },
      { label: "Mois 2", n1: "15%", n2: "8%",  n3: "3%" },
      { label: "Mois 3", n1: "10%", n2: "5%",  n3: "2%" },
      { label: "Mois 4", n1: "5%",  n2: "3%",  n3: "1%" },
    ],
    note: "Commissions versées chaque mois, pendant 4 mois consécutifs.",
  },
  {
    category: "Abonnements annuels",
    icon: "📅",
    color: "violet",
    products: ["Formules annuelles SaaS IBIG"],
    rows: [
      { label: "Unique", n1: "20%", n2: "8%", n3: "3%" },
    ],
    note: "Commission one-shot dès la confirmation de paiement.",
  },
  {
    category: "Formations catalogue IBIG EDUFORM",
    icon: "🎓",
    color: "emerald",
    products: ["DAF Dirigeant", "Management RH", "Comptabilité", "..."],
    rows: [
      { label: "Unique", n1: "10%", n2: "5%", n3: "2%" },
    ],
    note: "Commission one-shot sur le prix de la formation.",
  },
  {
    category: "Formations sur mesure / Contrats entreprises",
    icon: "🤝",
    color: "amber",
    products: ["Formations intra-entreprise", "Contrats ONG/société"],
    rows: [
      { label: "Unique", n1: "15%", n2: "7,5%", n3: "—" },
    ],
    note: "N1 = 15% du coût du marché. N2 = 7,5%. Pas de niveau 3.",
  },
  {
    category: "IBIG SOFT — Développement sur mesure",
    icon: "⚙️",
    color: "rose",
    products: ["Sites web", "Logiciels sur mesure", "IA & digitalisation"],
    rows: [
      { label: "Unique", n1: "25%", n2: "12,5%", n3: "—" },
    ],
    note: "N1 = 25% de la prestation. N2 = 12,5%. Pas de niveau 3.",
  },
  {
    category: "Immobilier — Vente / Location",
    icon: "🏠",
    color: "teal",
    products: ["Vente de biens", "Location"],
    rows: [
      { label: "Vente", n1: "25%*", n2: "12,5%*", n3: "—" },
      { label: "Location", n1: "25%*", n2: "12,5%*", n3: "—" },
    ],
    note: "* % de la commission agence vendeur. Pas de niveau 3.",
  },
  {
    category: "Immobilier — Gérance d'immeuble",
    icon: "🏢",
    color: "cyan",
    products: ["Contrats de gérance"],
    rows: [
      { label: "Gérance", n1: "1 mois**", n2: "—", n3: "—" },
    ],
    note: "** 1 mois de commission d'agence, versé en 2 fois (50% + 50%).",
  },
  {
    category: "Digital Kit IBIG",
    icon: "📦",
    color: "indigo",
    products: ["Kit complet marketing digital"],
    rows: [
      { label: "Unique", n1: "25%", n2: "10%", n3: "5%" },
    ],
    note: "Taux fixes sur le prix de vente du kit.",
  },
  {
    category: "Construction / Opportunités / Investissements",
    icon: "🔨",
    color: "slate",
    products: ["Marchés de construction", "Opportunités BtoB", "Partenariats"],
    rows: [
      { label: "Variable", n1: "À négocier", n2: "—", n3: "—" },
    ],
    note: "Chaque marché est négocié individuellement. Contactez l'équipe.",
  },
];

// ─── Exemples concrets ────────────────────────────────────────────────────────
const EXAMPLES = [
  {
    title: "Scolaby — Abonnement 30 000 FCFA/mois",
    color: "blue",
    icon: "💻",
    type: "SaaS mensuel",
    lines: [
      { who: "Vous vendez (N1)", mois1: 6000, mois2: 4500, mois3: 3000, mois4: 1500, total: 15000 },
      { who: "Votre filleul vend (N2)", mois1: 3000, mois2: 2400, mois3: 1500, mois4: 900, total: 7800 },
      { who: "Son filleul vend (N3)", mois1: 1500, mois2: 900, mois3: 600, mois4: 300, total: 3300 },
    ],
    recurring: true,
  },
  {
    title: "Formation DAF Dirigeant — 425 000 FCFA",
    color: "emerald",
    icon: "🎓",
    type: "Formation one-shot",
    lines: [
      { who: "Vous vendez (N1)", mois1: 42500, mois2: 0, mois3: 0, mois4: 0, total: 42500 },
      { who: "Votre filleul vend (N2)", mois1: 21250, mois2: 0, mois3: 0, mois4: 0, total: 21250 },
      { who: "Son filleul vend (N3)", mois1: 8500, mois2: 0, mois3: 0, mois4: 0, total: 8500 },
    ],
    recurring: false,
  },
  {
    title: "IBIG SOFT — Site web sur mesure 500 000 FCFA",
    color: "rose",
    icon: "⚙️",
    type: "Prestation sur mesure",
    lines: [
      { who: "Vous apportez le client (N1)", mois1: 125000, mois2: 0, mois3: 0, mois4: 0, total: 125000 },
      { who: "Votre filleul apporte (N2)", mois1: 62500, mois2: 0, mois3: 0, mois4: 0, total: 62500 },
    ],
    recurring: false,
    note: "Pas de niveau 3 pour les prestations sur mesure.",
  },
];

const COLOR_MAP: Record<string, { header: string; badge: string; row: string }> = {
  blue:   { header: "from-blue-600 to-blue-700",     badge: "bg-blue-100 text-blue-700",     row: "hover:bg-blue-50/50" },
  violet: { header: "from-violet-600 to-violet-700", badge: "bg-violet-100 text-violet-700", row: "hover:bg-violet-50/50" },
  emerald:{ header: "from-emerald-600 to-teal-600",  badge: "bg-emerald-100 text-emerald-700", row: "hover:bg-emerald-50/50" },
  amber:  { header: "from-amber-500 to-yellow-500",  badge: "bg-amber-100 text-amber-700",   row: "hover:bg-amber-50/50" },
  rose:   { header: "from-rose-500 to-pink-600",     badge: "bg-rose-100 text-rose-700",     row: "hover:bg-rose-50/50" },
  teal:   { header: "from-teal-500 to-cyan-600",     badge: "bg-teal-100 text-teal-700",     row: "hover:bg-teal-50/50" },
  cyan:   { header: "from-cyan-500 to-sky-600",      badge: "bg-cyan-100 text-cyan-700",     row: "hover:bg-cyan-50/50" },
  indigo: { header: "from-indigo-500 to-indigo-700", badge: "bg-indigo-100 text-indigo-700", row: "hover:bg-indigo-50/50" },
  slate:  { header: "from-slate-500 to-slate-700",   badge: "bg-slate-100 text-slate-700",   row: "hover:bg-slate-50/50" },
};

function fcfa(n: number) {
  return n.toLocaleString("fr-FR") + " FCFA";
}

export default function FormationPage() {
  return (
    <div className="space-y-10 pb-12">
      <PageHeader
        title="📚 Ma Formation"
        subtitle="Comprenez les commissions, maîtrisez le système, maximisez vos revenus."
      />

      {/* HERO */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-violet-700 p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -top-8 -right-8 h-44 w-44 rounded-full bg-white/10 blur-lg" />
        <div className="absolute -bottom-6 left-10 h-24 w-24 rounded-full bg-white/10" />
        <div className="relative">
          <span className="inline-block rounded-xl bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest mb-3">
            Programme IBIG PARTNERS
          </span>
          <h2 className="text-xl font-bold mb-2">Qu&apos;est-ce que le système d&apos;affiliation IBIG ?</h2>
          <p className="text-blue-100 text-sm leading-relaxed max-w-2xl">
            Chaque fois qu&apos;un client achète via <strong className="text-white">votre lien unique</strong>,
            vous recevez automatiquement un <strong className="text-white">pourcentage du montant</strong>.
            Plus votre réseau grandit, plus vos revenus passifs grandissent aussi — jusqu&apos;au 3ᵉ niveau.
          </p>
          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <PdfDownloadButton />
            <a href="/espace/produits" className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2 text-sm font-semibold text-white transition">
              🧩 Activer mes produits
            </a>
          </div>
        </div>
      </div>

      {/* 3 NIVEAUX */}
      <div>
        <h2 className="text-base font-bold text-ink mb-1">Le système 3 niveaux</h2>
        <p className="text-sm text-muted mb-4">Vous gagnez sur vos ventes directes <strong>ET</strong> sur celles de vos filleuls (N2) et leurs filleuls (N3).</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { level: "Niveau 1 (N1)", who: "Vos ventes directes", rate: "Taux plein", color: "from-blue-600 to-blue-700", ex: "Vous vendez → vous touchez le taux maximum" },
            { level: "Niveau 2 (N2)", who: "Ventes de vos filleuls", rate: "50% du taux N1", color: "from-violet-500 to-violet-700", ex: "Votre filleul vend → vous touchez la moitié de votre taux N1" },
            { level: "Niveau 3 (N3)", who: "Ventes des filleuls de vos filleuls", rate: "25% du taux N1", color: "from-emerald-500 to-teal-600", ex: "Son filleul vend → vous touchez 25% de votre taux N1" },
          ].map((n) => (
            <div key={n.level} className={`bg-gradient-to-br ${n.color} rounded-2xl p-5 text-white shadow-md relative overflow-hidden`}>
              <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-white/10" />
              <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">{n.level}</p>
              <p className="font-bold text-base">{n.who}</p>
              <p className="text-sm text-white/80 mt-1">{n.rate}</p>
              <p className="mt-3 text-xs bg-white/15 rounded-xl px-3 py-2 leading-relaxed">{n.ex}</p>
            </div>
          ))}
        </div>
      </div>

      {/* GRILLE DES TAUX */}
      <div>
        <h2 className="text-base font-bold text-ink mb-1">Grille complète des taux par catégorie</h2>
        <p className="text-sm text-muted mb-5">Chaque type de produit IBIG a ses propres règles. Voici le détail exact.</p>
        <div className="space-y-4">
          {PRODUCT_RATES.map((cat) => {
            const c = COLOR_MAP[cat.color] ?? COLOR_MAP.slate;
            return (
              <div key={cat.category} className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                <div className={`bg-gradient-to-r ${c.header} px-5 py-3 flex items-center gap-3`}>
                  <span className="text-xl">{cat.icon}</span>
                  <div>
                    <h3 className="font-bold text-white text-sm">{cat.category}</h3>
                    <p className="text-xs text-white/70 mt-0.5">{cat.products.join(" · ")}</p>
                  </div>
                </div>
                <div className="bg-white">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs text-muted">
                      <tr>
                        <th className="px-5 py-2 font-semibold">Période</th>
                        <th className="px-3 py-2 font-semibold text-center">N1 (vous)</th>
                        <th className="px-3 py-2 font-semibold text-center">N2 (filleul)</th>
                        <th className="px-3 py-2 font-semibold text-center">N3 (réseau)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {cat.rows.map((row, i) => (
                        <tr key={i} className={`transition-colors ${c.row}`}>
                          <td className="px-5 py-2.5 font-medium text-ink">{row.label}</td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`rounded-xl px-2 py-0.5 text-xs font-bold ${c.badge}`}>{row.n1}</span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {row.n2 !== "—" ? (
                              <span className="rounded-xl px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700">{row.n2}</span>
                            ) : (
                              <span className="text-xs text-muted">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {row.n3 !== "—" ? (
                              <span className="rounded-xl px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700">{row.n3}</span>
                            ) : (
                              <span className="text-xs text-muted">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="px-5 py-2.5 text-xs text-muted border-t border-slate-50 bg-slate-50/50">{cat.note}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EXEMPLES CONCRETS */}
      <div>
        <h2 className="text-base font-bold text-ink mb-1">Exemples concrets de gains</h2>
        <p className="text-sm text-muted mb-4">Voici exactement ce que vous pouvez toucher sur des cas réels.</p>
        <div className="space-y-4">
          {EXAMPLES.map((ex) => {
            const c = COLOR_MAP[ex.color] ?? COLOR_MAP.slate;
            return (
              <div key={ex.title} className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden bg-white">
                <div className={`bg-gradient-to-r ${c.header} px-5 py-3`}>
                  <p className="text-xs font-bold text-white/70 uppercase tracking-widest">{ex.type}</p>
                  <h3 className="font-bold text-white text-sm">{ex.icon} {ex.title}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs text-muted text-left">
                      <tr>
                        <th className="px-5 py-2 font-semibold">Qui</th>
                        {ex.recurring ? (
                          <>
                            <th className="px-3 py-2 font-semibold text-center">Mois 1</th>
                            <th className="px-3 py-2 font-semibold text-center">Mois 2</th>
                            <th className="px-3 py-2 font-semibold text-center">Mois 3</th>
                            <th className="px-3 py-2 font-semibold text-center">Mois 4</th>
                          </>
                        ) : (
                          <th className="px-3 py-2 font-semibold text-center">Commission</th>
                        )}
                        <th className="px-3 py-2 font-semibold text-right pr-5">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {ex.lines.map((line, i) => (
                        <tr key={i} className={`transition-colors ${c.row}`}>
                          <td className="px-5 py-3 font-medium text-ink text-sm">{line.who}</td>
                          {ex.recurring ? (
                            <>
                              <td className="px-3 py-3 text-center text-xs text-muted">{fcfa(line.mois1 ?? 0)}</td>
                              <td className="px-3 py-3 text-center text-xs text-muted">{fcfa(line.mois2 ?? 0)}</td>
                              <td className="px-3 py-3 text-center text-xs text-muted">{fcfa(line.mois3 ?? 0)}</td>
                              <td className="px-3 py-3 text-center text-xs text-muted">{fcfa(line.mois4 ?? 0)}</td>
                            </>
                          ) : (
                            <td className="px-3 py-3 text-center font-semibold text-ink">{fcfa(line.mois1 ?? 0)}</td>
                          )}
                          <td className="px-3 py-3 text-right pr-5 font-bold text-ink">{fcfa(line.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {ex.note && (
                  <p className="px-5 py-2.5 text-xs text-muted border-t border-slate-50 bg-amber-50/50">{ex.note}</p>
                )}
                {ex.recurring && (
                  <p className="px-5 py-2.5 text-xs font-semibold text-blue-700 bg-blue-50 border-t border-slate-50">
                    ♻️ Sur 12 mois : un seul client = {fcfa(ex.lines[0].total * 12 / 4)} de commissions récurrentes N1 !
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5 STATUTS */}
      <div>
        <h2 className="text-base font-bold text-ink mb-1">Les 5 statuts partenaires</h2>
        <p className="text-sm text-muted mb-4">Plus votre statut monte, plus vos taux augmentent automatiquement sur <strong>toutes</strong> vos commissions.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STATUS_DETAILS.map((s) => (
            <div key={s.status} className={`rounded-2xl bg-gradient-to-br ${s.color} p-5 text-white shadow-md relative overflow-hidden`}>
              <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-white/10" />
              <p className="text-lg font-bold relative">{s.label}</p>
              <p className="text-xs text-white/70 mt-1 relative">Condition : <strong className="text-white">{s.condition}</strong></p>
              <p className="mt-2 inline-block rounded-xl bg-white/20 px-3 py-1 text-xs font-bold relative">{s.bonus}</p>
              <div className="mt-3 border-t border-white/20 pt-3 relative grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-wide">Ventes</p>
                  <p className="font-bold text-sm">{s.sales || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-wide">Filleuls N1</p>
                  <p className="font-bold text-sm">{s.direct || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-wide">Équipe</p>
                  <p className="font-bold text-sm">{s.team || "—"}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-white/80 relative">✨ {s.advantage}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted bg-slate-50 rounded-xl px-4 py-2.5">
          <strong>Équipe active</strong> = tous vos filleuls N1 + N2 + N3 ayant effectué au moins 1 vente confirmée.
          Le bonus de statut s&apos;additionne aux taux de base sur toutes vos commissions.
        </p>
      </div>

      {/* STRATÉGIES */}
      <div>
        <h2 className="text-base font-bold text-ink mb-1">6 stratégies pour maximiser vos revenus</h2>
        <p className="text-sm text-muted mb-4">Appliquées par nos meilleurs partenaires.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: "🔗", title: "Partagez vos liens partout", desc: "WhatsApp, Facebook, email — chaque clic est tracé 90 jours. La commission vous revient même si le client achète 2 mois plus tard." },
            { icon: "👥", title: "Recrutez des partenaires actifs", desc: "Un filleul actif vous rapporte N2 sur chaque vente. Avec 10 filleuls actifs, vos revenus passifs peuvent dépasser vos ventes directes." },
            { icon: "📦", title: "Activez tous les produits", desc: "Plus vous avez de liens, plus vous multipliez les chances. Un client peut acheter Scolaby ET une formation dans les 90 jours." },
            { icon: "🎯", title: "Ciblez les bons prospects", desc: "Scolaby → directeurs d'école. Formations → DRH et managers. Immobilier → investisseurs. Personnalisez votre approche." },
            { icon: "♻️", title: "Misez sur les abonnements", desc: "Un client SaaS paie chaque mois. 5 clients Scolaby = commissions récurrentes chaque mois pendant 4 mois. Puis reconvertissez-les en annuel." },
            { icon: "🏆", title: "Montez en statut rapidement", desc: "Gold (+5%) transforme 10 000 FCFA en 10 500 FCFA. Sur un réseau actif de 50 personnes, la différence est massive sur une année." },
          ].map((tip) => (
            <div key={tip.title} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="text-2xl mb-3">{tip.icon}</div>
              <h3 className="font-bold text-sm text-ink mb-1">{tip.title}</h3>
              <p className="text-xs text-muted leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
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
              q: "Qu'est-ce que l'équipe active pour les conditions de statut ?",
              a: "L'équipe active comprend tous vos filleuls N1, N2 et N3 ayant effectué au moins 1 vente confirmée. Ils doivent être dans votre réseau à 3 niveaux ET avoir vendu.",
            },
            {
              q: "Est-ce que je touche une commission si mon filleul vend ?",
              a: "Oui ! Vous touchez N2 sur toutes les ventes de vos filleuls directs, et N3 sur les ventes de leurs filleuls — automatiquement.",
            },
            {
              q: "Comment devenir Elite Représentant ?",
              a: "Il faut atteindre 100 ventes personnelles, 50 filleuls directs (N1) et 100 membres d'équipe active. Si plusieurs partenaires atteignent Elite dans une zone, le représentant officiel est celui avec le score le plus élevé.",
            },
            {
              q: "Les commissions sur abonnement continuent indéfiniment ?",
              a: "Non. Pour les SaaS mensuels, les commissions s'arrêtent après 4 mois par client. Mais chaque nouveau client que fait votre filleul relance un nouveau cycle de 4 mois.",
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
        <p className="text-blue-100 text-sm mb-4">Activez vos produits, partagez vos liens, construisez votre équipe.</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <a href="/espace/produits" className="inline-block rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50 transition-colors shadow">
            🧩 Activer mes produits →
          </a>
          <PdfDownloadButton variant="outline" />
        </div>
      </div>
    </div>
  );
}

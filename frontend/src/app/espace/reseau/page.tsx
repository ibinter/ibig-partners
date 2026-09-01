import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNetwork } from "@/lib/metrics";
import { fcfa, formatDate } from "@/lib/format";
import { Field, PageHeader } from "@/components/ui";
import { Button } from "@/components/button";
import { OPPORTUNITY_STATUS_LABELS, STATUS_LABELS } from "@/lib/constants";
import { submitOpportunity } from "../actions";
import CopyButton from "../liens/copy-button";
import ReseauClient from "./reseau-client";

export const dynamic = "force-dynamic";

const OPP_STATUS_STYLE: Record<string, string> = {
  NEW:       "bg-blue-100 text-blue-800 border border-blue-200",
  IN_REVIEW: "bg-amber-100 text-amber-800 border border-amber-200",
  ACCEPTED:  "bg-emerald-100 text-emerald-800 border border-emerald-200",
  REJECTED:  "bg-rose-100 text-rose-800 border border-rose-200",
};

export default async function ReseauPage() {
  const user = await requireUser();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ibigpartners.com";

  const [network, opportunities, commByLevel] = await Promise.all([
    getNetwork(user.id),
    prisma.opportunity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    Promise.all([1, 2, 3].map((lvl) =>
      prisma.commission.aggregate({
        where: { userId: user.id, level: lvl },
        _sum: { amount: true },
      })
    )),
  ]);

  const byLevel = (lvl: number) => network.filter((m) => m.level === lvl);
  const counts  = [1, 2, 3].map((l) => byLevel(l).length);
  const totalNetwork = counts.reduce((a, b) => a + b, 0);
  const activeCount  = network.filter((m) => m.active && m.approved).length;

  const commN1 = commByLevel[0]._sum.amount ?? 0;
  const commN2 = commByLevel[1]._sum.amount ?? 0;
  const commN3 = commByLevel[2]._sum.amount ?? 0;
  const totalNetworkComm = commN1 + commN2 + commN3;

  const referralUrl = `${baseUrl}/rejoindre?ref=${user.code}`;

  const members = network.map((m) => ({
    id: m.id,
    firstName: m.firstName ?? "",
    lastName:  m.lastName ?? "",
    code: m.code,
    status: m.status,
    statusLabel: STATUS_LABELS[m.status] ?? m.status,
    salesCount: m.salesCount,
    active: m.active,
    approved: m.approved,
    level: m.level,
    createdAt: formatDate(m.createdAt),
  }));

  return (
    <div className="space-y-5 pb-10">
      <PageHeader
        title="Mon Réseau"
        subtitle="Recrutez des partenaires et gagnez des commissions passives sur 3 niveaux."
      />

      {/* ── Lien de parrainage ── */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-5 text-white shadow-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-1">Votre lien de parrainage</p>
            <p className="text-sm text-blue-100 leading-relaxed mb-3">
              Partagez ce lien : chaque partenaire recruté qui fait des ventes vous génère des commissions N2/N3 automatiques.
            </p>
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur-sm">
              <span className="font-mono text-xs text-white/90 flex-1 truncate">{referralUrl}</span>
              <CopyButton text={referralUrl} />
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs text-blue-200 mb-1">Votre code</p>
            <p className="text-2xl font-extrabold text-white tracking-wider">{user.code}</p>
            <p className="text-[10px] text-blue-300 mt-1">{totalNetwork} filleul{totalNetwork !== 1 ? "s" : ""} au total</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-white/15 px-3 py-1">📲 WhatsApp · SMS · Email · Réseaux sociaux</span>
          <span className="rounded-full bg-white/15 px-3 py-1">💸 Commissions N1/N2/N3 automatiques</span>
          <span className="rounded-full bg-white/15 px-3 py-1">🔄 Revenus passifs à vie</span>
        </div>
      </div>

      {/* ── 4 KPIs ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">Réseau total</p>
          <p className="mt-1 text-2xl font-extrabold">{totalNetwork}</p>
          <p className="mt-0.5 text-xs text-slate-400">filleuls sur 3 niveaux</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-200">Filleuls N1</p>
          <p className="mt-1 text-2xl font-extrabold">{counts[0]}</p>
          <p className="mt-0.5 text-xs text-blue-200">directs · taux plein</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-200">Actifs</p>
          <p className="mt-1 text-2xl font-extrabold">{activeCount}</p>
          <p className="mt-0.5 text-xs text-violet-200">ont fait ≥1 vente</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200">Commissions réseau</p>
          <p className="mt-1 text-xl font-extrabold">{fcfa(totalNetworkComm)}</p>
          <p className="mt-0.5 text-xs text-emerald-200">N1 + N2 + N3</p>
        </div>
      </div>

      {/* ── Répartition commissions par niveau ── */}
      {totalNetworkComm > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { lvl: "N1", label: "Filleuls directs",         amount: commN1, color: "from-blue-600 to-blue-700",     sub: "Taux plein" },
            { lvl: "N2", label: "Filleuls de vos filleuls", amount: commN2, color: "from-violet-600 to-purple-700", sub: "50% du taux N1" },
            { lvl: "N3", label: "3ème niveau",              amount: commN3, color: "from-emerald-600 to-teal-600",  sub: "25% du taux N1" },
          ].map((c) => (
            <div key={c.lvl} className={`rounded-2xl bg-gradient-to-br ${c.color} p-4 text-white shadow-sm`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-white/70">{c.sub}</p>
                  <p className="text-xs text-white/80 mt-0.5">{c.label}</p>
                </div>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold text-white">{c.lvl}</span>
              </div>
              <p className="mt-3 text-xl font-extrabold">{fcfa(c.amount)}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Tableau réseau filtrable (client) ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800 text-sm">Tous les membres de mon réseau ({totalNetwork})</h3>
        </div>
        {totalNetwork === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-sm font-semibold text-slate-500">Réseau vide pour l&apos;instant</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">Partagez votre lien de parrainage pour recruter votre premier filleul.</p>
            <div className="flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 mx-auto max-w-sm shadow-sm">
              <span className="font-mono text-xs text-slate-500 truncate">{referralUrl}</span>
              <CopyButton text={referralUrl} />
            </div>
          </div>
        ) : (
          <ReseauClient members={members} />
        )}
      </div>

      {/* ── Conseils de recrutement ── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-violet-700 px-5 py-3">
          <h3 className="font-semibold text-white text-sm">🚀 Développer votre réseau</h3>
          <p className="text-xs text-blue-100 mt-0.5">Les meilleures pratiques pour recruter et activer vos filleuls</p>
        </div>
        <div className="grid gap-0 divide-y divide-slate-50">
          {[
            {
              icon: "💬",
              title: "Partagez sur WhatsApp en priorité",
              desc: "Envoyez votre lien à 5 contacts ciblés avec un message personnalisé. L'approche directe convertit 3× mieux qu'un post générique.",
            },
            {
              icon: "🎯",
              title: "Ciblez les personnes qui cherchent un revenu complémentaire",
              desc: "Enseignants, commerçants, étudiants en fin de cursus, téléopérateurs — ils cherchent à compléter leurs revenus sans quitter leur activité principale.",
            },
            {
              icon: "🤝",
              title: "Accompagnez vos filleuls N1 dans leurs premières ventes",
              desc: "Un filleul qui fait sa 1ère vente dans les 30 jours reste actif. Proposez-lui de faire la 1ère démo avec vous.",
            },
            {
              icon: "📲",
              title: "Utilisez l'assistant Coach IA pour rédiger vos messages",
              desc: "Le Coach IA peut générer en 30 secondes un message WhatsApp ou un post Facebook adapté à votre cible. Essayez maintenant.",
              link: "/espace/coach",
              linkLabel: "Ouvrir le Coach IA →",
            },
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-4 px-5 py-4">
              <span className="text-2xl shrink-0 mt-0.5">{tip.icon}</span>
              <div>
                <p className="font-semibold text-sm text-slate-800">{tip.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{tip.desc}</p>
                {tip.link && (
                  <a href={tip.link} className="mt-1 inline-block text-xs font-semibold text-blue-600 hover:underline">
                    {tip.linkLabel}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Opportunités B2B ── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-800 text-sm">💼 Soumettre une opportunité B2B</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Vous avez identifié un besoin, un contact, un projet ou un marché ?
              Soumettez-le — l&apos;équipe IBIG l&apos;étudie et vous contacte si l&apos;opportunité est retenue.
            </p>
          </div>
          <form action={submitOpportunity} className="space-y-3">
            <Field label="Titre de l'opportunité" name="title" required placeholder="Ex : PME de Cocody cherche un ERP" />
            <Field label="Catégorie" name="category">
              <select
                name="category"
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
              >
                <option value="">-- Choisir une catégorie --</option>
                <option value="FORMATION">🎓 Formation & Éducation</option>
                <option value="DIGITAL">💻 Digital & Web (sites, apps, e-commerce)</option>
                <option value="INFORMATIQUE">⚙️ Logiciels & Informatique (ERP, SaaS)</option>
                <option value="IMMOBILIER">🏠 Immobilier (vente, location, foncier)</option>
                <option value="BTP">🏗️ BTP & Construction</option>
                <option value="CONSEIL">📋 Conseil & Accompagnement</option>
                <option value="FINANCEMENT">💰 Financement & Investissement</option>
                <option value="COMMERCIAL">🤝 Développement Commercial & Vente</option>
                <option value="PARTENARIAT">🌐 Partenariat & Représentation</option>
                <option value="MISE_EN_RELATION">🔗 Mise en Relation & Intermédiation</option>
                <option value="EMPLOI_RH">👥 Emploi & Ressources Humaines</option>
                <option value="EVENEMENTIEL">🎪 Événementiel & Communication</option>
                <option value="MARKETING">📢 Marketing & Communication Visuelle</option>
                <option value="SERVICES">🛠️ Services aux Entreprises</option>
                <option value="COMMERCE">🛒 Commerce, Distribution & Import/Export</option>
                <option value="LOGISTIQUE">🚚 Logistique & Transport</option>
                <option value="SANTE">🏥 Santé & Bien-être</option>
                <option value="AGRI">🌱 Agriculture & Agrobusiness</option>
                <option value="ENERGIE">⚡ Énergie & Environnement</option>
                <option value="INTERNATIONAL">🌍 Opportunité Internationale</option>
                <option value="AUTRE">💡 Autre / Je ne sais pas encore</option>
              </select>
            </Field>
            <Field label="Valeur estimée (FCFA) — optionnel" name="estimatedValue" type="number" placeholder="0" />
            <Field label="Description" name="description">
              <textarea
                name="description"
                required
                rows={4}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
                placeholder="Décrivez l'opportunité : qui est le client / le besoin, quel secteur, quelle ville, quel type de collaboration envisagé…"
              />
            </Field>
            <Button type="submit" className="w-full">Soumettre l&apos;opportunité →</Button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <h3 className="font-semibold text-slate-800 text-sm">Mes opportunités soumises</h3>
            <span className="text-xs text-slate-400">{opportunities.length} soumise{opportunities.length !== 1 ? "s" : ""}</span>
          </div>
          {opportunities.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-3xl mb-2">💼</p>
              <p className="text-sm text-slate-400">Aucune opportunité soumise pour le moment.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {opportunities.map((o) => (
                <li key={o.id} className="px-5 py-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <p className="font-semibold text-sm text-slate-800 truncate">{o.title}</p>
                    <span className={`shrink-0 rounded-xl px-2.5 py-0.5 text-xs font-semibold ${OPP_STATUS_STYLE[o.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {OPPORTUNITY_STATUS_LABELS[o.status] ?? o.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{o.description}</p>
                  {o.estimatedValue > 0 && (
                    <p className="mt-1.5 text-xs font-semibold text-blue-600">Valeur estimée : {fcfa(o.estimatedValue)}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

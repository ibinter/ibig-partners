import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    id: "profil",
    icon: "👤",
    title: "Complétez votre profil",
    desc: "Ajoutez votre ville, votre photo et vos coordonnées de paiement (Orange Money, Wave ou banque).",
    href: "/espace/profil",
    cta: "Compléter mon profil",
    color: "blue",
  },
  {
    id: "kyc",
    icon: "🔐",
    title: "Vérifiez votre identité (KYC)",
    desc: "Envoyez une pièce d'identité valide pour débloquer les paiements de commissions.",
    href: "/espace/verification",
    cta: "Soumettre mes documents",
    color: "amber",
  },
  {
    id: "produit",
    icon: "🧩",
    title: "Activez au moins un produit",
    desc: "Choisissez les produits IBIG que vous souhaitez promouvoir — Formation, Abonnement, Service…",
    href: "/espace/produits",
    cta: "Activer un produit",
    color: "emerald",
  },
  {
    id: "lien",
    icon: "🔗",
    title: "Obtenez votre lien d'affiliation",
    desc: "Chaque produit activé génère un lien unique tracé à votre code. Partagez-le pour gagner.",
    href: "/espace/liens",
    cta: "Mes liens d'affiliation",
    color: "cyan",
  },
  {
    id: "partage",
    icon: "📣",
    title: "Partagez votre lien",
    desc: "WhatsApp, Facebook, Instagram, bouche-à-oreille — touchez au moins une personne aujourd'hui.",
    href: "/espace/kit",
    cta: "Voir le Kit Marketing",
    color: "purple",
  },
  {
    id: "vente",
    icon: "💸",
    title: "Déclarez votre première vente",
    desc: "Dès qu'un client achète via votre lien, déclarez la vente pour déclencher votre première commission.",
    href: "/espace/ventes",
    cta: "Déclarer une vente",
    color: "rose",
  },
];

const COLOR: Record<string, { pill: string; dot: string; cta: string; bar: string }> = {
  blue:    { pill: "bg-blue-100 text-blue-700",   dot: "bg-blue-500",    cta: "bg-blue-600 hover:bg-blue-700",    bar: "bg-blue-500" },
  amber:   { pill: "bg-amber-100 text-amber-700", dot: "bg-amber-500",   cta: "bg-amber-500 hover:bg-amber-600",  bar: "bg-amber-500" },
  emerald: { pill: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", cta: "bg-emerald-600 hover:bg-emerald-700", bar: "bg-emerald-500" },
  cyan:    { pill: "bg-cyan-100 text-cyan-700",   dot: "bg-cyan-500",    cta: "bg-cyan-600 hover:bg-cyan-700",    bar: "bg-cyan-500" },
  purple:  { pill: "bg-purple-100 text-purple-700", dot: "bg-purple-500", cta: "bg-purple-600 hover:bg-purple-700", bar: "bg-purple-500" },
  rose:    { pill: "bg-rose-100 text-rose-700",   dot: "bg-rose-500",    cta: "bg-rose-600 hover:bg-rose-700",    bar: "bg-rose-500" },
};

export default async function BienvenuePage() {
  const user = await requireUser();

  const [linksCount, salesCount, prospectsCount] = await Promise.all([
    prisma.affiliateLink.count({ where: { userId: user.id } }),
    prisma.sale.count({ where: { sellerId: user.id, status: "CONFIRMED" } }),
    prisma.prospect.count({ where: { userId: user.id } }),
  ]);

  const done: Record<string, boolean> = {
    profil:   Boolean(user.city && user.payoutDetail),
    kyc:      user.verificationStatus === "VERIFIED",
    produit:  linksCount > 0,
    lien:     linksCount > 0,
    partage:  prospectsCount > 0,
    vente:    salesCount > 0,
  };

  const completedCount = Object.values(done).filter(Boolean).length;
  const pct = Math.round((completedCount / STEPS.length) * 100);
  const isComplete = completedCount === STEPS.length;

  const nextStep = STEPS.find((s) => !done[s.id]);

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title={isComplete ? "Félicitations 🎉" : "Bienvenue chez IBIG PARTNERS !"}
        subtitle={
          isComplete
            ? "Vous avez complété toutes les étapes de démarrage. Vous êtes prêt à générer des revenus."
            : `Suivez ces ${STEPS.length} étapes pour commencer à gagner vos premières commissions.`
        }
      />

      {/* Progression globale */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-5 text-white shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-blue-200 font-bold">Avancement</p>
            <p className="text-3xl font-extrabold mt-0.5">{completedCount} / {STEPS.length}</p>
            <p className="text-xs text-blue-200">étapes complétées</p>
          </div>
          <div className="text-5xl font-extrabold text-white/20">{pct}%</div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-white transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        {nextStep && (
          <p className="mt-3 text-xs text-blue-200">
            Prochaine étape : <span className="font-bold text-white">{nextStep.icon} {nextStep.title}</span>
          </p>
        )}
        {isComplete && (
          <p className="mt-3 text-xs font-bold text-emerald-200">✓ Profil complet — vous êtes opérationnel !</p>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const isDone = done[step.id];
          const c = COLOR[step.color];
          return (
            <div
              key={step.id}
              className={`rounded-2xl border p-5 flex items-start gap-4 transition-all shadow-sm ${
                isDone
                  ? "border-emerald-100 bg-emerald-50/40"
                  : nextStep?.id === step.id
                  ? "border-blue-200 bg-blue-50/40 ring-1 ring-blue-200"
                  : "border-slate-100 bg-white"
              }`}
            >
              {/* Step number / check */}
              <div className={`shrink-0 h-10 w-10 flex items-center justify-center rounded-full text-lg font-extrabold shadow ${
                isDone
                  ? "bg-emerald-500 text-white"
                  : nextStep?.id === step.id
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-400"
              }`}>
                {isDone ? "✓" : step.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${c.pill}`}>
                    Étape {i + 1}
                  </span>
                  {isDone && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5 border border-emerald-200">
                      ✓ Complété
                    </span>
                  )}
                  {nextStep?.id === step.id && !isDone && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 rounded-full px-2 py-0.5 border border-blue-200 animate-pulse">
                      → À faire maintenant
                    </span>
                  )}
                </div>
                <h3 className={`mt-1 text-sm font-bold ${isDone ? "text-slate-500 line-through" : "text-slate-800"}`}>
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.desc}</p>
              </div>

              {/* CTA */}
              {!isDone && (
                <Link
                  href={step.href}
                  className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold text-white transition shadow-sm ${c.cta}`}
                >
                  {step.cta} →
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Tips section */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5 space-y-3">
        <h3 className="text-sm font-bold text-amber-800">💡 Conseils pour démarrer vite</h3>
        <ul className="space-y-2 text-xs text-amber-700">
          <li className="flex gap-2"><span>→</span><span>Commencez par les produits que vous utilisez ou connaissez déjà — votre témoignage est votre meilleur argumentaire.</span></li>
          <li className="flex gap-2"><span>→</span><span>Partagez d'abord dans vos groupes WhatsApp — c'est le canal le plus rapide pour les premières ventes.</span></li>
          <li className="flex gap-2"><span>→</span><span>Recrutez au moins un filleul dans votre premier mois — les commissions N1 démultiplient vos revenus passifs.</span></li>
          <li className="flex gap-2"><span>→</span><span>Utilisez le Coach IA pour préparer vos arguments de vente et vos scripts de recrutement.</span></li>
          <li className="flex gap-2"><span>→</span><span>Ajoutez vos prospects dans le CRM et suivez-les dans le pipeline Kanban — ne laissez aucun lead sans suivi.</span></li>
        </ul>
        <div className="flex gap-2 flex-wrap">
          <Link href="/espace/coach" className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 transition shadow-sm">
            Coach IA ✨
          </Link>
          <Link href="/espace/prospects" className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-bold text-amber-700 hover:border-amber-400 transition shadow-sm">
            CRM Prospects 📇
          </Link>
          <Link href="/espace/challenges" className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-bold text-amber-700 hover:border-amber-400 transition shadow-sm">
            Challenges 🔥
          </Link>
          <Link href="/espace/simulateur" className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-bold text-amber-700 hover:border-amber-400 transition shadow-sm">
            Simulateur 🧮
          </Link>
        </div>
      </div>

      {/* Plan 30 jours */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-4 flex items-center gap-3">
          <span className="text-2xl">📅</span>
          <div>
            <h3 className="text-sm font-bold text-white">Votre plan de lancement — 30 jours</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Suivez ce calendrier pour générer vos premières commissions rapidement.</p>
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {[
            {
              period: "J 1-3", label: "Comprendre & configurer",
              color: "bg-blue-600", pill: "bg-blue-100 text-blue-700",
              items: ["Lisez le Guide de Démarrage (PDF)", "Configurez votre profil et coordonnées de paiement", "Choisissez 1-2 niches selon votre réseau (ex : enseignants → SCOLABY, commerçants → GESCOMXEL)", "Activez les produits correspondants et récupérez vos liens"],
              link: "/espace/documents", linkLabel: "📄 Mes Documents",
            },
            {
              period: "J 4-7", label: "Préparer et prospecter",
              color: "bg-amber-500", pill: "bg-amber-100 text-amber-700",
              items: ["Copiez 2-3 argumentaires depuis le Kit Marketing", "Envoyez des messages personnalisés à 20 contacts qualifiés", "Ajoutez chaque prospect dans le CRM pour suivi", "Utilisez le Coach IA pour préparer vos réponses aux objections"],
              link: "/espace/kit", linkLabel: "🎨 Kit Marketing",
            },
            {
              period: "Sem. 2", label: "Convertir et déclarer",
              color: "bg-emerald-600", pill: "bg-emerald-100 text-emerald-700",
              items: ["Relancez les prospects sans réponse (J+3)", "Proposez une démo ou un devis sur les plus chauds", "Déclarez chaque vente confirmée pour créditer votre commission", "Objectif : 1ère vente dans les 14 premiers jours"],
              link: "/espace/prospects", linkLabel: "📇 CRM Prospects",
            },
            {
              period: "Sem. 3-4", label: "Recruter et multiplier",
              color: "bg-violet-600", pill: "bg-violet-100 text-violet-700",
              items: ["Recrutez 2-3 filleuls dans votre entourage — chaque vente qu'ils font vous rapporte", "Partagez votre lien de parrainage sur vos réseaux", "Participez aux challenges pour progresser vers SILVER", "Consultez le simulateur pour projeter vos revenus avec un réseau actif"],
              link: "/espace/simulateur", linkLabel: "🧮 Simulateur de gains",
            },
          ].map((p) => (
            <div key={p.period} className="px-5 py-4 flex gap-4 items-start">
              <div className={`shrink-0 rounded-xl ${p.color} text-white text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1.5 text-center min-w-[52px]`}>
                {p.period}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <p className="text-sm font-bold text-slate-800">{p.label}</p>
                  <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${p.pill}`}>{p.period}</span>
                </div>
                <ul className="space-y-1">
                  {p.items.map((item, i) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-600">
                      <span className="text-slate-300 shrink-0">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href={p.link} className="mt-2 inline-block text-[11px] font-bold text-blue-600 hover:underline">{p.linkLabel}</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Raccourcis outils */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-4">🛠️ Vos outils essentiels</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: "🤖", label: "Coach IA",      sub: "Argumentaires & scripts",    href: "/espace/coach" },
            { icon: "📇", label: "CRM Prospects", sub: "Pipeline Kanban",             href: "/espace/prospects" },
            { icon: "🧮", label: "Simulateur",    sub: "Projeter vos revenus",        href: "/espace/simulateur" },
            { icon: "💎", label: "Commissions",   sub: "Taux & statuts",              href: "/espace/plan-compensation" },
            { icon: "🎨", label: "Kit Marketing", sub: "Visuels & argumentaires",     href: "/espace/kit" },
            { icon: "📄", label: "Documents",     sub: "PDF officiels",               href: "/espace/documents" },
            { icon: "🔥", label: "Challenges",    sub: "Progresser plus vite",        href: "/espace/challenges" },
            { icon: "🌐", label: "Mon Réseau",    sub: "Filleuls & équipe",           href: "/espace/reseau" },
          ].map((t) => (
            <Link key={t.href} href={t.href}
              className="rounded-xl border border-slate-100 bg-slate-50 p-3 hover:border-blue-200 hover:bg-blue-50 transition group">
              <p className="text-xl mb-1">{t.icon}</p>
              <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">{t.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{t.sub}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Ce que la plateforme fait pour vous */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wide">Automatique</span>
          <h3 className="text-sm font-bold text-blue-900">Ce que la plateforme fait pour vous</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white border border-blue-100 p-4">
            <p className="text-lg mb-1">📊</p>
            <p className="text-xs font-bold text-slate-800 mb-1">Relevé mensuel</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">Téléchargez votre récapitulatif mensuel depuis <Link href="/espace/paiements" className="text-blue-600 hover:underline">Mes Paiements</Link>. Alerte automatique quand vous atteignez votre seuil de retrait.</p>
          </div>
          <div className="rounded-xl bg-white border border-blue-100 p-4">
            <p className="text-lg mb-1">🔥</p>
            <p className="text-xs font-bold text-slate-800 mb-1">Challenges & Promotion</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">4 challenges mensuels adaptatifs à votre statut. Votre statut monte <strong>automatiquement</strong> dès que vous remplissez les critères — sans demande manuelle.</p>
          </div>
          <div className="rounded-xl bg-white border border-blue-100 p-4">
            <p className="text-lg mb-1">🗂️</p>
            <p className="text-xs font-bold text-slate-800 mb-1">Cookie tracking 90 jours</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">Un prospect clique votre lien aujourd'hui et achète dans 3 mois — vous touchez quand même la commission. Le tracking dure 90 jours.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

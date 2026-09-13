import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { CertificationBanner } from "@/components/certification-banner";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  VIDEO: "Vidéo", PDF: "Guide PDF", ARTICLE: "Article", AI: "Assistant IA",
  QUIZ: "Quiz", AUDIO: "Audio", IMAGE: "Image",
};
const TYPE_ICONS: Record<string, string> = {
  VIDEO: "🎬", PDF: "📄", ARTICLE: "📝", AI: "🤖", QUIZ: "🧠", AUDIO: "🎧", IMAGE: "🖼️",
};
const TYPE_COLORS: Record<string, string> = {
  VIDEO: "bg-blue-100 text-blue-700", PDF: "bg-amber-100 text-amber-700",
  ARTICLE: "bg-green-100 text-green-700", AI: "bg-violet-100 text-violet-700",
  QUIZ: "bg-orange-100 text-orange-700", AUDIO: "bg-pink-100 text-pink-700",
  IMAGE: "bg-teal-100 text-teal-700",
};
const EMOJI_THUMBS: Record<string, string> = {
  VIDEO: "🎬", PDF: "📋", ARTICLE: "📰", AI: "🤖", QUIZ: "🧪", AUDIO: "🎧", IMAGE: "🖼️",
};
const TABS = [
  { key: "TOUS", label: "Tous" }, { key: "VIDEO", label: "Vidéos" },
  { key: "PDF", label: "Guides PDF" }, { key: "ARTICLE", label: "Articles" },
  { key: "AUDIO", label: "Audios" }, { key: "AI", label: "Assistant IA" }, { key: "QUIZ", label: "Quiz" },
];

// ── Parcours d'onboarding recommandé ─────────────────────────────────────────
const PARCOURS = [
  {
    step: 1, emoji: "📖", title: "Comprendre le système",
    desc: "Lisez la page Formation : grille des taux, système 3 niveaux, exemples de gains.",
    href: "/espace/formation", cta: "Voir la Formation →",
    color: "from-blue-500 to-blue-600",
  },
  {
    step: 2, emoji: "🧩", title: "Activer vos produits",
    desc: "Activez les produits IBIG que vous souhaitez promouvoir et récupérez vos liens affiliés.",
    href: "/espace/produits", cta: "Activer mes produits →",
    color: "from-violet-500 to-violet-600",
  },
  {
    step: 3, emoji: "🔗", title: "Générer vos liens",
    desc: "Créez vos liens UTM trackés et téléchargez vos QR codes pour partager partout.",
    href: "/espace/liens", cta: "Mes liens →",
    color: "from-emerald-500 to-teal-600",
  },
  {
    step: 4, emoji: "🤖", title: "Préparer vos arguments",
    desc: "Parlez au Coach IA IBIG pour maîtriser les produits, préparer vos pitchs et réponses aux objections.",
    href: "/espace/academie/assistant", cta: "Parler au Coach IA →",
    color: "from-amber-500 to-orange-500",
  },
  {
    step: 5, emoji: "📦", title: "Télécharger le kit marketing",
    desc: "Visuels, scripts WhatsApp, arguments clés — tout ce qu'il faut pour prospecter efficacement.",
    href: "/espace/kit", cta: "Kit Marketing →",
    color: "from-rose-500 to-pink-600",
  },
  {
    step: 6, emoji: "👥", title: "Recruter vos filleuls",
    desc: "Partagez votre lien de parrainage et formez vos filleuls pour gagner des commissions N2/N3.",
    href: "/espace/reseau", cta: "Mon réseau →",
    color: "from-slate-500 to-slate-700",
  },
];

// ── Ressources rapides ────────────────────────────────────────────────────────
const RESSOURCES = [
  { icon: "📚", label: "Ma Formation", desc: "Grille des taux, exemples, FAQ", href: "/espace/formation", color: "border-blue-200 bg-blue-50 text-blue-700" },
  { icon: "🤖", label: "Coach IA",     desc: "Préparer argumentaires & réponses", href: "/espace/academie/assistant", color: "border-violet-200 bg-violet-50 text-violet-700" },
  { icon: "📖", label: "Guide PDF",    desc: "Manuel officiel du partenaire", href: "/espace/guide", color: "border-amber-200 bg-amber-50 text-amber-700" },
  { icon: "📦", label: "Kit Marketing",desc: "Scripts, visuels, QR codes", href: "/espace/kit", color: "border-rose-200 bg-rose-50 text-rose-700" },
  { icon: "🧮", label: "Simulateur",   desc: "Calculer vos gains potentiels", href: "/espace/simulateur", color: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { icon: "🏆", label: "Challenges",   desc: "Objectifs mensuels & récompenses", href: "/espace/challenges", color: "border-orange-200 bg-orange-50 text-orange-700" },
];

export default async function AcademiePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const user = await requireUser();
  const { type, q } = await searchParams;
  const activeType = type && type !== "TOUS" ? type : null;

  const STATUS_ORDER = ["STARTER", "SILVER", "GOLD", "MASTER", "ELITE"];
  const userRank = STATUS_ORDER.indexOf(user.status);
  const accessibleStatuses = STATUS_ORDER.slice(0, userRank + 1);

  const where: Record<string, unknown> = {
    active: true,
    minStatus: { in: accessibleStatuses },
  };
  if (activeType) where.type = activeType;
  if (q) where.title = { contains: q, mode: "insensitive" };

  const [modules, progressList, allCount, productCount] = await Promise.all([
    (prisma as any).trainingModule.findMany({
      where,
      orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    }).catch(() => []),
    (prisma as any).trainingProgress.findMany({ where: { userId: user.id } }).catch(() => []),
    (prisma as any).trainingModule.count({ where: { active: true } }).catch(() => 0),
    prisma.product.count({ where: { active: true } }),
  ]);

  const progressMap = new Map<string, { startedAt: Date | null; completedAt: Date | null }>();
  for (const p of progressList) progressMap.set(p.moduleId, p);

  const completedCount = progressList.filter((p: any) => p.completedAt).length;
  const inProgressCount = progressList.filter((p: any) => p.startedAt && !p.completedAt).length;

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Académie IBIG"
        subtitle="Votre centre de formation complet — parcours, outils, modules et coach IA."
      />

      {/* ── Bannière certification ── */}
      <CertificationBanner
        completed={completedCount}
        total={allCount}
        partnerName={`${user.firstName} ${user.lastName}`}
        partnerCode={user.code}
      />

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { value: allCount, label: "Modules disponibles", color: "text-blue-600" },
          { value: completedCount, label: "Complétés", color: "text-emerald-600" },
          { value: inProgressCount, label: "En cours", color: "text-violet-600" },
          { value: allCount > 0 ? `${Math.round((completedCount / allCount) * 100)}%` : "0%", label: "Progression", color: "text-amber-600" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Coach IA ── */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 via-violet-600 to-blue-600 p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">Coach personnalisé</span>
              <span className="flex items-center gap-1 text-xs text-violet-100"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Synchronisé avec vos produits</span>
            </div>
            <h2 className="mt-3 text-xl font-bold text-white">Coach IA IBIG</h2>
            <p className="mt-2 text-sm leading-relaxed text-violet-100">
              Maîtrisez {productCount} offres actives, préparez vos argumentaires de vente, répondez aux objections et obtenez un plan de prospection adapté à votre statut <strong className="text-white">{user.status}</strong>.
            </p>
          </div>
          <Link
            href="/espace/academie/assistant"
            className="inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-md transition hover:-translate-y-0.5 hover:bg-violet-50"
          >
            Parler au Coach IA →
          </Link>
        </div>
      </div>

      {/* ── Parcours recommandé ── */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-800">🗺️ Parcours recommandé</h2>
            <p className="text-sm text-slate-500 mt-0.5">6 étapes pour démarrer et performer en tant que partenaire IBIG</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PARCOURS.map((p) => (
            <Link key={p.step} href={p.href} className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-brand-200 transition-all flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white text-sm font-extrabold shrink-0`}>
                  {p.step}
                </div>
                <span className="text-xl">{p.emoji}</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 text-sm">{p.title}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{p.desc}</p>
              </div>
              <span className="text-xs font-bold text-brand-600 group-hover:text-brand-700">{p.cta}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Ressources rapides ── */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-3">⚡ Ressources rapides</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {RESSOURCES.map((r) => (
            <Link key={r.label} href={r.href} className={`rounded-2xl border p-4 flex flex-col gap-2 hover:shadow-md transition-all ${r.color}`}>
              <span className="text-2xl">{r.icon}</span>
              <p className="font-bold text-sm">{r.label}</p>
              <p className="text-xs opacity-80">{r.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Formation de base (contenu statique) ── */}
      <div>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h2 className="text-base font-bold text-slate-800">🎓 Formation de base</h2>
          <span className="rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-0.5 text-xs font-bold">6 modules · Toujours disponibles</span>
        </div>
        <p className="text-sm text-slate-500 mb-5">Maîtrisez les fondamentaux du partenariat IBIG — lisez dans l&apos;ordre pour un démarrage optimal.</p>
        <div className="space-y-3" id="formation-base">
          {[
            {
              id: "m1", num: "01", icon: "🏗️", color: "from-blue-500 to-blue-600",
              title: "Comprendre le système 3 niveaux",
              tag: "Fondamental", tagColor: "bg-blue-100 text-blue-700",
              duration: "5 min",
              sections: [
                {
                  heading: "Comment fonctionne le système IBIG ?",
                  body: `IBIG Partners utilise un système de commissions à 3 niveaux (N1, N2, N3) :

• N1 (vous) : vous vendez directement un produit IBIG → vous touchez la commission la plus élevée.
• N2 (votre filleul) : quelqu'un que vous avez recruté vend → vous touchez une commission sur sa vente.
• N3 (le filleul de votre filleul) : vous touchez une commission plus faible sur ses ventes aussi.

Ce système vous permet de gagner de l'argent même quand vous ne vendez pas vous-même, tant que votre réseau est actif.`,
                },
                {
                  heading: "Exemple concret avec Scolaby (10 000 FCFA/mois)",
                  body: `Vous vendez en direct (N1) :
  - Mois 1 : 2 000 FCFA (20%)
  - Mois 2 : 1 500 FCFA (15%)
  - Mois 3 : 1 000 FCFA (10%)
  - Mois 4 : 500 FCFA (5%)
  → Total : 5 000 FCFA sur 4 mois pour 1 vente.

Si vous avez 10 clients : 50 000 FCFA sur 4 mois.
Si votre filleul a aussi 10 clients : vous touchez en plus ~26 000 FCFA.

C'est la puissance du réseau : travailler une fois, encaisser plusieurs fois.`,
                },
                {
                  heading: "Les règles à retenir",
                  body: `✅ Plus votre réseau est actif, plus vos commissions N2/N3 grossissent.
✅ Les commissions SaaS mensuels sont versées 4 mois consécutifs.
✅ Les commissions one-shot (formations, logiciels sur mesure) sont versées en 1 fois.
✅ Votre statut (STARTER → ELITE) dépend de vos ventes cumulées et de votre réseau.
⚠️ Pour l'immobilier, les taux s'appliquent sur la commission d'agence, pas sur le prix du bien.`,
                },
              ],
            },
            {
              id: "m2", num: "02", icon: "🧩", color: "from-violet-500 to-violet-600",
              title: "Maîtriser les produits phares",
              tag: "Catalogue", tagColor: "bg-violet-100 text-violet-700",
              duration: "8 min",
              sections: [
                {
                  heading: "Les 5 produits les plus vendus",
                  body: `1. SCOLABY — Logiciel de gestion scolaire
   Cible : écoles privées, instituts, centres de formation.
   Prix : abonnement mensuel (~10 000 à 50 000 FCFA/mois selon taille).
   Argument clé : gestion des inscriptions, notes, paiements des frais scolaires en 1 clic.

2. IBIG Fleet 360 — Gestion de flotte
   Cible : entreprises de transport, sociétés avec véhicules de service.
   Argument clé : suivi GPS, carburant, entretiens, réduction des coûts opérationnels.

3. GESCOMXEL — Gestion commerciale
   Cible : commerce, distribution, PME.
   Argument clé : devis, facturation, stock, caisse, tout-en-un.

4. Formations IBIG EDUFORM
   Cible : dirigeants, DRH, comptables, managers.
   Produits vedettes : DAF Dirigeant (425 000 FCFA), Management RH, Comptabilité.
   Commission N1 : 10% = 42 500 FCFA par vente.

5. IBIG SOFT — Développement sur mesure
   Cible : entreprises qui veulent un site web ou un logiciel spécifique.
   Commission N1 : 25% du devis. C'est le produit avec le plus fort potentiel de gain par vente.`,
                },
                {
                  heading: "Comment présenter un produit en 1 minute ?",
                  body: `Utilisez la formule P.A.S. (Problème → Agitation → Solution) :

Problème : "Est-ce que vous gérez encore vos [inscriptions / stocks / factures] manuellement ?"
Agitation : "C'est chronophage, source d'erreurs, et vous empêche de vous concentrer sur votre cœur de métier."
Solution : "IBIG propose [Scolaby / GESCOMXEL / ...] qui automatise tout ça. Des centaines d'entreprises en Côte d'Ivoire l'utilisent déjà."

Puis proposez une démonstration gratuite — jamais de vente directe en premier contact.`,
                },
              ],
            },
            {
              id: "m3", num: "03", icon: "📱", color: "from-emerald-500 to-teal-600",
              title: "Prospecter efficacement",
              tag: "Ventes", tagColor: "bg-emerald-100 text-emerald-700",
              duration: "7 min",
              sections: [
                {
                  heading: "Où trouver vos prospects ?",
                  body: `Votre réseau immédiat (commencez ici) :
• Famille et amis chefs d'entreprise
• Anciens collègues / condisciples
• Membres de votre église, mosquée, association
• Voisins commerçants

Prospection active :
• Marchés et zones commerciales (Adjamé, Plateau, Cocody, Yopougon...)
• Groupes WhatsApp de commerçants
• LinkedIn (ciblez DG, Directeurs, DAF, RH)
• Facebook : groupes "Entrepreneurs Côte d'Ivoire", "PME Abidjan"...
• Recommandations : chaque client satisfait peut vous donner 3 noms.`,
                },
                {
                  heading: "La règle des 20/80",
                  body: `Sur 100 personnes contactées :
• 20 accepteront une présentation
• 4 à 8 deviendront clients

C'est normal. Ne vous découragez pas après 10 refus.
Les meilleurs partenaires IBIG font 5 à 10 contacts par jour.

Suivez vos prospects dans la section "Mes Prospects" de votre espace pour ne rien perdre.`,
                },
                {
                  heading: "Le processus de vente IBIG en 5 étapes",
                  body: `Étape 1 — Contact initial (WhatsApp / appel) : présentez-vous, suscitez la curiosité.
Étape 2 — Qualifier : "Vous gérez combien d'employés ? Vous avez quel logiciel actuellement ?"
Étape 3 — Démo ou présentation : montrez le produit, racontez une success story.
Étape 4 — Traiter les objections : voir la section "Objections" dans votre Formation.
Étape 5 — Closing : "On lance ça ensemble cette semaine ou la prochaine ?"

Délai moyen de vente : 3 à 14 jours selon le produit.`,
                },
              ],
            },
            {
              id: "m4", num: "04", icon: "🌳", color: "from-amber-500 to-orange-500",
              title: "Construire son réseau de filleuls",
              tag: "Réseau", tagColor: "bg-amber-100 text-amber-700",
              duration: "6 min",
              sections: [
                {
                  heading: "Pourquoi recruter des filleuls ?",
                  body: `Un filleul actif qui fait 5 ventes/mois vous rapporte des commissions sans que vous vendiez.

Exemple avec 3 filleuls actifs sur Scolaby :
• Chacun vend 5 abonnements à 15 000 FCFA/mois
• Votre commission N2 : 8% de chaque vente = 1 200 FCFA × 5 ventes = 6 000 FCFA/filleul/mois
• × 3 filleuls = 18 000 FCFA/mois passifs

Sur un an = 216 000 FCFA sans vendre vous-même.
C'est le revenu passif du réseau.`,
                },
                {
                  heading: "Comment recruter un filleul ?",
                  body: `1. Partagez votre lien de parrainage (dans "Mon Réseau" ou "Mes Liens").
2. Expliquez le modèle simplement : "Tu vends des logiciels, tu gardes 20% sur chaque vente."
3. Accompagnez-le lors de ses 2-3 premières ventes : ça l'encourage à continuer.
4. Formez-le avec cette Académie — envoyez-lui directement ce lien.

Profils qui font les meilleurs filleuls :
• Vendeurs, commerciaux, agents sur le terrain
• Étudiants en commerce / marketing
• Personnes avec un grand réseau social
• Chômeurs motivés qui cherchent un revenu complémentaire`,
                },
                {
                  heading: "Suivre et animer son réseau",
                  body: `✅ Vérifiez régulièrement "Mon Réseau" pour voir qui est actif / inactif.
✅ Relancez les inactifs : un message WhatsApp suffit souvent.
✅ Créez un groupe WhatsApp avec vos filleuls : partagez les succès, les offres spéciales.
✅ Fixez des objectifs collectifs : "Ce mois-ci on vise 20 ventes en équipe."
✅ Fêtez les victoires : un filleul encouragé reste motivé.`,
                },
              ],
            },
            {
              id: "m5", num: "05", icon: "🛠️", color: "from-rose-500 to-pink-600",
              title: "Utiliser ses outils IBIG",
              tag: "Outils", tagColor: "bg-rose-100 text-rose-700",
              duration: "5 min",
              sections: [
                {
                  heading: "Vos liens affiliés (l'outil le plus important)",
                  body: `Chaque produit que vous activez génère un lien unique avec votre code affilié.
Ce lien permet à IBIG de vous créditer la commission quand un prospect passe par là.

• Allez dans "Mes Liens" pour voir et copier vos liens.
• Chaque lien peut être transformé en QR code à imprimer et distribuer.
• Partagez vos liens partout : WhatsApp, Instagram, email, cartes de visite.

⚠️ Important : ne partagez jamais un lien sans votre code affilié, sinon vous ne touchez rien.`,
                },
                {
                  heading: "Le Kit Marketing",
                  body: `Le Kit contient :
• Visuels prêts à poster sur les réseaux sociaux
• Flyers et affiches à imprimer
• Scripts de présentation (audio/vidéo)
• Argumentaires par produit

Allez dans "Kit Marketing" pour télécharger vos supports.
Personnalisez-les avec votre prénom et votre contact avant de les partager.`,
                },
                {
                  heading: "Le Simulateur de gains",
                  body: `Avant de fixer vos objectifs du mois, utilisez le Simulateur pour estimer vos revenus :

• Entrez le nombre de ventes visées par produit
• Le simulateur calcule vos commissions N1 + N2 + N3
• Ajustez selon votre réseau actuel

C'est aussi un excellent outil de démonstration pour recruter des filleuls :
"Regarde, si tu fais 10 ventes ce mois-ci, voilà ce que tu peux gagner..." 📈`,
                },
              ],
            },
            {
              id: "m6", num: "06", icon: "🏆", color: "from-slate-600 to-slate-800",
              title: "Monter en statut et atteindre GOLD",
              tag: "Progression", tagColor: "bg-slate-100 text-slate-700",
              duration: "4 min",
              sections: [
                {
                  heading: "Les 5 statuts IBIG",
                  body: `STARTER → SILVER → GOLD → MASTER → ELITE

Chaque statut débloque :
• Des taux de commission plus élevés
• Des avantages exclusifs (accès prioritaire aux nouveaux produits, événements VIP...)
• Une crédibilité renforcée auprès de vos prospects ("Je suis partenaire GOLD IBIG")

Consultez votre barre de progression sur la page Formation pour voir ce qu'il vous manque pour passer au niveau suivant.`,
                },
                {
                  heading: "Stratégie pour passer GOLD rapidement",
                  body: `GOLD est le statut cible pour commencer à générer des revenus sérieux.

Pour l'atteindre :
1. Activez au moins 3 produits différents.
2. Visez 5 à 10 ventes/mois en direct.
3. Recrutez 3 filleuls actifs.
4. Utilisez tous les outils (liens, kit, simulateur) systématiquement.

Les partenaires qui atteignent GOLD en moins de 3 mois sont ceux qui prospectent tous les jours, même 30 minutes, et qui forment leurs filleuls.`,
                },
                {
                  heading: "Vos prochaines actions concrètes",
                  body: `☐ Activer vos produits dans "Mes Produits"
☐ Générer et copier vos liens affiliés
☐ Envoyer 5 messages de prospection aujourd'hui
☐ Recruter 1 filleul cette semaine
☐ Parler au Coach IA pour préparer votre argumentaire
☐ Télécharger le Kit Marketing et l'utiliser dès demain

Bon courage ! Chaque grand partenaire IBIG a commencé exactement là où vous êtes. 🚀`,
                },
              ],
            },
          ].map((mod) => (
            <details key={mod.id} className="group rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden open:shadow-md open:border-slate-200">
              <summary className="flex cursor-pointer select-none items-center gap-4 p-5 list-none">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-white text-sm font-extrabold shrink-0`}>
                  {mod.num}
                </div>
                <span className="text-xl shrink-0">{mod.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm">{mod.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${mod.tagColor}`}>{mod.tag}</span>
                    <span className="text-xs text-slate-400">⏱ {mod.duration} de lecture</span>
                  </div>
                </div>
                <span className="shrink-0 text-slate-400 text-sm transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="border-t border-slate-100 px-5 pb-6 pt-4 space-y-5">
                {mod.sections.map((s, si) => (
                  <div key={si}>
                    <p className="font-bold text-slate-800 text-sm mb-2">📌 {s.heading}</p>
                    <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
                      {s.body.trim()}
                    </pre>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <Link href="/espace/academie/assistant" className="inline-flex items-center gap-1.5 rounded-xl bg-violet-50 border border-violet-200 px-4 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100 transition">
                    🤖 Approfondir avec le Coach IA
                  </Link>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* ── Modules de formation ── */}
      <div>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h2 className="text-base font-bold text-slate-800">📚 Modules de formation</h2>
          {allCount > 0 && (
            <span className="rounded-full bg-brand-100 text-brand-700 px-2.5 py-0.5 text-xs font-bold">{allCount} disponibles</span>
          )}
        </div>

        {/* Recherche */}
        <form className="mb-4 flex gap-2">
          {activeType && <input type="hidden" name="type" value={activeType} />}
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Rechercher un module..."
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <button type="submit" className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition">
            Rechercher
          </button>
        </form>

        {/* Filtres type */}
        <div className="mb-5 flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const isActive = (tab.key === "TOUS" && !activeType) || tab.key === activeType;
            const params = new URLSearchParams();
            if (tab.key !== "TOUS") params.set("type", tab.key);
            if (q) params.set("q", q);
            return (
              <Link
                key={tab.key}
                href={`/espace/academie?${params.toString()}`}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition ${
                  isActive
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-white border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-700"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Grille modules */}
        {modules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-14 px-6 text-center">
            <p className="text-4xl mb-3">📚</p>
            <p className="font-semibold text-slate-600">Aucun module disponible pour le moment</p>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              L&apos;équipe IBIG ajoute régulièrement de nouvelles formations. En attendant, consultez les ressources ci-dessus ou parlez au Coach IA.
            </p>
            <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
              <Link href="/espace/formation" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition">
                📖 Ma Formation
              </Link>
              <Link href="/espace/academie/assistant" className="rounded-xl border border-brand-200 bg-brand-50 px-5 py-2.5 text-sm font-bold text-brand-700 hover:bg-brand-100 transition">
                🤖 Coach IA
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((mod: any) => {
              const progress = progressMap.get(mod.id);
              const isCompleted = !!progress?.completedAt;
              const isStarted = !!progress?.startedAt && !isCompleted;
              return (
                <Link
                  key={mod.id}
                  href={`/espace/academie/${mod.slug}`}
                  className={`group flex flex-col rounded-2xl bg-white border shadow-sm hover:shadow-md transition-all overflow-hidden ${
                    mod.featured ? "border-amber-300 ring-1 ring-amber-200" : "border-slate-100"
                  }`}
                >
                  <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                    {mod.thumbnail ? (
                      <img src={mod.thumbnail} alt={mod.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-5xl opacity-60">{EMOJI_THUMBS[mod.type] ?? "📚"}</span>
                    )}
                    {mod.featured && (
                      <span className="absolute top-2 right-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-900">⭐ À la une</span>
                    )}
                    {isCompleted && (
                      <span className="absolute bottom-2 left-2 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">✓ Complété</span>
                    )}
                    {isStarted && (
                      <span className="absolute bottom-2 left-2 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-bold text-white">▶ En cours</span>
                    )}
                    {!progress && (
                      <span className="absolute bottom-2 left-2 rounded-full bg-slate-600 px-2 py-0.5 text-xs font-bold text-white">Nouveau</span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_COLORS[mod.type] ?? "bg-slate-100 text-slate-700"}`}>
                        {TYPE_ICONS[mod.type]} {TYPE_LABELS[mod.type] ?? mod.type}
                      </span>
                      {mod.duration && <span className="text-xs text-slate-400">⏱ {mod.duration}</span>}
                    </div>
                    <h3 className="mb-1 font-semibold text-slate-900 text-sm leading-snug group-hover:text-brand-700 transition-colors">
                      {mod.title}
                    </h3>
                    {mod.description && (
                      <p className="mb-3 flex-1 text-xs text-slate-500 leading-relaxed line-clamp-2">{mod.description}</p>
                    )}
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-xs font-semibold text-brand-600 group-hover:text-brand-700">Voir le module →</span>
                      {mod.viewCount > 0 && <span className="text-xs text-slate-400">{mod.viewCount} vues</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CTA bas de page ── */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-700 p-6 text-center text-white shadow-lg">
        <p className="text-lg font-bold mb-1">Besoin d&apos;aide pour démarrer ? 🚀</p>
        <p className="text-blue-100 text-sm mb-4">Le Coach IA IBIG répond à toutes vos questions en temps réel.</p>
        <Link href="/espace/academie/assistant" className="inline-block rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50 transition shadow">
          Parler au Coach IA →
        </Link>
      </div>
    </div>
  );
}

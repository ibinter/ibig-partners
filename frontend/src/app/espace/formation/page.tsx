import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa } from "@/lib/format";
import { PageHeader } from "@/components/ui";
import { STATUS_DETAILS } from "@/lib/constants";
import { getNetwork } from "@/lib/metrics";
import PdfDownloadButton from "./pdf-button";
import FaqAccordion from "./faq-accordion";

export const dynamic = "force-dynamic";

// ─── Grille complète des taux par catégorie ──────────────────────────────────
const PRODUCT_RATES = [
  {
    category: "Logiciels SaaS (abonnements mensuels)",
    icon: "💻",
    color: "blue",
    products: ["Scolaby", "IBIG Fleet 360", "Lokativo", "GESCOMXEL", "Zelivry", "STOCKFLOW ERP", "CONSTRUIRO ERP", "SANTAREX ERP", "AGRIFRIK", "GESTMONEY", "ANOUANZÊ ERP", "IBIG FactPro", "SECRETIS ERP", "IBIG DocPro"],
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
    products: ["DAF Dirigeant", "Management RH", "Comptabilité", "et autres"],
    rows: [
      { label: "Unique", n1: "10%", n2: "5%", n3: "2%" },
    ],
    note: "Commission one-shot sur le prix de la formation.",
  },
  {
    category: "Formations sur mesure / Contrats entreprises",
    icon: "🤝",
    color: "amber",
    products: ["Formation Sur Mesure Entreprise", "Intra-entreprise", "Déplacement Formateur International"],
    rows: [
      { label: "Unique", n1: "10%", n2: "5%", n3: "2,5%" },
    ],
    note: "N1 = 10% du montant du devis. N2 = 5%. N3 = 2,5%.",
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
    products: ["Vente de biens", "Location", "Transaction foncière"],
    rows: [
      { label: "Vente", n1: "10%*", n2: "5%*", n3: "2,5%*" },
      { label: "Location", n1: "10%*", n2: "5%*", n3: "2,5%*" },
    ],
    note: "⚠️ Taux appliqués sur la commission d'agence IBIG IMMO TRUST, PAS sur le prix du bien. Ex : commission agence 1 M FCFA → vous touchez 100 000 FCFA.",
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
    category: "IBIG DIGITAL KITS",
    icon: "📦",
    color: "indigo",
    products: ["Kits numériques", "Intégration ERP", "Chatbot & IA"],
    rows: [
      { label: "Unique", n1: "15%", n2: "7,5%", n3: "3,75%" },
    ],
    note: "Taux fixes sur le prix de vente du produit.",
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

const EXAMPLES = [
  {
    title: "Scolaby — Abonnement 10 000 FCFA/mois",
    color: "blue",
    icon: "💻",
    type: "SaaS mensuel",
    lines: [
      { who: "Vous vendez (N1)", mois1: 2000, mois2: 1500, mois3: 1000, mois4: 500, total: 5000 },
      { who: "Votre filleul vend (N2)", mois1: 1000, mois2: 800, mois3: 500, mois4: 300, total: 2600 },
      { who: "Son filleul vend (N3)", mois1: 500, mois2: 300, mois3: 200, mois4: 100, total: 1100 },
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
  {
    title: "Immobilier — Commission agence 1 000 000 FCFA",
    color: "teal",
    icon: "🏠",
    type: "Commission agence IBIG IMMO TRUST",
    lines: [
      { who: "Vous apportez l'acheteur (N1)", mois1: 100000, mois2: 0, mois3: 0, mois4: 0, total: 100000 },
      { who: "Votre filleul apporte (N2)", mois1: 50000, mois2: 0, mois3: 0, mois4: 0, total: 50000 },
      { who: "Son filleul apporte (N3)", mois1: 25000, mois2: 0, mois3: 0, mois4: 0, total: 25000 },
    ],
    recurring: false,
    note: "⚠️ Taux appliqués sur la commission d'agence, PAS sur le prix du bien.",
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

const FAQ_ITEMS = [
  {
    q: "Quand est-ce que je reçois mon argent ?",
    a: "Les commissions sont versées sous 7 jours ouvrables après encaissement confirmé du client. Le seuil minimum de versement est de 5 000 FCFA. Les modes de paiement disponibles sont Orange Money, Wave, MTN MoMo et virement bancaire.",
  },
  {
    q: "Combien de temps dure le cookie de tracking ?",
    a: "90 jours. Si quelqu'un clique sur votre lien aujourd'hui et achète dans les 90 jours suivants, vous touchez la commission — même s'il n'achète pas immédiatement. C'est pourquoi il faut activer tous vos produits pour maximiser les chances.",
  },
  {
    q: "Qu'est-ce que l'équipe active pour les conditions de statut ?",
    a: "L'équipe active comprend tous vos filleuls N1, N2 et N3 ayant effectué au moins 1 vente confirmée. Ils doivent être dans votre réseau à 3 niveaux ET avoir vendu. Un filleul inscrit mais qui n'a jamais vendu ne compte pas dans l'équipe active.",
  },
  {
    q: "Est-ce que je touche une commission si mon filleul vend ?",
    a: "Oui ! Vous touchez N2 sur toutes les ventes de vos filleuls directs, et N3 sur les ventes de leurs filleuls — automatiquement et sans effort supplémentaire de votre part. C'est le principe des revenus passifs.",
  },
  {
    q: "Comment devenir Elite Représentant ?",
    a: "Il faut atteindre 100 ventes personnelles, 50 filleuls directs (N1) et 100 membres d'équipe active. Si plusieurs partenaires atteignent Elite dans une zone, le représentant officiel est celui avec le score le plus élevé.",
  },
  {
    q: "Les commissions sur abonnement continuent indéfiniment ?",
    a: "Non. Pour les SaaS mensuels, les commissions s'arrêtent après 4 mois par client (M1=20%, M2=15%, M3=10%, M4=5%). Mais chaque nouveau client que fait votre filleul relance un nouveau cycle de 4 mois. L'objectif est d'accumuler le plus de clients actifs possible.",
  },
  {
    q: "Peut-on cumuler plusieurs produits pour un même client ?",
    a: "Oui ! Si un client clique votre lien et achète Scolaby ET une formation dans les 90 jours, vous touchez une commission sur les deux achats. Activez tous vos produits pour maximiser cette fenêtre. Un même client peut potentiellement acheter dans plusieurs branches IBIG.",
  },
  {
    q: "Comment fonctionne la promotion de statut automatique ?",
    a: "Votre statut est réévalué après chaque vente confirmée. Dès que vous atteignez les critères (ventes, filleuls directs, équipe active), vous êtes promu instantanément et une notification vous le confirme — aucune démarche manuelle n'est nécessaire.",
  },
  {
    q: "À quoi servent les Challenges mensuels ?",
    a: "Les Challenges sont 4 objectifs mensuels adaptés à votre statut (ventes, recrutement, commissions, progression de statut). Ils sont informatifs et vous aident à garder le cap. Votre statut évolue automatiquement sur les critères globaux, pas seulement les challenges mensuels.",
  },
  {
    q: "Comment fonctionne le CRM de suivi des prospects ?",
    a: "Dans 'Mes Prospects', vous gérez un pipeline Kanban : Contacté → Intéressé → Devis → Converti. Pour chaque prospect, vous pouvez enregistrer l'historique de vos échanges (appels, emails, réunions), programmer des rappels et exporter votre liste en CSV. Des relances automatiques vous alertent si un prospect n'a pas été contacté depuis un certain nombre de jours selon son stade.",
  },
  {
    q: "Comment répondre si un prospect me demande si c'est un Ponzi ?",
    a: "Répondez avec confiance : IBIG PARTNERS est un programme d'affiliation — pas un Ponzi, pas un MLM pyramidal. Les 3 points clés : (1) L'inscription est gratuite, vous n'investissez rien. (2) Vous êtes payé uniquement sur des ventes réelles de produits existants. (3) Si personne ne vend rien, personne n'est payé — pas de rendement garanti. Le modèle est identique à Amazon Associates. Proposez à votre prospect de visiter ibigsoft.com ou ibig-eduform.com pour voir les produits par lui-même.",
  },
  {
    q: "Comment prouver la légitimité d'IBIG à un prospect sceptique ?",
    a: "Plusieurs preuves concrètes : (1) Les sites des branches existent et présentent des produits réels avec démonstrations. (2) IBIG SARL est une société enregistrée en Côte d'Ivoire. (3) Les commissions viennent d'actes commerciaux documentés. (4) Aucun frais d'adhésion ni achat minimum. Si votre prospect reste sceptique, proposez-lui un rendez-vous avec l'équipe IBIG ou de tester lui-même un produit.",
  },
  {
    q: "Qu'est-ce qu'une mission CASH et comment l'accomplir ?",
    a: "Une mission CASH est un objectif commercial dont la récompense est une somme d'argent versée directement sur votre compte affilié (en plus de vos commissions normales). Exemple : 'Réalisez 5 ventes Scolaby ce mois → gagnez 50 000 FCFA bonus'. Pour l'accomplir, rendez-vous dans la section Missions, lisez les conditions précises et accomplissez l'objectif avant la date limite. La récompense est versée en même temps que vos commissions.",
  },
  {
    q: "Qu'est-ce qu'une mission CP (Crédibilité Points) ?",
    a: "Les CP (Crédibilité Points) sont des points non monétaires qui servent à progresser plus vite dans les statuts et à débloquer des avantages exclusifs. Les missions CP récompensent des actions importantes : compléter votre KYC (+50 CP), réaliser votre 1ère vente (+100 CP), recruter votre 1er filleul (+75 CP), compléter un module de l'Académie (+30 CP), etc. Plus vous avez de CP, plus votre profil est crédible et votre progression rapide.",
  },
  {
    q: "Qu'est-ce qu'une mission MIXTE ? Est-ce la meilleure option ?",
    a: "Une mission MIXTE combine les deux : vous gagnez à la fois de l'argent (FCFA) ET des CP. Exemple : 'Recrutez 3 filleuls actifs ce mois → 30 000 FCFA + 150 CP'. C'est effectivement la meilleure option car vous obtenez une récompense immédiate en cash ET des points de progression long terme. La majorité des missions disponibles sur la plateforme sont de type MIXTE, et c'est ce que les partenaires les plus performants privilégient.",
  },
  {
    q: "Comment accéder aux missions disponibles ?",
    a: "Dans votre espace partenaire, allez dans la section 'Missions'. Vous y trouverez toutes les missions disponibles filtrées par type (CASH, CP, MIXTE), par branche IBIG, et par difficulté. Chaque mission affiche clairement l'objectif, la récompense, et la date limite. Cliquez sur une mission pour voir les conditions précises et suivre votre progression.",
  },
  {
    q: "Quelle est la différence entre commission normale et récompense de mission ?",
    a: "La commission normale est calculée automatiquement sur chaque vente selon les taux IBIG (N1/N2/N3). La récompense de mission est un bonus supplémentaire versé quand vous atteignez un objectif spécifique. Vous pouvez cumuler les deux : une vente peut vous rapporter votre commission normale + contribuer à une mission CASH ou MIXTE. C'est pour ça qu'il faut toujours vérifier les missions actives avant de prospecter.",
  },
  {
    q: "Quelle est la meilleure stratégie pour maximiser mes revenus avec les missions ?",
    a: "Stratégie recommandée : (1) Consultez les missions actives chaque lundi matin. (2) Priorisez les missions MIXTES pour le double bénéfice. (3) Alignez vos efforts de prospection avec les missions en cours — si une mission récompense les ventes Scolaby, concentrez-vous dessus. (4) Combinez missions CASH (revenus immédiats) avec missions CP (progression statut). (5) Partagez les missions atteignables avec vos filleuls pour stimuler l'activité N2/N3.",
  },
  {
    q: "Mon KYC a été rejeté. Que faire ?",
    a: "Un rejet KYC est fréquent et facile à corriger. Lisez attentivement le motif indiqué dans le mail (document illisible, information manquante, photo floue, etc.). Corrigez le problème spécifique et soumettez à nouveau immédiatement. Le nouveau dossier est traité sous 24-48h. En cas de doute, contactez support@ibigpartners.com avec votre code affilié et une description du problème.",
  },
  {
    q: "Comment calculer précisément ce que je vais gagner sur une vente ?",
    a: "Formule de base : Commission = Prix de vente × Taux N1 (si vente directe) ou × Taux N2 (si filleul vend). Pour IBIG SOFT mensuel : un client à 10 000 FCFA/mois vous rapporte 10 000 × 20% = 2 000 FCFA le mois 1, puis 1 500, 1 000, 500 FCFA les mois suivants. Total sur 4 mois : 5 000 FCFA par client. Utilisez le simulateur dans votre espace partenaire pour des calculs complexes.",
  },
  {
    q: "Comment prospecter efficacement sur les réseaux sociaux ?",
    a: "Les 3 plateformes les plus efficaces pour les affiliés IBIG : (1) WhatsApp : messages personnalisés (jamais de masse), groupes WhatsApp dédiés, statuts avec témoignages clients. (2) Facebook : posts avec résultats concrets + visuels IBIG, groupes thématiques (chefs d'entreprise, enseignants, DRH). (3) LinkedIn : cibler DRH, directeurs d'école, DG de PME avec un message de connexion professionnel. Fréquence recommandée : 1 post/jour minimum sur au moins 2 plateformes.",
  },
  {
    q: "Quels produits IBIG sont les plus faciles à vendre pour un débutant ?",
    a: "Les 3 produits les plus accessibles pour débuter : (1) Scolaby — cible facile (écoles, crèches, académies), besoin universel, prix abordable (10 000 FCFA/mois), démo rapide en 10 min. (2) IBIG FactPro — toute TPE/PME a besoin de facturer, prix doux (4 900 FCFA/mois), démonstration intuitive. (3) Formations IBIG EDUFORM catalogue — pas besoin de démo, partagez le lien et les gens s'inscrivent directement. Évitez l'immobilier et le financement au début, ce sont des cycles de vente plus longs.",
  },
  {
    q: "Comment gérer un filleul qui ne vend pas depuis 30 jours ?",
    a: "Protocole de relance en 3 étapes : (1) Message WhatsApp personnalisé : 'Bonjour [Prénom], j'ai vu que tu n'as pas encore réalisé ta 1ère vente. Est-ce qu'il y a quelque chose qui te bloque ? Je suis là pour t'aider.' (2) Si pas de réponse après 3 jours : appel de 15 minutes pour identifier le blocage réel (manque de confiance, de prospects, de compréhension du produit). (3) Proposez-lui de faire sa première démo avec vous, en co-selling. Un filleul qui vend une fois continue généralement à vendre.",
  },
  {
    q: "Que faire si un client me demande un devis ?",
    a: "Pour un devis, contactez directement l'équipe IBIG par email ou WhatsApp. Donnez-leur : (1) Le produit/service concerné, (2) Le profil du prospect (taille entreprise, secteur, besoins spécifiques), (3) Vos coordonnées affilié (code + nom). L'équipe IBIG préparera le devis officiel et vous sera attribué la commission si la vente se conclut via votre référence. Ne promettez jamais de prix avant d'avoir le devis officiel.",
  },
  {
    q: "Puis-je promouvoir IBIG en dehors de Côte d'Ivoire ?",
    a: "Oui ! IBIG PARTNERS est un programme panafricain et international sans limite de pays. Vous pouvez recruter des filleuls et vendre à des clients partout en Afrique et dans la diaspora. Les formations IBIG EDUFORM ont un format spécial diaspora/international. Les paiements sont disponibles via virement bancaire international en plus des méthodes Mobile Money africaines.",
  },
  {
    q: "Combien de filleuls puis-je avoir au maximum ?",
    a: "Aucune limite ! Vous pouvez recruter autant de filleuls directs (N1) que vous le souhaitez. Chacun de vos filleuls peut lui-même recruter sans limite, créant votre N2. Et leurs filleuls créent votre N3. La seule limite est votre capacité à les former et à les animer. Qualité > quantité : 10 filleuls actifs valent mieux que 100 filleuls inactifs.",
  },
];

const STATUS_ORDER = ["STARTER", "SILVER", "GOLD", "MASTER", "ELITE"];

export default async function FormationPage() {
  const user = await requireUser();

  const [salesCount, commissionsTotal, networkRaw] = await Promise.all([
    prisma.sale.count({ where: { sellerId: user.id, status: "CONFIRMED" } }),
    prisma.commission.aggregate({
      where: { userId: user.id },
      _sum: { amount: true },
    }),
    getNetwork(user.id),
  ]);

  const totalComm    = commissionsTotal._sum.amount ?? 0;
  const directCount  = networkRaw.filter((m) => m.level === 1).length;
  const teamActive   = networkRaw.filter((m) => m.active && m.approved).length;

  const currentStatusIdx = STATUS_ORDER.indexOf(user.status);
  const nextStatusDef    = STATUS_DETAILS[currentStatusIdx + 1] ?? null;
  const currentStatusDef = STATUS_DETAILS[currentStatusIdx] ?? STATUS_DETAILS[0];

  // Progression vers prochain statut (multi-critères)
  let progressPct = 100;
  let progressLabel = "Statut maximum atteint 👑";
  if (nextStatusDef) {
    const criteria: { label: string; current: number; target: number }[] = [];
    if (nextStatusDef.sales > 0)  criteria.push({ label: "ventes",   current: salesCount,   target: nextStatusDef.sales });
    if (nextStatusDef.direct > 0) criteria.push({ label: "filleuls", current: directCount,  target: nextStatusDef.direct });
    if (nextStatusDef.team > 0)   criteria.push({ label: "équipe",   current: teamActive,   target: nextStatusDef.team });
    const pcts = criteria.map((c) => Math.min(1, c.current / c.target));
    progressPct   = criteria.length > 0 ? Math.round((pcts.reduce((a, b) => a + b, 0) / pcts.length) * 100) : 100;
    progressLabel = criteria.map((c) => `${c.current}/${c.target} ${c.label}`).join(" · ");
  }

  const NAV_SECTIONS = [
    { id: "systeme",    label: "Système 3N" },
    { id: "grille",     label: "Grille des taux" },
    { id: "exemples",   label: "Exemples" },
    { id: "statuts",    label: "Statuts" },
    { id: "strategies", label: "Stratégies" },
    { id: "faq",        label: "FAQ" },
  ];

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Ma Formation"
        subtitle="Comprenez les commissions, maîtrisez le système, maximisez vos revenus."
      />

      {/* ── Navigation rapide ── */}
      <div className="flex flex-wrap gap-2">
        {NAV_SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition shadow-sm"
          >
            {s.label}
          </a>
        ))}
      </div>

      {/* ── KPIs personnalisés ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={`rounded-2xl bg-gradient-to-br ${currentStatusDef.color} p-4 text-white shadow-sm`}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">Statut actuel</p>
          <p className="mt-1 text-xl font-extrabold">{currentStatusDef.label}</p>
          <p className="mt-0.5 text-xs text-white/70">{currentStatusDef.bonus}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-200">Ventes confirmées</p>
          <p className="mt-1 text-2xl font-extrabold">{salesCount}</p>
          <p className="mt-0.5 text-xs text-blue-200">ventes personnelles</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200">Commissions totales</p>
          <p className="mt-1 text-2xl font-extrabold">{fcfa(totalComm)}</p>
          <p className="mt-0.5 text-xs text-emerald-200">tous statuts confondus</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-200">Réseau</p>
          <p className="mt-1 text-2xl font-extrabold">{networkRaw.length}</p>
          <p className="mt-0.5 text-xs text-violet-200">{directCount} directs · {teamActive} actifs</p>
        </div>
      </div>

      {/* ── Progression vers prochain statut ── */}
      {nextStatusDef ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Prochain palier</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {currentStatusDef.label} → {nextStatusDef.label}
              </p>
            </div>
            <span className="text-2xl font-extrabold text-blue-600">{progressPct} %</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-700"
              style={{ width: `${Math.max(progressPct, 2)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">{progressLabel}</p>
          <p className="mt-0.5 text-xs text-slate-400">Condition complète : <span className="font-semibold text-slate-600">{nextStatusDef.condition}</span></p>
        </div>
      ) : (
        <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-4 text-center">
          <p className="text-sm font-bold text-yellow-800">👑 Vous êtes au statut maximum — Elite Représentant !</p>
        </div>
      )}

      {/* ── HERO ── */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-violet-700 p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -top-8 -right-8 h-44 w-44 rounded-full bg-white/10 blur-lg" />
        <div className="absolute -bottom-6 left-10 h-24 w-24 rounded-full bg-white/10" />
        <div className="relative">
          <span className="inline-block rounded-xl bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest mb-3">
            Programme IBIG PARTNERS
          </span>
          <h2 className="text-xl font-bold mb-2">Comment fonctionne l&apos;affiliation IBIG ?</h2>
          <p className="text-blue-100 text-sm leading-relaxed max-w-2xl">
            Chaque fois qu&apos;un client achète via <strong className="text-white">votre lien unique</strong>,
            vous recevez automatiquement un <strong className="text-white">pourcentage du montant</strong>.
            Plus votre réseau grandit, plus vos revenus passifs grandissent aussi — jusqu&apos;au 3ᵉ niveau.
          </p>
          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <PdfDownloadButton />
            <Link href="/espace/produits" className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2 text-sm font-semibold text-white transition">
              🧩 Activer mes produits
            </Link>
            <Link href="/espace/liens" className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2 text-sm font-semibold text-white transition">
              🔗 Mes liens
            </Link>
          </div>
        </div>
      </div>

      {/* ── 3 NIVEAUX ── */}
      <div id="systeme">
        <h2 className="text-base font-bold text-slate-800 mb-1">Le système 3 niveaux</h2>
        <p className="text-sm text-slate-500 mb-4">Vous gagnez sur vos ventes directes <strong>ET</strong> sur celles de vos filleuls (N2) et leurs filleuls (N3).</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { level: "Niveau 1 (N1)", who: "Vos ventes directes", rate: "Taux plein", color: "from-blue-600 to-blue-700", ex: "Vous vendez → vous touchez le taux maximum" },
            { level: "Niveau 2 (N2)", who: "Ventes de vos filleuls", rate: "50% du taux N1", color: "from-violet-500 to-violet-700", ex: "Votre filleul vend → vous touchez la moitié de votre taux N1" },
            { level: "Niveau 3 (N3)", who: "Ventes de leurs filleuls", rate: "25% du taux N1", color: "from-emerald-500 to-teal-600", ex: "Son filleul vend → vous touchez 25% de votre taux N1" },
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

      {/* ── GRILLE DES TAUX ── */}
      <div id="grille">
        <h2 className="text-base font-bold text-slate-800 mb-1">Grille complète des taux</h2>
        <p className="text-sm text-slate-500 mb-5">Chaque type de produit IBIG a ses propres règles. Voici le détail exact.</p>
        <div className="space-y-4">
          {PRODUCT_RATES.map((cat) => {
            const c = COLOR_MAP[cat.color] ?? COLOR_MAP.slate;
            return (
              <div key={cat.category} className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                <div className={`bg-gradient-to-r ${c.header} px-5 py-3 flex items-center gap-3`}>
                  <span className="text-xl">{cat.icon}</span>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-sm">{cat.category}</h3>
                    <p className="text-xs text-white/70 mt-0.5 truncate">{cat.products.join(" · ")}</p>
                  </div>
                </div>
                <div className="bg-white">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs text-slate-400">
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
                          <td className="px-5 py-2.5 font-medium text-slate-700">{row.label}</td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`rounded-xl px-2 py-0.5 text-xs font-bold ${c.badge}`}>{row.n1}</span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {row.n2 !== "—" ? (
                              <span className="rounded-xl px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700">{row.n2}</span>
                            ) : <span className="text-xs text-slate-400">—</span>}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {row.n3 !== "—" ? (
                              <span className="rounded-xl px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700">{row.n3}</span>
                            ) : <span className="text-xs text-slate-400">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="px-5 py-2.5 text-xs text-slate-500 border-t border-slate-50 bg-slate-50/50">{cat.note}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── EXEMPLES ── */}
      <div id="exemples">
        <h2 className="text-base font-bold text-slate-800 mb-1">Exemples concrets de gains</h2>
        <p className="text-sm text-slate-500 mb-4">Voici exactement ce que vous pouvez toucher sur des cas réels.</p>
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
                    <thead className="bg-slate-50 text-xs text-slate-400 text-left">
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
                          <td className="px-5 py-3 font-medium text-slate-700 text-sm">{line.who}</td>
                          {ex.recurring ? (
                            <>
                              <td className="px-3 py-3 text-center text-xs text-slate-400">{fcfa(line.mois1 ?? 0)}</td>
                              <td className="px-3 py-3 text-center text-xs text-slate-400">{fcfa(line.mois2 ?? 0)}</td>
                              <td className="px-3 py-3 text-center text-xs text-slate-400">{fcfa(line.mois3 ?? 0)}</td>
                              <td className="px-3 py-3 text-center text-xs text-slate-400">{fcfa(line.mois4 ?? 0)}</td>
                            </>
                          ) : (
                            <td className="px-3 py-3 text-center font-semibold text-slate-700">{fcfa(line.mois1 ?? 0)}</td>
                          )}
                          <td className="px-3 py-3 text-right pr-5 font-bold text-slate-800">{fcfa(line.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {ex.note && (
                  <p className="px-5 py-2.5 text-xs text-slate-500 border-t border-slate-50 bg-amber-50/50">{ex.note}</p>
                )}
                {ex.recurring && (
                  <p className="px-5 py-2.5 text-xs font-semibold text-blue-700 bg-blue-50 border-t border-slate-50">
                    ♻️ Sur 12 mois : un seul client SaaS = {fcfa(ex.lines[0].total * 3)} de commissions récurrentes N1 !
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 5 STATUTS ── */}
      <div id="statuts">
        <h2 className="text-base font-bold text-slate-800 mb-1">Les 5 statuts partenaires</h2>
        <p className="text-sm text-slate-500 mb-4">Plus votre statut monte, plus vos taux augmentent automatiquement sur <strong>toutes</strong> vos commissions.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STATUS_DETAILS.map((s) => (
            <div
              key={s.status}
              className={`rounded-2xl bg-gradient-to-br ${s.color} p-5 text-white shadow-md relative overflow-hidden ${
                s.status === user.status ? "ring-4 ring-white/60 ring-offset-2" : ""
              }`}
            >
              {s.status === user.status && (
                <div className="absolute top-3 right-3 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold text-white">
                  Vous êtes ici
                </div>
              )}
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
        <p className="mt-3 text-xs text-slate-500 bg-slate-50 rounded-xl px-4 py-2.5">
          <strong>Équipe active</strong> = tous vos filleuls N1 + N2 + N3 ayant effectué au moins 1 vente confirmée.
          Le bonus de statut s&apos;additionne aux taux de base sur toutes vos commissions.
        </p>
      </div>

      {/* ── FORMATION DES FILLEULS ── */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl shrink-0">🎓</span>
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-1">Le parrain forme ses filleuls</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              En tant que parrain, vous avez la <strong className="text-slate-800">responsabilité de former vos filleuls</strong>.
              Un filleul bien formé vend mieux, et ses ventes vous rapportent des commissions N2 et N3.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { icon: "📦", title: "Installation des logiciels", desc: "Accompagnez votre filleul pour l'installation et la configuration des solutions IBIG. Cette prestation peut être facturée honnêtement." },
                { icon: "🖥️", title: "Prise en main & usage",     desc: "Formation à l'utilisation du logiciel, tutoriels, sessions de démo. Facturables de manière transparente au filleul ou au client final." },
                { icon: "💼", title: "Coaching commercial",        desc: "Apprendre à prospecter, présenter les produits, gérer les objections, conclure une vente. Une rémunération honnête est légitime." },
                { icon: "⚖️", title: "Facturation honnête",       desc: "Facturer de façon transparente et raisonnable. Pas de sur-facturation. Votre enrichissement viendra des succès de votre filleul." },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl bg-white border border-amber-100 p-4 shadow-sm">
                  <div className="text-xl mb-2">{item.icon}</div>
                  <h3 className="font-bold text-sm text-slate-800 mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-amber-700 bg-amber-100 rounded-xl px-4 py-2.5 font-medium">
              ⚠️ Les frais de formation perçus directement sont distincts des commissions IBIG PARTNERS. IBIG SARL n&apos;est pas partie prenante dans ces transactions.
            </p>
          </div>
        </div>
      </div>

      {/* ── STRATÉGIES ── */}
      <div id="strategies">
        <h2 className="text-base font-bold text-slate-800 mb-1">6 stratégies pour maximiser vos revenus</h2>
        <p className="text-sm text-slate-500 mb-4">Appliquées par nos meilleurs partenaires.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: "🔗", title: "Partagez vos liens partout",    desc: "WhatsApp, Facebook, email — chaque clic est tracé 90 jours. La commission vous revient même si le client achète 2 mois plus tard." },
            { icon: "👥", title: "Recrutez des partenaires actifs", desc: "Un filleul actif vous rapporte N2 sur chaque vente. Avec 10 filleuls actifs, vos revenus passifs peuvent dépasser vos ventes directes." },
            { icon: "📦", title: "Activez tous les produits",      desc: "Plus vous avez de liens, plus vous multipliez les chances. Un client peut acheter Scolaby ET une formation dans les 90 jours." },
            { icon: "🎯", title: "Ciblez les bons prospects",      desc: "Scolaby → écoles, Fleet 360 → transporteurs, SANTAREX → cliniques, AGRIFRIK → coopératives, GESTMONEY → agents Mobile Money. Formations → DRH." },
            { icon: "♻️", title: "Misez sur les abonnements",      desc: "Un client SaaS paie chaque mois. 5 clients Scolaby = commissions récurrentes pendant 4 mois. Puis convertissez-les en annuel." },
            { icon: "🏆", title: "Montez en statut rapidement",    desc: "Gold (+5%) transforme 10 000 FCFA en 10 500 FCFA. Sur un réseau actif de 50 personnes, la différence est massive sur une année." },
          ].map((tip) => (
            <div key={tip.title} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-2xl mb-3">{tip.icon}</div>
              <h3 className="font-bold text-sm text-slate-800 mb-1">{tip.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ accordéon ── */}
      <div id="faq">
        <h2 className="text-base font-bold text-slate-800 mb-4">Questions fréquentes</h2>
        <FaqAccordion items={FAQ_ITEMS} />
      </div>

      {/* ── CTA ── */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-700 p-6 text-center text-white shadow-lg">
        <p className="text-xl font-bold mb-2">Prêt à gagner vos premières commissions ? 🚀</p>
        <p className="text-blue-100 text-sm mb-4">Activez vos produits, partagez vos liens, construisez votre équipe.</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/espace/produits" className="inline-block rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50 transition-colors shadow">
            🧩 Activer mes produits →
          </Link>
          <PdfDownloadButton variant="outline" />
        </div>
      </div>
    </div>
  );
}

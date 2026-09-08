import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { partnerSummary, nextStatusProgress } from "@/lib/metrics";
import { fcfa, formatDate, pct } from "@/lib/format";
import { Badge, EmptyState, PageHeader, statusTone } from "@/components/ui";
import { COMMISSION_STATUS_LABELS, STATUS_LABELS } from "@/lib/constants";
import { OnboardingQuest } from "@/components/onboarding-quest";
import { WeeklyChallenge } from "@/components/weekly-challenge";
import DashboardCharts, { type SalePoint, type CommPoint } from "./dashboard-charts";
import LiveKpisBar from "@/components/live-kpis-bar";
import AiRecommendationsWidget from "@/components/ai-recommendations-widget";

export const dynamic = "force-dynamic";

const STATUS_STEPS = [
  { key: "STARTER", icon: "🌱", label: "Starter" },
  { key: "SILVER",  icon: "🥈", label: "Silver" },
  { key: "GOLD",    icon: "🥇", label: "Gold" },
  { key: "MASTER",  icon: "💎", label: "Master" },
  { key: "ELITE",   icon: "👑", label: "Elite" },
];

const QUICK_ACTIONS = [
  { href: "/espace/produits",    icon: "🧩", label: "Activer un produit",   color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
  { href: "/espace/liens",       icon: "🔗", label: "Mes liens",            color: "bg-cyan-50 text-cyan-700 hover:bg-cyan-100" },
  { href: "/espace/ventes",      icon: "📝", label: "Déclarer une vente",   color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
  { href: "/espace/reseau",      icon: "🌳", label: "Mon réseau",           color: "bg-violet-50 text-violet-700 hover:bg-violet-100" },
  { href: "/espace/paiements",   icon: "💸", label: "Retrait",              color: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
  { href: "/espace/academie",    icon: "🎓", label: "Académie",             color: "bg-pink-50 text-pink-700 hover:bg-pink-100" },
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ bienvenue?: string }>;
}) {
  const user = await requireUser();
  const { bienvenue } = await searchParams;
  const summary = await partnerSummary(user.id);
  const prog = nextStatusProgress(summary.confirmedSales, summary.directReferrals, summary.activeTeam);

  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const STATUS_MONTHLY_TARGET: Record<string, number> = {
    STARTER: 3, SILVER: 5, GOLD: 8, MASTER: 12, ELITE: 20,
  };
  const monthlyTarget = STATUS_MONTHLY_TARGET[user.status] ?? 3;

  const suggestedOpportunities = await (async () => {
    try {
      return await (prisma as any).opportunityMatch.findMany({
        where: { userId: user.id, status: { in: ["SUGGESTED", "INVITED"] } },
        orderBy: [{ status: "asc" }, { score: "desc" }],
        take: 3,
        include: {
          opportunity: {
            select: { id: true, code: true, title: true, category: true, description: true, estimatedValue: true, deadline: true },
          },
        },
      });
    } catch { return []; }
  })();

  const [recentCommissions, chartSales, chartComms, salesToday, salesThisMonth, myRank, prospectsUrgent, productsCount, missionsCount, myLinksCount, myMissionsCount] = await Promise.all([
    prisma.commission.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { sale: { include: { product: true } } },
    }),
    prisma.sale.findMany({
      where: { sellerId: user.id, status: "CONFIRMED", createdAt: { gte: eightWeeksAgo } },
      select: { createdAt: true },
    }),
    prisma.commission.findMany({
      where: { userId: user.id, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, amount: true, status: true },
    }),
    prisma.sale.count({ where: { sellerId: user.id, status: "CONFIRMED", createdAt: { gte: todayStart } } }),
    prisma.sale.count({ where: { sellerId: user.id, status: "CONFIRMED", createdAt: { gte: monthStart } } }),
    // Rang : nombre de partenaires avec plus de ventes confirmées que moi
    prisma.sale.groupBy({
      by: ["sellerId"],
      where: { status: "CONFIRMED" },
      _count: { id: true },
    }).then((rows) => {
      const myCount = summary.confirmedSales;
      const rank = rows.filter((r) => r._count.id > myCount).length + 1;
      const total = rows.length || 1;
      return { rank, total };
    }),
    // Prospects urgents : relance due aujourd'hui ou en retard
    prisma.prospect.findMany({
      where: { userId: user.id, reminderAt: { lte: new Date() }, status: { notIn: ["CONVERTED", "LOST"] } },
      orderBy: { reminderAt: "asc" },
      take: 5,
      select: { id: true, name: true, contact: true, reminderAt: true, status: true },
    }),
    // Compteurs produits & missions
    prisma.product.count({ where: { active: true } }),
    prisma.mission.count({ where: { active: true } }),
    prisma.affiliateLink.count({ where: { userId: user.id } }),
    prisma.missionApplication.count({ where: { partnerId: user.id } }),
  ]);

  const salePoints: SalePoint[]  = chartSales.map((s) => ({ createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : String(s.createdAt) }));
  const commPoints: CommPoint[] = chartComms.map((c) => ({ createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt), amount: c.amount, status: c.status }));

  const counts = [1, 2, 3].map(
    (lvl) => summary.network.filter((m) => m.level === lvl).length,
  );

  // Onboarding
  const linksCount = await prisma.affiliateLink.count({ where: { userId: user.id } });
  const prospectsCount = await prisma.prospect.count({ where: { userId: user.id } });
  const onboardingDone = {
    profile: Boolean(user.city && user.payoutDetail),
    activate: linksCount > 0,
    link: linksCount > 0,
    share: false,
    prospect: prospectsCount > 0,
  };

  // Défi semaine
  const weekStart = new Date();
  const day = weekStart.getDay() === 0 ? 7 : weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - day + 1);
  weekStart.setHours(0, 0, 0, 0);
  const weekSales = await prisma.sale.count({
    where: { sellerId: user.id, status: "CONFIRMED", createdAt: { gte: weekStart } },
  });

  // Phase 8 — CP balance + niveau partenaire
  const cpData = await (async () => {
    try {
      const txs = await (prisma as any).pointTransaction.findMany({
        where: { userId: user.id },
        select: { points: true, type: true },
      });
      const earned = txs.filter((t: any) => ["CREDIT", "BONUS"].includes(t.type)).reduce((s: number, t: any) => s + t.points, 0);
      const spent = txs.filter((t: any) => ["DEBIT", "CANCELLATION", "EXPIRATION"].includes(t.type)).reduce((s: number, t: any) => s + Math.abs(t.points), 0);
      return { balance: earned - spent, earned, spent };
    } catch { return { balance: 0, earned: 0, spent: 0 }; }
  })();

  const levelData = await (async () => {
    try {
      const levels = await (prisma as any).partnerLevel.findMany({
        where: { active: true },
        orderBy: { minCp: "asc" },
      });
      if (!levels.length) return null;
      const cp = cpData.earned;
      let currentLevel = levels[0];
      let nextLevel = null;
      for (let i = 0; i < levels.length; i++) {
        if (cp >= levels[i].minCp) { currentLevel = levels[i]; nextLevel = levels[i + 1] ?? null; }
      }
      const pctToNext = nextLevel
        ? Math.min(100, Math.round(((cp - currentLevel.minCp) / (nextLevel.minCp - currentLevel.minCp)) * 100))
        : 100;
      return { currentLevel, nextLevel, pctToNext, cpEarned: cp };
    } catch { return null; }
  })();

  // Score de performance (0-100)
  const perfScore = Math.min(100, Math.round(
    (summary.confirmedSales * 5) +
    (counts.reduce((a: number, b: number) => a + b, 0) * 2) +
    (cpData.balance * 0.1)
  ));

  const needsVerification = user.role === "PARTNER" && user.verificationStatus !== "VERIFIED";
  const verifRejected = user.verificationStatus === "REJECTED";
  const verifPending = user.verificationStatus === "SUBMITTED";

  const currentStatusIndex = STATUS_STEPS.findIndex((s) => s.key === user.status);

  return (
    <div className="space-y-5">

      {/* ── En-tête + statut ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Bonjour, {user.firstName} 👋
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">Votre activité IBIG PARTNERS en un coup d'œil</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 border border-amber-100">
            {STATUS_STEPS[Math.max(0, currentStatusIndex)]?.icon} {STATUS_LABELS[user.status]}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            {user.code}
          </span>
        </div>
      </div>

      {/* ── KPIs live ── */}
      <LiveKpisBar initial={{ salesToday, salesMonth: salesThisMonth, commPending: 0, prospectsUrgent: prospectsUrgent.length, unreadNotif: 0, updatedAt: new Date().toISOString() }} />

      {/* ── Recommandations IA ── */}
      <AiRecommendationsWidget />

      {/* ── Opportunités suggérées par matching ── */}
      {suggestedOpportunities.length > 0 && (
        <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <div>
                <p className="font-extrabold text-slate-900 text-sm leading-tight">Opportunités sélectionnées pour vous</p>
                <p className="text-xs text-violet-600 font-medium">Identifiées par l'algorithme IBIG selon votre profil</p>
              </div>
            </div>
            <Link href="/espace/opportunites" className="text-xs font-bold text-violet-600 hover:underline whitespace-nowrap">
              Voir tout →
            </Link>
          </div>
          <div className="space-y-2">
            {suggestedOpportunities.map((m: any) => (
              <div key={m.id} className="rounded-xl border border-violet-100 bg-white px-4 py-3 flex items-center gap-3">
                <div className="shrink-0 h-10 w-10 rounded-xl bg-violet-600 flex items-center justify-center">
                  <span className="text-white font-extrabold text-sm">{m.score}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-mono font-bold text-amber-600">{m.opportunity.code}</span>
                    {m.status === "INVITED" && (
                      <span className="text-[9px] font-bold bg-violet-100 text-violet-700 rounded-full px-1.5 py-0.5">⚡ Invité</span>
                    )}
                  </div>
                  <p className="font-semibold text-slate-900 text-sm truncate">{m.opportunity.title}</p>
                  <p className="text-[11px] text-slate-400">{m.opportunity.category} · Score de compatibilité : {m.score}/100</p>
                </div>
                <Link
                  href="/espace/opportunites"
                  className="shrink-0 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-3 py-1.5 transition"
                >
                  Voir →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Alertes ── */}
      {bienvenue && (
        <div className="rounded-2xl bg-brand-50 border border-brand-100 px-4 py-3 text-sm text-brand-800 flex items-center gap-3">
          <span className="text-xl shrink-0">🎉</span>
          <span>Bienvenue dans IBIG PARTNERS ! Activez vos produits dans <Link href="/espace/produits" className="font-semibold underline">Mes Produits</Link> pour générer vos premiers liens d'affiliation.</span>
        </div>
      )}

      {!user.approved && (
        <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-800 flex items-center gap-3">
          <span className="text-xl shrink-0">⏳</span>
          <span>Votre compte est <strong>en attente de validation</strong> par l'équipe IBIG. Vos commissions seront activées dès la validation.</span>
        </div>
      )}

      {needsVerification && (
        <Link
          href="/espace/verification"
          className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors ${
            verifRejected
              ? "border-rose-200 bg-rose-50 hover:bg-rose-100"
              : "border-orange-200 bg-orange-50 hover:bg-orange-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{verifRejected ? "❌" : "🔐"}</span>
            <div>
              <p className={`text-sm font-semibold ${verifRejected ? "text-rose-900" : "text-orange-900"}`}>
                {verifRejected
                  ? "Dossier KYC refusé — corrigez et renvoyez vos documents."
                  : verifPending
                  ? "KYC en cours d'examen — vos commissions seront débloquées sous 24–48h."
                  : "KYC requis — vos commissions sont bloquées jusqu'à vérification."}
              </p>
              <p className={`text-xs ${verifRejected ? "text-rose-700" : "text-orange-700"}`}>
                Pièce d'identité + coordonnées de paiement (Orange Money / Wave / Banque)
              </p>
            </div>
          </div>
          <span className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold text-white ${verifRejected ? "bg-rose-500" : "bg-orange-500"}`}>
            {verifPending ? "Suivre mon dossier →" : "Compléter mon KYC →"}
          </span>
        </Link>
      )}

      {/* ── Actions rapides ── */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={`flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-center text-xs font-semibold transition-colors ${a.color}`}
          >
            <span className="text-2xl">{a.icon}</span>
            <span className="leading-tight">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* ── 4 KPI cards ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">CA généré</p>
          <p className="mt-1 text-2xl font-extrabold">{fcfa(summary.revenue)}</p>
          <p className="mt-0.5 text-xs text-blue-300">{summary.confirmedSales} vente{summary.confirmedSales !== 1 ? "s" : ""} confirmée{summary.confirmedSales !== 1 ? "s" : ""}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-4 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-100">Commissions à venir</p>
          <p className="mt-1 text-2xl font-extrabold">{fcfa(summary.payable)}</p>
          <p className="mt-0.5 text-xs text-amber-100">en attente + validées</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-4 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">Commissions versées</p>
          <p className="mt-1 text-2xl font-extrabold">{fcfa(summary.paid)}</p>
          <p className="mt-0.5 text-xs text-emerald-200">total perçu</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 p-4 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Mon réseau</p>
          <p className="mt-1 text-2xl font-extrabold">{counts.reduce((a, b) => a + b, 0)}</p>
          <p className="mt-0.5 text-xs text-slate-400">N1 : {counts[0]} · N2 : {counts[1]} · N3 : {counts[2]}</p>
        </div>
      </div>

      {/* ── Produits & Missions — blocs héros ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* PRODUITS */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 p-6 text-white shadow-xl">
          {/* Cercles décoratifs */}
          <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-xl" />
          <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-indigo-400/20 blur-lg" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                  🧩 Catalogue Produits
                </span>
                <p className="mt-3 text-4xl font-extrabold tracking-tight leading-none">{productsCount}</p>
                <p className="mt-1 text-sm text-brand-200 font-medium">produits actifs dans 10 branches</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[11px] text-brand-200 uppercase font-semibold tracking-wide">Mes liens activés</p>
                <p className="text-3xl font-extrabold">{myLinksCount}</p>
              </div>
            </div>
            <p className="text-xs text-brand-200 leading-relaxed mb-5">
              Logiciels SaaS · Formations certifiantes · Immobilier · Digital · Services — jusqu'à <strong className="text-white">20 % de commission</strong> par vente.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/espace/produits"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-extrabold text-brand-700 shadow-lg hover:bg-brand-50 transition-all hover:-translate-y-0.5"
              >
                🚀 Activer des produits
              </Link>
              <Link
                href="/espace/liens"
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2.5 text-sm font-semibold text-white transition"
              >
                Mes liens →
              </Link>
            </div>
          </div>
        </div>

        {/* MISSIONS */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-700 p-6 text-white shadow-xl">
          <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-xl" />
          <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-rose-300/20 blur-lg" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                  🎯 Missions disponibles
                </span>
                <p className="mt-3 text-4xl font-extrabold tracking-tight leading-none">{missionsCount}</p>
                <p className="mt-1 text-sm text-amber-100 font-medium">missions actives en ce moment</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[11px] text-amber-200 uppercase font-semibold tracking-wide">Mes candidatures</p>
                <p className="text-3xl font-extrabold">{myMissionsCount}</p>
              </div>
            </div>
            <p className="text-xs text-amber-100 leading-relaxed mb-5">
              Prospection · Démonstrations · Événements · Recrutement — rémunérées en <strong className="text-white">cash, CP ou % de vente</strong>.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/espace/missions"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-extrabold text-orange-700 shadow-lg hover:bg-orange-50 transition-all hover:-translate-y-0.5"
              >
                ⚡ Voir les missions
              </Link>
              <Link
                href="/catalogue"
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2.5 text-sm font-semibold text-white transition"
              >
                Catalogue →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Phase 8 : CP Wallet + Niveau + Score ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {/* CP Balance */}
        <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-4 text-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-200">Crédits PARTNERS</p>
            <Link href="/espace/portefeuille" className="text-[10px] text-violet-200 hover:text-white underline">Détails →</Link>
          </div>
          <p className="text-3xl font-extrabold">{cpData.balance}</p>
          <p className="text-xs text-violet-300 mt-0.5">CP disponibles</p>
          <div className="mt-3 flex gap-3 text-[11px]">
            <span className="text-violet-200">↑ {cpData.earned} gagnés</span>
            <span className="text-violet-300">↓ {cpData.spent} dépensés</span>
          </div>
          <Link href="/espace/boutique" className="mt-3 inline-flex items-center gap-1 rounded-lg bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-semibold text-white transition">
            🛍️ Boutique avantages
          </Link>
        </div>

        {/* Niveau partenaire */}
        {levelData ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Mon niveau</p>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-full shrink-0" style={{ backgroundColor: levelData.currentLevel.color }} />
              <div>
                <p className="font-bold text-slate-800 text-sm">{levelData.currentLevel.label}</p>
                <p className="text-[10px] text-slate-400 font-mono">{levelData.currentLevel.name}</p>
              </div>
            </div>
            {levelData.nextLevel ? (
              <>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 mb-1">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${levelData.pctToNext}%`, backgroundColor: levelData.currentLevel.color }} />
                </div>
                <p className="text-[11px] text-slate-500">
                  {levelData.nextLevel.minCp - levelData.cpEarned} CP pour atteindre <strong>{levelData.nextLevel.label}</strong>
                </p>
              </>
            ) : (
              <p className="text-xs text-emerald-600 font-semibold">👑 Niveau maximum atteint !</p>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 flex items-center justify-center">
            <p className="text-xs text-slate-400 text-center">Niveaux non configurés</p>
          </div>
        )}

        {/* Score de performance */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Score de performance</p>
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-16 shrink-0">
              <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke={perfScore >= 80 ? "#10b981" : perfScore >= 50 ? "#3b82f6" : "#f59e0b"} strokeWidth="3"
                  strokeDasharray={`${perfScore} ${100 - perfScore}`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-slate-800">{perfScore}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {perfScore >= 80 ? "Excellent" : perfScore >= 60 ? "Bon" : perfScore >= 40 ? "Correct" : "À améliorer"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">{summary.confirmedSales} vente{summary.confirmedSales !== 1 ? "s" : ""} · {counts.reduce((a, b) => a + b, 0)} filleuls · {cpData.balance} CP</p>
              <Link href="/espace/analytics" className="mt-1.5 inline-block text-[10px] text-blue-600 hover:underline">Voir analytics →</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Temps réel : ventes du jour + objectif mois + rang ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {/* Ventes aujourd'hui */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-2xl">🔥</div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Aujourd'hui</p>
            <p className="text-2xl font-extrabold text-slate-900">{salesToday}</p>
            <p className="text-xs text-slate-400">vente{salesToday !== 1 ? "s" : ""} confirmée{salesToday !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Objectif du mois */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Objectif du mois</p>
            </div>
            <span className="text-xs font-bold text-slate-600">{salesThisMonth}/{monthlyTarget}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-2.5 rounded-full transition-all ${salesThisMonth >= monthlyTarget ? "bg-emerald-500" : "bg-blue-500"}`}
              style={{ width: `${Math.min(100, Math.round((salesThisMonth / monthlyTarget) * 100))}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            {salesThisMonth >= monthlyTarget
              ? "✅ Objectif atteint — dépassez-le !"
              : `${monthlyTarget - salesThisMonth} vente${monthlyTarget - salesThisMonth > 1 ? "s" : ""} pour atteindre l'objectif`}
          </p>
        </div>

        {/* Rang dans le réseau */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
            {myRank.rank === 1 ? "🏆" : myRank.rank <= 3 ? "🥈" : "📊"}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Mon rang</p>
            <p className="text-2xl font-extrabold text-slate-900">#{myRank.rank}</p>
            <p className="text-xs text-slate-400">sur {myRank.total} actifs</p>
          </div>
        </div>
      </div>

      {/* ── Prospects urgents (rappels dus) ── */}
      {prospectsUrgent.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">⏰</span>
              <h2 className="text-sm font-semibold text-amber-900">
                {prospectsUrgent.length} prospect{prospectsUrgent.length > 1 ? "s" : ""} à relancer maintenant
              </h2>
            </div>
            <Link href="/espace/prospects" className="text-xs font-semibold text-amber-700 hover:underline">
              Voir tous →
            </Link>
          </div>
          <div className="space-y-2">
            {prospectsUrgent.map((p) => (
              <Link
                key={p.id}
                href="/espace/prospects"
                className="flex items-center justify-between rounded-xl bg-white border border-amber-100 px-3 py-2 hover:bg-amber-100/50 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">👤</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                    {p.contact && <p className="text-xs text-slate-500">{p.contact}</p>}
                  </div>
                </div>
                <span className="text-xs font-semibold text-rose-600">
                  {p.reminderAt && new Date(p.reminderAt) < new Date(todayStart)
                    ? `En retard de ${Math.floor((Date.now() - new Date(p.reminderAt).getTime()) / 86400000)}j`
                    : "Aujourd'hui"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Progression statut + Réseau ── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Progression statut */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 text-sm">Progression de statut</h2>
            <span className="text-xs text-slate-400">{prog.label.split("→")[0]?.trim()}</span>
          </div>

          {/* Étapes visuelles */}
          <div className="flex items-center gap-0 mb-4">
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStatusIndex;
              const current = i === currentStatusIndex;
              return (
                <div key={step.key} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-base font-bold transition-all ${
                      current
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200 ring-4 ring-blue-100"
                        : done
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}>
                      {step.icon}
                    </div>
                    <span className={`mt-1 text-[10px] font-semibold ${
                      current ? "text-blue-600" : done ? "text-emerald-600" : "text-slate-400"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-1 rounded-full ${i < currentStatusIndex ? "bg-emerald-400" : "bg-slate-100"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Barre de progression */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700"
              style={{ width: `${prog.progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">{prog.label}</p>

          {/* Mini stats réseau */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {["N1", "N2", "N3"].map((lbl, i) => (
              <div key={lbl} className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                <p className="text-xs text-slate-400 font-medium">{lbl}</p>
                <p className="text-xl font-bold text-slate-800 mt-0.5">{counts[i]}</p>
                <p className="text-[10px] text-slate-400">filleul{counts[i] !== 1 ? "s" : ""}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Carte réseau */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-md p-5 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -bottom-4 -right-4 h-28 w-28 rounded-full bg-white/10 blur-sm" />
          <div>
            <h2 className="font-semibold text-sm text-white/90 mb-1">Mon réseau total</h2>
            <p className="text-4xl font-extrabold tracking-tight">{counts.reduce((a, b) => a + b, 0)}</p>
            <p className="text-xs text-blue-200 mb-5">filleuls sur 3 niveaux</p>
            <div className="space-y-2.5">
              {[
                { label: "🥇 Niveau 1 (taux plein)", val: counts[0] },
                { label: "🥈 Niveau 2 (50 % du taux)", val: counts[1] },
                { label: "🥉 Niveau 3 (25 % du taux)", val: counts[2] },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-blue-100 text-xs">{label}</span>
                  <span className="font-bold text-white">{val}</span>
                </div>
              ))}
            </div>
          </div>
          <Link
            href="/espace/reseau"
            className="mt-5 inline-flex items-center justify-center gap-1 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2 text-xs font-semibold text-white transition"
          >
            Voir mon réseau →
          </Link>
        </div>
      </div>

      {/* ── Analytics charts ── */}
      <DashboardCharts sales={salePoints} commissions={commPoints} />

      {/* ── Onboarding + Défi semaine ── */}
      <OnboardingQuest doneSteps={onboardingDone} />
      <WeeklyChallenge currentSales={weekSales} />

      {/* ── Commissions récentes ── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <h2 className="font-semibold text-slate-800 text-sm">Commissions récentes</h2>
          <Link
            href="/espace/commissions"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
          >
            Tout voir →
          </Link>
        </div>
        {recentCommissions.length === 0 ? (
          <div className="px-5 pb-6 pt-4">
            <EmptyState>Aucune commission pour le moment. Partagez vos liens d'affiliation pour commencer !</EmptyState>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wide">Produit</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Niv.</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Taux</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Montant</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Statut</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentCommissions.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {c.sale.product.name}
                      {c.sale.pricingType === "MONTHLY_SUB" && (
                        <span className="text-slate-400 text-xs"> · Mois {c.monthIndex}</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {c.level}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-400">{pct(c.rate)}</td>
                    <td className="px-3 py-3 font-bold text-slate-800">{fcfa(c.amount)}</td>
                    <td className="px-3 py-3">
                      <Badge tone={statusTone(c.status)}>{COMMISSION_STATUS_LABELS[c.status]}</Badge>
                    </td>
                    <td className="px-3 py-3 text-slate-400 text-xs">{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

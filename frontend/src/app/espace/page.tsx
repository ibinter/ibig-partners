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

  const [recentCommissions, chartSales, chartComms] = await Promise.all([
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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

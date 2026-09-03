import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa } from "@/lib/format";
import { STATUS_RULES, STATUS_LABELS } from "@/lib/constants";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_ORDER = ["STARTER", "SILVER", "GOLD", "MASTER", "ELITE"] as const;

interface Challenge {
  id: string;
  icon: string;
  title: string;
  description: string;
  current: number;
  target: number;
  unit: string;
  reward: string;
  color: string;
}

export default async function ChallengesPage() {
  const user = await requireUser();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysInMonth = (monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24);
  const daysLeft = Math.ceil((monthEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const monthLabel = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  // Targets selon statut
  const MONTHLY_SALES_TARGET: Record<string, number> = {
    STARTER: 3, SILVER: 5, GOLD: 8, MASTER: 12, ELITE: 20,
  };
  const MONTHLY_COMMISSIONS_TARGET: Record<string, number> = {
    STARTER: 10000, SILVER: 25000, GOLD: 50000, MASTER: 100000, ELITE: 200000,
  };
  const salesTarget = MONTHLY_SALES_TARGET[user.status] ?? 3;
  const commTarget  = MONTHLY_COMMISSIONS_TARGET[user.status] ?? 10000;

  const [monthlySales, monthlyReferrals, monthlyCommAgg, totalSales, totalReferrals, totalActive] = await Promise.all([
    prisma.sale.count({ where: { sellerId: user.id, status: "CONFIRMED", createdAt: { gte: monthStart, lt: monthEnd } } }),
    prisma.user.count({ where: { sponsorId: user.id, createdAt: { gte: monthStart, lt: monthEnd } } }),
    prisma.commission.aggregate({
      where: { userId: user.id, status: { in: ["VALIDATED", "PAID"] }, createdAt: { gte: monthStart, lt: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.sale.count({ where: { sellerId: user.id, status: "CONFIRMED" } }),
    prisma.user.count({ where: { sponsorId: user.id } }),
    prisma.user.count({ where: { sponsorId: user.id, sales: { some: { status: "CONFIRMED" } } } }),
  ]);

  const monthlyComm = monthlyCommAgg._sum.amount ?? 0;

  // Progression vers prochain statut
  const statusIdx = STATUS_ORDER.indexOf(user.status as typeof STATUS_ORDER[number]);
  const nextStatus = statusIdx < STATUS_ORDER.length - 1 ? STATUS_ORDER[statusIdx + 1] : null;
  const nextRules = nextStatus
    ? (STATUS_RULES as Record<string, { sales: number; directReferrals?: number; activeTeam?: number }>)[nextStatus]
    : null;

  const salesPct  = nextRules ? Math.min(100, Math.round((totalSales / nextRules.sales) * 100)) : 100;
  const refPct    = nextRules?.directReferrals ? Math.min(100, Math.round((totalReferrals / nextRules.directReferrals) * 100)) : 100;
  const teamPct   = nextRules?.activeTeam ? Math.min(100, Math.round((totalActive / nextRules.activeTeam) * 100)) : 100;
  const statusPct = nextRules ? Math.min(100, Math.round((salesPct + refPct + teamPct) / 3)) : 100;

  const challenges: Challenge[] = [
    {
      id: "monthly-sales",
      icon: "💼",
      title: `${salesTarget} ventes ce mois`,
      description: `Confirmez ${salesTarget} ventes avant la fin du mois et débloquez un badge mensuel spécial.`,
      current: monthlySales,
      target: salesTarget,
      unit: "ventes",
      reward: "Badge Vendeur du mois",
      color: "blue",
    },
    {
      id: "monthly-recruit",
      icon: "👥",
      title: "Recruter 1 filleul",
      description: "Invitez au moins 1 nouveau partenaire à rejoindre votre réseau ce mois-ci.",
      current: monthlyReferrals,
      target: 1,
      unit: "filleul",
      reward: "Badge Recruteur actif",
      color: "violet",
    },
    {
      id: "monthly-commissions",
      icon: "💰",
      title: `${fcfa(commTarget)} validés`,
      description: `Accumulez ${fcfa(commTarget)} de commissions validées ce mois pour atteindre cet objectif.`,
      current: monthlyComm,
      target: commTarget,
      unit: "FCFA",
      reward: "Badge Performeur mensuel",
      color: "emerald",
    },
    {
      id: "status-progress",
      icon: "🚀",
      title: nextStatus ? `50% vers ${STATUS_LABELS[nextStatus]}` : "Statut Elite atteint !",
      description: nextStatus
        ? `Progressez à 50% ou plus sur tous les critères du statut ${STATUS_LABELS[nextStatus]}.`
        : "Vous avez atteint le statut maximum. Félicitations !",
      current: statusPct,
      target: 50,
      unit: "%",
      reward: "Badge Ambitieux",
      color: "amber",
    },
  ];

  const COLOR: Record<string, { bar: string; bg: string; border: string; text: string; badge: string }> = {
    blue:    { bar: "from-blue-400 to-blue-600",    bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700",    badge: "bg-blue-100 text-blue-700" },
    violet:  { bar: "from-violet-400 to-purple-600",bg: "bg-violet-50",  border: "border-violet-200",  text: "text-violet-700",  badge: "bg-violet-100 text-violet-700" },
    emerald: { bar: "from-emerald-400 to-teal-600", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" },
    amber:   { bar: "from-amber-400 to-orange-500", bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-100 text-amber-700" },
  };

  const completedCount = challenges.filter((c) => c.current >= c.target).length;

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 capitalize">Challenges — {monthLabel}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {daysLeft} jour{daysLeft !== 1 ? "s" : ""} restant{daysLeft !== 1 ? "s" : ""} · {completedCount}/{challenges.length} accomplis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/espace/badges"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            🏅 Mes badges
          </Link>
          <Link href="/espace/objectifs"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            🎯 Mes objectifs
          </Link>
        </div>
      </div>

      {/* Score global du mois */}
      <div className="rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-orange-500 to-pink-600 px-5 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-100">Score mensuel</p>
              <p className="text-3xl font-extrabold mt-1">{completedCount} / {challenges.length}</p>
              <p className="text-sm text-orange-100 mt-0.5">challenges accomplis</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black">{Math.round((completedCount / challenges.length) * 100)}%</p>
              <p className="text-xs text-orange-200">complétion</p>
            </div>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-700"
              style={{ width: `${Math.round((completedCount / challenges.length) * 100)}%` }}
            />
          </div>
        </div>
        {/* Days remaining bar */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Avancement du mois</span>
            <span className="font-semibold text-slate-700">{daysLeft}j restants sur {daysInMonth}j</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-slate-400 to-slate-600 transition-all"
              style={{ width: `${Math.round(((daysInMonth - daysLeft) / daysInMonth) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grille des challenges */}
      <div className="grid gap-4 sm:grid-cols-2">
        {challenges.map((c) => {
          const cl = COLOR[c.color];
          const done = c.current >= c.target;
          const pct  = Math.min(100, Math.round((c.current / c.target) * 100));
          const displayCurrent = c.unit === "FCFA" ? fcfa(c.current) : c.current;
          const displayTarget  = c.unit === "FCFA" ? fcfa(c.target)  : c.target;

          return (
            <div
              key={c.id}
              className={`relative overflow-hidden rounded-2xl border shadow-sm p-5 transition-all ${
                done
                  ? `${cl.bg} ${cl.border} ring-1 ring-offset-0 ring-current`
                  : "bg-white border-slate-100"
              }`}
            >
              {done && (
                <div className="absolute top-3 right-3 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  ✅ ACCOMPLI
                </div>
              )}
              <div className="flex items-start gap-3 mb-4">
                <span className={`text-3xl ${done ? "" : "grayscale opacity-70"}`}>{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-sm ${done ? cl.text : "text-slate-800"}`}>{c.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{c.description}</p>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Progression</span>
                  <span className={`font-bold tabular-nums ${done ? cl.text : "text-slate-700"}`}>
                    {displayCurrent} / {displayTarget} {c.unit !== "FCFA" ? c.unit : ""}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ${
                      done ? "from-emerald-400 to-emerald-600" : cl.bar
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{pct}%</span>
                  <span className={`font-semibold ${cl.badge} px-2 py-0.5 rounded-full`}>🎁 {c.reward}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Statut auto-promotion notice */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">⚡ Promotion automatique de statut</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          Votre statut est promu <strong>automatiquement</strong> dès que vous remplissez tous les critères du palier suivant.
          Vous recevrez une notification immédiate et les nouveaux taux de commission s&apos;appliqueront sans délai.
        </p>
        {nextStatus && nextRules && (
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Ventes confirmées", current: totalSales, target: nextRules.sales, unit: "" },
              ...(nextRules.directReferrals ? [{ label: "Filleuls directs", current: totalReferrals, target: nextRules.directReferrals, unit: "" }] : []),
              ...(nextRules.activeTeam ? [{ label: "Équipe active", current: totalActive, target: nextRules.activeTeam, unit: "" }] : []),
            ].map((item) => {
              const p = Math.min(100, Math.round((item.current / item.target) * 100));
              return (
                <div key={item.label} className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{item.label}</p>
                  <p className="text-lg font-extrabold text-slate-800 tabular-nums">{item.current} <span className="text-sm text-slate-400 font-normal">/ {item.target}</span></p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all"
                      style={{ width: `${p}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!nextStatus && (
          <p className="text-sm font-bold text-emerald-600">🏆 Vous avez atteint le statut maximum — Elite Représentant !</p>
        )}
      </div>
    </div>
  );
}

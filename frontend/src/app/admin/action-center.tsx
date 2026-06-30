import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fcfa, formatDate } from "@/lib/format";

/**
 * Centre d'actions prioritaires pour le SuperAdmin.
 * Affiche en haut du dashboard :
 *  - 4 alertes critiques (cliquables) avec badges
 *  - 4 KPIs avancés (activation J+7, churn, MRR projeté, conversion landing)
 *  - Flux d'activité temps réel (10 derniers événements importants)
 */
export async function AdminActionCenter() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // ─── Alertes ───────────────────────────────────────────────
  const [pendingApprovals, pendingKyc, paymentsToProcess, openTickets] = await Promise.all([
    prisma.user.count({ where: { role: "PARTNER", approved: false } }),
    prisma.verificationRequest?.count({ where: { status: "PENDING" } }).catch(() => 0) ?? 0,
    prisma.payout.count({ where: { status: "PENDING" } }).catch(() => 0),
    prisma.ticket.count({ where: { status: "OPEN" } }).catch(() => 0),
  ]);

  // ─── KPIs avancés ─────────────────────────────────────────
  const [
    totalPartnersLast30,
    activatedLast30,
    salesLast30,
    churnedLast30,
    confirmedRecurring,
    visitsLast30,
    signupsLast30,
  ] = await Promise.all([
    prisma.user.count({
      where: { role: "PARTNER", createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.user.count({
      where: {
        role: "PARTNER",
        createdAt: { gte: thirtyDaysAgo },
        links: { some: {} },
      },
    }),
    prisma.sale.count({
      where: { status: "CONFIRMED", createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.user.count({
      where: {
        role: "PARTNER",
        active: false,
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.sale.aggregate({
      _sum: { amount: true },
      where: {
        status: "CONFIRMED",
        product: { pricingType: "MONTHLY_SUB" },
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.click?.count({ where: { createdAt: { gte: thirtyDaysAgo } } }).catch(() => 0) ?? 0,
    prisma.user.count({
      where: { role: "PARTNER", createdAt: { gte: thirtyDaysAgo } },
    }),
  ]);

  const activationRate =
    totalPartnersLast30 > 0 ? Math.round((activatedLast30 / totalPartnersLast30) * 100) : 0;
  const churnRate =
    totalPartnersLast30 > 0 ? Math.round((churnedLast30 / Math.max(totalPartnersLast30, 1)) * 100) : 0;
  const mrrEstimate = (confirmedRecurring._sum.amount ?? 0); // proxy : monthly subs ce mois
  const conversionRate =
    visitsLast30 > 0 ? Math.round((signupsLast30 / visitsLast30) * 1000) / 10 : 0;

  // ─── Activité récente ─────────────────────────────────────
  const [recentUsers, recentSales, recentPayouts] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PARTNER" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, firstName: true, lastName: true, code: true, createdAt: true, approved: true },
    }),
    prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { product: { select: { name: true } }, seller: { select: { firstName: true, lastName: true } } },
    }),
    prisma.payout
      .findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { user: { select: { firstName: true, lastName: true } } },
      })
      .catch(() => []),
  ]);

  type Activity = {
    type: "user" | "sale" | "payout";
    icon: string;
    color: string;
    title: string;
    sub: string;
    date: Date;
  };
  const activities: Activity[] = [
    ...recentUsers.map((u) => ({
      type: "user" as const,
      icon: "🆕",
      color: "from-emerald-500 to-teal-600",
      title: `${u.firstName} ${u.lastName} s'est inscrit`,
      sub: `${u.code} · ${u.approved ? "approuvé" : "en attente"}`,
      date: u.createdAt,
    })),
    ...recentSales.map((s) => ({
      type: "sale" as const,
      icon: "💰",
      color: "from-amber-500 to-orange-600",
      title: `Vente : ${s.product.name}`,
      sub: `${s.seller.firstName} ${s.seller.lastName} · ${fcfa(s.amount)}`,
      date: s.createdAt,
    })),
    ...recentPayouts.map((p) => ({
      type: "payout" as const,
      icon: "💸",
      color: "from-violet-500 to-purple-700",
      title: `Paiement ${p.status.toLowerCase()}`,
      sub: `${p.user.firstName} ${p.user.lastName} · ${fcfa(p.amount)}`,
      date: p.createdAt,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

  const alerts = [
    {
      icon: "✋",
      label: "Approbations en attente",
      count: pendingApprovals,
      href: "/admin/partenaires?filter=pending",
      color: pendingApprovals > 0 ? "from-amber-400 to-orange-500" : "from-slate-300 to-slate-400",
      critical: pendingApprovals > 5,
    },
    {
      icon: "🔐",
      label: "KYC à vérifier",
      count: pendingKyc,
      href: "/admin/verifications",
      color: pendingKyc > 0 ? "from-rose-400 to-pink-600" : "from-slate-300 to-slate-400",
      critical: pendingKyc > 3,
    },
    {
      icon: "💸",
      label: "Paiements à traiter",
      count: paymentsToProcess,
      href: "/admin/paiements",
      color: paymentsToProcess > 0 ? "from-violet-400 to-purple-600" : "from-slate-300 to-slate-400",
      critical: paymentsToProcess > 10,
    },
    {
      icon: "🎫",
      label: "Tickets ouverts",
      count: openTickets,
      href: "/admin/tickets",
      color: openTickets > 0 ? "from-sky-400 to-blue-600" : "from-slate-300 to-slate-400",
      critical: openTickets > 5,
    },
  ];

  return (
    <div data-testid="admin-action-center" className="mb-6 space-y-4">
      {/* Bandeau alertes prioritaires */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            🚨 Centre d&apos;actions prioritaires
          </h2>
          <span className="text-xs text-muted">Mis à jour à l&apos;instant · 30 derniers jours</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {alerts.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="card-premium relative overflow-hidden p-4 hover:-translate-y-0.5 transition-all"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${a.color}`} />
              {a.critical && (
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                </span>
              )}
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${a.color} text-white text-xl shadow-md`}
                >
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{a.label}</p>
                  <p className="text-numeral text-2xl text-ink mt-0.5">{a.count}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* KPIs avancés */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            📊 KPIs avancés
          </h2>
          <span className="text-xs text-muted">Glissant 30 jours</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MiniKpi
            icon="🚀"
            label="Taux d'activation"
            value={`${activationRate}%`}
            sub={`${activatedLast30}/${totalPartnersLast30} ont créé un lien`}
            tone={activationRate >= 50 ? "good" : activationRate >= 25 ? "warn" : "bad"}
          />
          <MiniKpi
            icon="📉"
            label="Taux de churn"
            value={`${churnRate}%`}
            sub={`${churnedLast30} désactivés ce mois`}
            tone={churnRate <= 5 ? "good" : churnRate <= 15 ? "warn" : "bad"}
          />
          <MiniKpi
            icon="💎"
            label="MRR estimé"
            value={fcfa(mrrEstimate)}
            sub={`Abonnements mensuels actifs`}
            tone="good"
          />
          <MiniKpi
            icon="🎯"
            label="Ventes 30j"
            value={salesLast30.toString()}
            sub={salesLast30 > 0 ? `${conversionRate}% conv. visite→inscription` : "Aucune vente ce mois"}
            tone={salesLast30 > 10 ? "good" : "warn"}
          />
        </div>
      </div>

      {/* Flux d'activité temps réel */}
      <div className="card-premium overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              📡 Activité en temps réel
            </h2>
          </div>
          <span className="text-xs text-muted">Les 10 derniers événements</span>
        </div>

        <div className="divide-y divide-slate-100">
          {activities.length === 0 && (
            <div className="p-8 text-center text-sm text-muted">
              Aucune activité récente.
            </div>
          )}
          {activities.map((a, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/50 transition-colors">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${a.color} text-white shadow-sm text-base`}>
                {a.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink truncate">{a.title}</p>
                <p className="text-xs text-muted truncate">{a.sub}</p>
              </div>
              <span className="text-xs text-muted shrink-0">{formatDate(a.date)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniKpi({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: string;
  label: string;
  value: string;
  sub: string;
  tone: "good" | "warn" | "bad";
}) {
  const toneClasses = {
    good: "border-l-emerald-500 bg-gradient-to-br from-emerald-50/40 to-white",
    warn: "border-l-amber-500 bg-gradient-to-br from-amber-50/40 to-white",
    bad: "border-l-rose-500 bg-gradient-to-br from-rose-50/40 to-white",
  }[tone];
  return (
    <div className={`card-premium border-l-4 ${toneClasses} p-4`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide truncate">
          {label}
        </span>
      </div>
      <p className="text-numeral text-2xl text-ink">{value}</p>
      <p className="text-xs text-muted mt-0.5 truncate">{sub}</p>
    </div>
  );
}

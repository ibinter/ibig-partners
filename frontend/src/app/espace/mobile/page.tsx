/**
 * Feature 7 — Tableau de bord mobile-first condensé /espace/mobile
 * Vue ultra-compacte optimisée pour les petits écrans.
 */
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { partnerSummary } from "@/lib/metrics";
import { fcfa } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const STATUS_EMOJI: Record<string, string> = {
  STARTER: "🌱", SILVER: "🥈", GOLD: "🥇", MASTER: "💎", ELITE: "👑",
};

export default async function MobileDashboardPage() {
  const user = await requireUser();
  const summary = await partnerSummary(user.id);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date();
  monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

  const [salesToday, salesMonth, lastComm, urgentProspects, unreadNotif] = await Promise.all([
    prisma.sale.count({ where: { sellerId: user.id, status: "CONFIRMED", createdAt: { gte: todayStart } } }),
    prisma.sale.count({ where: { sellerId: user.id, status: "CONFIRMED", createdAt: { gte: monthStart } } }),
    prisma.commission.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { sale: { include: { product: { select: { name: true } } } } },
    }),
    prisma.prospect.count({
      where: { userId: user.id, reminderAt: { lte: new Date() }, status: { notIn: ["CONVERTED", "LOST"] } },
    }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
  ]);

  const emoji = STATUS_EMOJI[user.status] ?? "🌱";

  const ACTIONS = [
    { href: "/espace/ventes",      icon: "📝", label: "Déclarer vente",   color: "bg-emerald-500" },
    { href: "/espace/liens",       icon: "🔗", label: "Mes liens",         color: "bg-blue-500" },
    { href: "/espace/prospects",   icon: "👤", label: "Prospects",         color: "bg-violet-500" },
    { href: "/espace/paiements",   icon: "💸", label: "Retrait",           color: "bg-amber-500" },
    { href: "/espace/produits",    icon: "🧩", label: "Produits",          color: "bg-cyan-500" },
    { href: "/espace/commissions", icon: "💰", label: "Commissions",       color: "bg-indigo-500" },
    { href: "/espace/academie",    icon: "🎓", label: "Académie",          color: "bg-pink-500" },
    { href: "/espace/reseau",      icon: "🌳", label: "Réseau",            color: "bg-teal-500" },
    { href: "/espace/notifications", icon: "🔔", label: `Notifs${unreadNotif > 0 ? ` (${unreadNotif})` : ""}`, color: unreadNotif > 0 ? "bg-rose-500" : "bg-slate-500" },
    { href: "/espace",             icon: "🏠", label: "Dashboard",         color: "bg-slate-600" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-8">

      {/* Header identité */}
      <div className="px-4 pt-6 pb-4 bg-gradient-to-br from-blue-800 to-blue-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-300 font-semibold uppercase tracking-wide">IBIG PARTNERS</p>
            <h1 className="text-lg font-extrabold mt-0.5">{user.firstName} {user.lastName}</h1>
            <p className="text-xs text-blue-300 mt-0.5">{emoji} {STATUS_LABELS[user.status]} · {user.code}</p>
          </div>
          <Link href="/espace" className="rounded-xl bg-white/10 hover:bg-white/20 px-3 py-2 text-xs font-semibold transition">
            Vue complète →
          </Link>
        </div>
      </div>

      <div className="px-4 space-y-4 mt-4">

        {/* KPIs principaux */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-800 border border-slate-700 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ventes aujourd'hui</p>
            <p className="text-3xl font-extrabold text-white mt-1">{salesToday}</p>
          </div>
          <div className="rounded-2xl bg-slate-800 border border-slate-700 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ce mois</p>
            <p className="text-3xl font-extrabold text-emerald-400 mt-1">{salesMonth}</p>
          </div>
          <div className="rounded-2xl bg-slate-800 border border-slate-700 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Commissions dues</p>
            <p className="text-xl font-extrabold text-amber-400 mt-1">{fcfa(summary.payable)}</p>
          </div>
          <div className="rounded-2xl bg-slate-800 border border-slate-700 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Réseau total</p>
            <p className="text-3xl font-extrabold text-blue-300 mt-1">{summary.network.length}</p>
          </div>
        </div>

        {/* Alertes */}
        {urgentProspects > 0 && (
          <Link href="/espace/prospects" className="flex items-center gap-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 px-4 py-3">
            <span className="text-2xl">⏰</span>
            <div>
              <p className="text-sm font-bold text-amber-300">{urgentProspects} prospect{urgentProspects > 1 ? "s" : ""} à relancer</p>
              <p className="text-xs text-amber-400/70">Appuyez pour voir →</p>
            </div>
          </Link>
        )}

        {/* Dernière commission */}
        {lastComm && (
          <div className="rounded-2xl bg-slate-800 border border-slate-700 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Dernière commission</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{lastComm.sale.product.name}</p>
                <p className="text-xs text-slate-400">Niv. {lastComm.level} · {lastComm.status}</p>
              </div>
              <p className="text-lg font-extrabold text-emerald-400">{fcfa(lastComm.amount)}</p>
            </div>
          </div>
        )}

        {/* Actions rapides */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Actions rapides</p>
          <div className="grid grid-cols-5 gap-2">
            {ACTIONS.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex flex-col items-center gap-1 rounded-2xl p-2.5 transition-opacity hover:opacity-80"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.color} text-xl shadow-sm`}>
                  {a.icon}
                </div>
                <span className="text-[9px] font-semibold text-slate-300 text-center leading-tight">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { fcfa } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PortefeuilleePage() {
  const user = await requireUser();

  const [
    oppStats,
    needStats,
    needRespStats,
    commStats,
  ] = await Promise.all([
    // Opportunités soumises par le partner
    (prisma as any).opportunity.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: { status: true },
    }),
    // Besoins soumis
    (prisma as any).need.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: { status: true },
    }),
    // Réponses données aux besoins du réseau
    (prisma as any).needResponse.count({ where: { userId: user.id } }),
    // Commissions (depuis ventes produits IBIG)
    prisma.commission.aggregate({
      where: { userId: user.id },
      _sum: { amount: true },
      _count: { id: true },
    }),
  ]);

  // Parse opportunités stats
  const oppByStatus = Object.fromEntries(
    oppStats.map((s: any) => [s.status, s._count.status])
  );
  const totalOpp      = Object.values(oppByStatus).reduce((a: number, b) => a + (b as number), 0);
  const approvedOpp   = (oppByStatus["APPROVED"] ?? 0) + (oppByStatus["IN_PROGRESS"] ?? 0) + (oppByStatus["WON"] ?? 0);
  const wonOpp        = oppByStatus["WON"] ?? 0;
  const convRateOpp   = totalOpp > 0 ? Math.round((wonOpp / totalOpp) * 100) : 0;

  // Parse besoins stats
  const needByStatus  = Object.fromEntries(
    needStats.map((s: any) => [s.status, s._count.status])
  );
  const totalNeeds    = Object.values(needByStatus).reduce((a: number, b) => a + (b as number), 0);
  const fulfilledNeeds = needByStatus["FULFILLED"] ?? 0;

  // Commissions
  const totalCommAmount = commStats._sum.amount ?? 0;
  const totalCommCount  = commStats._count.id ?? 0;

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Mon Portefeuille"
        subtitle="Vos performances sur la plateforme IBIG PARTNERS — opportunités, besoins, connexions et commissions."
      />

      {/* KPIs Opportunités */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Opportunités B2B</h2>
          <Link href="/espace/opportunites" className="text-xs font-semibold text-brand-600 hover:underline">Voir →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Soumises" value={totalOpp} color="slate" />
          <StatCard label="Approuvées / En cours" value={approvedOpp} color="blue" />
          <StatCard label="Conclues (WON)" value={wonOpp} color="emerald" />
          <StatCard label="Taux de conversion" value={`${convRateOpp}%`} color={convRateOpp >= 30 ? "emerald" : "amber"} />
        </div>
      </section>

      {/* KPIs Besoins */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Mes Besoins</h2>
          <Link href="/espace/besoins" className="text-xs font-semibold text-brand-600 hover:underline">Voir →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Besoins soumis" value={totalNeeds} color="slate" />
          <StatCard label="Besoins comblés" value={fulfilledNeeds} color="emerald" />
          <StatCard label="Réponses données au réseau" value={needRespStats} color="blue" />
        </div>
      </section>

      {/* Commissions IBIG */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Commissions produits IBIG</h2>
          <Link href="/espace/commissions" className="text-xs font-semibold text-brand-600 hover:underline">Voir →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
          <StatCard label="Total généré" value={fcfa(totalCommAmount)} color="amber" big />
          <StatCard label="Nombre de commissions" value={totalCommCount} color="slate" />
        </div>
      </section>

      {/* Liens rapides */}
      <section>
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Accès rapides</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: "/espace/opportunites", icon: "💼", label: "Mes Opportunités" },
            { href: "/espace/besoins",      icon: "🔍", label: "Mes Besoins" },
            { href: "/espace/missions",     icon: "🎯", label: "Missions" },
            { href: "/espace/commissions",  icon: "💰", label: "Commissions" },
            { href: "/espace/reseau",       icon: "🌳", label: "Mon Réseau" },
            { href: "/espace/prospects",    icon: "📇", label: "Mes Prospects" },
          ].map(l => (
            <Link key={l.href} href={l.href}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 hover:border-brand-200 hover:shadow-sm transition-all">
              <span className="text-xl">{l.icon}</span>
              <span className="text-sm font-semibold text-slate-700">{l.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label, value, color, big,
}: {
  label: string;
  value: string | number;
  color: "slate" | "blue" | "emerald" | "amber" | "rose";
  big?: boolean;
}) {
  const colors = {
    slate:   "text-slate-800",
    blue:    "text-blue-700",
    emerald: "text-emerald-700",
    amber:   "text-amber-700",
    rose:    "text-rose-700",
  };
  const bgs = {
    slate:   "bg-white border-slate-100",
    blue:    "bg-blue-50 border-blue-100",
    emerald: "bg-emerald-50 border-emerald-100",
    amber:   "bg-amber-50 border-amber-100",
    rose:    "bg-rose-50 border-rose-100",
  };
  return (
    <div className={`rounded-2xl border p-4 ${bgs[color]}`}>
      <p className={`${big ? "text-2xl" : "text-3xl"} font-extrabold font-variant-numeric-tabular ${colors[color]}`} style={{ fontVariantNumeric: "tabular-nums" }}>
        {value}
      </p>
      <p className="text-xs text-slate-500 mt-1 leading-snug">{label}</p>
    </div>
  );
}

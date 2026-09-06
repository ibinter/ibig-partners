import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { fcfa, formatDate } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

const SHARE_ROLE_LABELS: Record<string, string> = {
  APPORTEUR_OPPORTUNITE: "Apporteur opportunité",
  APPORTEUR_CLIENT:      "Apporteur client",
  FACILITATEUR:          "Facilitateur",
  COORDINATEUR_IBIG:     "Coordinateur IBIG",
  PARTENAIRE:            "Partenaire",
  AUTRE:                 "Autre",
};

const SHARE_STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PAID:      "bg-emerald-100 text-emerald-700",
};
const SHARE_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente", CONFIRMED: "Confirmé", PAID: "Payé ✓",
};

export default async function PortefeuilleePage() {
  const user = await requireUser();

  const [
    oppStats,
    needStats,
    needRespStats,
    commStats,
    myShares,
  ] = await Promise.all([
    (prisma as any).opportunity.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: { status: true },
    }),
    (prisma as any).need.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: { status: true },
    }),
    (prisma as any).needResponse.count({ where: { userId: user.id } }),
    prisma.commission.aggregate({
      where: { userId: user.id },
      _sum: { amount: true },
      _count: { id: true },
    }),
    // Parts de commission sur opportunités du réseau
    (prisma as any).opportunityShare.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        opportunity: { select: { code: true, title: true, status: true } },
      },
    }),
  ]);

  const oppByStatus    = Object.fromEntries(oppStats.map((s: any) => [s.status, s._count.status]));
  const totalOpp       = Object.values(oppByStatus).reduce((a: number, b) => a + (b as number), 0);
  const approvedOpp    = (oppByStatus["APPROVED"] ?? 0) + (oppByStatus["IN_PROGRESS"] ?? 0) + (oppByStatus["WON"] ?? 0);
  const wonOpp         = oppByStatus["WON"] ?? 0;
  const convRateOpp    = totalOpp > 0 ? Math.round((wonOpp / totalOpp) * 100) : 0;

  const needByStatus   = Object.fromEntries(needStats.map((s: any) => [s.status, s._count.status]));
  const totalNeeds     = Object.values(needByStatus).reduce((a: number, b) => a + (b as number), 0);
  const fulfilledNeeds = needByStatus["FULFILLED"] ?? 0;

  const totalCommAmount   = commStats._sum.amount ?? 0;
  const totalCommCount    = commStats._count.id ?? 0;

  const sharesTotal       = myShares.reduce((s: number, sh: any) => s + (sh.shareAmount ?? 0), 0);
  const sharesPaid        = myShares.filter((sh: any) => sh.status === "PAID").reduce((s: number, sh: any) => s + (sh.shareAmount ?? 0), 0);
  const sharesPending     = myShares.filter((sh: any) => sh.status !== "PAID").reduce((s: number, sh: any) => s + (sh.shareAmount ?? 0), 0);

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Mon Portefeuille"
        subtitle="Vos performances sur la plateforme IBIG PARTNERS — opportunités, besoins, connexions et commissions."
      />

      {/* Opportunités */}
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

      {/* Commission partagée */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Commissions partagées réseau</h2>
          <span className="text-xs text-slate-400">{myShares.length} part{myShares.length !== 1 ? "s" : ""}</span>
        </div>

        {myShares.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center">
            <p className="text-slate-400 text-sm">Aucune part de commission attribuée pour le moment.</p>
            <p className="text-slate-400 text-xs mt-1">Participez aux opportunités du réseau pour en recevoir.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <StatCard label="Montant total attribué" value={fcfa(sharesTotal)} color="slate" />
              <StatCard label="Déjà payé" value={fcfa(sharesPaid)} color="emerald" />
              <StatCard label="En attente / confirmé" value={fcfa(sharesPending)} color="amber" />
            </div>
            <div className="space-y-2">
              {myShares.map((sh: any) => (
                <div key={sh.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                  <div className="flex-1 min-w-0">
                    {sh.opportunity?.code && (
                      <p className="text-[10px] font-mono font-bold text-amber-600 mb-0.5">{sh.opportunity.code}</p>
                    )}
                    <p className="font-semibold text-slate-800 text-sm truncate">{sh.opportunity?.title ?? "—"}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {SHARE_ROLE_LABELS[sh.role] ?? sh.role} · {formatDate(sh.createdAt)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-extrabold text-slate-800">
                      {sh.shareType === "FIXED" ? fcfa(sh.shareAmount) : `${sh.shareAmount}%`}
                    </p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${SHARE_STATUS_STYLES[sh.status] ?? "bg-slate-100 text-slate-500"}`}>
                      {SHARE_STATUS_LABELS[sh.status] ?? sh.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Besoins */}
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

      {/* Commissions produits IBIG */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Commissions produits IBIG</h2>
          <Link href="/espace/commissions" className="text-xs font-semibold text-brand-600 hover:underline">Voir →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total généré" value={fcfa(totalCommAmount)} color="amber" big />
          <StatCard label="Nombre de commissions" value={totalCommCount} color="slate" />
        </div>
      </section>

      {/* Accès rapides */}
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
  const colors = { slate: "text-slate-800", blue: "text-blue-700", emerald: "text-emerald-700", amber: "text-amber-700", rose: "text-rose-700" };
  const bgs    = { slate: "bg-white border-slate-100", blue: "bg-blue-50 border-blue-100", emerald: "bg-emerald-50 border-emerald-100", amber: "bg-amber-50 border-amber-100", rose: "bg-rose-50 border-rose-100" };
  return (
    <div className={`rounded-2xl border p-4 ${bgs[color]}`}>
      <p className={`${big ? "text-2xl" : "text-3xl"} font-extrabold ${colors[color]}`} style={{ fontVariantNumeric: "tabular-nums" }}>
        {value}
      </p>
      <p className="text-xs text-slate-500 mt-1 leading-snug">{label}</p>
    </div>
  );
}

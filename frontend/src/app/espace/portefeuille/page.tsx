import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { fcfa, formatDate } from "@/lib/format";
import Link from "next/link";

const CP_TYPE_LABELS: Record<string, string> = {
  CREDIT: "Crédit", BONUS: "Bonus", DEBIT: "Débit",
  CANCELLATION: "Annulation", EXPIRATION: "Expiration", ADJUSTMENT: "Ajustement",
};
const CP_TYPE_COLORS: Record<string, string> = {
  CREDIT: "text-emerald-700", BONUS: "text-violet-700", DEBIT: "text-rose-600",
  CANCELLATION: "text-rose-600", EXPIRATION: "text-slate-400", ADJUSTMENT: "text-blue-600",
};
const CP_REASON_LABELS: Record<string, string> = {
  MISSION: "Mission", SALE: "Vente", REFERRAL: "Parrainage", TRAINING: "Formation",
  CHALLENGE: "Challenge", BONUS: "Bonus", REWARD_CLAIM: "Boutique", ADMIN: "Admin",
};

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
    cpTransactions,
    cpPending,
    partnerLevels,
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
    // CP transactions
    (async () => { try { return await (prisma as any).pointTransaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 30 }); } catch { return []; } })(),
    // CP en attente (missions SUBMITTED)
    (async () => { try { return await (prisma as any).missionApplication.findMany({ where: { userId: user.id, status: "SUBMITTED" }, select: { cpEarned: true } }); } catch { return []; } })(),
    // Niveaux partenaires
    (async () => { try { return await (prisma as any).partnerLevel.findMany({ orderBy: { minCp: "asc" }, where: { active: true } }); } catch { return []; } })(),
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

  // CP computations
  const cpEarned   = cpTransactions.filter((tx: any) => ["CREDIT","BONUS"].includes(tx.type)).reduce((s: number, tx: any) => s + tx.points, 0);
  const cpSpent    = cpTransactions.filter((tx: any) => ["DEBIT","CANCELLATION","EXPIRATION"].includes(tx.type)).reduce((s: number, tx: any) => s + tx.points, 0);
  const cpBalance  = cpEarned - cpSpent;
  const cpWaiting  = cpPending.reduce((s: number, a: any) => s + (a.cpEarned ?? 0), 0);

  // Current level
  const currentLevel = [...partnerLevels].reverse().find((lv: any) => cpEarned >= lv.minCp) ?? null;
  const nextLevel    = partnerLevels.find((lv: any) => lv.minCp > cpEarned) ?? null;
  const levelProgress = currentLevel && nextLevel
    ? Math.min(100, Math.round(((cpEarned - currentLevel.minCp) / (nextLevel.minCp - currentLevel.minCp)) * 100))
    : currentLevel ? 100 : 0;

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Mon Portefeuille"
        subtitle="Vos performances sur la plateforme IBIG PARTNERS — opportunités, besoins, connexions, commissions et Crédits PARTNERS."
      />

      {/* ─── Portefeuille CP ──────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Crédits PARTNERS (CP)</h2>
          <Link href="/espace/boutique" className="text-xs font-semibold text-violet-600 hover:underline">Boutique →</Link>
        </div>

        {/* Niveau actuel */}
        {currentLevel && (
          <div className="rounded-2xl border border-violet-100 bg-violet-50 px-5 py-4 mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold text-violet-700">{currentLevel.label}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-200 text-violet-700">Niveau actuel</span>
              </div>
              {nextLevel && (
                <p className="text-xs text-slate-500 mt-1">
                  {nextLevel.minCp - cpEarned} CP manquants pour atteindre <strong>{nextLevel.label}</strong>
                </p>
              )}
              {nextLevel && (
                <div className="mt-2 h-2 w-full rounded-full bg-violet-100 overflow-hidden">
                  <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${levelProgress}%` }} />
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl font-extrabold text-violet-700" style={{ fontVariantNumeric: "tabular-nums" }}>{cpBalance}</p>
              <p className="text-xs text-slate-500">CP disponibles</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <StatCard label="Solde disponible" value={`${cpBalance} CP`} color="emerald" />
          <StatCard label="CP en attente" value={`${cpWaiting} CP`} color="amber" />
          <StatCard label="CP gagnés (total)" value={`${cpEarned} CP`} color="blue" />
          <StatCard label="CP dépensés" value={`${cpSpent} CP`} color="slate" />
        </div>

        {/* Historique transactions */}
        {cpTransactions.length > 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Dernières transactions CP</p>
            </div>
            <div className="divide-y divide-slate-50">
              {cpTransactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {CP_TYPE_LABELS[tx.type] ?? tx.type}
                      {tx.reason && <span className="ml-1.5 text-xs font-normal text-slate-400">— {CP_REASON_LABELS[tx.reason] ?? tx.reason}</span>}
                    </p>
                    {tx.adminNote && <p className="text-xs text-slate-400 truncate">{tx.adminNote}</p>}
                    <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(tx.createdAt)}</p>
                  </div>
                  <p className={`font-extrabold tabular-nums text-sm shrink-0 ${CP_TYPE_COLORS[tx.type] ?? "text-slate-700"}`}>
                    {["CREDIT","BONUS"].includes(tx.type) ? "+" : "-"}{tx.points} CP
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-8 text-center">
            <p className="text-slate-400 text-sm">Aucune transaction CP pour le moment.</p>
            <p className="text-slate-400 text-xs mt-1">Accomplissez des missions pour gagner vos premiers CP.</p>
          </div>
        )}
      </section>

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

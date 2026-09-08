import { requireEnterprise } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EntrepriseDashboardPage() {
  const user = await requireEnterprise();

  const [opportunities, totalLeads] = await Promise.all([
    (prisma as any).opportunity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { leads: true } } },
    }),
    (prisma as any).opportunityLead.count({
      where: { opportunity: { userId: user.id } },
    }),
  ]);

  const counts = {
    total: opportunities.length,
    new: opportunities.filter((o: any) => o.status === "NEW").length,
    approved: opportunities.filter((o: any) => o.status === "APPROVED" || o.status === "IN_PROGRESS").length,
    won: opportunities.filter((o: any) => o.status === "WON").length,
  };

  const CATEGORY_LABELS: Record<string, string> = {
    FORMATION: "Formation", DIGITAL: "Digital", IMMOBILIER: "Immobilier",
    PARTENARIAT: "Partenariat", COMMERCIAL: "Commercial", CONSEIL: "Conseil",
    FINANCEMENT: "Financement", EMPLOI_RH: "Emploi / RH", AUTRE: "Autre",
  };
  const STATUS: Record<string, { label: string; cls: string }> = {
    NEW:         { label: "En attente de validation", cls: "bg-amber-100 text-amber-700" },
    APPROVED:    { label: "Publiée ✓",                cls: "bg-emerald-100 text-emerald-700" },
    IN_PROGRESS: { label: "En traitement",            cls: "bg-blue-100 text-blue-700" },
    REJECTED:    { label: "Non retenue",              cls: "bg-rose-100 text-rose-700" },
    WON:         { label: "Deal conclu 🎉",            cls: "bg-emerald-100 text-emerald-700" },
    LOST:        { label: "Clôturée",                 cls: "bg-slate-100 text-slate-500" },
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Bonjour, {(user as any).orgName ?? user.firstName} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gérez vos opportunités B2B et suivez les mises en relation IBIG.
          </p>
        </div>
        <Link
          href="/entreprise/publier"
          className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 text-sm transition shadow-sm"
        >
          + Publier une opportunité
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Opportunités publiées", value: counts.total, icon: "📋", color: "bg-slate-50 border-slate-200" },
          { label: "En attente validation", value: counts.new, icon: "⏳", color: "bg-amber-50 border-amber-200" },
          { label: "Actives / En cours", value: counts.approved, icon: "✅", color: "bg-emerald-50 border-emerald-200" },
          { label: "Partenaires intéressés", value: totalLeads, icon: "🤝", color: "bg-blue-50 border-blue-200" },
        ].map(kpi => (
          <div key={kpi.label} className={`rounded-2xl border p-5 ${kpi.color}`}>
            <p className="text-3xl mb-1">{kpi.icon}</p>
            <p className="text-2xl font-extrabold text-slate-900">{kpi.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Plan actif */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 px-6 py-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-blue-600 mb-1">Votre plan actuel</p>
          <p className="text-lg font-extrabold text-blue-900">
            {(user as any).subscriptionPlan === "FREE" ? "Gratuit — Commission sur résultat" : "Forfait mensuel"}
          </p>
          <p className="text-sm text-blue-700 mt-1">
            {(user as any).subscriptionPlan === "FREE"
              ? "Vous ne payez que lorsqu'un deal est conclu via IBIG. Aucun abonnement requis."
              : "Accès prioritaire au réseau et visibilité maximale pour toutes vos opportunités."}
          </p>
        </div>
        <Link
          href="/entreprise/abonnement"
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 transition whitespace-nowrap"
        >
          Voir les plans →
        </Link>
      </div>

      {/* Liste des opportunités */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-slate-900">Mes opportunités</h2>
          <Link href="/entreprise/opportunites" className="text-sm text-blue-600 hover:underline font-semibold">
            Tout voir →
          </Link>
        </div>

        {opportunities.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
            <p className="text-5xl mb-4">📤</p>
            <p className="font-bold text-slate-700 text-lg">Aucune opportunité publiée</p>
            <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
              Soumettez votre première opportunité B2B — recrutement, partenariat, distribution, financement…
              IBIG la diffuse à son réseau de partenaires qualifiés.
            </p>
            <Link
              href="/entreprise/publier"
              className="mt-6 inline-block rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 text-sm transition"
            >
              + Publier ma première opportunité
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {opportunities.slice(0, 5).map((opp: any) => (
              <div key={opp.id} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono font-bold text-amber-600">{opp.code}</span>
                    <span className="text-[10px] text-slate-400">{CATEGORY_LABELS[opp.category] ?? opp.category}</span>
                  </div>
                  <p className="font-semibold text-slate-900 truncate">{opp.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(opp.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${STATUS[opp.status]?.cls ?? "bg-slate-100 text-slate-500"}`}>
                    {STATUS[opp.status]?.label ?? opp.status}
                  </span>
                  {opp._count.leads > 0 && (
                    <p className="text-xs text-blue-600 font-bold mt-1">
                      🤝 {opp._count.leads} partenaire{opp._count.leads > 1 ? "s" : ""} intéressé{opp._count.leads > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {opportunities.length > 5 && (
              <Link href="/entreprise/opportunites" className="block text-center text-sm text-blue-600 hover:underline font-semibold py-2">
                Voir les {opportunities.length - 5} autres →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

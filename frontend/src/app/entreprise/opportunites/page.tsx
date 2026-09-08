import { requireEnterprise } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  FORMATION: "Formation", DIGITAL: "Digital", IMMOBILIER: "Immobilier",
  PARTENARIAT: "Partenariat", COMMERCIAL: "Commercial", CONSEIL: "Conseil",
  FINANCEMENT: "Financement", EMPLOI_RH: "Emploi / RH",
  MISE_EN_RELATION: "Mise en relation", AUTRE: "Autre",
};

const STATUS: Record<string, { label: string; cls: string }> = {
  NEW:         { label: "En attente de validation", cls: "bg-amber-100 text-amber-700" },
  APPROVED:    { label: "Publiée ✓",                cls: "bg-emerald-100 text-emerald-700" },
  IN_PROGRESS: { label: "En traitement",            cls: "bg-blue-100 text-blue-700" },
  REJECTED:    { label: "Non retenue",              cls: "bg-rose-100 text-rose-700" },
  WON:         { label: "Deal conclu 🎉",            cls: "bg-emerald-100 text-emerald-700" },
  LOST:        { label: "Clôturée",                 cls: "bg-slate-100 text-slate-500" },
};

export default async function EnterpriseOpportunitesPage() {
  const user = await requireEnterprise();

  const opportunities = await (prisma as any).opportunity.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { leads: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Mes opportunités</h1>
          <p className="text-slate-500 text-sm mt-1">
            {opportunities.length} opportunité{opportunities.length !== 1 ? "s" : ""} soumise{opportunities.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/entreprise/publier"
          className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 text-sm transition shadow-sm"
        >
          + Publier une opportunité
        </Link>
      </div>

      {opportunities.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
          <p className="text-5xl mb-4">📤</p>
          <p className="font-bold text-slate-700 text-lg">Aucune opportunité publiée</p>
          <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
            Soumettez votre première opportunité B2B — recrutement, partenariat, distribution, financement…
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
          {opportunities.map((opp: any) => {
            const status = STATUS[opp.status] ?? { label: opp.status, cls: "bg-slate-100 text-slate-500" };
            return (
              <div key={opp.id} className="rounded-2xl border border-slate-200 bg-white px-6 py-5">
                <div className="flex items-start gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 rounded px-1.5 py-0.5">
                        {opp.code}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {CATEGORY_LABELS[opp.category] ?? opp.category}
                      </span>
                      <span className={`text-[10px] font-bold rounded-full px-2.5 py-0.5 ${status.cls}`}>
                        {status.label}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">{opp.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{opp.description}</p>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <p className="text-[11px] text-slate-400">
                      Soumise le {new Date(opp.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                    {opp.deadline && (
                      <p className="text-[11px] text-slate-500">
                        Deadline : {new Date(opp.deadline).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                      </p>
                    )}
                    {opp._count.leads > 0 && (
                      <p className="text-xs text-blue-600 font-bold">
                        🤝 {opp._count.leads} partenaire{opp._count.leads > 1 ? "s" : ""} intéressé{opp._count.leads > 1 ? "s" : ""}
                      </p>
                    )}
                    {opp._count.leads === 0 && opp.status === "APPROVED" && (
                      <p className="text-xs text-slate-400">En cours de diffusion…</p>
                    )}
                  </div>
                </div>

                {/* Rémunération — confidentielle pour l'affichage public */}
                {opp.commission > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-500">
                    <span>💰</span>
                    <span>Budget mise en relation : <strong className="text-slate-700">Sur résultat ✓</strong></span>
                  </div>
                )}

                {/* Message si rejeté */}
                {opp.status === "REJECTED" && (
                  <div className="mt-3 rounded-xl bg-rose-50 border border-rose-100 px-4 py-2.5 text-sm text-rose-700">
                    Cette opportunité n'a pas été retenue. Contactez l'équipe IBIG pour plus d'informations.
                  </div>
                )}

                {/* Message si en attente */}
                {opp.status === "NEW" && (
                  <div className="mt-3 rounded-xl bg-amber-50 border border-amber-100 px-4 py-2.5 text-sm text-amber-700">
                    ⏳ Votre opportunité est en cours de validation par l'équipe IBIG (sous 24–48h).
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

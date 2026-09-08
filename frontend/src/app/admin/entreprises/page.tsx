import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { approvePartner, setPartnerActive } from "../actions";
import { SubmitButton } from "@/components/submit-button";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const PLAN_LABELS: Record<string, { label: string; cls: string }> = {
  FREE:    { label: "Gratuit", cls: "bg-slate-100 text-slate-600" },
  MONTHLY: { label: "Mensuel", cls: "bg-blue-100 text-blue-700" },
  ANNUAL:  { label: "Annuel",  cls: "bg-emerald-100 text-emerald-700" },
};

const KYB_LABELS: Record<string, { label: string; cls: string }> = {
  NONE:      { label: "Non soumis",   cls: "bg-slate-100 text-slate-500" },
  SUBMITTED: { label: "À vérifier",   cls: "bg-amber-100 text-amber-700" },
  VERIFIED:  { label: "Vérifié ✓",    cls: "bg-emerald-100 text-emerald-700" },
  REJECTED:  { label: "Rejeté",       cls: "bg-rose-100 text-rose-700" },
};

export default async function AdminEntreprisesPage() {
  await requireAdmin();

  const enterprises = await prisma.user.findMany({
    where: { role: "ENTERPRISE" },
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { opportunities: true } },
    },
  });

  const pending   = enterprises.filter(e => !e.approved);
  const approved  = enterprises.filter(e =>  e.approved);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Entreprises clientes"
        subtitle={`${enterprises.length} entreprise${enterprises.length > 1 ? "s" : ""} inscrite${enterprises.length > 1 ? "s" : ""} — ${pending.length} en attente de validation`}
      />

      {/* Entreprises en attente */}
      {pending.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-amber-700 mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 inline-block animate-pulse" />
            En attente de validation ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map(e => (
              <EnterpriseRow key={e.id} e={e} />
            ))}
          </div>
        </section>
      )}

      {/* Entreprises actives */}
      <section>
        <h2 className="text-base font-bold text-slate-700 mb-3">
          Entreprises actives ({approved.length})
        </h2>
        {approved.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center text-slate-400 text-sm">
            Aucune entreprise validée pour l'instant.
          </div>
        ) : (
          <div className="space-y-3">
            {approved.map(e => (
              <EnterpriseRow key={e.id} e={e} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EnterpriseRow({ e }: { e: any }) {
  const plan = PLAN_LABELS[(e as any).subscriptionPlan ?? "FREE"] ?? PLAN_LABELS.FREE;
  const kyb  = KYB_LABELS[e.kybStatus ?? "NONE"] ?? KYB_LABELS.NONE;

  return (
    <div className={`rounded-2xl border bg-white px-5 py-4 flex flex-wrap gap-4 items-center ${!e.approved ? "border-amber-200" : "border-slate-200"}`}>
      {/* Infos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-[10px] font-mono font-bold text-slate-400">{e.code}</span>
          <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${plan.cls}`}>{plan.label}</span>
          <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${kyb.cls}`}>{kyb.label}</span>
          {!e.approved && (
            <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-amber-100 text-amber-700 animate-pulse">
              ⏳ À approuver
            </span>
          )}
        </div>
        <p className="font-bold text-slate-900 text-sm">{e.orgName ?? `${e.firstName} ${e.lastName}`}</p>
        <p className="text-xs text-slate-500">{e.firstName} {e.lastName} · {e.email} · {e.phone}</p>
        {e.website && (
          <a href={e.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">{e.website}</a>
        )}
      </div>

      {/* Stats */}
      <div className="text-center shrink-0">
        <p className="text-xl font-extrabold text-slate-900">{e._count?.opportunities ?? 0}</p>
        <p className="text-[10px] text-slate-400">Opportunités</p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-[10px] text-slate-400 mb-1">Inscrit le {new Date(e.createdAt).toLocaleDateString("fr-FR")}</p>
        {e.marketSectors && (
          <p className="text-[10px] text-blue-600 mb-2">{e.marketSectors}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 items-center shrink-0">
        {!e.approved ? (
          <form action={approvePartner}>
            <input type="hidden" name="id" value={e.id} />
            <SubmitButton
              pendingLabel="…"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 transition"
            >✅ Approuver</SubmitButton>
          </form>
        ) : (
          <form action={setPartnerActive}>
            <input type="hidden" name="id" value={e.id} />
            <input type="hidden" name="active" value={e.active ? "false" : "true"} />
            <SubmitButton
              pendingLabel="…"
              className={`rounded-xl text-xs font-bold px-4 py-2 transition ${e.active ? "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"}`}
            >{e.active ? "Suspendre" : "Réactiver"}</SubmitButton>
          </form>
        )}
        <a
          href={`/admin/partenaires?search=${encodeURIComponent(e.code)}`}
          className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold px-3 py-2 transition"
        >
          Détails
        </a>
      </div>
    </div>
  );
}

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Card, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  APPROVE_PARTNER: "Partenaire validé",
  SUSPEND_PARTNER: "Partenaire suspendu",
  REACTIVATE_PARTNER: "Partenaire réactivé",
  PROMOTE_ADMIN: "Promu administrateur",
  DEMOTE_PARTNER: "Rétrogradé partenaire",
  CREATE_SALE: "Vente créée",
  CONFIRM_SALE: "Vente confirmée",
  CANCEL_SALE: "Vente annulée",
  ADD_PAID_MONTH: "Mois payé ajouté",
  VALIDATE_COMMISSION: "Commission validée",
  VALIDATE_ALL_COMMISSIONS: "Commissions validées en masse",
  CREATE_PAYOUT: "Ordre de virement créé",
  MARK_PAYOUT_PAID: "Virement marqué payé",
  UPDATE_SETTING: "Paramètre modifié",
  SEND_ANNOUNCEMENT: "Annonce envoyée",
  CLOSE_TICKET: "Ticket résolu",
  REPLY_TICKET: "Réponse ticket",
};

export default async function AuditPage() {
  const admin = await requireAdmin();
  if (admin.role !== "SUPERADMIN") {
    return (
      <div>
        <PageHeader title="Journal d'audit" subtitle="Accès SuperAdmin uniquement." />
        <Card><p className="text-muted">Droits insuffisants.</p></Card>
      </div>
    );
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { firstName: true, lastName: true, role: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Journal d'audit"
        subtitle={`${logs.length} actions récentes — SuperAdmin uniquement`}
      />

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-5 py-2">Date</th>
                <th className="px-3 py-2">Administrateur</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Cible</th>
                <th className="px-3 py-2">Détail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="px-5 py-2 text-xs text-muted whitespace-nowrap">{formatDate(l.createdAt)}</td>
                  <td className="px-3 py-2">
                    <p className="font-medium text-ink">{l.user.firstName} {l.user.lastName}</p>
                    <p className="text-xs text-muted">{l.user.role}</p>
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                      {ACTION_LABELS[l.action] ?? l.action}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted">{l.target ?? "—"}</td>
                  <td className="px-3 py-2 text-xs text-muted max-w-[200px] truncate">{l.detail ?? "—"}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted">Aucune action enregistrée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

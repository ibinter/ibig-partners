import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa, formatDate } from "@/lib/format";
import { Badge, Card, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import {
  approvePartner,
  setPartnerActive,
  setPartnerRole,
  sendVerificationReminder,
  sendVerificationReminderToAll,
} from "../actions";
import { adminContact } from "../messages/actions";

export const dynamic = "force-dynamic";

export default async function PartenairesPage() {
  const admin = await requireAdmin();
  const partners = await prisma.user.findMany({
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
    include: {
      sponsor: { select: { code: true } },
      _count: { select: { sales: true, referrals: true } },
    },
  });

  const paidByUser = await prisma.commission.groupBy({
    by: ["userId"],
    where: { status: "PAID" },
    _sum: { amount: true },
  });
  const paidOf = (id: string) => paidByUser.find((p) => p.userId === id)?._sum.amount ?? 0;

  const pending = partners.filter((p) => !p.approved && p.role === "PARTNER");
  const unverified = partners.filter(
    (p) => p.role === "PARTNER" && p.verificationStatus !== "VERIFIED",
  );

  return (
    <div>
      <PageHeader
        title="Gestion des partenaires"
        subtitle={`${partners.length} comptes · ${pending.length} en attente de validation · ${unverified.length} non vérifiés`}
        action={
          unverified.length > 0 ? (
            <form action={sendVerificationReminderToAll}>
              <SubmitButton variant="secondary" size="sm" pendingLabel="Envoi en cours…">
                🔐 Rappeler la vérif à tous ({unverified.length})
              </SubmitButton>
            </form>
          ) : undefined
        }
      />

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Partenaire</th>
                <th>Code</th>
                <th>Parrain</th>
                <th>Statut</th>
                <th>Ventes</th>
                <th>Filleuls</th>
                <th>Versé</th>
                <th>État</th>
                <th>Inscrit le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id} className={!p.approved && p.role === "PARTNER" ? "bg-amber-50/50" : ""}>
                  <td>
                    <p className="font-medium text-ink">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-muted">{p.email}</p>
                    <p className="text-xs text-muted">
                      📱 {p.phone || "—"}{p.country ? ` · ${p.country}` : ""}{p.city ? ` (${p.city})` : ""}
                    </p>
                    {p.role !== "PARTNER" && (
                      <Badge tone="purple">{p.role}</Badge>
                    )}
                  </td>
                  <td>
                    <span className="font-mono text-xs text-muted">{p.code}</span>
                  </td>
                  <td>
                    <span className="font-mono text-xs text-muted">{p.sponsor?.code ?? "—"}</span>
                  </td>
                  <td>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[p.status]?.badge ?? "bg-slate-100 text-slate-700"}`}>
                      {STATUS_LABELS[p.status] ?? p.status}
                    </span>
                  </td>
                  <td className="text-center font-medium">{p._count.sales}</td>
                  <td className="text-center">{p._count.referrals}</td>
                  <td className="font-semibold text-ink">{fcfa(paidOf(p.id))}</td>
                  <td>
                    <div className="flex flex-col items-start gap-1">
                      {!p.approved ? (
                        <Badge tone="amber">En validation</Badge>
                      ) : p.active ? (
                        <Badge tone="green">Actif</Badge>
                      ) : (
                        <Badge tone="red">Suspendu</Badge>
                      )}
                      {p.role === "PARTNER" && (
                        p.verificationStatus === "VERIFIED" ? (
                          <Badge tone="green">🔐 Vérifié</Badge>
                        ) : p.verificationStatus === "SUBMITTED" ? (
                          <Badge tone="amber">🔐 Dossier reçu</Badge>
                        ) : p.verificationStatus === "REJECTED" ? (
                          <Badge tone="red">🔐 Refusé</Badge>
                        ) : (
                          <Badge tone="red">🔐 Non vérifié</Badge>
                        )
                      )}
                    </div>
                  </td>
                  <td className="text-xs text-muted">{formatDate(p.createdAt)}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      {p.id !== admin.id && (
                        <form action={adminContact}>
                          <input type="hidden" name="targetUserId" value={p.id} />
                          <SubmitButton variant="ghost" size="sm" pendingLabel="Ouverture…">💬 Contacter</SubmitButton>
                        </form>
                      )}
                      {p.role === "PARTNER" && p.verificationStatus !== "VERIFIED" && (
                        <form action={sendVerificationReminder}>
                          <input type="hidden" name="id" value={p.id} />
                          <SubmitButton variant="ghost" size="sm" pendingLabel="Envoi…">🔐 Rappel vérif</SubmitButton>
                        </form>
                      )}
                      {!p.approved && (
                        <form action={approvePartner}>
                          <input type="hidden" name="id" value={p.id} />
                          <SubmitButton variant="success" size="sm" pendingLabel="…">Valider</SubmitButton>
                        </form>
                      )}
                      {p.approved && (
                        <form action={setPartnerActive}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="active" value={(!p.active).toString()} />
                          <SubmitButton variant={p.active ? "danger" : "secondary"} size="sm" pendingLabel="…">
                            {p.active ? "Suspendre" : "Réactiver"}
                          </SubmitButton>
                        </form>
                      )}
                      {admin.role === "SUPERADMIN" && p.id !== admin.id && (
                        <form action={setPartnerRole}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="role" value={p.role === "ADMIN" ? "PARTNER" : "ADMIN"} />
                          <SubmitButton variant="ghost" size="sm" pendingLabel="…">
                            {p.role === "ADMIN" ? "Retirer admin" : "Promouvoir"}
                          </SubmitButton>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {partners.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-muted text-sm">
                    Aucun partenaire inscrit.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

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
import { ExportButton } from "@/components/export-button";

export const dynamic = "force-dynamic";

function computeScore(p: {
  salesCount: number;
  referralsCount: number;
  wonLeads: number;
  kybStatus: string;
  callsAccepted: number;
  oppsSubmitted: number;
}): number {
  let s = 0;
  s += Math.min(p.salesCount * 5, 30);
  s += Math.min(p.referralsCount * 3, 20);
  s += Math.min(p.wonLeads * 10, 20);
  if (p.kybStatus === "VERIFIED") s += 10;
  s += Math.min(p.callsAccepted * 5, 10);
  s += Math.min(p.oppsSubmitted * 2, 10);
  return Math.min(s, 100);
}

function scoreBadge(score: number): { label: string; cls: string } {
  if (score >= 80) return { label: "🏆 ELITE", cls: "bg-purple-100 text-purple-700" };
  if (score >= 60) return { label: "⭐ GOLD", cls: "bg-yellow-100 text-yellow-700" };
  if (score >= 40) return { label: "🥈 SILVER", cls: "bg-slate-100 text-slate-600" };
  if (score >= 20) return { label: "🥉 BRONZE", cls: "bg-orange-100 text-orange-700" };
  return { label: "🌱 STARTER", cls: "bg-green-50 text-green-700" };
}

export default async function PartenairesPage() {
  const admin = await requireAdmin();
  const [partners, paidByUser, wonLeadsByUser, callsAcceptedByUser, oppsByUser] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
      include: {
        sponsor: { select: { code: true } },
        _count: { select: { sales: true, referrals: true } },
      },
    }),
    prisma.commission.groupBy({
      by: ["userId"],
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
    (prisma as any).opportunityLead.groupBy({
      by: ["userId"],
      where: { status: "WON" },
      _count: { id: true },
    }),
    (prisma as any).partnerCallInvitation.groupBy({
      by: ["userId"],
      where: { status: "ACCEPTED" },
      _count: { id: true },
    }),
    (prisma as any).opportunity.groupBy({
      by: ["userId"],
      _count: { id: true },
    }),
  ]);

  const paidOf = (id: string) => paidByUser.find((p: any) => p.userId === id)?._sum.amount ?? 0;
  const wonOf = (id: string) => wonLeadsByUser.find((r: any) => r.userId === id)?._count.id ?? 0;
  const callsOf = (id: string) => callsAcceptedByUser.find((r: any) => r.userId === id)?._count.id ?? 0;
  const oppsOf = (id: string) => oppsByUser.find((r: any) => r.userId === id)?._count.id ?? 0;

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
          <div className="flex items-center gap-2">
            <ExportButton type="partenaires" label="Exporter CSV" />
            {unverified.length > 0 && (
              <form action={sendVerificationReminderToAll}>
                <SubmitButton variant="secondary" size="sm" pendingLabel="Envoi en cours…">
                  🔐 Rappeler la vérif à tous ({unverified.length})
                </SubmitButton>
              </form>
            )}
          </div>
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
                <th>Score</th>
                <th>Ventes</th>
                <th>Filleuls</th>
                <th>Versé</th>
                <th>État</th>
                <th>Inscrit le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => {
                const score = computeScore({
                  salesCount: p._count.sales,
                  referralsCount: p._count.referrals,
                  wonLeads: wonOf(p.id),
                  kybStatus: (p as any).kybStatus ?? "NONE",
                  callsAccepted: callsOf(p.id),
                  oppsSubmitted: oppsOf(p.id),
                });
                const badge = scoreBadge(score);
                return (
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
                  <td>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-bold text-sm text-ink">{score}</span>
                      <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ${badge.cls}`}>{badge.label}</span>
                    </div>
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
                );
              })}
              {partners.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-muted text-sm">
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

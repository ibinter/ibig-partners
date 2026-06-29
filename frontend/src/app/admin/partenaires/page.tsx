import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa, formatDate } from "@/lib/format";
import { Badge, Button, Card, PageHeader, statusTone } from "@/components/ui";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import { approvePartner, setPartnerActive, setPartnerRole } from "../actions";

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

  return (
    <div>
      <PageHeader
        title="Gestion des partenaires"
        subtitle={`${partners.length} comptes · ${pending.length} en attente de validation`}
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
                    {!p.approved ? (
                      <Badge tone="amber">En validation</Badge>
                    ) : p.active ? (
                      <Badge tone="green">Actif</Badge>
                    ) : (
                      <Badge tone="red">Suspendu</Badge>
                    )}
                  </td>
                  <td className="text-xs text-muted">{formatDate(p.createdAt)}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      {!p.approved && (
                        <form action={approvePartner}>
                          <input type="hidden" name="id" value={p.id} />
                          <Button type="submit" variant="success" size="sm">Valider</Button>
                        </form>
                      )}
                      {p.approved && (
                        <form action={setPartnerActive}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="active" value={(!p.active).toString()} />
                          <Button type="submit" variant={p.active ? "danger" : "secondary"} size="sm">
                            {p.active ? "Suspendre" : "Réactiver"}
                          </Button>
                        </form>
                      )}
                      {admin.role === "SUPERADMIN" && p.id !== admin.id && (
                        <form action={setPartnerRole}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="role" value={p.role === "ADMIN" ? "PARTNER" : "ADMIN"} />
                          <Button type="submit" variant="ghost" size="sm">
                            {p.role === "ADMIN" ? "Retirer admin" : "Promouvoir"}
                          </Button>
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

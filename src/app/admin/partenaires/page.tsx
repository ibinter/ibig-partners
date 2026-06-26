import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa, formatDate } from "@/lib/format";
import { Badge, Button, Card, PageHeader, statusTone } from "@/components/ui";
import { STATUS_LABELS } from "@/lib/constants";
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

  // commissions versées par partenaire (pour info)
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
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-5 py-2">Partenaire</th>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Parrain</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">Ventes</th>
                <th className="px-3 py-2">Filleuls</th>
                <th className="px-3 py-2">Versé</th>
                <th className="px-3 py-2">État</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {partners.map((p) => (
                <tr key={p.id} className={!p.approved && p.role === "PARTNER" ? "bg-amber-50/40" : ""}>
                  <td className="px-5 py-2">
                    <p className="font-medium text-ink">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-muted">{p.email} · inscrit le {formatDate(p.createdAt)}</p>
                    {p.role !== "PARTNER" && <Badge tone="blue">{p.role}</Badge>}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{p.code}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted">{p.sponsor?.code ?? "—"}</td>
                  <td className="px-3 py-2">{STATUS_LABELS[p.status]}</td>
                  <td className="px-3 py-2">{p._count.sales}</td>
                  <td className="px-3 py-2">{p._count.referrals}</td>
                  <td className="px-3 py-2">{fcfa(paidOf(p.id))}</td>
                  <td className="px-3 py-2">
                    {!p.approved ? (
                      <Badge tone="amber">En validation</Badge>
                    ) : p.active ? (
                      <Badge tone="green">Actif</Badge>
                    ) : (
                      <Badge tone="red">Suspendu</Badge>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap justify-end gap-1">
                      {!p.approved && (
                        <form action={approvePartner}>
                          <input type="hidden" name="id" value={p.id} />
                          <Button type="submit" variant="secondary">Valider</Button>
                        </form>
                      )}
                      {p.approved && (
                        <form action={setPartnerActive}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="active" value={(!p.active).toString()} />
                          <Button type="submit" variant="ghost">{p.active ? "Suspendre" : "Réactiver"}</Button>
                        </form>
                      )}
                      {admin.role === "SUPERADMIN" && p.id !== admin.id && (
                        <form action={setPartnerRole}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="role" value={p.role === "ADMIN" ? "PARTNER" : "ADMIN"} />
                          <Button type="submit" variant="ghost">{p.role === "ADMIN" ? "Retirer admin" : "Promouvoir admin"}</Button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

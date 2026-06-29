import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, PageHeader, StatCard } from "@/components/ui";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente",
  APPROVED: "Approuvé",
  REJECTED: "Rejeté",
};

const STATUS_TONE: Record<string, "amber" | "green" | "red"> = {
  PENDING: "amber",
  APPROVED: "green",
  REJECTED: "red",
};

const TYPE_LABEL: Record<string, string> = {
  INDIVIDUAL: "Particulier",
  COMPANY: "Entreprise",
};

export default async function VerificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status: filterStatus } = await searchParams;

  const requests = await (prisma as any).verificationRequest.findMany({
    where: filterStatus ? { status: filterStatus } : undefined,
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true, code: true },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  const all = await (prisma as any).verificationRequest.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const countOf = (s: string) =>
    (all.find((r: any) => r.status === s)?._count._all ?? 0) as number;

  const pending  = countOf("PENDING");
  const approved = countOf("APPROVED");
  const rejected = countOf("REJECTED");

  return (
    <div className="space-y-5">
      <PageHeader
        title="Vérifications KYC"
        subtitle={`${requests.length} dossier${requests.length !== 1 ? "s" : ""}${filterStatus ? ` · filtre : ${STATUS_LABEL[filterStatus] ?? filterStatus}` : ""}`}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="En attente" value={pending}  accent="gold"  icon="⏳" />
        <StatCard label="Approuvés"  value={approved} accent="green" icon="✅" />
        <StatCard label="Rejetés"    value={rejected} accent="slate" icon="❌" />
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {[undefined, "PENDING", "APPROVED", "REJECTED"].map((s) => (
          <Link
            key={s ?? "all"}
            href={s ? `/admin/verifications?status=${s}` : "/admin/verifications"}
            className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
              filterStatus === s || (!filterStatus && !s)
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {s ? STATUS_LABEL[s] : "Tous"}
          </Link>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
          Aucun dossier de vérification trouvé.
        </div>
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Partenaire</th>
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3">Statut</th>
                  <th className="px-3 py-3">Soumis le</th>
                  <th className="px-3 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {requests.map((req: any) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">
                        {req.user.firstName} {req.user.lastName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {req.user.email} · {req.user.code}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone="blue">{TYPE_LABEL[req.type] ?? req.type}</Badge>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={STATUS_TONE[req.status] ?? "gray"}>
                        {STATUS_LABEL[req.status] ?? req.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-slate-600 text-xs">
                      {formatDate(req.submittedAt)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Link
                        href={`/admin/verifications/${req.id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
                      >
                        Examiner →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

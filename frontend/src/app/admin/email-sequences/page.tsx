import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Card, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

const SEQ_LABELS: Record<string, string> = {
  ONBOARDING: "Onboarding",
  ACTIVATION:  "Activation",
  REENGAGE:    "Réengagement",
  STATUS_UP:   "Montée de statut",
};

const STEP_ORDER = ["J0","J1","J3","J7","J14","J21","J30","J45","J60","IMMEDIATE"];

const SEQ_COLOR: Record<string, string> = {
  ONBOARDING: "bg-blue-100 text-blue-700",
  ACTIVATION:  "bg-amber-100 text-amber-700",
  REENGAGE:    "bg-rose-100 text-rose-700",
  STATUS_UP:   "bg-emerald-100 text-emerald-700",
};

export default async function EmailSequencesPage() {
  await requireAdmin();

  // ── Totaux par séquence + étape ──────────────────────────────────────────
  const logsBySeqStep = await prisma.emailSequenceLog.groupBy({
    by: ["sequence", "step"],
    _count: { _all: true },
    orderBy: [{ sequence: "asc" }, { step: "asc" }],
  });

  // ── Envois des 7 derniers jours ──────────────────────────────────────────
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentCount = await prisma.emailSequenceLog.count({
    where: { sentAt: { gte: weekAgo } },
  });

  // ── Total envois ─────────────────────────────────────────────────────────
  const totalSent = await prisma.emailSequenceLog.count();

  // ── Affiliés sans aucun email de séquence (jamais entrés dans le funnel) ─
  const totalPartners = await prisma.user.count({
    where: { role: "PARTNER", approved: true, active: true },
  });
  const partnersWithSeq = await prisma.emailSequenceLog
    .findMany({ distinct: ["userId"], select: { userId: true } })
    .then(r => r.length);
  const partnersWithoutSeq = totalPartners - partnersWithSeq;

  // ── 30 derniers envois ───────────────────────────────────────────────────
  const recentLogs = await prisma.emailSequenceLog.findMany({
    orderBy: { sentAt: "desc" },
    take: 30,
    select: {
      id: true, sequence: true, step: true, sentAt: true, emailId: true, userId: true,
    },
  });

  // Noms des affiliés
  const userIds = [...new Set(recentLogs.map(l => l.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, firstName: true, lastName: true, email: true, code: true },
  });
  const userMap = new Map(users.map(u => [u.id, u]));

  // ── Résumé par séquence (object) ─────────────────────────────────────────
  const seqSummary: Record<string, Record<string, number>> = {};
  for (const row of logsBySeqStep) {
    if (!seqSummary[row.sequence]) seqSummary[row.sequence] = {};
    seqSummary[row.sequence][row.step] = row._count._all;
  }

  // ── Affiliés en cours d'onboarding ───────────────────────────────────────
  const inOnboarding = await prisma.emailSequenceLog.findMany({
    distinct: ["userId"],
    where: { sequence: "ONBOARDING" },
    select: { userId: true },
  }).then(r => r.length);

  return (
    <div>
      <PageHeader
        title="Séquences email"
        subtitle="Tableau de bord des automations marketing — envois, funnel et activité récente."
      />

      {/* ── KPIs ───────────────────────────────────────────────────────── */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Emails envoyés (total)" value={totalSent.toString()} icon="✉️" color="blue" />
        <KpiCard label="Cette semaine" value={recentCount.toString()} icon="📅" color="indigo" />
        <KpiCard label="Partenaires dans le funnel" value={`${partnersWithSeq} / ${totalPartners}`} icon="👥" color="emerald" />
        <KpiCard label="En onboarding actif" value={inOnboarding.toString()} icon="🚀" color="amber" />
      </div>

      {/* ── Funnel par séquence ────────────────────────────────────────── */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        {Object.entries(SEQ_LABELS).map(([seq, label]) => {
          const steps = seqSummary[seq] ?? {};
          const totalSeq = Object.values(steps).reduce((s, n) => s + n, 0);
          const orderedSteps = STEP_ORDER.filter(s => steps[s] !== undefined);
          return (
            <Card key={seq}>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${SEQ_COLOR[seq] ?? "bg-slate-100 text-slate-600"}`}>
                    {label}
                  </span>
                </div>
                <span className="text-sm font-bold text-ink">{totalSeq} envois</span>
              </div>

              {orderedSteps.length === 0 ? (
                <p className="text-sm text-muted">Aucun envoi pour cette séquence.</p>
              ) : (
                <div className="space-y-2">
                  {orderedSteps.map(step => {
                    const count = steps[step] ?? 0;
                    const max = Math.max(...Object.values(steps));
                    const pct = max > 0 ? Math.round((count / max) * 100) : 0;
                    return (
                      <div key={step} className="flex items-center gap-3">
                        <span className="w-10 shrink-0 text-right text-xs font-mono font-semibold text-muted">{step}</span>
                        <div className="flex-1 overflow-hidden rounded-full bg-slate-100 h-2">
                          <div
                            className="h-2 rounded-full bg-brand-500 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 shrink-0 text-right text-sm font-bold text-ink">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* ── Alerte partenaires hors funnel ─────────────────────────────── */}
      {partnersWithoutSeq > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {partnersWithoutSeq} partenaire{partnersWithoutSeq > 1 ? "s" : ""} approuvé{partnersWithoutSeq > 1 ? "s" : ""} sans email de séquence
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Ces affiliés ont rejoint avant la mise en place du système ou n&apos;ont pas reçu leur J0.
              Le cron quotidien les rattrapera automatiquement dès demain (J1, J3, J7…).
            </p>
          </div>
        </div>
      )}

      {/* ── Activité récente ───────────────────────────────────────────── */}
      <Card>
        <h2 className="mb-4 font-semibold text-ink">30 derniers envois</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-2 text-left font-medium text-muted">Affilié</th>
                <th className="pb-2 text-left font-medium text-muted">Séquence</th>
                <th className="pb-2 text-left font-medium text-muted">Étape</th>
                <th className="pb-2 text-left font-medium text-muted">Envoyé le</th>
                <th className="pb-2 text-left font-medium text-muted">ID Resend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentLogs.map(log => {
                const u = userMap.get(log.userId);
                return (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 pr-4">
                      {u ? (
                        <Link
                          href={`/admin/partenaires?q=${u.code}`}
                          className="font-medium text-brand-600 hover:underline"
                        >
                          {u.firstName} {u.lastName}
                        </Link>
                      ) : (
                        <span className="text-muted text-xs font-mono">{log.userId.slice(0, 8)}…</span>
                      )}
                      {u && <p className="text-xs text-muted">{u.email}</p>}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${SEQ_COLOR[log.sequence] ?? "bg-slate-100 text-slate-600"}`}>
                        {SEQ_LABELS[log.sequence] ?? log.sequence}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono font-semibold text-slate-700">
                        {log.step}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-muted">{formatDate(log.sentAt)}</td>
                    <td className="py-2.5">
                      {log.emailId ? (
                        <span className="font-mono text-xs text-muted">{log.emailId.slice(0, 16)}…</span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {recentLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted">
                    Aucun envoi enregistré pour l&apos;instant.
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

function KpiCard({ label, value, icon, color }: {
  label: string; value: string; icon: string;
  color: "blue" | "indigo" | "emerald" | "amber";
}) {
  const colors = {
    blue:    "bg-blue-50 text-blue-700",
    indigo:  "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber:   "bg-amber-50 text-amber-700",
  };
  return (
    <div className={`rounded-xl p-4 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <p className="text-xs font-medium opacity-75">{label}</p>
      </div>
      <p className="text-2xl font-extrabold">{value}</p>
    </div>
  );
}

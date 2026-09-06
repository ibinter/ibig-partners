"use client";

const FCFA = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(n);

const LEAD_LABELS: Record<string, string> = {
  INTERESTED: "Intéressé",
  CONTACTED: "Contacté",
  MEETING: "Réunion",
  WON: "Gagné",
  LOST: "Perdu",
};
const LEAD_COLORS: Record<string, string> = {
  INTERESTED: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-yellow-100 text-yellow-700",
  MEETING: "bg-purple-100 text-purple-700",
  WON: "bg-green-100 text-green-700",
  LOST: "bg-red-100 text-red-700",
};
const OPP_STATUS_LABELS: Record<string, string> = {
  NEW: "Nouvelle",
  APPROVED: "Approuvée",
  IN_PROGRESS: "En cours",
  CLOSED: "Clôturée",
  REJECTED: "Refusée",
};

function scoreBadge(score: number) {
  if (score >= 80) return { label: "🏆 ELITE", cls: "bg-purple-100 text-purple-700" };
  if (score >= 60) return { label: "⭐ GOLD", cls: "bg-yellow-100 text-yellow-700" };
  if (score >= 40) return { label: "🥈 SILVER", cls: "bg-slate-100 text-slate-600" };
  if (score >= 20) return { label: "🥉 BRONZE", cls: "bg-orange-100 text-orange-700" };
  return { label: "🌱 STARTER", cls: "bg-green-50 text-green-700" };
}

function Delta({ current, prev, suffix = "" }: { current: number; prev: number; suffix?: string }) {
  if (!prev) return null;
  const diff = current - prev;
  const pct = Math.round((diff / prev) * 100);
  if (diff === 0) return <span className="text-xs text-gray-400">= mois préc.</span>;
  return (
    <span className={`text-xs font-medium ${diff > 0 ? "text-green-600" : "text-red-500"}`}>
      {diff > 0 ? "▲" : "▼"} {Math.abs(pct)}%{suffix} vs mois préc.
    </span>
  );
}

function KpiCard({ label, value, sub, delta }: { label: string; value: string | number; sub?: string; delta?: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white dark:bg-gray-900 p-4 space-y-1">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {delta}
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

type KPIs = {
  salesCount: number;
  salesCountPrev: number;
  commAmount: number;
  commAmountPrev: number;
  referralsCount: number;
  rank: number | null;
  totalRanked: number;
  score: number;
  leadsCount: number;
  callsCount: number;
  oppsCount: number;
};

export default function RapportClient({
  monthLabel,
  kpis,
  sales,
  leads,
  calls,
  opps,
}: {
  monthLabel: string;
  kpis: KPIs;
  sales: { id: string; reference: string; productName: string; amount: number; status: string; date: string }[];
  leads: { id: string; oppTitle: string; oppCode: string; status: string; date: string }[];
  calls: { id: string; callTitle: string; callStatus: string; status: string; date: string }[];
  opps: { id: string; title: string; code: string; status: string; date: string }[];
}) {
  const badge = scoreBadge(kpis.score);

  return (
    <div className="space-y-8">
      {/* KPIs principaux */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Ventes déclarées"
          value={kpis.salesCount}
          delta={<Delta current={kpis.salesCount} prev={kpis.salesCountPrev} />}
        />
        <KpiCard
          label="Commissions générées"
          value={FCFA(kpis.commAmount)}
          delta={<Delta current={kpis.commAmount} prev={kpis.commAmountPrev} />}
        />
        <KpiCard label="Nouveaux filleuls" value={kpis.referralsCount} />
        <KpiCard
          label="Classement du mois"
          value={kpis.rank ? `#${kpis.rank}` : "—"}
          sub={kpis.totalRanked > 0 ? `sur ${kpis.totalRanked} actifs` : undefined}
        />
      </div>

      {/* Score global + activité */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-white dark:bg-gray-900 p-4 flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-gray-500">Score global</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{kpis.score}</span>
            <span className="text-xs text-gray-400 mb-1">/ 100</span>
          </div>
          <div className="w-full rounded-full bg-gray-100 h-2">
            <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${kpis.score}%` }} />
          </div>
          <span className={`self-start inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.cls}`}>{badge.label}</span>
        </div>
        <KpiCard label="Leads suivis" value={kpis.leadsCount} />
        <KpiCard label="Opps soumises" value={kpis.oppsCount} />
        <KpiCard label="Appels reçus" value={kpis.callsCount} />
      </div>

      {/* Ventes du mois */}
      {sales.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Ventes du mois</h2>
          <div className="overflow-x-auto rounded-xl border bg-white dark:bg-gray-900">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Référence</th>
                  <th className="px-4 py-3 text-left">Produit</th>
                  <th className="px-4 py-3 text-right">Montant</th>
                  <th className="px-4 py-3 text-center">Statut</th>
                  <th className="px-4 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {sales.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{s.reference}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{s.productName}</td>
                    <td className="px-4 py-3 text-right font-semibold">{FCFA(s.amount)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        s.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
                        s.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>{s.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-400">{s.date.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Leads du mois */}
      {leads.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Leads traités ce mois</h2>
          <div className="overflow-x-auto rounded-xl border bg-white dark:bg-gray-900">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Opportunité</th>
                  <th className="px-4 py-3 text-center">Statut lead</th>
                  <th className="px-4 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{l.oppTitle}</div>
                      <div className="text-xs text-gray-400">{l.oppCode}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${LEAD_COLORS[l.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {LEAD_LABELS[l.status] ?? l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-400">{l.date.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Opportunités soumises */}
      {opps.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Opportunités soumises ce mois</h2>
          <div className="overflow-x-auto rounded-xl border bg-white dark:bg-gray-900">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Titre</th>
                  <th className="px-4 py-3 text-center">Statut</th>
                  <th className="px-4 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {opps.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{o.title}</div>
                      <div className="text-xs text-gray-400">{o.code}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        o.status === "APPROVED" ? "bg-green-100 text-green-700" :
                        o.status === "NEW" ? "bg-blue-100 text-blue-700" :
                        o.status === "REJECTED" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>{OPP_STATUS_LABELS[o.status] ?? o.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-400">{o.date.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Appels reçus */}
      {calls.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Appels à partenaires reçus ce mois</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {calls.map((c) => (
              <div key={c.id} className="rounded-xl border bg-white dark:bg-gray-900 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{c.callTitle}</p>
                  <span className={`shrink-0 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    c.status === "ACCEPTED" ? "bg-green-100 text-green-700" :
                    c.status === "DECLINED" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>{c.status === "ACCEPTED" ? "Accepté" : c.status === "DECLINED" ? "Décliné" : "En attente"}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{c.date.slice(0, 10)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {sales.length === 0 && leads.length === 0 && opps.length === 0 && calls.length === 0 && (
        <div className="rounded-xl border bg-white dark:bg-gray-900 p-8 text-center text-gray-400 text-sm">
          Aucune activité enregistrée pour {monthLabel}.
        </div>
      )}
    </div>
  );
}

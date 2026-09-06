"use client";

type KPIs = {
  totalMatches: number;
  totalInvited: number;
  totalAccepted: number;
  totalLeads: number;
  wonLeads: number;
  callInvitedCount: number;
  callAcceptedCount: number;
  openCalls: number;
};

type OppRow = {
  id: string;
  title: string;
  code: string;
  category: string;
  matches: number;
  invited: number;
  accepted: number;
  declined: number;
  leads: number;
};

type PartnerRow = {
  id: string;
  name: string;
  code: string;
  status: string;
  invitations: number;
  accepted: number;
  avgScore: number;
};

type CallRow = {
  id: string;
  title: string;
  status: string;
  total: number;
  accepted: number;
  declined: number;
};

function pct(a: number, b: number) {
  if (!b) return "—";
  return `${Math.round((a / b) * 100)}%`;
}

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border bg-white dark:bg-gray-900 p-4 space-y-1">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export default function MatchingDashboardClient({
  kpis,
  oppRows,
  partnerRows,
  callRows,
}: {
  kpis: KPIs;
  oppRows: OppRow[];
  partnerRows: PartnerRow[];
  callRows: CallRow[];
}) {
  const inviteRate = pct(kpis.totalInvited, kpis.totalMatches);
  const acceptRate = pct(kpis.totalAccepted, kpis.totalInvited);
  const convRate = pct(kpis.wonLeads, kpis.totalLeads);
  const callAcceptRate = pct(kpis.callAcceptedCount, kpis.callInvitedCount);

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Matches calculés" value={kpis.totalMatches} />
        <KpiCard label="Partenaires invités" value={kpis.totalInvited} sub={`Taux invitation : ${inviteRate}`} />
        <KpiCard label="Acceptations matching" value={kpis.totalAccepted} sub={`Taux acceptation : ${acceptRate}`} />
        <KpiCard label="Leads générés" value={kpis.totalLeads} sub={`Taux WON : ${convRate}`} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Appels ouverts" value={kpis.openCalls} />
        <KpiCard label="Invitations appels" value={kpis.callInvitedCount} />
        <KpiCard label="Acceptations appels" value={kpis.callAcceptedCount} sub={`Taux réponse : ${callAcceptRate}`} />
        <KpiCard label="Leads WON" value={kpis.wonLeads} />
      </div>

      {/* Table opportunités */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Par opportunité</h2>
        <div className="overflow-x-auto rounded-xl border bg-white dark:bg-gray-900">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Opportunité</th>
                <th className="px-4 py-3 text-center">Matches</th>
                <th className="px-4 py-3 text-center">Invités</th>
                <th className="px-4 py-3 text-center">Acceptés</th>
                <th className="px-4 py-3 text-center">Déclinés</th>
                <th className="px-4 py-3 text-center">Leads</th>
                <th className="px-4 py-3 text-center">Taux inv.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {oppRows.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">Aucune donnée</td></tr>
              )}
              {oppRows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{r.title}</div>
                    <div className="text-xs text-gray-400">{r.code} · {r.category}</div>
                  </td>
                  <td className="px-4 py-3 text-center font-tabular-nums">{r.matches}</td>
                  <td className="px-4 py-3 text-center font-tabular-nums">{r.invited}</td>
                  <td className="px-4 py-3 text-center font-tabular-nums text-green-600">{r.accepted}</td>
                  <td className="px-4 py-3 text-center font-tabular-nums text-red-500">{r.declined}</td>
                  <td className="px-4 py-3 text-center font-tabular-nums">{r.leads}</td>
                  <td className="px-4 py-3 text-center">{pct(r.invited, r.matches)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Table partenaires */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Par partenaire</h2>
        <div className="overflow-x-auto rounded-xl border bg-white dark:bg-gray-900">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Partenaire</th>
                <th className="px-4 py-3 text-center">Score moy.</th>
                <th className="px-4 py-3 text-center">Invitations</th>
                <th className="px-4 py-3 text-center">Acceptées</th>
                <th className="px-4 py-3 text-center">Taux</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {partnerRows.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Aucune donnée</td></tr>
              )}
              {partnerRows.sort((a, b) => b.invitations - a.invitations).map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white">{r.name}</div>
                    <div className="text-xs text-gray-400">{r.code} · {r.status}</div>
                  </td>
                  <td className="px-4 py-3 text-center font-tabular-nums">{r.avgScore}</td>
                  <td className="px-4 py-3 text-center font-tabular-nums">{r.invitations}</td>
                  <td className="px-4 py-3 text-center font-tabular-nums text-green-600">{r.accepted}</td>
                  <td className="px-4 py-3 text-center">{pct(r.accepted, r.invitations)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Table appels */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Appels à partenaires</h2>
        <div className="overflow-x-auto rounded-xl border bg-white dark:bg-gray-900">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Appel</th>
                <th className="px-4 py-3 text-center">Statut</th>
                <th className="px-4 py-3 text-center">Invités</th>
                <th className="px-4 py-3 text-center">Acceptés</th>
                <th className="px-4 py-3 text-center">Déclinés</th>
                <th className="px-4 py-3 text-center">Taux réponse</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {callRows.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Aucun appel créé</td></tr>
              )}
              {callRows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{r.title}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.status === "OPEN" ? "bg-green-100 text-green-700" :
                      r.status === "CLOSED" ? "bg-gray-100 text-gray-600" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-center font-tabular-nums">{r.total}</td>
                  <td className="px-4 py-3 text-center font-tabular-nums text-green-600">{r.accepted}</td>
                  <td className="px-4 py-3 text-center font-tabular-nums text-red-500">{r.declined}</td>
                  <td className="px-4 py-3 text-center">{pct(r.accepted + r.declined, r.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

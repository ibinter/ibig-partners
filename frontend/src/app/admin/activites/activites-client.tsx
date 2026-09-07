"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  LOGIN:                   { label: "Connexion",          color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
  LOGIN_FAILED:            { label: "Échec connexion",    color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
  LOGOUT:                  { label: "Déconnexion",        color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  OTP_SENT:                { label: "OTP envoyé",         color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
  OTP_VERIFIED:            { label: "OTP vérifié",        color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300" },
  REGISTER:                { label: "Inscription",        color: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300" },
  SALE_DECLARED:           { label: "Vente déclarée",     color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300" },
  SALE_CONFIRMED:          { label: "Vente confirmée",    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  MISSION_APPLIED:         { label: "Candidature mission",color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300" },
  MISSION_PROOF_SUBMITTED: { label: "Preuve soumise",     color: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300" },
  PROFILE_UPDATE:          { label: "Profil modifié",     color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  PASSWORD_RESET:          { label: "Réinit. MDP",        color: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300" },
  KYC_SUBMITTED:           { label: "KYC soumis",         color: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300" },
  OPPORTUNITY_CREATED:     { label: "Opportunité créée",  color: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300" },
  CONNECT_REQUEST:         { label: "Connect",            color: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300" },
  PAYOUT_REQUESTED:        { label: "Paiement demandé",   color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
};

function ActionBadge({ action }: { action: string }) {
  const meta = ACTION_LABELS[action] ?? { label: action, color: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${meta.color}`}>
      {meta.label}
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function ActivitesClient({
  logs, total, page, pageSize, filterAction, filterUserId,
  actionGroups, stats, topActive,
}: {
  logs: any[];
  total: number;
  page: number;
  pageSize: number;
  filterAction?: string;
  filterUserId?: string;
  actionGroups: { action: string; _count: { id: number } }[];
  stats: { loginsToday: number; salesToday: number; totalUsers: number; activeToday: number };
  topActive: any[];
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [searchUser, setSearchUser] = useState(filterUserId ?? "");

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.set("page", "1");
    router.push(`/admin/activites?${params}`);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Journal d'activité</h1>
        <p className="text-sm text-gray-500 mt-1">Qui fait quoi, quand — en temps réel</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Connexions aujourd'hui", value: stats.loginsToday, icon: "🟢" },
          { label: "Ventes déclarées aujourd'hui", value: stats.salesToday, icon: "🧾" },
          { label: "Partenaires actifs (24h)", value: stats.activeToday, icon: "👤" },
          { label: "Total partenaires", value: stats.totalUsers, icon: "👥" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{s.value.toLocaleString("fr-FR")}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tableau principal */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filtres */}
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Type d'action</label>
              <select
                value={filterAction ?? ""}
                onChange={(e) => applyFilter("action", e.target.value)}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm px-3 py-2 text-gray-900 dark:text-white"
              >
                <option value="">Toutes les actions</option>
                {actionGroups.map((g) => (
                  <option key={g.action} value={g.action}>
                    {ACTION_LABELS[g.action]?.label ?? g.action} ({g._count.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">ID partenaire</label>
              <div className="flex gap-2">
                <input
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="ID utilisateur..."
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm px-3 py-2 text-gray-900 dark:text-white w-44"
                />
                <button
                  onClick={() => applyFilter("userId", searchUser)}
                  className="rounded-lg bg-indigo-600 text-white text-sm px-3 py-2 font-semibold hover:bg-indigo-700"
                >
                  Filtrer
                </button>
                {(filterAction || filterUserId) && (
                  <button
                    onClick={() => { setSearchUser(""); router.push("/admin/activites"); }}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 text-sm px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tableau */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Partenaire</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Détail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">
                        Aucune activité enregistrée
                      </td>
                    </tr>
                  )}
                  {logs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap tabular-nums text-xs">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {log.user ? (
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-xs">
                              {log.user.firstName} {log.user.lastName}
                            </p>
                            <p className="text-gray-400 text-[10px]">{log.user.code}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <ActionBadge action={log.action} />
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                        {log.detail ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {((page - 1) * pageSize + 1).toLocaleString("fr-FR")}–{Math.min(page * pageSize, total).toLocaleString("fr-FR")} sur {total.toLocaleString("fr-FR")}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => applyFilter("page", String(page - 1))}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  ← Précédent
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => applyFilter("page", String(page + 1))}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Suivant →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-4">
          {/* Répartition par action */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Répartition par action</h3>
            <div className="space-y-2">
              {actionGroups.slice(0, 10).map((g) => {
                const maxCount = actionGroups[0]?._count?.id ?? 1;
                const pct = Math.round((g._count.id / maxCount) * 100);
                const meta = ACTION_LABELS[g.action] ?? { label: g.action, color: "" };
                return (
                  <div key={g.action}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{meta.label}</span>
                      <span className="text-gray-500 tabular-nums">{g._count.id.toLocaleString("fr-FR")}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top partenaires actifs */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Top actifs (7 jours)</h3>
            <div className="space-y-3">
              {topActive.length === 0 && (
                <p className="text-gray-400 text-xs">Aucune activité récente</p>
              )}
              {topActive.map((r: any, i: number) => (
                <div key={r.userId} className="flex items-center gap-3">
                  <span className="text-sm font-black text-gray-400 w-5 text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {r.user ? `${r.user.firstName} ${r.user.lastName}` : "—"}
                    </p>
                    <p className="text-[10px] text-gray-400">{r.user?.code ?? r.userId}</p>
                  </div>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {r._count.id} act.
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

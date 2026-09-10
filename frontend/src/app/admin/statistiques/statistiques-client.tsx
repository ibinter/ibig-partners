"use client";

import { useState, useEffect, useCallback } from "react";

interface StatsData {
  kpis: {
    totalPartners: number;
    activePartners: number;
    totalSales: number;
    monthlySales: number;
    totalRevenue: number;
    monthlyRevenue: number;
    totalMissions: number;
    openMissions: number;
    totalViews: number;
    cpStats: { credited: number; debited: number; net: number; count: number };
  };
  partnerGrowth: { label: string; count: number }[];
  salesGrowth: { label: string; count: number; revenue: number }[];
  missionsByStatus: { status: string; count: number }[];
  topMissions: { title: string; viewCount: number; status: string }[];
  topPartners: { name: string; code: string; count: number }[];
  updatedAt: string;
}

// ── SVG Line Chart ────────────────────────────────────────────────────────────
function LineChart({ data, color, height = 120 }: { data: { label: string; count: number }[]; color: string; height?: number }) {
  if (!data.length) return <p className="text-sm text-gray-400 py-6 text-center">Aucune donnée</p>;
  const max = Math.max(...data.map((d) => d.count), 1);
  const W = 480; const H = height; const PAD = { t: 10, r: 10, b: 28, l: 36 };
  const iW = W - PAD.l - PAD.r; const iH = H - PAD.t - PAD.b;
  const pts = data.map((d, i) => ({ x: PAD.l + (i / (data.length - 1)) * iW, y: PAD.t + (1 - d.count / max) * iH, d }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${path} L${pts[pts.length - 1].x.toFixed(1)},${(PAD.t + iH).toFixed(1)} L${pts[0].x.toFixed(1)},${(PAD.t + iH).toFixed(1)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((r) => {
        const y = PAD.t + r * iH;
        return <line key={r} x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="currentColor" strokeOpacity={0.07} strokeWidth={1} />;
      })}
      {/* Area fill */}
      <path d={area} fill={color} fillOpacity={0.1} />
      {/* Line */}
      <path d={path} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots + labels */}
      {pts.map((p) => (
        <g key={p.d.label}>
          <circle cx={p.x} cy={p.y} r={4} fill={color} stroke="white" strokeWidth={2} />
          <text x={p.x} y={H - 6} textAnchor="middle" fontSize={10} fill="currentColor" fillOpacity={0.55}>{p.d.label}</text>
          {p.d.count > 0 && <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize={10} fill={color} fontWeight={600}>{p.d.count}</text>}
        </g>
      ))}
      {/* Y axis */}
      {[0, max].map((v, i) => (
        <text key={i} x={PAD.l - 5} y={i === 0 ? PAD.t + iH + 4 : PAD.t + 4} textAnchor="end" fontSize={9} fill="currentColor" fillOpacity={0.4}>{v}</text>
      ))}
    </svg>
  );
}

// ── SVG Bar Chart ─────────────────────────────────────────────────────────────
function BarChart({ data, color, height = 130 }: { data: { label: string; count: number }[]; color: string; height?: number }) {
  if (!data.length) return <p className="text-sm text-gray-400 py-6 text-center">Aucune donnée</p>;
  const max = Math.max(...data.map((d) => d.count), 1);
  const W = 480; const H = height; const PAD = { t: 20, r: 10, b: 28, l: 8 };
  const iW = W - PAD.l - PAD.r; const iH = H - PAD.t - PAD.b;
  const gap = 6; const bw = iW / data.length - gap;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {[0, 0.5, 1].map((r) => {
        const y = PAD.t + (1 - r) * iH;
        return <line key={r} x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="currentColor" strokeOpacity={0.07} strokeWidth={1} />;
      })}
      {data.map((d, i) => {
        const bh = Math.max((d.count / max) * iH, 2);
        const x = PAD.l + i * (bw + gap);
        const y = PAD.t + iH - bh;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={bw} height={bh} fill={color} rx={3} fillOpacity={0.85} />
            {d.count > 0 && <text x={x + bw / 2} y={y - 4} textAnchor="middle" fontSize={10} fill={color} fontWeight={600}>{d.count}</text>}
            <text x={x + bw / 2} y={H - 6} textAnchor="middle" fontSize={10} fill="currentColor" fillOpacity={0.5}>{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── SVG Donut ─────────────────────────────────────────────────────────────────
const DONUT_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7"];
function DonutChart({ data, size = 140 }: { data: { label: string; count: number }[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (!total) return <p className="text-sm text-gray-400 py-6 text-center">Aucune donnée</p>;
  const R = size / 2; const r = R * 0.62; const cx = R; const cy = R;
  let angle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const sweep = (d.count / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(angle); const y1 = cy + R * Math.sin(angle);
    angle += sweep;
    const x2 = cx + R * Math.cos(angle); const y2 = cy + R * Math.sin(angle);
    const largeArc = sweep > Math.PI ? 1 : 0;
    const ix1 = cx + r * Math.cos(angle - sweep); const iy1 = cy + r * Math.sin(angle - sweep);
    const ix2 = cx + r * Math.cos(angle); const iy2 = cy + r * Math.sin(angle);
    return { path: `M${x1},${y1} A${R},${R},0,${largeArc},1,${x2},${y2} L${ix2},${iy2} A${r},${r},0,${largeArc},0,${ix1},${iy1} Z`, color: DONUT_COLORS[i % DONUT_COLORS.length], d };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size, flexShrink: 0 }}>
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} />)}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={18} fontWeight={700} fill="currentColor">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.5}>TOTAL</text>
      </svg>
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
            <span className="truncate text-gray-600 dark:text-gray-400">{s.d.label}</span>
            <span className="ml-auto font-semibold tabular-nums">{s.d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── KPI Tile ──────────────────────────────────────────────────────────────────
function KpiTile({ label, value, sub, color, icon }: { label: string; value: string | number; sub: string; color: string; icon: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xl">{icon}</span>
        <span className={`text-3xl font-bold tabular-nums ${color}`}>{typeof value === "number" ? value.toLocaleString("fr-FR") : value}</span>
      </div>
      <div className="font-medium text-sm mt-1">{label}</div>
      <div className="text-xs text-gray-500">{sub}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function StatistiquesClient({ initial }: { initial: StatsData }) {
  const [data, setData] = useState<StatsData>(initial);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastRefresh(new Date());
      }
    } catch {}
    setLoading(false);
  }, []);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  const { kpis, partnerGrowth, salesGrowth, missionsByStatus, topMissions, topPartners } = data;

  const statusLabels: Record<string, string> = {
    OPEN: "Ouvertes", CLOSED: "Fermées", DRAFT: "Brouillon", ARCHIVED: "Archivées",
  };

  return (
    <div className="space-y-8">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Mise à jour : <span className="tabular-nums">{lastRefresh.toLocaleTimeString("fr-FR")}</span>
            {loading && <span className="ml-2 inline-block w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin align-middle" />}
          </p>
        </div>
        <button onClick={refresh} disabled={loading}
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
          ↻ Actualiser
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiTile label="Partenaires" value={kpis.totalPartners} sub={`${kpis.activePartners} approuvés`} color="text-blue-600" icon="👥" />
        <KpiTile label="Ventes totales" value={kpis.totalSales} sub={`${kpis.monthlySales} ce mois`} color="text-green-600" icon="🛒" />
        <KpiTile label="CA (FCFA)" value={kpis.totalRevenue.toLocaleString("fr-FR")} sub={`${kpis.monthlyRevenue.toLocaleString("fr-FR")} ce mois`} color="text-emerald-600" icon="💰" />
        <KpiTile label="Missions" value={kpis.totalMissions} sub={`${kpis.openMissions} ouvertes`} color="text-purple-600" icon="📋" />
        <KpiTile label="Vues missions" value={kpis.totalViews} sub="Total cumulé" color="text-sky-600" icon="👁️" />
        <KpiTile label="CP crédités" value={kpis.cpStats.credited} sub={`${kpis.cpStats.debited.toLocaleString("fr-FR")} utilisés`} color="text-amber-600" icon="⭐" />
        <KpiTile label="Solde CP net" value={kpis.cpStats.net} sub={`${kpis.cpStats.count} transactions`} color="text-orange-600" icon="🔄" />
        <KpiTile label="Partenaires actifs" value={kpis.activePartners} sub={`${kpis.totalPartners > 0 ? Math.round((kpis.activePartners / kpis.totalPartners) * 100) : 0}% du total`} color="text-teal-600" icon="✅" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold mb-4">📈 Nouveaux partenaires (6 mois)</h2>
          <LineChart data={partnerGrowth} color="#3b82f6" />
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold mb-4">🛒 Ventes par mois (6 mois)</h2>
          <BarChart data={salesGrowth} color="#22c55e" />
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold mb-4">📋 Missions par statut</h2>
          <DonutChart
            data={missionsByStatus.map((m) => ({ label: statusLabels[m.status] ?? m.status, count: m.count }))}
            size={140}
          />
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold mb-4">👁️ Missions les plus vues</h2>
          {topMissions.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">Aucune vue enregistrée</p>
          ) : (
            <div className="space-y-3">
              {topMissions.map((m, i) => {
                const maxV = Math.max(...topMissions.map((x) => x.viewCount), 1);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{m.title}</div>
                      <div className="h-1.5 mt-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 rounded-full" style={{ width: `${(m.viewCount / maxV) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-sky-600 tabular-nums flex-shrink-0">{m.viewCount.toLocaleString("fr-FR")}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top partenaires */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-base font-semibold mb-4">🏆 Top 5 partenaires (ventes)</h2>
        {topPartners.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune vente enregistrée.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {topPartners.map((p, i) => {
              const maxC = Math.max(...topPartners.map((x) => x.count), 1);
              const colors = ["bg-yellow-400", "bg-gray-300", "bg-amber-600", "bg-slate-400", "bg-slate-300"];
              return (
                <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                  <div className={`w-8 h-8 rounded-full ${colors[i]} flex items-center justify-center text-white font-black text-sm`}>{i + 1}</div>
                  <div className="text-sm font-semibold truncate w-full">{p.name}</div>
                  <div className="text-xs text-gray-400">{p.code}</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: `${(p.count / maxC) * 100}%` }} />
                  </div>
                  <span className="text-lg font-bold text-green-600 tabular-nums">{p.count}</span>
                  <span className="text-xs text-gray-500">ventes</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Revenue timeline */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-base font-semibold mb-4">💰 CA mensuel (FCFA)</h2>
        <BarChart
          data={salesGrowth.map((s) => ({ label: s.label, count: Math.round(s.revenue / 1000) }))}
          color="#10b981"
          height={140}
        />
        <p className="text-xs text-gray-400 mt-1 text-right">Valeurs en milliers de FCFA</p>
      </div>
    </div>
  );
}

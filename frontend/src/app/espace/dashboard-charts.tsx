"use client";

import { useMemo } from "react";

// ── Types ───────────────────────────────────────────────────────────────────
export type SalePoint  = { createdAt: string };
export type CommPoint  = { createdAt: string; amount: number; status: string };

interface Props {
  sales:       SalePoint[];
  commissions: CommPoint[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function getWeekKey(d: Date) {
  // ISO week start (Monday)
  const day = d.getDay() === 0 ? 7 : d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() - day + 1);
  mon.setHours(0, 0, 0, 0);
  return mon.toISOString().slice(0, 10);
}

function getMonthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function shortWeekLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function shortMonthLabel(iso: string) {
  const [, m] = iso.split("-");
  const months = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
  return months[Number(m) - 1] ?? iso;
}

function fcfa(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}k`;
  return String(Math.round(n));
}

// ── SVG Bar Chart ────────────────────────────────────────────────────────────
function BarChart({
  data,
  color,
  formatVal,
}: {
  data: { label: string; value: number }[];
  color: string;
  formatVal: (v: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const W = 300;
  const H = 90;
  const barW = Math.floor((W - (data.length - 1) * 4) / data.length);

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H + 20}`}
        width="100%"
        style={{ minWidth: `${Math.max(240, data.length * 28)}px` }}
        className="select-none"
      >
        {data.map((d, i) => {
          const bh = Math.max(2, (d.value / max) * H);
          const x = i * (barW + 4);
          const y = H - bh;
          const isMax = d.value === max && d.value > 0;
          return (
            <g key={d.label}>
              <rect
                x={x} y={y} width={barW} height={bh} rx={4}
                fill={isMax ? color.replace("/70", "") : color}
                opacity={d.value === 0 ? 0.2 : 0.85}
              />
              {d.value > 0 && (
                <text
                  x={x + barW / 2} y={y - 3}
                  textAnchor="middle" fontSize={8} fill="#64748b" fontWeight="600"
                >
                  {formatVal(d.value)}
                </text>
              )}
              <text
                x={x + barW / 2} y={H + 14}
                textAnchor="middle" fontSize={7.5} fill="#94a3b8"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DashboardCharts({ sales, commissions }: Props) {
  // ── Weekly sales (8 weeks) ──────────────────────────────────────────────
  const weeklySales = useMemo(() => {
    const now = new Date();
    const keys: string[] = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i * 7);
      keys.push(getWeekKey(d));
    }
    const counts: Record<string, number> = {};
    for (const k of keys) counts[k] = 0;
    for (const s of sales) {
      const k = getWeekKey(new Date(s.createdAt));
      if (k in counts) counts[k]++;
    }
    return keys.map((k) => ({ label: shortWeekLabel(k), value: counts[k] }));
  }, [sales]);

  // ── Monthly commissions (6 months) ─────────────────────────────────────
  const monthlyComms = useMemo(() => {
    const now = new Date();
    const keys: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      keys.push(getMonthKey(d));
    }
    const totals: Record<string, number> = {};
    for (const k of keys) totals[k] = 0;
    for (const c of commissions) {
      if (c.status === "PAID" || c.status === "VALIDATED" || c.status === "PENDING") {
        const k = getMonthKey(new Date(c.createdAt));
        if (k in totals) totals[k] += c.amount;
      }
    }
    return keys.map((k) => ({ label: shortMonthLabel(k), value: totals[k] }));
  }, [commissions]);

  const totalWeekSales  = weeklySales.reduce((a, d) => a + d.value, 0);
  const totalMonthComm  = monthlyComms.reduce((a, d) => a + d.value, 0);

  // Latest week vs previous week for trend
  const lastWeek = weeklySales[weeklySales.length - 1]?.value ?? 0;
  const prevWeek = weeklySales[weeklySales.length - 2]?.value ?? 0;
  const weekTrend = prevWeek === 0 ? null : ((lastWeek - prevWeek) / prevWeek) * 100;

  // Latest month vs previous
  const lastMonth = monthlyComms[monthlyComms.length - 1]?.value ?? 0;
  const prevMonth = monthlyComms[monthlyComms.length - 2]?.value ?? 0;
  const monthTrend = prevMonth === 0 ? null : ((lastMonth - prevMonth) / prevMonth) * 100;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Ventes hebdomadaires */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Ventes — 8 dernières semaines</h3>
            <p className="text-xs text-slate-400 mt-0.5">{totalWeekSales} vente{totalWeekSales !== 1 ? "s" : ""} sur la période</p>
          </div>
          {weekTrend !== null && (
            <span className={`rounded-xl px-2.5 py-1 text-xs font-bold ${weekTrend >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
              {weekTrend >= 0 ? "▲" : "▼"} {Math.abs(weekTrend).toFixed(0)}%
            </span>
          )}
        </div>
        {totalWeekSales === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-300 space-y-2">
            <span className="text-4xl">📊</span>
            <p className="text-xs font-semibold text-slate-400">Aucune vente ces 8 semaines</p>
            <p className="text-xs text-slate-300">Partagez vos liens pour commencer</p>
          </div>
        ) : (
          <BarChart data={weeklySales} color="#3b82f6" formatVal={(v) => String(v)} />
        )}
      </div>

      {/* Commissions mensuelles */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Commissions — 6 derniers mois</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Total : <span className="font-bold text-slate-700">{fcfa(totalMonthComm)} FCFA</span>
            </p>
          </div>
          {monthTrend !== null && (
            <span className={`rounded-xl px-2.5 py-1 text-xs font-bold ${monthTrend >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
              {monthTrend >= 0 ? "▲" : "▼"} {Math.abs(monthTrend).toFixed(0)}%
            </span>
          )}
        </div>
        {totalMonthComm === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
            <span className="text-4xl">💰</span>
            <p className="text-xs font-semibold text-slate-400">Aucune commission ces 6 mois</p>
            <p className="text-xs text-slate-300">Vos commissions apparaîtront ici</p>
          </div>
        ) : (
          <BarChart data={monthlyComms} color="#10b981" formatVal={(v) => `${fcfa(v)}`} />
        )}
      </div>
    </div>
  );
}

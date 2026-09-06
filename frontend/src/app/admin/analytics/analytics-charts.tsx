"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type MonthPoint = {
  month: string;
  ventes: number;
  montant: number;
  commissions: number;
};

const FCFA = (n: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n);

export default function AnalyticsCharts({ data }: { data: MonthPoint[] }) {
  return (
    <div className="space-y-6">
      {/* Ventes + commissions sur 12 mois */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 text-sm mb-1">Évolution mensuelle — 12 mois</h3>
        <p className="text-xs text-slate-400 mb-4">Nombre de ventes confirmées et commissions générées</p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gVentes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gComm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={30} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={60} tickFormatter={(v) => FCFA(v)} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
              formatter={(value, name) =>
                name === "Ventes" ? [value, "Ventes"] : [`${FCFA(Number(value))} FCFA`, name]
              }
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area yAxisId="left" type="monotone" dataKey="ventes" name="Ventes" stroke="#3b82f6" fill="url(#gVentes)" strokeWidth={2} dot={false} />
            <Area yAxisId="right" type="monotone" dataKey="commissions" name="Commissions" stroke="#10b981" fill="url(#gComm)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Montant des ventes */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 text-sm mb-1">Chiffre d'affaires mensuel</h3>
        <p className="text-xs text-slate-400 mb-4">Montant total des ventes confirmées par mois</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={70} tickFormatter={(v) => FCFA(v)} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
              formatter={(v) => [`${FCFA(Number(v))} FCFA`, "Montant"]}
            />
            <Bar dataKey="montant" name="Montant" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

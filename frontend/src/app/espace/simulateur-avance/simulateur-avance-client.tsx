"use client";
import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const MONTHS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

export default function SimulateurAvanceClient({
  baseSalesPerMonth,
  avgCommission,
  referrals,
}: {
  baseSalesPerMonth: number;
  avgCommission: number;
  referrals: number;
}) {
  const [salesPerMonth, setSalesPerMonth] = useState(baseSalesPerMonth);
  const [commPerSale, setCommPerSale] = useState(avgCommission);
  const [growth, setGrowth] = useState(10); // % croissance mensuelle
  const [horizon, setHorizon] = useState(12);

  const data = useMemo(() => {
    const now = new Date();
    return Array.from({ length: horizon }, (_, i) => {
      const factor = Math.pow(1 + growth / 100, i);
      const sales = Math.round(salesPerMonth * factor);
      const directComm = sales * commPerSale;
      const n2Comm = Math.round(referrals * sales * commPerSale * 0.05);
      const month = MONTHS_FR[(now.getMonth() + i + 1) % 12];
      return { month, sales, direct: directComm, reseau: n2Comm, total: directComm + n2Comm };
    });
  }, [salesPerMonth, commPerSale, growth, horizon, referrals]);

  const totalRevenu = data.reduce((s, d) => s + d.total, 0);
  const totalVentes = data.reduce((s, d) => s + d.sales, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border p-3 space-y-2">
          <label className="text-xs font-medium text-gray-500">Ventes/mois (base)</label>
          <input type="number" min={1} max={100} value={salesPerMonth} onChange={(e) => setSalesPerMonth(+e.target.value)}
            className="w-full rounded-lg border px-2 py-1 text-sm font-bold" />
        </div>
        <div className="rounded-2xl border p-3 space-y-2">
          <label className="text-xs font-medium text-gray-500">Commission moy. (FCFA)</label>
          <input type="number" min={1000} step={1000} value={commPerSale} onChange={(e) => setCommPerSale(+e.target.value)}
            className="w-full rounded-lg border px-2 py-1 text-sm font-bold" />
        </div>
        <div className="rounded-2xl border p-3 space-y-2">
          <label className="text-xs font-medium text-gray-500">Croissance mensuelle (%)</label>
          <input type="number" min={0} max={50} value={growth} onChange={(e) => setGrowth(+e.target.value)}
            className="w-full rounded-lg border px-2 py-1 text-sm font-bold" />
        </div>
        <div className="rounded-2xl border p-3 space-y-2">
          <label className="text-xs font-medium text-gray-500">Horizon</label>
          <select value={horizon} onChange={(e) => setHorizon(+e.target.value)} className="w-full rounded-lg border px-2 py-1 text-sm font-bold">
            <option value={3}>3 mois</option>
            <option value={6}>6 mois</option>
            <option value={12}>12 mois</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border p-4 text-center">
          <p className="text-2xl font-black text-emerald-600">{totalRevenu.toLocaleString()} FCFA</p>
          <p className="text-xs text-gray-500 mt-1">Revenus projetés sur {horizon} mois</p>
        </div>
        <div className="rounded-2xl border p-4 text-center">
          <p className="text-2xl font-black text-indigo-600">{totalVentes}</p>
          <p className="text-xs text-gray-500 mt-1">Ventes projetées sur {horizon} mois</p>
        </div>
      </div>

      <div className="rounded-2xl border p-4">
        <p className="text-sm font-semibold mb-4">Projection des revenus</p>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="gDirect" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gReseau" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => `${Number(v ?? 0).toLocaleString()} FCFA`} />
            <Legend />
            <Area type="monotone" dataKey="direct" name="Commissions directes" stroke="#6366f1" fill="url(#gDirect)" strokeWidth={2} />
            <Area type="monotone" dataKey="reseau" name="Commissions réseau" stroke="#10b981" fill="url(#gReseau)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {["Mois", "Ventes", "Comm. directes", "Comm. réseau", "Total"].map((h) => (
                <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-2 font-medium">{row.month}</td>
                <td className="px-4 py-2">{row.sales}</td>
                <td className="px-4 py-2">{row.direct.toLocaleString()}</td>
                <td className="px-4 py-2">{row.reseau.toLocaleString()}</td>
                <td className="px-4 py-2 font-bold text-emerald-600">{row.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

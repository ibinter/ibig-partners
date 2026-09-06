"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

export default function ComparaisonClient({ allPartners, selectedIds, compareData }: {
  allPartners: any[];
  selectedIds: string[];
  compareData: any[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(selectedIds);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  }

  function compare() {
    router.push(`/admin/comparaison?ids=${selected.join(",")}`);
  }

  const radarData = compareData.length > 0 ? [
    { axis: "Ventes",      ...Object.fromEntries(compareData.map((d) => [d.name, Math.min(100, d.sales * 5)])) },
    { axis: "Filleuls",    ...Object.fromEntries(compareData.map((d) => [d.name, Math.min(100, d.referrals * 10)])) },
    { axis: "Leads WON",   ...Object.fromEntries(compareData.map((d) => [d.name, Math.min(100, d.leads * 20)])) },
    { axis: "Commissions", ...Object.fromEntries(compareData.map((d) => [d.name, Math.min(100, d.commissions)])) },
    { axis: "Score",       ...Object.fromEntries(compareData.map((d) => [d.name, d.score])) },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Comparateur de partenaires</h1>
        <p className="text-slate-500 text-sm mt-1">Sélectionnez 2 à 5 partenaires puis comparez leur performance.</p>
      </div>

      {/* Sélecteur */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2 mb-4 max-h-48 overflow-y-auto">
          {allPartners.map((p) => {
            const isSelected = selected.includes(p.id);
            return (
              <button key={p.id} onClick={() => toggle(p.id)}
                className={`rounded-xl px-3 py-1.5 text-sm font-medium border transition-all ${isSelected
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300"}`}>
                {p.firstName} {p.lastName}
                {isSelected && <span className="ml-1 opacity-70">✓</span>}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">{selected.length}/5 partenaires sélectionnés</span>
          <button onClick={compare} disabled={selected.length < 2}
            className="rounded-xl bg-indigo-600 text-white px-5 py-2 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 transition-colors">
            Comparer →
          </button>
        </div>
      </div>

      {/* Radar */}
      {compareData.length > 1 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Radar de performance</h2>
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip />
              <Legend />
              {compareData.map((d, i) => (
                <Radar key={d.id} name={d.name} dataKey={d.name}
                  stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.15} />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tableau comparatif */}
      {compareData.length > 1 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm overflow-x-auto">
          <h2 className="font-semibold text-slate-800 mb-4">Tableau comparatif</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 pr-4 text-slate-500 font-medium">Indicateur</th>
                {compareData.map((d, i) => (
                  <th key={d.id} className="text-right py-2 px-3 font-semibold" style={{ color: COLORS[i % COLORS.length] }}>
                    {d.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Niveau", (d: any) => d.status],
                ["Ventes confirmées", (d: any) => d.sales],
                ["Filleuls", (d: any) => d.referrals],
                ["Leads WON", (d: any) => d.leads],
                ["Commissions (k FCFA)", (d: any) => d.commissions.toFixed(1)],
                ["Score global", (d: any) => `${d.score}/100`],
              ].map(([label, fn]) => (
                <tr key={String(label)} className="border-b border-slate-50 last:border-0">
                  <td className="py-2 pr-4 text-slate-600">{String(label)}</td>
                  {compareData.map((d) => (
                    <td key={d.id} className="text-right py-2 px-3 font-medium text-slate-800">{(fn as any)(d)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

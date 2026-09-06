"use client";

import { useEffect, useState, useCallback } from "react";

type AdminKpis = {
  salesToday: number;
  salesMonth: number;
  commPending: number;
  pendingPartners: number;
  openTickets: number;
  pendingPayouts: number;
  updatedAt: string;
};

function fcfa(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(n);
}

export default function AdminLiveKpis({ initial }: { initial: AdminKpis }) {
  const [kpis, setKpis] = useState(initial);
  const [flash, setFlash] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/live-kpis");
      if (!res.ok) return;
      const data = await res.json();
      setKpis(data);
      setFlash(true);
      setTimeout(() => setFlash(false), 800);
    } catch {}
  }, []);

  useEffect(() => {
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  const cards = [
    { label: "Ventes aujourd'hui", value: kpis.salesToday, format: "count", color: "text-blue-600", bg: "bg-blue-50", alert: false },
    { label: "CA ce mois", value: kpis.salesMonth, format: "fcfa", color: "text-emerald-600", bg: "bg-emerald-50", alert: false },
    { label: "Commissions en attente", value: kpis.commPending, format: "fcfa", color: "text-amber-600", bg: "bg-amber-50", alert: kpis.commPending > 0 },
    { label: "Partenaires à valider", value: kpis.pendingPartners, format: "count", color: "text-rose-600", bg: "bg-rose-50", alert: kpis.pendingPartners > 0 },
    { label: "Tickets ouverts", value: kpis.openTickets, format: "count", color: "text-violet-600", bg: "bg-violet-50", alert: kpis.openTickets > 0 },
    { label: "Paiements en attente", value: kpis.pendingPayouts, format: "count", color: "text-orange-600", bg: "bg-orange-50", alert: kpis.pendingPayouts > 0 },
  ];

  return (
    <div className={`rounded-2xl border p-4 mb-6 transition-all ${flash ? "border-emerald-300 ring-2 ring-emerald-200" : "border-slate-100 bg-white"} shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">KPIs live</span>
        <button onClick={refresh} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">↻ Actualiser</button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-xl p-3 ${c.bg}`}>
            <p className={`text-xl font-extrabold tabular-nums ${c.color}`}>
              {c.alert && <span className="mr-1">⚠</span>}
              {c.format === "fcfa" ? fcfa(c.value as number) : String(c.value)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{c.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-slate-300 text-right">
        Mis à jour : {new Date(kpis.updatedAt).toLocaleTimeString("fr-FR")} · actualisation auto toutes les 30s
      </p>
    </div>
  );
}

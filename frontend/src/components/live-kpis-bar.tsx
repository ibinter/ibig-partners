"use client";

import { useState, useEffect, useCallback } from "react";

type LiveKpis = {
  salesToday: number;
  salesMonth: number;
  commPending: number;
  prospectsUrgent: number;
  unreadNotif: number;
  updatedAt: string;
};

function fcfaShort(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toLocaleString("fr-FR");
}

export default function LiveKpisBar({ initial }: { initial: LiveKpis }) {
  const [kpis, setKpis] = useState<LiveKpis>(initial);
  const [fresh, setFresh] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/espace/live-kpis", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setKpis(data);
      setFresh(true);
      setTimeout(() => setFresh(false), 1500);
    } catch {}
  }, []);

  useEffect(() => {
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, [refresh]);

  const time = new Date(kpis.updatedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const items = [
    { label: "Ventes aujourd'hui", value: kpis.salesToday, suffix: "", color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Ventes ce mois", value: kpis.salesMonth, suffix: "", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Commissions en attente", value: `${fcfaShort(kpis.commPending)} FCFA`, suffix: "", color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Relances urgentes", value: kpis.prospectsUrgent, suffix: "", color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <div className={`rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all ${fresh ? "ring-2 ring-emerald-300" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Tableau de bord live</h3>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-slate-400">Mis à jour {time}</span>
          <button onClick={refresh} className="ml-2 text-[10px] text-blue-500 hover:underline">↻ Actualiser</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className={`rounded-xl px-3 py-2.5 ${item.bg}`}>
            <p className={`text-xl font-bold tabular-nums ${item.color}`}>
              {typeof item.value === "number" ? item.value : item.value}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

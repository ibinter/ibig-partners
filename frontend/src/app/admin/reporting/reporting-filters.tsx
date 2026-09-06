"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

const SALE_STATUSES = [
  { value: "", label: "Tous statuts" },
  { value: "CONFIRMED", label: "Confirmées" },
  { value: "PENDING", label: "En attente" },
  { value: "REJECTED", label: "Rejetées" },
];

type Props = {
  branches: string[];
  partners: { code: string; name: string }[];
  current: { from?: string; to?: string; status: string; branch: string; partner: string };
};

export default function ReportingFilters({ branches, partners, current }: Props) {
  const router   = useRouter();
  const pathname = usePathname();

  const today   = new Date().toISOString().slice(0, 10);
  const month1  = new Date(new Date().setDate(1)).toISOString().slice(0, 10);

  const [from,    setFrom]    = useState(current.from    ?? month1);
  const [to,      setTo]      = useState(current.to      ?? today);
  const [status,  setStatus]  = useState(current.status);
  const [branch,  setBranch]  = useState(current.branch);
  const [partner, setPartner] = useState(current.partner);

  function apply() {
    const p = new URLSearchParams();
    if (from)    p.set("from",    from);
    if (to)      p.set("to",      to);
    if (status)  p.set("status",  status);
    if (branch)  p.set("branch",  branch);
    if (partner) p.set("partner", partner);
    router.push(`${pathname}?${p.toString()}`);
  }

  function reset() {
    setFrom(month1); setTo(today); setStatus(""); setBranch(""); setPartner("");
    router.push(pathname);
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1 min-w-[130px]">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Du</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex flex-col gap-1 min-w-[130px]">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Au</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Statut</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {SALE_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1 min-w-[150px]">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Branche</label>
          <select value={branch} onChange={(e) => setBranch(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Toutes branches</option>
            {branches.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1 min-w-[180px]">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Partenaire</label>
          <select value={partner} onChange={(e) => setPartner(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tous partenaires</option>
            {partners.map((p) => (
              <option key={p.code} value={p.code}>{p.name} ({p.code})</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 self-end">
          <button onClick={apply}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition">
            Filtrer
          </button>
          <button onClick={reset}
            className="rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition">
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  );
}

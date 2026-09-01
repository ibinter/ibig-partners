"use client";

import { useState, useMemo } from "react";
import CopyButton from "./copy-button";
import QrCard from "./qr-card";
import { ViralShare } from "@/components/viral-share";

type LinkCard = {
  id: string;
  productName: string;
  productSlug: string;
  branchName: string;
  pricingType: string;
  price: number;
  priceDisplay: string;
  commissionDisplay: string;
  clicks: number;
  sales: number;
  url: string;
  affiliateCode: string;
  partnerName: string;
  baseUrl: string;
};

type Props = {
  cards: LinkCard[];
  branches: string[];
};

const SORT_OPTIONS = [
  { key: "clicks", label: "Clics" },
  { key: "sales",  label: "Ventes" },
  { key: "name",   label: "A→Z" },
];

export default function LiensClient({ cards, branches }: Props) {
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("all");
  const [sort, setSort]     = useState("clicks");

  const filtered = useMemo(() => {
    return cards
      .filter((c) => {
        const matchBranch = branch === "all" || c.branchName === branch;
        const matchSearch =
          !search ||
          c.productName.toLowerCase().includes(search.toLowerCase()) ||
          c.branchName.toLowerCase().includes(search.toLowerCase());
        return matchBranch && matchSearch;
      })
      .sort((a, b) => {
        if (sort === "clicks") return b.clicks - a.clicks;
        if (sort === "sales")  return b.sales - a.sales;
        return a.productName.localeCompare(b.productName);
      });
  }, [cards, search, branch, sort]);

  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <p className="text-4xl mb-3">🔗</p>
        <p className="text-sm text-slate-500 mb-1">Aucun lien actif.</p>
        <p className="text-xs text-slate-400">
          Rendez-vous dans{" "}
          <a href="/espace/produits" className="text-blue-600 font-semibold hover:underline">
            Mes Produits
          </a>{" "}
          pour activer des produits à promouvoir.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barre de contrôle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <input
          type="search"
          placeholder="Rechercher un produit ou une branche…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
        />
        <select
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 outline-none focus:border-blue-400"
        >
          <option value="all">Toutes les branches</option>
          {branches.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <div className="flex gap-1.5 shrink-0">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.key}
              onClick={() => setSort(o.key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                sort === o.key
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <p className="shrink-0 text-xs text-slate-400">
          {filtered.length} lien{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-400">
          Aucun lien pour ces critères.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((card) => (
            <div
              key={card.id}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-100 px-5 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">{card.branchName}</p>
                  <h3 className="font-semibold text-sm text-slate-800 mt-0.5 truncate">{card.productName}</h3>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      N1 : {card.commissionDisplay}
                    </span>
                    {card.price > 0 && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                        {card.priceDisplay}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex items-center gap-1 rounded-xl bg-white border border-slate-100 px-2.5 py-1 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span className="text-xs font-semibold text-slate-600">{card.clicks} clic{card.clicks !== 1 ? "s" : ""}</span>
                  </div>
                  {card.sales > 0 && (
                    <div className="flex items-center gap-1 rounded-xl bg-emerald-50 border border-emerald-100 px-2.5 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-semibold text-emerald-600">{card.sales} vente{card.sales !== 1 ? "s" : ""}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* URL + QR */}
              <div className="p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5 font-mono text-xs text-slate-500 break-all leading-relaxed">
                    {card.url}
                  </div>
                  <div className="mt-2.5 flex items-center gap-3">
                    <CopyButton text={card.url} />
                    {card.clicks > 0 && (
                      <span className="text-[11px] text-slate-400">
                        {card.sales > 0
                          ? `Conv. : ${((card.sales / card.clicks) * 100).toFixed(1)} %`
                          : "Aucune vente"}
                      </span>
                    )}
                  </div>
                </div>
                <QrCard url={card.url} slug={card.productSlug} />
              </div>

              {/* Viral share */}
              <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-4">
                <ViralShare
                  productName={card.productName}
                  affiliateCode={card.affiliateCode}
                  partnerName={card.partnerName}
                  baseUrl={card.baseUrl}
                  link={card.url}
                  pricingType={card.pricingType}
                  price={card.price}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

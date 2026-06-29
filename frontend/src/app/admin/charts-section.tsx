"use client";

import { useEffect, useState } from "react";
import { RevenueBarChart } from "@/components/charts";

type MonthData = { mois: string; ca: number; commissions: number };

export function AdminChartsSection() {
  const [data, setData] = useState<MonthData[]>([]);

  useEffect(() => {
    fetch("/admin/stats")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (data.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center text-sm text-muted">
        Chargement du graphique…
      </div>
    );
  }

  return <RevenueBarChart data={data} />;
}

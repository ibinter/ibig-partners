"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Rec = { priority: "high" | "medium" | "low"; icon: string; title: string; action: string; href: string };

const priorityColor: Record<string, string> = {
  high: "border-l-red-500 bg-red-50 dark:bg-red-900/10",
  medium: "border-l-amber-500 bg-amber-50 dark:bg-amber-900/10",
  low: "border-l-indigo-400 bg-indigo-50 dark:bg-indigo-900/10",
};

export default function AiRecommendationsWidget() {
  const [recs, setRecs] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/espace/ai-recommendations")
      .then((r) => r.json())
      .then((d) => { setRecs(d.recommendations ?? []); setLoading(false); });
  }, []);

  if (loading) return <div className="h-20 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl" />;
  if (recs.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">✨ Recommandations IA</p>
      <div className="space-y-2">
        {recs.map((r, i) => (
          <Link key={i} href={r.href}
            className={`flex items-center justify-between gap-3 rounded-2xl border-l-4 px-4 py-3 transition-opacity hover:opacity-80 ${priorityColor[r.priority]}`}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{r.icon}</span>
              <div>
                <p className="text-sm font-semibold">{r.title}</p>
                <p className="text-xs text-gray-500">{r.action}</p>
              </div>
            </div>
            <span className="shrink-0 text-gray-400">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";

export function VisitCounter() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/visit").then(r => r.json()).then(d => setCount(d.total)).catch(() => {});
  }, []);
  if (count === null) return null;
  return (
    <div className="text-center text-xs text-slate-400 py-3 border-t border-slate-100 mt-4">
      👁️ <span className="font-semibold tabular-nums">{count.toLocaleString("fr-FR")}</span> visites sur ce site
    </div>
  );
}

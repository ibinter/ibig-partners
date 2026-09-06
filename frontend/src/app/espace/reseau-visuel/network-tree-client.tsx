"use client";
import { useState } from "react";

type Node = { id: string; name: string; affiliateCode: string; children: Node[] };

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

function TreeNode({ node, depth }: { node: Node; depth: number }) {
  const [open, setOpen] = useState(depth < 2);
  const color = COLORS[depth] ?? "#6b7280";
  const hasChildren = node.children.length > 0;

  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center gap-2">
        {depth > 0 && <div className="w-6 border-t-2 border-dashed" style={{ borderColor: color }} />}
        <button
          onClick={() => hasChildren && setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm transition-all hover:shadow-md"
          style={{ borderColor: color, backgroundColor: `${color}18` }}
        >
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-gray-900 dark:text-white">{node.name || "Partenaire"}</span>
          {hasChildren && (
            <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: color }}>
              {node.children.length}
            </span>
          )}
          {hasChildren && <span className="text-xs text-gray-400">{open ? "▲" : "▼"}</span>}
        </button>
      </div>
      {open && hasChildren && (
        <div className="ml-9 mt-2 flex flex-col gap-2 border-l-2 border-dashed pl-4" style={{ borderColor: color }}>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function NetworkTreeClient({ tree }: { tree: Node }) {
  return (
    <div className="rounded-2xl border bg-white dark:bg-gray-900 p-6 overflow-x-auto">
      <div className="flex gap-4 flex-wrap mb-4">
        {["Vous", "Niveau 1", "Niveau 2", "Niveau 3"].map((label, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
            {label}
          </div>
        ))}
      </div>
      <TreeNode node={tree} depth={0} />
      {tree.children.length === 0 && (
        <p className="text-sm text-gray-400 mt-4">Aucun filleul pour l&apos;instant. Partagez votre lien pour construire votre réseau.</p>
      )}
    </div>
  );
}

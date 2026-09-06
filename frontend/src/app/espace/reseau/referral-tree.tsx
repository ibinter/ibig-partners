"use client";

interface TreeNode {
  id: string;
  name: string;
  code: string;
  status: string;
  sales: number;
  children: TreeNode[];
}

const STATUS_COLOR: Record<string, string> = {
  STARTER: "#94a3b8", SILVER: "#64748b", GOLD: "#eab308",
  MASTER: "#8b5cf6", ELITE: "#10b981",
};

function Node({ node, x, y, level }: { node: TreeNode; x: number; y: number; level: number }) {
  const color = STATUS_COLOR[node.status] ?? "#94a3b8";
  const r = level === 0 ? 28 : level === 1 ? 22 : 16;
  const childCount = node.children.length;
  const childY = y + (level === 0 ? 110 : 90);
  const totalW = childCount > 1 ? (childCount - 1) * (level === 1 ? 120 : 90) : 0;
  const startX = x - totalW / 2;

  return (
    <g>
      {node.children.map((child, i) => {
        const cx = startX + i * (level === 1 ? 120 : 90);
        return (
          <line key={child.id} x1={x} y1={y + r} x2={cx} y2={childY - (level === 0 ? 22 : 16)}
            stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 3" />
        );
      })}
      <circle cx={x} cy={y} r={r} fill={color} fillOpacity={0.15} stroke={color} strokeWidth="2" />
      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize={level === 0 ? 11 : 9} fontWeight="600" fill={color}>
        {node.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
      </text>
      <text x={x} y={y + r + 12} textAnchor="middle" fontSize="8" fill="#475569" fontWeight="500">
        {node.name.split(" ")[0]}
      </text>
      {node.sales > 0 && (
        <text x={x} y={y + r + 21} textAnchor="middle" fontSize="7" fill="#10b981">
          {node.sales} vente{node.sales > 1 ? "s" : ""}
        </text>
      )}
      {node.children.map((child, i) => {
        const cx = startX + i * (level === 1 ? 120 : 90);
        return <Node key={child.id} node={child} x={cx} y={childY} level={level + 1} />;
      })}
    </g>
  );
}

export default function ReferralTree({ data }: { data: TreeNode }) {
  const n1 = data.children.length;
  const n2 = Math.max(1, data.children.reduce((s, c) => s + Math.max(1, c.children.length), 0));
  const width = Math.max(400, n2 * 90 + 80);
  const height = n1 === 0 ? 140 : n2 === 0 ? 240 : 340;

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">Arbre de parrainage</h2>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto">
        <Node node={data} x={width / 2} y={40} level={0} />
      </svg>
      <div className="mt-3 flex flex-wrap gap-3 justify-center">
        {Object.entries(STATUS_COLOR).map(([s, c]) => (
          <span key={s} className="flex items-center gap-1 text-xs text-slate-500">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: c }} />
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
